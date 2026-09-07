"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
  checked?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
    return (
      <div className="relative inline-flex items-center justify-center">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={(e) => {
            onChange?.(e);
            onCheckedChange?.(e.target.checked);
          }}
          className={cn(
            "peer size-4 shrink-0 rounded border border-zinc-700 bg-zinc-900 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none checked:bg-amber-500 checked:border-amber-500 cursor-pointer transition-colors",
            className
          )}
          {...props}
        />
        <Check className="pointer-events-none absolute size-3 stroke-[3] text-zinc-950 opacity-0 peer-checked:opacity-100 transition-opacity" />
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
