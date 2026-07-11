import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnAdmin = nextUrl.pathname.startsWith("/admin");
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
            const isOnLogin = nextUrl.pathname === "/login";
            const userRole = auth?.user?.role;

            // If logged in and trying to access /login → redirect to their dashboard
            if (isOnLogin && isLoggedIn) {
                if (userRole === "ADMIN") {
                    return Response.redirect(new URL("/admin", nextUrl));
                }
                if (userRole === "TENANT") {
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
            }

            // Admin routes protection
            if (isOnAdmin) {
                if (isLoggedIn && userRole === "ADMIN") return true;
                return false; // Redirect to login
            }

            // Tenant routes protection
            if (isOnDashboard) {
                if (isLoggedIn && userRole === "TENANT") return true;
                return false; // Redirect to login
            }

            return true;
        },
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as "ADMIN" | "TENANT";
            }
            return session;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
