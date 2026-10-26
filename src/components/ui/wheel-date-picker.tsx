"use client";

import * as React from "react";
import { format, isValid, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  X,
  Check,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const ITEM_HEIGHT = 40;
const VISIBLE_COUNT = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT; // 200px
const PADDING_Y = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2; // 80px

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

interface WheelColumnProps {
  items: { label: string; value: number }[];
  selectedValue: number;
  onValueChange: (val: number) => void;
  className?: string;
  label?: string;
}

function WheelColumn({
  items,
  selectedValue,
  onValueChange,
  className,
  label,
}: WheelColumnProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isScrollingRef = React.useRef(false);
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Sync scroll position with selectedValue
  React.useEffect(() => {
    const targetIndex = items.findIndex((it) => it.value === selectedValue);
    if (targetIndex >= 0 && containerRef.current && !isScrollingRef.current) {
      containerRef.current.scrollTop = targetIndex * ITEM_HEIGHT;
    }
  }, [selectedValue, items]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    isScrollingRef.current = true;
    const top = e.currentTarget.scrollTop;
    const index = Math.round(top / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, index));

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      if (items[clampedIndex] && items[clampedIndex].value !== selectedValue) {
        onValueChange(items[clampedIndex].value);
      }
    }, 90);
  };

  const handleItemClick = (index: number, val: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: "smooth",
      });
    }
    onValueChange(val);
  };

  return (
    <div className={cn("relative flex-1 select-none flex flex-col", className)}>
      {label && (
        <span className="text-[10px] uppercase font-bold text-[#7A7A7A] tracking-wider text-center mb-1">
          {label}
        </span>
      )}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{ height: CONTAINER_HEIGHT }}
        className="overflow-y-auto no-scrollbar scroll-smooth snap-y snap-mandatory relative z-10"
      >
        <div style={{ height: PADDING_Y }} aria-hidden="true" />
        {items.map((item, idx) => {
          const isSelected = item.value === selectedValue;
          return (
            <div
              key={item.value}
              onClick={() => handleItemClick(idx, item.value)}
              style={{ height: ITEM_HEIGHT }}
              className={cn(
                "snap-center flex items-center justify-center text-sm transition-all duration-150 cursor-pointer px-1 rounded-md",
                isSelected
                  ? "font-extrabold text-[#714A23] text-base scale-105"
                  : "text-[#2C2825]/50 hover:text-[#2C2825] font-medium scale-95 opacity-70"
              )}
            >
              {item.label}
            </div>
          );
        })}
        <div style={{ height: PADDING_Y }} aria-hidden="true" />
      </div>
    </div>
  );
}

export interface WheelDatePickerProps {
  value?: string; // Format: YYYY-MM-DD
  onChange?: (dateStr: string) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  label?: string;
  allowClear?: boolean;
  minYear?: number;
  maxYear?: number;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function WheelDatePicker({
  value,
  onChange,
  id,
  name,
  placeholder = "Pilih tanggal...",
  allowClear = false,
  minYear = 2024,
  maxYear = 2035,
  disabled = false,
  required = false,
  className,
}: WheelDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parsing initial / controlled value
  const initialDate = React.useMemo(() => {
    if (value && value.trim()) {
      const parsed = parseISO(value);
      if (isValid(parsed)) return parsed;
    }
    return new Date();
  }, [value]);

  const [selectedYear, setSelectedYear] = React.useState<number>(
    initialDate.getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = React.useState<number>(
    initialDate.getMonth() + 1
  ); // 1-12
  const [selectedDay, setSelectedDay] = React.useState<number>(
    initialDate.getDate()
  );

  // Sync internal roller state when value prop changes externally
  React.useEffect(() => {
    if (value && value.trim()) {
      const parsed = parseISO(value);
      if (isValid(parsed)) {
        setSelectedYear(parsed.getFullYear());
        setSelectedMonth(parsed.getMonth() + 1);
        setSelectedDay(parsed.getDate());
      }
    }
  }, [value]);

  // Hitung jumlah hari di bulan dan tahun terpilih
  const daysInMonth = React.useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Pastikan day tidak melebihi daysInMonth (contoh: 31 Feb -> 28/29 Feb)
  React.useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [daysInMonth, selectedDay]);

  // List data untuk kolom roll
  const daysList = React.useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => ({
      label: String(i + 1).padStart(2, "0"),
      value: i + 1,
    }));
  }, [daysInMonth]);

  const monthsList = React.useMemo(() => {
    return MONTH_NAMES.map((m, idx) => ({
      label: m,
      value: idx + 1,
    }));
  }, []);

  const yearsList = React.useMemo(() => {
    const list = [];
    for (let y = minYear; y <= maxYear; y++) {
      list.push({ label: String(y), value: y });
    }
    return list;
  }, [minYear, maxYear]);

  // Format string YYYY-MM-DD
  const formatCurrentDateString = (y: number, m: number, d: number) => {
    const safeDay = Math.min(d, new Date(y, m, 0).getDate());
    return `${y}-${String(m).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
  };

  const handleApply = () => {
    const dateStr = formatCurrentDateString(
      selectedYear,
      selectedMonth,
      selectedDay
    );
    onChange?.(dateStr);
    setOpen(false);
  };

  const handleQuickToday = () => {
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth() + 1);
    setSelectedDay(now.getDate());
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("");
  };

  // Human readable display
  const displayText = React.useMemo(() => {
    if (!value || !value.trim()) return "";
    const parsed = parseISO(value);
    if (!isValid(parsed)) return "";
    return format(parsed, "d MMMM yyyy", { locale: localeId });
  }, [value]);

  return (
    <div className={cn("relative w-full", className)}>
      {/* Hidden input for FormData standard compatibility */}
      {name && (
        <input
          type="hidden"
          name={name}
          id={id}
          value={value || ""}
          required={required}
        />
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <button
            type="button"
            className={cn(
              "w-full h-11 px-4 rounded-xl border-2 transition-all duration-150 flex items-center justify-between gap-3 text-left shadow-2xs group focus:outline-none focus:ring-2 focus:ring-[#714A23]/25",
              displayText
                ? "bg-white border-[#2C2825]/14 text-[#1E1B18] hover:border-[#714A23]/40"
                : "bg-white/80 border-dashed border-[#2C2825]/20 text-[#7A7A7A] hover:border-[#714A23]/40"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <CalendarIcon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  displayText ? "text-[#714A23]" : "text-[#7A7A7A] group-hover:text-[#714A23]"
                )}
              />
              <span className="truncate text-sm font-semibold">
                {displayText || placeholder}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {allowClear && displayText && !disabled && (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={handleClear}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleClear(e as any);
                    }
                  }}
                  className="size-6 rounded-full hover:bg-[#2C2825]/8 flex items-center justify-center text-[#7A7A7A] hover:text-[#1E1B18] transition-colors"
                  title="Hapus tanggal"
                >
                  <X className="size-3.5" />
                </div>
              )}
              <ChevronDown className="size-4 text-[#7A7A7A] group-hover:text-[#1E1B18] transition-transform duration-200" />
            </div>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-[340px] sm:w-[360px] p-0 rounded-2xl border-2 border-[#2C2825]/15 bg-[#FAF8F5] shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 text-[#1E1B18]"
        >
          {/* Header Popover */}
          <div className="px-4 py-3 bg-white border-b-2 border-[#2C2825]/8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#FAF2EA] border border-[#714A23]/20 text-[#714A23]">
                <CalendarIcon className="size-3.5" />
              </div>
              <span className="text-xs font-bold text-[#1E1B18]">
                Pilih Tanggal (Roll)
              </span>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleQuickToday}
              className="h-7 px-2.5 rounded-lg text-[11px] font-bold text-[#714A23] hover:bg-[#FAF2EA] border border-[#714A23]/15"
            >
              <RotateCcw className="size-3 mr-1" /> Hari Ini
            </Button>
          </div>

          {/* Roll Drum Picker Wheel Container */}
          <div className="relative p-4 bg-[#FAF8F5]">
            {/* Center Active Highlight Lens Lens Overlay */}
            <div
              style={{
                top: `calc(${PADDING_Y}px + 16px)`,
                height: ITEM_HEIGHT,
              }}
              className="pointer-events-none absolute left-4 right-4 z-0 rounded-xl bg-[#FAF2EA] border-y-2 border-[#714A23]/30 shadow-2xs"
            />

            {/* Fading Vignette Gradient Overlay (Atas & Bawah) */}
            <div className="pointer-events-none absolute inset-x-4 top-4 h-14 bg-gradient-to-b from-[#FAF8F5] via-[#FAF8F5]/80 to-transparent z-20" />
            <div className="pointer-events-none absolute inset-x-4 bottom-4 h-14 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/80 to-transparent z-20" />

            {/* 3 Drum Columns: Tanggal | Bulan | Tahun */}
            <div className="flex items-center gap-1.5 relative z-10">
              <WheelColumn
                label="Tgl"
                items={daysList}
                selectedValue={selectedDay}
                onValueChange={setSelectedDay}
                className="w-16"
              />
              <WheelColumn
                label="Bulan"
                items={monthsList}
                selectedValue={selectedMonth}
                onValueChange={setSelectedMonth}
                className="flex-2"
              />
              <WheelColumn
                label="Tahun"
                items={yearsList}
                selectedValue={selectedYear}
                onValueChange={setSelectedYear}
                className="w-20"
              />
            </div>
          </div>

          {/* Footer Preview & Action */}
          <div className="p-3 bg-white border-t-2 border-[#2C2825]/8 flex items-center justify-between gap-2">
            <div className="text-left pl-1">
              <span className="text-[10px] text-[#7A7A7A] block font-medium">
                Tanggal Terpilih:
              </span>
              <span className="text-xs font-bold text-[#714A23] truncate block">
                {format(
                  new Date(selectedYear, selectedMonth - 1, selectedDay),
                  "EEEE, d MMMM yyyy",
                  { locale: localeId }
                )}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-8 px-3 rounded-lg text-xs font-semibold text-[#7A7A7A] hover:bg-[#FAF8F5]"
              >
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApply}
                className="h-8 px-3.5 rounded-lg text-xs font-bold bg-[#714A23] hover:bg-[#5C3B1B] text-white shadow-xs"
              >
                <Check className="size-3.5 mr-1" /> Terapkan
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
