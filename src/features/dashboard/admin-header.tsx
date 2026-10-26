"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ShieldAlert, LogOut } from "lucide-react";
import { NotificationBell, NotificationItem } from "@/components/shared/notification-bell";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import {
    ImpersonationData,
    stopImpersonationAction,
} from "@/features/super-admin/actions/impersonation-actions";

const pageTitles: Record<string, string> = {
    "/admin": "Overview",
    "/admin/rooms": "Manajemen Kamar",
    "/admin/tenants": "Manajemen Penghuni",
    "/admin/billing": "Tagihan",
    "/admin/reports": "Laporan",
};

interface AdminHeaderProps {
    notifications?: NotificationItem[];
    impersonation?: ImpersonationData | null;
}

export function AdminHeader({ notifications = [], impersonation }: AdminHeaderProps) {
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
                            <strong>Mode Impersonasi Aktif:</strong> Anda sedang menjelajahi dashboard sebagai{" "}
                            <strong>{impersonation.ownerEmail}</strong>. Semua aktivitas terekam di Audit Trail.
                        </span>
                    </div>
                    <button
                        onClick={handleExitImpersonation}
                        disabled={isExiting}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-950/70 text-white font-semibold text-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{isExiting ? "Mengakhiri Sesi..." : "Keluar dari Impersonasi"}</span>
                    </button>
                </div>
            )}

            {/* Standard Admin Header */}
            <header className="flex h-14 items-center justify-between border-b-2 border-[#2C2825]/10 bg-[#FFFFFF]/90 px-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <SidebarTrigger className="text-[#4A453F] hover:text-[#1E1B18] cursor-pointer" />
                    <Separator orientation="vertical" className="h-5 bg-[#2C2825]/10" />
                    <h1 className="text-base font-bold text-[#1E1B18] tracking-tight">
                        {title}
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <NotificationBell notifications={notifications} />
                </div>
            </header>
        </div>
    );
}
