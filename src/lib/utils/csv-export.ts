/**
 * Utility untuk generate dan download file CSV.
 * Digunakan di Admin Dashboard dan Tenant PWA.
 */

/**
 * Generate string CSV dari headers dan rows data.
 * Otomatis handle escape karakter khusus (koma, kutip, newline).
 */
export function generateCSV(
  headers: string[],
  rows: (string | number | null | undefined)[][]
): string {
  const escapeCell = (cell: string | number | null | undefined): string => {
    if (cell === null || cell === undefined) return "";
    const str = String(cell);
    // Escape jika mengandung koma, kutip ganda, atau newline
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.map(escapeCell).join(",");
  const dataLines = rows.map((row) => row.map(escapeCell).join(","));

  // Tambah BOM (Byte Order Mark) agar Excel membaca UTF-8 dengan benar
  return "\uFEFF" + [headerLine, ...dataLines].join("\n");
}

/**
 * Trigger download file CSV di browser.
 */
export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format tanggal ke format Indonesia (dd/mm/yyyy).
 */
export function formatDateForCSV(date: Date | string | null): string {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format angka ke Rupiah sederhana (tanpa simbol, hanya angka).
 */
export function formatCurrencyForCSV(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}
