import "server-only";
import { cache } from "react";
import { unstable_cache, updateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache-tags";
import webpush from "web-push";

// Setup VAPID details if env vars are present
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@oskost.com";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type?: "BILLING" | "MAINTENANCE" | "SYSTEM" | "INFO";
  url?: string;
}

// ============================================
// READ - User Notifications (Cached)
// ============================================

export const getUserNotifications = cache(async (userId: string) => {
  return unstable_cache(
    async () => {
      return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 30, // Get last 30 notifications
      });
    },
    [`user-notifications-${userId}`],
    { tags: [CACHE_TAGS.userNotifications(userId)], revalidate: 60 }
  )();
});

// ============================================
// MUTATIONS - Mark Read
// ============================================

export async function markNotificationAsRead(notificationId: string, userId: string) {
  const result = await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: { isRead: true },
  });

  updateTag(CACHE_TAGS.userNotifications(userId));
  return result;
}

export async function markAllNotificationsAsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: { isRead: true },
  });

  updateTag(CACHE_TAGS.userNotifications(userId));
  return result;
}

// ============================================
// CENTRALIZED SERVICE - Send Notification (In-App + Web Push)
// ============================================

export async function sendNotification(payload: NotificationPayload) {
  const { userId, title, message, type = "INFO", url = "/dashboard" } = payload;

  // 1. Create In-App Notification record in DB
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      isRead: false,
    },
  });

  // Invalidate In-App Notification cache for user
  updateTag(CACHE_TAGS.userNotifications(userId));

  // 2. Query Push Subscriptions for user and send Web Push
  if (vapidPublicKey && vapidPrivateKey) {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length > 0) {
      const pushPayload = JSON.stringify({
        title,
        message,
        url,
        type,
      });

      const pushPromises = subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            pushPayload
          );
        } catch (error: any) {
          // If subscription has expired or is invalid (404/410), delete it from DB
          if (error.statusCode === 404 || error.statusCode === 410) {
            console.log(`Deleting stale push subscription: ${sub.endpoint}`);
            await prisma.pushSubscription.delete({
              where: { id: sub.id },
            }).catch(() => {});
          } else {
            console.error(`Failed to send web push to ${sub.endpoint}:`, error);
          }
        }
      });

      await Promise.all(pushPromises);
    }
  }

  return notification;
}
