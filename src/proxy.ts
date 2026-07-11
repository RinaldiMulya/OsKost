import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Initialize NextAuth with the edge config for middleware
export default NextAuth(authConfig).auth;

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    // Per Vercel Best Practices: match all routes except next, _next, public files, images.
    matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
