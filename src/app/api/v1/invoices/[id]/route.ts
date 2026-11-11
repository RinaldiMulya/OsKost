import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/api-auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const authUser = await getAuthenticatedUser(req);
        if (!authUser) {
            return apiError("UNAUTHORIZED", "Sesi login tidak valid", 401);
        }

        const { id: invoiceId } = await params;

        let currentInvoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                property: {
                    include: { subscription: true }
                },
                lease: {
                    include: {
                        room: true,
                        property: {
                            include: { subscription: true }
                        },
                        user: {
                            select: {
                                id: true,
                                email: true,
                                phoneNumber: true,
                                tenantProfile: true,
                            },
                        },
                    },
                },
            },
        });

        if (!currentInvoice) {
            return apiError("NOT_FOUND", "Tagihan tidak ditemukan", 404);
        }

        // On-demand reconciliation jika invoice masih PENDING dan menggunakan Midtrans
        if (currentInvoice.status === "PENDING" && currentInvoice.provider === "MIDTRANS") {
            try {
                const { reconcilePendingInvoices } = await import("@/features/payment/payment-service");
                await reconcilePendingInvoices({ invoiceId: currentInvoice.id });
                const refreshed = await prisma.invoice.findUnique({
                    where: { id: invoiceId },
                    include: {
                        property: {
                            include: { subscription: true }
                        },
                        lease: {
                            include: {
                                room: true,
                                property: {
                                    include: { subscription: true }
                                },
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                        phoneNumber: true,
                                        tenantProfile: true,
                                    },
                                },
                            },
                        },
                    },
                });
                if (refreshed) {
                    currentInvoice = refreshed;
                }
            } catch (reconErr) {
                console.error("[INVOICE_ID_RECON_ERROR]", reconErr);
            }
        }

        const invoice = currentInvoice;

        // Cek izin akses: tenant yang bersangkutan atau owner/pengelola properti
        if (authUser.role === "TENANT" && invoice.lease.userId !== authUser.id) {
            return apiError("FORBIDDEN", "Anda tidak memiliki akses ke tagihan ini", 403);
        }

        if (
            authUser.role !== "TENANT" &&
            authUser.propertyId &&
            invoice.propertyId &&
            authUser.propertyId !== invoice.propertyId
        ) {
            return apiError("FORBIDDEN", "Anda tidak memiliki akses ke tagihan properti ini", 403);
        }

        const prop = invoice.property || invoice.lease.property;
        const planTier = prop?.subscription?.planTier ?? "STARTER";
        const isFreeTier = planTier === "FREE";
        const isStarterTier = planTier === "STARTER";
        const canUseMidtrans = !isFreeTier && !isStarterTier;
        const canUseStaticQris = !isFreeTier;

        return apiSuccess({
            id: invoice.id,
            externalId: invoice.externalId,
            dueDate: invoice.dueDate,
            amount: invoice.amount,
            rentAmount: invoice.rentAmount,
            utilityAmount: invoice.utilityAmount,
            otherAmount: invoice.otherAmount,
            totalAdminFee: invoice.totalAdminFee,
            tenantAdminFee: invoice.tenantAdminFee,
            ownerAdminFee: invoice.ownerAdminFee,
            discountAmount: invoice.discountAmount,
            discountReason: invoice.discountReason,
            status: invoice.status,
            provider: invoice.provider,
            providerRef: invoice.providerRef,
            paymentUrl: invoice.paymentUrl,
            snapToken: invoice.snapToken,
            vaNumber: invoice.vaNumber,
            paymentMethod: invoice.paymentMethod,
            qrString: invoice.qrString,
            receiptPdfUrl: invoice.receiptPdfUrl,
            paidAt: invoice.paidAt,
            expiredAt: invoice.expiredAt,
            proofUrl: invoice.proofUrl,
            adminNote: invoice.adminNote,
            verifiedBy: invoice.verifiedBy,
            verifiedAt: invoice.verifiedAt,
            createdAt: invoice.createdAt,
            paymentGateway: {
                isMidtransActive: canUseMidtrans ? (prop?.isMidtransActive ?? false) : false,
                midtransClientKey: canUseMidtrans ? (prop?.midtransClientKey ?? null) : null,
                bankName: prop?.bankName ?? null,
                bankAccountNumber: prop?.bankAccountNumber ?? null,
                bankAccountHolder: prop?.bankAccountHolder ?? null,
                bankAccountInfo: prop?.bankAccountInfo ?? null,
                qrisImageUrl: canUseStaticQris ? (prop?.qrisImageUrl ?? null) : null,
            },
            room: {
                id: invoice.lease.room.id,
                number: invoice.lease.room.number,
                name: invoice.lease.room.name,
                type: invoice.lease.room.type,
                price: invoice.lease.room.price,
            },
            property: prop
                ? {
                      id: prop.id,
                      name: prop.name,
                      slug: prop.slug,
                      address: prop.address,
                      managerPhone: prop.managerPhone,
                      guardPhone: prop.guardPhone,
                  }
                : null,
            tenant: {
                id: invoice.lease.user.id,
                email: invoice.lease.user.email,
                phoneNumber: invoice.lease.user.phoneNumber,
                name: invoice.lease.user.tenantProfile?.fullName || "Penghuni Kost",
            },
        });
    } catch (error) {
        console.error("[API_INVOICE_DETAIL_ERROR]", error);
        return apiError("INTERNAL_ERROR", "Gagal memuat rincian tagihan", 500);
    }
}
