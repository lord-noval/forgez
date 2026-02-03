"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  label?: string;
  max?: string;
  min?: string;
}

export function DateInput({
  value,
  onChange,
  error,
  label,
  max,
  min,
  className,
  disabled,
  ...props
}: DateInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // Calculate max date for 13+ age requirement
  const getMaxDateFor13Years = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 13);
    return date.toISOString().split("T")[0];
  };

  const effectiveMax = max || getMaxDateFor13Years();

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--foreground-subtle)] pointer-events-none" />
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={handleChange}
          max={effectiveMax}
          min={min}
          disabled={disabled}
          className={cn(
            "w-full h-12 pl-11 pr-4 rounded-lg border bg-[var(--background-secondary)]",
            "text-[var(--foreground)] text-base",
            "focus:outline-none focus:border-[var(--primary)]",
            "transition-colors duration-200",
            "appearance-none",
            // Style the calendar icon/picker
            "[&::-webkit-calendar-picker-indicator]:opacity-0",
            "[&::-webkit-calendar-picker-indicator]:absolute",
            "[&::-webkit-calendar-picker-indicator]:inset-0",
            "[&::-webkit-calendar-picker-indicator]:w-full",
            "[&::-webkit-calendar-picker-indicator]:h-full",
            "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
            error
              ? "border-[var(--danger)] focus:border-[var(--danger)]"
              : "border-[var(--border)] hover:border-[var(--border-hover)]",
            disabled && "opacity-50 cursor-not-allowed",
            // Placeholder styling when empty
            !value && "text-[var(--foreground-subtle)]"
          )}
          {...props}
        />
      </div>
    </div>
  );
}
