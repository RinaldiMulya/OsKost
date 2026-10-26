"use client";

import { useState } from "react";
import { updateSaaSPlanAction } from "@/features/super-admin/actions/plans-actions";
import {
    SaaSPlanItem,
    PlanFeatureMatrix,
} from "@/features/super-admin/constants/plan-constants";
import {
    X,
    Sliders,
    Sparkles,
    Check,
    AlertCircle,
    CheckCircle2,
    Loader2,
} from "lucide-react";

interface EditPlanModalProps {
    plan: SaaSPlanItem | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function EditPlanModal({
    plan,
    isOpen,
    onClose,
    onSuccess,
}: EditPlanModalProps) {
    if (!isOpen || !plan) return null;

    const [name, setName] = useState(plan.name);
    const [description, setDescription] = useState(plan.description || "");
    const [monthlyPrice, setMonthlyPrice] = useState(plan.monthlyPrice);
    const [annualPrice, setAnnualPrice] = useState(plan.annualPrice);
    const [maxRooms, setMaxRooms] = useState(plan.maxRooms);
    const [maxProperties, setMaxProperties] = useState(plan.maxProperties);
    const [isPopular, setIsPopular] = useState(plan.isPopular);
    const [isActive, setIsActive] = useState(plan.isActive);
    const [features, setFeatures] = useState<PlanFeatureMatrix>(plan.features);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const toggleFeature = (key: keyof PlanFeatureMatrix) => {
        setFeatures((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        try {
            const res = await updateSaaSPlanAction({
                id: plan.id,
                name,
                description,
                monthlyPrice,
                annualPrice,
                maxRooms,
                maxProperties,
                isPopular,
                isActive,
                features,
            });

            if (!res.success) {
                setError(res.error || "Gagal memperbarui paket.");
                setIsLoading(false);
                return;
            }

            setSuccessMessage("Paket harga berhasil diperbarui!");
            setTimeout(() => {
                setIsLoading(false);
                onClose();
                if (onSuccess) onSuccess();
            }, 1000);
        } catch (err: any) {
            setError(err?.message || "Terjadi kesalahan sistem.");
            setIsLoading(false);
        }
    };

    const featureDefinitions: Array<{
        key: keyof PlanFeatureMatrix;
        label: string;
        desc: string;
    }> = [
        {
            key: "adminDashboard",
            label: "Dashboard Pengelola Kost",
            desc: "Akses web app manajemen kamar, tenant, dan transaksi.",
        },
        {
            key: "midtransGateway",
            label: "Payment Gateway Otomatis (Midtrans)",
            desc: "Pembayaran sewa otomatis via QRIS & Virtual Account.",
        },
        {
            key: "photo360Tour",
            label: "Virtual Tour Foto 360°",
            desc: "Dukungan upload dan display panorama kamar 360 derajat.",
        },
        {
            key: "smartLock",
            label: "Integrasi Smart Door Lock IoT",
            desc: "Kontrol kunci pintu digital otomatis saat check-in/out.",
        },
        {
            key: "customDomain",
            label: "Subdomain Kustom Kost",
            desc: "Landing page profil kost mandiri (e.g. namakost.oskost.id).",
        },
        {
            key: "exportReports",
            label: "Ekspor Laporan Keuangan",
            desc: "Download rekapitulasi cash flow dalam format Excel & PDF.",
        },
        {
            key: "dedicatedSupport",
            label: "Dukungan Prioritas 24/7",
            desc: "Dedicated account manager & bantuan teknis hotline.",
        },
    ];

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-[#E8E2DA] my-8 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#F2ECE4] pb-4 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#8C6239]/10 border border-[#8C6239]/20 flex items-center justify-center text-[#8C6239]">
                            <Sliders className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-[#1A1A2E]">
                                Konfigurasi Paket: {plan.tier}
                            </h3>
                            <p className="text-xs text-[#7A7A7A]">
                                Ubah tarif bulanan, batas kuota kamar, dan fitur aktif.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-1.5 rounded-xl text-[#A0A0B2] hover:text-[#1A1A2E] hover:bg-[#FAF7F2]"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                Nama Tampilan Paket
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                Batas Kuota Kamar (Max Rooms)
                            </label>
                            <input
                                type="number"
                                required
                                min={1}
                                max={5000}
                                value={maxRooms}
                                onChange={(e) => setMaxRooms(parseInt(e.target.value) || 1)}
                                className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                Harga Bulanan (Rp)
                            </label>
                            <input
                                type="number"
                                required
                                min={0}
                                step={1000}
                                value={monthlyPrice}
                                onChange={(e) => setMonthlyPrice(parseInt(e.target.value) || 0)}
                                className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                Harga Tahunan (Rp)
                            </label>
                            <input
                                type="number"
                                required
                                min={0}
                                step={1000}
                                value={annualPrice}
                                onChange={(e) => setAnnualPrice(parseInt(e.target.value) || 0)}
                                className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239]"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                Deskripsi Paket
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239]"
                            />
                        </div>
                    </div>

                    {/* Flags */}
                    <div className="flex items-center gap-6 p-3 bg-[#FAF7F2] rounded-xl border border-[#E8E2DA] text-xs">
                        <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#1A1A2E]">
                            <input
                                type="checkbox"
                                checked={isPopular}
                                onChange={(e) => setIsPopular(e.target.checked)}
                                className="accent-[#8C6239] w-4 h-4 rounded"
                            />
                            <span>Tandai Sebagai Paket Populer</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#1A1A2E]">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="accent-[#8C6239] w-4 h-4 rounded"
                            />
                            <span>Paket Aktif Ditawarkan</span>
                        </label>
                    </div>

                    {/* Feature Matrix Checklist */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-[#1A1A2E] uppercase tracking-wider">
                            Matriks Fitur yang Disertakan
                        </label>
                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                            {featureDefinitions.map((f) => (
                                <div
                                    key={f.key}
                                    onClick={() => toggleFeature(f.key)}
                                    className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                                        features[f.key]
                                            ? "bg-white border-[#8C6239]/60 shadow-xs"
                                            : "bg-[#FAF7F2]/50 border-[#E8E2DA] opacity-70"
                                    }`}
                                >
                                    <div>
                                        <span className="font-semibold text-[#1A1A2E] block">
                                            {f.label}
                                        </span>
                                        <span className="text-[11px] text-[#7A7A7A]">
                                            {f.desc}
                                        </span>
                                    </div>
                                    <div
                                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                            features[f.key]
                                                ? "bg-[#8C6239] border-[#8C6239] text-white"
                                                : "border-[#E8E2DA] bg-white"
                                        }`}
                                    >
                                        {features[f.key] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F2ECE4]">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-xs font-semibold text-[#7A7A7A] hover:bg-[#FAF7F2] rounded-xl"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 px-5 py-2 bg-[#1A1A2E] hover:bg-[#25253D] text-[#FAF7F2] text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A843]" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <span>Simpan Konfigurasi</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
