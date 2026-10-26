"use client";

import { useState } from "react";
import { SubscriptionItem } from "@/features/super-admin/actions/subscriptions-actions";
import { SubscriptionTierBadge } from "./subscription-tier-badge";
import { OwnerStatusBadge } from "@/features/super-admin/components/owners/owner-status-badge";
import { SubscriptionActionsModal } from "./subscription-actions-modal";
import {
    Search,
    CreditCard,
    Calendar,
    Building2,
    Clock,
    ArrowUpRight,
    SlidersHorizontal,
} from "lucide-react";

interface SubscriptionsTableProps {
    initialSubscriptions: SubscriptionItem[];
}

export function SubscriptionsTable({
    initialSubscriptions,
}: SubscriptionsTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filtered = initialSubscriptions.filter((sub) => {
        if (statusFilter !== "ALL" && sub.status !== statusFilter) return false;

        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            sub.propertyName.toLowerCase().includes(q) ||
            sub.ownerEmail.toLowerCase().includes(q) ||
            sub.planTier.toLowerCase().includes(q)
        );
    });

    const formatCurrency = (val: number) => {
        return "Rp " + val.toLocaleString("id-ID");
    };

    const formatDate = (isoString: string | null) => {
        if (!isoString) return "-";
        return new Date(isoString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-4 rounded-2xl border border-[#E8E2DA] shadow-xs">
                {/* Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {["ALL", "ACTIVE", "TRIAL", "PAST_DUE"].map((st) => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                                statusFilter === st
                                    ? "bg-[#1A1A2E] text-[#FAF7F2] shadow-xs"
                                    : "text-[#7A7A7A] hover:text-[#2D2D2D] hover:bg-[#FAF7F2]"
                            }`}
                        >
                            {st === "ALL"
                                ? "Semua Langganan"
                                : st === "ACTIVE"
                                ? "Aktif"
                                : st === "TRIAL"
                                ? "Trial"
                                : "Past Due"}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-[#A0A0B2] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Cari properti atau email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239] transition-all text-[#2D2D2D]"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8E2DA] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAF7F2] border-b border-[#E8E2DA] text-[#5C564E] font-bold uppercase tracking-wider">
                            <tr>
                                <th className="py-3.5 px-5">Properti & Pemilik</th>
                                <th className="py-3.5 px-4">Paket SaaS</th>
                                <th className="py-3.5 px-4">Kuota Kamar</th>
                                <th className="py-3.5 px-4">Biaya Langganan</th>
                                <th className="py-3.5 px-4">Jatuh Tempo</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0EBE1]">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-[#7A7A7A]">
                                        Tidak ada data langganan yang cocok.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((sub) => {
                                    const expiry = sub.trialEndsAt || sub.currentPeriodEnd;
                                    return (
                                        <tr
                                            key={sub.id}
                                            className="hover:bg-[#FAF7F2]/60 transition-colors"
                                        >
                                            {/* Properti & Owner */}
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-[#5D6654]/10 text-[#5D6654] font-bold flex items-center justify-center shrink-0 border border-[#5D6654]/20">
                                                        <Building2 className="w-4 h-4" />
                                                    </div>
                                                    <div className="space-y-0.5 min-w-0">
                                                        <span className="font-bold text-[#1A1A2E] truncate block">
                                                            {sub.propertyName}
                                                        </span>
                                                        <p className="text-[11px] text-[#7A7A7A]">
                                                            {sub.ownerEmail}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Tier */}
                                            <td className="py-4 px-4">
                                                <SubscriptionTierBadge tier={sub.planTier} />
                                            </td>

                                            {/* Kuota Kamar */}
                                            <td className="py-4 px-4 font-semibold text-[#2D2D2D]">
                                                {sub.usedRooms} / {sub.maxRooms} Kamar
                                            </td>

                                            {/* Biaya */}
                                            <td className="py-4 px-4 font-bold text-[#1A1A2E]">
                                                {formatCurrency(sub.monthlyPrice)}
                                                <span className="text-[10px] text-[#7A7A7A] font-normal">
                                                    /bln
                                                </span>
                                            </td>

                                            {/* Jatuh Tempo */}
                                            <td className="py-4 px-4 text-[#7A7A7A]">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-[#B8B0A5]" />
                                                    <span>{formatDate(expiry)}</span>
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-4 px-4">
                                                <OwnerStatusBadge status={sub.status} />
                                            </td>

                                            {/* Aksi */}
                                            <td className="py-4 px-5 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedSubscription(sub);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E2DA] bg-[#FAF7F2] hover:bg-white text-[#1A1A2E] text-[11px] font-semibold transition-all hover:border-[#8C6239] hover:shadow-xs group cursor-pointer"
                                                >
                                                    <SlidersHorizontal className="w-3 h-3 text-[#8C6239]" />
                                                    <span>Kelola Paket</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Aksi Langganan */}
            <SubscriptionActionsModal
                subscription={selectedSubscription}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedSubscription(null);
                }}
            />
        </div>
    );
}
