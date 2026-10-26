"use client";

import { useState } from "react";
import {
    PlatformSettingsData,
    testServicePingAction,
} from "@/features/super-admin/actions/platform-settings-actions";
import {
    Settings,
    ShieldCheck,
    CheckCircle2,
    AlertTriangle,
    KeyRound,
    Database,
    Mail,
    HardDrive,
    CreditCard,
    Cpu,
    ExternalLink,
    RefreshCw,
    Copy,
    Check,
    Server,
    Globe,
    Layers,
    Lock,
    Terminal,
} from "lucide-react";

interface PlatformSettingsClientProps {
    initialData: PlatformSettingsData;
}

export function PlatformSettingsClient({ initialData }: PlatformSettingsClientProps) {
    const [data] = useState<PlatformSettingsData>(initialData);
    const [testingKey, setTestingKey] = useState<string | null>(null);
    const [testResults, setTestResults] = useState<{ [key: string]: { success: boolean; message: string } }>({});
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const handleCopy = (key: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const handleTestService = async (serviceKey: string) => {
        setTestingKey(serviceKey);
        try {
            const res = await testServicePingAction(serviceKey);
            setTestResults((prev) => ({ ...prev, [serviceKey]: res }));
        } catch (e: any) {
            setTestResults((prev) => ({
                ...prev,
                [serviceKey]: { success: false, message: e.message || "Gagal melakukan tes servis." },
            }));
        } finally {
            setTestingKey(null);
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "PAYMENT":
                return <CreditCard className="w-4 h-4 text-emerald-600" />;
            case "AUTH":
                return <KeyRound className="w-4 h-4 text-sky-600" />;
            case "DATABASE":
                return <Database className="w-4 h-4 text-purple-600" />;
            case "COMMUNICATION":
                return <Mail className="w-4 h-4 text-amber-600" />;
            case "STORAGE":
                return <HardDrive className="w-4 h-4 text-indigo-600" />;
            default:
                return <Server className="w-4 h-4 text-gray-600" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Platform Identity */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Identitas Platform
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1A1A2E] text-[#D4A843]">
                                {data.platformInfo.platformVersion}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                            {data.platformInfo.platformName}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            B2B SaaS Multi-Tenant Platform Kost Architecture
                        </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Domain URL:</span>
                            <span className="font-mono text-gray-800 font-medium">
                                {data.platformInfo.platformDomain}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Environment:</span>
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                                {data.platformInfo.nodeEnv}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Support & Operation */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Operasional & Kontak
                            </span>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="space-y-2.5">
                            <div>
                                <span className="text-[11px] text-gray-400 block">Email Support</span>
                                <span className="text-sm font-semibold text-gray-800">
                                    {data.platformInfo.supportEmail}
                                </span>
                            </div>
                            <div>
                                <span className="text-[11px] text-gray-400 block">WhatsApp Super Admin</span>
                                <span className="text-sm font-semibold text-gray-800">
                                    {data.platformInfo.supportWhatsapp}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-gray-500">Maintenance Mode:</span>
                        <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                data.platformInfo.maintenanceMode
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                        >
                            {data.platformInfo.maintenanceMode ? "Aktif (Offline)" : "Nonaktif (Normal)"}
                        </span>
                    </div>
                </div>

                {/* Ecosystem Scale Stats */}
                <div className="bg-gradient-to-br from-[#1A1A2E] to-[#25253D] text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#A0A0B2]">
                                Ekosistem Tenant
                            </span>
                            <Layers className="w-4 h-4 text-[#D4A843]" />
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center mt-2">
                            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                                <span className="text-lg font-bold text-white block">
                                    {data.stats.totalOwners}
                                </span>
                                <span className="text-[10px] text-gray-400 uppercase">Owners</span>
                            </div>
                            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                                <span className="text-lg font-bold text-[#D4A843] block">
                                    {data.stats.totalProperties}
                                </span>
                                <span className="text-[10px] text-gray-400 uppercase">Kost</span>
                            </div>
                            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                                <span className="text-lg font-bold text-emerald-400 block">
                                    {data.stats.totalSubscriptions}
                                </span>
                                <span className="text-[10px] text-gray-400 uppercase">SaaS</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                        <span>Dual Cashflow Isolation</span>
                        <span className="text-[#D4A843] font-mono text-[11px]">Strict Active</span>
                    </div>
                </div>
            </div>

            {/* Service & Gateway Matrix */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                            <Lock className="w-4 h-4 text-[#8C6239]" />
                            <span>Matriks Kredensial & Integrasi Eksternal</span>
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Status ketersediaan kunci API runtime server platform OsKost (nilai rahasia otomatis disamarkan)
                        </p>
                    </div>
                    <span className="text-xs font-mono bg-gray-50 text-gray-500 px-3 py-1 rounded-lg border border-gray-200">
                        {data.serviceIntegrations.filter((s) => s.status === "CONFIGURED").length} /{" "}
                        {data.serviceIntegrations.length} Servis Siap
                    </span>
                </div>

                <div className="divide-y divide-gray-100">
                    {data.serviceIntegrations.map((item) => {
                        const isTesting = testingKey === item.key;
                        const testResult = testResults[item.key];

                        return (
                            <div
                                key={item.key}
                                className="p-4 sm:p-5 hover:bg-gray-50/60 transition-colors"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    {/* Left: Info */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            {getCategoryIcon(item.category)}
                                            <span className="font-semibold text-sm text-gray-900">
                                                {item.label}
                                            </span>
                                            <span className="text-[11px] font-mono text-gray-400">
                                                ({item.key})
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 max-w-2xl">
                                            {item.description}
                                        </p>
                                    </div>

                                    {/* Right: Status & Actions */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        {/* Status Badge */}
                                        {item.status === "CONFIGURED" ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                Terkonfigurasi
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                                Belum Diatur
                                            </span>
                                        )}

                                        {/* Test Button */}
                                        <button
                                            onClick={() => handleTestService(item.key)}
                                            disabled={isTesting}
                                            className="px-3 py-1.5 rounded-xl text-xs font-medium border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                        >
                                            <RefreshCw
                                                className={`w-3.5 h-3.5 ${isTesting ? "animate-spin text-[#8C6239]" : ""}`}
                                            />
                                            <span>{isTesting ? "Testing..." : "Cek Servis"}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Masked Value Preview if available */}
                                {item.maskedValue && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="text-[11px] text-gray-400 font-mono">Value:</span>
                                        <code className="text-[11px] font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                                            {item.maskedValue}
                                        </code>
                                    </div>
                                )}

                                {/* Test diagnostic result banner */}
                                {testResult && (
                                    <div
                                        className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                                            testResult.success
                                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                                : "bg-rose-50 text-rose-800 border border-rose-200"
                                        }`}
                                    >
                                        {testResult.success ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        ) : (
                                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                        )}
                                        <span>{testResult.message}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Architecture Directives Card */}
            <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-200/80 shadow-xs">
                <div className="flex items-center gap-2 mb-2 text-amber-900 font-semibold text-sm">
                    <Terminal className="w-4 h-4 text-[#8C6239]" />
                    <span>OsKost Monorepo Architectural Directives</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-amber-950 mt-3">
                    <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60">
                        <strong className="block text-gray-900 mb-1">1. Sunset PWA Tenant (100% Mobile)</strong>
                        <span>Penghuni kost berinteraksi lewat aplikasi Flutter Native dengan tema white-label dinamis dari API v1. Halaman web login difokuskan untuk Pemilik & Super Admin.</span>
                    </div>
                    <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60">
                        <strong className="block text-gray-900 mb-1">2. Strict Multi-Tenant Scoping</strong>
                        <span>Seluruh query Prisma di Service Layer wajib mengikutsertakan filter propertyId atau ownerId untuk mencegah kebocoran data antar pemilik kost.</span>
                    </div>
                    <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60">
                        <strong className="block text-gray-900 mb-1">3. Dual Cashflow Separation</strong>
                        <span>Aliran tagihan SaaS Pemilik Kost masuk ke rekening platform OsKost via Midtrans Platform Key, sedangkan pembayaran sewa kamar Tenant langsung ke rekening pemilik kost.</span>
                    </div>
                    <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60">
                        <strong className="block text-gray-900 mb-1">4. Fail-Safe Audit Trail</strong>
                        <span>Setiap transaksi, pergantian hak akses, dan event kritis dicatat secara sinkron ke tabel PostgreSQL AuditLog tanpa memutus proses bisnis utama.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
