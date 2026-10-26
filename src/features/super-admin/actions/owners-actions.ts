"use server";

import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { logAuditEvent } from "@/lib/audit-log";
import { revalidatePath } from "next/cache";
import bcryptjs from "bcryptjs";
import { SaaSPlanTier, SubscriptionStatus } from "@prisma/client";
import { PLAN_TIER_CONFIG } from "@/features/super-admin/constants/plan-constants";

export interface OwnerItem {
    id: string;
    email: string | null;
    phoneNumber: string | null;
    role: string;
    isActive: boolean;
    isSuspended: boolean;
    createdAt: string;
    lastLoginAt: string | null;
    properties: {
        id: string;
        name: string;
        slug: string | null;
        totalRooms: number;
        occupiedRooms: number;
        planTier: string;
        subscriptionStatus: string;
        monthlyPrice: number;
    }[];
}

export interface CreateOwnerInput {
    email: string;
    phoneNumber: string;
    password: string;
    fullName?: string;
    propertyName: string;
    propertySlug: string;
    address: string;
    planTier: SaaSPlanTier;
    trialDays?: number;
    forceReset?: boolean;
}

export async function getOwnersList(
    searchQuery?: string,
    statusFilter?: string
): Promise<OwnerItem[]> {
    await requireSuperAdmin();

    const users = await prisma.user.findMany({
        where: {
            role: { in: ["PROPERTY_OWNER", "ADMIN"] },
            ...(searchQuery
                ? {
                      OR: [
                          { email: { contains: searchQuery, mode: "insensitive" } },
                          { phoneNumber: { contains: searchQuery } },
                          {
                              ownedProperties: {
                                  some: {
                                      name: { contains: searchQuery, mode: "insensitive" },
                                  },
                              },
                          },
                      ],
                  }
                : {}),
        },
        include: {
            ownedProperties: {
                include: {
                    subscription: true,
                    rooms: {
                        select: {
                            id: true,
                            status: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const items: OwnerItem[] = users.map((user) => ({
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isActive: user.isActive,
        isSuspended: user.isSuspended,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
        properties: user.ownedProperties.map((prop) => ({
            id: prop.id,
            name: prop.name,
            slug: prop.slug,
            totalRooms: prop.rooms.length,
            occupiedRooms: prop.rooms.filter((r) => r.status === "OCCUPIED").length,
            planTier: prop.subscription?.planTier || "FREE",
            subscriptionStatus: prop.subscription?.status || "ACTIVE",
            monthlyPrice: prop.subscription?.monthlyPrice || 0,
        })),
    }));

    if (statusFilter && statusFilter !== "ALL") {
        return items.filter((item) => {
            if (statusFilter === "SUSPENDED") return item.isSuspended;
            return item.properties.some((p) => p.subscriptionStatus === statusFilter);
        });
    }

    return items;
}

/**
 * Creates a new B2B Owner along with their first Property and SaaS Subscription
 * wrapped securely in a Prisma transaction.
 */
export async function createOwnerWithPropertyAction(
    input: CreateOwnerInput
): Promise<{ success: boolean; error?: string; ownerId?: string }> {
    const session = await requireSuperAdmin();

    try {
        const cleanEmail = input.email.trim().toLowerCase();
        const cleanPhone = input.phoneNumber.trim();
        const cleanSlug = input.propertySlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");

        if (!cleanEmail || !cleanPhone || !input.password || !input.propertyName) {
            return { success: false, error: "Semua kolom wajib diisi lengkap." };
        }

        if (input.password.length < 6) {
            return { success: false, error: "Password minimal 6 karakter." };
        }

        // Check uniqueness of Email and Phone
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email: cleanEmail }, { phoneNumber: cleanPhone }],
            },
        });

        if (existingUser) {
            if (existingUser.email?.toLowerCase() === cleanEmail) {
                return { success: false, error: "Email sudah terdaftar pada akun lain." };
            }
            return { success: false, error: "Nomor WhatsApp sudah terdaftar pada akun lain." };
        }

        // Check uniqueness of Slug
        const existingSlug = await prisma.property.findUnique({
            where: { slug: cleanSlug },
        });

        if (existingSlug) {
            return { success: false, error: `Slug "${cleanSlug}" sudah digunakan oleh kost lain.` };
        }

        const tierConfig = PLAN_TIER_CONFIG[input.planTier] || PLAN_TIER_CONFIG.STARTER;
        const passwordHash = await bcryptjs.hash(input.password, 10);
        const trialDays = input.trialDays ?? 14;
        const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create User
            const user = await tx.user.create({
                data: {
                    email: cleanEmail,
                    phoneNumber: cleanPhone,
                    passwordHash,
                    role: "PROPERTY_OWNER",
                    isActive: true,
                    isSuspended: false,
                    forceReset: input.forceReset ?? true,
                },
            });

            // 2. Create Property
            const property = await tx.property.create({
                data: {
                    name: input.propertyName.trim(),
                    slug: cleanSlug,
                    address: input.address.trim(),
                    ownerId: user.id,
                },
            });

            // 3. Create SaaS Subscription
            const subscription = await tx.saaSSubscription.create({
                data: {
                    propertyId: property.id,
                    planTier: input.planTier,
                    status: input.planTier === "FREE" ? "ACTIVE" : "TRIAL",
                    maxRooms: tierConfig.maxRooms,
                    monthlyPrice: tierConfig.defaultMonthlyPrice,
                    trialEndsAt: input.planTier === "FREE" ? null : trialEndsAt,
                    currentPeriodStart: new Date(),
                    notes: `Onboarding manual oleh Super Admin (${session.email})`,
                },
            });

            return { user, property, subscription };
        });

        // Audit Logging
        await logAuditEvent({
            actorId: session.id,
            actorEmail: session.email,
            actorRole: session.role,
            action: "OWNER_CREATED",
            category: "OWNER",
            targetType: "User",
            targetId: result.user.id,
            metadata: {
                email: cleanEmail,
                phoneNumber: cleanPhone,
                propertyName: input.propertyName,
                slug: cleanSlug,
                planTier: input.planTier,
                propertyId: result.property.id,
            },
        });

        revalidatePath("/super-admin/owners");
        revalidatePath("/super-admin/subscriptions");
        revalidatePath("/super-admin");

        return { success: true, ownerId: result.user.id };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || "Terjadi kesalahan sistem saat membuat akun owner.",
        };
    }
}

export interface OwnerDetailData {
    id: string;
    email: string | null;
    phoneNumber: string | null;
    role: string;
    isActive: boolean;
    isSuspended: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    properties: {
        id: string;
        name: string;
        slug: string | null;
        address: string;
        bankName?: string | null;
        bankAccountNumber?: string | null;
        bankAccountHolder?: string | null;
        totalRooms: number;
        occupiedRooms: number;
        activeLeasesCount: number;
        subscription: {
            id: string;
            planTier: string;
            status: string;
            maxRooms: number;
            monthlyPrice: number;
            currentPeriodStart: string;
            currentPeriodEnd: string | null;
            trialEndsAt: string | null;
            notes: string | null;
        } | null;
    }[];
    recentLogs: {
        id: string;
        action: string;
        category: string;
        actorEmail: string | null;
        createdAt: string;
        metadata: any;
    }[];
}

/**
 * Retrieves comprehensive details for a specific Owner.
 */
export async function getOwnerDetails(ownerId: string): Promise<OwnerDetailData | null> {
    await requireSuperAdmin();

    const user = await prisma.user.findUnique({
        where: { id: ownerId },
        include: {
            ownedProperties: {
                include: {
                    subscription: true,
                    rooms: {
                        select: {
                            id: true,
                            status: true,
                        },
                    },
                    leases: {
                        where: { isActive: true },
                        select: { id: true },
                    },
                },
            },
        },
    });

    if (!user) return null;

    // Fetch related audit logs
    const auditLogs = await prisma.auditLog.findMany({
        where: {
            OR: [{ targetId: ownerId }, { actorId: ownerId }],
        },
        take: 10,
        orderBy: { createdAt: "desc" },
    });

    return {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isActive: user.isActive,
        isSuspended: user.isSuspended,
        lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
        createdAt: user.createdAt.toISOString(),
        properties: user.ownedProperties.map((prop) => ({
            id: prop.id,
            name: prop.name,
            slug: prop.slug,
            address: prop.address,
            bankName: prop.bankName,
            bankAccountNumber: prop.bankAccountNumber,
            bankAccountHolder: prop.bankAccountHolder,
            totalRooms: prop.rooms.length,
            occupiedRooms: prop.rooms.filter((r) => r.status === "OCCUPIED").length,
            activeLeasesCount: prop.leases.length,
            subscription: prop.subscription
                ? {
                      id: prop.subscription.id,
                      planTier: prop.subscription.planTier,
                      status: prop.subscription.status,
                      maxRooms: prop.subscription.maxRooms,
                      monthlyPrice: prop.subscription.monthlyPrice,
                      currentPeriodStart: prop.subscription.currentPeriodStart.toISOString(),
                      currentPeriodEnd: prop.subscription.currentPeriodEnd
                          ? prop.subscription.currentPeriodEnd.toISOString()
                          : null,
                      trialEndsAt: prop.subscription.trialEndsAt
                          ? prop.subscription.trialEndsAt.toISOString()
                          : null,
                      notes: prop.subscription.notes,
                  }
                : null,
        })),
        recentLogs: auditLogs.map((log) => ({
            id: log.id,
            action: log.action,
            category: log.category,
            actorEmail: log.actorEmail,
            createdAt: log.createdAt.toISOString(),
            metadata: log.metadata,
        })),
    };
}

/**
 * Toggles an Owner account suspension status.
 */
export async function toggleOwnerSuspensionAction(
    ownerId: string,
    suspend: boolean,
    reason?: string
): Promise<{ success: boolean; error?: string }> {
    const session = await requireSuperAdmin();

    try {
        const user = await prisma.user.findUnique({
            where: { id: ownerId },
            include: { ownedProperties: { select: { id: true } } },
        });

        if (!user) {
            return { success: false, error: "Akun owner tidak ditemukan." };
        }

        await prisma.$transaction(async (tx) => {
            // Update User status
            await tx.user.update({
                where: { id: ownerId },
                data: { isSuspended: suspend },
            });

            // Update associated subscriptions
            const propertyIds = user.ownedProperties.map((p) => p.id);
            if (propertyIds.length > 0) {
                await tx.saaSSubscription.updateMany({
                    where: { propertyId: { in: propertyIds } },
                    data: {
                        status: suspend ? SubscriptionStatus.SUSPENDED : SubscriptionStatus.ACTIVE,
                        suspendedAt: suspend ? new Date() : null,
                    },
                });
            }
        });

        await logAuditEvent({
            actorId: session.id,
            actorEmail: session.email,
            actorRole: session.role,
            action: suspend ? "OWNER_SUSPENDED" : "OWNER_ACTIVATED",
            category: "OWNER",
            targetType: "User",
            targetId: ownerId,
            metadata: {
                previousSuspendedState: user.isSuspended,
                newSuspendedState: suspend,
                reason: reason || "Aksi Super Admin Console",
            },
        });

        revalidatePath("/super-admin/owners");
        revalidatePath(`/super-admin/owners/${ownerId}`);
        revalidatePath("/super-admin/subscriptions");

        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || "Gagal mengubah status penangguhan akun.",
        };
    }
}

/**
 * Resets an owner's password manually from the Super Admin console.
 */
export async function resetOwnerPasswordAction(
    ownerId: string,
    newPassword: string
): Promise<{ success: boolean; error?: string }> {
    const session = await requireSuperAdmin();

    try {
        if (!newPassword || newPassword.length < 6) {
            return { success: false, error: "Password baru minimal 6 karakter." };
        }

        const passwordHash = await bcryptjs.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: ownerId },
            data: {
                passwordHash,
                forceReset: false,
                passwordChangedAt: new Date(),
            },
        });

        await logAuditEvent({
            actorId: session.id,
            actorEmail: session.email,
            actorRole: session.role,
            action: "OWNER_PASSWORD_RESET",
            category: "SECURITY",
            targetType: "User",
            targetId: ownerId,
        });

        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || "Gagal mereset password akun owner.",
        };
    }
}
