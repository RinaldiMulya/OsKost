import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
    return (
        <div className="space-y-8">
            <div>
                <Skeleton className="h-8 w-64 bg-zinc-800 mb-2" />
                <Skeleton className="h-4 w-96 bg-zinc-800" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 w-full bg-zinc-800 rounded-xl" />
                ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full bg-zinc-800 rounded-xl" />
                ))}
            </div>

            <Skeleton className="h-48 w-full bg-zinc-800 rounded-xl" />
        </div>
    );
}
