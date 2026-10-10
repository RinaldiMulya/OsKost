"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getReportsAction,
  updateReportStatusAction,
  getActiveLeasesAction,
  deleteReportAction,
} from "@/features/reports/actions";
import { ReportFilter } from "@/features/reports/components/ReportFilter";
import { ReportTable } from "@/features/reports/components/ReportTable";
import { ReportForm } from "@/features/reports/components/ReportForm";
import { ReportDetail } from "@/features/reports/components/ReportDetail";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  RefreshCw,
  AlertTriangle,
  Wrench,
  FileText,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type {
  ReportForAdmin,
  ActiveLeaseForSelect,
} from "@/features/reports/report-service";

type FilterStatus = "ALL" | "OPEN" | "IN_PROGRESS" | "RESOLVED";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportForAdmin[]>([]);
  const [activeLeases, setActiveLeases] = useState<ActiveLeaseForSelect[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportForAdmin | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Fetch Data ───────────────────────────────

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getReportsAction(
        filterStatus === "ALL" ? undefined : filterStatus
      );
      if (result.success) {
        setReports(result.data);
      } else {
        toast.error(result.error || "Gagal memuat laporan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat memuat laporan");
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]);

  const fetchActiveLeases = useCallback(async () => {
    try {
      const result = await getActiveLeasesAction();
      if (result.success) {
        setActiveLeases(result.data);
      }
    } catch (error) {
      console.error("Gagal memuat daftar sewa aktif:", error);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Muat active leases saat pertama kali render
  useEffect(() => {
    fetchActiveLeases();
  }, [fetchActiveLeases]);

  // ─── Handlers ─────────────────────────────────

  const handleStatusChange = async (
    id: string,
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
  ) => {
    setIsUpdating(true);
    try {
      const result = await updateReportStatusAction(id, status);
      if (result.success) {
        toast.success(result.message);
        await fetchReports();

        // Perbarui detail yang sedang dibuka
        if (selectedReport?.id === id) {
          setSelectedReport((prev) =>
            prev ? { ...prev, status } : null
          );
        }
      } else {
        toast.error(result.error || "Gagal memperbarui status");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat memperbarui status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewDetail = (report: ReportForAdmin) => {
    setSelectedReport(report);
    setDetailDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    fetchReports();
    fetchActiveLeases();
  };

  const handleDeletePrompt = (reportId: string) => {
    setReportToDelete(reportId);
    setDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!reportToDelete) return;
    setIsDeleting(true);
    try {
      const result = await deleteReportAction(reportToDelete);
      if (result.success) {
        toast.success(result.message);
        await fetchReports();
        // If details modal was open for this report, close it
        if (selectedReport?.id === reportToDelete) {
          setDetailDialogOpen(false);
          setSelectedReport(null);
        }
      } else {
        toast.error(result.error || "Gagal menghapus laporan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus laporan");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setReportToDelete(null);
    }
  };

  // ─── Statistik Ringkas ────────────────────────

  const openCount = reports.filter((r) => r.status === "OPEN").length;
  const inProgressCount = reports.filter(
    (r) => r.status === "IN_PROGRESS"
  ).length;
  const resolvedCount = reports.filter(
    (r) => r.status === "RESOLVED"
  ).length;

  // ─── Render ───────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#2C2825]/10">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E1B18] tracking-tight">
            Laporan Keluhan
          </h1>
          <p className="text-sm sm:text-base text-[#4A453F] font-medium">
            Kelola dan pantau laporan kerusakan fasilitas dari penghuni.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="gap-1.5 text-sm font-semibold bg-[#714A23] hover:bg-[#5C3B1A] text-white h-10 px-4 rounded-xl shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Tambah Laporan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchReports()}
            disabled={isLoading}
            className="gap-1.5 text-sm font-semibold border-[#2C2825]/15 bg-white text-[#1E1B18] hover:bg-[#F2EDE9] hover:text-[#1E1B18] h-10 px-4 rounded-xl shadow-sm"
          >
            <RefreshCw
              className={`h-4 w-4 text-[#8C6239] ${isLoading ? "animate-spin" : ""}`}
            />
            Segarkan
          </Button>
        </div>
      </div>

      {/* Statistik Singkat */}
      {!isLoading && filterStatus === "ALL" && (
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3.5 rounded-2xl border border-[#2C2825]/10 bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-700" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#1E1B18]">{openCount}</p>
              <p className="text-xs font-bold text-[#4A453F]">Terbuka</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 rounded-2xl border border-[#2C2825]/10 bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Wrench className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#1E1B18]">{inProgressCount}</p>
              <p className="text-xs font-bold text-[#4A453F]">Diproses</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 rounded-2xl border border-[#2C2825]/10 bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <Wrench className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#1E1B18]">{resolvedCount}</p>
              <p className="text-xs font-bold text-[#4A453F]">Selesai</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <ReportFilter onStatusChange={setFilterStatus} />
        <p className="text-xs font-semibold text-[#5C564E]">
          {reports.length} laporan ditampilkan
        </p>
      </div>

      {/* Konten Utama */}
      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full border-4 border-[#2C2825]/15 border-t-[#8C6239] h-8 w-8" />
          <p className="text-sm font-medium text-[#4A453F]">Memuat laporan...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#2C2825]/10 bg-white p-6 shadow-sm">
          <FileText className="h-10 w-10 text-[#8C6239]/40" />
          <div className="text-center">
            <p className="text-base font-bold text-[#1E1B18]">
              Tidak ada laporan
            </p>
            <p className="text-sm font-medium text-[#4A453F] mt-1">
              {filterStatus !== "ALL"
                ? "Coba ubah filter status di atas"
                : "Belum ada laporan keluhan dari penghuni"}
            </p>
          </div>
        </div>
      ) : (
        <ReportTable
          reports={reports}
          onStatusChange={handleStatusChange}
          onViewDetail={handleViewDetail}
          onDelete={handleDeletePrompt}
        />
      )}

      {/* Dialog: Tambah Laporan Baru */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="border-[#2C2825]/15 bg-white text-[#1E1B18] sm:max-w-md md:max-w-lg rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-xl font-bold text-[#1E1B18]">
              Tambah Laporan Baru
            </DialogTitle>
            <DialogDescription className="text-sm text-[#4A453F] font-medium">
              Buat laporan keluhan/kerusakan atas nama penghuni.
            </DialogDescription>
          </DialogHeader>
          <ReportForm
            activeLeases={activeLeases}
            onSuccess={handleCreateSuccess}
            onClose={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog: Detail Laporan */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="border-[#2C2825]/15 bg-white text-[#1E1B18] sm:max-w-md md:max-w-lg rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Detail Laporan</DialogTitle>
            <DialogDescription>
              Detail lengkap laporan keluhan
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <ReportDetail
              report={selectedReport}
              onStatusChange={handleStatusChange}
              onClose={() => setDetailDialogOpen(false)}
              isUpdating={isUpdating}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Alert Dialog: Konfirmasi Hapus */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-[#2C2825]/15 bg-white text-[#1E1B18] rounded-2xl p-6 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-[#1E1B18]">Hapus Laporan?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#4A453F] font-medium">
              Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan dan data akan dihapus secara permanen dari database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="border-[#2C2825]/15 bg-white text-[#1E1B18] hover:bg-[#F2EDE9] hover:text-[#1E1B18] rounded-xl font-semibold text-sm"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                executeDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 rounded-xl font-semibold text-sm shadow-sm"
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus Laporan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}