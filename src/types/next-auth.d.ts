// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { type DefaultSession } from "next-auth";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: UserRole;
        } & DefaultSession["user"];
    }

    interface User {
        role: UserRole;
        phoneNumber?: string | null;
    }
}
