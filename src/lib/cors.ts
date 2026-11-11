import { NextResponse } from "next/server";

/**
 * Daftar pola origin yang diizinkan untuk akses REST API (CORS)
 */
const ALLOWED_ORIGIN_PATTERNS = [
    // Domain Produksi & Staging OsKost (.my.id & .id)
    /^https:\/\/(?:[a-z0-9-]+\.)?oskost\.my\.id$/,
    /^https:\/\/(?:[a-z0-9-]+\.)?oskost\.id$/,

    // Vercel Preview Deployments
    /^https:\/\/(?:[a-z0-9-]+-)*[a-z0-9]+\.vercel\.app$/,

    // Development Environment
    /^http:\/\/localhost(?::\d+)?$/,
    /^http:\/\/127\.0\.0\.1(?::\d+)?$/,
];

/**
 * Memeriksa apakah origin pengirim diizinkan
 */
export function isAllowedOrigin(origin: string | null): boolean {
    if (!origin) return false;
    return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
}

/**
 * Mengambil header CORS berdasarkan request origin
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
    const allowed = isAllowedOrigin(origin);
    const allowOrigin = allowed && origin ? origin : "*";

    return {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Idempotency-Key",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400", // 24 jam cache preflight
    };
}

/**
 * Handler preflight request OPTIONS untuk route handlers Next.js
 */
export function handleCorsPreflight(request: Request): NextResponse | null {
    if (request.method === "OPTIONS") {
        const origin = request.headers.get("origin");
        return new NextResponse(null, {
            status: 204,
            headers: getCorsHeaders(origin),
        });
    }
    return null;
}

/**
 * Helper untuk menyisipkan header CORS ke NextResponse yang sudah ada
 */
export function withCors(response: NextResponse, request: Request): NextResponse {
    const origin = request.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);

    for (const [key, value] of Object.entries(corsHeaders)) {
        response.headers.set(key, value);
    }

    return response;
}
