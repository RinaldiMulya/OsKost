import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(req);
        if (!authUser) {
            return apiError("UNAUTHORIZED", "Sesi login tidak valid", 401);
        }

        const body = await req.json().catch(() => ({}));
        const refreshToken = body.refreshToken;

        if (refreshToken) {
            await prisma.refreshToken.updateMany({
                where: {
                    userId: authUser.id,
                    tokenHash: refreshToken,
                },
                data: {
                    revokedAt: new Date(),
                },
            });
        } else {
            // Revoke all refresh tokens for this user
            await prisma.refreshToken.updateMany({
                where: {
                    userId: authUser.id,
                    revokedAt: null,
                },
                data: {
                    revokedAt: new Date(),
                },
            });
        }

        return apiSuccess({ message: "Berhasil logout" });
    } catch (error) {
        console.error("[API_LOGOUT_ERROR]", error);
        return apiError("INTERNAL_ERROR", "Gagal proses logout", 500);
    }
}
