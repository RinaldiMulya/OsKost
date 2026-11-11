// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { type DefaultSession } from "next-auth";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: UserRole;
            propertyId?: string;
            propertyName?: string;
            propertySlug?: string;
            impersonating?: {
                ownerId: string;
                ownerEmail: string;
            };
        } & DefaultSession["user"];
    }

    interface User {
        role: UserRole;
        phoneNumber?: string | null;
        propertyId?: string | null;
        propertyName?: string | null;
        propertySlug?: string | null;
        impersonating?: {
            ownerId: string;
            ownerEmail: string;
        };
    }
}

