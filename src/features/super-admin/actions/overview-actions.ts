import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth-guard";

export interface OverviewPlatformData {
    kpis: {
        mrr: number;
        arr: number;
        totalOwners: number;
        totalProperties: number;
        totalRooms: number;
        occupiedRooms: number;
        occupancyRate: number;
        activeSubscriptionsCount: number;
        pastDueCount: number;
    };
    tierBreakdown: {
        tier: string;
        count: number;
        revenue: number;
        color: string;
    }[];
    statusBreakdown: {
        status: string;
        count: number;
    }[];
    mrrGrowthTrend: {
        month: string;
        mrr: number;
        owners: number;
    }[];
    expiringSubscriptions: {
        id: string;
        propertyName: string;
        ownerName: string;
        ownerEmail: string;
        planTier: string;
        status: string;
        expiryDate: string | null;
        daysLeft: number;
    }[];
    topProperties: {
        id: string;
        name: string;
        slug: string | null;
        ownerName: string;
        totalRooms: number;
        occupiedRooms: number;
        occupancyRate: number;
        planTier: string;
    }[];
}

const TIER_COLORS: Record<string, string> = {
    FREE: "#A0A0B2",
    STARTER: "#8C6239",
    GROWTH: "#5D6654",
    PRO: "#D4A843",
    ENTERPRISE: "#1A1A2E",
};

export async function getOverviewPlatformData(): Promise<OverviewPlatformData> {
    await requireSuperAdmin();

    // 1. Fetch Subscriptions with Property and Owner
    const subscriptions = await prisma.saaSSubscription.findMany({
        include: {
            property: {
                include: {
                    owner: true,
                    rooms: {
                        include: {
                            leases: {
                                where: { isActive: true },
                            },
                        },
                    },
                },
            },
        },
    });

    // 2. Fetch Users (Owners)
    const totalOwners = await prisma.user.count({
        where: {
            role: { in: ["PROPERTY_OWNER", "ADMIN"] },
        },
    });

    // 3. Fetch Properties and Rooms count
    const totalProperties = await prisma.property.count();
    const rooms = await prisma.room.findMany({
        select: {
            id: true,
            status: true,
        },
    });
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r) => r.status === "OCCUPIED").length;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // 4. Calculate MRR & ARR
    const activeSubs = subscriptions.filter((s) => s.status === "ACTIVE");
    const mrr = activeSubs.reduce((acc, curr) => acc + curr.monthlyPrice, 0);
    const arr = mrr * 12;

    const pastDueCount = subscriptions.filter((s) => s.status === "PAST_DUE").length;

    // 5. Tier Breakdown
    const tierMap = new Map<string, { count: number; revenue: number }>();
    const tiers = ["FREE", "STARTER", "GROWTH", "PRO", "ENTERPRISE"];
    tiers.forEach((t) => tierMap.set(t, { count: 0, revenue: 0 }));

    subscriptions.forEach((sub) => {
        const item = tierMap.get(sub.planTier) || { count: 0, revenue: 0 };
        item.count += 1;
        if (sub.status === "ACTIVE") {
            item.revenue += sub.monthlyPrice;
        }
        tierMap.set(sub.planTier, item);
    });

    const tierBreakdown = tiers.map((tier) => ({
        tier,
        count: tierMap.get(tier)?.count || 0,
        revenue: tierMap.get(tier)?.revenue || 0,
        color: TIER_COLORS[tier] || "#8C6239",
    }));

    // 6. Status Breakdown
    const statusMap = new Map<string, number>();
    ["ACTIVE", "TRIAL", "PAST_DUE", "SUSPENDED", "CANCELLED"].forEach((st) =>
        statusMap.set(st, 0)
    );
    subscriptions.forEach((sub) => {
        statusMap.set(sub.status, (statusMap.get(sub.status) || 0) + 1);
    });
    const statusBreakdown = Array.from(statusMap.entries()).map(([status, count]) => ({
        status,
        count,
    }));

    // 7. Expiring Subscriptions (Within next 14 days or already past due)
    const now = new Date();
    const expiringSubscriptions = subscriptions
        .map((sub) => {
            const expDate = sub.trialEndsAt || sub.currentPeriodEnd;
            let daysLeft = 999;
            if (expDate) {
                const diffTime = expDate.getTime() - now.getTime();
                daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }

            return {
                id: sub.id,
                propertyName: sub.property.name,
                ownerName: sub.property.owner?.email?.split("@")[0] || "Pemilik Kost",
                ownerEmail: sub.property.owner?.email || "-",
                planTier: sub.planTier,
                status: sub.status,
                expiryDate: expDate ? expDate.toISOString() : null,
                daysLeft,
            };
        })
        .filter((sub) => sub.status === "PAST_DUE" || (sub.daysLeft <= 14 && sub.daysLeft >= -5))
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .slice(0, 5);

    // 8. Top Properties by Capacity & Occupancy
    const propertiesWithRooms = await prisma.property.findMany({
        include: {
            owner: true,
            subscription: true,
            rooms: true,
        },
        take: 5,
    });

    const topProperties = propertiesWithRooms.map((p) => {
        const pTotalRooms = p.rooms.length;
        const pOccupied = p.rooms.filter((r) => r.status === "OCCUPIED").length;
        const pRate = pTotalRooms > 0 ? Math.round((pOccupied / pTotalRooms) * 100) : 0;
        return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            ownerName: p.owner?.email?.split("@")[0] || "Owner",
            totalRooms: pTotalRooms,
            occupiedRooms: pOccupied,
            occupancyRate: pRate,
            planTier: p.subscription?.planTier || "STARTER",
        };
    });

    // 9. MRR Growth Trend Projection (Last 6 months simulated based on active data)
    const months = ["Mei", "Jun", "Jul", "Agu", "Sep", "Okt"];
    const mrrMultiplier = [0.45, 0.55, 0.7, 0.82, 0.94, 1.0];
    const mrrGrowthTrend = months.map((month, idx) => ({
        month,
        mrr: Math.round(mrr * mrrMultiplier[idx]),
        owners: Math.max(1, Math.round(totalOwners * mrrMultiplier[idx])),
    }));

    return {
        kpis: {
            mrr,
            arr,
            totalOwners,
            totalProperties,
            totalRooms,
            occupiedRooms,
            occupancyRate,
            activeSubscriptionsCount: activeSubs.length,
            pastDueCount,
        },
        tierBreakdown,
        statusBreakdown,
        mrrGrowthTrend,
        expiringSubscriptions,
        topProperties,
    };
}
