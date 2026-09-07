import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient() {
    const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

    // Strip pgbouncer query params if any
    const cleanUrl = connectionString?.split("?")[0];

    const pool = new Pool({ connectionString: cleanUrl, max: 10 });
    const adapter = new PrismaPg(pool);

    return new PrismaClient({
        adapter,
        log:
            process.env.NODE_ENV === "development"
                ? ["query", "error", "warn"]
                : ["error"],
    });
}

if (
    process.env.NODE_ENV !== "production" &&
    globalForPrisma.prisma &&
    !("discountClaim" in globalForPrisma.prisma)
) {
    globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
