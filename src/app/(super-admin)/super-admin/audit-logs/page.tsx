import { getAuditLogsData } from "@/features/super-admin/actions/audit-logs-actions";
import { AuditLogsTableClient } from "@/features/super-admin/components/audit-logs/audit-logs-table-client";
import { ShieldCheck } from "lucide-react";

export const metadata = {
    title: "Audit Logs & Security Trail | OsKost Super Admin",
    description: "Rekam jejak seluruh aktivitas keamanan, autentikasi, dan perubahan data di ekosistem platform OsKost.",
};

export default async function SuperAdminAuditLogsPage() {
    const { logs, totalCount, summary } = await getAuditLogsData({ take: 200 });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2DA] pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A2E] flex items-center gap-2.5">
                        <ShieldCheck className="w-7 h-7 text-[#8C6239]" />
                        <span>Platform Audit Logs</span>
                    </h1>
                    <p className="text-sm text-[#7A7A7A] mt-1">
                        Pusat pencatatan kepatuhan, jejak forensik autentikasi, aktivitas impersonasi, dan event sistem fail-safe.
                    </p>
                </div>
            </div>

            {/* Interactive DataTable & Metrics */}
            <AuditLogsTableClient
                initialLogs={logs}
                totalCount={totalCount}
                summary={summary}
            />
        </div>
    );
}
