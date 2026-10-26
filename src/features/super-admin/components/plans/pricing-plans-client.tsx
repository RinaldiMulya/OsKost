"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SaaSPlanItem } from "@/features/super-admin/constants/plan-constants";
import { EditPlanModal } from "./edit-plan-modal";
import {
    Sparkles,
    Check,
    X as XIcon,
    ArrowLeft,
    Sliders,
    Building2,
    BedDouble,
    Shield,
} from "lucide-react";

interface PricingPlansClientProps {
    initialPlans: SaaSPlanItem[];
}

export function PricingPlansClient({ initialPlans }: PricingPlansClientProps) {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState<SaaSPlanItem | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const formatCurrency = (val: number) => {
        if (val === 0) return "Gratis";
        return "Rp " + val.toLocaleString("id-ID");
    };

    const featureKeys: Array<{
        key: keyof SaaSPlanItem["features"];
        label: string;
    }> = [
        { key: "adminDashboard", label: "Dashboard Pengelola Kost" },
        { key: "midtransGateway", label: "Payment Gateway Otomatis (QRIS/VA)" },
        { key: "photo360Tour", label: "Virtual Tour Foto 360°" },
        { key: "smartLock", label: "Integrasi Smart Door Lock IoT" },
        { key: "customDomain", label: "Subdomain Kustom Kost" },
        { key: "exportReports", label: "Ekspor Laporan Excel/PDF" },
        { key: "dedicatedSupport", label: "Dukungan Prioritas 24/7" },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2DA] pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link
                            href="/super-admin/subscriptions"
                            className="inline-flex items-center gap-1 text-xs text-[#7A7A7A] hover:text-[#1A1A2E]"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Kembali ke Langganan</span>
                        </Link>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A2E] flex items-center gap-2.5">
                        <Sliders className="w-7 h-7 text-[#8C6239]" />
                        <span>Kelola Paket Lisensi & Harga SaaS</span>
                    </h1>
                    <p className="text-sm text-[#7A7A7A] mt-1">
                        Pusat pengaturan tarif langganan, kuota unit kamar maksimal, dan hak akses fitur per tier paket.
                    </p>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {initialPlans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`bg-white rounded-3xl border p-5 flex flex-col justify-between transition-all relative ${
                            plan.isPopular
                                ? "border-[#8C6239] shadow-md ring-2 ring-[#8C6239]/20"
                                : "border-[#E8E2DA] shadow-xs hover:border-[#8C6239]/50"
                        }`}
                    >
                        {plan.isPopular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8C6239] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                                <Sparkles className="w-3 h-3" />
                                <span>Paling Populer</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Tier Badge & Name */}
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E8E2DA] text-[#8C6239]">
                                    {plan.tier}
                                </span>
                                <h3 className="text-base font-bold text-[#1A1A2E] mt-2">
                                    {plan.name}
                                </h3>
                                <p className="text-xs text-[#7A7A7A] mt-1 line-clamp-2">
                                    {plan.description}
                                </p>
                            </div>

                            {/* Price */}
                            <div className="pt-2 border-t border-[#F2ECE4]">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-bold text-[#1A1A2E]">
                                        {formatCurrency(plan.monthlyPrice)}
                                    </span>
                                    {plan.monthlyPrice > 0 && (
                                        <span className="text-xs text-[#7A7A7A]">/bln</span>
                                    )}
                                </div>
                                {plan.annualPrice > 0 && (
                                    <span className="text-[11px] text-[#5D6654] font-medium block mt-0.5">
                                        atau {formatCurrency(plan.annualPrice)} /tahun
                                    </span>
                                )}
                            </div>

                            {/* Quota Specs */}
                            <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8E2DA] space-y-1.5 text-xs">
                                <div className="flex items-center justify-between text-[#5C564E]">
                                    <span className="flex items-center gap-1.5">
                                        <BedDouble className="w-3.5 h-3.5 text-[#8C6239]" />
                                        <span>Kuota Kamar:</span>
                                    </span>
                                    <span className="font-bold text-[#1A1A2E]">
                                        Max {plan.maxRooms} Kamar
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-[#5C564E]">
                                    <span className="flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5 text-[#5D6654]" />
                                        <span>Maks Properti:</span>
                                    </span>
                                    <span className="font-bold text-[#1A1A2E]">
                                        {plan.maxProperties} Kost
                                    </span>
                                </div>
                            </div>

                            {/* Feature Matrix Checklist */}
                            <div className="space-y-2 pt-2 border-t border-[#F2ECE4]">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A0A0B2] block">
                                    Fitur Termasuk:
                                </span>
                                <div className="space-y-1.5 text-[11px]">
                                    {featureKeys.map((f) => {
                                        const isEnabled = plan.features[f.key];
                                        return (
                                            <div
                                                key={f.key}
                                                className={`flex items-start gap-1.5 ${
                                                    isEnabled ? "text-[#2D2D2D]" : "text-[#A0A0B2] opacity-60"
                                                }`}
                                            >
                                                {isEnabled ? (
                                                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                                ) : (
                                                    <XIcon className="w-3.5 h-3.5 text-[#D1C9BE] shrink-0 mt-0.5" />
                                                )}
                                                <span>{f.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <div className="pt-4 mt-4 border-t border-[#F2ECE4]">
                            <button
                                onClick={() => {
                                    setSelectedPlan(plan);
                                    setIsEditModalOpen(true);
                                }}
                                className="w-full py-2 px-3 rounded-xl border border-[#E8E2DA] bg-[#FAF7F2] hover:bg-white text-[#1A1A2E] text-xs font-semibold shadow-xs hover:border-[#8C6239] transition-all"
                            >
                                Edit Paket
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Edit Paket */}
            <EditPlanModal
                plan={selectedPlan}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedPlan(null);
                }}
                onSuccess={() => {
                    router.refresh();
                }}
            />
        </div>
    );
}
