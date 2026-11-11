"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { playNotificationSound } from "@/lib/sound";

/**
 * Custom hook untuk Admin Dashboard yang berlangganan (subscribe) ke Supabase Realtime
 * pada tabel Notification, Invoice, dan Report.
 * Begitu ada pembayaran baru, laporan keluhan, atau notifikasi dari tenant,
 * suara lonceng berbunyi, pop-up Toast muncul, dan data di Admin Dashboard ter-refresh otomatis.
 */
export function useAdminRealtime() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // 1. Subscribe ke tabel Notification (In-App Notifikasi Khusus Owner)
    const notifChannel = supabase
      .channel("admin-notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Notification",
        },
        (payload) => {
          const newNotif = payload.new as {
            title?: string;
            message?: string;
            type?: string;
          };

          playNotificationSound();

          if (newNotif.title) {
            toast.info(newNotif.title, {
              description: newNotif.message,
              duration: 5000,
            });
          }

          router.refresh();
        }
      )
      .subscribe();

    // 2. Subscribe ke tabel Invoice (Pembayaran Sewa Tenant)
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
              playNotificationSound();
              toast.success("Pembayaran tagihan baru berhasil dikonfirmasi!", {
                duration: 5000,
              });
            }
          }
          router.refresh();
        }
      )
      .subscribe();

    // 3. Subscribe ke tabel Report (Laporan Kerusakan / Keluhan Tenant)
    const reportChannel = supabase
      .channel("admin-reports-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Report",
        },
        (payload) => {
          const report = payload.new as { title?: string };
          playNotificationSound();
          toast.info("Laporan keluhan baru diterima dari tenant!", {
            description: report?.title,
            duration: 5000,
          });
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
      supabase.removeChannel(invoiceChannel);
      supabase.removeChannel(reportChannel);
    };
  }, [router]);
}
