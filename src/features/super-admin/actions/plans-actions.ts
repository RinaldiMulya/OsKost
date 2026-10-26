"use server";

import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { logAuditEvent } from "@/lib/audit-log";
import { revalidatePath } from "next/cache";
import { DEFAULT_PLAN_SEEDS } from "@/features/super-admin/constants/plan-constants";
import type {
    PlanFeatureMatrix,
    SaaSPlanItem,
    UpdatePlanInput,
} from "@/features/super-admin/constants/plan-constants";

/**
 * Retrieves all pricing plans from database.
 * Automatically seeds defaults if database table is empty.
 */
export async function getSaaSPricingPlans(): Promise<SaaSPlanItem[]> {
    await requireSuperAdmin();

    let plans = await prisma.saaSPlan.findMany({
        orderBy: { monthlyPrice: "asc" },
    });

    // Auto-seed if empty
    if (plans.length === 0) {
        for (const seed of DEFAULT_PLAN_SEEDS) {
            await prisma.saaSPlan.create({
                data: {
                    tier: seed.tier,
                    name: seed.name,
                    description: seed.description,
                    monthlyPrice: seed.monthlyPrice,
                    annualPrice: seed.annualPrice,
                    maxRooms: seed.maxRooms,
                    maxProperties: seed.maxProperties,
                    isPopular: seed.isPopular,
                    features: seed.features as any,
                    isActive: true,
                },
            });
        }
        plans = await prisma.saaSPlan.findMany({
            orderBy: { monthlyPrice: "asc" },
        });
    }

    return plans.map((p) => ({
        id: p.id,
        tier: p.tier,
        name: p.name,
        description: p.description,
        monthlyPrice: p.monthlyPrice,
        annualPrice: p.annualPrice,
        maxRooms: p.maxRooms,
        maxProperties: p.maxProperties,
        features: (p.features as unknown as PlanFeatureMatrix) || {
            adminDashboard: true,
            midtransGateway: false,
            photo360Tour: false,
            smartLock: false,
            customDomain: false,
            exportReports: false,
            dedicatedSupport: false,
        },
        isActive: p.isActive,
        isPopular: p.isPopular,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
    }));
}

/**
 * Updates a pricing plan tier and logs the action in AuditLog.
 */
export async function updateSaaSPlanAction(
    input: UpdatePlanInput
): Promise<{ success: boolean; error?: string }> {
    const session = await requireSuperAdmin();

    try {
        const existing = await prisma.saaSPlan.findUnique({
            where: { id: input.id },
        });

        if (!existing) {
            return { success: false, error: "Paket harga tidak ditemukan." };
        }

        await prisma.saaSPlan.update({
            where: { id: input.id },
            data: {
                name: input.name.trim(),
                description: input.description.trim(),
                monthlyPrice: input.monthlyPrice,
                annualPrice: input.annualPrice,
                maxRooms: input.maxRooms,
                maxProperties: input.maxProperties,
                isPopular: input.isPopular,
                isActive: input.isActive,
                features: input.features as any,
            },
        });

        await logAuditEvent({
            actorId: session.id,
            actorEmail: session.email,
            actorRole: session.role,
            action: "SAAS_PLAN_UPDATED",
            category: "SYSTEM",
            targetType: "SaaSPlan",
            targetId: input.id,
            metadata: {
                tier: existing.tier,
                previousPrice: existing.monthlyPrice,
                newPrice: input.monthlyPrice,
                previousMaxRooms: existing.maxRooms,
                newMaxRooms: input.maxRooms,
            },
        });

        revalidatePath("/super-admin/subscriptions/plans");
        revalidatePath("/super-admin/subscriptions");

        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || "Gagal memperbarui konfigurasi paket harga.",
        };
    }
}
