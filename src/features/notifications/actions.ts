"use server";

import { auth } from "@/auth";
import { markNotificationAsRead, markAllNotificationsAsRead } from "./notification-service";

export async function markNotificationAsReadAction(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await markNotificationAsRead(notificationId, session.user.id);
    return { success: true };
  } catch (error) {
    console.error("Error marking notification read:", error);
    return { success: false, error: "Failed to mark notification read" };
  }
}

export async function markAllNotificationsAsReadAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await markAllNotificationsAsRead(session.user.id);
    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications read:", error);
    return { success: false, error: "Failed to mark all notifications read" };
  }
}
