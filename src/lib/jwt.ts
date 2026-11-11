import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto";

export interface AccessTokenPayload {
    userId: string;
    role: string;
    propertyId?: string | null;
    [key: string]: unknown;
}

export const REFRESH_TOKEN_EXPIRY_DAYS = 30;

function getJwtSecretKey(): Uint8Array {
    const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET;
    if (!secret) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("FATAL: JWT_SECRET or AUTH_SECRET must be defined in production environment!");
        }
        console.warn("[SECURITY WARN] JWT_SECRET is unset. Using temporary development fallback.");
        return new TextEncoder().encode("oskost-secure-jwt-secret-for-mobile-auth-token-rotation-32-bytes");
    }
    return new TextEncoder().encode(secret);
}

/**
 * Membuat JWT Access Token berdurasi pendek (15 Menit) untuk otentikasi Mobile API
 */
export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
    return new SignJWT({
        userId: payload.userId,
        role: payload.role,
        propertyId: payload.propertyId ?? null,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(getJwtSecretKey());
}

/**
 * Memverifikasi keaslian dan masa berlaku JWT Access Token
 */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getJwtSecretKey());
        return payload as unknown as AccessTokenPayload;
    } catch {
        return null;
    }
}

/**
 * Menghasilkan random string kriptografi aman untuk Refresh Token
 */
export function generateRefreshToken(): string {
    return crypto.randomBytes(40).toString("hex");
}

/**
 * Melakukan hashing SHA-256 pada Refresh Token mentah sebelum disimpan ke Database
 */
export function hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
}
