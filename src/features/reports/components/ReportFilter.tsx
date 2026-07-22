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
    <div className="flex items-center gap-1.5 flex-wrap">
      {STATUS_OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          variant={activeStatus === opt.value ? "default" : "outline"}
          size="sm"
          onClick={() => handleStatusChange(opt.value)}
          className={`
            gap-1.5 text-xs font-medium transition-all
            ${activeStatus === opt.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/50"
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