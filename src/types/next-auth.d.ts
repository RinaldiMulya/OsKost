// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: "ADMIN" | "TENANT";
        } & DefaultSession["user"];
    }

    interface User {
        role: "ADMIN" | "TENANT";
        phoneNumber?: string | null;
    }
}
