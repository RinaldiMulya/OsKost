import { getOverviewPlatformData } from "@/features/super-admin/actions/overview-actions";
import { MetricKpiCard } from "@/features/super-admin/components/overview/metric-kpi-card";
import { MrrGrowthChart } from "@/features/super-admin/components/overview/mrr-growth-chart";
import { SubscriptionPieChart } from "@/features/super-admin/components/overview/subscription-pie-chart";
import { ExpiringSubscriptionsWidget } from "@/features/super-admin/components/overview/expiring-subscriptions-widget";
import { TopOwnersWidget } from "@/features/super-admin/components/overview/top-owners-widget";
import {
    DollarSign,
    TrendingUp,
    Users,
    Building2,
    BedDouble,
    AlertCircle,
} from "lucide-react";

export const metadata = {
    title: "Platform Overview",
};

export default async function SuperAdminOverviewPage() {
    const data = await getOverviewPlatformData();

    const formatCurrency = (val: number) => {
        return "Rp " + val.toLocaleString("id-ID");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2DA] pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A2E]">
                        Platform Executive Overview
                    </h1>
                    <p className="text-sm text-[#7A7A7A] mt-1">
                        Pusat telemetri kesehatan finansial, pertumbuhan subscription, dan kapasitas node OsKost.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-[#FFFFFF] border border-[#E8E2DA] rounded-xl px-4 py-2 text-xs flex items-center gap-2 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-[#4A7C59]" />
                        <span className="text-[#5C564E]">Active Subs:</span>
                        <span className="font-bold text-[#1A1A2E]">
                            {data.kpis.activeSubscriptionsCount} Properti
                        </span>
                    </div>
                </div>
            </div>

            {/* Row 1: KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <MetricKpiCard
                    title="Monthly Recurring Revenue"
                    value={formatCurrency(data.kpis.mrr)}
                    subtitle="Akumulasi tagihan aktif per bulan"
                    icon={DollarSign}
                    variant="terracotta"
                    trend={{ value: "+18.4% MoM", isPositive: true }}
                />
                <MetricKpiCard
                    title="Annual Run Rate (ARR)"
                    value={formatCurrency(data.kpis.arr)}
                    subtitle="Proyeksi 12 bulan ke depan"
                    icon={TrendingUp}
                    variant="gold"
                    trend={{ value: "Proyeksi Sehat", isPositive: true }}
                />
                <MetricKpiCard
                    title="Pemilik Kost Terdaftar"
                    value={`${data.kpis.totalOwners} Kost`}
                    subtitle={`${data.kpis.totalProperties} Properti Aktif`}
                    icon={Users}
                    variant="moss"
                    trend={{ value: "+3 Baru Bulan Ini", isPositive: true }}
                />
                <MetricKpiCard
                    title="Tingkat Okupansi Kamar"
                    value={`${data.kpis.occupancyRate}%`}
                    subtitle={`${data.kpis.occupiedRooms} dari ${data.kpis.totalRooms} kamar terisi`}
                    icon={BedDouble}
                    variant="default"
                    trend={{ value: "Platform-wide", isPositive: true }}
                />
            </div>

            {/* Row 2: Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <MrrGrowthChart data={data.mrrGrowthTrend} />
                </div>
                <div className="lg:col-span-1">
                    <SubscriptionPieChart data={data.tierBreakdown} />
                </div>
            </div>

            {/* Row 3: Actionable Data Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExpiringSubscriptionsWidget
                    subscriptions={data.expiringSubscriptions}
                />
                <TopOwnersWidget properties={data.topProperties} />
            </div>
        </div>
    );
}
