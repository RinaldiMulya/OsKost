"use server";

import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { AuditCategory, Prisma } from "@prisma/client";

export type AuditSource = "ALL" | "SUPER_ADMIN" | "OWNER" | "MOBILE_API" | "SYSTEM";

export interface AuditLogItem {
    id: string;
    action: string;
    category: AuditCategory;
    actorEmail: string | null;
    actorRole: string | null;
    actorId: string | null;
    targetType: string | null;
    targetId: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    metadata: any;
    createdAt: string;
    source: "SUPER_ADMIN" | "OWNER" | "MOBILE_API" | "SYSTEM";
}

export interface AuditLogsFilterOptions {
    category?: AuditCategory | "ALL";
    source?: AuditSource;
    searchQuery?: string;
    take?: number;
    skip?: number;
}

export interface AuditLogsSummary {
    total: number;
    authCount: number;
    securityCount: number;
    subscriptionCount: number;
    ownerCount: number;
    propertyCount: number;
    systemCount: number;
}

export async function getAuditLogsData(options?: AuditLogsFilterOptions): Promise<{
    logs: AuditLogItem[];
    totalCount: number;
    summary: AuditLogsSummary;
}> {
    await requireSuperAdmin();

    const take = options?.take ?? 150;
    const skip = options?.skip ?? 0;
    const whereClause: Prisma.AuditLogWhereInput = {};

    if (options?.category && options.category !== "ALL") {
        whereClause.category = options.category;
    }

    if (options?.searchQuery?.trim()) {
        const query = options.searchQuery.trim();
        whereClause.OR = [
            { actorEmail: { contains: query, mode: "insensitive" } },
            { action: { contains: query, mode: "insensitive" } },
            { targetId: { contains: query, mode: "insensitive" } },
            { targetType: { contains: query, mode: "insensitive" } },
            { ipAddress: { contains: query } },
        ];
    }

    if (options?.source && options.source !== "ALL") {
        switch (options.source) {
            case "SUPER_ADMIN":
                whereClause.actorRole = "SUPER_ADMIN";
                break;
            case "OWNER":
                whereClause.actorRole = { in: ["ADMIN", "PROPERTY_OWNER"] };
                break;
            case "MOBILE_API":
                whereClause.actorRole = "TENANT";
                break;
            case "SYSTEM":
                whereClause.actorId = null;
                break;
        }
    }

    const [rawLogs, totalCount, categoryCounts] = await Promise.all([
        prisma.auditLog.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            take,
            skip,
        }),
        prisma.auditLog.count({ where: whereClause }),
        prisma.auditLog.groupBy({
            by: ["category"],
            _count: { _all: true },
        }),
    ]);

    const summary: AuditLogsSummary = {
        total: totalCount,
        authCount: 0,
        securityCount: 0,
        subscriptionCount: 0,
        ownerCount: 0,
        propertyCount: 0,
        systemCount: 0,
    };

    categoryCounts.forEach((item) => {
        switch (item.category) {
            case "AUTH":
                summary.authCount = item._count._all;
                break;
            case "SECURITY":
                summary.securityCount = item._count._all;
                break;
            case "SUBSCRIPTION":
                summary.subscriptionCount = item._count._all;
                break;
            case "OWNER":
                summary.ownerCount = item._count._all;
                break;
            case "PROPERTY":
                summary.propertyCount = item._count._all;
                break;
            case "SYSTEM":
                summary.systemCount = item._count._all;
                break;
        }
    });

    const logs: AuditLogItem[] = rawLogs.map((log) => {
        let source: AuditLogItem["source"] = "SYSTEM";
        if (log.actorRole === "SUPER_ADMIN") {
            source = "SUPER_ADMIN";
        } else if (log.actorRole === "TENANT") {
            source = "MOBILE_API";
        } else if (log.actorRole === "ADMIN" || log.actorRole === "PROPERTY_OWNER") {
            source = "OWNER";
        }

        return {
            id: log.id,
            action: log.action,
            category: log.category,
            actorEmail: log.actorEmail,
            actorRole: log.actorRole,
            actorId: log.actorId,
            targetType: log.targetType,
            targetId: log.targetId,
            ipAddress: log.ipAddress,
            userAgent: log.userAgent,
            metadata: log.metadata,
            createdAt: log.createdAt.toISOString(),
            source,
        };
    });

    return { logs, totalCount, summary };
}
