"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface UseAutoRefreshOptions {
  intervalMs?: number;
  enabled?: boolean;
}

/**
 * Hook untuk auto-refresh data di Next.js App Router tanpa reload halaman.
 * Fitur:
 * 1. Otomatis refresh data saat tab/aplikasi difokuskan kembali (visibilitychange / focus).
 * 2. Polling interval halus hanya ketika layar aktif (document.hidden === false).
 */
export function useAutoRefresh(options: UseAutoRefreshOptions = {}) {
  const { intervalMs = 20000, enabled = true } = options;
  const router = useRouter();

  const refreshData = useCallback(() => {
    try {
      router.refresh();
    } catch (error) {
      console.error("Gagal melakukan auto-refresh data:", error);
    }
  }, [router]);

  useEffect(() => {
    if (!enabled) return;

    // 1. Refresh data saat layar/tab kembali difokuskan (Refetch on Window Focus)
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        refreshData();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    // 2. Listen pesan broadcast dari Service Worker (misal: Push Notification masuk atau diklik)
    const handleSWMessage = (event: MessageEvent) => {
      if (
        event.data &&
        (event.data.type === "PUSH_NOTIFICATION_RECEIVED" ||
          event.data.type === "NOTIFICATION_CLICKED")
      ) {
        refreshData();
      }
    };

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleSWMessage);
    }

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleSWMessage);
      }
    };
  }, [enabled, refreshData]);

  return { refreshData };
}
