"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, AlertTriangle, User } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Beranda",
      href: "/dashboard",
      icon: Home,
      exact: true,
    },
    {
      label: "Tagihan",
      href: "/dashboard/billing",
      icon: Receipt,
      exact: false,
    },
    {
      label: "Laporan",
      href: "/dashboard/reports",
      icon: AlertTriangle,
      exact: false,
    },
    {
      label: "Profil",
      href: "/dashboard/profile",
      icon: User,
      exact: false,
    },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href) && pathname !== "/dashboard";
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-md border-t border-zinc-800 bg-zinc-950/90 py-2 backdrop-blur-lg">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
                active ? "text-secondary font-semibold" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
