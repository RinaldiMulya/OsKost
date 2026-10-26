"use client";

import { useState } from "react";
import {
    SystemHealthReport,
    ServiceHealthStatus,
    triggerManualDiagnosticAction,
} from "@/features/super-admin/actions/health-actions";
import {
    Activity,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    RefreshCw,
    Database,
    CreditCard,
    Mail,
    HardDrive,
    Webhook,
    Clock,
    Server,
    ShieldAlert,
    Cpu,
} from "lucide-react";

interface HealthDashboardClientProps {
    initialReport: SystemHealthReport;
}

export function HealthDashboardClient({
    initialReport,
}: HealthDashboardClientProps) {
    const [report, setReport] = useState<SystemHealthReport>(initialReport);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedPayload, setSelectedPayload] = useState<string | null>(null);

    const handleRefresh = async () => {
        try {
            setIsRefreshing(true);
            const updated = await triggerManualDiagnosticAction();
            setReport(updated);
        } catch (error) {
            console.error("Gagal menjalankan diagnostik:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const getStatusIcon = (status: "OPERATIONAL" | "DEGRADED" | "DOWN") => {
        switch (status) {
            case "OPERATIONAL":
                return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case "DEGRADED":
                return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case "DOWN":
                return <XCircle className="w-5 h-5 text-rose-500" />;
        }
    };

    const getStatusBadge = (status: "OPERATIONAL" | "DEGRADED" | "DOWN") => {
        switch (status) {
            case "OPERATIONAL":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Operational
                    </span>
                );
            case "DEGRADED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Degraded
                    </span>
                );
            case "DOWN":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                        Outage / Down
                    </span>
                );
        }
    };

    const getServiceIcon = (key: ServiceHealthStatus["key"]) => {
        switch (key) {
            case "database":
                return <Database className="w-5 h-5 text-[#8C6239]" />;
            case "midtrans":
                return <CreditCard className="w-5 h-5 text-sky-600" />;
            case "resend":
                return <Mail className="w-5 h-5 text-indigo-600" />;
            case "supabase_storage":
                return <HardDrive className="w-5 h-5 text-emerald-600" />;
            case "webhooks":
                return <Webhook className="w-5 h-5 text-violet-600" />;
        }
    };

    const formatTimestamp = (iso: string) => {
        const date = new Date(iso);
        return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });
    };

    const dbService = report.services.find((s) => s.key === "database");
    const midtransService = report.services.find((s) => s.key === "midtrans");

    return (
        <div className="space-y-6">
            {/* Top Global Status Banner */}
            <div
                className={`p-6 rounded-2xl border transition-all ${
                    report.overallStatus === "OPERATIONAL"
                        ? "bg-gradient-to-r from-emerald-950/20 via-emerald-900/10 to-transparent border-emerald-500/30 text-emerald-900"
                        : report.overallStatus === "DEGRADED"
                        ? "bg-gradient-to-r from-amber-950/20 via-amber-900/10 to-transparent border-amber-500/30 text-amber-900"
                        : "bg-gradient-to-r from-rose-950/20 via-rose-900/10 to-transparent border-rose-500/30 text-rose-900"
                }`}
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                        <div className="p-2.5 rounded-xl bg-white shadow-xs border border-[#E8E2DA]">
                            {getStatusIcon(report.overallStatus)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold tracking-tight text-[#1A1A2E]">
                                    {report.overallStatus === "OPERATIONAL"
                                        ? "Semua Sistem & API Beroperasi Normal"
                                        : report.overallStatus === "DEGRADED"
                                        ? "Beberapa Layanan Mengalami Penurunan Performa"
                                        : "Peringatan: Terdapat Gangguan Kritis pada Layanan"}
                                </h2>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-[#E8E2DA] text-[#5C564E]">
                                    {report.overallPercentage}% Uptime
                                </span>
                            </div>
                            <p className="text-sm text-[#7A7A7A] mt-1">
                                Telemetri real-time memindai konektivitas Database, Payment Gateway Midtrans,
                                Resend Email, dan Webhook Engine.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                            <span className="text-[11px] text-[#A0A0B2] block">
                                Terakhir dipindai
                            </span>
                            <span className="text-xs font-mono font-semibold text-[#1A1A2E]">
                                {formatTimestamp(report.timestamp)} WIB
                            </span>
                        </div>

                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A1A2E] hover:bg-[#25253D] text-[#FAF7F2] text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`w-3.5 h-3.5 text-[#D4A843] ${
                                    isRefreshing ? "animate-spin" : ""
                                }`}
                            />
                            <span>{isRefreshing ? "Memindai API..." : "Jalankan Diagnostik"}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-[#E8E2DA] shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs text-[#7A7A7A] font-medium block">
                            Overall Readiness
                        </span>
                        <span className="text-2xl font-bold text-[#1A1A2E]">
                            {report.overallPercentage}%
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8E2DA] flex items-center justify-center">
                        <Activity className="w-5 h-5 text-[#8C6239]" />
                    </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E8E2DA] shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs text-[#7A7A7A] font-medium block">
                            Database Ping
                        </span>
                        <span className="text-2xl font-bold text-[#1A1A2E]">
                            {dbService?.latencyMs !== null ? `${dbService?.latencyMs} ms` : "N/A"}
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8E2DA] flex items-center justify-center">
                        <Database className="w-5 h-5 text-[#5D6654]" />
                    </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E8E2DA] shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs text-[#7A7A7A] font-medium block">
                            Midtrans Latency
                        </span>
                        <span className="text-2xl font-bold text-[#1A1A2E]">
                            {midtransService?.latencyMs !== null
                                ? `${midtransService?.latencyMs} ms`
                                : "N/A"}
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8E2DA] flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-sky-600" />
                    </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E8E2DA] shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs text-[#7A7A7A] font-medium block">
                            Webhook Success (24h)
                        </span>
                        <span className="text-2xl font-bold text-[#1A1A2E]">
                            {report.webhookStats.successRatePercentage}%
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8E2DA] flex items-center justify-center">
                        <Webhook className="w-5 h-5 text-violet-600" />
                    </div>
                </div>
            </div>

            {/* Core Services Status Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#1A1A2E] tracking-tight">
                        Status Komponen Infrastruktur & Integrasi API
                    </h3>
                    <span className="text-xs text-[#7A7A7A]">
                        {report.services.length} Layanan Terhubung
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {report.services.map((svc) => (
                        <div
                            key={svc.key}
                            className="bg-white p-5 rounded-2xl border border-[#E8E2DA] shadow-xs flex flex-col justify-between hover:border-[#8C6239]/50 transition-all"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#E8E2DA]">
                                            {getServiceIcon(svc.key)}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-[#1A1A2E]">
                                                {svc.name}
                                            </h4>
                                            <span className="text-[11px] font-mono text-[#A0A0B2]">
                                                {svc.key}
                                            </span>
                                        </div>
                                    </div>
                                    {getStatusBadge(svc.status)}
                                </div>

                                <p className="text-xs text-[#5C564E] leading-relaxed">
                                    {svc.message}
                                </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-[#F2ECE4] flex items-center justify-between text-[11px]">
                                <span className="text-[#A0A0B2]">Latensi:</span>
                                <span className="font-mono font-semibold text-[#1A1A2E]">
                                    {svc.latencyMs !== null ? `${svc.latencyMs} ms` : "N/A (Offline)"}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Environment Specs Card */}
                    <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E8E2DA] shadow-xs flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-white border border-[#E8E2DA]">
                                    <Server className="w-5 h-5 text-[#8C6239]" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-[#1A1A2E]">
                                        Server Environment
                                    </h4>
                                    <span className="text-[11px] font-mono text-[#A0A0B2]">
                                        Next.js Node Runtime
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1.5 text-xs text-[#5C564E]">
                                <div className="flex justify-between">
                                    <span>Node Version:</span>
                                    <span className="font-mono font-semibold text-[#1A1A2E]">
                                        {report.serverEnvironment.nodeVersion}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Environment:</span>
                                    <span className="font-mono font-semibold text-[#1A1A2E]">
                                        {report.serverEnvironment.environment}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Region:</span>
                                    <span className="font-semibold text-[#1A1A2E]">
                                        {report.serverEnvironment.region}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#E8E2DA] flex items-center justify-between text-[11px]">
                            <span className="text-[#A0A0B2]">Automated Crons:</span>
                            <span className="font-semibold text-emerald-600">Active (Vercel/Internal)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Webhook & Callback Telemetry Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-[#1A1A2E] tracking-tight">
                            Telemetri Ingestion Webhook Pembayaran
                        </h3>
                        <p className="text-xs text-[#7A7A7A] mt-0.5">
                            Log aktivitas callback dari Midtrans Core API dan verifikasi SHA-512 signature.
                        </p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 bg-white border border-[#E8E2DA] rounded-xl text-[#5C564E]">
                        {report.recentWebhooks.length} Log Terbaru
                    </span>
                </div>

                <div className="bg-white rounded-2xl border border-[#E8E2DA] overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#FAF7F2] text-[#7A7A7A] uppercase text-[10px] font-bold border-b border-[#E8E2DA]">
                                <tr>
                                    <th className="py-3 px-4">Provider</th>
                                    <th className="py-3 px-4">Signature Valid</th>
                                    <th className="py-3 px-4">HTTP Status Sent</th>
                                    <th className="py-3 px-4">Terkait Invoice</th>
                                    <th className="py-3 px-4">Waktu Callback</th>
                                    <th className="py-3 px-4 text-right">Detail Payload</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F2ECE4]">
                                {report.recentWebhooks.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-[#A0A0B2]">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Webhook className="w-8 h-8 text-[#D1C9BE]" />
                                                <p className="font-semibold text-[#5C564E]">
                                                    Belum ada log callback webhook tersimpan.
                                                </p>
                                                <p className="text-[11px] text-[#A0A0B2]">
                                                    Callback akan otomatis terdeteksi saat Midtrans mengirimkan notifikasi.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    report.recentWebhooks.map((wh) => (
                                        <tr key={wh.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                                            <td className="py-3.5 px-4 font-bold text-[#1A1A2E]">
                                                {wh.provider}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {wh.signatureValid ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Valid SHA-512
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                                                        <ShieldAlert className="w-3.5 h-3.5" />
                                                        Invalid / Tampered
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono font-semibold">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[11px] ${
                                                        wh.httpStatusSent === 200
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-rose-50 text-rose-700"
                                                    }`}
                                                >
                                                    HTTP {wh.httpStatusSent || 200}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-[#5C564E]">
                                                {wh.invoiceNumber || wh.invoiceId || "-"}
                                            </td>
                                            <td className="py-3.5 px-4 text-[#7A7A7A]">
                                                {new Date(wh.createdAt).toLocaleString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    second: "2-digit",
                                                })}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                {wh.payloadPreview ? (
                                                    <button
                                                        onClick={() => setSelectedPayload(wh.payloadPreview || "")}
                                                        className="px-2.5 py-1 rounded-lg border border-[#E8E2DA] bg-[#FAF7F2] hover:bg-white text-[#5C564E] font-medium text-[11px] transition-all"
                                                    >
                                                        Lihat Payload
                                                    </button>
                                                ) : (
                                                    <span className="text-[#A0A0B2]">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Payload Viewer Modal */}
            {selectedPayload && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#E8E2DA]">
                        <div className="flex items-center justify-between">
                            <h4 className="text-base font-bold text-[#1A1A2E]">
                                Raw Webhook Payload Preview
                            </h4>
                            <button
                                onClick={() => setSelectedPayload(null)}
                                className="text-[#A0A0B2] hover:text-[#1A1A2E]"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <pre className="p-3 bg-[#1A1A2E] text-[#FAF7F2] font-mono text-xs rounded-xl overflow-x-auto max-h-80">
                            {selectedPayload}
                        </pre>
                        <div className="text-right">
                            <button
                                onClick={() => setSelectedPayload(null)}
                                className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#E8E2DA] text-[#1A1A2E] font-semibold text-xs rounded-xl transition-all"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
