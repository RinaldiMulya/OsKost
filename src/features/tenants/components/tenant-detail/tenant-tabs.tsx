"use client";

import { useState, useTransition } from "react";
import { TenantInfoTab } from "./tenant-info-tab";
import { TenantBillingTab } from "./tenant-billing-tab";
import { TenantReportsTab } from "./tenant-reports-tab";
import type { TenantDetailForAdmin } from "../../tenant-service";
import { User, Receipt, AlertCircle, RefreshCw } from "lucide-react";
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

  // Active Lease calculations for badges
  const activeLease = tenant.leases.find((l) => l.isActive);
  const activeInvoices = activeLease?.invoices ?? [];
  const unpaidInvoices = activeInvoices.filter(
    (inv) => inv.status === "UNPAID" || inv.status === "OVERDUE",
  );
  const unpaidCount = unpaidInvoices.length;

  // Report count
  const allReports = tenant.leases.flatMap((l) => l.reports);
  const openReportsCount = allReports.filter((r) => r.status === "OPEN").length;

  const tabs = [
    {
      id: "info",
      label: "Informasi Profil & KTP",
      icon: User,
      badge: null,
    },
    {
      id: "billing",
      label: "Riwayat Pembayaran",
      icon: Receipt,
      badge: unpaidCount > 0 ? `${unpaidCount} Tagihan` : null,
      badgeVariant: "destructive" as const,
    },
    {
      id: "reports",
      label: "Laporan Kerusakan",
      icon: AlertCircle,
      badge: openReportsCount > 0 ? `${openReportsCount} Terbuka` : null,
      badgeVariant: "warning" as const,
    },
  ];

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div className="bg-surface-container/90 p-1.5 rounded-2xl border-2 border-[#2C2825]/30 inline-flex flex-wrap items-center gap-1.5 shadow-2xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                }`}
              >
                <Icon
                  className={`size-4 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      tab.badgeVariant === "destructive"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2 text-xs border-2 border-[#2C2825]/30 text-muted-foreground hover:text-foreground hover:bg-card bg-card/80 h-10 px-4 rounded-xl shadow-2xs transition-all self-start sm:self-auto cursor-pointer"
          title="Sinkronisasi Data Terbaru"
        >
          <RefreshCw
            className={`size-3.5 text-muted-foreground ${
              isRefreshing ? "animate-spin text-primary" : ""
            }`}
          />
          <span>{isRefreshing ? "Menyinkronkan..." : "Sync Data"}</span>
        </Button>
      </div>

      {/* Tab Content Panes */}
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
