"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { updatePaymentSettingsAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  CreditCard,
  User,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  Zap,
  KeyRound,
  ExternalLink,
  Eye,
  EyeOff,
  UploadCloud,
  Loader2,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface PaymentSettingsFormProps {
  propertyId: string;
  initialBankName?: string | null;
  initialBankAccountNumber?: string | null;
  initialBankAccountHolder?: string | null;
  initialBankAccountInfo?: string | null;
  initialQrisImageUrl?: string | null;
  initialIsMidtransActive?: boolean | null;
  initialMidtransMerchantId?: string | null;
  initialMidtransClientKey?: string | null;
  hasMidtransServerKey?: boolean | null;
  maskedMidtransServerKey?: string | null;
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

export function PaymentSettingsForm({
  propertyId,
  initialBankName,
  initialBankAccountNumber,
  initialBankAccountHolder,
  initialBankAccountInfo,
  initialQrisImageUrl,
  initialIsMidtransActive,
  initialMidtransMerchantId,
  initialMidtransClientKey,
  hasMidtransServerKey,
  maskedMidtransServerKey,
}: PaymentSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updatePaymentSettingsAction,
    null
  );

  const [isMidtransActive, setIsMidtransActive] = useState<boolean>(
    initialIsMidtransActive ?? false
  );
  const [showChangeKey, setShowChangeKey] = useState<boolean>(!hasMidtransServerKey);
  const [showKeyText, setShowKeyText] = useState<boolean>(false);
  const [qrisUrl, setQrisUrl] = useState<string>(initialQrisImageUrl || "");
  const [isUploadingQris, setIsUploadingQris] = useState<boolean>(false);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || "Pengaturan metode pembayaran berhasil disimpan.");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  // Handle direct upload of QRIS image to Cloudinary
  async function handleQrisFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Format file harus berupa gambar (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2 MB.");
      return;
    }

    setIsUploadingQris(true);
    try {
      // 1. Dapatkan signature dari API
      const signRes = await fetch("/api/v1/media/cloudinary-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "oskost/qris" }),
      });

      if (!signRes.ok) {
        throw new Error("Gagal mengotentikasi upload Cloudinary.");
      }

      const signData = await signRes.json();
      const { apiKey, timestamp, signature, cloudName, folder } = signData.data;

      // 2. Upload langsung ke Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        throw new Error("Gagal mengunggah gambar ke server CDN.");
      }

      const uploadResult = await uploadRes.json();
      setQrisUrl(uploadResult.secure_url);
      toast.success("Foto QRIS Statis berhasil diunggah!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal upload gambar QRIS.";
      toast.error(msg);
    } finally {
      setIsUploadingQris(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* State Feedback Banners */}
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

      <form action={formAction} className="space-y-8">
        <input type="hidden" name="id" value={propertyId} />
        <input type="hidden" name="qrisImageUrl" value={qrisUrl} />

        {/* ============================================================== */}
        {/* CARD 1: TIER STARTER (TRANSFER MANUAL & QRIS STATIS)           */}
        {/* ============================================================== */}
        <div className="bg-white rounded-2xl border border-[#2C2825]/10 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2C2825]/10">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#714A23]/10 text-[#714A23]">
                  <CreditCard className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#1E1B18]">
                    Metode Pembayaran Manual (Tier Starter)
                  </h2>
                  <p className="text-xs sm:text-sm text-[#757069] mt-0.5">
                    Penghuni mentransfer ke rekening Anda atau scan QRIS statis, lalu mengunggah bukti bayar untuk diverifikasi.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-semibold self-start sm:self-auto">
              <span>Bebas Biaya Gateway</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Nama Bank */}
            <div className="space-y-2">
              <Label htmlFor="bankName" className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider">
                Nama Bank Tujuan
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#757069]" />
                <input
                  list="bankOptions"
                  id="bankName"
                  name="bankName"
                  defaultValue={initialBankName ?? ""}
                  placeholder="Pilih atau ketik nama bank (contoh: BCA)"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#2C2825]/15 bg-[#FAF8F5] text-sm text-[#1E1B18] placeholder:text-[#A8A29A] focus:outline-none focus:ring-2 focus:ring-[#714A23]/30 focus:border-[#714A23] transition-all"
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
                Nomor Rekening Bank
              </Label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#757069]" />
                <Input
                  id="bankAccountNumber"
                  name="bankAccountNumber"
                  type="text"
                  inputMode="numeric"
                  defaultValue={initialBankAccountNumber ?? ""}
                  placeholder="Contoh: 1234567890"
                  className="h-11 pl-10 bg-[#FAF8F5] border-[#2C2825]/15 focus:border-[#714A23] focus:ring-[#714A23]/30"
                />
              </div>
            </div>
          </div>

          {/* Atas Nama Rekening */}
          <div className="space-y-2">
            <Label htmlFor="bankAccountHolder" className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider">
              Atas Nama Pemilik Rekening
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#757069]" />
              <Input
                id="bankAccountHolder"
                name="bankAccountHolder"
                type="text"
                defaultValue={initialBankAccountHolder ?? ""}
                placeholder="Contoh: Ahmad Rinaldi"
                className="h-11 pl-10 bg-[#FAF8F5] border-[#2C2825]/15 focus:border-[#714A23] focus:ring-[#714A23]/30"
              />
            </div>
          </div>

          {/* Petunjuk Transfer */}
          <div className="space-y-2">
            <Label htmlFor="bankAccountInfo" className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider">
              Petunjuk Transfer untuk Penghuni (Opsional)
            </Label>
            <Textarea
              id="bankAccountInfo"
              name="bankAccountInfo"
              rows={2}
              defaultValue={initialBankAccountInfo ?? ""}
              placeholder="Contoh: Harap sertakan nama penghuni dan nomor kamar pada berita transfer. Konfirmasi via WhatsApp jika diperlukan."
              className="bg-[#FAF8F5] border-[#2C2825]/15 focus:border-[#714A23] focus:ring-[#714A23]/30 text-sm"
            />
          </div>

          {/* QRIS Statis Upload & Preview */}
          <div className="pt-4 border-t border-[#2C2825]/10 space-y-3">
            <Label className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider flex items-center gap-1.5">
              <QrCode className="size-4 text-[#714A23]" />
              <span>Gambar QRIS Statis Properti (Opsional)</span>
            </Label>
            <p className="text-xs text-[#757069]">
              Jika Anda memiliki barcode QRIS cetak (dari BCA, GoPay, OVO, atau Bank lain), unggah di sini agar penghuni dapat langsung scan dari aplikasi mobile.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {qrisUrl ? (
                <div className="relative group size-28 rounded-xl border-2 border-dashed border-[#714A23]/30 overflow-hidden bg-white p-1">
                  <Image
                    src={qrisUrl}
                    alt="Preview QRIS Statis"
                    width={110}
                    height={110}
                    className="size-full object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setQrisUrl("")}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium cursor-pointer"
                  >
                    Hapus Foto
                  </button>
                </div>
              ) : (
                <div className="size-28 rounded-xl border-2 border-dashed border-[#2C2825]/20 flex flex-col items-center justify-center text-[#A8A29A] bg-[#FAF8F5]">
                  <QrCode className="size-8 stroke-1 mb-1 text-[#757069]" />
                  <span className="text-[10px]">Belum ada QRIS</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#2C2825]/15 text-xs font-bold text-[#1E1B18] cursor-pointer transition-colors">
                  {isUploadingQris ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin text-[#714A23]" />
                      <span>Mengunggah...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="size-3.5 text-[#714A23]" />
                      <span>Pilih Gambar QRIS (PNG / JPG)</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrisFileUpload}
                    disabled={isUploadingQris}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-[#A8A29A]">Format: PNG/JPG/WebP, Maksimal 2 MB.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CARD 2: TIER PRO (DIRECT MERCHANT MIDTRANS GATEWAY)            */}
        {/* ============================================================== */}
        <div className="bg-white rounded-2xl border border-[#2C2825]/10 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2C2825]/10">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-700">
                  <Zap className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#1E1B18]">
                    Pembayaran Otomatis Midtrans (Tier Pro Direct Merchant)
                  </h2>
                  <p className="text-xs sm:text-sm text-[#757069] mt-0.5">
                    Penghuni membayar via QRIS Dinamis & Virtual Account Bank. Dana 100% langsung masuk ke rekening Midtrans & bank milik Anda.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isMidtransActive"
                  value="true"
                  checked={isMidtransActive}
                  onChange={(e) => setIsMidtransActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-3 text-xs font-bold text-[#1E1B18]">
                  {isMidtransActive ? "Aktif" : "Non-Aktif"}
                </span>
              </label>
            </div>
          </div>

          {/* Edukasi Direct Merchant */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-900 text-xs sm:text-sm space-y-2">
            <div className="flex items-start gap-2.5">
              <Info className="size-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Keamanan & Kedaulatan Finansial:</span> OsKost menggunakan arsitektur <em>Direct Merchant</em>. Kami tidak menampung uang sewa Anda (tanpa penampungan sentral/escrow). Kunci Server Key di bawah ini dienkripsi dengan standar <strong>NIST AES-256-GCM</strong> di database.
              </div>
            </div>
            <div className="pl-6.5 text-[11px] text-blue-800">
              Belum punya akun Midtrans? Anda dapat mendaftar gratis sebagai perorangan (cukup KTP) di{" "}
              <a
                href="https://dashboard.midtrans.com/register"
                target="_blank"
                rel="noreferrer"
                className="font-bold underline hover:text-blue-950 inline-flex items-center gap-0.5"
              >
                midtrans.com <ExternalLink className="size-3" />
              </a>
            </div>
          </div>

          <div className="space-y-6 pt-2">
            {/* Merchant ID */}
            <div className="space-y-2">
              <Label htmlFor="midtransMerchantId" className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider">
                Midtrans Merchant ID
              </Label>
              <Input
                id="midtransMerchantId"
                name="midtransMerchantId"
                type="text"
                defaultValue={initialMidtransMerchantId ?? ""}
                placeholder="Contoh: M392756841 atau G123456789"
                className="h-11 bg-[#FAF8F5] border-[#2C2825]/15 focus:border-[#714A23] focus:ring-[#714A23]/30 font-mono text-xs"
              />
            </div>

            {/* Client Key */}
            <div className="space-y-2">
              <Label htmlFor="midtransClientKey" className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider">
                Midtrans Client Key (Publik)
              </Label>
              <Input
                id="midtransClientKey"
                name="midtransClientKey"
                type="text"
                defaultValue={initialMidtransClientKey ?? ""}
                placeholder="Contoh: Mid-client-xxxx atau SB-Mid-client-xxxx"
                className="h-11 bg-[#FAF8F5] border-[#2C2825]/15 focus:border-[#714A23] focus:ring-[#714A23]/30 font-mono text-xs"
              />
            </div>

            {/* Server Key (AES-256 Encrypted at Rest) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="newMidtransServerKey" className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="size-3.5 text-[#714A23]" />
                  <span>Midtrans Server Key (Rahasia & Terenkripsi)</span>
                </Label>
                {hasMidtransServerKey && !showChangeKey && (
                  <button
                    type="button"
                    onClick={() => setShowChangeKey(true)}
                    className="text-xs font-semibold text-[#714A23] hover:underline cursor-pointer"
                  >
                    Ganti Kunci Baru
                  </button>
                )}
              </div>

              {hasMidtransServerKey && !showChangeKey ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-600" />
                    <span className="font-mono text-xs text-emerald-900 font-medium">
                      {maskedMidtransServerKey || "••••••••••••••••••••••••"}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    Terenkripsi AES-256
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      id="newMidtransServerKey"
                      name="newMidtransServerKey"
                      type={showKeyText ? "text" : "password"}
                      placeholder="Masukkan Server Key (contoh: Mid-server-xxx atau SB-Mid-server-xxx)"
                      className="h-11 pr-10 bg-[#FAF8F5] border-[#2C2825]/15 focus:border-[#714A23] focus:ring-[#714A23]/30 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeyText(!showKeyText)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757069] hover:text-[#1E1B18] cursor-pointer"
                    >
                      {showKeyText ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {hasMidtransServerKey && (
                    <button
                      type="button"
                      onClick={() => setShowChangeKey(false)}
                      className="text-xs text-[#757069] hover:underline"
                    >
                      Batal ubah kunci (pertahankan kunci saat ini)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto h-11 px-8 rounded-xl bg-[#714A23] hover:bg-[#5A3B1C] text-white font-bold text-sm shadow-xs transition-all cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                <span>Menyimpan Pengaturan...</span>
              </>
            ) : (
              <span>Simpan Metode Pembayaran</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
