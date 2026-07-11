"use client";

import { useState } from "react";
import { TenantInfoTab } from "./tenant-info-tab";
import { TenantBillingTab } from "./tenant-billing-tab";
import { TenantReportsTab } from "./tenant-reports-tab";
import type { TenantDetailForAdmin } from "../../tenant-service";
import { UserIcon, Receipt, AlertCircle } from "lucide-react";

interface TenantTabsProps {
    tenant: TenantDetailForAdmin;
    signedKtpUrl: string | null;
}

type TabType = "info" | "billing" | "reports";

export function TenantTabs({ tenant, signedKtpUrl }: TenantTabsProps) {
    const [activeTab, setActiveTab] = useState<TabType>("info");

    const tabs = [
        { id: "info", label: "Informasi Profil", icon: UserIcon },
        { id: "billing", label: "Riwayat Pembayaran", icon: Receipt },
        { id: "reports", label: "Laporan Kerusakan", icon: AlertCircle },
    ];

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800/80 pb-4">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-primary text-black shadow-sm"
                                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                                }`}
                        >
                            <Icon className={`size-4 ${isActive ? "opacity-100" : "opacity-70"}`} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === "info" && <TenantInfoTab tenant={tenant} signedKtpUrl={signedKtpUrl} />}
                {activeTab === "billing" && <TenantBillingTab tenant={tenant} />}
                {activeTab === "reports" && <TenantReportsTab tenant={tenant} />}
            </div>
        </div>
    );
}
