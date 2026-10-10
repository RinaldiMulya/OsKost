"use client";

import { Label, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { PaymentStatusChartItem } from "@/features/dashboard/dashboard-service";

interface PaymentStatusChartProps {
  data: PaymentStatusChartItem[];
}

const chartConfig = {
  count: {
    label: "Tagihan",
  },
  Lunas: {
    label: "Lunas",
    color: "var(--chart-1)",
  },
  Menunggu: {
    label: "Menunggu",
    color: "var(--chart-4)",
  },
  "Belum Bayar": {
    label: "Belum Bayar",
    color: "var(--chart-2)",
  },
  Overdue: {
    label: "Overdue",
    color: "var(--chart-5)",
  },
  Dibatalkan: {
    label: "Dibatalkan",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

/**
 * Donut chart untuk status pembayaran tagihan bulan berjalan.
 * Menampilkan distribusi Lunas, Menunggu, Belum Bayar, Overdue.
 */
export function PaymentStatusChart({ data }: PaymentStatusChartProps) {
  const totalInvoices = data.reduce((acc, item) => acc + item.count, 0);

  return (
    <ChartContainer config={chartConfig} className="mx-auto h-[280px] w-full">
      <PieChart>
        <ChartTooltip
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          innerRadius={70}
          outerRadius={100}
          strokeWidth={3}
          stroke="var(--background)"
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-[#1E1B18] text-3xl font-extrabold"
                    >
                      {totalInvoices}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-[#4A453F] text-sm font-bold"
                    >
                      Tagihan
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="status" />}
          className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
}
