import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/api-auth";

const pushSubscriptionSchema = z.object({
    endpoint: z.string().min(1, "Endpoint push wajib diisi"),
    p256dh: z.string().default(""),
    auth: z.string().default(""),
    platform: z.enum(["web", "android", "ios"]).default("android"),
    deviceId: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(req);
        if (!authUser) {
            return apiError("UNAUTHORIZED", "Sesi login tidak valid", 401);
        }

        const body = await req.json().catch(() => null);
        const parsed = pushSubscriptionSchema.safeParse(body);

        if (!parsed.success) {
            return apiError(
                "VALIDATION_ERROR",
                parsed.error.issues[0]?.message || "Format data langganan tidak valid",
                400,
                parsed.error.format()
            );
        }

        const { endpoint, p256dh, auth, platform, deviceId } = parsed.data;

        const subscription = await prisma.pushSubscription.upsert({
            where: { endpoint },
            update: {
                p256dh,
                auth,
                platform,
                deviceId: deviceId || null,
                userId: authUser.id,
            },
            create: {
                endpoint,
                p256dh,
                auth,
                platform,
                deviceId: deviceId || null,
                userId: authUser.id,
            },
        });

        return apiSuccess({
            id: subscription.id,
            platform: subscription.platform,
            registered: true,
            message: "Perangkat berhasil didaftarkan untuk notifikasi push",
        });
    } catch (error) {
        console.error("[API_PUSH_SUBSCRIPTION_ERROR]", error);
        return apiError("INTERNAL_ERROR", "Gagal mendaftarkan notifikasi push", 500);
    }
}
