"use server";

import { revalidatePath, revalidateTag, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { requireOwnerSession } from "@/lib/auth-guard";
import {
    tenantFormSchema,
    checkInFormSchema,
    resetPasswordSchema,
    createTenant,
    updateTenant,
    checkoutTenant,
    resetTenantPassword,
    markInvoicePaid,
    rejectInvoicePayment,
    sendBillingReminder,
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
        await requireOwnerSession();

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
        revalidateTag(CACHE_TAGS.DASHBOARD_STATS, "default");
        revalidateTag(CACHE_TAGS.ADMIN_TENANTS, "default");
        revalidateTag(CACHE_TAGS.ADMIN_ROOMS, "default");
        revalidateTag(CACHE_TAGS.ADMIN_ROOM_STATS, "default");
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
        await requireOwnerSession();

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
        revalidatePath("/admin/rooms");
        revalidatePath("/admin");
        revalidatePath(`/admin/tenants/${userId}`);
        updateTag(CACHE_TAGS.ADMIN_TENANTS);
        updateTag(CACHE_TAGS.ADMIN_ROOMS);
        updateTag(CACHE_TAGS.ADMIN_ROOM_STATS);
        updateTag(CACHE_TAGS.DASHBOARD_STATS);
        updateTag(CACHE_TAGS.adminTenantDetail(userId));
        updateTag(CACHE_TAGS.tenantDashboard(userId));
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
// CHECK-OUT (Soft check-out wrapper)
// ============================================

export async function checkoutTenantAction(
    _prevState: ActionResult | null,
    formData: FormData
): Promise<ActionResult> {
    try {
        await requireOwnerSession();

        const userId = formData.get("id") as string;

        if (!userId) {
            return { success: false, error: "User ID is required." };
        }

        await checkoutTenant(userId, "Checked out via Admin Flow");

        revalidatePath("/admin/tenants");
        revalidatePath("/admin");
        revalidatePath("/dashboard");
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
        return { success: false, error: "Terjadi kesalahan saat memproses check-out." };
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
        await requireOwnerSession();

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
        const user = await requireOwnerSession();

        if (!invoiceId) {
            return { success: false, error: "Invoice ID is required" };
        }

        const result = await markInvoicePaid(invoiceId, user.id);

        revalidatePath("/admin/tenants");
        revalidatePath("/admin");
        revalidatePath("/admin/billing");
        updateTag(CACHE_TAGS.DASHBOARD_STATS);
        updateTag(CACHE_TAGS.ADMIN_TENANTS);
        
        // Also invalidate tenant-specific caches
        const userId = result?.lease?.userId;
        if (userId) {
            revalidatePath("/dashboard");
            updateTag(CACHE_TAGS.tenantDashboard(userId));
            updateTag(CACHE_TAGS.tenantInvoices(userId));
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
        const user = await requireOwnerSession();

        if (!invoiceId) {
            return { success: false, error: "Invoice ID is required" };
        }
        if (!reason) {
            return { success: false, error: "Alasan penolakan wajib diisi" };
        }

        const result = await rejectInvoicePayment(invoiceId, reason, user.id);

        revalidatePath("/admin/tenants");
        revalidatePath("/admin");
        revalidatePath("/admin/billing");
        updateTag(CACHE_TAGS.DASHBOARD_STATS);
        updateTag(CACHE_TAGS.ADMIN_TENANTS);

        // Also invalidate tenant-specific caches
        const userId = result?.lease?.userId;
        if (userId) {
            revalidatePath("/dashboard");
            updateTag(CACHE_TAGS.tenantDashboard(userId));
            updateTag(CACHE_TAGS.tenantInvoices(userId));
        }

        return { success: true };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Terjadi kesalahan saat menolak pembayaran." };
    }
}

// ============================================
// BILLING REMINDER (Kirim Tagihan ke Tenant)
// ============================================

export async function sendBillingReminderAction(userId: string): Promise<ActionResult & { tenantName?: string }> {
    try {
        await requireOwnerSession();

        if (!userId) {
            return { success: false, error: "User ID is required" };
        }

        const result = await sendBillingReminder(userId);

        return {
            success: true,
            tenantName: result.tenantName,
        };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Terjadi kesalahan saat mengirim reminder tagihan." };
    }
}
