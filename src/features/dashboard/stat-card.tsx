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
        iconBg: "bg-secondary/10",
        iconColor: "text-secondary",
        valueColor: "text-white",
    },
    danger: {
        // High contrast red — "mata orang tua butuh bantuan visual yang tegas"
        iconBg: "bg-red-500/15",
        iconColor: "text-red-400",
        valueColor: "text-red-400",
    },
    warning: {
        iconBg: "bg-amber-500/15",
        iconColor: "text-amber-400",
        valueColor: "text-amber-400",
    },
    muted: {
        iconBg: "bg-muted/20",
        iconColor: "text-muted-foreground",
        valueColor: "text-muted-foreground",
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
        <Card className="border-zinc-800 bg-zinc-950/60 backdrop-blur-sm">
            <CardContent className="flex items-center gap-4 p-5">
                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${styles.iconBg}`}
                >
                    <Icon className={`h-6 w-6 ${styles.iconColor}`} />
                </div>
                <div className="min-w-0">
                    <p className="text-sm text-muted-foreground truncate">
                        {label}
                    </p>
                    <p className={`text-3xl font-bold tracking-tight ${styles.valueColor}`}>
                        {value}
                        {suffix && <span className="text-xl ml-1 opacity-70">{suffix}</span>}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
