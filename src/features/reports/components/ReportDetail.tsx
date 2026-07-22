"use client";

import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  ImageIcon,
  User,
  Home,
  Calendar,
  X,
} from "lucide-react";
import { ImageViewer } from "@/components/shared/image-viewer";
import type { ReportForAdmin } from "../report-service";

interface ReportDetailProps {
  report: ReportForAdmin;
  onStatusChange: (
    id: string,
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED",
  ) => Promise<void>;
  onClose: () => void;
  isUpdating: boolean;
}

function StatusBadge({
  status,
}: {
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
}) {
  const config = {
    OPEN: {
      label: "Terbuka",
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      className: "bg-red-500/10 text-red-400 border-red-500/20",
    },
    IN_PROGRESS: {
      label: "Sedang Diproses",
      icon: <Wrench className="h-3.5 w-3.5" />,
      className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    RESOLVED: {
      label: "Selesai",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
  };

  const { label, icon, className } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ReportDetail({
  report,
  onStatusChange,
  onClose,
  isUpdating,
}: ReportDetailProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <h3 className="text-lg font-bold text-white leading-tight truncate">
            {report.title}
          </h3>
          <p className="text-xs text-zinc-500">
            ID: #{report.id.slice(-8).toUpperCase()}
          </p>
        </div>
        <StatusBadge status={report.status} />
      </div>

      {/* Deskripsi */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
          Deskripsi Masalah
        </h4>
        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
          {report.description}
        </p>
      </div>

      {/* Foto */}
      {report.photoUrl && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
            Foto Kerusakan
          </h4>
          <ImageViewer
            src={report.photoUrl}
            alt={report.title}
            className="w-full h-48 bg-zinc-950"
            imageClassName="object-cover"
          />
        </div>
      )}

      {/* Info Penghuni & Kamar */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5 bg-zinc-900/30 rounded-lg p-3 border border-zinc-800/50">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <User className="h-3.5 w-3.5" />
            <span className="text-[11px] font-medium uppercase tracking-wide">
              Penghuni
            </span>
          </div>
          <p className="text-sm font-medium text-white">
            {report.lease.user.tenantProfile?.fullName || "—"}
          </p>
        </div>
        <div className="space-y-1.5 bg-zinc-900/30 rounded-lg p-3 border border-zinc-800/50">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <Home className="h-3.5 w-3.5" />
            <span className="text-[11px] font-medium uppercase tracking-wide">
              Kamar
            </span>
          </div>
          <p className="text-sm font-medium text-white">
            {report.lease.room.number} – {report.lease.room.name}
          </p>
          <p className="text-xs text-zinc-500">
            {report.lease.room.property.name}
          </p>
        </div>
      </div>

      {/* Waktu */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
        <Calendar className="h-3.5 w-3.5" />
        <span>Dilaporkan: {formatDate(report.createdAt)}</span>
        {report.updatedAt !== report.createdAt && (
          <span className="ml-2">
            · Diperbarui: {formatDate(report.updatedAt)}
          </span>
        )}
      </div>

      {/* Tombol Ubah Status */}
      <div className="border-t border-zinc-800 pt-4 space-y-2">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
          Ubah Status
        </h4>
        <div className="flex flex-wrap gap-2">
          {report.status !== "OPEN" && (
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdating}
              onClick={() => onStatusChange(report.id, "OPEN")}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-xs gap-1.5"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Tandai Terbuka
            </Button>
          )}
          {report.status !== "IN_PROGRESS" && (
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdating}
              onClick={() => onStatusChange(report.id, "IN_PROGRESS")}
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 text-xs gap-1.5"
            >
              <Clock className="h-3.5 w-3.5" />
              Tandai Diproses
            </Button>
          )}
          {report.status !== "RESOLVED" && (
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdating}
              onClick={() => onStatusChange(report.id, "RESOLVED")}
              className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 text-xs gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Tandai Selesai
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
