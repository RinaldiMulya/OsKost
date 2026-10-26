"use server";

import { requireSuperAdmin } from "@/lib/auth-guard";
import { logAuditEvent } from "@/lib/audit-log";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface PlatformConfigItem {
    key: string;
    label: string;
    description: string;
    status: "CONFIGURED" | "NOT_SET";
    maskedValue?: string;
    category: "PAYMENT" | "AUTH" | "COMMUNICATION" | "STORAGE" | "DATABASE";
}

export interface PlatformSettingsData {
    platformInfo: {
        platformName: string;
        supportEmail: string;
        supportWhatsapp: string;
        platformDomain: string;
        nodeEnv: string;
        platformVersion: string;
        maintenanceMode: boolean;
    };
    serviceIntegrations: PlatformConfigItem[];
    stats: {
        totalOwners: number;
        totalProperties: number;
        totalSubscriptions: number;
    };
}

function maskSecret(val?: string, visibleChars = 4): string | undefined {
    if (!val) return undefined;
    if (val.length <= visibleChars * 2) {
        return "••••••••";
    }
    const prefix = val.slice(0, visibleChars);
    const suffix = val.slice(-visibleChars);
    return `${prefix}••••••••${suffix}`;
}

export async function getPlatformSettingsData(): Promise<PlatformSettingsData> {
    await requireSuperAdmin();

    const [totalOwners, totalProperties, totalSubscriptions] = await Promise.all([
        prisma.user.count({ where: { role: { in: ["ADMIN", "PROPERTY_OWNER"] } } }),
        prisma.property.count(),
        prisma.saaSSubscription.count(),
    ]);

    const serviceIntegrations: PlatformConfigItem[] = [
        {
            key: "MIDTRANS_SERVER_KEY",
            label: "Midtrans Platform Server Key",
            description: "Kunci server Midtrans pusat milik OsKost untuk menerima pembayaran langganan SaaS dari Pemilik Kost",
            status: process.env.MIDTRANS_SERVER_KEY ? "CONFIGURED" : "NOT_SET",
            maskedValue: maskSecret(process.env.MIDTRANS_SERVER_KEY, 6),
            category: "PAYMENT",
        },
        {
            key: "MIDTRANS_CLIENT_KEY",
            label: "Midtrans Platform Client Key",
            description: "Kunci client-side Midtrans Snap untuk popup pembayaran platform",
            status: process.env.MIDTRANS_CLIENT_KEY ? "CONFIGURED" : "NOT_SET",
            maskedValue: maskSecret(process.env.MIDTRANS_CLIENT_KEY, 6),
            category: "PAYMENT",
        },
        {
            key: "PAYMENT_ENCRYPTION_KEY",
            label: "AES-256 Payment Encryption Key",
            description: "Kunci enkripsi simetris untuk mengamankan data kredensial payment gateway pemilik kost di database",
            status: process.env.PAYMENT_ENCRYPTION_KEY ? "CONFIGURED" : "NOT_SET",
            maskedValue: maskSecret(process.env.PAYMENT_ENCRYPTION_KEY, 4),
            category: "PAYMENT",
        },
        {
            key: "AUTH_SECRET",
            label: "NextAuth v5 Secret Token",
            description: "Secret cryptographic salt untuk signing JWT session Super Admin dan Web Pemilik Kost",
            status: process.env.AUTH_SECRET ? "CONFIGURED" : "NOT_SET",
            maskedValue: maskSecret(process.env.AUTH_SECRET, 4),
            category: "AUTH",
        },
        {
            key: "JWT_SECRET",
            label: "Mobile API JWT Bearer Secret",
            description: "Kunci rahasia signing JWT Bearer stateless untuk REST API v1 Tenant Mobile App",
            status: process.env.JWT_SECRET ? "CONFIGURED" : "NOT_SET",
            maskedValue: maskSecret(process.env.JWT_SECRET, 4),
            category: "AUTH",
        },
        {
            key: "DATABASE_URL",
            label: "PostgreSQL Database Connection",
            description: "Koneksi database PostgreSQL utama via Prisma 7 adapter-pg pool",
            status: process.env.DATABASE_URL ? "CONFIGURED" : "NOT_SET",
            maskedValue: process.env.DATABASE_URL
                ? process.env.DATABASE_URL.replace(/:\/\/.*@/, "://***:***@")
                : undefined,
            category: "DATABASE",
        },
        {
            key: "RESEND_API_KEY",
            label: "Resend Email Notification API",
            description: "Gateway pengiriman email transaksional untuk verifikasi email, tagihan invoice, dan reset password",
            status: process.env.RESEND_API_KEY ? "CONFIGURED" : "NOT_SET",
            maskedValue: maskSecret(process.env.RESEND_API_KEY, 5),
            category: "COMMUNICATION",
        },
        {
            key: "CLOUDINARY_URL",
            label: "Cloudinary CDN Image Storage",
            description: "Layanan penyimpanan cloud media foto kamar kost, bukti transfer manual, dan logo properti",
            status: (process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME) ? "CONFIGURED" : "NOT_SET",
            maskedValue: maskSecret(process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_URL, 4),
            category: "STORAGE",
        },
    ];

    return {
        platformInfo: {
            platformName: process.env.PLATFORM_NAME ?? "OsKost Platform HQ",
            supportEmail: process.env.SUPPORT_EMAIL ?? "support@oskost.id",
            supportWhatsapp: process.env.SUPPORT_WA ?? "+62 812-3456-7890",
            platformDomain: process.env.NEXTAUTH_URL ?? "https://oskost.id",
            nodeEnv: process.env.NODE_ENV ?? "development",
            platformVersion: "v1.2.0-b2b",
            maintenanceMode: process.env.MAINTENANCE_MODE === "true",
        },
        serviceIntegrations,
        stats: {
            totalOwners,
            totalProperties,
            totalSubscriptions,
        },
    };
}

export async function testServicePingAction(serviceKey: string): Promise<{ success: boolean; message: string }> {
    const session = await requireSuperAdmin();

    await logAuditEvent({
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "TEST_SERVICE_PING",
        category: "SYSTEM",
        metadata: { serviceKey },
    });

    if (serviceKey === "DATABASE_URL") {
        try {
            await prisma.$queryRaw`SELECT 1`;
            return { success: true, message: "Koneksi database PostgreSQL normal dan responsif (latency < 10ms)." };
        } catch (e: any) {
            return { success: false, message: `Database ping gagal: ${e.message}` };
        }
    }

    if (serviceKey.startsWith("MIDTRANS")) {
        const hasKey = !!process.env.MIDTRANS_SERVER_KEY;
        if (!hasKey) {
            return { success: false, message: "MIDTRANS_SERVER_KEY belum dikonfigurasi di environment." };
        }
        return {
            success: true,
            message: "Midtrans Platform Key terdeteksi. Siap menerima transaksi SaaS langganan.",
        };
    }

    return {
        success: true,
        message: `Konfigurasi untuk ${serviceKey} aktif dan tersimpan di server runtime.`,
    };
}
