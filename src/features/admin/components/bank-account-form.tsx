"use client";

import { useActionState, useEffect } from "react";
import { updatePropertyBankAccountAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, CreditCard, User, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface BankAccountFormProps {
  propertyId: string;
  initialBankName?: string | null;
  initialBankAccountNumber?: string | null;
  initialBankAccountHolder?: string | null;
}

const COMMON_BANKS = [
  "BCA (Bank Central Asia)",
  "Mandiri",
  "BRI (Bank Rakyat Indonesia)",
  "BNI (Bank Negara Indonesia)",
  "BSI (Bank Syariah Indonesia)",
  "CIMB Niaga",
  "Permata Bank",
  "Bank Danamon",
  "Bank Jago",
  "Seabank",
];

export function BankAccountForm({
  propertyId,
  initialBankName,
  initialBankAccountNumber,
  initialBankAccountHolder,
}: BankAccountFormProps) {
  const [state, formAction, isPending] = useActionState(
    updatePropertyBankAccountAction,
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || "Rekening pencairan sewa berhasil disimpan.");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="bg-white rounded-2xl border border-[#2C2825]/10 p-6 sm:p-8 shadow-xs">
      <div className="flex items-start justify-between gap-4 pb-6 border-b border-[#2C2825]/10">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="size-5 text-[#714A23]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#1E1B18]">
              Rekening Bank Pencairan Sewa
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#757069] mt-1">
            Uang sewa bulanan dari seluruh penghuni kamar akan dicairkan ke rekening bank yang Anda daftarkan di sini.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="size-3.5 text-emerald-600" />
          <span>Terverifikasi Bank</span>
        </div>
      </div>

      <form action={formAction} className="mt-6 space-y-6">
        <input type="hidden" name="id" value={propertyId} />

        {state?.error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="size-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        {state?.success && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm flex items-center gap-3">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{state.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Nama Bank */}
          <div className="space-y-2">
            <Label htmlFor="bankName" className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider">
              Nama Bank
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#757069]" />
              <input
                list="bankOptions"
                id="bankName"
                name="bankName"
                defaultValue={initialBankName ?? ""}
                placeholder="Pilih atau ketik nama bank (misal: BCA)"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#2C2825]/15 bg-[#F8F6F1]/50 text-sm font-medium text-[#1E1B18] focus:outline-none focus:ring-2 focus:ring-[#714A23]/20 focus:border-[#714A23]"
              />
              <datalist id="bankOptions">
                {COMMON_BANKS.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Nomor Rekening */}
          <div className="space-y-2">
            <Label htmlFor="bankAccountNumber" className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider">
              Nomor Rekening
            </Label>
            <div className="relative">
              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#757069]" />
              <Input
                id="bankAccountNumber"
                name="bankAccountNumber"
                type="text"
                defaultValue={initialBankAccountNumber ?? ""}
                placeholder="Contoh: 1234567890"
                required
                className="pl-10 rounded-xl border-[#2C2825]/15 bg-[#F8F6F1]/50 text-sm font-semibold text-[#1E1B18] tracking-wider"
              />
            </div>
          </div>
        </div>

        {/* Atas Nama Pemilik Rekening */}
        <div className="space-y-2">
          <Label htmlFor="bankAccountHolder" className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider">
            Nama Pemilik Rekening (Sesuai Buku Tabungan)
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#757069]" />
            <Input
              id="bankAccountHolder"
              name="bankAccountHolder"
              type="text"
              defaultValue={initialBankAccountHolder ?? ""}
              placeholder="Contoh: AHMAD RINALDI"
              required
              className="pl-10 rounded-xl border-[#2C2825]/15 bg-[#F8F6F1]/50 text-sm font-semibold text-[#1E1B18]"
            />
          </div>
          <p className="text-xs text-[#757069]">
            Pastikan nama pemilik rekening sama persis dengan yang tertera di rekening buku tabungan Anda untuk menghindari kegagalan transfer.
          </p>
        </div>

        <div className="pt-4 border-t border-[#2C2825]/10 flex items-center justify-end gap-3">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-[#714A23] hover:bg-[#5A3B1C] text-white rounded-xl font-bold px-6 shadow-xs"
          >
            {isPending ? "Menyimpan..." : "Simpan Rekening Bank"}
          </Button>
        </div>
      </form>
    </div>
  );
}
