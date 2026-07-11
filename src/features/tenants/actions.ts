"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { redirect } from "next/navigation";
import {
    tenantFormSchema,
    checkInFormSchema,
    resetPasswordSchema,
    createTenant,
    updateTenant,
    deleteTenant,
    resetTenantPassword,
    markInvoicePaid,
    rejectInvoicePayment,
} from "./tenant-service";
import { z } from "zod";

// ============================================
// Types
// ============================================

export interface ActionResult {
    success: boolean;
    error?: string;
}

// ============================================
// CREATE (Check-in Tenant)
// ============================================

export async function createTenantAction(
    _prevState: ActionResult | null,
    formData: FormData
): Promise<ActionResult> {
    try {
        const raw = Object.fromEntries(formData);
        const parsed = checkInFormSchema.safeParse(raw);

        if (!parsed.success) {
            return {
                success: false,
                error: parsed.error.issues[0].message,
            };
        }

        await createTenant({
            fullName: parsed.data.fullName,
            phoneNumber: parsed.data.phoneNumber,
            email: parsed.data.email || undefined,
            ktpNumber: parsed.data.ktpNumber || undefined,
            ktpPhotoUrl: parsed.data.ktpPhotoUrl || undefined,
            address: parsed.data.address || undefined,
            emergencyContactName: parsed.data.emergencyContactName || undefined,
            emergencyContactNumber: parsed.data.emergencyContactNumber || undefined,
            roomId: parsed.data.roomId,
            startDate: new Date(parsed.data.startDate),
            endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
            deposit: parsed.data.deposit,
            rentAmount: parsed.data.rentAmount,
            utilityAmount: parsed.data.utilityAmount,
            otherAmount: parsed.data.otherAmount,
        });

        revalidatePath("/admin/tenants");
        revalidatePath("/admin");
        updateTag(CACHE_TAGS.DASHBOARD_STATS);
        updateTag(CACHE_TAGS.ADMIN_TENANTS);
        updateTag(CACHE_TAGS.ADMIN_ROOMS);
        updateTag(CACHE_TAGS.ADMIN_ROOM_STATS);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("Unique constraint")) {
                return {
                    success: false,
                    error: "Nomor HP atau Email sudah terdaftar.",
                };
            }
            return { success: false, error: error.message };
        }
        return { success: false, error: "Terjadi kesalahan saat mendaftarkan penghuni." };
    }

    redirect("/admin/tenants");
}

// ============================================
// UPDATE
// ============================================

const editSchema = tenantFormSchema.extend({
    roomId: z.string().optional().or(z.literal("")),
});

export async function updateTenantAction(
    _prevState: ActionResult | null,
    formData: FormData
): Promise<ActionResult> {
    try {
        const raw = Object.fromEntries(formData);
        const userId = raw.id as string;

        if (!userId) {
            return { success: false, error: "User ID is required." };
        }

        const parsed = editSchema.safeParse(raw);

        if (!parsed.success) {
            return {
                success: false,
                error: parsed.error.issues[0].message,
            };
        }

        await updateTenant(userId, {
            fullName: parsed.data.fullName,
            phoneNumber: parsed.data.phoneNumber,
            email: parsed.data.email || undefined,
            ktpNumber: parsed.data.ktpNumber || undefined,
            ktpPhotoUrl: parsed.data.ktpPhotoUrl || undefined,
            address: parsed.data.address || undefined,
            emergencyContactName: parsed.data.emergencyContactName || undefined,
            emergencyContactNumber: parsed.data.emergencyContactNumber || undefined,
            roomId: parsed.data.roomId || undefined,
        });

        revalidatePath("/admin/tenants");
        updateTag(CACHE_TAGS.ADMIN_TENANTS);
        // Also invalidate the specific tenant detail cache
        const tenantId = raw.id as string;
        if (tenantId) {
            updateTag(CACHE_TAGS.adminTenantDetail(tenantId));
            // Invalidate PWA cache so tenant sees updated data
            updateTag(CACHE_TAGS.tenantDashboard(tenantId));
        }
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("Unique constraint")) {
                return {
                    success: false,
                    error: "Nomor HP atau Email sudah digunakan oleh penghuni lain.",
                };
            }
            return { success: false, error: error.message };
        }
        return { success: false, error: "Terjadi kesalahan saat mengupdate data penghuni." };
    }

    redirect("/admin/tenants");
}

// ============================================
// DELETE (Soft check-out wrapper)
// ============================================

export async function deleteTenantAction(
    _prevState: ActionResult | null,
    formData: FormData
): Promise<ActionResult> {
    try {
        const userId = formData.get("id") as string;

        if (!userId) {
            return { success: false, error: "User ID is required." };
        }

        await deleteTenant(userId);

        revalidatePath("/admin/tenants");
        revalidatePath("/admin");
        updateTag(CACHE_TAGS.DASHBOARD_STATS);
        updateTag(CACHE_TAGS.ADMIN_TENANTS);
        updateTag(CACHE_TAGS.ADMIN_ROOMS);
        updateTag(CACHE_TAGS.ADMIN_ROOM_STATS);
        // Invalidate the specific tenant's PWA cache
        if (userId) {
            updateTag(CACHE_TAGS.tenantDashboard(userId));
        }

        return { success: true };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Terjadi kesalahan saat menghapus penghuni." };
    }
}

// ============================================
// RESET PASSWORD
// ============================================

export async function resetTenantPasswordAction(
    _prevState: ActionResult | null,
    formData: FormData
): Promise<ActionResult> {
    try {
        const raw = Object.fromEntries(formData);
        const parsed = resetPasswordSchema.safeParse(raw);

        if (!parsed.success) {
            return {
                success: false,
                error: parsed.error.issues[0].message,
            };
        }

        await resetTenantPassword(parsed.data.userId, parsed.data.newPassword);

        return { success: true };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Terjadi kesalahan saat mereset password." };
    }
}

// ============================================
// INVOICE PAYMENT (Tandai Lunas)
// ============================================

export async function markInvoicePaidAction(invoiceId: string): Promise<ActionResult> {
    try {
        if (!invoiceId) {
            return { success: false, error: "Invoice ID is required" };
        }

        await markInvoicePaid(invoiceId);

        revalidatePath("/admin/tenants");
        revalidatePath("/admin");
        updateTag(CACHE_TAGS.DASHBOARD_STATS);
        updateTag(CACHE_TAGS.ADMIN_TENANTS);
        // Also invalidate tenant-specific caches
        if (invoiceId) {
            // We need to find the tenant userId from the invoice
            // For now, invalidate all tenant invoice caches via admin tenants tag
        }

        return { success: true };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Terjadi kesalahan saat menandai lunas." };
    }
}

export async function rejectInvoicePaymentAction(invoiceId: string, reason: string): Promise<ActionResult> {
    try {
        if (!invoiceId) {
            return { success: false, error: "Invoice ID is required" };
        }
        if (!reason) {
            return { success: false, error: "Alasan penolakan wajib diisi" };
        }

        await rejectInvoicePayment(invoiceId, reason);

        revalidatePath("/admin/tenants");
        revalidatePath("/admin");
        updateTag(CACHE_TAGS.DASHBOARD_STATS);
        updateTag(CACHE_TAGS.ADMIN_TENANTS);

        return { success: true };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Terjadi kesalahan saat menolak pembayaran." };
    }
}
