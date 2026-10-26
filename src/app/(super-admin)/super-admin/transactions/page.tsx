import { getSaaSTransactionsData } from "@/features/super-admin/actions/transactions-actions";
import { TransactionsTableClient } from "@/features/super-admin/components/transactions/transactions-table-client";
import { Receipt } from "lucide-react";

export const metadata = {
    title: "Log Transaksi SaaS | OsKost Super Admin",
    description: "Catatan transaksi pembayaran langganan B2B pemilik kost dan rekonsiliasi gateway Midtrans.",
};

export default async function SuperAdminTransactionsPage() {
    const { transactions, summary } = await getSaaSTransactionsData();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2DA] pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A2E] flex items-center gap-2.5">
                        <Receipt className="w-7 h-7 text-[#8C6239]" />
                        <span>Log Transaksi Langganan SaaS</span>
                    </h1>
                    <p className="text-sm text-[#7A7A7A] mt-1">
                        Pusat pemantauan arus kas pendapatan berulang (MRR), riwayat tagihan klien B2B, dan rekonsiliasi Midtrans.
                    </p>
                </div>
            </div>

            {/* Interactive DataTable & Metrics */}
            <TransactionsTableClient
                initialTransactions={transactions}
                summary={summary}
            />
        </div>
    );
}
