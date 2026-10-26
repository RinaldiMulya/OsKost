import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";

interface TopOwnersWidgetProps {
    properties: {
        id: string;
        name: string;
        slug: string | null;
        ownerName: string;
        totalRooms: number;
        occupiedRooms: number;
        occupancyRate: number;
        planTier: string;
    }[];
}

export function TopOwnersWidget({ properties }: TopOwnersWidgetProps) {
    return (
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8E2DA] shadow-xs flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#5D6654]/15 text-[#5D6654] flex items-center justify-center">
                            <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-[#1A1A2E]">
                                Properti Unggulan Platform
                            </h3>
                            <p className="text-xs text-[#7A7A7A]">
                                Properti teratas berdasarkan kapasitas & tingkat okupansi
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/super-admin/owners"
                        className="text-xs font-semibold text-[#8C6239] hover:underline flex items-center gap-1"
                    >
                        <span>Daftar Properti</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="space-y-4">
                    {properties.map((prop) => (
                        <div key={prop.id} className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#1A1A2E]">
                                        {prop.name}
                                    </span>
                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#FAF7F2] border border-[#E8E2DA] text-[#5C564E]">
                                        Tier: {prop.planTier}
                                    </span>
                                </div>
                                <span className="font-semibold text-[#5D6654]">
                                    {prop.occupiedRooms}/{prop.totalRooms} Kamar ({prop.occupancyRate}%)
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-2 rounded-full bg-[#FAF7F2] border border-[#F0EBE1] overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#8C6239] to-[#5D6654] transition-all duration-500"
                                    style={{ width: `${Math.min(100, prop.occupancyRate)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
