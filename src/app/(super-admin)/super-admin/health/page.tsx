import { getSystemHealthDiagnostics } from "@/features/super-admin/actions/health-actions";
import { HealthDashboardClient } from "@/features/super-admin/components/health/health-dashboard-client";
import { Activity } from "lucide-react";

export const metadata = {
    title: "Kesehatan Sistem & Integrasi API | OsKost Super Admin",
    description: "Telemetri real-time performa database, payment gateway Midtrans, email service, dan pipeline webhook.",
};

export default async function SuperAdminHealthPage() {
    const report = await getSystemHealthDiagnostics();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2DA] pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A2E] flex items-center gap-2.5">
                        <Activity className="w-7 h-7 text-[#8C6239]" />
                        <span>Kesehatan Sistem & Integrasi API</span>
                    </h1>
                    <p className="text-sm text-[#7A7A7A] mt-1">
                        Pusat telemetri kebugaran infrastruktur server, gateway pembayaran, latensi database, dan callback webhook.
                    </p>
                </div>
            </div>

            {/* Client Interactive Telemetry Dashboard */}
            <HealthDashboardClient initialReport={report} />
        </div>
    );
}
