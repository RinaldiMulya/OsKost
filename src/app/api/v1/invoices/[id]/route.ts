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

        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                lease: {
                    include: {
                        room: true,
                        property: true,
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

        if (!invoice) {
            return apiError("NOT_FOUND", "Tagihan tidak ditemukan", 404);
        }

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
            createdAt: invoice.createdAt,
            room: {
                id: invoice.lease.room.id,
                number: invoice.lease.room.number,
                name: invoice.lease.room.name,
                type: invoice.lease.room.type,
                price: invoice.lease.room.price,
            },
            property: invoice.lease.property
                ? {
                      id: invoice.lease.property.id,
                      name: invoice.lease.property.name,
                      slug: invoice.lease.property.slug,
                      address: invoice.lease.property.address,
                      managerPhone: invoice.lease.property.managerPhone,
                      guardPhone: invoice.lease.property.guardPhone,
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
