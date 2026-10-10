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
            <div className="flex items-center justify-center py-12 text-[#4A453F] text-base font-medium">
                <p>Belum ada aktivitas tercatat.</p>
            </div>
        );
    }

    return (
        <div
            className="max-h-[400px] overflow-y-auto space-y-5 pr-2"
            style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#d4c3b7 transparent",
            }}
        >
            {activities.map((activity) => {
                let Icon = Clock;
                let iconColor = "text-[#714A23] bg-[#F2EDE9] border border-[#714A23]/15";
                
                if (activity.type === "PAYMENT") {
                    Icon = CheckCircle2;
                    iconColor = "text-emerald-700 bg-emerald-50 border border-emerald-200";
                } else if (activity.type === "NEW_TENANT") {
                    Icon = UserPlus;
                    iconColor = "text-blue-700 bg-blue-50 border border-blue-200";
                } else if (activity.type === "REPORT") {
                    Icon = activity.status === "OPEN" ? AlertTriangle : Wrench;
                    iconColor = activity.status === "OPEN" 
                        ? "text-amber-700 bg-amber-50 border border-amber-200" 
                        : "text-[#5D6654] bg-[#EFF2EC] border border-[#5D6654]/25";
                }

                return (
                    <div key={activity.id} className="flex items-start gap-3.5 p-2 rounded-xl hover:bg-[#F8F6F1] transition-colors">
                        <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${iconColor}`}>
                            <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm sm:text-base font-bold text-[#1E1B18] truncate">{activity.title}</p>
                                <span className="text-xs font-semibold text-[#8C6239] whitespace-nowrap">
                                    {formatDistanceToNow(activity.date, { addSuffix: true, locale: localeId })}
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-[#4A453F] font-medium leading-relaxed">{activity.description}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
