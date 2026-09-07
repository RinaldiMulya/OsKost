"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, X, ChevronLeft, ChevronRight } from "lucide-react";
import { markNotificationAsReadAction } from "@/features/notifications/actions";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date | string;
}

interface AnnouncementBannerProps {
  notifications: NotificationItem[];
}

const STORAGE_KEY = "oskost_dismissed_announcements";

export function AnnouncementBanner({ notifications }: AnnouncementBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Read dismissed IDs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setDismissedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Gagal membaca storage pengumuman:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Filter pengumuman (tampilkan semua pengumuman tanpa tergantung status isRead di lonceng)
  const activeAnnouncements = notifications.filter(
    (n) => n.type === "ANNOUNCEMENT"
  );

  // Filter pengumuman yang belum ditutup secara eksplisit via tombol X
  const visibleAnnouncements = activeAnnouncements.filter(
    (n) => !dismissedIds.includes(n.id)
  );

  if (!isLoaded || visibleAnnouncements.length === 0) {
    return null; // Tidak ada pengumuman — jangan render apa-apa
  }

  // Jaga agar currentIndex tidak overflow
  const safeIndex = Math.min(currentIndex, Math.max(0, visibleAnnouncements.length - 1));
  const currentItem = visibleAnnouncements[safeIndex];

  if (!currentItem) return null;

  async function handleDismiss(id: string) {
    // 1. Sembunyikan dari state lokal & simpan ke localStorage agar tidak muncul lagi
    const updatedDismissed = [...dismissedIds, id];
    setDismissedIds(updatedDismissed);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDismissed));
    } catch (e) {
      console.error("Gagal menyimpan status pengumuman:", e);
    }

    if (safeIndex > 0 && safeIndex >= visibleAnnouncements.length - 1) {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    }

    // 2. Panggil server action di latar belakang untuk tandai dibaca di DB
    try {
      await markNotificationAsReadAction(id);
    } catch (error) {
      console.error("Gagal menandai pengumuman dibaca:", error);
    }
  }

  function handleNext() {
    setCurrentIndex((prev) => (prev + 1) % visibleAnnouncements.length);
  }

  function handlePrev() {
    setCurrentIndex((prev) => (prev - 1 + visibleAnnouncements.length) % visibleAnnouncements.length);
  }

  return (
    <div className="px-4 pt-3 pb-1">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/80 via-zinc-900 to-amber-950/40 p-3.5 shadow-lg shadow-amber-950/20 backdrop-blur-md"
        >
          {/* Accent Glow Background */}
          <div className="absolute -top-12 -left-12 size-24 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />

          {/* Header Bar Banner */}
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mt-0.5">
                <Megaphone className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300 tracking-wide uppercase">
                    Pengumuman
                  </span>
                  {visibleAnnouncements.length > 1 && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {safeIndex + 1}/{visibleAnnouncements.length}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white break-words mt-0.5 leading-snug">
                  {currentItem.title}
                </h4>
              </div>
            </div>

            {/* Tombol Close [X] */}
            <button
              onClick={() => handleDismiss(currentItem.id)}
              className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors border border-zinc-700/50"
              title="Tutup & tandai terbaca"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {/* Isi Pesan Pengumuman */}
          <p className="text-xs text-zinc-300 break-words mt-2 pl-9 leading-relaxed">
            {currentItem.message}
          </p>

          {/* Footer Controls & Dots Indicator (jika pengumuman > 1) */}
          {visibleAnnouncements.length > 1 && (
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-amber-500/10 pl-9">
              {/* Dots Navigation */}
              <div className="flex items-center gap-1.5">
                {visibleAnnouncements.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === safeIndex
                        ? "w-4 bg-amber-400"
                        : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                    }`}
                  />
                ))}
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrev}
                  className="flex size-5 items-center justify-center rounded-md bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <button
                  onClick={handleNext}
                  className="flex size-5 items-center justify-center rounded-md bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
