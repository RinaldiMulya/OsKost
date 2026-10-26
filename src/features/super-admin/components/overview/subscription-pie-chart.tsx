"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface SubscriptionPieChartProps {
    data: {
        tier: string;
        count: number;
        revenue: number;
        color: string;
    }[];
}

export function SubscriptionPieChart({ data }: SubscriptionPieChartProps) {
    const totalCount = data.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8E2DA] shadow-xs flex flex-col justify-between">
            <div className="mb-4">
                <h3 className="text-base font-bold text-[#1A1A2E]">
                    Distribusi Paket SaaS
                </h3>
                <p className="text-xs text-[#7A7A7A] mt-0.5">
                    Proporsi tier langganan pemilik kost aktif
                </p>
            </div>

            <div className="h-52 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data.filter((d) => d.count > 0)}
                            dataKey="count"
                            nameKey="tier"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={4}
                            cx="50%"
                            cy="50%"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    stroke="#FFFFFF"
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const item = payload[0].payload;
                                    return (
                                        <div className="bg-[#1A1A2E] text-white p-2.5 rounded-xl shadow-lg border border-[#25253D] text-xs">
                                            <p className="font-bold text-[#D4A843]">{item.tier}</p>
                                            <p>{item.count} Properti</p>
                                            <p className="text-[#8C6239] font-medium">
                                                Rp {item.revenue.toLocaleString("id-ID")}/bln
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center metric */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-[#1A1A2E]">
                        {totalCount}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-[#7A7A7A]">
                        Properti
                    </span>
                </div>
            </div>

            {/* Custom Legend */}
            <div className="mt-4 pt-3 border-t border-[#F0EBE1] grid grid-cols-2 gap-2 text-xs">
                {data.map((item) => (
                    <div key={item.tier} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-[#5C564E] font-medium">{item.tier}</span>
                        </div>
                        <span className="font-semibold text-[#1A1A2E]">{item.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
