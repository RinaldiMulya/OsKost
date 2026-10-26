"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Activity,
    Shield,
    ExternalLink,
    ChevronRight,
    Search,
    Bell,
    Clock,
} from "lucide-react";

interface SuperAdminHeaderProps {
    userEmail: string;
}

export function SuperAdminHeader({ userEmail }: SuperAdminHeaderProps) {
    const pathname = usePathname();
    const [currentTime, setCurrentTime] = useState<string>("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(
                now.toLocaleTimeString("id-ID", {
                    timeZone: "Asia/Jakarta",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }) + " WIB"
            );
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    // Format breadcrumbs from pathname
    const getBreadcrumbs = () => {
        const parts = pathname.split("/").filter(Boolean);
        if (parts.length <= 1) return [{ label: "Overview Platform", href: "/super-admin" }];

        return parts.map((part, index) => {
            const href = "/" + parts.slice(0, index + 1).join("/");
            let label = part.replace(/-/g, " ");
            if (part === "super-admin") label = "Console";
            else if (part === "owners") label = "Pemilik Kost";
            else if (part === "subscriptions") label = "Langganan";
            else if (part === "transactions") label = "Transaksi";
            else if (part === "audit-logs") label = "Audit Logs";
            else if (part === "settings") label = "Settings";
            return { label, href };
        });
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <header className="h-16 bg-[#FFFFFF] border-b border-[#E8E2DA] px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
            {/* Left: Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-[#8C6239] bg-[#8C6239]/10 px-2 py-1 rounded-md border border-[#8C6239]/20">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Super Admin</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#B8B0A5]" />
                <nav className="flex items-center gap-1.5 text-[#7A7A7A]">
                    {breadcrumbs.map((crumb, idx) => (
                        <span key={crumb.href} className="flex items-center gap-1.5">
                            {idx > 0 && <ChevronRight className="w-3 h-3 text-[#D1CBC2]" />}
                            <span
                                className={
                                    idx === breadcrumbs.length - 1
                                        ? "font-semibold text-[#2D2D2D] capitalize"
                                        : "capitalize hover:text-[#2D2D2D]"
                                }
                            >
                                {crumb.label}
                            </span>
                        </span>
                    ))}
                </nav>
            </div>

            {/* Right: Actions & Badges */}
            <div className="flex items-center gap-4">
                {/* Clock WIB */}
                <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-[#5C564E] bg-[#FAF7F2] border border-[#E8E2DA] px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-[#8C6239]" />
                    <span>{currentTime || "Loading..."}</span>
                </div>

                {/* System Health Badge */}
                <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#E8E2DA] px-3 py-1 rounded-lg text-xs font-medium text-[#2D2D2D]">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A7C59] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4A7C59]"></span>
                    </span>
                    <span className="hidden sm:inline text-[#5C564E]">Status:</span>
                    <span className="font-semibold text-[#4A7C59]">Node Online</span>
                </div>

                {/* Link to Owner Admin Console for Quick Reference */}
                <Link
                    href="/admin"
                    target="_blank"
                    className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-[#5D6654] hover:text-[#8C6239] transition-colors bg-[#FAF7F2] border border-[#E8E2DA] hover:border-[#8C6239]/40 px-3 py-1 rounded-lg"
                    title="Buka Dashboard Owner Pulo Jahe (Tab Baru)"
                >
                    <span>Owner Portal</span>
                    <ExternalLink className="w-3 h-3" />
                </Link>
            </div>
        </header>
    );
}
