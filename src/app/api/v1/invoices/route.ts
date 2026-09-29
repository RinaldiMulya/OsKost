import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { PaymentStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(req);
        if (!authUser) {
            return apiError("UNAUTHORIZED", "Sesi login tidak valid", 401);
        }

        const { searchParams } = new URL(req.url);
        const statusParam = searchParams.get("status")?.toUpperCase();
        const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
        const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

        // Build where clause based on user role
        const whereClause: Record<string, unknown> = {};

        if (authUser.role === "TENANT") {
            whereClause.lease = {
                userId: authUser.id,
            };
        } else if (authUser.propertyId) {
            whereClause.propertyId = authUser.propertyId;
        }

        if (statusParam && Object.values(PaymentStatus).includes(statusParam as PaymentStatus)) {
            whereClause.status = statusParam as PaymentStatus;
        }

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where: whereClause,
                include: {
                    lease: {
                        include: {
                            room: {
                                select: {
                                    id: true,
                                    number: true,
                                    name: true,
                                    type: true,
                                    price: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { dueDate: "desc" },
                skip: offset,
                take: limit,
            }),
            prisma.invoice.count({ where: whereClause }),
        ]);

        return apiSuccess(
            invoices.map((inv) => ({
                id: inv.id,
                externalId: inv.externalId,
                dueDate: inv.dueDate,
                amount: inv.amount,
                rentAmount: inv.rentAmount,
                utilityAmount: inv.utilityAmount,
                otherAmount: inv.otherAmount,
                totalAdminFee: inv.totalAdminFee,
                tenantAdminFee: inv.tenantAdminFee,
                discountAmount: inv.discountAmount,
                discountReason: inv.discountReason,
                status: inv.status,
                provider: inv.provider,
                paymentMethod: inv.paymentMethod,
                vaNumber: inv.vaNumber,
                snapToken: inv.snapToken,
                paymentUrl: inv.paymentUrl,
                receiptPdfUrl: inv.receiptPdfUrl,
                paidAt: inv.paidAt,
                room: inv.lease.room,
                createdAt: inv.createdAt,
            })),
            {
                total,
                limit,
                offset,
            }
        );
    } catch (error) {
        console.error("[API_INVOICES_GET_ERROR]", error);
        return apiError("INTERNAL_ERROR", "Gagal memuat daftar tagihan", 500);
    }
}
