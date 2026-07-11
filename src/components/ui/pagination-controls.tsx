"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalCount,
  limit,
}: PaginationControlsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handleNavigate = (page: number) => {
    router.push(createPageURL(page));
  };

  // Calculate item ranges
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  return (
    <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/30 flex justify-between items-center text-sm text-zinc-400">
      <span>
        Menampilkan {totalCount === 0 ? 0 : startItem} - {endItem} dari{" "}
        {totalCount} data
      </span>

      {totalCount > limit && (
        <div className="flex gap-2">
          <button
            onClick={() => handleNavigate(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 hover:bg-zinc-800/60 rounded-md disabled:opacity-50 transition-colors text-zinc-300 hover:text-white"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => handleNavigate(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 hover:bg-zinc-800/60 rounded-md disabled:opacity-50 transition-colors text-zinc-300 hover:text-white"
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
