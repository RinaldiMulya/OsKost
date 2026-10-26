import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authConfig } from "./auth.config";
import logger from "@/lib/logger";
import { logAuditEvent } from "@/lib/audit-log";

const log = logger.child({ module: "auth" });

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ identifier: z.string(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { identifier, password } = parsedCredentials.data;

                    // Detect if identifier is email or phone number
                    const isEmail = identifier.includes("@");

                    const user = await prisma.user.findFirst({
                        where: isEmail
                            ? { email: identifier }
                            : { phoneNumber: identifier },
                    });

                    if (!user) {
                        await logAuditEvent({
                            actorEmail: identifier,
                            action: "LOGIN_FAILED_NOT_FOUND",
                            category: "AUTH",
                            metadata: { identifier },
                        });
                        return null;
                    }

                    const passwordsMatch = await bcryptjs.compare(password, user.passwordHash);

                    if (passwordsMatch) {
                        // Update lastLoginAt asynchronously without blocking
                        prisma.user
                            .update({
                                where: { id: user.id },
                                data: { lastLoginAt: new Date() },
                            })
                            .catch((err) => log.error({ err }, "Gagal update lastLoginAt"));

                        await logAuditEvent({
                            actorId: user.id,
                            actorEmail: user.email,
                            actorRole: user.role,
                            action: "LOGIN_SUCCESS",
                            category: "AUTH",
                        });

                        return {
                            id: user.id,
                            email: user.email,
                            role: user.role,
                        };
                    } else {
                        await logAuditEvent({
                            actorId: user.id,
                            actorEmail: user.email,
                            actorRole: user.role,
                            action: "LOGIN_FAILED_INVALID_PASSWORD",
                            category: "AUTH",
                        });
                    }
                }

                log.warn({ identifier: credentials?.identifier }, "Login gagal: kredensial tidak valid");
                return null;
            },
        }),
    ],
});
