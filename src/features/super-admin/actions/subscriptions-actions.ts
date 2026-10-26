"use server";

import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { logAuditEvent } from "@/lib/audit-log";
import { revalidatePath } from "next/cache";
import { SaaSPlanTier, SubscriptionStatus } from "@prisma/client";
import { PLAN_TIER_CONFIG } from "@/features/super-admin/constants/plan-constants";

export interface SubscriptionItem {
    id: string;
    propertyId: string;
    propertyName: string;
    propertySlug: string | null;
    ownerEmail: string;
    ownerPhone: string | null;
    planTier: string;
    status: string;
    maxRooms: number;
    usedRooms: number;
    monthlyPrice: number;
    currentPeriodStart: string;
    currentPeriodEnd: string | null;
    trialEndsAt: string | null;
    midtransSubscriptionId: string | null;
    createdAt: string;
}

export interface SubscriptionsSummary {
    activeCount: number;
    trialCount: number;
    pastDueCount: number;
    suspendedCount: number;
    totalMrr: number;
}

export async function getSubscriptionsData(): Promise<{
    subscriptions: SubscriptionItem[];
    summary: SubscriptionsSummary;
}> {
    await requireSuperAdmin();

    const rawSubscriptions = await prisma.saaSSubscription.findMany({
        include: {
            property: {
                include: {
                    owner: true,
                    rooms: {
                        select: {
                            id: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const subscriptions: SubscriptionItem[] = rawSubscriptions.map((sub) => ({
        id: sub.id,
        propertyId: sub.propertyId,
        propertyName: sub.property.name,
        propertySlug: sub.property.slug,
        ownerEmail: sub.property.owner?.email || "-",
        ownerPhone: sub.property.owner?.phoneNumber || null,
        planTier: sub.planTier,
        status: sub.status,
        maxRooms: sub.maxRooms,
        usedRooms: sub.property.rooms.length,
        monthlyPrice: sub.monthlyPrice,
        currentPeriodStart: sub.currentPeriodStart.toISOString(),
        currentPeriodEnd: sub.currentPeriodEnd ? sub.currentPeriodEnd.toISOString() : null,
        trialEndsAt: sub.trialEndsAt ? sub.trialEndsAt.toISOString() : null,
        midtransSubscriptionId: sub.midtransSubscriptionId,
        createdAt: sub.createdAt.toISOString(),
    }));

    const activeList = subscriptions.filter((s) => s.status === "ACTIVE");
    const summary: SubscriptionsSummary = {
        activeCount: activeList.length,
        trialCount: subscriptions.filter((s) => s.status === "TRIAL").length,
        pastDueCount: subscriptions.filter((s) => s.status === "PAST_DUE").length,
        suspendedCount: subscriptions.filter((s) => s.status === "SUSPENDED").length,
        totalMrr: activeList.reduce((acc, curr) => acc + curr.monthlyPrice, 0),
    };

    return { subscriptions, summary };
}

/**
 * Updates an existing subscription plan tier with instant capacity upgrade.
 * As agreed in Grill-Me: capacity updates immediately, new price applies for next cycle.
 */
export async function updateSubscriptionPlanAction(
    subscriptionId: string,
    newTier: SaaSPlanTier
): Promise<{ success: boolean; error?: string }> {
    const session = await requireSuperAdmin();

    try {
        const currentSub = await prisma.saaSSubscription.findUnique({
            where: { id: subscriptionId },
            include: { property: true },
        });

        if (!currentSub) {
            return { success: false, error: "Data langganan tidak ditemukan." };
        }

        const tierConfig = PLAN_TIER_CONFIG[newTier] || PLAN_TIER_CONFIG.STARTER;

        await prisma.saaSSubscription.update({
            where: { id: subscriptionId },
            data: {
                planTier: newTier,
                maxRooms: tierConfig.maxRooms,
                monthlyPrice: tierConfig.defaultMonthlyPrice,
            },
        });

        await logAuditEvent({
            actorId: session.id,
            actorEmail: session.email,
            actorRole: session.role,
            action: "SUBSCRIPTION_PLAN_CHANGED",
            category: "SUBSCRIPTION",
            targetType: "SaaSSubscription",
            targetId: subscriptionId,
            metadata: {
                propertyId: currentSub.propertyId,
                propertyName: currentSub.property.name,
                previousTier: currentSub.planTier,
                newTier,
                newMaxRooms: tierConfig.maxRooms,
                newMonthlyPrice: tierConfig.defaultMonthlyPrice,
            },
        });

        revalidatePath("/super-admin/subscriptions");
        revalidatePath("/super-admin/owners");
        revalidatePath("/super-admin");

        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || "Gagal mengubah paket langganan.",
        };
    }
}

/**
 * Extends the trial duration for a subscription by a specified number of days.
 */
export async function extendSubscriptionTrialAction(
    subscriptionId: string,
    additionalDays: number
): Promise<{ success: boolean; error?: string }> {
    const session = await requireSuperAdmin();

    try {
        const sub = await prisma.saaSSubscription.findUnique({
            where: { id: subscriptionId },
            include: { property: true },
        });

        if (!sub) {
            return { success: false, error: "Data langganan tidak ditemukan." };
        }

        const baseDate = sub.trialEndsAt && sub.trialEndsAt > new Date() ? sub.trialEndsAt : new Date();
        const newTrialEnd = new Date(baseDate.getTime() + additionalDays * 24 * 60 * 60 * 1000);

        await prisma.saaSSubscription.update({
            where: { id: subscriptionId },
            data: {
                trialEndsAt: newTrialEnd,
                status: SubscriptionStatus.TRIAL,
            },
        });

        await logAuditEvent({
            actorId: session.id,
            actorEmail: session.email,
            actorRole: session.role,
            action: "SUBSCRIPTION_TRIAL_EXTENDED",
            category: "SUBSCRIPTION",
            targetType: "SaaSSubscription",
            targetId: subscriptionId,
            metadata: {
                propertyName: sub.property.name,
                additionalDays,
                newTrialEnd: newTrialEnd.toISOString(),
            },
        });

        revalidatePath("/super-admin/subscriptions");
        revalidatePath("/super-admin/owners");

        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || "Gagal memperpanjang masa trial.",
        };
    }
}

/**
 * Overrides a subscription status manually (e.g. ACTIVE, PAST_DUE, SUSPENDED, CANCELLED).
 */
export async function overrideSubscriptionStatusAction(
    subscriptionId: string,
    newStatus: SubscriptionStatus,
    notes?: string
): Promise<{ success: boolean; error?: string }> {
    const session = await requireSuperAdmin();

    try {
        const sub = await prisma.saaSSubscription.findUnique({
            where: { id: subscriptionId },
            include: { property: true },
        });

        if (!sub) {
            return { success: false, error: "Data langganan tidak ditemukan." };
        }

        await prisma.saaSSubscription.update({
            where: { id: subscriptionId },
            data: {
                status: newStatus,
                suspendedAt: newStatus === SubscriptionStatus.SUSPENDED ? new Date() : null,
                cancelledAt: newStatus === SubscriptionStatus.CANCELLED ? new Date() : null,
                notes: notes ? `${notes} (Disunting oleh ${session.email})` : sub.notes,
            },
        });

        await logAuditEvent({
            actorId: session.id,
            actorEmail: session.email,
            actorRole: session.role,
            action: "SUBSCRIPTION_STATUS_OVERRIDDEN",
            category: "SUBSCRIPTION",
            targetType: "SaaSSubscription",
            targetId: subscriptionId,
            metadata: {
                propertyName: sub.property.name,
                previousStatus: sub.status,
                newStatus,
                notes,
            },
        });

        revalidatePath("/super-admin/subscriptions");
        revalidatePath("/super-admin/owners");
        revalidatePath("/super-admin");

        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || "Gagal mengubah status langganan.",
        };
    }
}
