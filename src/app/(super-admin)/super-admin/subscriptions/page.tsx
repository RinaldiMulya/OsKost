import Link from "next/link";
import { getSubscriptionsData } from "@/features/super-admin/actions/subscriptions-actions";
import { SubscriptionsTable } from "@/features/super-admin/components/subscriptions/subscriptions-table";
import { CreditCard, CheckCircle2, Clock, AlertTriangle, Sliders } from "lucide-react";

export const metadata = {
    title: "Manajemen Langganan SaaS",
};

export default async function SuperAdminSubscriptionsPage() {
    const { subscriptions, summary } = await getSubscriptionsData();

    const formatCurrency = (val: number) => {
        return "Rp " + val.toLocaleString("id-ID");
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2DA] pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A2E]">
                        Manajemen Langganan SaaS
                    </h1>
                    <p className="text-sm text-[#7A7A7A] mt-1">
                        Monitoring siklus penagihan, kuota unit kamar, masa aktif, dan status lisensi platform.
                    </p>
                </div>

                <Link
                    href="/super-admin/subscriptions/plans"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E8E2DA] hover:border-[#8C6239] text-xs font-semibold text-[#1A1A2E] shadow-xs transition-all hover:bg-[#FAF7F2] shrink-0"
                >
                    <Sliders className="w-3.5 h-3.5 text-[#8C6239]" />
                    <span>Kelola Paket & Harga</span>
                </Link>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E8E2DA] shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-semibold text-[#7A7A7A] uppercase">
                            Total MRR Aktif
                        </p>
                        <p className="text-lg font-bold text-[#8C6239] mt-0.5">
                            {formatCurrency(summary.totalMrr)}
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-[#8C6239]/10 text-[#8C6239] flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                    </div>
                </div>

                <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E8E2DA] shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-semibold text-[#7A7A7A] uppercase">
                            Lisensi Aktif
                        </p>
                        <p className="text-lg font-bold text-[#4A7C59] mt-0.5">
                            {summary.activeCount} Properti
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-[#4A7C59]/10 text-[#4A7C59] flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                </div>

                <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E8E2DA] shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-semibold text-[#7A7A7A] uppercase">
                            Masa Trial
                        </p>
                        <p className="text-lg font-bold text-[#D4A843] mt-0.5">
                            {summary.trialCount} Properti
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-[#D4A843]/15 text-[#9E7822] flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                    </div>
                </div>

                <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E8E2DA] shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-semibold text-[#7A7A7A] uppercase">
                            Past Due (Menunggak)
                        </p>
                        <p className="text-lg font-bold text-[#C45B4B] mt-0.5">
                            {summary.pastDueCount} Properti
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-[#C45B4B]/10 text-[#C45B4B] flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Subscriptions DataTable */}
            <SubscriptionsTable initialSubscriptions={subscriptions} />
        </div>
    );
}
