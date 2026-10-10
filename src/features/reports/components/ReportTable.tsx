"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ImageIcon,
  Trash2,
} from "lucide-react";
import type { ReportForAdmin } from "../report-service";

// ============================================
// Komponen Badge Status
// ============================================

function StatusBadge({ status }: { status: "OPEN" | "IN_PROGRESS" | "RESOLVED" }) {
  const config = {
    OPEN: {
      label: "Terbuka",
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      className: "bg-red-50 text-red-800 border-red-300",
    },
    IN_PROGRESS: {
      label: "Diproses",
      icon: <Wrench className="h-3.5 w-3.5" />,
      className: "bg-amber-50 text-amber-800 border-amber-300",
    },
    RESOLVED: {
      label: "Selesai",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      className: "bg-emerald-50 text-emerald-800 border-emerald-300",
    },
  };

  const { label, icon, className } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}

// ============================================
// Utilitas format tanggal
// ============================================

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;

  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ============================================
// Komponen Utama Tabel
// ============================================

export function ReportTable({
  reports,
  onStatusChange,
  onViewDetail,
  onDelete,
}: {
  reports: ReportForAdmin[];
  onStatusChange: (
    id: string,
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
  ) => Promise<void>;
  onViewDetail: (report: ReportForAdmin) => void;
  onDelete?: (reportId: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-[#2C2825]/10 bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-[#2C2825]/10 bg-[#F8F6F1]/80 hover:bg-[#F8F6F1]/80">
            <TableHead className="text-[#1E1B18] font-bold text-sm h-12">
              Judul
            </TableHead>
            <TableHead className="text-[#1E1B18] font-bold text-sm h-12">
              Penghuni
            </TableHead>
            <TableHead className="text-[#1E1B18] font-bold text-sm h-12">
              Kamar
            </TableHead>
            <TableHead className="text-[#1E1B18] font-bold text-sm h-12">
              Status
            </TableHead>
            <TableHead className="text-[#1E1B18] font-bold text-sm h-12">
              Dibuat
            </TableHead>
            <TableHead className="text-[#1E1B18] font-bold text-sm h-12 w-12">
              {/* Aksi */}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow
              key={report.id}
              className="border-b border-[#2C2825]/8 hover:bg-[#F8F6F1]/70 transition-colors cursor-pointer"
              onClick={() => onViewDetail(report)}
            >
              <TableCell className="max-w-48 py-4">
                <div className="flex items-center gap-2">
                  {report.photoUrl && (
                    <ImageIcon className="h-4 w-4 text-[#8C6239] shrink-0" />
                  )}
                  <span className="font-bold text-[#1E1B18] text-sm truncate">
                    {report.title}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-[#4A453F] font-semibold text-sm truncate max-w-36 py-4">
                {report.lease.user.tenantProfile?.fullName || "—"}
              </TableCell>
              <TableCell className="text-sm py-4">
                <div className="text-[#1E1B18] font-bold">
                  {report.lease.room.number} – {report.lease.room.name}
                </div>
                <div className="text-xs font-medium text-[#5C564E] mt-0.5">
                  {report.lease.room.property.name}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <StatusBadge status={report.status} />
              </TableCell>
              <TableCell className="text-xs font-semibold text-[#5C564E] py-4">
                {formatRelativeDate(report.createdAt)}
              </TableCell>
              <TableCell className="py-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-[#4A453F] hover:text-[#1E1B18] hover:bg-[#F2EDE9] rounded-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 bg-white border-[#2C2825]/15 text-[#1E1B18] shadow-lg rounded-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenuItem
                      onClick={() => onViewDetail(report)}
                      className="text-[#1E1B18] font-medium text-xs focus:bg-[#F2EDE9] focus:text-[#1E1B18] cursor-pointer"
                    >
                      <Eye className="h-4 w-4 mr-2 text-[#714A23]" />
                      Lihat Detail
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-[#2C2825]/10" />

                    {report.status !== "OPEN" && (
                      <DropdownMenuItem
                        onClick={() => onStatusChange(report.id, "OPEN")}
                        className="text-red-700 font-medium text-xs focus:bg-red-50 focus:text-red-800 cursor-pointer"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Tandai Terbuka
                      </DropdownMenuItem>
                    )}
                    {report.status !== "IN_PROGRESS" && (
                      <DropdownMenuItem
                        onClick={() =>
                          onStatusChange(report.id, "IN_PROGRESS")
                        }
                        className="text-amber-800 font-medium text-xs focus:bg-amber-50 focus:text-amber-900 cursor-pointer"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Tandai Diproses
                      </DropdownMenuItem>
                    )}
                    {report.status !== "RESOLVED" && (
                      <DropdownMenuItem
                        onClick={() =>
                          onStatusChange(report.id, "RESOLVED")
                        }
                        className="text-emerald-800 font-medium text-xs focus:bg-emerald-50 focus:text-emerald-900 cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Tandai Selesai
                      </DropdownMenuItem>
                    )}
                    
                    {onDelete && (
                      <>
                        <DropdownMenuSeparator className="bg-[#2C2825]/10" />
                        <DropdownMenuItem
                          onClick={() => onDelete(report.id)}
                          className="text-red-600 font-medium text-xs focus:bg-red-50 focus:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus Laporan
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}