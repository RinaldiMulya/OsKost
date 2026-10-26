import { LucideIcon } from "lucide-react";

interface MetricKpiCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    variant?: "default" | "terracotta" | "moss" | "gold";
}

export function MetricKpiCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    variant = "default",
}: MetricKpiCardProps) {
    const variantStyles = {
        default: {
            iconBg: "bg-[#8C6239]/10 text-[#8C6239] border-[#8C6239]/20",
            topAccent: "border-t-[#8C6239]",
        },
        terracotta: {
            iconBg: "bg-[#8C6239]/15 text-[#8C6239] border-[#8C6239]/30",
            topAccent: "border-t-[#8C6239]",
        },
        moss: {
            iconBg: "bg-[#5D6654]/15 text-[#5D6654] border-[#5D6654]/30",
            topAccent: "border-t-[#5D6654]",
        },
        gold: {
            iconBg: "bg-[#D4A843]/15 text-[#9E7822] border-[#D4A843]/30",
            topAccent: "border-t-[#D4A843]",
        },
    };

    const style = variantStyles[variant];

    return (
        <div
            className={`bg-[#FFFFFF] rounded-2xl p-6 border border-[#E8E2DA] border-t-4 ${style.topAccent} shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between`}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider">
                        {title}
                    </p>
                    <h3 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
                        {value}
                    </h3>
                </div>
                <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center border ${style.iconBg} shrink-0`}
                >
                    <Icon className="w-5 h-5" />
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex items-center justify-between text-xs">
                {subtitle && <span className="text-[#7A7A7A]">{subtitle}</span>}
                {trend && (
                    <span
                        className={`inline-flex items-center font-semibold px-2 py-0.5 rounded-full ${
                            trend.isPositive
                                ? "bg-[#4A7C59]/10 text-[#4A7C59]"
                                : "bg-[#C45B4B]/10 text-[#C45B4B]"
                        }`}
                    >
                        {trend.value}
                    </span>
                )}
            </div>
        </div>
    );
}
