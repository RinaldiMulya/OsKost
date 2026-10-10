"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { RevenueChartItem } from "@/features/dashboard/dashboard-service";

interface RevenueChartProps {
  data: RevenueChartItem[];
}

const chartConfig = {
  amount: {
    label: "Pendapatan",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

/**
 * Grafik batang pendapatan bulanan (6 bulan terakhir).
 * Menampilkan total invoice PAID per bulan dalam format Rupiah.
 */
export function RevenueChart({ data }: RevenueChartProps) {
  // Format Rupiah singkat: 1.500.000 → 1,5jt
  const formatRupiah = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
    return value.toString();
  };

  // Format Rupiah penuh untuk tooltip
  const formatRupiahFull = (value: number) => {
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  return (
    <ChartContainer
      config={chartConfig}
      className="h-[280px] w-full rounded-xl"
    >
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          stroke="rgba(44, 40, 37, 0.08)"
        />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={13}
          tick={{ fill: "#4A453F", fontWeight: 600 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={13}
          tickFormatter={formatRupiah}
          tick={{ fill: "#4A453F", fontWeight: 600 }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatRupiahFull(value as number)}
            />
          }
        />
        <Bar dataKey="amount" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
