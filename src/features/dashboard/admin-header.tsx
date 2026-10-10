"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const pageTitles: Record<string, string> = {
    "/admin": "Overview",
    "/admin/rooms": "Manajemen Kamar",
    "/admin/tenants": "Manajemen Penghuni",
    "/admin/billing": "Tagihan",
    "/admin/reports": "Laporan",
};

import { NotificationBell, NotificationItem } from "@/components/shared/notification-bell";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";

interface AdminHeaderProps {
    notifications?: NotificationItem[];
}

export function AdminHeader({ notifications = [] }: AdminHeaderProps) {
    // 1. Refetch saat tab Admin kembali difokuskan
    useAutoRefresh();
    // 2. Supabase Realtime subscription untuk Invoice & Report changes di Admin Dashboard
    useAdminRealtime();

    const pathname = usePathname();
    const title = pageTitles[pathname] ?? "Dashboard";

    return (
        <header className="flex h-14 items-center justify-between border-b border-[#2C2825]/8 bg-[#FFFFFF]/90 px-4 backdrop-blur-sm">
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
    );
}
