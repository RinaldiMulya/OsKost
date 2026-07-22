"use client";

import { useState, useTransition } from "react";
import { TenantInfoTab } from "./tenant-info-tab";
import { TenantBillingTab } from "./tenant-billing-tab";
import { TenantReportsTab } from "./tenant-reports-tab";
import type { TenantDetailForAdmin } from "../../tenant-service";
import { UserIcon, Receipt, AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface TenantTabsProps {
  tenant: TenantDetailForAdmin;
  signedKtpUrl: string | null;
}

type TabType = "info" | "billing" | "reports";

export function TenantTabs({ tenant, signedKtpUrl }: TenantTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();

  const tabs = [
    { id: "info", label: "Informasi Profil", icon: UserIcon },
    { id: "billing", label: "Riwayat Pembayaran", icon: Receipt },
    { id: "reports", label: "Laporan Kerusakan", icon: AlertCircle },
  ];

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2 flex-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-black shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                <Icon
                  className={`size-4 ${isActive ? "opacity-100" : "opacity-70"}`}
                />
                {tab.label}
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2 text-xs border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-zinc-800/80 h-9 px-3 rounded-xl"
          title="Sinkronisasi Data Terbaru"
        >
          <RefreshCw
            className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Sync Data
        </Button>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === "info" && (
          <TenantInfoTab tenant={tenant} signedKtpUrl={signedKtpUrl} />
        )}
        {activeTab === "billing" && <TenantBillingTab tenant={tenant} />}
        {activeTab === "reports" && <TenantReportsTab tenant={tenant} />}
      </div>
    </div>
  );
}
