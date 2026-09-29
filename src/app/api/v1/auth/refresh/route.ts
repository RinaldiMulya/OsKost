import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import {
    signAccessToken,
    generateRefreshToken,
    hashToken,
    REFRESH_TOKEN_EXPIRY_DAYS,
} from "@/lib/jwt";

const refreshSchema = z.object({
    refreshToken: z.string().min(1, "Refresh token wajib disertakan"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null);
        const parsed = refreshSchema.safeParse(body);

        if (!parsed.success) {
            return apiError(
                "VALIDATION_ERROR",
                "Format refresh token tidak valid",
                400
            );
        }

        const { refreshToken: rawToken } = parsed.data;
        const incomingHash = hashToken(rawToken);

        const storedToken = await prisma.refreshToken.findUnique({
            where: { tokenHash: incomingHash },
            include: {
                user: {
                    include: {
                        leases: {
                            where: { isActive: true },
                            select: { propertyId: true },
                            take: 1,
                        },
                        ownedProperties: {
                            select: { id: true },
                            take: 1,
                        },
                    },
                },
            },
        });

        if (!storedToken) {
            return apiError(
                "INVALID_REFRESH_TOKEN",
                "Sesi login tidak valid. Silakan login kembali.",
                401
            );
        }

        // Cek apakah token sudah pernah dicabut atau kadaluarsa
        if (storedToken.revokedAt || storedToken.expiresAt < new Date()) {
            return apiError(
                "EXPIRED_REFRESH_TOKEN",
                "Sesi Anda telah berakhir. Silakan login kembali.",
                401
            );
        }

        const user = storedToken.user;
        if (!user || !user.isActive || user.isSuspended) {
            return apiError(
                "ACCOUNT_SUSPENDED",
                "Akun ditangguhkan atau tidak aktif.",
                403
            );
        }

        // Cabut token lama (Rotation)
        await prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revokedAt: new Date() },
        });

        // Tentukan propertyId
        const propertyId =
            user.leases[0]?.propertyId || user.ownedProperties[0]?.id || null;

        // Terbitkan Access Token baru (15m) & Refresh Token baru (30d)
        const newAccessToken = await signAccessToken({
            userId: user.id,
            role: user.role,
            propertyId,
        });

        const newRawRefreshToken = generateRefreshToken();
        const newTokenHash = hashToken(newRawRefreshToken);
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

        await prisma.refreshToken.create({
            data: {
                tokenHash: newTokenHash,
                userId: user.id,
                expiresAt,
            },
        });

        return apiSuccess({
            accessToken: newAccessToken,
            refreshToken: newRawRefreshToken,
        });
    } catch (error) {
        console.error("[API_AUTH_REFRESH_ERROR]", error);
        return apiError("INTERNAL_ERROR", "Gagal memperbarui sesi login", 500);
    }
}
