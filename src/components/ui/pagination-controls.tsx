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

  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="px-5 py-3.5 border-t border-[#2C2825]/10 bg-[#FAF8F5]/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
      <span className="text-[#5C564E] font-medium text-xs sm:text-sm">
        Menampilkan{" "}
        <strong className="font-bold text-[#1E1B18]">
          {startItem} - {endItem}
        </strong>{" "}
        dari{" "}
        <strong className="font-bold text-[#1E1B18]">{totalCount}</strong>{" "}
        data
      </span>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleNavigate(currentPage - 1)}
            disabled={currentPage <= 1}
            className="inline-flex items-center justify-center size-8 rounded-xl border border-[#2C2825]/15 bg-white text-[#4A453F] shadow-2xs transition-all hover:bg-[#FAF2EA] hover:border-[#714A23]/40 hover:text-[#714A23] active:scale-95 disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="size-4" />
          </button>

          <span className="px-2.5 py-1 text-xs font-bold text-[#1E1B18] bg-white border border-[#2C2825]/10 rounded-lg shadow-2xs select-none">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => handleNavigate(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center justify-center size-8 rounded-xl border border-[#2C2825]/15 bg-white text-[#4A453F] shadow-2xs transition-all hover:bg-[#FAF2EA] hover:border-[#714A23]/40 hover:text-[#714A23] active:scale-95 disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
            aria-label="Halaman berikutnya"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
