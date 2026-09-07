import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getAdminProfile,
  getPropertyProfile,
  getNotificationStats,
} from "@/features/admin/admin-service";
import { SettingsTabs } from "@/features/admin/components/settings-tabs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengaturan | Admin Smartkost",
};

export default async function AdminSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch all settings data concurrently
  const [admin, property, notificationStats] = await Promise.all([
    getAdminProfile(session.user.id),
    getPropertyProfile(),
    getNotificationStats(),
  ]);

  if (!admin) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Pengaturan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola profil admin, properti kost, notifikasi, dan pelajari panduan sistem.
        </p>
      </div>

      <SettingsTabs
        currentEmail={admin.email ?? ""}
        property={property}
        notificationStats={notificationStats}
      />
    </div>
  );
}
