"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface MrrGrowthChartProps {
    data: {
        month: string;
        mrr: number;
        owners: number;
    }[];
}

export function MrrGrowthChart({ data }: MrrGrowthChartProps) {
    const formatRupiah = (val: number) => {
        if (val >= 1000000) {
            return `Rp ${(val / 1000000).toFixed(1)} jt`;
        }
        return `Rp ${(val / 1000).toFixed(0)} rb`;
    };

    return (
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8E2DA] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-base font-bold text-[#1A1A2E]">
                        Pertumbuhan MRR & Platform SaaS
                    </h3>
                    <p className="text-xs text-[#7A7A7A] mt-0.5">
                        Tren akumulasi recurring revenue 6 bulan terakhir
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-[#8C6239]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#8C6239]" />
                        MRR
                    </span>
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8C6239" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#8C6239" stopOpacity={0.0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE1" vertical={false} />
                        <XAxis
                            dataKey="month"
                            stroke="#A0A0B2"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#A0A0B2"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={formatRupiah}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const item = payload[0].payload;
                                    return (
                                        <div className="bg-[#1A1A2E] text-white p-3 rounded-xl shadow-lg border border-[#25253D] text-xs space-y-1">
                                            <p className="font-semibold text-[#D4A843]">
                                                Bulan {item.month}
                                            </p>
                                            <p className="text-[#FAF7F2]">
                                                MRR:{" "}
                                                <span className="font-bold">
                                                    Rp {item.mrr.toLocaleString("id-ID")}
                                                </span>
                                            </p>
                                            <p className="text-[#A0A0B2]">
                                                Active Owners: {item.owners} kost
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="mrr"
                            stroke="#8C6239"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#mrrGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
