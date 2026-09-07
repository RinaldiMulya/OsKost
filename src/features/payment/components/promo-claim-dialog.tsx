"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { ImageUploadStandard } from "@/components/ui/image-upload-standard";
import {
  Gift,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Star,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { submitPromoClaimAction } from "../promo-actions";

interface PromoClaimDialogProps {
  invoiceId: string;
  userId: string;
  hasPendingClaim?: boolean;
}

const GOOGLE_MAPS_REVIEW_URL =
  "https://maps.google.com/?q=OSkost+Pulo+Jahe+Jakarta+Timur";

export function PromoClaimDialog({
  invoiceId,
  userId,
  hasPendingClaim = false,
}: PromoClaimDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [googleName, setGoogleName] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!proofUrl) {
      toast.error("Unggah foto screenshot bukti ulasan Anda terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    const result = await submitPromoClaimAction(
      invoiceId,
      "GOOGLE_REVIEW",
      proofUrl,
      googleName || undefined,
    );
    setIsSubmitting(false);

    if (result.success) {
      toast.success(result.message || "Pengajuan promo berhasil dikirim!");
      setIsOpen(false);
      setProofUrl("");
      setGoogleName("");
    } else {
      toast.error(result.error || "Gagal mengajukan promo.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative w-full cursor-pointer">
          <Button
            variant="outline"
            size="sm"
            disabled={hasPendingClaim}
            className={`relative overflow-hidden w-full text-xs font-bold py-3 px-4 gap-2 transition-all duration-300 group flex items-center justify-center ${
              hasPendingClaim
                ? "border-zinc-800 bg-zinc-900/50 text-zinc-500 cursor-not-allowed"
                : "border-amber-500/50 bg-gradient-to-r from-amber-950/70 via-amber-900/50 to-amber-950/70 text-amber-200 hover:text-amber-50 hover:border-amber-400 hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_24px_rgba(245,158,11,0.45)]"
            }`}
          >
            {/* Smooth Light Sweep Effect */}
            {!hasPendingClaim && (
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent pointer-events-none animate-[shimmer_2.8s_ease-in-out_infinite]"
              />
            )}

            {!hasPendingClaim ? (
              <Sparkles className="h-4 w-4 shrink-0 text-amber-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
            ) : (
              <Gift className="h-4 w-4 shrink-0 text-zinc-600" />
            )}

            <span className="relative z-10 truncate">
              {hasPendingClaim
                ? "Promo Google Review Sedang Ditinjau Admin"
                : "Klaim Bebas Biaya Admin (Google Review Bintang 5)"}
            </span>
          </Button>

          {/* Floating "GRATIS" Ribbon Badge */}
          {!hasPendingClaim && (
            <div
              aria-hidden="true"
              className="absolute -top-2.5 -right-2 z-20 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-amber-950 shadow-lg border border-amber-300/50 pointer-events-none"
              style={{ animation: "cta-ribbon 1.8s ease-in-out infinite" }}
            >
              <Star className="h-2.5 w-2.5 fill-amber-950 text-amber-950" />
              GRATIS
            </div>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white text-base">
            <Gift className="h-5 w-5 text-amber-400" />
            Promo Bebas Biaya Admin
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Bantu berikan ulasan Bintang 5 di Google Maps OsKost untuk gratis
            biaya admin sewa bulan ini!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Step 1: Google Maps Link */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>Langkah 1: Beri Ulasan di Google Maps</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Buka link Google Maps OsKost, berikan rating 5 bintang dan ulasan
              positif Anda.
            </p>
            <a
              href={GOOGLE_MAPS_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:underline pt-1"
            >
              <span>Buka Google Maps OsKost</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Step 2: Upload Screenshot & Google Name */}
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-zinc-300">
                Langkah 2: Upload Screenshot Bukti Ulasan
              </Label>
              <ImageUploadStandard
                bucket="Oskost-Data-Public"
                folderPath={`promos/${userId}`}
                label="Unggah Screenshot Ulasan"
                onUploadComplete={(url) => setProofUrl(url)}
                onError={(err) => toast.error(err.message)}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">
                Nama Akun Google Anda (Opsional)
              </Label>
              <Input
                placeholder="Contoh: Sarah Wijaya"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-xs text-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="border-zinc-800 text-white hover:bg-zinc-900 text-xs"
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!proofUrl || isSubmitting}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs gap-1.5"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Kirim Bukti Review
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
