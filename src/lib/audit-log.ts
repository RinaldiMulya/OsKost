import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { Prisma, type AuditCategory, type UserRole } from "@prisma/client";

const log = logger.child({ module: "audit-log" });

export interface AuditPayload {
    actorId?: string | null;
    actorEmail?: string | null;
    actorRole?: UserRole | null;
    action: string;
    category?: AuditCategory;
    targetType?: string | null;
    targetId?: string | null;
    metadata?: Prisma.InputJsonValue;
    ipAddress?: string | null;
    userAgent?: string | null;
}

/**
 * Centrally records platform audit log events into PostgreSQL.
 * Completely fail-safe: failures are logged to stdout but will not break
 * caller execution flow.
 */
export async function logAuditEvent(payload: AuditPayload): Promise<void> {
    try {
        await prisma.auditLog.create({
            data: {
                actorId: payload.actorId,
                actorEmail: payload.actorEmail,
                actorRole: payload.actorRole,
                action: payload.action,
                category: payload.category || "SYSTEM",
                targetType: payload.targetType,
                targetId: payload.targetId,
                metadata: payload.metadata ?? Prisma.JsonNull,
                ipAddress: payload.ipAddress,
                userAgent: payload.userAgent,
            },
        });

        log.info(
            {
                action: payload.action,
                actor: payload.actorEmail || payload.actorId || "SYSTEM",
                category: payload.category || "SYSTEM",
            },
            `[Audit] ${payload.action}`
        );
    } catch (error) {
        log.error(
            { error, action: payload.action },
            "Gagal mencatat audit log ke database (fail-safe bypassed)"
        );
    }
}
