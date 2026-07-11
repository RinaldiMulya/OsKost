import { Skeleton } from "@/components/ui/skeleton";

export default function MarketingLoading() {
    return (
        <div className="min-h-screen bg-background pt-16 lg:pt-20">
            {/* Hero skeleton */}
            <div className="relative h-[80vh] w-full flex flex-col items-center justify-center space-y-4">
                <Skeleton className="h-12 w-3/4 max-w-2xl bg-zinc-800" />
                <Skeleton className="h-12 w-2/4 max-w-lg bg-zinc-800" />
                <Skeleton className="h-6 w-1/3 mt-8 bg-zinc-800" />
            </div>

            {/* Features skeleton */}
            <div className="container mx-auto px-4 py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-48 w-full bg-zinc-800 rounded-2xl" />
                    <Skeleton className="h-48 w-full bg-zinc-800 rounded-2xl" />
                    <Skeleton className="h-48 w-full bg-zinc-800 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
