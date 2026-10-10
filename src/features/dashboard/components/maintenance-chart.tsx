"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { MaintenanceChartItem } from "@/features/dashboard/dashboard-service";

interface MaintenanceChartProps {
  data: MaintenanceChartItem[];
}

const chartConfig = {
  open: {
    label: "Baru/Open",
    color: "var(--chart-5)",
  },
  inProgress: {
    label: "Proses",
    color: "var(--chart-4)",
  },
  resolved: {
    label: "Selesai",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

/**
 * Stacked Area chart untuk tren laporan kerusakan 6 bulan terakhir.
 * Menampilkan jumlah laporan per bulan dikelompokkan berdasarkan status.
 */
export function MaintenanceChart({ data }: MaintenanceChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <AreaChart
        data={data}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(44, 40, 37, 0.08)" />
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
          allowDecimals={false}
          tick={{ fill: "#4A453F", fontWeight: 600 }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <defs>
          <linearGradient id="fillOpen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-5)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--chart-5)" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="fillInProgress" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-4)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--chart-4)" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="fillResolved" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <Area
          dataKey="resolved"
          type="natural"
          fill="url(#fillResolved)"
          stroke="var(--chart-1)"
          stackId="a"
        />
        <Area
          dataKey="inProgress"
          type="natural"
          fill="url(#fillInProgress)"
          stroke="var(--chart-4)"
          stackId="a"
        />
        <Area
          dataKey="open"
          type="natural"
          fill="url(#fillOpen)"
          stroke="var(--chart-5)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}
