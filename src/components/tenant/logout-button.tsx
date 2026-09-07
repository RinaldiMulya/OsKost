"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { logout } from "@/features/auth/actions";
import { useState } from "react";

/**
 * Tombol Logout khusus PWA Tenant.
 * Menghapus seluruh cache Service Worker sebelum menjalankan server action signOut
 * agar data sensitif penghuni tidak tersisa di perangkat bersama.
 */
export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      // Bersihkan seluruh cache yang dikelola Service Worker (Workbox)
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }

      // Unregister service worker agar sesi bersih total saat login ulang
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((r) => r.unregister()));
      }
    } catch (error) {
      // Gagal membersihkan cache bukan blocker — lanjutkan logout
      console.warn("Gagal membersihkan cache PWA:", error);
    }

    // Jalankan server action logout (redirect ke /login)
    await logout();
  }

  return (
    <form
      action={handleLogout}
    >
      <Button
        type="submit"
        variant="destructive"
        disabled={isLoggingOut}
        className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-2.5 font-bold text-xs transition-all rounded-xl"
      >
        <LogOut className="h-4 w-4" />
        {isLoggingOut ? "Keluar..." : "Keluar dari Aplikasi"}
      </Button>
    </form>
  );
}
