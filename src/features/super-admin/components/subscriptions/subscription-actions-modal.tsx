"use client";

import { useState } from "react";
import {
    SubscriptionItem,
    updateSubscriptionPlanAction,
    extendSubscriptionTrialAction,
    overrideSubscriptionStatusAction,
} from "@/features/super-admin/actions/subscriptions-actions";
import { generateSaaSPaymentLinkAction } from "@/features/super-admin/actions/saas-payment-actions";
import { PLAN_TIER_CONFIG } from "@/features/super-admin/constants/plan-constants";
import { SaaSPlanTier, SubscriptionStatus } from "@prisma/client";
import {
    X,
    CreditCard,
    Sparkles,
    CalendarPlus,
    Sliders,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Link as LinkIcon,
    Copy,
    Check,
    ExternalLink,
    MessageCircle,
} from "lucide-react";

interface SubscriptionActionsModalProps {
    subscription: SubscriptionItem | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function SubscriptionActionsModal({
    subscription,
    isOpen,
    onClose,
    onSuccess,
}: SubscriptionActionsModalProps) {
    const [actionType, setActionType] = useState<"TIER" | "TRIAL" | "STATUS" | "PAYMENT_LINK">("TIER");

    // Tier state
    const [selectedTier, setSelectedTier] = useState<SaaSPlanTier>(
        (subscription?.planTier as SaaSPlanTier) || "STARTER"
    );

    // Trial state
    const [trialDays, setTrialDays] = useState<number>(14);

    // Status state
    const [selectedStatus, setSelectedStatus] = useState<SubscriptionStatus>(
        (subscription?.status as SubscriptionStatus) || "ACTIVE"
    );
    const [statusNotes, setStatusNotes] = useState("");

    // Payment link generation state
    const [paymentPeriodMonths, setPaymentPeriodMonths] = useState<number>(1);
    const [paymentAmount, setPaymentAmount] = useState<number>(
        subscription?.monthlyPrice || PLAN_TIER_CONFIG[subscription?.planTier as SaaSPlanTier || "STARTER"].defaultMonthlyPrice
    );
    const [generatedLinkData, setGeneratedLinkData] = useState<{
        snapUrl: string;
        orderId: string;
    } | null>(null);
    const [copiedLink, setCopiedLink] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    if (!isOpen || !subscription) return null;

    const handlePeriodChange = (months: number) => {
        setPaymentPeriodMonths(months);
        const monthly = PLAN_TIER_CONFIG[selectedTier].defaultMonthlyPrice;
        if (months === 12) {
            // Annual discount: 10x monthly
            setPaymentAmount(monthly * 10);
        } else {
            setPaymentAmount(monthly * months);
        }
    };

    const handleTierChangeForPayment = (tier: SaaSPlanTier) => {
        setSelectedTier(tier);
        const monthly = PLAN_TIER_CONFIG[tier].defaultMonthlyPrice;
        if (paymentPeriodMonths === 12) {
            setPaymentAmount(monthly * 10);
        } else {
            setPaymentAmount(monthly * paymentPeriodMonths);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        try {
            if (actionType === "TIER") {
                const res = await updateSubscriptionPlanAction(subscription.id, selectedTier);
                if (!res.success) throw new Error(res.error || "Gagal mengubah paket.");
                setSuccessMessage(`Paket berhasil diubah ke ${selectedTier}!`);
                setTimeout(() => {
                    setIsLoading(false);
                    onClose();
                    if (onSuccess) onSuccess();
                }, 1000);
            } else if (actionType === "TRIAL") {
                const res = await extendSubscriptionTrialAction(subscription.id, trialDays);
                if (!res.success) throw new Error(res.error || "Gagal memperpanjang trial.");
                setSuccessMessage(`Masa trial berhasil diperpanjang +${trialDays} hari!`);
                setTimeout(() => {
                    setIsLoading(false);
                    onClose();
                    if (onSuccess) onSuccess();
                }, 1000);
            } else if (actionType === "STATUS") {
                const res = await overrideSubscriptionStatusAction(
                    subscription.id,
                    selectedStatus,
                    statusNotes
                );
                if (!res.success) throw new Error(res.error || "Gagal mengubah status.");
                setSuccessMessage(`Status langganan diubah menjadi ${selectedStatus}!`);
                setTimeout(() => {
                    setIsLoading(false);
                    onClose();
                    if (onSuccess) onSuccess();
                }, 1000);
            } else if (actionType === "PAYMENT_LINK") {
                const res = await generateSaaSPaymentLinkAction({
                    propertyId: subscription.propertyId,
                    planTier: selectedTier,
                    periodMonths: paymentPeriodMonths,
                    amount: paymentAmount,
                    notes: `Tagihan langganan SaaS paket ${selectedTier} selama ${paymentPeriodMonths} bulan`,
                });

                if (!res.success || !res.snapUrl) {
                    throw new Error(res.error || "Gagal generate link Midtrans Snap.");
                }

                setGeneratedLinkData({
                    snapUrl: res.snapUrl,
                    orderId: res.orderId || "",
                });
                setSuccessMessage("Link pembayaran Midtrans Snap berhasil dibuat!");
                setIsLoading(false);
                if (onSuccess) onSuccess();
            }
        } catch (err: any) {
            setError(err?.message || "Terjadi kesalahan sistem.");
            setIsLoading(false);
        }
    };

    const tierOptions: SaaSPlanTier[] = ["FREE", "STARTER", "GROWTH", "PRO", "ENTERPRISE"];
    const statusOptions: SubscriptionStatus[] = [
        "ACTIVE",
        "TRIAL",
        "PAST_DUE",
        "SUSPENDED",
        "CANCELLED",
    ];

    const cleanOwnerPhone = subscription.ownerPhone
        ? subscription.ownerPhone.replace(/^0/, "62").replace(/[^0-9]/g, "")
        : "";

    const whatsappMessage = generatedLinkData
        ? encodeURIComponent(
              `Halo Bapak/Ibu Pemilik ${subscription.propertyName},\n\nBerikut link pembayaran langganan SaaS OsKost paket *${selectedTier}* (${paymentPeriodMonths} bulan) sebesar *Rp ${paymentAmount.toLocaleString("id-ID")}*:\n\n👉 ${generatedLinkData.snapUrl}\n\nSetelah pembayaran berhasil, akun dan kuota sistem otomatis aktif.\nTerima kasih,\nTim OsKost Platform`
          )
        : "";

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#E8E2DA] space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#F2ECE4] pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#8C6239]/10 border border-[#8C6239]/20 flex items-center justify-center text-[#8C6239]">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-[#1A1A2E]">
                                Kelola Langganan SaaS
                            </h3>
                            <p className="text-xs text-[#7A7A7A]">
                                Properti: <span className="font-semibold text-[#1A1A2E]">{subscription.propertyName}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-1.5 rounded-xl text-[#A0A0B2] hover:text-[#1A1A2E] hover:bg-[#FAF7F2] cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Mode Selector Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-[#FAF7F2] rounded-2xl border border-[#E8E2DA]">
                    <button
                        type="button"
                        onClick={() => {
                            setActionType("TIER");
                            setGeneratedLinkData(null);
                        }}
                        className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            actionType === "TIER"
                                ? "bg-white text-[#1A1A2E] shadow-xs"
                                : "text-[#7A7A7A] hover:text-[#1A1A2E]"
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5 text-[#8C6239]" />
                        <span>Paket</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActionType("PAYMENT_LINK");
                            setGeneratedLinkData(null);
                        }}
                        className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            actionType === "PAYMENT_LINK"
                                ? "bg-white text-emerald-800 shadow-xs border border-emerald-200"
                                : "text-[#7A7A7A] hover:text-[#1A1A2E]"
                        }`}
                    >
                        <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Link Bayar</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActionType("TRIAL");
                            setGeneratedLinkData(null);
                        }}
                        className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            actionType === "TRIAL"
                                ? "bg-white text-[#1A1A2E] shadow-xs"
                                : "text-[#7A7A7A] hover:text-[#1A1A2E]"
                        }`}
                    >
                        <CalendarPlus className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Trial</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActionType("STATUS");
                            setGeneratedLinkData(null);
                        }}
                        className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            actionType === "STATUS"
                                ? "bg-white text-[#1A1A2E] shadow-xs"
                                : "text-[#7A7A7A] hover:text-[#1A1A2E]"
                        }`}
                    >
                        <Sliders className="w-3.5 h-3.5 text-sky-600" />
                        <span>Status</span>
                    </button>
                </div>

                {/* Feedback Alerts */}
                {error && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Action 1: Ubah Tier Paket */}
                    {actionType === "TIER" && (
                        <div className="space-y-3">
                            <label className="block text-xs font-semibold text-[#2D2D2D]">
                                Pilih Tier Baru (Upgrade / Downgrade)
                            </label>
                            <div className="space-y-2">
                                {tierOptions.map((tier) => {
                                    const cfg = PLAN_TIER_CONFIG[tier];
                                    const isCurrent = subscription.planTier === tier;
                                    const isSelected = selectedTier === tier;

                                    return (
                                        <div
                                            key={tier}
                                            onClick={() => setSelectedTier(tier)}
                                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                                                isSelected
                                                    ? "bg-[#FAF7F2] border-[#8C6239] shadow-xs"
                                                    : "bg-white border-[#E8E2DA] hover:border-[#8C6239]/50"
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-xs text-[#1A1A2E]">
                                                        {tier}
                                                    </span>
                                                    {isCurrent && (
                                                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                                                            Paket Saat Ini
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-[#7A7A7A] mt-0.5">
                                                    Maks. {cfg.maxRooms} Kamar • Rp{" "}
                                                    {cfg.defaultMonthlyPrice.toLocaleString("id-ID")}/bln
                                                </p>
                                            </div>
                                            <div
                                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                                    isSelected
                                                        ? "border-[#8C6239] bg-[#8C6239]"
                                                        : "border-[#A0A0B2]"
                                                }`}
                                            >
                                                {isSelected && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Action 2: Link Pembayaran Midtrans Snap */}
                    {actionType === "PAYMENT_LINK" && (
                        <div className="space-y-4">
                            {!generatedLinkData ? (
                                <>
                                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                                        💡 Sistem akan membuat invoice transaksi SaaS dan men-generate link <strong>Midtrans Snap</strong> (Gateway Platform OsKost). Link dapat dikirimkan ke pemilik kost via WhatsApp.
                                    </div>

                                    {/* Pilih Paket */}
                                    <div>
                                        <label className="block text-xs font-semibold text-[#2D2D2D] mb-1.5">
                                            Pilihan Paket Langganan:
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(["STARTER", "GROWTH", "PRO"] as const).map((t) => (
                                                <button
                                                    type="button"
                                                    key={t}
                                                    onClick={() => handleTierChangeForPayment(t)}
                                                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                                        selectedTier === t
                                                            ? "bg-[#1A1A2E] text-white border-[#1A1A2E]"
                                                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                                    }`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Periode Bulan */}
                                    <div>
                                        <label className="block text-xs font-semibold text-[#2D2D2D] mb-1.5">
                                            Durasi Langganan:
                                        </label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[
                                                { m: 1, label: "1 Bulan" },
                                                { m: 3, label: "3 Bulan" },
                                                { m: 6, label: "6 Bulan" },
                                                { m: 12, label: "1 Tahun (Hemat)" },
                                            ].map((item) => (
                                                <button
                                                    type="button"
                                                    key={item.m}
                                                    onClick={() => handlePeriodChange(item.m)}
                                                    className={`py-2 px-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer text-center ${
                                                        paymentPeriodMonths === item.m
                                                            ? "bg-[#8C6239] text-white border-[#8C6239]"
                                                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                                    }`}
                                                >
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Nominal Tagihan */}
                                    <div>
                                        <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                            Nominal Tagihan (Rp):
                                        </label>
                                        <input
                                            type="number"
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(parseInt(e.target.value) || 0)}
                                            className="w-full px-3.5 py-2 text-sm font-bold bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239]"
                                        />
                                        <span className="text-[11px] text-gray-400 mt-1 block">
                                            Terbilang: Rp {paymentAmount.toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                /* Hasil Link yang Sudah di-Generate */
                                <div className="space-y-3 p-4 bg-emerald-50/70 rounded-2xl border border-emerald-300">
                                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>Link Midtrans Snap Siap Dikirim!</span>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-[11px] text-gray-500 font-mono">
                                            Order ID: {generatedLinkData.orderId}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                readOnly
                                                value={generatedLinkData.snapUrl}
                                                className="w-full text-xs font-mono bg-white border border-emerald-200 rounded-xl px-3 py-2 text-gray-800 select-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(generatedLinkData.snapUrl)}
                                                className="px-3 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 flex items-center gap-1 shrink-0 cursor-pointer"
                                            >
                                                {copiedLink ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                        <span>Disalin!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3.5 h-3.5" />
                                                        <span>Salin</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {cleanOwnerPhone && (
                                            <a
                                                href={`https://api.whatsapp.com/send?phone=${cleanOwnerPhone}&text=${whatsappMessage}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                <span>Kirim WhatsApp ke Owner</span>
                                            </a>
                                        )}

                                        <a
                                            href={generatedLinkData.snapUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 text-xs font-semibold transition-colors"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5 text-[#8C6239]" />
                                            <span>Buka Pembayaran Snap</span>
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action 3: Perpanjang Trial */}
                    {actionType === "TRIAL" && (
                        <div className="space-y-3">
                            <label className="block text-xs font-semibold text-[#2D2D2D]">
                                Tambahkan Hari Masa Percobaan (Trial)
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[7, 14, 30].map((days) => (
                                    <button
                                        type="button"
                                        key={days}
                                        onClick={() => setTrialDays(days)}
                                        className={`py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                            trialDays === days
                                                ? "bg-[#1A1A2E] text-white border-[#1A1A2E] shadow-xs"
                                                : "bg-[#FAF7F2] text-[#5C564E] border-[#E8E2DA] hover:bg-white"
                                        }`}
                                    >
                                        +{days} Hari
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label className="block text-[11px] text-[#7A7A7A] mt-2 mb-1">
                                    Atau tentukan jumlah hari kustom:
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={90}
                                    value={trialDays}
                                    onChange={(e) => setTrialDays(parseInt(e.target.value) || 1)}
                                    className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239]"
                                />
                            </div>
                        </div>
                    )}

                    {/* Action 4: Override Status */}
                    {actionType === "STATUS" && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                    Status Langganan Baru
                                </label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) =>
                                        setSelectedStatus(e.target.value as SubscriptionStatus)
                                    }
                                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239] font-semibold"
                                >
                                    {statusOptions.map((st) => (
                                        <option key={st} value={st}>
                                            {st}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                    Catatan / Alasan Perubahan Status
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Contoh: Pembayaran transfer BCA manual tervalidasi oleh Super Admin"
                                    value={statusNotes}
                                    onChange={(e) => setStatusNotes(e.target.value)}
                                    className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239]"
                                />
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F2ECE4]">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-xs font-semibold text-[#7A7A7A] hover:bg-[#FAF7F2] rounded-xl cursor-pointer"
                        >
                            Tutup
                        </button>
                        {(!generatedLinkData || actionType !== "PAYMENT_LINK") && (
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex items-center gap-2 px-5 py-2 bg-[#1A1A2E] hover:bg-[#25253D] text-[#FAF7F2] text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A843]" />
                                        <span>Memproses...</span>
                                    </>
                                ) : actionType === "PAYMENT_LINK" ? (
                                    <>
                                        <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>Generate Link Snap</span>
                                    </>
                                ) : (
                                    <span>Terapkan Perubahan</span>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
