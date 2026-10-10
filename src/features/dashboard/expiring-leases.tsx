import { ExpiringLease } from "./dashboard-service";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CalendarClock, ArrowRight } from "lucide-react";
import Link from "next/link";

export function ExpiringLeases({ leases }: { leases: ExpiringLease[] }) {
    if (leases.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-[#4A453F] text-sm sm:text-base font-medium">
                <CalendarClock className="h-9 w-9 mb-2 text-[#8C6239]/40" />
                <p>Tidak ada kontrak yang akan habis dalam waktu dekat.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {leases.map((lease) => (
                <div key={lease.id} className="flex items-center justify-between p-3.5 rounded-xl border border-[#2C2825]/10 bg-[#F8F6F1]/80 hover:bg-[#F2EDE9] transition-colors">
                    <div>
                        <p className="text-sm sm:text-base font-bold text-[#1E1B18]">{lease.tenantName}</p>
                        <p className="text-xs sm:text-sm text-[#4A453F] font-medium mt-0.5">
                            Kamar <span className="font-bold text-[#1E1B18]">{lease.roomNumber}</span> &bull; Habis {format(lease.endDate, "dd MMM yyyy", { locale: localeId })}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            lease.daysRemaining <= 7 
                                ? "bg-red-50 text-red-700 border border-red-200" 
                                : lease.daysRemaining <= 14 
                                    ? "bg-amber-50 text-amber-800 border border-amber-200" 
                                    : "bg-orange-50 text-[#8C6239] border border-orange-200"
                        }`}>
                            {lease.daysRemaining} hari lagi
                        </div>
                    </div>
                </div>
            ))}
            <Link href="/admin/tenants" className="flex items-center justify-center w-full py-2.5 text-sm font-bold text-[#8C6239] hover:text-[#714A23] transition-colors group mt-2">
                Kelola Semua Penghuni <ArrowRight className="h-4 w-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}
