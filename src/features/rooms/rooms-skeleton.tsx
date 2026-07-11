import React from "react";

/**
 * Skeleton loader for a single Room Card to prevent layout shift.
 */
function RoomCardSkeleton() {
    return (
        <div className="block cursor-pointer">
            {/* Image Container with offset effect skeleton */}
            <div className="relative mb-6">
                {/* Offset layer skeleton */}
                <div className="absolute inset-0 translate-x-2 translate-y-2 bg-muted/50 animate-pulse" />

                {/* Main image card skeleton */}
                <div className="relative overflow-hidden border-4 border-transparent bg-muted animate-pulse">
                    <div className="relative aspect-[9/10] overflow-hidden" />
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="px-1">
                <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="w-full">
                        <div className="h-6 w-3/4 bg-muted animate-pulse mb-2" />
                        <div className="h-4 w-1/2 bg-muted animate-pulse mt-1" />
                    </div>
                    <div className="text-right shrink-0">
                        <div className="h-3 w-16 bg-muted animate-pulse ml-auto mb-1" />
                        <div className="h-8 w-24 bg-muted animate-pulse mt-1" />
                    </div>
                </div>

                {/* Tags Skeleton */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <div className="h-6 w-16 bg-muted animate-pulse border border-transparent" />
                    <div className="h-6 w-20 bg-muted animate-pulse border border-transparent" />
                </div>
            </div>
        </div>
    );
}

/**
 * Skeleton loader for the entire Rooms Section.
 * This structure explicitly mimics `rooms-section.tsx`.
 */
export function RoomsSkeleton() {
    // Generate 6 skeleton cards by default based on `take: 6` in room-service
    const skeletonCards = Array.from({ length: 6 });

    return (
        <section id="rooms" className="py-20 lg:py-32 bg-foreground">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Section Header */}
                <div className="flex items-center gap-4 mb-12 lg:mb-16">
                    <div className="w-1 h-10 bg-primary/50 rounded-full animate-pulse" />
                    <div className="h-10 w-64 bg-primary/20 animate-pulse rounded-md" />
                </div>

                {/* Room Cards Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {skeletonCards.map((_, i) => (
                        <RoomCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
