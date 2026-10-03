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
        <Label htmlFor="leaseId" className="text-xs text-zinc-300">
          Tenant (Penghuni Aktif)
        </Label>
        <select
          id="leaseId"
          name="leaseId"
          required
          className="
            flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/50
            px-3 py-1 text-sm text-white shadow-xs transition-colors
            placeholder:text-zinc-500 focus:border-primary focus:outline-none
            focus:ring-1 focus:ring-primary disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <option value="" className="bg-zinc-900 text-zinc-400">
            Pilih tenant...
          </option>
          {activeLeases.map((lease) => (
            <option
              key={lease.id}
              value={lease.id}
              className="bg-zinc-900 text-white"
            >
              {lease.tenantName} — Kamar {lease.roomNumber} ({lease.roomName})
            </option>
          ))}
        </select>
      </div>

      {/* Judul Laporan */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-xs text-zinc-300">
          Judul Laporan
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="Contoh: AC Bocor di Kamar 3"
          required
          className="bg-zinc-900/50 border-zinc-800 text-sm focus-visible:ring-primary text-white"
        />
      </div>

      {/* Deskripsi */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-xs text-zinc-300">
          Deskripsi Detail
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Jelaskan masalahnya secara lengkap..."
          rows={3}
          required
          className="bg-zinc-900/50 border-zinc-800 text-sm focus-visible:ring-primary text-white"
        />
      </div>

      {/* Upload Foto Kerusakan */}
      <div className="space-y-1.5">
        <Label className="text-xs text-zinc-300">
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
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-xs text-red-400 border border-red-500/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{state.error}</p>
        </div>
      )}

      {/* Hidden status field - default OPEN */}
      <input type="hidden" name="status" value="OPEN" />

      {/* Tombol Aksi */}
      <div className="flex gap-3 justify-end pt-2 border-t border-zinc-800">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={onClose}
          className="border-zinc-800 hover:bg-zinc-900 text-zinc-300 text-xs"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
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