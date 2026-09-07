"use server";

import {
  requestResetSchema,
  resetPasswordSchema,
  requestPasswordReset,
  executePasswordReset,
} from "./forgot-password-service";

export interface ActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Action untuk mengirim permintaan reset password (magic link via email).
 */
export async function requestPasswordResetAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  try {
    const raw = Object.fromEntries(formData);
    const parsed = requestResetSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0].message,
      };
    }

    const result = await requestPasswordReset(parsed.data.identifier);

    return {
      success: true,
      message: `Link reset password berhasil dikirim ke email ${result.email}. Silakan cek kotak masuk atau folder spam (berlaku 5 menit).`,
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "Terjadi kesalahan saat memproses permintaan reset password.",
    };
  }
}

/**
 * Action untuk mengeksekusi reset password baru.
 */
export async function resetPasswordAction(
  _prevState: ActionResult | undefined,
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

    await executePasswordReset(parsed.data.token, parsed.data.newPassword);

    return {
      success: true,
      message: "Password Anda berhasil diperbarui! Silakan masuk dengan password baru Anda.",
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "Terjadi kesalahan saat memperbarui password.",
    };
  }
}
