"use client";

import { useState } from "react";
import Link from "next/link";
import { OwnerItem } from "@/features/super-admin/actions/owners-actions";
import { OwnerStatusBadge } from "./owner-status-badge";
import { CreateOwnerModal } from "./create-owner-modal";
import {
    Search,
    Building2,
    Mail,
    Phone,
    Calendar,
    ArrowUpRight,
    Filter,
    UserPlus,
} from "lucide-react";

interface OwnersTableProps {
    initialOwners: OwnerItem[];
}

export function OwnersTable({ initialOwners }: OwnersTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<string>("ALL");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const filteredOwners = initialOwners.filter((owner) => {
        // Tab filter
        if (activeTab !== "ALL") {
            const hasMatchingStatus = owner.properties.some(
                (p) => p.subscriptionStatus === activeTab
            );
            if (!hasMatchingStatus) return false;
        }

        // Search query filter
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        const emailMatch = owner.email?.toLowerCase().includes(query) ?? false;
        const phoneMatch = owner.phoneNumber?.includes(query) ?? false;
        const propMatch = owner.properties.some((p) =>
            p.name.toLowerCase().includes(query)
        );

        return emailMatch || phoneMatch || propMatch;
    });

    const tabs = [
        { label: "Semua Pemilik", value: "ALL" },
        { label: "Aktif", value: "ACTIVE" },
        { label: "Trial", value: "TRIAL" },
        { label: "Past Due", value: "PAST_DUE" },
    ];

    const formatCurrency = (val: number) => {
        return "Rp " + val.toLocaleString("id-ID");
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-4">
            {/* Control Bar: Filter Tabs & Search & Add Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFFFF] p-4 rounded-2xl border border-[#E8E2DA] shadow-xs">
                {/* Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                                activeTab === tab.value
                                    ? "bg-[#1A1A2E] text-[#FAF7F2] shadow-xs"
                                    : "text-[#7A7A7A] hover:text-[#2D2D2D] hover:bg-[#FAF7F2]"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Right controls: Search & Add Button */}
                <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-[#A0A0B2] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari email, HP, atau kost..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239] transition-all text-[#2D2D2D]"
                        />
                    </div>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#8C6239] hover:bg-[#724e2c] text-white rounded-xl text-xs font-semibold shadow-xs transition-all shrink-0"
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Tambah Pemilik</span>
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8E2DA] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAF7F2] border-b border-[#E8E2DA] text-[#5C564E] font-bold uppercase tracking-wider">
                            <tr>
                                <th className="py-3.5 px-5">Pemilik Kost</th>
                                <th className="py-3.5 px-4">Properti Terdaftar</th>
                                <th className="py-3.5 px-4">Paket SaaS</th>
                                <th className="py-3.5 px-4">Status Langganan</th>
                                <th className="py-3.5 px-4">Terdaftar</th>
                                <th className="py-3.5 px-5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0EBE1]">
                            {filteredOwners.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-[#7A7A7A]">
                                        Tidak ditemukan pemilik kost yang sesuai kriteria pencarian.
                                    </td>
                                </tr>
                            ) : (
                                filteredOwners.map((owner) => {
                                    const primaryProp = owner.properties[0];
                                    return (
                                        <tr
                                            key={owner.id}
                                            className="hover:bg-[#FAF7F2]/60 transition-colors"
                                        >
                                            {/* Owner Profile */}
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-[#8C6239]/10 text-[#8C6239] font-bold flex items-center justify-center shrink-0 border border-[#8C6239]/20 uppercase">
                                                        {owner.email?.slice(0, 2) || "KO"}
                                                    </div>
                                                    <div className="space-y-0.5 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-[#1A1A2E] truncate">
                                                                {owner.email || "Tanpa Email"}
                                                            </span>
                                                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#E8E2DA] text-[#5C564E]">
                                                                {owner.role}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-[#7A7A7A] flex items-center gap-1">
                                                            <Phone className="w-3 h-3 text-[#B8B0A5]" />
                                                            {owner.phoneNumber || "No HP belum diisi"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Properti Terdaftar */}
                                            <td className="py-4 px-4">
                                                {owner.properties.length === 0 ? (
                                                    <span className="text-[#A0A0B2] italic">
                                                        Belum buat properti
                                                    </span>
                                                ) : (
                                                    <div className="space-y-1">
                                                        {owner.properties.map((prop) => (
                                                            <div
                                                                key={prop.id}
                                                                className="flex items-center gap-1.5"
                                                            >
                                                                <Building2 className="w-3.5 h-3.5 text-[#8C6239]" />
                                                                <span className="font-semibold text-[#2D2D2D]">
                                                                    {prop.name}
                                                                </span>
                                                                <span className="text-[10px] text-[#7A7A7A]">
                                                                    ({prop.occupiedRooms}/{prop.totalRooms} kamar)
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Paket SaaS */}
                                            <td className="py-4 px-4">
                                                {primaryProp ? (
                                                    <div className="space-y-0.5">
                                                        <span className="font-bold text-[#1A1A2E]">
                                                            {primaryProp.planTier}
                                                        </span>
                                                        <p className="text-[11px] text-[#7A7A7A]">
                                                            {formatCurrency(primaryProp.monthlyPrice)}/bln
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-[#A0A0B2]">-</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="py-4 px-4">
                                                {primaryProp ? (
                                                    <OwnerStatusBadge
                                                        status={primaryProp.subscriptionStatus}
                                                    />
                                                ) : (
                                                    <span className="text-[#A0A0B2]">-</span>
                                                )}
                                            </td>

                                            {/* Tanggal Terdaftar */}
                                            <td className="py-4 px-4 text-[#7A7A7A]">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-[#B8B0A5]" />
                                                    <span>{formatDate(owner.createdAt)}</span>
                                                </div>
                                            </td>

                                            {/* Action Button */}
                                            <td className="py-4 px-5 text-right">
                                                <Link
                                                    href={`/super-admin/owners/${owner.id}`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E2DA] bg-[#FAF7F2] hover:bg-white text-[#1A1A2E] text-[11px] font-semibold transition-all hover:border-[#8C6239] hover:shadow-xs group"
                                                >
                                                    <span>Kelola</span>
                                                    <ArrowUpRight className="w-3 h-3 text-[#A0A0B2] group-hover:text-[#8C6239] transition-colors" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Onboarding Owner Baru */}
            <CreateOwnerModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}
