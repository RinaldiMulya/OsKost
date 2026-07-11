import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/tenant/bottom-nav";
import { PWARegister } from "@/components/pwa-register";
import { Home, Signal, LogOut } from "lucide-react";
import Link from "next/link";
import { logout } from "@/features/auth/actions";
import { getTenantDashboardData } from "@/features/tenant-pwa/tenant-pwa-service";

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

  // Get tenant data for top header (such as room number)
  const dashboardData = await getTenantDashboardData(session.user.id);
  const roomNumber = dashboardData?.activeLease?.room?.number || "No Room";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col max-w-md mx-auto relative pb-16 shadow-2xl border-2 border-red-500">
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
        <div className="flex items-center gap-3">
          {roomNumber && (
            <span className="rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-semibold text-zinc-400 border border-zinc-800">
              Kamar {roomNumber}
            </span>
          )}
          <span
            className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
            title="Online"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col px-4 py-4 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
