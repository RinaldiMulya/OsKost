import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { z } from "zod";
import bcryptjs from "bcryptjs";
import {
  encryptPaymentKey,
  decryptPaymentKey,
  maskApiKey,
} from "@/lib/security/payment-crypto";

// ============================================
// Types
// ============================================

export interface AdminProfile {
    id: string;
    email: string | null;
    phoneNumber: string | null;
}

// ============================================
// Zod Schemas
// ============================================

export const profileSchema = z.object({
    email: z.string().email("Format email tidak valid"),
});

export const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
        newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
        confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Password baru dan konfirmasi tidak cocok",
        path: ["confirmPassword"],
    });

// ============================================
// READ
// ============================================

export const getAdminProfile = cache(async (
    userId: string
): Promise<AdminProfile | null> => {
    const user = await prisma.user.findUnique({
        where: { id: userId, role: "ADMIN" },
        select: {
            id: true,
            email: true,
            phoneNumber: true,
        },
    });
    return user;
});

// ============================================
// UPDATE PROFILE
// ============================================

export async function updateAdminProfile(
    userId: string,
    data: { email: string }
) {
    return prisma.user.update({
        where: { id: userId },
        data: { email: data.email },
    });
}

// ============================================
// UPDATE PASSWORD
// ============================================

export async function updateAdminPassword(
    userId: string,
    currentPassword: string,
    newPassword: string
) {
    // Fetch current hash
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true },
    });

    if (!user) {
        throw new Error("Admin tidak ditemukan.");
    }

    // Verify current password
    const isValid = await bcryptjs.compare(currentPassword, user.passwordHash);
    if (!isValid) {
        throw new Error("Password saat ini salah.");
    }

    // Hash and save new password
    const hashedPassword = await bcryptjs.hash(newPassword, 12);
    return prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashedPassword },
    });
}

// ============================================
// PROPERTY PROFILE MANAGEMENT
// ============================================

export interface PropertyProfile {
    id: string;
    name: string;
    address: string;
    features?: Record<string, unknown> | null;
    bankName?: string | null;
    bankAccountNumber?: string | null;
    bankAccountHolder?: string | null;
    bankAccountInfo?: string | null;
    qrisImageUrl?: string | null;
    midtransMerchantId?: string | null;
    midtransClientKey?: string | null;
    isMidtransActive?: boolean;
    hasMidtransServerKey?: boolean;
    maskedMidtransServerKey?: string | null;
    subscription?: {
        planTier: string;
        status: string;
        maxRooms: number;
        monthlyPrice: number;
        currentPeriodEnd?: Date | null;
        trialEndsAt?: Date | null;
    } | null;
    roomsCount?: number;
}

export async function getPropertyProfile(): Promise<PropertyProfile | null> {
    const property = await prisma.property.findFirst({
        select: {
            id: true,
            name: true,
            address: true,
            features: true,
            bankName: true,
            bankAccountNumber: true,
            bankAccountHolder: true,
            bankAccountInfo: true,
            qrisImageUrl: true,
            midtransMerchantId: true,
            midtransServerKey: true,
            midtransClientKey: true,
            isMidtransActive: true,
            subscription: {
                select: {
                    planTier: true,
                    status: true,
                    maxRooms: true,
                    monthlyPrice: true,
                    currentPeriodEnd: true,
                    trialEndsAt: true,
                },
            },
            _count: {
                select: {
                    rooms: true,
                },
            },
        },
    });

    if (!property) return null;

    let maskedMidtransServerKey: string | null = null;
    if (property.midtransServerKey) {
        try {
            const plain = decryptPaymentKey(property.midtransServerKey, property.id);
            maskedMidtransServerKey = maskApiKey(plain);
        } catch {
            maskedMidtransServerKey = "••••••••••••";
        }
    }

    return {
        id: property.id,
        name: property.name,
        address: property.address,
        features: property.features as Record<string, unknown> | null,
        bankName: property.bankName,
        bankAccountNumber: property.bankAccountNumber,
        bankAccountHolder: property.bankAccountHolder,
        bankAccountInfo: property.bankAccountInfo,
        qrisImageUrl: property.qrisImageUrl,
        midtransMerchantId: property.midtransMerchantId,
        midtransClientKey: property.midtransClientKey,
        isMidtransActive: property.isMidtransActive,
        hasMidtransServerKey: !!property.midtransServerKey,
        maskedMidtransServerKey,
        subscription: property.subscription,
        roomsCount: property._count.rooms,
    };
}

export async function updatePropertyProfile(
    id: string,
    name: string,
    address: string,
    features?: Record<string, unknown>
) {
    return prisma.property.update({
        where: { id },
        data: {
            name,
            address,
            ...(features !== undefined ? { features: features as object } : {}),
        },
    });
}

export async function updatePropertyBankAccount(
    id: string,
    bankName: string,
    bankAccountNumber: string,
    bankAccountHolder: string
) {
    return prisma.property.update({
        where: { id },
        data: {
            bankName,
            bankAccountNumber,
            bankAccountHolder,
        },
    });
}

export interface UpdatePaymentSettingsInput {
    bankName?: string | null;
    bankAccountNumber?: string | null;
    bankAccountHolder?: string | null;
    bankAccountInfo?: string | null;
    qrisImageUrl?: string | null;
    midtransMerchantId?: string | null;
    midtransClientKey?: string | null;
    isMidtransActive?: boolean;
    newMidtransServerKey?: string | null;
}

export async function updatePropertyPaymentSettings(
    id: string,
    data: UpdatePaymentSettingsInput
) {
    let midtransServerKeyToSave: string | undefined = undefined;
    if (data.newMidtransServerKey && data.newMidtransServerKey.trim()) {
        midtransServerKeyToSave = encryptPaymentKey(data.newMidtransServerKey.trim(), id);
    }

    return prisma.property.update({
        where: { id },
        data: {
            bankName: data.bankName,
            bankAccountNumber: data.bankAccountNumber,
            bankAccountHolder: data.bankAccountHolder,
            bankAccountInfo: data.bankAccountInfo,
            qrisImageUrl: data.qrisImageUrl,
            midtransMerchantId: data.midtransMerchantId,
            midtransClientKey: data.midtransClientKey,
            isMidtransActive: data.isMidtransActive ?? false,
            ...(midtransServerKeyToSave ? { midtransServerKey: midtransServerKeyToSave } : {}),
        },
    });
}

// ============================================
// NOTIFICATION & SYSTEM STATS
// ============================================

export interface NotificationSystemStats {
    totalSent: number;
    totalUnread: number;
    totalPushSubscriptions: number;
}

export async function getNotificationStats(): Promise<NotificationSystemStats> {
    const [totalSent, totalUnread, totalPushSubscriptions] = await Promise.all([
        prisma.notification.count(),
        prisma.notification.count({ where: { isRead: false } }),
        prisma.pushSubscription.count(),
    ]);

    return {
        totalSent,
        totalUnread,
        totalPushSubscriptions,
    };
}

