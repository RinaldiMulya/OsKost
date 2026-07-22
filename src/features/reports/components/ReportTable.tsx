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
      icon: <AlertTriangle className="h-3 w-3" />,
      className: "bg-red-500/10 text-red-400 border-red-500/20",
    },
    IN_PROGRESS: {
      label: "Diproses",
      icon: <Wrench className="h-3 w-3" />,
      className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    RESOLVED: {
      label: "Selesai",
      icon: <CheckCircle2 className="h-3 w-3" />,
      className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
  };

  const { label, icon, className } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${className}`}
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
    <div className="rounded-xl border border-zinc-800 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/50">
            <TableHead className="text-zinc-400 font-semibold text-xs">
              Judul
            </TableHead>
            <TableHead className="text-zinc-400 font-semibold text-xs">
              Penghuni
            </TableHead>
            <TableHead className="text-zinc-400 font-semibold text-xs">
              Kamar
            </TableHead>
            <TableHead className="text-zinc-400 font-semibold text-xs">
              Status
            </TableHead>
            <TableHead className="text-zinc-400 font-semibold text-xs">
              Dibuat
            </TableHead>
            <TableHead className="text-zinc-400 font-semibold text-xs w-12">
              {/* Aksi */}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow
              key={report.id}
              className="border-zinc-800/50 hover:bg-zinc-900/30 transition-colors cursor-pointer"
              onClick={() => onViewDetail(report)}
            >
              <TableCell className="max-w-48">
                <div className="flex items-center gap-2">
                  {report.photoUrl && (
                    <ImageIcon className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  )}
                  <span className="font-medium text-white text-sm truncate">
                    {report.title}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-zinc-300 text-sm truncate max-w-36">
                {report.lease.user.tenantProfile?.fullName || "—"}
              </TableCell>
              <TableCell className="text-sm">
                <div className="text-zinc-300">
                  {report.lease.room.number} – {report.lease.room.name}
                </div>
                <div className="text-xs text-zinc-500">
                  {report.lease.room.property.name}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={report.status} />
              </TableCell>
              <TableCell className="text-xs text-zinc-500">
                {formatRelativeDate(report.createdAt)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 bg-zinc-950 border-zinc-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenuItem
                      onClick={() => onViewDetail(report)}
                      className="text-zinc-300 focus:text-white focus:bg-zinc-800"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Lihat Detail
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-zinc-800" />

                    {report.status !== "OPEN" && (
                      <DropdownMenuItem
                        onClick={() => onStatusChange(report.id, "OPEN")}
                        className="text-red-400 focus:text-red-300 focus:bg-zinc-800"
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
                        className="text-amber-400 focus:text-amber-300 focus:bg-zinc-800"
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
                        className="text-emerald-400 focus:text-emerald-300 focus:bg-zinc-800"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Tandai Selesai
                      </DropdownMenuItem>
                    )}
                    
                    {onDelete && (
                      <>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem
                          onClick={() => onDelete(report.id)}
                          className="text-red-500 focus:text-red-400 focus:bg-red-500/10"
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