"use client";

import { useEffect } from "react";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";

export function PWARegister() {
  // Activate auto-refresh for PWA tenant
  useAutoRefresh({ intervalMs: 20000 });
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("PWA Service Worker registered with scope: ", registration.scope);
          })
          .catch((err) => {
            console.error("PWA Service Worker registration failed: ", err);
          });
      };

      // Register after page loads completely
      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
        return () => window.removeEventListener("load", registerSW);
      }
    }
  }, []);

  return null;
}
