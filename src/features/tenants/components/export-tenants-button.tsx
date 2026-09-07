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
import { exportTenantsDataAction } from "@/features/dashboard/export-actions";

/**
 * Tombol export data seluruh penghuni ke CSV.
 */
export function ExportTenantsButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const tenants = await exportTenantsDataAction();
      const today = new Date().toISOString().slice(0, 10);

      const headers = [
        "No",
        "Nama Lengkap",
        "Email",
        "No. HP",
        "No. KTP",
        "Alamat KTP",
        "Kontak Darurat",
        "No. Kontak Darurat",
        "Kamar",
        "Nama Kamar",
        "Properti",
        "Harga Sewa (Rp)",
        "Status Kontrak",
        "Mulai Kontrak",
        "Akhir Kontrak",
        "Tunggakan",
        "Terdaftar Sejak",
      ];

      const rows = tenants.map((t, i) => [
        i + 1,
        t.nama,
        t.email,
        t.noHP,
        t.noKTP,
        t.alamatKTP,
        t.kontakDarurat,
        t.noKontakDarurat,
        t.kamar,
        t.namaKamar,
        t.properti,
        formatCurrencyForCSV(t.hargaSewa),
        t.statusKontrak,
        t.mulaiKontrak !== "-" ? formatDateForCSV(t.mulaiKontrak) : "-",
        t.akhirKontrak !== "-" ? formatDateForCSV(t.akhirKontrak) : "-",
        t.tunggakan,
        formatDateForCSV(t.terdaftarSejak),
      ]);

      const csv = generateCSV(headers, rows);
      downloadCSV(`data-penghuni-${today}`, csv);
    } catch (error) {
      console.error("Gagal export data penghuni:", error);
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
      className="gap-1.5 border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs"
    >
      {isExporting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      Export Penghuni
    </Button>
  );
}
