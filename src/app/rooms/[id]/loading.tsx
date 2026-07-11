import { Skeleton } from "@/components/ui/skeleton";

export default function RoomDetailLoading() {
    return (
        <div className="min-h-screen bg-[#0a0f0a] relative">
            <main className="relative z-10 max-w-6xl mx-auto px-4 pb-8 pt-4 lg:pt-6">
                {/* Hero image skeleton */}
                <Skeleton className="h-[65svh] lg:h-auto lg:aspect-video w-full rounded-2xl bg-zinc-800 mb-6" />

                {/* Gallery skeleton */}
                <div className="mb-6 lg:mb-8">
                    <Skeleton className="h-4 w-40 bg-zinc-800 mb-3" />
                    <div className="flex gap-2 lg:gap-4 overflow-hidden">
                        <Skeleton className="w-[35vw] h-[20svh] lg:w-56 lg:h-36 rounded-xl bg-zinc-800 flex-shrink-0" />
                        <Skeleton className="w-[35vw] h-[20svh] lg:w-56 lg:h-36 rounded-xl bg-zinc-800 flex-shrink-0" />
                        <Skeleton className="w-[35vw] h-[20svh] lg:w-56 lg:h-36 rounded-xl bg-zinc-800 flex-shrink-0" />
                    </div>
                </div>

                {/* Info skeleton */}
                <div className="space-y-4 mb-8">
                    <Skeleton className="h-6 w-24 bg-zinc-800" />
                    <div className="flex justify-between items-end gap-4">
                        <Skeleton className="h-12 w-64 bg-zinc-800" />
                        <Skeleton className="h-10 w-32 bg-zinc-800 rounded-xl" />
                    </div>
                </div>

                {/* Facilities skeleton */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <Skeleton key={i} className="h-24 w-full bg-zinc-800 rounded-xl" />
                    ))}
                </div>
            </main>
        </div>
    );
}
