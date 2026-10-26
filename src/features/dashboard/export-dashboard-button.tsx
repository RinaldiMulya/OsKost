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
import { exportDashboardDataAction } from "./export-actions";

const PAYMENT_STATUS: Record<string, string> = {
  PAID: "Lunas",
  PENDING: "Menunggu Konfirmasi",
  UNPAID: "Belum Lunas",
  OVERDUE: "Terlambat",
};

const REPORT_STATUS: Record<string, string> = {
  OPEN: "Terbuka",
  IN_PROGRESS: "Diproses",
  RESOLVED: "Selesai",
};

/**
 * Tombol export seluruh data dashboard admin ke file CSV.
 * Menghasilkan satu file CSV dengan beberapa section (stats, aktivitas, kontrak habis).
 */
export function ExportDashboardButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportDashboardDataAction();
      const today = new Date().toISOString().slice(0, 10);

      // === SECTION 1: Ringkasan Statistik ===
      const statsHeaders = ["Metrik", "Nilai"];
      const statsRows = [
        ["Total Kamar", data.stats.totalRooms],
        ["Kamar Terisi", data.stats.occupied],
        ["Kamar Tersedia", data.stats.available],
        ["Kamar Maintenance", data.stats.maintenance],
        ["Total Penghuni Aktif", data.stats.totalTenants],
        ["Tunggakan", data.stats.unpaidInvoices],
        ["Laporan Terbuka", data.stats.openReports],
        ["Occupancy Rate (%)", data.stats.occupancyRate],
      ];
      const statsCsv = generateCSV(statsHeaders, statsRows);

      // === SECTION 2: Pembayaran 3 Hari Terakhir ===
      const payHeaders = [
        "No",
        "Nama Penghuni",
        "Kamar",
        "Total (Rp)",
        "Status",
        "Tanggal Bayar",
        "Jatuh Tempo",
      ];
      const payRows = data.recentPayments.map((p, i) => [
        i + 1,
        p.nama,
        p.kamar,
        formatCurrencyForCSV(p.amount),
        PAYMENT_STATUS[p.status] || p.status,
        p.paidAt ? formatDateForCSV(p.paidAt) : "-",
        formatDateForCSV(p.dueDate),
      ]);
      const payCsv = generateCSV(payHeaders, payRows);

      // === SECTION 3: Check-in 3 Hari Terakhir ===
      const checkInHeaders = ["No", "Nama Penghuni", "Kamar", "Tanggal Masuk"];
      const checkInRows = data.recentCheckIns.map((c, i) => [
        i + 1,
        c.nama,
        c.kamar,
        formatDateForCSV(c.startDate),
      ]);
      const checkInCsv = generateCSV(checkInHeaders, checkInRows);

      // === SECTION 4: Laporan 3 Hari Terakhir ===
      const reportHeaders = [
        "No",
        "Judul",
        "Nama Penghuni",
        "Kamar",
        "Status",
        "Tanggal Dibuat",
      ];
      const reportRows = data.recentReports.map((r, i) => [
        i + 1,
        r.judul,
        r.nama,
        r.kamar,
        REPORT_STATUS[r.status] || r.status,
        formatDateForCSV(r.createdAt),
      ]);
      const reportCsv = generateCSV(reportHeaders, reportRows);

      // === SECTION 5: Kamar Habis Kontrak ===
      const expHeaders = [
        "No",
        "Nama Penghuni",
        "Kamar",
        "Akhir Kontrak",
        "Sisa Hari",
      ];
      const expRows = data.expiringLeases.map((e, i) => [
        i + 1,
        e.nama,
        e.kamar,
        formatDateForCSV(e.endDate),
        e.daysRemaining,
      ]);
      const expCsv = generateCSV(expHeaders, expRows);

      // Gabungkan semua section dengan separator
      const fullCsv = [
        "=== RINGKASAN DASHBOARD OSKOST ===",
        `Tanggal Export: ${today}`,
        "",
        "--- STATISTIK ---",
        statsCsv.replace("\uFEFF", ""), // Remove BOM from inner sections
        "",
        "--- PEMBAYARAN (3 HARI TERAKHIR) ---",
        payCsv.replace("\uFEFF", ""),
        "",
        "--- CHECK-IN (3 HARI TERAKHIR) ---",
        checkInCsv.replace("\uFEFF", ""),
        "",
        "--- LAPORAN (3 HARI TERAKHIR) ---",
        reportCsv.replace("\uFEFF", ""),
        "",
        "--- KAMAR HABIS KONTRAK (< 30 HARI) ---",
        expCsv.replace("\uFEFF", ""),
      ].join("\n");

      // Tambah BOM di awal
      downloadCSV(`dashboard-oskost-${today}`, "\uFEFF" + fullCsv);
    } catch (error) {
      console.error("Gagal export dashboard:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      size="sm"
      className="gap-2 border-2 border-[#2C2825]/18 rounded-xl bg-white text-[#1E1B18] hover:text-[#1E1B18] hover:bg-[#F2EDE9] hover:border-[#2C2825]/30 text-sm font-semibold shadow-2xs h-9 px-3.5 transition-all"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin text-[#8C6239]" />
      ) : (
        <Download className="h-4 w-4 text-[#8C6239]" />
      )}
      Export CSV
    </Button>
  );
}
