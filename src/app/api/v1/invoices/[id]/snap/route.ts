import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { createMidtransTransaction, createAccumulatedMidtransTransaction } from "@/features/payment/payment-service";

interface RouteParams {
    params: Promise<{ id: string }>;
}

const snapSchema = z.object({
    paymentMethodCode: z.string().default("QRIS"),
    payAllUnpaid: z.boolean().default(false),
});

export async function POST(req: NextRequest, { params }: RouteParams) {
    try {
        const authUser = await getAuthenticatedUser(req);
        if (!authUser) {
            return apiError("UNAUTHORIZED", "Sesi login tidak valid", 401);
        }

        const { id: invoiceId } = await params;
        const body = await req.json().catch(() => ({}));
        const parsed = snapSchema.safeParse(body);

        if (!parsed.success) {
            return apiError("VALIDATION_ERROR", "Data pembayaran tidak valid", 400);
        }

        // Jika diminta bayar seluruh akumulasi tunggakan atau ID adalah 'accumulated'
        if (invoiceId === "accumulated" || parsed.data.payAllUnpaid) {
            const transaction = await createAccumulatedMidtransTransaction(
                authUser.id,
                parsed.data.paymentMethodCode
            );
            return apiSuccess({
                snapToken: transaction.snapToken,
                paymentUrl: transaction.paymentUrl,
                orderId: transaction.orderId,
                isAccumulated: true,
                invoicesCount: transaction.invoicesCount,
                grossAmount: transaction.grossAmount,
            });
        }

        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { lease: true },
        });

        if (!invoice) {
            return apiError("NOT_FOUND", "Tagihan tidak ditemukan", 404);
        }

        if (authUser.role === "TENANT" && invoice.lease.userId !== authUser.id) {
            return apiError("FORBIDDEN", "Anda tidak memiliki akses untuk membayar tagihan ini", 403);
        }

        if (invoice.status === "PAID") {
            return apiError("ALREADY_PAID", "Tagihan ini sudah lunas", 400);
        }

        const transaction = await createMidtransTransaction(
            invoiceId,
            parsed.data.paymentMethodCode
        );

        return apiSuccess({
            snapToken: transaction.snapToken,
            paymentUrl: transaction.paymentUrl,
            invoiceId: transaction.invoiceId,
        });
    } catch (error) {
        console.error("[API_INVOICE_SNAP_ERROR]", error);
        const errorMessage = error instanceof Error ? error.message : "Gagal memproses pembayaran Midtrans";
        return apiError("MIDTRANS_ERROR", errorMessage, 500);
    }
}
