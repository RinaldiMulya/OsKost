import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnSuperAdmin = nextUrl.pathname.startsWith("/super-admin");
            const isOnAdmin = nextUrl.pathname.startsWith("/admin");
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
            const isOnLogin = nextUrl.pathname === "/login";
            const userRole = auth?.user?.role as UserRole | undefined;

            // If logged in and trying to access /login → redirect to appropriate dashboard
            if (isOnLogin && isLoggedIn) {
                if (userRole === "SUPER_ADMIN") {
                    return Response.redirect(new URL("/super-admin", nextUrl));
                }
                if (userRole === "ADMIN" || userRole === "PROPERTY_OWNER") {
                    return Response.redirect(new URL("/admin", nextUrl));
                }
                if (userRole === "TENANT") {
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
            }

            // Super Admin routes protection (Strictly SUPER_ADMIN only)
            if (isOnSuperAdmin) {
                if (isLoggedIn && userRole === "SUPER_ADMIN") return true;
                return false; // Redirect to login
            }

            // Admin / Property Owner routes protection
            if (isOnAdmin) {
                if (isLoggedIn && (userRole === "ADMIN" || userRole === "PROPERTY_OWNER" || userRole === "SUPER_ADMIN")) {
                    return true;
                }
                return false; // Redirect to login
            }

            // Tenant routes protection
            if (isOnDashboard) {
                if (isLoggedIn && (userRole === "TENANT" || userRole === "SUPER_ADMIN")) {
                    return true;
                }
                return false; // Redirect to login
            }

            return true;
        },
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                if (user.impersonating) {
                    token.impersonating = user.impersonating;
                }
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as UserRole;
                if (token.impersonating) {
                    session.user.impersonating = token.impersonating as {
                        ownerId: string;
                        ownerEmail: string;
                    };
                }
            }
            return session;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
