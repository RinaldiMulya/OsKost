"use client";

import Link from "next/link";
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
        <Sidebar className="border-r border-zinc-800">
            {/* Logo / Brand */}
            <SidebarHeader className="p-4">
                <Link href="/admin" className="flex items-center gap-3 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 transition-colors group-hover:bg-secondary/20">
                        <Zap className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white tracking-tight">
                            Smartkost
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                            Pulo Jahe
                        </span>
                    </div>
                </Link>
            </SidebarHeader>

            <Separator className="bg-zinc-800" />

            {/* Navigation */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-4">
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
                                            className="transition-colors"
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
            <SidebarFooter className="p-4">
                <Separator className="bg-zinc-800 mb-4" />
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                            AD
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm text-white truncate">
                            {userEmail}
                        </span>
                        <Badge
                            variant="outline"
                            className="w-fit text-[10px] border-secondary/30 text-secondary"
                        >
                            ADMIN
                        </Badge>
                    </div>
                </div>
                <form action={logout}>
                    <button
                        type="submit"
                        className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-zinc-800 hover:text-white"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Keluar</span>
                    </button>
                </form>
            </SidebarFooter>
        </Sidebar>
    );
}
