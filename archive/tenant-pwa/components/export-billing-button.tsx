"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import {
  generateCSV,
  downloadCSV,
  formatDateForCSV,
  formatCurrencyForCSV,
} from "@/lib/utils/csv-export";

interface InvoiceForExport {
  id: string;
  dueDate: string | Date;
  amount: number;
  rentAmount: number;
  utilityAmount: number;
  otherAmount: number;
  status: string;
  paidAt: string | Date | null;
}

const STATUS_LABELS: Record<string, string> = {
  PAID: "Lunas",
  PENDING: "Menunggu Konfirmasi",
  UNPAID: "Belum Lunas",
  OVERDUE: "Terlambat",
  CANCELLED: "Dibatalkan",
};

export function ExportBillingButton({
  invoices,
}: {
  invoices: InvoiceForExport[];
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    if (invoices.length === 0) return;

    setIsExporting(true);
    try {
      const headers = [
        "No",
        "Bulan",
        "Sewa Kamar (Rp)",
        "Listrik/Air (Rp)",
        "Lain-lain (Rp)",
        "Total (Rp)",
        "Status",
        "Tanggal Bayar",
        "Jatuh Tempo",
      ];

      const rows = invoices.map((inv, i) => {
        const dueDateObj = new Date(inv.dueDate);
        const monthLabel = dueDateObj.toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        });

        return [
          i + 1,
          monthLabel,
          formatCurrencyForCSV(inv.rentAmount),
          formatCurrencyForCSV(inv.utilityAmount),
          formatCurrencyForCSV(inv.otherAmount),
          formatCurrencyForCSV(inv.amount),
          STATUS_LABELS[inv.status] || inv.status,
          inv.paidAt ? formatDateForCSV(inv.paidAt) : "-",
          formatDateForCSV(inv.dueDate),
        ];
      });

      const csv = generateCSV(headers, rows);
      const today = new Date().toISOString().slice(0, 10);
      downloadCSV(`riwayat-pembayaran-${today}`, csv);
    } finally {
      setIsExporting(false);
    }
  };

  if (invoices.length === 0) return null;

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      size="sm"
      className="gap-1.5 border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs rounded-xl"
    >
      {isExporting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      Download CSV
    </Button>
  );
}
