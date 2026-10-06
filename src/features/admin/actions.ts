"use server";

import { auth } from "@/auth";
import {
    profileSchema,
    passwordSchema,
    updateAdminProfile,
    updateAdminPassword,
} from "./admin-service";

// ============================================
// Types
// ============================================

export interface ActionResult {
    success: boolean;
    error?: string;
    message?: string;
}

// ============================================
// Helper: Get current admin ID
// ============================================

async function getAdminId(): Promise<string> {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }
    return session.user.id;
}

// ============================================
// UPDATE PROFILE
// ============================================

export async function updateProfileAction(
    _prevState: ActionResult | null,
    formData: FormData
): Promise<ActionResult> {
    try {
        const adminId = await getAdminId();
        const raw = Object.fromEntries(formData);
        const parsed = profileSchema.safeParse(raw);

        if (!parsed.success) {
            return {
                success: false,
                error: parsed.error.issues[0].message,
            };
        }

        await updateAdminProfile(adminId, { email: parsed.data.email });

        return { success: true, message: "Profil berhasil diperbarui." };
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("Unique constraint")) {
                return { success: false, error: "Email sudah digunakan." };
            }
            return { success: false, error: error.message };
        }
        return {
            success: false,
            error: "Terjadi kesalahan saat memperbarui profil.",
        };
    }
}

// ============================================
// CHANGE PASSWORD
// ============================================

export async function changePasswordAction(
    _prevState: ActionResult | null,
    formData: FormData
): Promise<ActionResult> {
    try {
        const adminId = await getAdminId();
        const raw = Object.fromEntries(formData);
        const parsed = passwordSchema.safeParse(raw);

        if (!parsed.success) {
            return {
                success: false,
                error: parsed.error.issues[0].message,
            };
        }

        await updateAdminPassword(
            adminId,
            parsed.data.currentPassword,
            parsed.data.newPassword
        );

        return { success: true, message: "Password berhasil diubah." };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return {
            success: false,
            error: "Terjadi kesalahan saat mengubah password.",
        };
    }
}

// ============================================
// UPDATE PROPERTY PROFILE
// ============================================

export async function updatePropertyProfileAction(
    _prevState: ActionResult | null,
    formData: FormData
): Promise<ActionResult> {
    try {
        const id = formData.get("id") as string;
        const name = formData.get("name") as string;
        const address = formData.get("address") as string;
        const hasTechnician = formData.get("hasTechnician") === "true" || formData.get("hasTechnician") === "on";

        if (!id || !name || !address) {
            return { success: false, error: "Semua data wajib diisi." };
        }

        const { updatePropertyProfile, getPropertyProfile } = await import("./admin-service");
        const existing = await getPropertyProfile();
        const existingFeatures = (existing?.features as Record<string, unknown>) || {};

        await updatePropertyProfile(id, name, address, {
            ...existingFeatures,
            hasTechnician,
        });

        const { revalidatePath, updateTag } = await import("next/cache");
        const { CACHE_TAGS } = await import("@/lib/cache-tags");

        revalidatePath("/admin/settings");
        revalidatePath("/"); // Landing page
        updateTag(CACHE_TAGS.ROOMS_LANDING);
        updateTag(CACHE_TAGS.ADMIN_ROOMS);
        updateTag(CACHE_TAGS.DASHBOARD_STATS);

        return { success: true, message: "Profil properti berhasil diperbarui." };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return {
            success: false,
            error: "Terjadi kesalahan saat memperbarui profil properti.",
        };
    }
}

