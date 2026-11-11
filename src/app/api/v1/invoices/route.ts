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
                    property: true,
                    lease: {
                        include: {
                            property: true,
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

        let accumulation = null;
        if (authUser.role === "TENANT") {
            const unpaidInvoices = await prisma.invoice.findMany({
                where: {
                    lease: { userId: authUser.id },
                    status: { in: [PaymentStatus.UNPAID, PaymentStatus.OVERDUE] },
                },
                orderBy: { dueDate: "asc" },
            });

            if (unpaidInvoices.length > 0) {
                const totalRentAmount = unpaidInvoices.reduce((acc, curr) => acc + (curr.rentAmount || 0), 0);
                const totalUtilityAmount = unpaidInvoices.reduce((acc, curr) => acc + (curr.utilityAmount || 0), 0);
                const totalOtherAmount = unpaidInvoices.reduce((acc, curr) => acc + (curr.otherAmount || 0), 0);
                const totalAdminFee = unpaidInvoices.reduce((acc, curr) => acc + (curr.tenantAdminFee || 0), 0);
                const totalDiscountAmount = unpaidInvoices.reduce((acc, curr) => acc + (curr.discountAmount || 0), 0);
                const totalUnpaidAmount = unpaidInvoices.reduce(
                    (acc, curr) => acc + (curr.amount > 0 ? curr.amount : (curr.rentAmount + curr.utilityAmount + curr.otherAmount)),
                    0
                );

                const periods = unpaidInvoices.map((inv) =>
                    new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(inv.dueDate))
                );

                accumulation = {
                    unpaidCount: unpaidInvoices.length,
                    totalUnpaidAmount,
                    totalRentAmount,
                    totalUtilityAmount,
                    totalOtherAmount,
                    totalAdminFee,
                    totalDiscountAmount,
                    periods,
                    periodsSummary: periods.length > 1 ? `${periods[0]} - ${periods[periods.length - 1]}` : periods[0],
                    unpaidInvoiceIds: unpaidInvoices.map((inv) => inv.id),
                    oldestDueDate: unpaidInvoices[0]?.dueDate,
                };
            } else {
                accumulation = {
                    unpaidCount: 0,
                    totalUnpaidAmount: 0,
                    totalRentAmount: 0,
                    totalUtilityAmount: 0,
                    totalOtherAmount: 0,
                    totalAdminFee: 0,
                    totalDiscountAmount: 0,
                    periods: [],
                    periodsSummary: "",
                    unpaidInvoiceIds: [],
                    oldestDueDate: null,
                };
            }
        }

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
                proofUrl: inv.proofUrl,
                adminNote: inv.adminNote,
                paymentGateway: {
                    isMidtransActive: (inv.property || inv.lease?.property)?.isMidtransActive ?? false,
                    midtransClientKey: (inv.property || inv.lease?.property)?.midtransClientKey ?? null,
                    bankName: (inv.property || inv.lease?.property)?.bankName ?? null,
                    bankAccountNumber: (inv.property || inv.lease?.property)?.bankAccountNumber ?? null,
                    bankAccountHolder: (inv.property || inv.lease?.property)?.bankAccountHolder ?? null,
                    bankAccountInfo: (inv.property || inv.lease?.property)?.bankAccountInfo ?? null,
                    qrisImageUrl: (inv.property || inv.lease?.property)?.qrisImageUrl ?? null,
                },
                room: inv.lease.room,
                createdAt: inv.createdAt,
            })),
            {
                total,
                limit,
                offset,
                accumulation,
            }
        );
    } catch (error) {
        console.error("[API_INVOICES_GET_ERROR]", error);
        return apiError("INTERNAL_ERROR", "Gagal memuat daftar tagihan", 500);
    }
}
