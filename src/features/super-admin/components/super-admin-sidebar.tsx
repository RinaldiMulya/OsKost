"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Building2,
    CreditCard,
    Receipt,
    ShieldCheck,
    Settings,
    LogOut,
    Sparkles,
    Activity,
} from "lucide-react";
import { logout } from "@/features/auth/actions";

interface NavItem {
    label: string;
    href: string;
    icon: any;
    badge?: string;
    badgeColor?: string;
}

const mainNavItems: NavItem[] = [
    {
        label: "Overview Platform",
        href: "/super-admin",
        icon: LayoutDashboard,
    },
    {
        label: "Pemilik Kost",
        href: "/super-admin/owners",
        icon: Building2,
    },
    {
        label: "Langganan SaaS",
        href: "/super-admin/subscriptions",
        icon: CreditCard,
    },
];

const secondaryNavItems: NavItem[] = [
    {
        label: "Kesehatan Sistem",
        href: "/super-admin/health",
        icon: Activity,
    },
    {
        label: "Transaksi SaaS",
        href: "/super-admin/transactions",
        icon: Receipt,
    },
    {
        label: "Audit Logs",
        href: "/super-admin/audit-logs",
        icon: ShieldCheck,
    },
    {
        label: "Pengaturan Platform",
        href: "/super-admin/settings",
        icon: Settings,
    },
];

interface SuperAdminSidebarProps {
    userEmail: string;
}

export function SuperAdminSidebar({ userEmail }: SuperAdminSidebarProps) {
    const pathname = usePathname();

    const isItemActive = (href: string) => {
        if (href === "/super-admin") {
            return pathname === "/super-admin";
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="w-64 bg-[#1A1A2E] text-[#A0A0B2] border-r border-[#25253D] flex flex-col shrink-0 select-none transition-all duration-300">
            {/* Header Brand */}
            <div className="p-5 border-b border-[#25253D]">
                <Link href="/super-admin" className="flex items-center gap-3 group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8C6239]/30 to-[#8C6239]/10 border border-[#8C6239]/40 p-2 shadow-inner group-hover:border-[#8C6239] transition-all">
                        <Image
                            src="/images/logo-icon.png"
                            alt="OsKost Logo"
                            width={24}
                            height={24}
                            className="w-5 h-5 object-contain"
                        />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <span className="text-base font-bold text-[#FAF7F2] tracking-tight">
                                OsKost
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#8C6239] text-white">
                                Super
                            </span>
                        </div>
                        <span className="text-[11px] font-medium text-[#7D7D96]">
                            Platform Director Console
                        </span>
                    </div>
                </Link>
            </div>

            {/* Navigation Body */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                {/* Core Navigation */}
                <div>
                    <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#63637E]">
                        Manajemen Utama
                    </div>
                    <nav className="space-y-1">
                        {mainNavItems.map((item) => {
                            const active = isItemActive(item.href);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        active
                                            ? "bg-[#25253D] text-[#FAF7F2] font-semibold border-l-4 border-[#8C6239] shadow-sm"
                                            : "hover:bg-[#202038] hover:text-[#FAF7F2] text-[#9A9AB0]"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon
                                            className={`w-4 h-4 transition-colors ${
                                                active ? "text-[#D4A843]" : "text-[#72728D]"
                                            }`}
                                        />
                                        <span>{item.label}</span>
                                    </div>
                                    {active && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#8C6239]" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Extended / Phase 2 Navigation */}
                <div>
                    <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#63637E]">
                        Sistem & Kontrol
                    </div>
                    <nav className="space-y-1">
                        {secondaryNavItems.map((item) => {
                            const active = isItemActive(item.href);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        active
                                            ? "bg-[#25253D] text-[#FAF7F2] font-semibold border-l-4 border-[#8C6239]"
                                            : "hover:bg-[#202038] hover:text-[#FAF7F2] text-[#9A9AB0]"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon
                                            className={`w-4 h-4 transition-colors ${
                                                active ? "text-[#D4A843]" : "text-[#72728D]"
                                            }`}
                                        />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span
                                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${
                                                item.badgeColor || "bg-[#2E2E48] text-[#A0A0B2]"
                                            }`}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Pro Tip Card & Switcher */}
                <div className="p-3.5 rounded-xl bg-gradient-to-b from-[#22223A] to-[#1D1D32] border border-[#2B2B46] text-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-[#D4A843] font-semibold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>SaaS Engine Active</span>
                    </div>
                    <p className="text-[11px] text-[#8686A0] leading-relaxed">
                        Data agregasi MRR, okupansi kamar, dan billing terhitung otomatis dari seluruh node properti.
                    </p>
                    <div className="pt-2 border-t border-[#2B2B46]">
                        <Link
                            href="/admin"
                            className="flex items-center justify-between text-[11px] text-[#D4A843] hover:text-white font-semibold transition-colors"
                        >
                            <span>Lihat Dashboard Kost (/admin)</span>
                            <span>➔</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer Profile & Logout */}
            <div className="p-4 border-t border-[#25253D] bg-[#161628]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8C6239] to-[#D4A843] flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                            {userEmail.slice(0, 2)}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-[#FAF7F2] truncate">
                                {userEmail}
                            </span>
                            <span className="text-[10px] text-[#5D6654] font-medium tracking-wide">
                                Super Administrator
                            </span>
                        </div>
                    </div>
                    <form action={logout}>
                        <button
                            type="submit"
                            title="Keluar dari sesi Super Admin"
                            className="p-1.5 rounded-lg text-[#72728D] hover:text-[#FAF7F2] hover:bg-[#25253D] transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </aside>
    );
}
