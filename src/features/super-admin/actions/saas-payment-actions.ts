"use server";

import { requireSuperAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { logAuditEvent } from "@/lib/audit-log";
import { revalidatePath } from "next/cache";
import { SaaSPlanTier, SubscriptionStatus } from "@prisma/client";
import logger from "@/lib/logger";

const log = logger.child({ module: "saas-payment-actions" });

export interface GeneratePaymentLinkInput {
    propertyId: string;
    planTier: SaaSPlanTier;
    periodMonths: number;
    amount: number;
    notes?: string;
}

export interface GeneratePaymentLinkResult {
    success: boolean;
    snapUrl?: string;
    snapToken?: string;
    orderId?: string;
    transactionId?: string;
    error?: string;
}

/**
 * Super Admin generates a Midtrans Snap payment link for an owner's SaaS subscription.
 * Uses the OsKost Platform Midtrans Server Key (strictly separated from tenant cashflow).
 */
export async function generateSaaSPaymentLinkAction(
    input: GeneratePaymentLinkInput
): Promise<GeneratePaymentLinkResult> {
    const session = await requireSuperAdmin();

    try {
        const property = await prisma.property.findUnique({
            where: { id: input.propertyId },
            include: {
                owner: true,
                subscription: true,
            },
        });

        if (!property) {
            return { success: false, error: "Properti tidak ditemukan." };
        }

        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        if (!serverKey) {
            return {
                success: false,
                error: "MIDTRANS_SERVER_KEY platform belum dikonfigurasi di environment server.",
            };
        }

        // Ensure property has a SaaSSubscription record
        let subscription = property.subscription;
        if (!subscription) {
            subscription = await prisma.saaSSubscription.create({
                data: {
                    propertyId: property.id,
                    planTier: input.planTier,
                    status: SubscriptionStatus.TRIAL,
                    monthlyPrice: input.amount,
                    maxRooms: 50,
                },
            });
        }

        const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
        const snapBaseUrl = isProduction
            ? "https://app.midtrans.com"
            : "https://app.sandbox.midtrans.com";

        // Unique Order ID for this SaaS transaction
        const orderId = `SAAS-${property.id.slice(-6).toUpperCase()}-${Date.now()}`;

        // 1. Create PENDING SaaSTransaction in DB
        const transaction = await prisma.saaSTransaction.create({
            data: {
                propertyId: property.id,
                subscriptionId: subscription.id,
                planTier: input.planTier,
                periodMonths: input.periodMonths,
                amount: Math.round(input.amount),
                status: "PENDING",
                midtransOrderId: orderId,
                notes: input.notes || `Dibuat oleh Super Admin: ${session.email}`,
            },
        });

        // 2. Call Midtrans Snap API using Platform Key
        const authHeader = `Basic ${Buffer.from(serverKey + ":").toString("base64")}`;
        const snapPayload = {
            transaction_details: {
                order_id: orderId,
                gross_amount: Math.round(input.amount),
            },
            item_details: [
                {
                    id: input.planTier,
                    name: `Langganan OsKost - Paket ${input.planTier} (${input.periodMonths} bln)`,
                    price: Math.round(input.amount),
                    quantity: 1,
                },
            ],
            customer_details: {
                first_name: property.owner?.email
                    ? property.owner.email.split("@")[0]
                    : "Pemilik Kost",
                email: property.owner?.email || "owner@oskost.id",
                phone: property.owner?.phoneNumber || undefined,
            },
        };

        const res = await fetch(`${snapBaseUrl}/snap/v1/transactions`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
            body: JSON.stringify(snapPayload),
        });

        if (!res.ok) {
            const errText = await res.text();
            log.error({ status: res.status, errText, orderId }, "Gagal generate Snap token Midtrans");
            return {
                success: false,
                error: `Gagal memanggil Midtrans Snap API (${res.status}): ${errText}`,
            };
        }

        const snapData = await res.json();
        const snapToken = snapData.token;
        const snapUrl = snapData.redirect_url;

        // 3. Save Snap Token back to transaction
        await prisma.saaSTransaction.update({
            where: { id: transaction.id },
            data: {
                midtransSnapToken: snapToken,
            },
        });

        // 4. Log audit event
        await logAuditEvent({
            actorId: session.id,
            actorEmail: session.email,
            actorRole: session.role,
            action: "SAAS_PAYMENT_LINK_GENERATED",
            category: "SUBSCRIPTION",
            targetType: "SaaSTransaction",
            targetId: transaction.id,
            metadata: {
                orderId,
                amount: input.amount,
                planTier: input.planTier,
                periodMonths: input.periodMonths,
                propertyId: property.id,
                ownerEmail: property.owner?.email,
            },
        });

        revalidatePath("/super-admin/transactions");
        revalidatePath("/super-admin/subscriptions");

        return {
            success: true,
            snapUrl,
            snapToken,
            orderId,
            transactionId: transaction.id,
        };
    } catch (err: any) {
        log.error({ err }, "Error in generateSaaSPaymentLinkAction");
        return {
            success: false,
            error: err?.message || "Terjadi kesalahan internal saat membuat link pembayaran.",
        };
    }
}

/**
 * Super Admin manually confirms / verifies a SaaS transaction (e.g. direct bank transfer).
 */
export async function manualVerifySaaSTransactionAction(
    transactionId: string,
    notes?: string
): Promise<{ success: boolean; error?: string }> {
    const session = await requireSuperAdmin();

    try {
        const tx = await prisma.saaSTransaction.findUnique({
            where: { id: transactionId },
            include: { subscription: true, property: true },
        });

        if (!tx) {
            return { success: false, error: "Transaksi tidak ditemukan." };
        }

        const now = new Date();
        const nextPeriodEnd = new Date(now);
        nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + tx.periodMonths);

        await prisma.$transaction(async (prismaTx) => {
            // Update transaction to PAID
            await prismaTx.saaSTransaction.update({
                where: { id: transactionId },
                data: {
                    status: "PAID",
                    paidAt: now,
                    paymentMethod: "MANUAL_VERIFIED",
                    notes: notes ? `${tx.notes ?? ""}\n[Manual Verif]: ${notes}` : tx.notes,
                },
            });

            // Update subscription to ACTIVE and extend period
            await prismaTx.saaSSubscription.update({
                where: { id: tx.subscriptionId },
                data: {
                    status: SubscriptionStatus.ACTIVE,
                    planTier: tx.planTier,
                    currentPeriodStart: now,
                    currentPeriodEnd: nextPeriodEnd,
                },
            });
        });

        await logAuditEvent({
            actorId: session.id,
            actorEmail: session.email,
            actorRole: session.role,
            action: "SAAS_PAYMENT_MANUAL_VERIFIED",
            category: "SUBSCRIPTION",
            targetType: "SaaSTransaction",
            targetId: transactionId,
            metadata: {
                propertyId: tx.propertyId,
                amount: tx.amount,
                planTier: tx.planTier,
                periodMonths: tx.periodMonths,
                verifiedBy: session.email,
            },
        });

        revalidatePath("/super-admin/transactions");
        revalidatePath("/super-admin/subscriptions");
        revalidatePath(`/super-admin/owners/${tx.property.ownerId}`);

        return { success: true };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message || "Gagal memverifikasi transaksi secara manual.",
        };
    }
}
