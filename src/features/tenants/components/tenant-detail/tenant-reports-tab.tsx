"use client";

import Image from "next/image";
import type { TenantDetailForAdmin } from "../../tenant-service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Calendar, MessageSquare, Wrench, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { deleteReportAction } from "@/features/reports/actions";
import { toast } from "sonner";
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
import { ImageViewer } from "@/components/shared/image-viewer";

interface TenantReportsTabProps {
  tenant: TenantDetailForAdmin;
}

export function TenantReportsTab({ tenant }: TenantReportsTabProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Kumpulkan semua report dari semua lease yang pernah ada, urutkan terbaru
  const allReports = tenant.leases
    .flatMap((l) => l.reports)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  function formatDate(dateStr: Date | string) {
    if (!dateStr) return "—";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  }

  const handleDeletePrompt = (reportId: string) => {
    setReportToDelete(reportId);
    setDeleteDialogOpen(true);
  };

  const executeDelete = () => {
    if (!reportToDelete) return;

    startTransition(async () => {
      try {
        const result = await deleteReportAction(reportToDelete);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.error || "Gagal menghapus laporan");
        }
      } catch (error) {
        toast.error("Terjadi kesalahan saat menghapus laporan");
      } finally {
        setDeleteDialogOpen(false);
        setReportToDelete(null);
      }
    });
  };

  return (
    <Card className="bg-white border-[#2C2825]/10 rounded-2xl shadow-xs overflow-hidden">
      <CardHeader className="p-5 pb-4 border-b border-[#2C2825]/10 bg-[#FAF2EA]/40">
        <CardTitle className="text-base font-bold text-[#1E1B18] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Wrench className="size-4" />
            </div>
            <span>Laporan Kerusakan & Keluhan</span>
          </div>
          <span className="text-xs text-[#7A7269] font-medium font-sans">
            Total {allReports.length} Laporan
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {allReports.length > 0 ? (
          <div className="space-y-4">
            {allReports.map((report) => (
              <div
                key={report.id}
                className="bg-[#F8F6F1] border border-[#2C2825]/10 rounded-xl p-5 relative overflow-hidden transition-all hover:border-[#2C2825]/20 shadow-2xs"
              >
                <div className="absolute top-0 right-0">
                  <Badge
                    className={`rounded-none rounded-bl-lg font-bold uppercase tracking-wider text-[10px] px-3 py-1 border-b border-l ${
                      report.status === "OPEN"
                        ? "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100"
                        : report.status === "IN_PROGRESS"
                          ? "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100"
                          : "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                    }`}
                  >
                    {report.status.replace("_", " ")}
                  </Badge>
                </div>

                <div className="pr-20 mb-3 flex items-start justify-between">
                  <div>
                    <h4 className="text-[#1E1B18] font-bold text-base">
                      {report.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-[#7A7269] mt-1">
                      <Calendar className="size-3.5" />
                      <span>Dilaporkan pada {formatDate(report.createdAt)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePrompt(report.id)}
                    className="h-8 w-8 p-0 text-[#7A7269] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus Laporan"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-start gap-2.5 mt-3">
                  <MessageSquare className="size-4 text-[#7A7269] mt-0.5 shrink-0" />
                  <p className="text-[#1E1B18] text-xs leading-relaxed bg-white p-3.5 rounded-xl flex-1 border border-[#2C2825]/10">
                    {report.description}
                  </p>
                </div>

                {report.photoUrl && (
                  <div className="mt-4 pl-6.5">
                    <span className="text-[11px] font-semibold text-[#7A7269] uppercase tracking-wider block mb-2">
                      Lampiran Foto Kerusakan:
                    </span>
                    <ImageViewer
                      src={report.photoUrl}
                      alt={report.title}
                      className="w-48 h-32 bg-[#F4EDE4] rounded-xl border border-[#2C2825]/15 overflow-hidden shadow-2xs"
                      imageClassName="object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-[#7A7269] text-center">
            <AlertCircle className="size-10 mb-2 opacity-30 text-[#7A7269]" />
            <p className="font-semibold text-sm text-[#4A453F]">
              Belum Ada Laporan Kerusakan
            </p>
            <p className="text-xs text-[#7A7269] mt-0.5">
              Penghuni ini belum pernah mengajukan tiket keluhan atau kerusakan fasilitas.
            </p>
          </div>
        )}
      </CardContent>

      {/* Alert Dialog: Konfirmasi Hapus */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-[#2C2825]/15 bg-white text-[#1E1B18] rounded-2xl shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-[#1E1B18]">
              Hapus Tiket Laporan?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#4A453F] text-xs leading-relaxed">
              Apakah Anda yakin ingin menghapus catatan laporan kerusakan ini? Tindakan
              ini tidak dapat dibatalkan dan data laporan akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={isPending}
              className="border-[#2C2825]/15 bg-white text-[#4A453F] hover:bg-[#FAF2EA] rounded-xl text-xs"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                executeDelete();
              }}
              disabled={isPending}
              className="bg-rose-700 text-white hover:bg-rose-800 rounded-xl text-xs"
            >
              {isPending ? "Menghapus..." : "Ya, Hapus Laporan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
