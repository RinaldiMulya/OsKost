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
  Lock,
} from "lucide-react";
import { toast } from "sonner";

interface PaymentSettingsFormProps {
  propertyId: string;
  currentPlanTier?: string;
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
  onNavigateToTab?: (tab: string) => void;
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
  currentPlanTier = "STARTER",
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
  onNavigateToTab,
}: PaymentSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updatePaymentSettingsAction,
    null,
  );

  const isFreeTier = currentPlanTier === "FREE";
  const isStarterTier = currentPlanTier === "STARTER";
  // Midtrans is unlocked on GROWTH, PRO, and ENTERPRISE tiers
  const canUseMidtrans = !isFreeTier && !isStarterTier;
  // QRIS statis is unlocked on STARTER and above (FREE only has Bank Transfer & Cash On The Spot)
  const canUseStaticQris = !isFreeTier;

  const [isMidtransActive, setIsMidtransActive] = useState<boolean>(
    canUseMidtrans ? (initialIsMidtransActive ?? false) : false,
  );
  const [showChangeKey, setShowChangeKey] =
    useState<boolean>(!hasMidtransServerKey);
  const [showKeyText, setShowKeyText] = useState<boolean>(false);
  const [qrisUrl, setQrisUrl] = useState<string>(initialQrisImageUrl || "");
  const [isUploadingQris, setIsUploadingQris] = useState<boolean>(false);

  useEffect(() => {
    if (state?.success) {
      toast.success(
        state.message || "Pengaturan metode pembayaran berhasil disimpan.",
      );
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  // Handle direct upload of QRIS image to Cloudinary
  async function handleQrisFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!canUseStaticQris) {
      toast.error("Fitur QRIS Statis hanya tersedia mulai dari Paket Starter.");
      return;
    }

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
        },
      );

      if (!uploadRes.ok) {
        throw new Error("Gagal mengunggah gambar ke server CDN.");
      }

      const uploadResult = await uploadRes.json();
      setQrisUrl(uploadResult.secure_url);
      toast.success("Foto QRIS Statis berhasil diunggah!");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal upload gambar QRIS.";
      toast.error(msg);
    } finally {
      setIsUploadingQris(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* State Feedback Banners */}
      {state?.error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
          <AlertCircle className="size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {state?.success && (
        <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-sm flex items-center gap-3">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      <form action={formAction} className="space-y-8">
        <input type="hidden" name="id" value={propertyId} />
        <input
          type="hidden"
          name="qrisImageUrl"
          value={canUseStaticQris ? qrisUrl : ""}
        />

        {/* ============================================================== */}
        {/* CARD 1: TRANSFER BANK MANUAL & QRIS STATIS                     */}
        {/* ============================================================== */}
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <CreditCard className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold font-editorial text-foreground">
                    Metode Pembayaran Manual (Transfer Bank &amp; On The Spot)
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Penghuni mentransfer ke rekening Anda atau membayar tunai di
                    lokasi, lalu mengunggah bukti bayar untuk diverifikasi.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-semibold self-start sm:self-auto shrink-0">
              <span>Bebas Biaya Gateway 0%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Nama Bank */}
            <div className="space-y-2">
              <Label
                htmlFor="bankName"
                className="text-xs font-bold text-foreground uppercase tracking-wider"
              >
                Nama Bank Tujuan
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  list="bankOptions"
                  id="bankName"
                  name="bankName"
                  defaultValue={initialBankName ?? ""}
                  placeholder="Pilih atau ketik nama bank (contoh: BCA)"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
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
              <Label
                htmlFor="bankAccountNumber"
                className="text-xs font-bold text-foreground uppercase tracking-wider"
              >
                Nomor Rekening Bank
              </Label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="bankAccountNumber"
                  name="bankAccountNumber"
                  type="text"
                  inputMode="numeric"
                  defaultValue={initialBankAccountNumber ?? ""}
                  placeholder="Contoh: 1234567890"
                  className="h-11 pl-10 bg-background border-input focus:border-primary focus:ring-primary/30 text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Atas Nama Rekening */}
          <div className="space-y-2">
            <Label
              htmlFor="bankAccountHolder"
              className="text-xs font-bold text-foreground uppercase tracking-wider"
            >
              Atas Nama Pemilik Rekening
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="bankAccountHolder"
                name="bankAccountHolder"
                type="text"
                defaultValue={initialBankAccountHolder ?? ""}
                placeholder="Contoh: Ahmad Rinaldi"
                className="h-11 pl-10 bg-background border-input focus:border-primary focus:ring-primary/30 text-foreground"
              />
            </div>
          </div>

          {/* Petunjuk Transfer */}
          <div className="space-y-2">
            <Label
              htmlFor="bankAccountInfo"
              className="text-xs font-bold text-foreground uppercase tracking-wider"
            >
              Petunjuk Pembayaran untuk Penghuni (Opsional)
            </Label>
            <Textarea
              id="bankAccountInfo"
              name="bankAccountInfo"
              rows={2}
              defaultValue={initialBankAccountInfo ?? ""}
              placeholder="Contoh: Harap sertakan nomor kamar pada berita transfer. Pembayaran tunai on the spot dapat langsung diserahkan ke penjaga kost."
              className="bg-background border-input focus:border-primary focus:ring-primary/30 text-sm text-foreground"
            />
          </div>

          {/* QRIS Statis Upload & Gating */}
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="size-4 text-primary" />
                <span>Gambar QRIS Statis Properti (Tier Starter ke Atas)</span>
              </Label>
              {!canUseStaticQris && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-ochre/10 text-amber-ochre text-[11px] font-bold border border-amber-ochre/20">
                  <Lock className="size-3" /> Paket Starter+
                </span>
              )}
            </div>

            {isFreeTier ? (
              <div className="p-4 rounded-xl bg-muted/60 border border-border text-xs sm:text-sm space-y-2">
                <p className="text-foreground">
                  🔒{" "}
                  <strong>Fitur QRIS Statis terkunci pada Paket Free.</strong>{" "}
                  Pemilik pada Paket Free menerima pembayaran via transfer
                  manual atau tunai langsung di tempat.
                </p>
                <p className="text-muted-foreground text-xs">
                  Upgrade ke <strong>Paket Starter (6 – 15 Kamar)</strong>{" "}
                  seharga Rp 69.000/bln untuk mengaktifkan barcode QRIS cetak
                  Anda di aplikasi mobile penghuni.
                </p>
                {onNavigateToTab && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigateToTab("subscription")}
                    className="mt-1 text-xs font-bold text-primary border-primary/30 hover:bg-primary/10"
                  >
                    Lihat Paket Starter
                  </Button>
                )}
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  Unggah gambar barcode QRIS statis milik Anda (dari BCA, GoPay,
                  OVO, atau bank lain) agar penghuni dapat langsung melakukan
                  scan dari aplikasi mobile.
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {qrisUrl ? (
                    <div className="relative group size-28 rounded-xl border-2 border-dashed border-primary/30 overflow-hidden bg-card p-1 shadow-2xs">
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
                    <div className="size-28 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground bg-muted/40">
                      <QrCode className="size-8 stroke-1 mb-1 text-muted-foreground" />
                      <span className="text-[10px]">Belum ada QRIS</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 border border-border text-xs font-bold text-foreground cursor-pointer transition-colors">
                      {isUploadingQris ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin text-primary" />
                          <span>Mengunggah...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="size-3.5 text-primary" />
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
                    <p className="text-[11px] text-muted-foreground">
                      Format: PNG/JPG/WebP, Maksimal 2 MB.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* CARD 2: DIRECT MERCHANT MIDTRANS GATEWAY (GROWTH & PRO TIER)   */}
        {/* ============================================================== */}
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary shrink-0 mt-0.5">
                <Zap className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold font-editorial text-foreground leading-snug">
                  Pembayaran Otomatis Midtrans (Tier Growth &amp; Pro Direct
                  Merchant)
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  Penghuni membayar via QRIS Dinamis &amp; Virtual Account
                  Bank. Pembayaran otomatis diverifikasi dan dana 100%
                  langsung masuk ke rekening Midtrans Anda.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              {!canUseMidtrans ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-ochre/10 text-amber-ochre text-xs font-bold border border-amber-ochre/25 whitespace-nowrap">
                  <Lock className="size-3.5 shrink-0" /> Terkunci (Paket Growth+)
                </span>
              ) : (
                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none shrink-0 group">
                  <input
                    type="checkbox"
                    name="isMidtransActive"
                    value="true"
                    checked={isMidtransActive}
                    onChange={(e) => setIsMidtransActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 shrink-0 bg-[#E5DFD7] border border-[#2C2825]/15 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 rounded-full transition-colors duration-200 peer-checked:bg-secondary peer-checked:border-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:shadow-xs after:transition-transform after:duration-200 peer-checked:after:translate-x-5"></div>
                  <span className="text-xs font-bold text-foreground whitespace-nowrap min-w-[4rem]">
                    {isMidtransActive ? "Aktif" : "Non-Aktif"}
                  </span>
                </label>
              )}
            </div>
          </div>

          {!canUseMidtrans ? (
            <div className="p-4 sm:p-5 rounded-xl bg-muted/60 border border-border text-xs sm:text-sm space-y-3">
              <div className="flex items-start gap-2.5">
                <Info className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-foreground">
                    Otomatisasi Pembayaran Midtrans Snap eksklusif untuk Paket
                    Growth &amp; Pro:
                  </span>
                  <p className="text-muted-foreground mt-1">
                    Pada paket <strong>{currentPlanTier}</strong>, sistem
                    menggunakan metode verifikasi manual via bukti transfer.
                    Tingkatkan paket ke{" "}
                    <strong>Growth Scaler (16 – 40 kamar)</strong> seharga Rp
                    179.000/bln agar seluruh tagihan sewa diverifikasi secara
                    instan dengan QRIS Dinamis &amp; Virtual Account Bank.
                  </p>
                </div>
              </div>
              {onNavigateToTab && (
                <div className="pl-6.5">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onNavigateToTab("subscription")}
                    className="bg-primary hover:bg-terracotta-hover text-primary-foreground rounded-xl font-bold text-xs gap-1.5 shadow-xs"
                  >
                    <Zap className="size-3.5" />
                    <span>Upgrade ke Paket Growth</span>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Edukasi Direct Merchant */}
              <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-xs sm:text-sm space-y-2">
                <div className="flex items-start gap-2.5">
                  <Info className="size-4 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">
                      Keamanan &amp; Kedaulatan Finansial:
                    </span>{" "}
                    OsKost menggunakan arsitektur <em>Direct Merchant</em>. Kami
                    tidak menampung uang sewa Anda (tanpa penampungan
                    sentral/escrow). Kunci Server Key di bawah ini dienkripsi
                    dengan standar <strong>NIST AES-256-GCM</strong> di
                    database.
                  </div>
                </div>
                <div className="pl-6.5 text-[11px] text-muted-foreground">
                  Belum punya akun Midtrans? Anda dapat mendaftar gratis sebagai
                  perorangan (cukup KTP) di{" "}
                  <a
                    href="https://dashboard.midtrans.com/register"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold underline text-secondary hover:text-foreground inline-flex items-center gap-0.5"
                  >
                    midtrans.com <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>

              <div className="space-y-6 pt-2">
                {/* Merchant ID */}
                <div className="space-y-2">
                  <Label
                    htmlFor="midtransMerchantId"
                    className="text-xs font-bold text-foreground uppercase tracking-wider"
                  >
                    Midtrans Merchant ID
                  </Label>
                  <Input
                    id="midtransMerchantId"
                    name="midtransMerchantId"
                    type="text"
                    defaultValue={initialMidtransMerchantId ?? ""}
                    placeholder="Contoh: M392756841 atau G123456789"
                    className="h-11 bg-background border-input focus:border-primary focus:ring-primary/30 font-mono text-xs text-foreground"
                  />
                </div>

                {/* Client Key */}
                <div className="space-y-2">
                  <Label
                    htmlFor="midtransClientKey"
                    className="text-xs font-bold text-foreground uppercase tracking-wider"
                  >
                    Midtrans Client Key (Publik)
                  </Label>
                  <Input
                    id="midtransClientKey"
                    name="midtransClientKey"
                    type="text"
                    defaultValue={initialMidtransClientKey ?? ""}
                    placeholder="Contoh: Mid-client-xxxx atau SB-Mid-client-xxxx"
                    className="h-11 bg-background border-input focus:border-primary focus:ring-primary/30 font-mono text-xs text-foreground"
                  />
                </div>

                {/* Server Key (AES-256 Encrypted at Rest) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="newMidtransServerKey"
                      className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <KeyRound className="size-3.5 text-primary" />
                      <span>
                        Midtrans Server Key (Rahasia &amp; Terenkripsi)
                      </span>
                    </Label>
                    {hasMidtransServerKey && !showChangeKey && (
                      <button
                        type="button"
                        onClick={() => setShowChangeKey(true)}
                        className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        Ganti Kunci Baru
                      </button>
                    )}
                  </div>

                  {hasMidtransServerKey && !showChangeKey ? (
                    <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-secondary" />
                        <span className="font-mono text-xs text-foreground font-medium">
                          {maskedMidtransServerKey ||
                            "••••••••••••••••••••••••"}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
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
                          className="h-11 pr-10 bg-background border-input focus:border-primary focus:ring-primary/30 font-mono text-xs text-foreground"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKeyText(!showKeyText)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showKeyText ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                      {hasMidtransServerKey && (
                        <button
                          type="button"
                          onClick={() => setShowChangeKey(false)}
                          className="text-xs text-muted-foreground hover:underline cursor-pointer"
                        >
                          Batal ubah kunci (pertahankan kunci saat ini)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto h-11 px-8 rounded-xl bg-primary hover:bg-terracotta-hover text-primary-foreground font-bold text-sm shadow-xs transition-all cursor-pointer"
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
