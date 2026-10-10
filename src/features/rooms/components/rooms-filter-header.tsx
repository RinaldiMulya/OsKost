"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";

interface RoomsFilterHeaderProps {
  types: string[];
  initialSearch?: string;
  initialStatus?: string;
  initialType?: string;
}

export function RoomsFilterHeader({
  types,
  initialSearch = "",
  initialStatus = "ALL",
  initialType = "ALL",
}: RoomsFilterHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  const [searchTerm, setSearchTerm] = React.useState(initialSearch);

  // Sync state if initialSearch changes
  React.useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  // Debounced search effect
  React.useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (searchTerm === currentSearch) {
      return;
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) {
        params.set("search", searchTerm);
      } else {
        params.delete("search");
      }
      params.delete("page"); // Reset page on search

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, pathname, router, searchParams]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset page on filter change

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between w-full">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#4A453F]" />
        <Input
          placeholder="Cari kamar (contoh: A101)..."
          className="pl-10 h-11 bg-white border-[#2C2825]/15 focus-visible:ring-[#8C6239] text-[#1E1B18] placeholder:text-[#82756A] text-sm w-full rounded-xl transition-all font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {isPending && (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 animate-spin text-[#8C6239]" />
        )}
      </div>

      {/* Select Filters */}
      <div className="grid grid-cols-2 md:flex md:flex-row items-center gap-3 w-full md:w-auto">
        <Select
          value={initialType}
          onValueChange={(val) => handleFilterChange("type", val)}
        >
          <SelectTrigger className="w-full md:w-[150px] h-11 bg-white border-[#2C2825]/15 text-[#1E1B18] font-semibold text-sm focus:ring-[#8C6239] rounded-xl">
            <SelectValue placeholder="Semua Tipe" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#2C2825]/15 text-[#1E1B18] rounded-xl shadow-lg">
            <SelectItem
              value="ALL"
              className="focus:bg-[#F2EDE9] focus:text-[#1E1B18] text-[#1E1B18] font-medium text-sm cursor-pointer"
            >
              Semua Tipe
            </SelectItem>
            {types.map((type) => (
              <SelectItem
                key={type}
                value={type}
                className="focus:bg-[#F2EDE9] focus:text-[#1E1B18] text-[#1E1B18] font-medium text-sm cursor-pointer"
              >
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={initialStatus}
          onValueChange={(val) => handleFilterChange("status", val)}
        >
          <SelectTrigger className="w-full md:w-[150px] h-11 bg-white border-[#2C2825]/15 text-[#1E1B18] font-semibold text-sm focus:ring-[#8C6239] rounded-xl">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#2C2825]/15 text-[#1E1B18] rounded-xl shadow-lg">
            <SelectItem
              value="ALL"
              className="focus:bg-[#F2EDE9] focus:text-[#1E1B18] text-[#1E1B18] font-medium text-sm cursor-pointer"
            >
              Semua Status
            </SelectItem>
            <SelectItem
              value="AVAILABLE"
              className="focus:bg-[#F2EDE9] focus:text-[#1E1B18] text-[#1E1B18] font-medium text-sm cursor-pointer"
            >
              Tersedia
            </SelectItem>
            <SelectItem
              value="OCCUPIED"
              className="focus:bg-[#F2EDE9] focus:text-[#1E1B18] text-[#1E1B18] font-medium text-sm cursor-pointer"
            >
              Terisi
            </SelectItem>
            <SelectItem
              value="MAINTENANCE"
              className="focus:bg-[#F2EDE9] focus:text-[#1E1B18] text-[#1E1B18] font-medium text-sm cursor-pointer"
            >
              Maintenance
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
