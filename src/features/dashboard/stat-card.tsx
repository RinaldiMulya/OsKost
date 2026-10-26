import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  icon: LucideIcon;
  /** "default" = green accent, "danger" = high-contrast red for urgency */
  variant?: "default" | "danger" | "warning" | "muted";
}

const variantStyles = {
  default: {
    iconBg: "bg-[#2C4C3B]/10",
    iconColor: "text-[#2C4C3B]",
    valueColor: "text-[#1E1B18]",
  },
  danger: {
    // High contrast red — "mata orang tua butuh bantuan visual yang tegas"
    iconBg: "bg-red-500/10",
    iconColor: "text-red-600",
    valueColor: "text-red-600",
  },
  warning: {
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-700",
    valueColor: "text-amber-800",
  },
  muted: {
    iconBg: "bg-[#F4EDE4]",
    iconColor: "text-[#5C564E]",
    valueColor: "text-[#1E1B18]",
  },
} as const;

export function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
  variant = "default",
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className="border-2 border-[#2C2825]/12 bg-[#FFFFFF] shadow-[0_2px_12px_rgba(44,40,37,0.04)] rounded-2xl transition-all duration-200 hover:border-[#2C2825]/22 hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-[#2C2825]/8 shadow-2xs ${styles.iconBg}`}
        >
          <Icon className={`h-6 w-6 ${styles.iconColor}`} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#5C564E] truncate">
            {label}
          </p>
          <p
            className={`text-3xl font-extrabold tracking-tight ${styles.valueColor}`}
          >
            {value}
            {suffix && (
              <span className="text-xl ml-1 font-semibold opacity-75">
                {suffix}
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
