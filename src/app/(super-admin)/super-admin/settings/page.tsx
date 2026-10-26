import { getPlatformSettingsData } from "@/features/super-admin/actions/platform-settings-actions";
import { PlatformSettingsClient } from "@/features/super-admin/components/settings/platform-settings-client";
import { Settings } from "lucide-react";

export const metadata = {
    title: "Pengaturan Platform & API Keys | OsKost Super Admin",
    description: "Pusat konfigurasi global platform OsKost, integrasi payment gateway Midtrans, and status operasional ekosistem.",
};

export default async function SuperAdminSettingsPage() {
    const data = await getPlatformSettingsData();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2DA] pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A2E] flex items-center gap-2.5">
                        <Settings className="w-7 h-7 text-[#8C6239]" />
                        <span>Pengaturan & Integrasi Platform</span>
                    </h1>
                    <p className="text-sm text-[#7A7A7A] mt-1">
                        Pusat kendali konfigurasi inti sistem SaaS, status runtime environment, dan integrasi kunci kredensial.
                    </p>
                </div>
            </div>

            {/* Main Interactive Settings Client */}
            <PlatformSettingsClient initialData={data} />
        </div>
    );
}
