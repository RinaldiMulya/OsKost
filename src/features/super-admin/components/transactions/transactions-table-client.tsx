"use client";

import { useState } from "react";
import {
    SaaSTransactionItem,
    SaaSTransactionsSummary,
} from "@/features/super-admin/actions/transactions-actions";
import { manualVerifySaaSTransactionAction } from "@/features/super-admin/actions/saas-payment-actions";
import {
    Receipt,
    Search,
    Download,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    Building2,
    Mail,
    ArrowUpRight,
    TrendingUp,
    CreditCard,
    DollarSign,
    Loader2,
} from "lucide-react";

interface TransactionsTableClientProps {
    initialTransactions: SaaSTransactionItem[];
    summary: SaaSTransactionsSummary;
}

export function TransactionsTableClient({
    initialTransactions,
    summary,
}: TransactionsTableClientProps) {
    const [transactions, setTransactions] = useState<SaaSTransactionItem[]>(initialTransactions);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [verifyingId, setVerifyingId] = useState<string | null>(null);

    const handleManualVerify = async (id: string) => {
        if (!confirm("Tandai transaksi ini sebagai LUNAS (PAID) secara manual? Masa aktif paket langganan akan otomatis diperpanjang.")) {
            return;
        }

        setVerifyingId(id);
        try {
            const res = await manualVerifySaaSTransactionAction(id);
            if (res.success) {
                setTransactions((prev) =>
                    prev.map((t) => (t.id === id ? { ...t, status: "PAID", paymentMethod: "MANUAL_VERIFIED" } : t))
                );
            } else {
                alert(res.error || "Gagal memverifikasi transaksi.");
            }
        } catch (err: any) {
            alert(err?.message || "Terjadi kesalahan sistem.");
        } finally {
            setVerifyingId(null);
        }
    };

    const filteredTransactions = transactions.filter((tx) => {
        // Status filter
        if (statusFilter !== "ALL") {
            if (statusFilter === "FAILED_GROUP") {
                if (!["FAILED", "EXPIRED", "CANCELLED"].includes(tx.status)) return false;
            } else if (tx.status !== statusFilter) {
                return false;
            }
        }

        // Search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            tx.id.toLowerCase().includes(q) ||
            tx.propertyName.toLowerCase().includes(q) ||
            tx.ownerEmail.toLowerCase().includes(q) ||
            (tx.midtransOrderId && tx.midtransOrderId.toLowerCase().includes(q))
        );
    });

    const formatCurrency = (val: number) => {
        return "Rp " + val.toLocaleString("id-ID");
    };

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PAID":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Berhasil</span>
                    </span>
                );
            case "PENDING":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Menunggu</span>
                    </span>
                );
            case "FAILED":
            case "EXPIRED":
            case "CANCELLED":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>{status}</span>
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">
                        {status}
                    </span>
                );
        }
    };

    const handleExportCsv = () => {
        const headers = [
            "ID Transaksi",
            "Midtrans Ref",
            "Properti Kost",
            "Email Owner",
            "Tier Paket",
            "Periode (Bulan)",
            "Nominal (IDR)",
            "Metode Pembayaran",
            "Status",
            "Waktu Transaksi",
            "Waktu Dibayar",
        ];

        const rows = filteredTransactions.map((tx) => [
            tx.id,
            tx.midtransOrderId || "-",
            `"${tx.propertyName.replace(/"/g, '""')}"`,
            tx.ownerEmail,
            tx.planTier,
            tx.periodMonths,
            tx.amount,
            tx.paymentMethod || "MANUAL",
            tx.status,
            tx.createdAt,
            tx.paidAt || "-",
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute(
            "download",
            `transaksi_saas_oskost_${new Date().toISOString().slice(0, 10)}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-[#E8E2DA] shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs text-[#7A7A7A] font-medium block">
                            Total Pendapatan (All-Time)
                        </span>
                        <span className="text-xl font-bold text-[#8C6239]">
                            {formatCurrency(summary.totalRevenueAllTime)}
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8E2DA] flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-[#8C6239]" />
                    </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E8E2DA] shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs text-[#7A7A7A] font-medium block">
                            Pendapatan Bulan Ini
                        </span>
                        <span className="text-xl font-bold text-emerald-600">
                            {formatCurrency(summary.totalRevenueThisMonth)}
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8E2DA] flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E8E2DA] shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs text-[#7A7A7A] font-medium block">
                            Pembayaran Menunggu
                        </span>
                        <span className="text-xl font-bold text-amber-600">
                            {formatCurrency(summary.pendingAmount)}
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8E2DA] flex items-center justify-center">
                        <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E8E2DA] shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs text-[#7A7A7A] font-medium block">
                            Rasio Keberhasilan
                        </span>
                        <span className="text-xl font-bold text-[#1A1A2E]">
                            {summary.successRatePercentage}%
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8E2DA] flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-sky-600" />
                    </div>
                </div>
            </div>

            {/* Filter Bar & CSV Export */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E8E2DA] shadow-xs">
                {/* Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {[
                        { label: "Semua", value: "ALL" },
                        { label: "Berhasil", value: "PAID" },
                        { label: "Menunggu", value: "PENDING" },
                        { label: "Gagal / Batal", value: "FAILED_GROUP" },
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setStatusFilter(tab.value)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                                statusFilter === tab.value
                                    ? "bg-[#1A1A2E] text-white shadow-xs"
                                    : "text-[#7A7A7A] hover:text-[#1A1A2E] hover:bg-[#FAF7F2]"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search & Export Action */}
                <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-[#A0A0B2] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari ID, kost, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E8E2DA] rounded-xl focus:outline-none focus:border-[#8C6239] text-[#2D2D2D]"
                        />
                    </div>

                    <button
                        onClick={handleExportCsv}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E8E2DA] bg-[#FAF7F2] hover:bg-white text-xs font-semibold text-[#1A1A2E] shadow-xs transition-all shrink-0"
                    >
                        <Download className="w-3.5 h-3.5 text-[#8C6239]" />
                        <span>Ekspor CSV</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-[#E8E2DA] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAF7F2] text-[#7A7A7A] uppercase text-[10px] font-bold border-b border-[#E8E2DA]">
                            <tr>
                                <th className="py-3.5 px-4">ID Transaksi</th>
                                <th className="py-3.5 px-4">Properti & Klien</th>
                                <th className="py-3.5 px-4">Paket SaaS</th>
                                <th className="py-3.5 px-4">Nominal</th>
                                <th className="py-3.5 px-4">Metode</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4">Waktu</th>
                                <th className="py-3.5 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F2ECE4]">
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-[#A0A0B2]">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Receipt className="w-8 h-8 text-[#D1C9BE]" />
                                            <p className="font-semibold text-[#5C564E]">
                                                Belum ada data transaksi langganan SaaS.
                                            </p>
                                            <p className="text-[11px] text-[#A0A0B2]">
                                                Transaksi pembayaran paket dari pemilik kost akan otomatis tercatat di sini.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-semibold text-[#1A1A2E]">
                                            <span>{tx.id.slice(0, 10)}...</span>
                                            {tx.midtransOrderId && (
                                                <span className="block text-[10px] text-[#A0A0B2] font-mono">
                                                    ref: {tx.midtransOrderId}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-[#1A1A2E]">
                                                {tx.propertyName}
                                            </div>
                                            <div className="text-[11px] text-[#7A7A7A]">
                                                {tx.ownerEmail}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E8E2DA] text-[11px] font-bold text-[#8C6239]">
                                                {tx.planTier}
                                            </span>
                                            <span className="block text-[10px] text-[#A0A0B2] mt-0.5">
                                                {tx.periodMonths} Bulan
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-[#1A1A2E]">
                                            {formatCurrency(tx.amount)}
                                        </td>
                                        <td className="py-3.5 px-4 font-medium text-[#5C564E]">
                                            {tx.paymentMethod || "MANUAL"}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {getStatusBadge(tx.status)}
                                        </td>
                                        <td className="py-3.5 px-4 text-[#7A7A7A]">
                                            {formatDate(tx.createdAt)}
                                        </td>
                                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                            {tx.status === "PENDING" ? (
                                                <button
                                                    onClick={() => handleManualVerify(tx.id)}
                                                    disabled={verifyingId === tx.id}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                                                    title="Tandai pembayaran ini sudah lunas secara manual"
                                                >
                                                    {verifyingId === tx.id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                                                    ) : (
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                    )}
                                                    <span>Verifikasi</span>
                                                </button>
                                            ) : (
                                                <span className="text-[#A0A0B2] text-[11px] font-mono">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
