import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import { handleCorsPreflight } from "./lib/cors";

const { auth } = NextAuth(authConfig);

// Simple in-memory rate limiter store
const rateLimitStore = new Map<string, number[]>();
const LIMIT = 5;
const WINDOW_MS = 60 * 1000;

export default auth((req) => {
    // 1. Tangani Preflight OPTIONS untuk seluruh REST API (/api/*)
    if (req.nextUrl.pathname.startsWith("/api/")) {
        if (req.method === "OPTIONS") {
            const preflightResponse = handleCorsPreflight(req);
            if (preflightResponse) return preflightResponse;
            return new NextResponse(null, { status: 204 });
        }
    }

    // 2. Terapkan rate limiting pada auth endpoints
    const isAuthAttempt =
        (req.method === "POST" && req.nextUrl.pathname === "/login") ||
        (req.method === "POST" && req.nextUrl.pathname === "/api/v1/auth/token") ||
        (req.method === "POST" && req.nextUrl.pathname === "/api/v1/auth/forgot-password");

    if (isAuthAttempt) {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || (req as { ip?: string }).ip || "unknown";
        const now = Date.now();
        
        let timestamps = rateLimitStore.get(ip) || [];
        timestamps = timestamps.filter((t) => now - t < WINDOW_MS);
        
        if (timestamps.length >= LIMIT) {
            console.warn(`[rate-limit] IP ${ip} melebihi batas ${LIMIT} request/menit pada ${req.nextUrl.pathname}`);
            const isApi = req.nextUrl.pathname.startsWith("/api/");
            return new NextResponse(
                JSON.stringify({ 
                    success: false, 
                    error: isApi ? "TOO_MANY_REQUESTS" : "Terlalu banyak percobaan login. Silakan coba lagi nanti dalam semenit.",
                    message: "Terlalu banyak percobaan login. Silakan coba lagi nanti dalam semenit."
                }),
                { 
                    status: 429, 
                    headers: { 
                        "Content-Type": "application/json",
                        ...(isApi ? { "Access-Control-Allow-Origin": "*" } : {})
                    } 
                }
            );
        }
        
        timestamps.push(now);
        rateLimitStore.set(ip, timestamps);
    }

    if (req.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.next();
    }

    // 3. Subdomain Edge Rewriting (app.oskost.id, pulo-jahe.oskost.id, dsb.)
    const host = req.headers.get("host") || "";
    const hostname = host.replace(/:\d+$/, "").toLowerCase();

    const rootDomains = ["oskost.id", "oskost.my.id", "localhost", "127.0.0.1"];
    const isRootDomain =
        rootDomains.some(
            (domain) => hostname === domain || hostname === `www.${domain}`
        ) ||
        hostname.endsWith(".trycloudflare.com") ||
        hostname.endsWith(".ngrok-free.app") ||
        hostname.endsWith(".loca.lt");

    if (!isRootDomain) {
        const subdomain = hostname.split(".")[0];

        // A. app.oskost.id -> rewrite ke dashboard /admin
        if (subdomain === "app") {
            if (req.nextUrl.pathname === "/") {
                return NextResponse.rewrite(new URL("/admin", req.url));
            }
            return NextResponse.next();
        }

        // B. api.oskost.id -> biarkan REST API (/api/*) berjalan normal
        if (subdomain === "api") {
            return NextResponse.next();
        }

        // C. Subdomain Properti Mandiri: [slug].oskost.id -> rewrite ke /p/[slug]
        const reservedSubdomains = [
            "www",
            "admin",
            "super-admin",
            "docs",
            "mail",
            "cdn",
            "status",
            "assets",
        ];

        if (!reservedSubdomains.includes(subdomain)) {
            // A. Root request di subdomain -> rewrite ke microsite properti /p/[slug]
            if (req.nextUrl.pathname === "/") {
                return NextResponse.rewrite(new URL(`/p/${subdomain}`, req.url));
            }

            // B. Jika request sudah berawalan /p/[slug], biarkan lewat
            if (req.nextUrl.pathname.startsWith(`/p/${subdomain}`)) {
                return NextResponse.next();
            }

            // C. Rute Katalog Kamar di subdomain -> rewrite ke microsite kamar (/p/[slug]/kamar)
            if (req.nextUrl.pathname === "/kamar" || req.nextUrl.pathname.startsWith("/kamar/")) {
                const search = req.nextUrl.search;
                return NextResponse.rewrite(new URL(`/p/${subdomain}/kamar${search}`, req.url));
            }

            // D. Rute Kamar Detail (/rooms/:id), Auth (/login), Admin, Dashboard, API -> biarkan lewat langsung
            if (
                req.nextUrl.pathname.startsWith("/rooms") ||
                req.nextUrl.pathname.startsWith("/api") ||
                req.nextUrl.pathname.startsWith("/login") ||
                req.nextUrl.pathname.startsWith("/admin") ||
                req.nextUrl.pathname.startsWith("/super-admin") ||
                req.nextUrl.pathname.startsWith("/dashboard")
            ) {
                return NextResponse.next();
            }

            // E. Fallback untuk subpath lain
            return NextResponse.rewrite(new URL(`/p/${subdomain}${req.nextUrl.pathname}`, req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    // Match all routes except static assets, service worker, images
    matcher: ["/((?!_next/static|_next/image|images|favicon.ico|sw\\.js|manifest\\.json|offline\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|json)$).*)"],
};
