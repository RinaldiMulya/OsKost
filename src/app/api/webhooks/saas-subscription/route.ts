import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { logAuditEvent } from "@/lib/audit-log";
import { SubscriptionStatus } from "@prisma/client";
import logger from "@/lib/logger";

const log = logger.child({ module: "webhook-saas-subscription" });

/**
 * Midtrans SaaS Subscription Webhook Handler — POST /api/webhooks/saas-subscription
 *
 * Dedicated endpoint for OsKost Platform SaaS payments (Owner -> OsKost HQ).
 * Uses strictly process.env.MIDTRANS_SERVER_KEY (Platform Key).
 */
export async function POST(req: NextRequest) {
    let rawBody: any;

    try {
        rawBody = await req.json();
    } catch {
        return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    const {
        order_id,
        status_code,
        gross_amount,
        signature_key,
        transaction_status,
        fraud_status,
        payment_type,
    } = rawBody;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
        log.warn({ rawBody }, "Missing required Midtrans webhook fields");
        return NextResponse.json({ message: "Missing required parameters" }, { status: 400 });
    }

    // 1. Verify SHA-512 signature using OsKost Platform Server Key
    const platformServerKey = process.env.MIDTRANS_SERVER_KEY;
    if (!platformServerKey) {
        log.error("MIDTRANS_SERVER_KEY is not configured in server environment");
        return NextResponse.json(
            { message: "Server configuration missing" },
            { status: 500 }
        );
    }

    const signatureString = `${order_id}${status_code}${gross_amount}${platformServerKey}`;
    const calculatedSignature = crypto
        .createHash("sha512")
        .update(signatureString)
        .digest("hex");

    const isSignatureValid = calculatedSignature === signature_key;

    // Log the incoming webhook attempt
    await prisma.webhookLog.create({
        data: {
            provider: "MIDTRANS",
            rawPayload: rawBody,
            signatureValid: isSignatureValid,
            httpStatusSent: isSignatureValid ? 200 : 403,
        },
    });

    if (!isSignatureValid) {
        log.warn(
            { order_id, calculatedSignature, signature_key },
            "Invalid Midtrans SHA-512 signature for SaaS payment"
        );
        return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }

    // 2. Find SaaSTransaction in DB
    const transaction = await prisma.saaSTransaction.findUnique({
        where: { midtransOrderId: order_id },
        include: {
            subscription: true,
            property: {
                include: { owner: true },
            },
        },
    });

    if (!transaction) {
        log.warn({ order_id }, "SaaSTransaction with order_id not found");
        return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    }

    // 3. Process Transaction Status
    const isSuccess =
        (transaction_status === "capture" && fraud_status === "accept") ||
        transaction_status === "settlement";

    const isPending = transaction_status === "pending";
    const isFailure =
        transaction_status === "deny" ||
        transaction_status === "cancel" ||
        transaction_status === "expire";

    const now = new Date();

    if (isSuccess) {
        const nextPeriodEnd = new Date(now);
        nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + transaction.periodMonths);

        await prisma.$transaction(async (tx) => {
            // Update SaaSTransaction to PAID
            await tx.saaSTransaction.update({
                where: { id: transaction.id },
                data: {
                    status: "PAID",
                    paidAt: now,
                    paymentMethod: payment_type || "MIDTRANS_SNAP",
                    notes: `${transaction.notes ?? ""}\n[Midtrans Webhook: PAID on ${now.toISOString()}]`,
                },
            });

            // Update SaaSSubscription to ACTIVE and extend validity period
            await tx.saaSSubscription.update({
                where: { id: transaction.subscriptionId },
                data: {
                    status: SubscriptionStatus.ACTIVE,
                    planTier: transaction.planTier,
                    currentPeriodStart: now,
                    currentPeriodEnd: nextPeriodEnd,
                },
            });
        });

        await logAuditEvent({
            actorEmail: "midtrans-platform-webhook",
            action: "SAAS_PAYMENT_CONFIRMED",
            category: "SUBSCRIPTION",
            targetType: "SaaSTransaction",
            targetId: transaction.id,
            metadata: {
                orderId: order_id,
                grossAmount: gross_amount,
                paymentType: payment_type,
                planTier: transaction.planTier,
                periodMonths: transaction.periodMonths,
                propertyId: transaction.propertyId,
                ownerEmail: transaction.property.owner?.email,
            },
        });

        log.info(
            { orderId: order_id, propertyId: transaction.propertyId },
            "SaaS Subscription payment confirmed successfully"
        );
    } else if (isPending) {
        await prisma.saaSTransaction.update({
            where: { id: transaction.id },
            data: {
                status: "PENDING",
                paymentMethod: payment_type || "MIDTRANS_SNAP",
            },
        });
    } else if (isFailure) {
        const failureStatus =
            transaction_status === "expire"
                ? "EXPIRED"
                : transaction_status === "cancel"
                ? "CANCELLED"
                : "FAILED";

        await prisma.saaSTransaction.update({
            where: { id: transaction.id },
            data: {
                status: failureStatus,
                notes: `${transaction.notes ?? ""}\n[Midtrans Webhook: ${failureStatus}]`,
            },
        });

        await logAuditEvent({
            actorEmail: "midtrans-platform-webhook",
            action: `SAAS_PAYMENT_${failureStatus}`,
            category: "SUBSCRIPTION",
            targetType: "SaaSTransaction",
            targetId: transaction.id,
            metadata: { orderId: order_id, transaction_status },
        });
    }

    return NextResponse.json({
        status: "OK",
        message: "SaaS Subscription webhook processed",
    });
}
