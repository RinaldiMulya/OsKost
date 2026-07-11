import {
    BedDouble,
    Users,
    Receipt,
    AlertCircle,
    CheckCircle2,
    Wrench,
    TrendingUp,
} from "lucide-react";
import { getDashboardStats, getRecentActivities, getExpiringLeases } from "@/features/dashboard/dashboard-service";
import { StatCard } from "@/features/dashboard/stat-card";
import { SyncButton } from "@/features/dashboard/sync-button";
import { RecentActivities } from "@/features/dashboard/recent-activities";
import { ExpiringLeases } from "@/features/dashboard/expiring-leases";

export const metadata = {
    title: "Overview | Admin Smartkost",
};

export default async function AdminOverviewPage() {
    // Fetch all data in parallel
    const [stats, activities, expiringLeases] = await Promise.all([
        getDashboardStats(),
        getRecentActivities(),
        getExpiringLeases()
    ]);

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        Selamat Datang, Admin 👋
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Berikut ringkasan kondisi kost Anda hari ini.
                    </p>
                </div>
                <SyncButton />
            </div>

            {/* Stat Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Kamar"
                    value={stats.totalRooms}
                    icon={BedDouble}
                />
                <StatCard
                    label="Kamar Terisi"
                    value={stats.occupied}
                    icon={CheckCircle2}
                />
                <StatCard
                    label="Kamar Tersedia"
                    value={stats.available}
                    icon={BedDouble}
                    variant="muted"
                />
                <StatCard
                    label="Occupancy Rate"
                    value={stats.occupancyRate}
                    suffix="%"
                    icon={TrendingUp}
                    variant={stats.occupancyRate > 80 ? "default" : "warning"}
                />
            </div>

            {/* Second Row — People & Issues */}
            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                    label="Total Penghuni"
                    value={stats.totalTenants}
                    icon={Users}
                />
                <StatCard
                    label="Tunggakan"
                    value={stats.unpaidInvoices}
                    icon={Receipt}
                    variant="danger"
                />
                <StatCard
                    label="Laporan Baru"
                    value={stats.openReports}
                    icon={AlertCircle}
                    variant={stats.openReports > 0 ? "warning" : "default"}
                />
            </div>

            {/* Third Row — Widgets */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Aktivitas Terbaru */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6 flex flex-col h-full">
                    <h3 className="text-base font-semibold text-white mb-6">
                        Aktivitas Terbaru
                    </h3>
                    <div className="flex-1">
                        <RecentActivities activities={activities} />
                    </div>
                </div>

                {/* Kamar Akan Habis Kontrak */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6 flex flex-col h-full">
                    <h3 className="text-base font-semibold text-white mb-6">
                        Akan Habis Kontrak (&lt; 30 Hari)
                    </h3>
                    <div className="flex-1">
                        <ExpiringLeases leases={expiringLeases} />
                    </div>
                </div>
            </div>
        </div>
    );
}
