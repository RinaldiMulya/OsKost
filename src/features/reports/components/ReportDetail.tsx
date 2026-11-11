"use client";

import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  User,
  Home,
  Calendar,
  Loader2,
} from "lucide-react";
import { ImageViewer } from "@/components/shared/image-viewer";
import type { ReportForAdmin } from "../report-service";

interface ReportDetailProps {
  report: ReportForAdmin;
  onStatusChange: (
    id: string,
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED",
  ) => Promise<void>;
  onClose?: () => void;
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
      icon: <AlertTriangle className="size-3.5 shrink-0" />,
      className: "bg-destructive/10 text-destructive border-destructive/20",
    },
    IN_PROGRESS: {
      label: "Sedang Diproses",
      icon: <Clock className="size-3.5 shrink-0" />,
      className: "bg-amber-ochre/15 text-amber-ochre border-amber-ochre/30",
    },
    RESOLVED: {
      label: "Selesai",
      icon: <CheckCircle2 className="size-3.5 shrink-0" />,
      className: "bg-secondary/15 text-secondary border-secondary/30",
    },
  };

  const { label, icon, className } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border shrink-0 ${className}`}
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
  isUpdating,
}: ReportDetailProps) {
  return (
    <div className="space-y-5 min-w-0 w-full overflow-hidden">
      {/* Header — with safe right padding to never collide with Dialog close X button */}
      <div className="space-y-1.5 min-w-0 pr-10 sm:pr-12">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
            ID: #{report.id.slice(-8).toUpperCase()}
          </span>
          <span className="text-border text-xs">•</span>
          <StatusBadge status={report.status} />
        </div>
        <h3 className="text-lg sm:text-xl font-bold font-editorial text-foreground leading-snug break-words">
          {report.title}
        </h3>
      </div>

      {/* Deskripsi Masalah */}
      <div className="space-y-1.5 min-w-0 w-full">
        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Deskripsi Masalah
        </h4>
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line break-words bg-muted/40 rounded-xl p-3.5 border border-border/80">
          {report.description}
        </p>
      </div>

      {/* Kategori, Lokasi Spesifik & Preferensi Waktu */}
      {(report.category || report.location || report.preferredTime) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {report.category && (
            <div className="bg-muted/40 rounded-xl p-3 border border-border/80 min-w-0">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                Kategori
              </span>
              <p className="text-xs font-semibold text-foreground mt-0.5 truncate">
                {report.category}
              </p>
            </div>
          )}
          {report.location && (
            <div className="bg-muted/40 rounded-xl p-3 border border-border/80 min-w-0">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                Lokasi Spesifik
              </span>
              <p className="text-xs font-semibold text-foreground mt-0.5 truncate">
                {report.location}
              </p>
            </div>
          )}
          {report.preferredTime && (
            <div className="bg-muted/40 rounded-xl p-3 border border-border/80 min-w-0">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                Preferensi Jam
              </span>
              <p className="text-xs font-semibold text-foreground mt-0.5 capitalize truncate">
                {report.preferredTime}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Foto Bukti Kerusakan */}
      {((report.photos && report.photos.length > 0) || report.photoUrl) && (
        <div className="space-y-1.5">
          <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Foto Bukti Kerusakan ({report.photos?.length || 1})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(report.photos && report.photos.length > 0
              ? report.photos
              : [report.photoUrl!]
            ).map((photo, idx) => (
              <ImageViewer
                key={idx}
                src={photo}
                alt={`${report.title} - ${idx + 1}`}
                className="w-full h-44 bg-muted/30 rounded-xl overflow-hidden border border-border/80 shadow-2xs"
                imageClassName="object-cover"
              />
            ))}
          </div>
        </div>
      )}

      {/* Info Penghuni & Kamar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1 bg-muted/40 rounded-xl p-3.5 border border-border/80 min-w-0">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <User className="size-3.5 text-primary shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Penghuni
            </span>
          </div>
          <p className="text-sm font-bold text-foreground truncate">
            {report.lease.user.tenantProfile?.fullName || "—"}
          </p>
        </div>
        <div className="space-y-1 bg-muted/40 rounded-xl p-3.5 border border-border/80 min-w-0">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Home className="size-3.5 text-primary shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Kamar
            </span>
          </div>
          <p className="text-sm font-bold text-foreground truncate">
            {report.lease.room.number} – {report.lease.room.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {report.lease.room.property.name}
          </p>
        </div>
      </div>

      {/* Waktu Pelaporan */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
        <Calendar className="size-3.5 text-muted-foreground/80 shrink-0" />
        <span>Dilaporkan: {formatDate(report.createdAt)}</span>
        {report.updatedAt !== report.createdAt && (
          <span className="text-muted-foreground/80">
            · Diperbarui: {formatDate(report.updatedAt)}
          </span>
        )}
      </div>

      {/* Tombol Ubah Status */}
      <div className="border-t border-border pt-4 space-y-2.5">
        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Ubah Status
        </h4>
        <div className="flex flex-wrap gap-2.5">
          {report.status !== "OPEN" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUpdating}
              onClick={() => onStatusChange(report.id, "OPEN")}
              className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive text-xs font-bold rounded-xl gap-1.5 h-9"
            >
              {isUpdating ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <AlertTriangle className="size-3.5" />
              )}
              Tandai Terbuka
            </Button>
          )}
          {report.status !== "IN_PROGRESS" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUpdating}
              onClick={() => onStatusChange(report.id, "IN_PROGRESS")}
              className="border-amber-ochre/40 text-amber-ochre hover:bg-amber-ochre/10 hover:text-amber-ochre text-xs font-bold rounded-xl gap-1.5 h-9"
            >
              {isUpdating ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Clock className="size-3.5" />
              )}
              Tandai Diproses
            </Button>
          )}
          {report.status !== "RESOLVED" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUpdating}
              onClick={() => onStatusChange(report.id, "RESOLVED")}
              className="border-secondary/40 text-secondary hover:bg-secondary/10 hover:text-secondary text-xs font-bold rounded-xl gap-1.5 h-9"
            >
              {isUpdating ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="size-3.5" />
              )}
              Tandai Selesai
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
