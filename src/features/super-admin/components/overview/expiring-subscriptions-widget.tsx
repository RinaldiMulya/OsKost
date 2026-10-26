import Link from "next/link";
import { AlertTriangle, Clock, ArrowRight, ShieldCheck } from "lucide-react";

interface ExpiringSubscriptionsWidgetProps {
    subscriptions: {
        id: string;
        propertyName: string;
        ownerName: string;
        ownerEmail: string;
        planTier: string;
        status: string;
        expiryDate: string | null;
        daysLeft: number;
    }[];
}

export function ExpiringSubscriptionsWidget({
    subscriptions,
}: ExpiringSubscriptionsWidgetProps) {
    return (
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8E2DA] shadow-xs flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#D4A843]/15 text-[#9E7822] flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-[#1A1A2E]">
                                Perhatian Masa Aktif
                            </h3>
                            <p className="text-xs text-[#7A7A7A]">
                                Akun trial / subscription yang segera berakhir
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/super-admin/subscriptions"
                        className="text-xs font-semibold text-[#8C6239] hover:underline flex items-center gap-1"
                    >
                        <span>Lihat Semua</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {subscriptions.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#7A7A7A] flex flex-col items-center gap-2">
                        <ShieldCheck className="w-8 h-8 text-[#4A7C59]" />
                        <span>Semua status langganan saat ini berjalan aman dan aktif.</span>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {subscriptions.map((sub) => {
                            const isPastDue = sub.status === "PAST_DUE" || sub.daysLeft < 0;
                            return (
                                <div
                                    key={sub.id}
                                    className="p-3.5 rounded-xl border border-[#F0EBE1] hover:border-[#8C6239]/30 bg-[#FAF7F2]/50 hover:bg-[#FAF7F2] transition-colors flex items-center justify-between text-xs"
                                >
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[#1A1A2E]">
                                                {sub.propertyName}
                                            </span>
                                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#E8E2DA] text-[#5C564E]">
                                                {sub.planTier}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-[#7A7A7A]">
                                            {sub.ownerEmail}
                                        </p>
                                    </div>

                                    <div className="text-right flex flex-col items-end gap-1">
                                        {isPastDue ? (
                                            <span className="inline-flex items-center gap-1 font-semibold text-[#C45B4B] bg-[#C45B4B]/10 px-2 py-0.5 rounded-md">
                                                <AlertTriangle className="w-3 h-3" />
                                                Menunggak (Past Due)
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 font-semibold text-[#9E7822] bg-[#D4A843]/15 px-2 py-0.5 rounded-md">
                                                <Clock className="w-3 h-3" />
                                                {sub.daysLeft} Hari Tersisa
                                            </span>
                                        )}
                                        <span className="text-[10px] text-[#A0A0B2]">
                                            Status: {sub.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
