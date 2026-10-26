"use server";

import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { PaymentStatus, SaaSPlanTier } from "@prisma/client";

export interface SaaSTransactionItem {
    id: string;
    propertyName: string;
    propertySlug: string | null;
    ownerEmail: string;
    ownerPhone: string | null;
    planTier: SaaSPlanTier;
    periodMonths: number;
    amount: number;
    status: PaymentStatus;
    paymentMethod: string | null;
    midtransOrderId: string | null;
    paidAt: string | null;
    notes: string | null;
    createdAt: string;
}

export interface SaaSTransactionsSummary {
    totalRevenueAllTime: number;
    totalRevenueThisMonth: number;
    pendingAmount: number;
    paidCount: number;
    totalCount: number;
    successRatePercentage: number;
}

export async function getSaaSTransactionsData(): Promise<{
    transactions: SaaSTransactionItem[];
    summary: SaaSTransactionsSummary;
}> {
    await requireSuperAdmin();

    const raw = await prisma.saaSTransaction.findMany({
        include: {
            property: {
                include: {
                    owner: true,
                },
            },
            subscription: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const transactions: SaaSTransactionItem[] = raw.map((t) => ({
        id: t.id,
        propertyName: t.property.name,
        propertySlug: t.property.slug,
        ownerEmail: t.property.owner?.email || "-",
        ownerPhone: t.property.owner?.phoneNumber || null,
        planTier: t.planTier,
        periodMonths: t.periodMonths,
        amount: t.amount,
        status: t.status,
        paymentMethod: t.paymentMethod,
        midtransOrderId: t.midtransOrderId,
        paidAt: t.paidAt ? t.paidAt.toISOString() : null,
        notes: t.notes,
        createdAt: t.createdAt.toISOString(),
    }));

    const paidTx = raw.filter((t) => t.status === "PAID");
    const pendingTx = raw.filter((t) => t.status === "PENDING");
    const thisMonthPaidTx = paidTx.filter((t) => t.paidAt && t.paidAt >= startOfMonth);

    const totalRevenueAllTime = paidTx.reduce((acc, curr) => acc + curr.amount, 0);
    const totalRevenueThisMonth = thisMonthPaidTx.reduce((acc, curr) => acc + curr.amount, 0);
    const pendingAmount = pendingTx.reduce((acc, curr) => acc + curr.amount, 0);

    const totalCount = raw.length;
    const paidCount = paidTx.length;
    const successRatePercentage =
        totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 100;

    return {
        transactions,
        summary: {
            totalRevenueAllTime,
            totalRevenueThisMonth,
            pendingAmount,
            paidCount,
            totalCount,
            successRatePercentage,
        },
    };
}
