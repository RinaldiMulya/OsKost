import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { z } from "zod";
import bcryptjs from "bcryptjs";
import { Room, Lease, Invoice, Report } from "@prisma/client";
import { createClient as createSupabaseServer } from "@/lib/supabase/server";

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
    return unstable_cache(
        async () => {
            const users = await prisma.user.findMany({
                where: { role: "TENANT" },
                orderBy: { createdAt: "desc" },
                include: {
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
                include: {
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
                include: {
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
            .createSignedUrl(storagePath, 300); // 5 menit

        if (error || !data?.signedUrl) {
            console.error("Gagal generate signed URL KTP:", error);
            return null;
        }

        return data.signedUrl;
    } catch (error) {
        console.error("Error saat generate signed URL KTP:", error);
        return null;
    }
}

// ============================================
// CREATE — User + TenantProfile + Lease + Invoice in transaction
// ============================================

const DEFAULT_PASSWORD = "oskost123";

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
    const hashedPassword = await bcryptjs.hash(DEFAULT_PASSWORD, 10);

    return prisma.$transaction(async (tx) => {
        // 1. Create User & Profile
        const user = await tx.user.create({
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

        // 2. Create Lease
        const lease = await tx.lease.create({
            data: {
                userId: user.id,
                roomId: data.roomId,
                startDate: data.startDate,
                endDate: data.endDate || null,
                isActive: true,
            },
        });

        // 3. Update Room status to OCCUPIED
        await tx.room.update({
            where: { id: data.roomId },
            data: { status: "OCCUPIED" },
        });

        // 4. Generate Initial Invoice automatically
        const rentAmt = data.rentAmount;
        const utilAmt = data.utilityAmount || 0;
        const otherAmt = data.otherAmount || 0;
        const totalAmount = rentAmt + utilAmt + otherAmt;

        await tx.invoice.create({
            data: {
                leaseId: lease.id,
                dueDate: data.startDate,
                amount: totalAmount,
                rentAmount: rentAmt,
                utilityAmount: utilAmt,
                otherAmount: otherAmt,
                status: "UNPAID",
            },
        });

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

        // Handle Room Reassignment
        if (data.roomId !== undefined && data.roomId !== "") {
            // Find active lease
            const activeLease = await tx.lease.findFirst({
                where: { userId: parsedId, isActive: true },
            });

            if (activeLease && activeLease.roomId !== data.roomId) {
                const oldRoomId = activeLease.roomId;

                // Move lease to new room
                await tx.lease.update({
                    where: { id: activeLease.id },
                    data: { roomId: data.roomId },
                });

                // Update old room status back to AVAILABLE (if no other active lease occupies it)
                const otherLeaseOnOldRoom = await tx.lease.findFirst({
                    where: { roomId: oldRoomId, isActive: true, NOT: { userId: parsedId } },
                });
                if (!otherLeaseOnOldRoom) {
                    await tx.room.update({
                        where: { id: oldRoomId },
                        data: { status: "AVAILABLE" },
                    });
                }

                // Update new room status to OCCUPIED
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
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    return prisma.user.update({
        where: { id: parsedId },
        data: { passwordHash: hashedPassword },
    });
}

// ============================================
// INVOICE ACTIONS
// ============================================

export async function markInvoicePaid(invoiceId: string) {
    return prisma.invoice.update({
        where: { id: invoiceId },
        data: {
            status: "PAID",
            paidAt: new Date(),
            adminNote: null, // Clear note if paid
        },
    });
}

export async function rejectInvoicePayment(invoiceId: string, reason: string) {
    return prisma.invoice.update({
        where: { id: invoiceId },
        data: {
            status: "UNPAID",
            proofUrl: null, // Remove rejected proof
            adminNote: reason,
        },
    });
}

