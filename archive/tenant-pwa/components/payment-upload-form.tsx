"use client";

import React, { useState } from "react";
import { ImageUploadStandard } from "@/components/ui/image-upload-standard";
import { Button } from "@/components/ui/button";
import { uploadPaymentProofAction } from "../actions";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";

interface PaymentUploadFormProps {
  invoiceId: string;
  userId: string;
}

export function PaymentUploadForm({
  invoiceId,
  userId,
}: PaymentUploadFormProps) {
  const [proofUrl, setProofUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUploadComplete = (url: string) => {
    setProofUrl(url);
    if (url) {
      toast.success(
        "Bukti transfer berhasil diunggah! Klik Kirim untuk menyelesaikan.",
      );
    } else {
      toast.info("Bukti transfer dihapus.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofUrl) {
      toast.error("Silakan upload bukti transfer terlebih dahulu.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await uploadPaymentProofAction(invoiceId, proofUrl);

      if (res.success) {
        setIsSuccess(true);
        toast.success(
          "Bukti pembayaran berhasil dikirim. Menunggu konfirmasi admin.",
        );
      } else {
        toast.error(res.error || "Gagal mengirim bukti pembayaran");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center space-y-3">
        <CheckCircle2 className="mx-auto h-12 w-12 text-secondary" />
        <h3 className="font-bold text-white text-base">Pembayaran Terkirim</h3>
        <p className="text-xs text-zinc-400">
          Bukti transfer berhasil dikirim. Admin akan segera memverifikasi
          pembayaran Anda.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-zinc-900/40 p-4 border border-zinc-800 rounded-2xl"
    >
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-white">Unggah Bukti Bayar</h3>
        <p className="text-[11px] text-zinc-500">
          Foto struk/bukti transfer M-Banking Anda (format JPG/PNG, maks. 10MB)
        </p>
      </div>

      <ImageUploadStandard
        bucket="Oskost-Data-Public"
        folderPath={`payments/${userId}`}
        onUploadComplete={handleUploadComplete}
        label=""
        className="w-full"
      />

      <Button
        type="submit"
        disabled={!proofUrl || isSubmitting}
        className="w-full bg-secondary text-black hover:bg-secondary/90 font-bold transition-all"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mengirim...
          </>
        ) : (
          <>
            Kirim Bukti Pembayaran
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
