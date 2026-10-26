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

  // Filter pengumuman
  const activeAnnouncements = notifications.filter(
    (n) => n.type === "ANNOUNCEMENT",
  );

  // Filter pengumuman yang belum ditutup secara eksplisit via tombol X
  const visibleAnnouncements = activeAnnouncements.filter(
    (n) => !dismissedIds.includes(n.id),
  );

  if (!isLoaded || visibleAnnouncements.length === 0) {
    return null;
  }

  // Jaga agar currentIndex tidak overflow
  const safeIndex = Math.min(
    currentIndex,
    Math.max(0, visibleAnnouncements.length - 1),
  );
  const currentItem = visibleAnnouncements[safeIndex];

  if (!currentItem) return null;

  async function handleDismiss(id: string) {
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
    setCurrentIndex(
      (prev) =>
        (prev - 1 + visibleAnnouncements.length) % visibleAnnouncements.length,
    );
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
          className="relative overflow-hidden rounded-2xl border border-[#A45A3D]/25 bg-gradient-to-br from-[#FFF8F2] via-white to-[#FAF2EA] p-4 shadow-sm"
        >
          {/* Accent Glow Background */}
          <div className="absolute -top-12 -left-12 size-24 rounded-full bg-[#A45A3D]/10 blur-xl pointer-events-none" />

          {/* Header Bar Banner */}
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#FAF2EA] text-[#A45A3D] border border-[#A45A3D]/20 mt-0.5 shadow-2xs">
                <Megaphone className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold text-[#A45A3D] tracking-wider uppercase">
                    Pengumuman
                  </span>
                  {visibleAnnouncements.length > 1 && (
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-[#FAF2EA] text-[#A45A3D] border border-[#A45A3D]/25">
                      {safeIndex + 1}/{visibleAnnouncements.length}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-[#1E1B18] break-words mt-0.5 leading-snug">
                  {currentItem.title}
                </h4>
              </div>
            </div>

            {/* Tombol Close [X] */}
            <button
              onClick={() => handleDismiss(currentItem.id)}
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[#4A453F] hover:bg-[#FAF2EA] hover:text-[#A45A3D] transition-colors border border-[#2C2825]/10 shadow-2xs cursor-pointer"
              title="Tutup & tandai terbaca"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {/* Isi Pesan Pengumuman */}
          <p className="text-xs text-[#4A453F] break-words mt-2.5 pl-10.5 leading-relaxed font-normal">
            {currentItem.message}
          </p>

          {/* Footer Controls & Dots Indicator (jika pengumuman > 1) */}
          {visibleAnnouncements.length > 1 && (
            <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-[#2C2825]/10 pl-10.5">
              {/* Dots Navigation */}
              <div className="flex items-center gap-1.5">
                {visibleAnnouncements.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === safeIndex
                        ? "w-4 bg-[#A45A3D]"
                        : "w-1.5 bg-[#2C2825]/20 hover:bg-[#2C2825]/40"
                    }`}
                  />
                ))}
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrev}
                  className="flex size-6 items-center justify-center rounded-lg bg-white text-[#4A453F] hover:bg-[#FAF2EA] hover:text-[#A45A3D] transition-colors border border-[#2C2825]/10 shadow-2xs cursor-pointer"
                  title="Sebelumnya"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <button
                  onClick={handleNext}
                  className="flex size-6 items-center justify-center rounded-lg bg-white text-[#4A453F] hover:bg-[#FAF2EA] hover:text-[#A45A3D] transition-colors border border-[#2C2825]/10 shadow-2xs cursor-pointer"
                  title="Selanjutnya"
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
