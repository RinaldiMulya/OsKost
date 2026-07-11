import { RecentActivity } from "./dashboard-service";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { 
    CheckCircle2, 
    UserPlus, 
    AlertTriangle, 
    Clock, 
    Wrench 
} from "lucide-react";

export function RecentActivities({ activities }: { activities: RecentActivity[] }) {
    if (activities.length === 0) {
        return (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                <p>Belum ada aktivitas tercatat.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {activities.map((activity) => {
                let Icon = Clock;
                let iconColor = "text-zinc-500 bg-zinc-800/50";
                
                if (activity.type === "PAYMENT") {
                    Icon = CheckCircle2;
                    iconColor = "text-emerald-500 bg-emerald-500/10";
                } else if (activity.type === "NEW_TENANT") {
                    Icon = UserPlus;
                    iconColor = "text-blue-500 bg-blue-500/10";
                } else if (activity.type === "REPORT") {
                    Icon = activity.status === "OPEN" ? AlertTriangle : Wrench;
                    iconColor = activity.status === "OPEN" ? "text-amber-500 bg-amber-500/10" : "text-zinc-400 bg-zinc-800";
                }

                return (
                    <div key={activity.id} className="flex items-start gap-4">
                        <div className={`p-2 rounded-full mt-0.5 ${iconColor}`}>
                            <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-white">{activity.title}</p>
                                <span className="text-xs text-zinc-500">
                                    {formatDistanceToNow(activity.date, { addSuffix: true, locale: localeId })}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-400">{activity.description}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
