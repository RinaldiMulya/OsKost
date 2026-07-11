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

export function AdminHeader() {
    const pathname = usePathname();
    const title = pageTitles[pathname] ?? "Dashboard";

    return (
        <header className="flex h-14 items-center gap-3 border-b border-zinc-800 bg-zinc-950/80 px-4 backdrop-blur-sm">
            <SidebarTrigger className="text-muted-foreground hover:text-white" />
            <Separator orientation="vertical" className="h-5 bg-zinc-700" />
            <h1 className="text-base font-semibold text-white tracking-tight">
                {title}
            </h1>
        </header>
    );
}
