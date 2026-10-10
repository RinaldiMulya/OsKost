"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, CheckCircle2, ListFilter } from "lucide-react";

type FilterStatus = "ALL" | "OPEN" | "IN_PROGRESS" | "RESOLVED";

const STATUS_OPTIONS: { value: FilterStatus; label: string; icon: React.ReactNode }[] = [
  {
    value: "ALL",
    label: "Semua",
    icon: <ListFilter className="h-3.5 w-3.5" />,
  },
  {
    value: "OPEN",
    label: "Terbuka",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  {
    value: "IN_PROGRESS",
    label: "Diproses",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  {
    value: "RESOLVED",
    label: "Selesai",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
];

export function ReportFilter({
  onStatusChange,
}: {
  onStatusChange: (status: FilterStatus) => void;
}) {
  const [activeStatus, setActiveStatus] = useState<FilterStatus>("ALL");

  const handleStatusChange = (status: FilterStatus) => {
    setActiveStatus(status);
    onStatusChange(status);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {STATUS_OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          variant={activeStatus === opt.value ? "default" : "outline"}
          size="sm"
          onClick={() => handleStatusChange(opt.value)}
          className={`
            gap-1.5 text-xs font-bold transition-all h-9 px-3.5 rounded-xl
            ${activeStatus === opt.value
              ? "bg-[#714A23] text-white hover:bg-[#5C3B1A] shadow-sm"
              : "border-[#2C2825]/15 bg-white text-[#4A453F] hover:text-[#1E1B18] hover:bg-[#F2EDE9]"
            }
          `}
        >
          {opt.icon}
          {opt.label}
        </Button>
      ))}
    </div>
  );
}