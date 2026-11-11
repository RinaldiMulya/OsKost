"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ShieldAlert, ShieldCheck, LogOut, ArrowRight } from "lucide-react";
import {
  NotificationBell,
  NotificationItem,
} from "@/components/shared/notification-bell";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import {
  type ImpersonationData,
  stopImpersonationAction,
} from "@/features/super-admin/actions/impersonation-actions";

const pageTitles: Record<string, string> = {
  "/admin": "Overview",
  "/admin/rooms": "Manajemen Kamar",
  "/admin/tenants": "Manajemen Penghuni",
  "/admin/billing": "Tagihan",
  "/admin/reports": "Laporan",
  "/admin/settings": "Pengaturan",
};

interface AdminHeaderProps {
  notifications?: NotificationItem[];
  impersonation?: ImpersonationData | null;
  isSuperAdmin?: boolean;
}

export function AdminHeader({
  notifications = [],
  impersonation,
  isSuperAdmin = false,
}: AdminHeaderProps) {
  // 1. Refetch saat tab Admin kembali difokuskan
  useAutoRefresh();
  // 2. Supabase Realtime subscription untuk Invoice & Report changes di Admin Dashboard
  useAdminRealtime();

  const [isExiting, setIsExiting] = useState(false);
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Dashboard";

  const handleExitImpersonation = async () => {
    setIsExiting(true);
    try {
      const res = await stopImpersonationAction();
      window.location.href = res.redirectUrl || "/super-admin/owners";
    } catch {
      window.location.href = "/super-admin/owners";
    }
  };

  return (
    <div className="flex flex-col shrink-0 sticky top-0 z-40">
      {/* Banner Impersonasi Aktif */}
      {impersonation && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shadow-xs border-b border-amber-600">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-100 shrink-0 animate-pulse" />
            <span>
              <strong>Mode Impersonasi Aktif:</strong> Anda sedang menjelajahi
              dashboard sebagai <strong>{impersonation.ownerEmail}</strong>.
              Semua aktivitas terekam di Audit Trail.
            </span>
          </div>
          <button
            onClick={handleExitImpersonation}
            disabled={isExiting}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-950/70 text-white font-semibold text-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>
              {isExiting ? "Mengakhiri Sesi..." : "Keluar dari Impersonasi"}
            </span>
          </button>
        </div>
      )}

      {/* Banner Super Admin Langsung */}
      {isSuperAdmin && !impersonation && (
        <div className="bg-[#1A1A2E] text-zinc-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-[#25253D] shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Anda login dengan akun <strong className="text-amber-400 font-bold">Super Admin (Platform Executive)</strong>.
            </span>
          </div>
          <Link
            href="/super-admin"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#8C6239] hover:bg-[#A47148] text-white font-semibold text-xs transition-colors shrink-0 shadow-sm"
          >
            <span>Buka Konsol Super Admin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <header className="flex h-14 items-center justify-between gap-4 border-b border-border bg-background px-4">
        {/* Sisi Kiri: Trigger Sidebar + Breadcrumb Title */}
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-sm font-semibold tracking-tight text-foreground md:text-base">
            {title}
          </h1>
        </div>

        {/* Sisi Kanan: Notification Bell + Quick Actions */}
        <div className="flex items-center gap-2">
          <NotificationBell notifications={notifications} />
        </div>
      </header>
    </div>
  );
}
