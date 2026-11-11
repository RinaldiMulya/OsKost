"use server";

import { signIn, signOut, auth } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { logAuditEvent } from "@/lib/audit-log";

const loginSchema = z.object({
    identifier: z.string().min(1, "Email/No HP harus diisi"),
    password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const parsed = loginSchema.safeParse(Object.fromEntries(formData));

        if (!parsed.success) {
            return parsed.error.issues[0].message;
        }

        const { identifier } = parsed.data;

        // Cek role user di database untuk menentukan rute dashboard yang sesuai:
        // SUPER_ADMIN → /super-admin
        // ADMIN / PROPERTY_OWNER → /admin
        // TENANT → /dashboard
        const user = await prisma.user.findFirst({
            where: identifier.includes("@")
                ? { email: identifier }
                : { phoneNumber: identifier },
            select: { role: true },
        });

        let targetUrl = "/admin";
        if (user?.role === "SUPER_ADMIN") {
            targetUrl = "/super-admin";
        } else if (user?.role === "TENANT") {
            targetUrl = "/dashboard";
        }

        await signIn("credentials", {
            ...parsed.data,
            redirectTo: targetUrl,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Kredensial tidak valid. Silakan periksa kembali email/nomor HP dan password Anda.";
                default:
                    return "Terjadi kesalahan saat mencoba login.";
            }
        }
        throw error;
    }
}

export async function logout() {
    const session = await auth();
    if (session?.user) {
        await logAuditEvent({
            actorId: session.user.id,
            actorEmail: session.user.email,
            actorRole: session.user.role,
            action: "LOGOUT",
            category: "AUTH",
        });
    }
    await signOut({ redirectTo: "/login" });
}
