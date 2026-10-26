import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Server-side guard to guarantee only authenticated users with SUPER_ADMIN role
 * can execute the server action or render the server component.
 */
export async function requireSuperAdmin() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }
    if (session.user.role !== "SUPER_ADMIN") {
        redirect("/login?error=UnauthorizedSuperAdmin");
    }
    return session.user;
}

/**
 * Safely inspect if current active session has Super Admin privileges
 */
export async function getSuperAdminSession() {
    const session = await auth();
    if (session?.user?.role === "SUPER_ADMIN") {
        return session.user;
    }
    return null;
}
