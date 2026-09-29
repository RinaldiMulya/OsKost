import { verifyAccessToken } from "./jwt";
import { prisma } from "./db";
import { UserRole } from "@prisma/client";

export interface AuthenticatedUser {
    id: string;
    email: string | null;
    phoneNumber: string | null;
    role: UserRole;
    forceReset: boolean;
    propertyId: string | null;
}

/**
 * Membaca header `Authorization: Bearer <token>`, memverifikasi keaslian JWT,
 * dan memastikan status user aktif (tidak disuspend) di database.
 */
export async function getAuthenticatedUser(req: Request): Promise<AuthenticatedUser | null> {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.substring(7).trim();
    if (!token) return null;

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.userId) return null;

    // Validasi data user dari database
    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
            id: true,
            email: true,
            phoneNumber: true,
            role: true,
            forceReset: true,
            isActive: true,
            isSuspended: true,
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
    });

    if (!user || !user.isActive || user.isSuspended) {
        return null;
    }

    // Resolusi propertyId otomatis berdasarkan role
    const propertyId =
        user.role === "TENANT"
            ? user.leases[0]?.propertyId || null
            : user.ownedProperties[0]?.id || null;

    return {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        forceReset: user.forceReset,
        propertyId,
    };
}
