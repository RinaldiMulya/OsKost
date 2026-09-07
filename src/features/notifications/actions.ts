"use server";

import { auth } from "@/auth";
import { markNotificationAsRead, markAllNotificationsAsRead } from "./notification-service";
import logger from "@/lib/logger";

const log = logger.child({ module: "notification-actions" });

export async function markNotificationAsReadAction(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await markNotificationAsRead(notificationId, session.user.id);
    return { success: true };
  } catch (error) {
    log.error({ err: error, notificationId }, "Gagal menandai notifikasi dibaca");
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
    log.error({ err: error }, "Gagal menandai semua notifikasi dibaca");
    return { success: false, error: "Failed to mark all notifications read" };
  }
}

import { z } from "zod";
import { sendNotification } from "./notification-service";

const announcementSchema = z.object({
  userIds: z.array(z.string()).min(1, "Pilih minimal 1 penyewa"),
  title: z.string().min(1, "Judul pengumuman harus diisi").max(100, "Judul maksimal 100 karakter"),
  message: z.string().min(1, "Isi pengumuman harus diisi").max(500, "Pesan maksimal 500 karakter"),
});

export async function sendAnnouncementAction(input: {
  userIds: string[];
  title: string;
  message: string;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak. Membutuhkan hak akses Admin." };
  }

  const parsed = announcementSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const { userIds, title, message } = parsed.data;

    await Promise.all(
      userIds.map((userId) =>
        sendNotification({
          userId,
          title,
          message,
          type: "ANNOUNCEMENT",
          url: "/dashboard",
        })
      )
    );

    return {
      success: true,
      count: userIds.length,
      message: `Pengumuman berhasil dikirim ke ${userIds.length} penyewa!`,
    };
  } catch (error) {
    log.error({ err: error }, "Gagal mengirim pengumuman");
    return { success: false, error: "Gagal mengirim pengumuman" };
  }
}
