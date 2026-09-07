import {
    BedDouble,
    Users,
    Receipt,
    AlertCircle,
    CheckCircle2,
    TrendingUp,
} from "lucide-react";
import { Suspense } from "react";
import {
    getDashboardStats,
    getRecentActivities,
    getExpiringLeases,
    getRevenueChartData,
    getOccupancyChartData,
    getPaymentStatusChartData,
    getMaintenanceChartData,
} from "@/features/dashboard/dashboard-service";
import { StatCard } from "@/features/dashboard/stat-card";
import { SyncButton } from "@/features/dashboard/sync-button";
import { RecentActivities } from "@/features/dashboard/recent-activities";
import { ExpiringLeases } from "@/features/dashboard/expiring-leases";
import { ExportDashboardButton } from "@/features/dashboard/export-dashboard-button";
import { Skeleton } from "@/components/ui/skeleton";

// Chart components (sudah "use client" — Next.js auto code-split di boundary ini)
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import { OccupancyChart } from "@/features/dashboard/components/occupancy-chart";
import { PaymentStatusChart } from "@/features/dashboard/components/payment-status-chart";
import { MaintenanceChart } from "@/features/dashboard/components/maintenance-chart";

function ChartSkeleton() {
    return (
        <div className="flex items-center justify-center h-[280px] w-full">
            <Skeleton className="h-[240px] w-full rounded-lg" />
        </div>
    );
}

export const metadata = {
    title: "Overview | Admin Smartkost",
};

export default async function AdminOverviewPage() {
    // Fetch semua data secara paralel (termasuk chart data)
    const [
        stats,
        activities,
        expiringLeases,
        revenueData,
        occupancyData,
        paymentStatusData,
        maintenanceData,
    ] = await Promise.all([
        getDashboardStats(),
        getRecentActivities(),
        getExpiringLeases(),
        getRevenueChartData(),
        getOccupancyChartData(),
        getPaymentStatusChartData(),
        getMaintenanceChartData(),
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
                <div className="flex items-center gap-2">
                    <ExportDashboardButton />
                    <SyncButton />
                </div>
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

            {/* Charts Row 1 — Pendapatan & Okupansi */}
            <div className="grid gap-4 lg:grid-cols-5">
                {/* Pendapatan — lebih lebar (3/5) */}
                <div className="lg:col-span-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-6">
                    <div className="mb-4">
                        <h3 className="text-base font-semibold text-white">
                            Tren Pendapatan
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            6 bulan terakhir — invoice lunas
                        </p>
                    </div>
                    <Suspense fallback={<ChartSkeleton />}>
                        <RevenueChart data={revenueData} />
                    </Suspense>
                </div>

                {/* Okupansi — lebih kecil (2/5) */}
                <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-6">
                    <div className="mb-4">
                        <h3 className="text-base font-semibold text-white">
                            Okupansi Kamar
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Distribusi status kamar saat ini
                        </p>
                    </div>
                    <Suspense fallback={<ChartSkeleton />}>
                        <OccupancyChart data={occupancyData} />
                    </Suspense>
                </div>
            </div>

            {/* Charts Row 2 — Status Tagihan & Laporan Kerusakan */}
            <div className="grid gap-4 lg:grid-cols-5">
                {/* Status Tagihan — lebih kecil (2/5) */}
                <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-6">
                    <div className="mb-4">
                        <h3 className="text-base font-semibold text-white">
                            Status Tagihan
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Bulan berjalan
                        </p>
                    </div>
                    <Suspense fallback={<ChartSkeleton />}>
                        <PaymentStatusChart data={paymentStatusData} />
                    </Suspense>
                </div>

                {/* Laporan Kerusakan — lebih lebar (3/5) */}
                <div className="lg:col-span-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-6">
                    <div className="mb-4">
                        <h3 className="text-base font-semibold text-white">
                            Tren Laporan Kerusakan
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            6 bulan terakhir — per status
                        </p>
                    </div>
                    <Suspense fallback={<ChartSkeleton />}>
                        <MaintenanceChart data={maintenanceData} />
                    </Suspense>
                </div>
            </div>

            {/* Third Row — Widgets */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Aktivitas Terbaru */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6 flex flex-col h-full">
                    <div className="mb-6">
                        <h3 className="text-base font-semibold text-white">
                            Aktivitas Terbaru
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">3 hari terakhir</p>
                    </div>
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
