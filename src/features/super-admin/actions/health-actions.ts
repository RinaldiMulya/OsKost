"use server";

import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { logAuditEvent } from "@/lib/audit-log";
import { revalidatePath } from "next/cache";

export interface ServiceHealthStatus {
    name: string;
    key: "database" | "midtrans" | "resend" | "supabase_storage" | "webhooks";
    status: "OPERATIONAL" | "DEGRADED" | "DOWN";
    latencyMs: number | null;
    message: string;
    details?: Record<string, any>;
}

export interface WebhookTelemetryItem {
    id: string;
    provider: string;
    signatureValid: boolean;
    httpStatusSent: number | null;
    invoiceId: string | null;
    invoiceNumber?: string | null;
    createdAt: string;
    payloadPreview?: string;
}

export interface SystemHealthReport {
    timestamp: string;
    overallStatus: "OPERATIONAL" | "DEGRADED" | "DOWN";
    overallPercentage: number;
    services: ServiceHealthStatus[];
    webhookStats: {
        totalLast24h: number;
        successLast24h: number;
        failedLast24h: number;
        successRatePercentage: number;
    };
    recentWebhooks: WebhookTelemetryItem[];
    serverEnvironment: {
        nodeVersion: string;
        environment: string;
        region: string;
    };
}

/**
 * Runs active diagnostic tests across all platform infrastructure components.
 */
export async function getSystemHealthDiagnostics(): Promise<SystemHealthReport> {
    const session = await requireSuperAdmin();

    const services: ServiceHealthStatus[] = [];

    // 1. PostgreSQL Database Benchmark
    try {
        const startDb = performance.now();
        await prisma.$queryRaw`SELECT 1`;
        const dbLatency = Math.round(performance.now() - startDb);

        services.push({
            name: "PostgreSQL Database",
            key: "database",
            status: dbLatency > 800 ? "DEGRADED" : "OPERATIONAL",
            latencyMs: dbLatency,
            message: `Koneksi database prima (Latency: ${dbLatency}ms)`,
            details: {
                engine: "PostgreSQL",
                pooler: "Active",
            },
        });
    } catch (error: any) {
        services.push({
            name: "PostgreSQL Database",
            key: "database",
            status: "DOWN",
            latencyMs: null,
            message: `Koneksi database gagal: ${error?.message || "Unknown error"}`,
        });
    }

    // 2. Midtrans Payment Gateway
    try {
        const isProd = process.env.MIDTRANS_IS_PRODUCTION === "true";
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        const midtransApiUrl = isProd
            ? "https://api.midtrans.com"
            : "https://api.sandbox.midtrans.com";

        if (!serverKey) {
            services.push({
                name: "Midtrans Payment Gateway",
                key: "midtrans",
                status: "DOWN",
                latencyMs: null,
                message: "MIDTRANS_SERVER_KEY belum dikonfigurasi di Environment",
                details: {
                    environment: isProd ? "Production" : "Sandbox",
                    configured: false,
                },
            });
        } else {
            const startMidtrans = performance.now();
            // Ping midtrans endpoint with basic auth
            const authHeader = `Basic ${Buffer.from(serverKey + ":").toString("base64")}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            try {
                // Testing connection to Midtrans API endpoint
                const res = await fetch(`${midtransApiUrl}/v2/token`, {
                    method: "GET",
                    headers: {
                        Authorization: authHeader,
                        Accept: "application/json",
                    },
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);

                const latency = Math.round(performance.now() - startMidtrans);

                // Midtrans might return 400 or 404 for GET /v2/token without params, which confirms API is reachable!
                const isReachable = res.status < 500;

                services.push({
                    name: "Midtrans Core API",
                    key: "midtrans",
                    status: !isReachable ? "DOWN" : latency > 1200 ? "DEGRADED" : "OPERATIONAL",
                    latencyMs: latency,
                    message: isReachable
                        ? `Gateway Midtrans ${isProd ? "Production" : "Sandbox"} terhubung (${latency}ms)`
                        : `Respons Midtrans mengembalikan status HTTP ${res.status}`,
                    details: {
                        environment: isProd ? "Production" : "Sandbox",
                        configured: true,
                        httpStatus: res.status,
                    },
                });
            } catch (fetchErr: any) {
                clearTimeout(timeoutId);
                const latency = Math.round(performance.now() - startMidtrans);
                services.push({
                    name: "Midtrans Core API",
                    key: "midtrans",
                    status: "DOWN",
                    latencyMs: latency,
                    message: `Gagal menghubungi endpoint Midtrans: ${fetchErr?.message || "Timeout"}`,
                    details: {
                        environment: isProd ? "Production" : "Sandbox",
                        configured: true,
                    },
                });
            }
        }
    } catch (err: any) {
        services.push({
            name: "Midtrans Core API",
            key: "midtrans",
            status: "DOWN",
            latencyMs: null,
            message: `Error diagnosa Midtrans: ${err?.message || "Unknown error"}`,
        });
    }

    // 3. Email Gateway (Resend)
    try {
        const resendKey = process.env.RESEND_API_KEY;
        if (!resendKey) {
            services.push({
                name: "Resend Email Gateway",
                key: "resend",
                status: "DEGRADED",
                latencyMs: null,
                message: "RESEND_API_KEY belum dikonfigurasi (Email notifikasi simulasi)",
                details: {
                    configured: false,
                    fromEmail: process.env.RESEND_FROM_EMAIL || "Simulasi",
                },
            });
        } else {
            const startEmail = performance.now();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);

            try {
                const res = await fetch("https://api.resend.com/api-keys", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${resendKey}`,
                    },
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);

                const latency = Math.round(performance.now() - startEmail);
                const isOk = res.ok || res.status === 200 || res.status === 401;

                services.push({
                    name: "Resend Email Gateway",
                    key: "resend",
                    status: res.status === 401 ? "DOWN" : latency > 1000 ? "DEGRADED" : "OPERATIONAL",
                    latencyMs: latency,
                    message: res.status === 401
                        ? "API Key Resend tidak valid (401 Unauthorized)"
                        : `Koneksi Resend Email aktif (${latency}ms)`,
                    details: {
                        configured: true,
                        httpStatus: res.status,
                    },
                });
            } catch (err: any) {
                clearTimeout(timeoutId);
                services.push({
                    name: "Resend Email Gateway",
                    key: "resend",
                    status: "DEGRADED",
                    latencyMs: null,
                    message: `Timeout koneksi API Resend: ${err?.message}`,
                });
            }
        }
    } catch (err: any) {
        services.push({
            name: "Resend Email Gateway",
            key: "resend",
            status: "DOWN",
            latencyMs: null,
            message: `Error diagnosa email: ${err?.message}`,
        });
    }

    // 4. Supabase Storage & Assets CDN
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!supabaseUrl) {
            services.push({
                name: "Supabase Media Storage",
                key: "supabase_storage",
                status: "DEGRADED",
                latencyMs: null,
                message: "NEXT_PUBLIC_SUPABASE_URL belum diset",
            });
        } else {
            const startStorage = performance.now();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);

            try {
                const res = await fetch(`${supabaseUrl}/storage/v1/version`, {
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                const latency = Math.round(performance.now() - startStorage);

                services.push({
                    name: "Supabase Media Storage",
                    key: "supabase_storage",
                    status: latency > 1000 ? "DEGRADED" : "OPERATIONAL",
                    latencyMs: latency,
                    message: `Media Bucket & CDN siap melayani berkas (${latency}ms)`,
                    details: {
                        url: supabaseUrl,
                    },
                });
            } catch (err: any) {
                clearTimeout(timeoutId);
                services.push({
                    name: "Supabase Media Storage",
                    key: "supabase_storage",
                    status: "DEGRADED",
                    latencyMs: null,
                    message: `Koneksi storage tidak merespons: ${err?.message}`,
                });
            }
        }
    } catch (err: any) {
        services.push({
            name: "Supabase Media Storage",
            key: "supabase_storage",
            status: "DEGRADED",
            latencyMs: null,
            message: `Error diagnosa storage: ${err?.message}`,
        });
    }

    // 5. Webhook Telemetry & Health History
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [recentWebhookLogs, totalLast24h, validLast24h] = await Promise.all([
        prisma.webhookLog.findMany({
            take: 15,
            orderBy: { createdAt: "desc" },
            include: {
                invoice: {
                    select: {
                        externalId: true,
                    },
                },
            },
        }),
        prisma.webhookLog.count({
            where: { createdAt: { gte: oneDayAgo } },
        }),
        prisma.webhookLog.count({
            where: {
                createdAt: { gte: oneDayAgo },
                signatureValid: true,
                httpStatusSent: 200,
            },
        }),
    ]);

    const failedLast24h = totalLast24h - validLast24h;
    const successRatePercentage =
        totalLast24h > 0 ? Math.round((validLast24h / totalLast24h) * 100) : 100;

    services.push({
        name: "Webhook Ingestion Pipeline",
        key: "webhooks",
        status: failedLast24h > 5 ? "DEGRADED" : "OPERATIONAL",
        latencyMs: null,
        message:
            totalLast24h > 0
                ? `${totalLast24h} callback diproses dalam 24 jam terakhir (${successRatePercentage}% sukses)`
                : "Tidak ada kegagalan callback dalam 24 jam terakhir",
        details: {
            totalLast24h,
            successRatePercentage,
        },
    });

    // Calculate Overall System Status
    const downCount = services.filter((s) => s.status === "DOWN").length;
    const degradedCount = services.filter((s) => s.status === "DEGRADED").length;

    let overallStatus: "OPERATIONAL" | "DEGRADED" | "DOWN" = "OPERATIONAL";
    if (downCount > 0) {
        overallStatus = "DOWN";
    } else if (degradedCount > 0) {
        overallStatus = "DEGRADED";
    }

    const operationalCount = services.filter((s) => s.status === "OPERATIONAL").length;
    const overallPercentage = Math.round((operationalCount / services.length) * 100);

    const formattedWebhooks: WebhookTelemetryItem[] = recentWebhookLogs.map((log) => {
        let payloadPreview = "";
        try {
            payloadPreview = JSON.stringify(log.rawPayload);
            if (payloadPreview.length > 120) {
                payloadPreview = payloadPreview.slice(0, 120) + "...";
            }
        } catch {
            payloadPreview = "-";
        }

        return {
            id: log.id,
            provider: log.provider,
            signatureValid: log.signatureValid,
            httpStatusSent: log.httpStatusSent,
            invoiceId: log.invoiceId,
            invoiceNumber: log.invoice?.externalId ?? null,
            createdAt: log.createdAt.toISOString(),
            payloadPreview,
        };
    });

    return {
        timestamp: new Date().toISOString(),
        overallStatus,
        overallPercentage,
        services,
        webhookStats: {
            totalLast24h,
            successLast24h: validLast24h,
            failedLast24h,
            successRatePercentage,
        },
        recentWebhooks: formattedWebhooks,
        serverEnvironment: {
            nodeVersion: process.version,
            environment: process.env.NODE_ENV || "development",
            region: "ap-southeast-1 (Jakarta / Singapore)",
        },
    };
}

/**
 * Triggers on-demand diagnostic and records audit event.
 */
export async function triggerManualDiagnosticAction() {
    const session = await requireSuperAdmin();

    const result = await getSystemHealthDiagnostics();

    await logAuditEvent({
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "SYSTEM_DIAGNOSTICS_RUN",
        category: "SYSTEM",
        metadata: {
            overallStatus: result.overallStatus,
            overallPercentage: result.overallPercentage,
        },
    });

    revalidatePath("/super-admin/health");

    return result;
}
