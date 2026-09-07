import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authConfig } from "./auth.config";
import logger from "@/lib/logger";

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

                    if (!user) return null;

                    const passwordsMatch = await bcryptjs.compare(password, user.passwordHash);

                    if (passwordsMatch) {
                        return {
                            id: user.id,
                            email: user.email,
                            role: user.role,
                        };
                    }
                }

                log.warn({ identifier: credentials?.identifier }, "Login gagal: kredensial tidak valid");
                return null;
            },
        }),
    ],
});
