"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BedDouble,
    Users,
    Receipt,
    AlertCircle,
    LogOut,
    Zap,
    Settings,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { logout } from "@/features/auth/actions";

const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Kamar", href: "/admin/rooms", icon: BedDouble },
    { label: "Penghuni", href: "/admin/tenants", icon: Users },
    { label: "Tagihan", href: "/admin/billing", icon: Receipt },
    { label: "Laporan", href: "/admin/reports", icon: AlertCircle },
    { label: "Pengaturan", href: "/admin/settings", icon: Settings },
] as const;

interface AdminSidebarProps {
    userEmail: string;
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <Sidebar className="border-r border-[#2C2825]/8 bg-[#FFFFFF]">
            {/* Logo / Brand */}
            <SidebarHeader className="p-4">
                <Link href="/admin" className="flex items-center gap-3 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#A45A3D]/10 border border-[#A45A3D]/20 p-1.5 transition-colors group-hover:bg-[#A45A3D]/20">
                        <Image
                            src="/images/logo-icon.png"
                            alt="OsKost Mark"
                            width={24}
                            height={24}
                            className="w-5 h-5 object-contain"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-bold text-[#1E1B18] tracking-tight">
                            OsKost
                        </span>
                        <span className="text-xs font-semibold text-[#5C564E]">
                            SaaS Platform
                        </span>
                    </div>
                </Link>
            </SidebarHeader>

            <Separator className="bg-[#2C2825]/8" />

            {/* Navigation */}
            <SidebarContent className="bg-[#FFFFFF]">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-bold text-[#5C564E] uppercase tracking-wider px-4">
                        Menu
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => {
                                // Exact match for /admin, startsWith for sub-routes
                                const isActive =
                                    item.href === "/admin"
                                        ? pathname === "/admin"
                                        : pathname.startsWith(item.href);

                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            className={`transition-colors font-medium text-sm ${
                                                isActive
                                                    ? "bg-[#A45A3D]/10 text-[#A45A3D] font-bold"
                                                    : "text-[#38332E] hover:text-[#1E1B18] hover:bg-[#FAF2EA]"
                                            }`}
                                        >
                                            <Link href={item.href}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer — User Info & Logout */}
            <SidebarFooter className="p-4 bg-[#FFFFFF]">
                <Separator className="bg-[#2C2825]/8 mb-4" />
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-[#A45A3D]/10 text-[#A45A3D] text-xs font-bold">
                            AD
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-semibold text-[#1E1B18] truncate">
                            {userEmail}
                        </span>
                        <Badge
                            variant="outline"
                            className="w-fit text-[11px] font-bold border-[#2C4C3B]/30 text-[#2C4C3B] bg-[#C7EBD4]/40"
                        >
                            ADMIN
                        </Badge>
                    </div>
                </div>
                <form action={logout}>
                    <button
                        type="submit"
                        className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#4A453F] transition-colors hover:bg-[#FAF2EA] hover:text-[#A45A3D] cursor-pointer"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Keluar</span>
                    </button>
                </form>
            </SidebarFooter>
        </Sidebar>
    );
}
