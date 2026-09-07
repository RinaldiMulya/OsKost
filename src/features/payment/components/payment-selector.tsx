"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  QrCode,
  Building2,
  Loader2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { createPaymentAction } from "../actions";
import { useRouter } from "next/navigation";

interface PaymentMethod {
  id: string;
  methodCode: string;
  methodName: string;
  feeType: string;
  feeAmount: number;
  tenantFeePercentage: number;
}

interface PaymentSelectorProps {
  invoiceId: string;
  baseAmount: number;
  paymentMethods: PaymentMethod[];
}

/**
 * Komponen pemilih metode pembayaran untuk PWA Tenant.
 * Menggunakan Radio Group (hanya bisa pilih 1 metode).
 * Setelah dipilih, menampilkan rincian biaya admin dan memicu Snap popup.
 */
export function PaymentSelector({
  invoiceId,
  baseAmount,
  paymentMethods,
}: PaymentSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Helper untuk melakukan refresh halus 3x pasca transaksi
  function pollRefresh() {
    router.refresh();
    setTimeout(() => router.refresh(), 1500);
    setTimeout(() => router.refresh(), 3500);
    setTimeout(() => router.refresh(), 6000);
  }

  // Hitung estimasi biaya admin untuk metode terpilih
  const selectedPaymentMethod = paymentMethods.find(
    (m) => m.methodCode === selectedMethod
  );

  let estimatedAdminFee = 0;
  let tenantFee = 0;

  if (selectedPaymentMethod) {
    if (selectedPaymentMethod.feeType === "FLAT") {
      estimatedAdminFee = selectedPaymentMethod.feeAmount;
    } else if (selectedPaymentMethod.feeType === "PERCENTAGE") {
      estimatedAdminFee = Math.ceil(
        (baseAmount * selectedPaymentMethod.feeAmount) / 10000
      );
    }
    tenantFee = Math.ceil(
      (estimatedAdminFee * selectedPaymentMethod.tenantFeePercentage) / 100
    );
  }

  const estimatedTotal = baseAmount + tenantFee;

  // Ikon berdasarkan tipe metode
  function getMethodIcon(code: string) {
    if (code.includes("QRIS")) return <QrCode className="h-5 w-5" />;
    return <Building2 className="h-5 w-5" />;
  }

  // Format label biaya admin
  function getFeeLabel(method: PaymentMethod) {
    if (method.feeType === "FLAT") {
      return `Biaya admin: Rp ${method.feeAmount.toLocaleString("id-ID")}`;
    }
    const percentage = method.feeAmount / 100;
    return `Biaya admin: ${percentage}%`;
  }

  async function handlePay() {
    if (!selectedMethod) {
      toast.error("Pilih metode pembayaran terlebih dahulu.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createPaymentAction(invoiceId, selectedMethod);

      if (!result.success) {
        toast.error(result.error || "Gagal membuat transaksi.");
        setIsLoading(false);
        return;
      }

      // Buka Midtrans Snap popup
      const snapToken = result.data?.snapToken;
      if (snapToken && window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: () => {
            toast.success("Pembayaran berhasil! Memperbarui status...");
            setIsLoading(false);
            pollRefresh();
          },
          onPending: () => {
            toast.info(
              "Pembayaran tertunda. Selesaikan pembayaran sebelum batas waktu."
            );
            setIsLoading(false);
            pollRefresh();
          },
          onError: () => {
            toast.error("Pembayaran gagal. Silakan coba lagi.");
            setIsLoading(false);
          },
          onClose: () => {
            toast.info("Popup pembayaran ditutup. Anda bisa membayar nanti.");
            setIsLoading(false);
            pollRefresh();
          },
        });
      } else {
        // Fallback: redirect ke payment URL jika Snap SDK tidak tersedia
        if (result.data?.paymentUrl) {
          window.location.href = result.data.paymentUrl;
        }
      }
    } catch {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    }
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-center text-xs text-zinc-500">
        Belum ada metode pembayaran online yang tersedia. Silakan hubungi Admin.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-white font-bold text-sm">
        <ShieldCheck className="h-4 w-4 text-secondary" />
        <span>Pilih Metode Pembayaran</span>
      </div>

      {/* Radio Group — Hanya bisa pilih 1 */}
      <RadioGroup
        value={selectedMethod}
        onValueChange={setSelectedMethod}
        className="space-y-2"
      >
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            className={`cursor-pointer transition-all duration-200 border ${
              selectedMethod === method.methodCode
                ? "border-secondary/50 bg-secondary/5 shadow-md shadow-secondary/10"
                : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
            }`}
            onClick={() => setSelectedMethod(method.methodCode)}
          >
            <CardContent className="p-3 flex items-center gap-3">
              <RadioGroupItem
                value={method.methodCode}
                id={method.methodCode}
                className="shrink-0"
              />
              <div
                className={`p-2 rounded-lg ${
                  selectedMethod === method.methodCode
                    ? "bg-secondary/20 text-secondary"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {getMethodIcon(method.methodCode)}
              </div>
              <Label
                htmlFor={method.methodCode}
                className="flex-1 cursor-pointer"
              >
                <p className="text-sm font-semibold text-white">
                  {method.methodName}
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {getFeeLabel(method)}
                  {" · Porsi Anda: "}
                  {method.tenantFeePercentage}%
                </p>
              </Label>
            </CardContent>
          </Card>
        ))}
      </RadioGroup>

      {/* Estimasi Biaya */}
      {selectedMethod && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-xs space-y-1.5">
          <div className="flex justify-between text-zinc-400">
            <span>Tagihan Dasar</span>
            <span className="text-zinc-200">
              Rp {baseAmount.toLocaleString("id-ID")}
            </span>
          </div>
          {tenantFee > 0 && (
            <div className="flex justify-between text-zinc-400">
              <span>Biaya Layanan (porsi Anda)</span>
              <span className="text-zinc-200">
                Rp {tenantFee.toLocaleString("id-ID")}
              </span>
            </div>
          )}
          <div className="flex justify-between font-bold text-white border-t border-zinc-800 pt-1.5">
            <span>Estimasi Total</span>
            <span className="text-secondary">
              Rp {estimatedTotal.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      )}

      {/* Tombol Bayar */}
      <Button
        onClick={handlePay}
        disabled={!selectedMethod || isLoading}
        className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-3 gap-2"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          <>
            Bayar Sekarang
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      <p className="text-[10px] text-zinc-600 text-center">
        Transaksi diproses secara aman oleh Midtrans. OsKost tidak menyimpan
        data kartu/rekening Anda.
      </p>
    </div>
  );
}
