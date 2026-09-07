import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// Simple in-memory rate limiter store
const rateLimitStore = new Map<string, number[]>();
const LIMIT = 5;
const WINDOW_MS = 60 * 1000;

export default auth((req) => {
    // Apply rate limiting to POST requests on /login
    if (req.method === "POST" && req.nextUrl.pathname === "/login") {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || (req as any).ip || "unknown";
        const now = Date.now();
        
        let timestamps = rateLimitStore.get(ip) || [];
        timestamps = timestamps.filter((t) => now - t < WINDOW_MS);
        
        if (timestamps.length >= LIMIT) {
            console.warn(`[rate-limit] IP ${ip} melebihi batas ${LIMIT} request/menit pada ${req.nextUrl.pathname}`);
            return new NextResponse(
                JSON.stringify({ success: false, error: "Terlalu banyak percobaan login. Silakan coba lagi nanti dalam semenit." }),
                { status: 429, headers: { "Content-Type": "application/json" } }
            );
        }
        
        timestamps.push(now);
        rateLimitStore.set(ip, timestamps);
    }
});

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    // Per Vercel Best Practices: match all routes except next, _next, public files, images.
    matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico|sw\\.js|manifest\\.json|offline\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|json)$).*)"],
};
