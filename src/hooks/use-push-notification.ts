"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotification() {
  const [isSupported] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return "serviceWorker" in navigator && "PushManager" in window;
    }
    return false;
  });
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });
  const [loading, setLoading] = useState(false);

  const registerServiceWorkerAndCheckSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setSubscription(existingSubscription);
      }
    } catch (error) {
      console.error("Error registering Service Worker for push:", error);
    }
  };

  useEffect(() => {
    if (isSupported) {
      registerServiceWorkerAndCheckSubscription();
    }
  }, [isSupported]);

  const subscribeToPush = async () => {
    if (!isSupported) return false;
    setLoading(true);

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        setLoading(false);
        return false;
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not defined");
        setLoading(false);
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      setSubscription(sub);

      // Send subscription object to server
      const res = await fetch("/api/web-push/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      setLoading(false);
      return res.ok;
    } catch (error) {
      console.error("Failed to subscribe to Web Push:", error);
      setLoading(false);
      return false;
    }
  };

  const unsubscribeFromPush = async () => {
    if (!subscription) return false;
    setLoading(true);

    try {
      await fetch("/api/web-push/subscription", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      await subscription.unsubscribe();
      setSubscription(null);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error unsubscribing from push:", error);
      setLoading(false);
      return false;
    }
  };

  return {
    isSupported,
    permission,
    subscription,
    isSubscribed: !!subscription,
    loading,
    subscribeToPush,
    unsubscribeFromPush,
  };
}
