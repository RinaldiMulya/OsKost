import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/tenant/bottom-nav";
import { PWARegister } from "@/components/pwa-register";
import { getTenantDashboardData } from "@/features/tenant-pwa/tenant-pwa-service";
import { getUserNotifications } from "@/features/notifications/notification-service";
import { NotificationBell } from "@/components/shared/notification-bell";
import { AnnouncementBanner } from "@/components/tenant/announcement-banner";
import type { Metadata, Viewport } from "next";

// PWA manifest & meta tags HANYA didaftarkan di route Tenant (ring-fencing)
export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "Dashboard Penghuni | OsKost",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OsKost",
  },
};

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Protect Tenant routes: Redirect if not logged in or not a tenant
  if (!session?.user || session.user.role !== "TENANT") {
    redirect("/login");
  }

  // Get tenant data for top header (such as room number) and notifications
  const [dashboardData, notifications] = await Promise.all([
    getTenantDashboardData(session.user.id),
    getUserNotifications(session.user.id),
  ]);

  const roomNumber = dashboardData?.activeLease?.room?.number || null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col max-w-md mx-auto relative pb-16 shadow-2xl border-x border-zinc-900">
      {/* PWA Service Worker Registration */}
      <PWARegister />

      {/* Top Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 px-4 py-3.5 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/10">
            <span className="text-sm font-bold text-secondary">OK</span>
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            OsKost Tenant
          </span>
        </div>
        <div className="flex items-center gap-2">
          {roomNumber && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900/90 px-2.5 py-1 text-xs font-semibold text-zinc-300 border border-zinc-800/80 shadow-sm">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Kamar {roomNumber}</span>
            </span>
          )}
          <NotificationBell notifications={notifications} />
        </div>
      </header>

      {/* Floating Announcement Banner Slider */}
      <AnnouncementBanner notifications={notifications} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col px-4 py-4 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
