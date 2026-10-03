import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, apiError } from "@/lib/api-response";
import { executePasswordReset } from "@/features/auth/forgot-password-service";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token tidak valid"),
  newPassword: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message || "Input tidak valid",
        400,
        parsed.error.format()
      );
    }

    const { token, newPassword } = parsed.data;
    await executePasswordReset(token, newPassword);

    return apiSuccess({
      message: "Kata sandi Anda berhasil diperbarui. Silakan login kembali dengan kata sandi baru.",
    });
  } catch (error: any) {
    console.error("[API_AUTH_RESET_PASSWORD_ERROR]", error);
    return apiError(
      "RESET_PASSWORD_FAILED",
      error.message || "Gagal memperbarui kata sandi",
      400
    );
  }
}
