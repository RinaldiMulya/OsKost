"use client";

import { Label, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { OccupancyChartItem } from "@/features/dashboard/dashboard-service";

interface OccupancyChartProps {
  data: OccupancyChartItem[];
}

const chartConfig = {
  count: {
    label: "Kamar",
  },
  Terisi: {
    label: "Terisi",
    color: "var(--chart-1)",
  },
  Kosong: {
    label: "Kosong",
    color: "var(--chart-2)",
  },
  Maintenance: {
    label: "Maintenance",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

/**
 * Donut chart untuk rasio okupansi kamar.
 * Menampilkan jumlah kamar terisi, kosong, dan maintenance
 * dengan angka total di tengah donut.
 */
export function OccupancyChart({ data }: OccupancyChartProps) {
  const totalRooms = data.reduce((acc, item) => acc + item.count, 0);

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
                      className="fill-foreground text-3xl font-bold"
                    >
                      {totalRooms}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground text-sm"
                    >
                      Kamar
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
