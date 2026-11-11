"use client";

import React, { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUploadCloudinary } from "@/components/ui/image-upload-cloudinary";
import { createAdminReportAction } from "../actions";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import type { ActiveLeaseForSelect } from "../report-service";

interface ReportFormProps {
  activeLeases: ActiveLeaseForSelect[];
  onSuccess: () => void;
  onClose: () => void;
}

export function ReportForm({
  activeLeases,
  onSuccess,
  onClose,
}: ReportFormProps) {
  const [photoUrl, setPhotoUrl] = useState("");

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      // Tambahkan URL foto dari state client component
      if (photoUrl) {
        formData.append("photoUrl", photoUrl);
      }
      return await createAdminReportAction(prevState, formData);
    },
    undefined
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || "Laporan berhasil dibuat!");
      setPhotoUrl("");
      onSuccess();
      onClose();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUploadComplete = (url: string, _storagePath: string) => {
    setPhotoUrl(url);
  };

  return (
    <form action={formAction} className="space-y-4">
      {/* Pilih Tenant / Lease */}
      <div className="space-y-1.5">
        <Label htmlFor="leaseId" className="text-xs font-bold text-foreground">
          Tenant (Penghuni Aktif)
        </Label>
        <select
          id="leaseId"
          name="leaseId"
          required
          className="
            flex h-10 w-full rounded-xl border border-border bg-white
            px-3 py-2 text-sm text-foreground shadow-2xs transition-colors
            focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          <option value="" className="text-muted-foreground">
            Pilih tenant...
          </option>
          {activeLeases.map((lease) => (
            <option
              key={lease.id}
              value={lease.id}
              className="text-foreground"
            >
              {lease.tenantName} — Kamar {lease.roomNumber} ({lease.roomName})
            </option>
          ))}
        </select>
      </div>

      {/* Judul Laporan */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-xs font-bold text-foreground">
          Judul Laporan
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="Contoh: AC Bocor di Kamar 3"
          required
          className="bg-white border-border text-sm text-foreground focus-visible:ring-primary rounded-xl h-10 shadow-2xs"
        />
      </div>

      {/* Deskripsi */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-xs font-bold text-foreground">
          Deskripsi Detail
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Jelaskan masalahnya secara lengkap..."
          rows={3}
          required
          className="bg-white border-border text-sm text-foreground focus-visible:ring-primary rounded-xl shadow-2xs resize-none"
        />
      </div>

      {/* Upload Foto Kerusakan */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-foreground">
          Foto Kerusakan (Opsional)
        </Label>
        <ImageUploadCloudinary
          folder="oskost/reports"
          onUploadComplete={handleUploadComplete}
          label=""
          className="w-full"
        />
      </div>

      {/* Error Display */}
      {state?.error && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20 font-medium">
          <AlertCircle className="size-4 shrink-0" />
          <p>{state.error}</p>
        </div>
      )}

      {/* Hidden status field - default OPEN */}
      <input type="hidden" name="status" value="OPEN" />

      {/* Tombol Aksi */}
      <div className="flex gap-3 justify-end pt-3 border-t border-border">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={onClose}
          className="border-border hover:bg-muted/60 text-foreground text-xs font-bold rounded-xl h-9"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold rounded-xl h-9 shadow-xs"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Laporan"
          )}
        </Button>
      </div>
    </form>
  );
}
