import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { z } from "zod";
import bcryptjs from "bcryptjs";
import { Room, Lease, Invoice, Report } from "@prisma/client";
import { createClient as createSupabaseServer } from "@/lib/supabase/server";
import logger from "@/lib/logger";

const log = logger.child({ module: "tenant-service" });

// ============================================
// Types
// ============================================

export interface TenantForAdmin {
    id: string; // User.id
    email: string | null;
    phoneNumber: string | null;
    role: string;
    createdAt: Date;
    tenantProfile: {
        id: string;
        fullName: string;
        ktpNumber: string | null;
        ktpPhotoUrl: string | null;
        address: string | null;
        emergencyContactName: string | null;
        emergencyContactNumber: string | null;
    } | null;
    leases: (Lease & {
        room: Room;
        invoices: Invoice[];
    })[];
    _count: { leases: number };
}

// ============================================
// Zod Schemas
// ============================================

const idSchema = z.string().min(1, "User ID is required");

export const tenantFormSchema = z.object({
    fullName: z.string().min(1, "Nama lengkap wajib diisi"),
    phoneNumber: z.string().min(1, "Nomor HP wajib diisi"),
    email: z.string().email("Email tidak valid").optional().or(z.literal("")),
    ktpNumber: z.string().optional().default(""),
    ktpPhotoUrl: z.string().optional().default(""),
    address: z.string().optional().default(""),
    emergencyContactName: z.string().optional().default(""),
    emergencyContactNumber: z.string().optional().default(""),
});

export type TenantFormValues = z.infer<typeof tenantFormSchema>;

export const checkInFormSchema = tenantFormSchema.extend({
    roomId: z.string().min(1, "Kamar wajib dipilih"),
    startDate: z.string().min(1, "Tanggal check-in wajib diisi"),
    endDate: z.string().optional().or(z.literal("")),
    deposit: z.coerce.number().min(0).optional().default(0),
    rentAmount: z.coerce.number().min(0, "Harga sewa wajib diisi"),
    utilityAmount: z.coerce.number().min(0).optional().default(0),
    otherAmount: z.coerce.number().min(0).optional().default(0),
});

export type CheckInFormValues = z.infer<typeof checkInFormSchema>;

export const resetPasswordSchema = z.object({
    userId: z.string().min(1),
    newPassword: z.string().min(6, "Password minimal 6 karakter"),
});

// ============================================
// READ - All Tenants
// ============================================

export const getAllTenants = cache(async (): Promise<TenantForAdmin[]> => {
    const parsedId = "all"; // Static identifier for global list cache
    return unstable_cache(
        async () => {
            const users = await prisma.user.findMany({
                where: { role: "TENANT" },
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    email: true,
                    phoneNumber: true,
                    role: true,
                    createdAt: true,
                    tenantProfile: true,
                    leases: {
                        include: {
                            room: true,
                            invoices: {
                                orderBy: { dueDate: "asc" }
                            }
                        }
                    },
                    _count: { select: { leases: true } },
                },
            });
            return users as unknown as TenantForAdmin[];
        },
        ["admin-tenants"],
        { tags: [CACHE_TAGS.ADMIN_TENANTS], revalidate: 120 }
    )();
});

// ============================================
// READ - Single Tenant
// ============================================

export const getTenantById = cache(async (id: string): Promise<TenantForAdmin | null> => {
    const parsedId = idSchema.parse(id);

    return unstable_cache(
        async () => {
            const user = await prisma.user.findUnique({
                where: { id: parsedId, role: "TENANT" },
                select: {
                    id: true,
                    email: true,
                    phoneNumber: true,
                    role: true,
                    createdAt: true,
                    tenantProfile: true,
                    leases: {
                        include: {
                            room: true,
                            invoices: {
                                orderBy: { dueDate: "asc" }
                            }
                        }
                    },
                    _count: { select: { leases: true } },
                },
            });
            return user as unknown as TenantForAdmin | null;
        },
        [`admin-tenant-${parsedId}`],
        { tags: [CACHE_TAGS.adminTenantDetail(parsedId), CACHE_TAGS.ADMIN_TENANTS] }
    )();
});

// ============================================
// READ - Single Tenant Detail (untuk halaman detail)
// ============================================

/** Tipe lengkap untuk halaman detail tenant — include reports */
export interface TenantDetailForAdmin {
    id: string;
    email: string | null;
    phoneNumber: string | null;
    role: string;
    createdAt: Date;
    tenantProfile: {
        id: string;
        fullName: string;
        ktpNumber: string | null;
        ktpPhotoUrl: string | null;
        address: string | null;
        emergencyContactName: string | null;
        emergencyContactNumber: string | null;
    } | null;
    leases: (Lease & {
        room: Room;
        invoices: Invoice[];
        reports: Report[];
    })[];
    _count: { leases: number };
}

export const getTenantDetailById = cache(async (id: string): Promise<TenantDetailForAdmin | null> => {
    const parsedId = idSchema.parse(id);

    return unstable_cache(
        async () => {
            const user = await prisma.user.findUnique({
                where: { id: parsedId, role: "TENANT" },
                select: {
                    id: true,
                    email: true,
                    phoneNumber: true,
                    role: true,
                    createdAt: true,
                    tenantProfile: true,
                    leases: {
                        orderBy: { startDate: "desc" },
                        include: {
                            room: true,
                            invoices: {
                                orderBy: { dueDate: "desc" }
                            },
                            reports: {
                                orderBy: { createdAt: "desc" }
                            }
                        }
                    },
                    _count: { select: { leases: true } },
                },
            });
            return user as unknown as TenantDetailForAdmin | null;
        },
        [`admin-tenant-detail-${parsedId}`],
        { tags: [CACHE_TAGS.adminTenantDetail(parsedId), CACHE_TAGS.ADMIN_TENANTS] }
    )();
});

// ============================================
// Signed URL untuk foto KTP (Private Bucket)
// ============================================

/**
 * Generate Supabase signed URL untuk foto KTP dari private bucket.
 * URL berlaku selama 5 menit (300 detik).
 */
export async function getSignedKtpUrl(ktpPhotoUrl: string): Promise<string | null> {
    if (!ktpPhotoUrl) return null;

    try {
        // Ekstrak storage path dari URL
        // ktpPhotoUrl bisa berupa full URL atau storage path
        let storagePath = ktpPhotoUrl;

        // Jika full URL, ekstrak path dari bucket
        const bucketName = "Oskost-Data-Private";
        if (ktpPhotoUrl.includes("/storage/v1/object/public/")) {
            const parts = ktpPhotoUrl.split(`/storage/v1/object/public/${bucketName}/`);
            if (parts[1]) storagePath = parts[1];
        }

        const supabase = await createSupabaseServer();
        const { data, error } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(storagePath, 60); // 60 detik (UU PDP Security Best Practice)

        if (error || !data?.signedUrl) {
            log.error({ err: error }, "Gagal generate signed URL KTP");
            return null;
        }

        log.info({ storagePath }, "[AUDIT_LOG_UU_PDP] Akses dokumen KTP privat (signed URL 60s) berhasil dibuat untuk Admin");
        return data.signedUrl;
    } catch (error) {
        log.error({ err: error }, "Error saat generate signed URL KTP");
        return null;
    }
}

// ============================================
// CREATE — User + TenantProfile + Lease + Invoice in transaction
// ============================================

export async function createTenant(data: {
    fullName: string;
    phoneNumber: string;
    email?: string;
    ktpNumber?: string;
    ktpPhotoUrl?: string;
    address?: string;
    emergencyContactName?: string;
    emergencyContactNumber?: string;
    // Check-in info
    roomId: string;
    startDate: Date;
    endDate?: Date;
    deposit?: number;
    rentAmount: number;
    utilityAmount?: number;
    otherAmount?: number;
}) {
    const cleanPhone = data.phoneNumber.replace(/\D/g, "");
    const tempPassword = "oskost" + (cleanPhone.length >= 4 ? cleanPhone.slice(-4) : "123");
    const hashedPassword = await bcryptjs.hash(tempPassword, 12);

    return prisma.$transaction(async (tx) => {
        // 1. Check if user already exists (by phoneNumber or email)
        const OR_conditions = [];
        if (data.phoneNumber) OR_conditions.push({ phoneNumber: data.phoneNumber });
        if (data.email) OR_conditions.push({ email: data.email });

        let existingUser = null;
        if (OR_conditions.length > 0) {
            existingUser = await tx.user.findFirst({
                where: { OR: OR_conditions },
                include: { tenantProfile: true },
            });
        }

        let user;

        if (existingUser) {
            // Check if existing user has an active lease
            const activeLease = await tx.lease.findFirst({
                where: { userId: existingUser.id, isActive: true },
            });

            if (activeLease) {
                throw new Error("Penyewa ini masih berstatus aktif di kamar lain. Silakan selesaikan sewa sebelumnya terlebih dahulu.");
            }

            // Update user & tenant profile for returning tenant
            user = await tx.user.update({
                where: { id: existingUser.id },
                data: {
                    phoneNumber: data.phoneNumber,
                    ...(data.email !== undefined && { email: data.email || null }),
                    tenantProfile: {
                        upsert: {
                            create: {
                                fullName: data.fullName,
                                ktpNumber: data.ktpNumber || null,
                                ktpPhotoUrl: data.ktpPhotoUrl || null,
                                address: data.address || null,
                                emergencyContactName: data.emergencyContactName || null,
                                emergencyContactNumber: data.emergencyContactNumber || null,
                            },
                            update: {
                                fullName: data.fullName,
                                ...(data.ktpNumber !== undefined && { ktpNumber: data.ktpNumber || null }),
                                ...(data.ktpPhotoUrl !== undefined && { ktpPhotoUrl: data.ktpPhotoUrl || null }),
                                ...(data.address !== undefined && { address: data.address || null }),
                                ...(data.emergencyContactName !== undefined && {
                                    emergencyContactName: data.emergencyContactName || null,
                                }),
                                ...(data.emergencyContactNumber !== undefined && {
                                    emergencyContactNumber: data.emergencyContactNumber || null,
                                }),
                            },
                        },
                    },
                },
                include: { tenantProfile: true },
            });
        } else {
            // Create brand new User & Profile
            user = await tx.user.create({
                data: {
                    phoneNumber: data.phoneNumber,
                    email: data.email || null,
                    passwordHash: hashedPassword,
                    role: "TENANT",
                    tenantProfile: {
                        create: {
                            fullName: data.fullName,
                            ktpNumber: data.ktpNumber || null,
                            ktpPhotoUrl: data.ktpPhotoUrl || null,
                            address: data.address || null,
                            emergencyContactName: data.emergencyContactName || null,
                            emergencyContactNumber: data.emergencyContactNumber || null,
                        },
                    },
                },
                include: { tenantProfile: true },
            });
        }

        // 2. Fetch Room to get propertyId and update Room status
        const targetRoom = await tx.room.update({
            where: { id: data.roomId },
            data: { status: "OCCUPIED" },
            select: { id: true, propertyId: true },
        });

        // 3. Create Lease with propertyId
        const lease = await tx.lease.create({
            data: {
                userId: user.id,
                roomId: data.roomId,
                propertyId: targetRoom.propertyId,
                startDate: data.startDate,
                endDate: data.endDate || null,
                isActive: true,
            },
        });

        // 4. Generate Monthly Invoices — loop per bulan dari startDate sampai endDate
        // ponytail: generate all upfront jika endDate bounded (max 36 bulan), else 1 invoice + cron handle bulan berikutnya
        const rentAmt = data.rentAmount;
        const utilAmt = data.utilityAmount || 0;
        const otherAmt = data.otherAmount || 0;
        const totalAmount = rentAmt + utilAmt + otherAmt;

        const addMonths = (d: Date, m: number) => {
            const nd = new Date(d);
            nd.setMonth(nd.getMonth() + m);
            return nd;
        };
        const toPeriod = (d: Date) =>
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

        const start = new Date(data.startDate);
        const end = data.endDate ? new Date(data.endDate) : null;
        const invoicesToCreate: {
            leaseId: string;
            propertyId: string;
            dueDate: Date;
            amount: number;
            rentAmount: number;
            utilityAmount: number;
            otherAmount: number;
            status: "UNPAID";
            externalId: string;
        }[] = [];

        if (end) {
            let idx = 0;
            let cur = new Date(start);
            while (cur <= end) {
                const period = toPeriod(cur);
                invoicesToCreate.push({
                    leaseId: lease.id,
                    propertyId: targetRoom.propertyId,
                    dueDate: new Date(cur),
                    amount: totalAmount,
                    rentAmount: rentAmt,
                    utilityAmount: utilAmt,
                    otherAmount: otherAmt,
                    status: "UNPAID",
                    externalId: `INV-${lease.id}-${period}`,
                });
                idx++;
                cur = addMonths(start, idx);
                if (idx > 36) break; // safety cap 3 tahun
            }
        } else {
            const period = toPeriod(start);
            invoicesToCreate.push({
                leaseId: lease.id,
                propertyId: targetRoom.propertyId,
                dueDate: new Date(start),
                amount: totalAmount,
                rentAmount: rentAmt,
                utilityAmount: utilAmt,
                otherAmount: otherAmt,
                status: "UNPAID",
                externalId: `INV-${lease.id}-${period}`,
            });
        }

        for (const inv of invoicesToCreate) {
            await tx.invoice.create({ data: inv });
        }

        return user;
    });
}

// ============================================
// UPDATE
// ============================================

export async function updateTenant(
    id: string,
    data: {
        fullName?: string;
        phoneNumber?: string;
        email?: string;
        ktpNumber?: string;
        ktpPhotoUrl?: string;
        address?: string;
        emergencyContactName?: string;
        emergencyContactNumber?: string;
        roomId?: string; // Optional Room reassignment
    }
) {
    const parsedId = idSchema.parse(id);

    return prisma.$transaction(async (tx) => {
        // Update User fields
        await tx.user.update({
            where: { id: parsedId },
            data: {
                ...(data.phoneNumber !== undefined && { phoneNumber: data.phoneNumber }),
                ...(data.email !== undefined && { email: data.email || null }),
            },
        });

        // Update TenantProfile fields
        await tx.tenantProfile.update({
            where: { userId: parsedId },
            data: {
                ...(data.fullName !== undefined && { fullName: data.fullName }),
                ...(data.ktpNumber !== undefined && { ktpNumber: data.ktpNumber || null }),
                ...(data.ktpPhotoUrl !== undefined && { ktpPhotoUrl: data.ktpPhotoUrl || null }),
                ...(data.address !== undefined && { address: data.address || null }),
                ...(data.emergencyContactName !== undefined && {
                    emergencyContactName: data.emergencyContactName || null,
                }),
                ...(data.emergencyContactNumber !== undefined && {
                    emergencyContactNumber: data.emergencyContactNumber || null,
                }),
            },
        });

        // Handle Room Reassignment (Pindah Kamar)
        if (data.roomId !== undefined && data.roomId !== "") {
            // Find active lease
            const activeLease = await tx.lease.findFirst({
                where: { userId: parsedId, isActive: true },
            });

            if (activeLease && activeLease.roomId !== data.roomId) {
                const oldRoomId = activeLease.roomId;

                // Ambil harga kamar baru
                const newRoom = await tx.room.findUnique({
                    where: { id: data.roomId },
                    select: { id: true, price: true },
                });

                // Update lease dengan roomId baru
                await tx.lease.update({
                    where: { id: activeLease.id },
                    data: { roomId: data.roomId },
                });

                // Update status kamar lama menjadi AVAILABLE (jika tidak ada lease lain)
                const otherLeaseOnOldRoom = await tx.lease.findFirst({
                    where: { roomId: oldRoomId, isActive: true, NOT: { userId: parsedId } },
                });
                if (!otherLeaseOnOldRoom) {
                    await tx.room.update({
                        where: { id: oldRoomId },
                        data: { status: "AVAILABLE" },
                    });
                }

                // Update status kamar baru menjadi OCCUPIED
                await tx.room.update({
                    where: { id: data.roomId },
                    data: { status: "OCCUPIED" },
                });
            }
        }
    });
}

// ============================================
// CHECKOUT (SOFT DELETE)
// ============================================

export async function checkoutTenant(id: string, exitReason?: string) {
    const parsedId = idSchema.parse(id);

    return prisma.$transaction(async (tx) => {
        // Find active lease
        const activeLease = await tx.lease.findFirst({
            where: { userId: parsedId, isActive: true },
        });

        if (activeLease) {
            // Deactivate active lease
            await tx.lease.update({
                where: { id: activeLease.id },
                data: {
                    isActive: false,
                    exitReason: exitReason || "Checked out",
                },
            });

            // Revert room status back to AVAILABLE
            await tx.room.update({
                where: { id: activeLease.roomId },
                data: { status: "AVAILABLE" },
            });
        }
    });
}

// ============================================
// DELETE (Soft check-out wrapper to satisfy business requirement)
// ============================================

export async function deleteTenant(id: string) {
    // Simply check out the tenant to preserve historical invoices/data
    return checkoutTenant(id, "Checked out via Admin Delete Flow");
}

// ============================================
// RESET PASSWORD
// ============================================

export async function resetTenantPassword(userId: string, newPassword: string) {
    const parsedId = idSchema.parse(userId);
    const hashedPassword = await bcryptjs.hash(newPassword, 12);

    return prisma.user.update({
        where: { id: parsedId },
        data: { passwordHash: hashedPassword },
    });
}

// ============================================
// INVOICE ACTIONS
// ============================================

import { sendNotification } from "@/features/notifications/notification-service";

export async function markInvoicePaid(invoiceId: string) {
    const updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
            status: "PAID",
            paidAt: new Date(),
            adminNote: null, // Clear note if paid
        },
        include: {
            lease: {
                select: { userId: true }
            }
        }
    });

    if (updatedInvoice?.lease?.userId) {
        await sendNotification({
            userId: updatedInvoice.lease.userId,
            title: "Pembayaran Dikonfirmasi",
            message: `Tagihan Anda sebesar Rp ${updatedInvoice.amount.toLocaleString("id-ID")} telah dikonfirmasi Lunas oleh Admin.`,
            type: "BILLING",
            url: "/dashboard/billing",
        }).catch(err => log.error({ err }, "Gagal kirim notifikasi konfirmasi bayar"));
    }

    return updatedInvoice;
}

export async function rejectInvoicePayment(invoiceId: string, reason: string) {
    const updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
            status: "UNPAID",
            proofUrl: null, // Remove rejected proof
            adminNote: reason,
        },
        include: {
            lease: {
                select: { userId: true }
            }
        }
    });

    if (updatedInvoice?.lease?.userId) {
        await sendNotification({
            userId: updatedInvoice.lease.userId,
            title: "Pembayaran Perlu Perbaikan",
            message: `Bukti pembayaran Anda ditolak dengan alasan: ${reason}. Silakan unggah ulang.`,
            type: "BILLING",
            url: "/dashboard/billing",
        }).catch(err => log.error({ err }, "Gagal kirim notifikasi tolak bayar"));
    }

    return updatedInvoice;
}

// ============================================
// BILLING REMINDER (Kirim Tagihan / Notifikasi)
// ============================================

export async function sendBillingReminder(userId: string) {
    // Cari data tenant dan invoice yang belum lunas
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            tenantProfile: {
                select: { fullName: true }
            },
            leases: {
                where: { isActive: true },
                select: {
                    invoices: {
                        where: {
                            status: { in: ["UNPAID", "OVERDUE"] }
                        },
                        select: {
                            amount: true,
                            dueDate: true,
                        },
                        orderBy: { dueDate: "asc" },
                    },
                },
            },
        },
    });

    if (!user) {
        throw new Error("Penghuni tidak ditemukan.");
    }

    const unpaidInvoices = user.leases.flatMap((l) => l.invoices);

    if (unpaidInvoices.length === 0) {
        throw new Error("Tidak ada tagihan yang belum dibayar untuk penghuni ini.");
    }

    const totalAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const formattedAmount = new Intl.NumberFormat("id-ID").format(totalAmount);

    // Format periode tagihan
    const periodLabel = new Intl.DateTimeFormat("id-ID", {
        month: "long",
        year: "numeric",
    }).format(new Date(unpaidInvoices[0].dueDate));

    await sendNotification({
        userId: user.id,
        title: "Pengingat Tagihan Kost",
        message: `Hai ${user.tenantProfile?.fullName ?? "Penghuni"}, tagihan kost Anda sebesar Rp ${formattedAmount} untuk periode ${periodLabel} belum dibayar. Segera lakukan pembayaran ya!`,
        type: "BILLING",
        url: "/dashboard/billing",
    });

    return {
        tenantName: user.tenantProfile?.fullName ?? "Penghuni",
        totalAmount,
        invoiceCount: unpaidInvoices.length,
    };
}

