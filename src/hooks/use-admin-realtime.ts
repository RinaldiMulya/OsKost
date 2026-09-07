"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

/**
 * Custom hook untuk Admin Dashboard yang berlangganan (subscribe) ke Supabase Realtime
 * pada tabel Invoice dan Report.
 * Begitu ada pembayaran baru atau laporan kerusakan baru dari tenant,
 * data di Admin Dashboard otomatis ter-update secara instan milidetik.
 */
export function useAdminRealtime() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // 1. Subscribe ke tabel Invoice
    const invoiceChannel = supabase
      .channel("admin-invoices-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Invoice",
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const newStatus = (payload.new as { status?: string })?.status;
            if (newStatus === "PAID") {
              toast.success("Pembayaran tagihan baru berhasil dikonfirmasi!");
            }
          }
          router.refresh();
        }
      )
      .subscribe();

    // 2. Subscribe ke tabel Report
    const reportChannel = supabase
      .channel("admin-reports-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Report",
        },
        () => {
          toast.info("Laporan keluhan baru diterima dari tenant!");
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(invoiceChannel);
      supabase.removeChannel(reportChannel);
    };
  }, [router]);
}
