"use client";

import React, { useState, useActionState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { ImageUploadCloudinary } from "@/components/ui/image-upload-cloudinary";
import { submitMaintenanceReportAction } from "../actions";
import { toast } from "sonner";

interface ReportDialogFormProps {
  userId: string;
}

export function ReportDialogForm({ userId }: ReportDialogFormProps) {
  const [open, setOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoStoragePath, setPhotoStoragePath] = useState("");

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      // Append the photoUrl since it's uploaded via client component
      if (photoUrl) {
        formData.append("photoUrl", photoUrl);
      }
      return await submitMaintenanceReportAction(prevState, formData);
    },
    undefined
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || "Laporan kerusakan berhasil dikirim!");
      setOpen(false);
      setPhotoUrl("");
      setPhotoStoragePath("");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  const handleUploadComplete = (url: string, storagePath: string) => {
    setPhotoUrl(url);
    setPhotoStoragePath(storagePath);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-secondary text-black hover:bg-secondary/90 font-bold transition-all gap-1.5 shadow-md">
          <Plus className="h-4 w-4 stroke-[3px]" />
          Lapor Kerusakan Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-white sm:max-w-sm rounded-2xl p-5 min-w-0 w-full overflow-hidden">
        <DialogHeader className="text-left space-y-1 min-w-0 w-full">
          <DialogTitle className="text-lg font-bold text-white">Lapor Kerusakan</DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            Jelaskan kerusakan fasilitas di kamar atau area kost Anda.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 pt-2 w-full min-w-0 overflow-hidden">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs text-zinc-300">
              Judul Laporan / Kerusakan
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Contoh: AC Bocor, Lampu Kamar Mati"
              required
              className="bg-zinc-900 border-zinc-700 text-sm focus-visible:ring-secondary text-white"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs text-zinc-300">
              Deskripsi Detail
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Jelaskan detail masalahnya secara ringkas..."
              rows={3}
              required
              className="bg-zinc-900 border-zinc-700 text-sm focus-visible:ring-secondary text-white"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-300">Foto Kerusakan (Opsional)</Label>
            <ImageUploadCloudinary
              folder={`oskost/reports/${userId}`}
              onUploadComplete={handleUploadComplete}
              label=""
              className="w-full"
            />
          </div>

          {state?.error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-xs text-red-400 border border-red-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{state.error}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2 border-t border-zinc-900">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setOpen(false)}
              className="border-zinc-800 hover:bg-zinc-900 text-zinc-300 text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-secondary text-black hover:bg-secondary/90 text-xs font-bold"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Mengirim...
                </>
              ) : (
                "Kirim Laporan"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
