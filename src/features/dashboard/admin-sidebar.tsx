"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
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
  Settings,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  X,
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
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { logout } from "@/features/auth/actions";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Kamar", href: "/admin/rooms", icon: BedDouble },
  { label: "Penghuni", href: "/admin/tenants", icon: Users },
  { label: "Tagihan", href: "/admin/billing", icon: Receipt },
  { label: "Laporan", href: "/admin/reports", icon: AlertCircle },
  { label: "Pengaturan", href: "/admin/settings", icon: Settings },
] as const;

const MIN_WIDTH = 180;
const MAX_WIDTH = 320;
const DEFAULT_WIDTH = 220; // 13.75rem (ramping & proporsional)
const MINI_WIDTH = 64; // 4rem (mode icon hemat ruang)

interface AdminSidebarProps {
  userEmail: string;
  userRole?: string;
}

export function AdminSidebar({ userEmail, userRole }: AdminSidebarProps) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile, setOpen } = useSidebar();
  const [, startTransition] = useTransition();

  // State pengaturan lebar & mode mini
  const [width, setWidth] = useState<number>(DEFAULT_WIDTH);
  const [isMini, setIsMini] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Di desktop: pastikan sidebar selalu terbuka (tidak tertutup offcanvas ke 0px)
  // karena kontrol visibilitas di desktop dikendalikan lewat mode Mini (64px) vs Expanded (220px+)
  useEffect(() => {
    if (!isMobile) {
      setOpen(true);
    }
  }, [isMobile, setOpen]);

  // Load preferensi dari localStorage saat client-side mount
  useEffect(() => {
    setMounted(true);
    try {
      const savedWidth = localStorage.getItem("oskost_sidebar_width");
      const savedMini = localStorage.getItem("oskost_sidebar_mini");

      if (savedWidth) {
        const parsed = parseInt(savedWidth, 10);
        if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
          setWidth(parsed);
        }
      }

      if (savedMini !== null) {
        setIsMini(savedMini === "true");
      } else if (
        typeof window !== "undefined" &&
        window.innerWidth >= 768 &&
        window.innerWidth < 1024
      ) {
        // Pada layar tablet jika belum disetel user, default ke mode mini agar dashboard tetap lega
        setIsMini(true);
      }
    } catch {
      // Silently ignore if localStorage is disabled
    }
  }, []);

  // Toggle Mode Mini / Expanded
  const toggleMini = useCallback(() => {
    setIsMini((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("oskost_sidebar_mini", String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  // Shortcut keyboard Ctrl+B / Cmd+B di desktop untuk toggle mini/expanded
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        if (!isMobile) {
          e.preventDefault();
          toggleMini();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, toggleMini]);

  // Handler Drag-to-Resize
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = e.clientX;

      // Snap ke mode mini jika ditarik terlalu sempit (< 110px)
      if (newWidth < 110) {
        if (!isMini) {
          setIsMini(true);
          try {
            localStorage.setItem("oskost_sidebar_mini", "true");
          } catch {}
        }
        return;
      }

      // Kembalikan ke mode expanded jika ditarik melebar dari mode mini
      if (isMini && newWidth >= 110) {
        setIsMini(false);
        try {
          localStorage.setItem("oskost_sidebar_mini", "false");
        } catch {}
      }

      if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
      if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;

      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      try {
        localStorage.setItem("oskost_sidebar_width", width.toString());
      } catch {}
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, isMini, width]);

  // Efektif mini: DI MOBILE SELALU FALSE (Drawer mobile harus selalu tampil penuh dengan label teks & profil user)
  const isEffectiveMini = !isMobile && isMini;
  const effectiveWidth = isEffectiveMini ? MINI_WIDTH : width;

  // Inisial avatar fallback
  const avatarFallback = userEmail ? userEmail.slice(0, 2).toUpperCase() : "AD";

  return (
    <Sidebar
      collapsible="offcanvas"
      className={`border-r border-[#2C2825]/10 bg-[#FFFFFF] group/sidebar h-full ${
        isDragging
          ? "transition-none select-none"
          : "transition-[width] duration-200 ease-in-out"
      }`}
      style={
        !isMobile
          ? ({
              "--sidebar-width": `${effectiveWidth}px`,
              "--sidebar-width-icon": `${MINI_WIDTH}px`,
            } as React.CSSProperties)
          : undefined
      }
    >
      {/* Header: Logo & Tombol Toggle Mini/Expand */}
      <SidebarHeader className="p-0 border-b border-[#2C2825]/8 bg-[#FFFFFF]">
        {isMobile ? (
          // Tampilan Header Mobile (Sheet)
          <div className="flex items-center justify-between p-3.5">
            <Link
              href="/admin"
              onClick={() => setOpenMobile(false)}
              className="flex items-center gap-2.5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#A45A3D]/10 border border-[#A45A3D]/25 p-1.5 shadow-2xs">
                <Image
                  src="/images/logo-icon.png"
                  alt="OsKost Mark"
                  width={20}
                  height={20}
                  className="w-4 h-4 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#1E1B18] tracking-tight">
                  OsKost
                </span>
                <span className="text-[10px] font-semibold text-[#5C564E]">
                  SaaS Platform
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setOpenMobile(false)}
              className="p-1.5 text-[#5C564E] hover:text-[#1E1B18] hover:bg-[#FAF2EA] rounded-lg transition-colors cursor-pointer"
              aria-label="Tutup Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : isEffectiveMini ? (
          // Tampilan Header Mini / Icon Mode
          <div className="flex flex-col items-center justify-center gap-2 py-3 px-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A45A3D]/10 border border-[#A45A3D]/25 p-1.5 transition-colors hover:bg-[#A45A3D]/20 shadow-2xs"
                >
                  <Image
                    src="/images/logo-icon.png"
                    alt="OsKost Mark"
                    width={20}
                    height={20}
                    className="w-4 h-4 object-contain"
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-[#1E1B18] text-white font-semibold text-xs"
              >
                OsKost Platform
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleMini}
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5C564E] hover:text-[#A45A3D] hover:bg-[#FAF2EA] transition-colors cursor-pointer"
                  aria-label="Lebarkan Sidebar"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-[#1E1B18] text-white font-semibold text-xs"
              >
                Lebarkan Sidebar
              </TooltipContent>
            </Tooltip>
          </div>
        ) : (
          // Tampilan Header Normal (Expanded)
          <div className="flex items-center justify-between p-3.5">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 min-w-0 group"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#A45A3D]/10 border border-[#A45A3D]/25 p-1.5 transition-colors group-hover:bg-[#A45A3D]/20 shadow-2xs">
                <Image
                  src="/images/logo-icon.png"
                  alt="OsKost Mark"
                  width={20}
                  height={20}
                  className="w-4 h-4 object-contain"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-[#1E1B18] tracking-tight truncate">
                  OsKost
                </span>
                <span className="text-[11px] font-semibold text-[#5C564E] truncate">
                  SaaS Platform
                </span>
              </div>
            </Link>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleMini}
                  type="button"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#5C564E] hover:text-[#A45A3D] hover:bg-[#FAF2EA] transition-colors cursor-pointer"
                  aria-label="Kecilkan ke Ikon"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-[#1E1B18] text-white font-semibold text-xs"
              >
                Kecilkan ke Ikon (Mini)
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="bg-[#FFFFFF] px-2 py-3 overflow-y-auto overflow-x-hidden">
        <SidebarGroup className="p-0">
          {!isEffectiveMini && (
            <SidebarGroupLabel className="text-[10px] font-bold text-[#5C564E]/80 uppercase tracking-wider px-2.5 mb-1">
              Menu Utama
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                const linkElement = (
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                    }}
                    className={`flex items-center rounded-xl transition-all font-medium text-xs sm:text-sm ${
                      isEffectiveMini
                        ? "justify-center h-10 w-10 mx-auto"
                        : "gap-2.5 px-3 py-2 w-full"
                    } ${
                      isActive
                        ? "bg-[#A45A3D]/10 text-[#A45A3D] font-bold border-2 border-[#A45A3D]/25 shadow-2xs"
                        : "text-[#38332E] hover:text-[#1E1B18] hover:bg-[#FAF2EA] border-2 border-transparent"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!isEffectiveMini && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                );

                return (
                  <SidebarMenuItem key={item.href}>
                    {isEffectiveMini ? (
                      <Tooltip>
                        <TooltipTrigger asChild>{linkElement}</TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="bg-[#1E1B18] text-white font-semibold text-xs shadow-md"
                        >
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      linkElement
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {userRole === "SUPER_ADMIN" && (
          <div className="mt-3 pt-3 border-t border-[#2C2825]/8">
            {!isEffectiveMini && (
              <div className="text-[10px] font-bold text-amber-700/80 uppercase tracking-wider px-2.5 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Platform Director</span>
              </div>
            )}
            <Link
              href="/super-admin"
              className={`flex items-center rounded-xl transition-all font-semibold text-xs ${
                isEffectiveMini
                  ? "justify-center h-10 w-10 mx-auto bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
                  : "gap-2 px-3 py-2 w-full bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border border-amber-600/30"
              }`}
            >
              <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600" />
              {!isEffectiveMini && <span>Konsol Super Admin ➔</span>}
            </Link>
          </div>
        )}
      </SidebarContent>

      {/* Footer: User Profile & Logout */}
      <SidebarFooter className="border-t border-[#2C2825]/8 bg-[#FFFFFF] p-2.5">
        {isEffectiveMini ? (
          // Footer Mini Mode
          <div className="flex flex-col items-center gap-2.5 py-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer border border-[#A45A3D]/20">
                  <AvatarFallback className="bg-[#A45A3D]/10 text-[#A45A3D] text-[11px] font-bold">
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-[#1E1B18] text-white text-xs max-w-xs shadow-md"
              >
                <p className="font-semibold truncate">{userEmail}</p>
                <p className="text-[10px] text-emerald-400 font-bold uppercase mt-0.5">
                  {userRole === "SUPER_ADMIN" ? "Super Admin" : "Admin Owner"}
                </p>
              </TooltipContent>
            </Tooltip>

            <form
              action={() => {
                startTransition(async () => {
                  await logout();
                });
              }}
              className="w-full flex justify-center"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="submit"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5C564E] hover:text-[#A45A3D] hover:bg-[#FAF2EA] transition-colors cursor-pointer"
                    aria-label="Keluar"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-[#1E1B18] text-white font-semibold text-xs shadow-md"
                >
                  Keluar
                </TooltipContent>
              </Tooltip>
            </form>
          </div>
        ) : (
          // Footer Normal (Expanded)
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="h-8 w-8 shrink-0 border border-[#A45A3D]/20">
                <AvatarFallback className="bg-[#A45A3D]/10 text-[#A45A3D] text-[11px] font-bold">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span
                  className="text-xs font-semibold text-[#1E1B18] truncate"
                  title={userEmail}
                >
                  {userEmail}
                </span>
                <Badge
                  variant="outline"
                  className={
                    userRole === "SUPER_ADMIN"
                      ? "w-fit text-[9px] px-1.5 py-0 font-bold border-amber-600/40 text-amber-600 bg-amber-500/10"
                      : "w-fit text-[9px] px-1.5 py-0 font-bold border-[#2C4C3B]/30 text-[#2C4C3B] bg-[#C7EBD4]/40"
                  }
                >
                  {userRole === "SUPER_ADMIN" ? "SUPER ADMIN" : "ADMIN"}
                </Badge>
              </div>
            </div>

            <form
              action={() => {
                startTransition(async () => {
                  await logout();
                });
              }}
            >
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#4A453F] transition-colors hover:bg-[#FAF2EA] hover:text-[#A45A3D] cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                <span>Keluar</span>
              </button>
            </form>
          </div>
        )}
      </SidebarFooter>

      {/* Drag Resizer Handle (Tepi Kanan Sidebar - Desktop Only) */}
      {!isMobile && (
        <div
          onMouseDown={startResizing}
          title="Geser untuk mengatur lebar sidebar (klik 2x untuk toggle mini)"
          onDoubleClick={toggleMini}
          className={`absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize z-30 group/rail transition-colors ${
            isDragging
              ? "bg-[#A45A3D] shadow-sm"
              : "hover:bg-[#A45A3D]/50 bg-transparent"
          }`}
        >
          {/* Visual drag pill indicator on hover/drag */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 -right-0.5 w-1 h-7 rounded-full transition-all ${
              isDragging
                ? "bg-[#A45A3D]"
                : "bg-transparent group-hover/rail:bg-[#A45A3D]/80"
            }`}
          />
        </div>
      )}
    </Sidebar>
  );
}
