"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag, Percent, Loader2, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { applyDiscountAction, removeDiscountAction } from "../actions";

interface AdminDiscountDialogProps {
  invoiceId: string;
  currentDiscountAmount?: number;
  currentDiscountReason?: string | null;
}

const DISCOUNT_OPTIONS = [
  {
    code: "GOOGLE_REVIEW",
    label: "Bebas Biaya Admin (Review Google Maps Bintang 5)",
    amount: 2000,
  },
  {
    code: "EARLY_BIRD",
    label: "Diskon Bayar Tepat Waktu (H-3)",
    amount: 10000,
  },
];

export function AdminDiscountDialog({
  invoiceId,
  currentDiscountAmount = 0,
  currentDiscountReason,
}: AdminDiscountDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState(currentDiscountReason || "");
  const [isLoading, setIsLoading] = useState(false);

  async function handleApply() {
    if (!selectedCode) {
      toast.error("Pilih jenis promo/diskon terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    const result = await applyDiscountAction(invoiceId, selectedCode);
    setIsLoading(false);

    if (result.success) {
      toast.success("Diskon berhasil diterapkan!");
      setIsOpen(false);
    } else {
      toast.error(result.error || "Gagal menerapkan diskon.");
    }
  }

  async function handleRemove() {
    setIsLoading(true);
    const result = await removeDiscountAction(invoiceId);
    setIsLoading(false);

    if (result.success) {
      toast.success("Diskon berhasil dihapus.");
      setIsOpen(false);
      setSelectedCode("");
    } else {
      toast.error(result.error || "Gagal menghapus diskon.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 gap-1.5 text-xs"
        >
          <Tag className="size-3.5" />
          {currentDiscountAmount > 0 ? (
            <span>
              Diskon: Rp {currentDiscountAmount.toLocaleString("id-ID")}
            </span>
          ) : (
            <span>+ Terapkan Promo</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Percent className="size-5 text-purple-400" />
            Kelola Promo & Diskon Tagihan
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Pilih promo yang berlaku (seperti Bebas Biaya Admin via Google
            Review). Potongan akan otomatis mengurangi total bayar tenant.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300">
              Pilih Jenis Promo / Diskon
            </label>
            <Select value={selectedCode} onValueChange={setSelectedCode}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-200">
                <SelectValue placeholder="-- Pilih Promo --" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                {DISCOUNT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.code} value={opt.code}>
                    {opt.label} (-Rp {opt.amount.toLocaleString("id-ID")})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentDiscountAmount > 0 && (
            <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 text-xs space-y-1">
              <p className="font-semibold text-purple-300">
                Promo Aktif: {currentDiscountReason || "Diskon"}
              </p>
              <p className="text-zinc-400">
                Potongan harga: Rp{" "}
                {currentDiscountAmount.toLocaleString("id-ID")}
              </p>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            {currentDiscountAmount > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={isLoading}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1 text-xs"
              >
                <Trash2 className="size-3.5" /> Hapus Diskon
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="border-zinc-800 hover:bg-zinc-900 text-white"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                disabled={!selectedCode || isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
              >
                {isLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                Simpan Promo
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
