"use server";

import { cookies } from "next/headers";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { logAuditEvent } from "@/lib/audit-log";

export interface ImpersonationData {
    ownerId: string;
    ownerEmail: string;
    ownerName?: string | null;
    superAdminId: string;
    superAdminEmail: string;
    startedAt: string;
}

export const IMPERSONATION_COOKIE_NAME = "oskost_impersonation_session";

/**
 * Super Admin starts impersonating a specific property owner.
 * Sets a secure, temporary HttpOnly cookie and records an audit log.
 */
export async function startImpersonationAction(ownerId: string): Promise<{
    success: boolean;
    redirectUrl?: string;
    error?: string;
}> {
    const session = await requireSuperAdmin();

    const owner = await prisma.user.findUnique({
        where: { id: ownerId },
        select: {
            id: true,
            email: true,
            phoneNumber: true,
            role: true,
            isSuspended: true,
        },
    });

    if (!owner) {
        return { success: false, error: "Pemilik kost tidak ditemukan di database." };
    }

    if (owner.isSuspended) {
        return {
            success: false,
            error: "Akun ini sedang ditangguhkan. Harap aktifkan akun terlebih dahulu sebelum impersonasi.",
        };
    }

    const payload: ImpersonationData = {
        ownerId: owner.id,
        ownerEmail: owner.email ?? owner.phoneNumber ?? "Owner",
        ownerName: owner.email ? owner.email.split("@")[0] : "Owner",
        superAdminId: session.id,
        superAdminEmail: session.email ?? "Super Admin",
        startedAt: new Date().toISOString(),
    };

    const cookieStore = await cookies();
    cookieStore.set(IMPERSONATION_COOKIE_NAME, JSON.stringify(payload), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 2, // 2 hours
    });

    await logAuditEvent({
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "OWNER_IMPERSONATED",
        category: "SECURITY",
        targetType: "User",
        targetId: ownerId,
        metadata: {
            impersonatedOwnerEmail: owner.email,
            impersonatedOwnerPhone: owner.phoneNumber,
        },
    });

    return {
        success: true,
        redirectUrl: "/admin",
    };
}

/**
 * Exits the current impersonation mode, clears the temporary cookie,
 * logs the security exit event, and returns the redirect URL.
 */
export async function stopImpersonationAction(): Promise<{
    success: boolean;
    redirectUrl: string;
}> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(IMPERSONATION_COOKIE_NAME);
    let ownerId = "";

    if (cookie?.value) {
        try {
            const data: ImpersonationData = JSON.parse(cookie.value);
            ownerId = data.ownerId;
            await logAuditEvent({
                actorId: data.superAdminId,
                actorEmail: data.superAdminEmail,
                action: "IMPERSONATION_ENDED",
                category: "SECURITY",
                targetType: "User",
                targetId: data.ownerId,
            });
        } catch {}
    }

    cookieStore.delete(IMPERSONATION_COOKIE_NAME);

    return {
        success: true,
        redirectUrl: ownerId ? `/super-admin/owners/${ownerId}` : "/super-admin/owners",
    };
}

/**
 * Inspects whether the incoming request is in an active impersonation session.
 */
export async function getActiveImpersonation(): Promise<ImpersonationData | null> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(IMPERSONATION_COOKIE_NAME);
    if (!cookie?.value) return null;

    try {
        return JSON.parse(cookie.value) as ImpersonationData;
    } catch {
        return null;
    }
}
