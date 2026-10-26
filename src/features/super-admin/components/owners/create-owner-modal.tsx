"use client";

import { useState } from "react";
import {
    createOwnerWithPropertyAction,
    CreateOwnerInput,
} from "@/features/super-admin/actions/owners-actions";
import { PLAN_TIER_CONFIG } from "@/features/super-admin/constants/plan-constants";
import { SaaSPlanTier } from "@prisma/client";
import {
    X,
    UserPlus,
    Building2,
    Shield,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    Loader2,
} from "lucide-react";

interface CreateOwnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateOwnerModal({
    isOpen,
    onClose,
    onSuccess,
}: CreateOwnerModalProps) {
    const [formData, setFormData] = useState<CreateOwnerInput>({
        email: "",
        phoneNumber: "",
        password: "",
        fullName: "",
        propertyName: "",
        propertySlug: "",
        address: "",
        planTier: "STARTER",
        trialDays: 14,
        forceReset: true,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    const handlePropertyNameChange = (name: string) => {
        const autoSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        setFormData((prev) => ({
            ...prev,
            propertyName: name,
            propertySlug: autoSlug,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        try {
            const res = await createOwnerWithPropertyAction(formData);

            if (!res.success) {
                setError(res.error || "Gagal membuat akun pemilik kost.");
                setIsLoading(false);
                return;
            }

            setSuccessMessage("Akun Pemilik Kost & Properti berhasil dibuat!");
            setTimeout(() => {
                setIsLoading(false);
                onClose();
                if (onSuccess) onSuccess();
            }, 1200);
        } catch (err: any) {
            setError(err?.message || "Terjadi kesalahan sistem.");
            setIsLoading(false);
        }
    };

    const tierOptions: SaaSPlanTier[] = ["FREE", "STARTER", "GROWTH", "PRO", "ENTERPRISE"];

    const formatRupiah = (val: number) => {
        if (val === 0) return "Gratis";
        return `Rp ${val.toLocaleString("id-ID")}/bln`;
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E8E2DA] my-8 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#F2ECE4] pb-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#8C6239]/10 border border-[#8C6239]/20 flex items-center justify-center text-[#8C6239]">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#1A1A2E] tracking-tight">
                                Tambah Pemilik Kost (B2B Client)
                            </h3>
                            <p className="text-xs text-[#7A7A7A]">
                                Daftarkan akun klien, buat properti pertama, dan tetapkan lisensi SaaS secara instan.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-2 rounded-xl text-[#A0A0B2] hover:text-[#1A1A2E] hover:bg-[#FAF7F2] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section 1: Akun Pemilik */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C6239]">
                            <Shield className="w-4 h-4" />
                            <span>1. Kredensial & Kontak Klien</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                    Email Klien <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="owner@example.com"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239] transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                    Nomor WhatsApp <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="081234567890"
                                    value={formData.phoneNumber}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phoneNumber: e.target.value })
                                    }
                                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239] transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                    Nama Lengkap / Penanggung Jawab
                                </label>
                                <input
                                    type="text"
                                    placeholder="Bpk. Hendra Gunawan"
                                    value={formData.fullName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, fullName: e.target.value })
                                    }
                                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239] transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                    Password Awal <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    placeholder="Minimal 6 karakter"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239] transition-all"
                                />
                            </div>
                        </div>

                        {/* Force Reset Toggle */}
                        <div className="flex items-center gap-3 p-3 bg-[#FAF7F2] rounded-xl border border-[#E8E2DA]">
                            <input
                                type="checkbox"
                                id="forceReset"
                                checked={formData.forceReset}
                                onChange={(e) =>
                                    setFormData({ ...formData, forceReset: e.target.checked })
                                }
                                className="w-4 h-4 text-[#8C6239] rounded accent-[#8C6239]"
                            />
                            <label htmlFor="forceReset" className="text-xs text-[#5C564E] cursor-pointer">
                                <span className="font-semibold text-[#1A1A2E] block">
                                    Wajibkan ganti password saat login perdana
                                </span>
                                Klien akan diminta membuat password rahasia baru saat pertama kali login ke dashboard.
                            </label>
                        </div>
                    </div>

                    {/* Section 2: Properti Pertama */}
                    <div className="space-y-4 pt-2 border-t border-[#F2ECE4]">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C6239]">
                            <Building2 className="w-4 h-4" />
                            <span>2. Data Kost Perdana</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                    Nama Kost <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Smartkost Kemang Sanctuary"
                                    value={formData.propertyName}
                                    onChange={(e) => handlePropertyNameChange(e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239] transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                    Slug Subdomain Kost <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        required
                                        placeholder="kemang-sanctuary"
                                        value={formData.propertySlug}
                                        onChange={(e) =>
                                            setFormData({ ...formData, propertySlug: e.target.value })
                                        }
                                        className="w-full px-3.5 py-2.5 text-xs font-mono bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                    Alamat Lengkap Kost <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={2}
                                    placeholder="Jl. Kemang Timur No. 45, Jakarta Selatan"
                                    value={formData.address}
                                    onChange={(e) =>
                                        setFormData({ ...formData, address: e.target.value })
                                    }
                                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239] transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Paket SaaS */}
                    <div className="space-y-4 pt-2 border-t border-[#F2ECE4]">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C6239]">
                            <Sparkles className="w-4 h-4" />
                            <span>3. Penugasan Lisensi & Paket SaaS</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                    Pilihan Tier Paket
                                </label>
                                <select
                                    value={formData.planTier}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            planTier: e.target.value as SaaSPlanTier,
                                        })
                                    }
                                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239] transition-all font-semibold"
                                >
                                    {tierOptions.map((tier) => {
                                        const cfg = PLAN_TIER_CONFIG[tier];
                                        return (
                                            <option key={tier} value={tier}>
                                                {tier} — Max {cfg.maxRooms} Kamar ({formatRupiah(cfg.defaultMonthlyPrice)})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                    Masa Percobaan (Trial Hari)
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={90}
                                    value={formData.trialDays}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            trialDays: parseInt(e.target.value) || 0,
                                        })
                                    }
                                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239] transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F2ECE4]">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-5 py-2.5 rounded-xl border border-[#E8E2DA] text-xs font-semibold text-[#7A7A7A] hover:text-[#1A1A2E] hover:bg-[#FAF7F2] transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1A1A2E] hover:bg-[#25253D] text-[#FAF7F2] text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A843]" />
                                    <span>Memproses Onboarding...</span>
                                </>
                            ) : (
                                <span>Buat Akun Pemilik & Kost</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
