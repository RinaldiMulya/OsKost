import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, apiError } from "@/lib/api-response";
import { requestPasswordReset } from "@/features/auth/forgot-password-service";

const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Nomor WhatsApp atau email wajib diisi"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message || "Input tidak valid",
        400,
        parsed.error.format()
      );
    }

    const { identifier } = parsed.data;
    const result = await requestPasswordReset(identifier.trim());

    // Masking email untuk privasi (contoh: b***i@gmail.com)
    const emailStr = result.email || "";
    const parts = emailStr.split("@");
    let maskedEmail = emailStr;
    if (parts.length === 2) {
      const u = parts[0];
      const maskedUser = u.length > 2 ? `${u[0]}***${u[u.length - 1]}` : `${u[0]}***`;
      maskedEmail = `${maskedUser}@${parts[1]}`;
    }

    return apiSuccess({
      message: `Tautan reset password telah dikirim ke email terdaftar (${maskedEmail}).`,
      email: maskedEmail,
      remainingAttempts: result.remainingAttempts,
    });
  } catch (error: any) {
    console.error("[API_AUTH_FORGOT_PASSWORD_ERROR]", error);
    return apiError(
      "FORGOT_PASSWORD_FAILED",
      error.message || "Gagal memproses permintaan reset password",
      400
    );
  }
}
