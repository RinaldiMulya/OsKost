"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, RotateCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cancelPaymentAction } from "../actions";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SnapPendingHandlerProps {
  invoiceId: string;
  snapToken: string;
  paymentUrl: string;
}

export function SnapPendingHandler({
  invoiceId,
  snapToken,
  paymentUrl,
}: SnapPendingHandlerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Supabase Realtime Subscription: Langsung deteksi perubahan status invoice di DB secara instan (milidetik)
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`pending-invoice-${invoiceId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Invoice",
          filter: `id=eq.${invoiceId}`,
        },
        (payload) => {
          const newStatus = (payload.new as { status?: string })?.status;
          if (newStatus === "PAID" || newStatus === "UNPAID") {
            toast.success("Status pembayaran berhasil dikonfirmasi!");
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [invoiceId, router]);

  // Helper fallback polling 3x pasca transaksi jika WebSocket bermasalah
  function pollRefresh() {
    router.refresh();
    setTimeout(() => router.refresh(), 1500);
    setTimeout(() => router.refresh(), 3500);
    setTimeout(() => router.refresh(), 6000);
  }

  async function handleResume() {
    setIsLoading(true);
    if (window.snap) {
      window.snap.pay(snapToken, {
        onSuccess: () => {
          toast.success("Pembayaran berhasil! Memperbarui status...");
          setIsLoading(false);
          pollRefresh();
        },
        onPending: () => {
          toast.info("Pembayaran tertunda. Harap selesaikan pembayaran.");
          setIsLoading(false);
          pollRefresh();
        },
        onError: () => {
          toast.error("Pembayaran gagal. Silakan coba lagi.");
          setIsLoading(false);
        },
        onClose: () => {
          toast.info("Popup pembayaran ditutup.");
          setIsLoading(false);
          pollRefresh();
        },
      });
    } else {
      // Fallback redirect
      window.location.href = paymentUrl;
    }
  }

  async function handleCancel() {
    const confirmCancel = window.confirm(
      "Apakah Anda yakin ingin membatalkan transaksi pembayaran online ini dan memilih metode pembayaran lain?"
    );
    if (!confirmCancel) return;

    setIsLoading(true);
    const result = await cancelPaymentAction(invoiceId);
    setIsLoading(false);

    if (result.success) {
      toast.success(result.message || "Transaksi berhasil dibatalkan.");
      router.refresh();
    } else {
      toast.error(result.error || "Gagal membatalkan transaksi.");
    }
  }

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-4">
      <div className="flex items-start gap-2.5">
        <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-amber-400">
            Pembayaran Online Tertunda (Pending)
          </p>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Anda telah memilih metode pembayaran online. Harap selesaikan pembayaran Anda
            atau batalkan jika ingin mengganti metode pembayaran.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <Button
          onClick={handleResume}
          disabled={isLoading}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs gap-1.5 h-10"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="h-4 w-4" />
          )}
          Lanjutkan Pembayaran
        </Button>

        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
          className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs gap-1.5 h-10"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          Batalkan & Ganti Metode
        </Button>
      </div>
    </div>
  );
}
