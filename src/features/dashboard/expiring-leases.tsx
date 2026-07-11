import { ExpiringLease } from "./dashboard-service";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CalendarClock, ArrowRight } from "lucide-react";
import Link from "next/link";

export function ExpiringLeases({ leases }: { leases: ExpiringLease[] }) {
    if (leases.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm">
                <CalendarClock className="h-8 w-8 mb-2 opacity-20" />
                <p>Tidak ada kontrak yang akan habis dalam waktu dekat.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {leases.map((lease) => (
                <div key={lease.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-800/40 transition-colors">
                    <div>
                        <p className="text-sm font-semibold text-white">{lease.tenantName}</p>
                        <p className="text-xs text-zinc-400">
                            Kamar {lease.roomNumber} &bull; Habis {format(lease.endDate, "dd MMM yyyy", { locale: localeId })}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`text-xs font-bold px-2 py-1 rounded-md ${
                            lease.daysRemaining <= 7 
                                ? "bg-red-500/10 text-red-500" 
                                : lease.daysRemaining <= 14 
                                    ? "bg-amber-500/10 text-amber-500" 
                                    : "bg-blue-500/10 text-blue-400"
                        }`}>
                            {lease.daysRemaining} hari lagi
                        </div>
                    </div>
                </div>
            ))}
            <Link href="/admin/tenants" className="flex items-center justify-center w-full py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors group">
                Kelola Penghuni <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}
