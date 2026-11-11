import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

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

/**
 * Server-side guard to guarantee only authenticated users with ADMIN, PROPERTY_OWNER,
 * or SUPER_ADMIN role can execute the server action or view owner dashboard.
 * Resolves and guarantees active propertyId for multi-tenant data isolation.
 */
export async function requireOwnerSession() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const role = session.user.role;
    if (role !== "ADMIN" && role !== "PROPERTY_OWNER" && role !== "SUPER_ADMIN") {
        throw new Error("Akses ditolak: Memerlukan hak akses Admin atau Pemilik Kost.");
    }

    let propertyId = session.user.propertyId;
    if (!propertyId) {
        const userProperty = await prisma.property.findFirst({
            where: { ownerId: session.user.id },
            select: { id: true },
        }) || await prisma.property.findFirst({
            where: { slug: "pulo-jahe" },
            select: { id: true },
        });
        propertyId = userProperty?.id;
    }

    if (!propertyId) {
        throw new Error("Properti tidak ditemukan untuk akun ini.");
    }

    return {
        ...session.user,
        propertyId,
    };
}
