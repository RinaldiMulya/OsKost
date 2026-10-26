"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    OwnerDetailData,
    toggleOwnerSuspensionAction,
    resetOwnerPasswordAction,
} from "@/features/super-admin/actions/owners-actions";
import { startImpersonationAction } from "@/features/super-admin/actions/impersonation-actions";
import { OwnerStatusBadge } from "./owner-status-badge";
import {
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    Calendar,
    Clock,
    Shield,
    ShieldAlert,
    ShieldCheck,
    KeyRound,
    AlertCircle,
    CheckCircle2,
    Loader2,
    BedDouble,
    TrendingUp,
    ExternalLink,
    Lock,
    X,
    CreditCard,
    LogIn,
} from "lucide-react";

interface OwnerDetailClientProps {
    owner: OwnerDetailData;
}

export function OwnerDetailClient({ owner }: OwnerDetailClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"PROPERTIES" | "SUBSCRIPTIONS" | "AUDIT">("PROPERTIES");

    // Modal state for Suspend / Reactivate
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    const [suspendReason, setSuspendReason] = useState("");
    const [isSuspending, setIsSuspending] = useState(false);

    // Modal state for Reset Password
    const [isResetPwdModalOpen, setIsResetPwdModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [isResettingPwd, setIsResettingPwd] = useState(false);

    // Feedback notifications
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

    // Impersonation state
    const [isImpersonating, setIsImpersonating] = useState(false);

    const handleStartImpersonation = async () => {
        setIsImpersonating(true);
        setFeedback(null);
        try {
            const res = await startImpersonationAction(owner.id);
            if (!res.success) {
                setFeedback({ type: "error", message: res.error || "Gagal memulai sesi impersonasi." });
            } else {
                setFeedback({
                    type: "success",
                    message: "Sesi impersonasi aktif! Membuka dashboard pemilik kost di tab baru...",
                });
                window.open(res.redirectUrl || "/admin", "_blank");
            }
        } catch (err: any) {
            setFeedback({ type: "error", message: err?.message || "Terjadi kesalahan sistem saat impersonasi." });
        } finally {
            setIsImpersonating(false);
        }
    };

    const handleToggleSuspend = async () => {
        setIsSuspending(true);
        setFeedback(null);
        try {
            const nextState = !owner.isSuspended;
            const res = await toggleOwnerSuspensionAction(owner.id, nextState, suspendReason);
            if (!res.success) {
                setFeedback({ type: "error", message: res.error || "Gagal mengubah status akun." });
            } else {
                setFeedback({
                    type: "success",
                    message: nextState
                        ? "Akun pemilik kost berhasil ditangguhkan (Suspended)."
                        : "Akun pemilik kost berhasil diaktifkan kembali.",
                });
                setIsSuspendModalOpen(false);
                setSuspendReason("");
                router.refresh();
            }
        } catch (err: any) {
            setFeedback({ type: "error", message: err?.message || "Terjadi kesalahan sistem." });
        } finally {
            setIsSuspending(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsResettingPwd(true);
        setFeedback(null);
        try {
            const res = await resetOwnerPasswordAction(owner.id, newPassword);
            if (!res.success) {
                setFeedback({ type: "error", message: res.error || "Gagal mereset password." });
            } else {
                setFeedback({ type: "success", message: "Password akun owner berhasil diperbarui!" });
                setIsResetPwdModalOpen(false);
                setNewPassword("");
                router.refresh();
            }
        } catch (err: any) {
            setFeedback({ type: "error", message: err?.message || "Terjadi kesalahan sistem." });
        } finally {
            setIsResettingPwd(false);
        }
    };

    const formatDate = (iso: string | null) => {
        if (!iso) return "-";
        return new Date(iso).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatCurrency = (val: number) => {
        return "Rp " + val.toLocaleString("id-ID");
    };

    const totalRooms = owner.properties.reduce((acc, p) => acc + p.totalRooms, 0);
    const occupiedRooms = owner.properties.reduce((acc, p) => acc + p.occupiedRooms, 0);
    const overallOccupancy = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Breadcrumb & Back */}
            <div className="flex items-center gap-3">
                <Link
                    href="/super-admin/owners"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E2DA] bg-white text-xs font-semibold text-[#5C564E] hover:text-[#1A1A2E] hover:bg-[#FAF7F2] transition-all"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Daftar</span>
                </Link>
                <span className="text-xs text-[#A0A0B2]">/</span>
                <span className="text-xs font-semibold text-[#1A1A2E]">
                    {owner.email || owner.phoneNumber}
                </span>
            </div>

            {/* Alert Feedback */}
            {feedback && (
                <div
                    className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                        feedback.type === "success"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-rose-50 border-rose-200 text-rose-800"
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        {feedback.type === "success" ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        ) : (
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        )}
                        <span>{feedback.message}</span>
                    </div>
                    <button
                        onClick={() => setFeedback(null)}
                        className="text-[#7A7A7A] hover:text-[#1A1A2E]"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Profile Header Card */}
            <div className="bg-white rounded-3xl border border-[#E8E2DA] p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start gap-4 sm:gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8C6239] to-[#5D6654] text-white flex items-center justify-center text-xl font-bold uppercase shadow-inner shrink-0">
                            {owner.email ? owner.email.slice(0, 2) : "OW"}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A2E]">
                                    {owner.email || "Pemilik Kost"}
                                </h1>
                                <span
                                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                        owner.isSuspended
                                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                                            : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                    }`}
                                >
                                    {owner.isSuspended ? "Ditangguhkan" : "Aktif"}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E8E2DA] text-[#5C564E] text-[10px] font-bold">
                                    {owner.role}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#7A7A7A]">
                                {owner.email && (
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 text-[#A0A0B2]" />
                                        <span>{owner.email}</span>
                                    </div>
                                )}
                                {owner.phoneNumber && (
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-[#A0A0B2]" />
                                        <span>{owner.phoneNumber}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-[#A0A0B2]" />
                                    <span>Gabung: {formatDate(owner.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-[#A0A0B2]" />
                                    <span>Last Login: {formatDate(owner.lastLoginAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Control Actions */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <button
                            onClick={handleStartImpersonation}
                            disabled={isImpersonating || owner.isSuspended}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-semibold text-amber-900 shadow-xs transition-all disabled:opacity-50"
                            title="Buka dashboard /admin sebagai pemilik kost ini di tab baru"
                        >
                            {isImpersonating ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                            ) : (
                                <LogIn className="w-3.5 h-3.5 text-amber-700" />
                            )}
                            <span>{isImpersonating ? "Membuka Sesi..." : "Login Sebagai Owner Ini"}</span>
                        </button>

                        <button
                            onClick={() => setIsResetPwdModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8E2DA] bg-[#FAF7F2] hover:bg-white text-xs font-semibold text-[#1A1A2E] shadow-xs transition-all"
                        >
                            <KeyRound className="w-3.5 h-3.5 text-[#8C6239]" />
                            <span>Reset Password</span>
                        </button>

                        <button
                            onClick={() => setIsSuspendModalOpen(true)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all ${
                                owner.isSuspended
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    : "bg-rose-600 hover:bg-rose-700 text-white"
                            }`}
                        >
                            {owner.isSuspended ? (
                                <>
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>Aktifkan Akun</span>
                                </>
                            ) : (
                                <>
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    <span>Tangguhkan (Suspend)</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-white rounded-2xl border border-[#E8E2DA] shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs text-[#7A7A7A] font-medium block">
                            Total Properti Kost
                        </span>
                        <span className="text-2xl font-bold text-[#1A1A2E]">
                            {owner.properties.length} Unit
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8E2DA] flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-[#8C6239]" />
                    </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-[#E8E2DA] shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs text-[#7A7A7A] font-medium block">
                            Kamar Terisi / Total
                        </span>
                        <span className="text-2xl font-bold text-[#1A1A2E]">
                            {occupiedRooms} / {totalRooms}
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8E2DA] flex items-center justify-center">
                        <BedDouble className="w-5 h-5 text-[#5D6654]" />
                    </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-[#E8E2DA] shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs text-[#7A7A7A] font-medium block">
                            Tingkat Okupansi
                        </span>
                        <span className="text-2xl font-bold text-[#1A1A2E]">
                            {overallOccupancy}%
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8E2DA] flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                </div>
            </div>

            {/* Content Tabs Navigation */}
            <div className="flex items-center gap-2 border-b border-[#E8E2DA] pb-2">
                <button
                    onClick={() => setActiveTab("PROPERTIES")}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        activeTab === "PROPERTIES"
                            ? "bg-[#1A1A2E] text-white shadow-xs"
                            : "text-[#7A7A7A] hover:text-[#1A1A2E] hover:bg-white"
                    }`}
                >
                    Properti Kost ({owner.properties.length})
                </button>
                <button
                    onClick={() => setActiveTab("SUBSCRIPTIONS")}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        activeTab === "SUBSCRIPTIONS"
                            ? "bg-[#1A1A2E] text-white shadow-xs"
                            : "text-[#7A7A7A] hover:text-[#1A1A2E] hover:bg-white"
                    }`}
                >
                    Informasi Langganan
                </button>
                <button
                    onClick={() => setActiveTab("AUDIT")}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        activeTab === "AUDIT"
                            ? "bg-[#1A1A2E] text-white shadow-xs"
                            : "text-[#7A7A7A] hover:text-[#1A1A2E] hover:bg-white"
                    }`}
                >
                    Riwayat Audit ({owner.recentLogs.length})
                </button>
            </div>

            {/* Tab 1: Daftar Properti */}
            {activeTab === "PROPERTIES" && (
                <div className="space-y-4">
                    {owner.properties.length === 0 ? (
                        <div className="p-12 text-center bg-white rounded-3xl border border-[#E8E2DA] text-[#A0A0B2]">
                            <Building2 className="w-10 h-10 mx-auto text-[#D1C9BE] mb-2" />
                            <p className="font-semibold text-[#5C564E]">Belum ada properti terdaftar</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {owner.properties.map((prop) => {
                                const occupancy =
                                    prop.totalRooms > 0
                                        ? Math.round((prop.occupiedRooms / prop.totalRooms) * 100)
                                        : 0;

                                return (
                                    <div
                                        key={prop.id}
                                        className="bg-white rounded-2xl border border-[#E8E2DA] p-5 shadow-xs hover:border-[#8C6239] transition-all space-y-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-base font-bold text-[#1A1A2E]">
                                                    {prop.name}
                                                </h3>
                                                <p className="text-xs text-[#7A7A7A] font-mono mt-0.5">
                                                    slug: {prop.slug || "-"}
                                                </p>
                                            </div>
                                            {prop.subscription && (
                                                <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#E8E2DA] text-xs font-bold text-[#8C6239]">
                                                    {prop.subscription.planTier}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-[#5C564E] line-clamp-2">
                                            {prop.address}
                                        </p>

                                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#F2ECE4] text-center">
                                            <div className="p-2 bg-[#FAF7F2] rounded-xl">
                                                <span className="text-[10px] text-[#A0A0B2] block">Total</span>
                                                <span className="font-bold text-xs text-[#1A1A2E]">
                                                    {prop.totalRooms} Kamar
                                                </span>
                                            </div>
                                            <div className="p-2 bg-[#FAF7F2] rounded-xl">
                                                <span className="text-[10px] text-[#A0A0B2] block">Terisi</span>
                                                <span className="font-bold text-xs text-emerald-600">
                                                    {prop.occupiedRooms} Kamar
                                                </span>
                                            </div>
                                            <div className="p-2 bg-[#FAF7F2] rounded-xl">
                                                <span className="text-[10px] text-[#A0A0B2] block">Okupansi</span>
                                                <span className="font-bold text-xs text-[#8C6239]">
                                                    {occupancy}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* Rekening Pencairan Sewa */}
                                        <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8E2DA] flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-4 h-4 text-[#8C6239] shrink-0" />
                                                <div>
                                                    <span className="text-[10px] text-[#A0A0B2] block">Rekening Pencairan Sewa</span>
                                                    {prop.bankName && prop.bankAccountNumber ? (
                                                        <span className="font-bold text-[#1A1A2E]">
                                                            {prop.bankName} — {prop.bankAccountNumber} ({prop.bankAccountHolder})
                                                        </span>
                                                    ) : (
                                                        <span className="text-[#A0A0B2] italic">Belum didaftarkan owner</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Tab 2: Detail Langganan */}
            {activeTab === "SUBSCRIPTIONS" && (
                <div className="space-y-4">
                    {owner.properties.map((prop) => (
                        <div
                            key={prop.id}
                            className="bg-white rounded-2xl border border-[#E8E2DA] p-6 shadow-xs space-y-4"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F2ECE4] pb-4">
                                <div>
                                    <span className="text-xs text-[#7A7A7A] block">Langganan Properti:</span>
                                    <h3 className="text-base font-bold text-[#1A1A2E]">{prop.name}</h3>
                                </div>
                                {prop.subscription && (
                                    <OwnerStatusBadge status={prop.subscription.status} />
                                )}
                            </div>

                            {prop.subscription ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                                    <div className="p-3 bg-[#FAF7F2] rounded-xl">
                                        <span className="text-[#A0A0B2] block mb-1">Paket SaaS</span>
                                        <span className="font-bold text-sm text-[#1A1A2E]">
                                            {prop.subscription.planTier}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-[#FAF7F2] rounded-xl">
                                        <span className="text-[#A0A0B2] block mb-1">Biaya Bulanan</span>
                                        <span className="font-bold text-sm text-[#1A1A2E]">
                                            {formatCurrency(prop.subscription.monthlyPrice)}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-[#FAF7F2] rounded-xl">
                                        <span className="text-[#A0A0B2] block mb-1">Batas Kuota Kamar</span>
                                        <span className="font-bold text-sm text-[#1A1A2E]">
                                            Max {prop.subscription.maxRooms} Kamar
                                        </span>
                                    </div>

                                    <div className="p-3 bg-[#FAF7F2] rounded-xl">
                                        <span className="text-[#A0A0B2] block mb-1">Masa Percobaan / Trial</span>
                                        <span className="font-bold text-sm text-[#8C6239]">
                                            {prop.subscription.trialEndsAt
                                                ? formatDate(prop.subscription.trialEndsAt)
                                                : "Bukan Periode Trial"}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-[#A0A0B2]">
                                    Belum ada lisensi SaaS terikat pada properti ini.
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Tab 3: Riwayat Audit Trail */}
            {activeTab === "AUDIT" && (
                <div className="bg-white rounded-2xl border border-[#E8E2DA] overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAF7F2] text-[#7A7A7A] uppercase text-[10px] font-bold border-b border-[#E8E2DA]">
                            <tr>
                                <th className="py-3 px-4">Aksi Audit</th>
                                <th className="py-3 px-4">Kategori</th>
                                <th className="py-3 px-4">Dilakukan Oleh</th>
                                <th className="py-3 px-4">Waktu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F2ECE4]">
                            {owner.recentLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-[#A0A0B2]">
                                        Belum ada riwayat audit log khusus untuk akun ini.
                                    </td>
                                </tr>
                            ) : (
                                owner.recentLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-[#FAF7F2]/50">
                                        <td className="py-3 px-4 font-mono font-semibold text-[#1A1A2E]">
                                            {log.action}
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-[#8C6239]">
                                            {log.category}
                                        </td>
                                        <td className="py-3 px-4 text-[#5C564E]">
                                            {log.actorEmail || "SYSTEM"}
                                        </td>
                                        <td className="py-3 px-4 text-[#7A7A7A]">
                                            {new Date(log.createdAt).toLocaleString("id-ID")}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal: Suspend / Aktifkan Akun */}
            {isSuspendModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E8E2DA]">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-[#1A1A2E]">
                                {owner.isSuspended ? "Aktifkan Kembali Akun?" : "Tangguhkan Akun Klien?"}
                            </h3>
                            <button
                                onClick={() => setIsSuspendModalOpen(false)}
                                className="text-[#A0A0B2] hover:text-[#1A1A2E]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-xs text-[#5C564E] leading-relaxed">
                            {owner.isSuspended
                                ? "Akun pemilik kost akan diaktifkan kembali. Owner akan dapat login kembali ke konsol web."
                                : "Akses web admin pemilik kost akan diblokir sementara dan status langganan ditandai SUSPENDED. Data anak kost tetap aman."}
                        </p>

                        {!owner.isSuspended && (
                            <div>
                                <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                    Alasan Penangguhan
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Contoh: Belum menyelesaikan tagihan bulan berjalan setelah reminder D+10..."
                                    value={suspendReason}
                                    onChange={(e) => setSuspendReason(e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239]"
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-3">
                            <button
                                onClick={() => setIsSuspendModalOpen(false)}
                                disabled={isSuspending}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7A7A7A] hover:bg-[#FAF7F2]"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleToggleSuspend}
                                disabled={isSuspending}
                                className={`px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition-all ${
                                    owner.isSuspended ? "bg-emerald-600" : "bg-rose-600"
                                }`}
                            >
                                {isSuspending
                                    ? "Memproses..."
                                    : owner.isSuspended
                                    ? "Konfirmasi Aktifkan"
                                    : "Konfirmasi Suspend"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Reset Password Manual */}
            {isResetPwdModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <form
                        onSubmit={handleResetPassword}
                        className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E8E2DA]"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-[#1A1A2E]">
                                Reset Password Klien Manual
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsResetPwdModalOpen(false)}
                                className="text-[#A0A0B2] hover:text-[#1A1A2E]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-xs text-[#5C564E]">
                            Masukkan password baru untuk akun <strong>{owner.email || owner.phoneNumber}</strong>.
                        </p>

                        <div>
                            <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                Password Baru
                            </label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                placeholder="Minimal 6 karakter"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239]"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3">
                            <button
                                type="button"
                                onClick={() => setIsResetPwdModalOpen(false)}
                                disabled={isResettingPwd}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7A7A7A] hover:bg-[#FAF7F2]"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isResettingPwd}
                                className="px-5 py-2 rounded-xl bg-[#1A1A2E] text-white text-xs font-semibold shadow-xs"
                            >
                                {isResettingPwd ? "Menyimpan..." : "Simpan Password Baru"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
