import { NextRequest } from "next/server";
import { z } from "zod";
import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/api-auth";

const changePasswordSchema = z.object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, "Kata sandi baru minimal 8 karakter"),
});

export async function POST(req: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(req);
        if (!authUser) {
            return apiError("UNAUTHORIZED", "Sesi login tidak valid", 401);
        }

        const body = await req.json().catch(() => null);
        const parsed = changePasswordSchema.safeParse(body);

        if (!parsed.success) {
            return apiError(
                "VALIDATION_ERROR",
                parsed.error.issues[0]?.message || "Format input tidak valid",
                400,
                parsed.error.format()
            );
        }

        const { currentPassword, newPassword } = parsed.data;

        const user = await prisma.user.findUnique({
            where: { id: authUser.id },
            select: { id: true, passwordHash: true, forceReset: true },
        });

        if (!user) {
            return apiError("NOT_FOUND", "Pengguna tidak ditemukan", 404);
        }

        // Jika forceReset tidak aktif, verifikasi kata sandi lama wajib benar
        if (!user.forceReset || currentPassword) {
            if (!currentPassword) {
                return apiError(
                    "VALIDATION_ERROR",
                    "Kata sandi saat ini wajib diisi",
                    400
                );
            }
            const isMatch = await bcryptjs.compare(currentPassword, user.passwordHash);
            if (!isMatch) {
                return apiError(
                    "INVALID_PASSWORD",
                    "Kata sandi saat ini tidak sesuai",
                    400
                );
            }
        }

        const newHashed = await bcryptjs.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: newHashed,
                forceReset: false,
                passwordChangedAt: new Date(),
            },
        });

        return apiSuccess({
            success: true,
            message: "Kata sandi berhasil diperbarui",
        });
    } catch (error) {
        console.error("[API_ME_PASSWORD_ERROR]", error);
        return apiError("INTERNAL_ERROR", "Gagal memperbarui kata sandi", 500);
    }
}
