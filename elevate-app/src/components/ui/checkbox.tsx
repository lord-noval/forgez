"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "card";
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, variant = "default", id, ...props }, ref) => {
    const checkboxId = id || React.useId();
    const isChecked = props.checked;

    if (variant === "card") {
      return (
        <label
          htmlFor={checkboxId}
          className={cn(
            "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200",
            isChecked
              ? "border-[var(--primary)] bg-[var(--primary-muted)]"
              : "border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--border-hover)]",
            props.disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          <CheckboxInput
            ref={ref}
            id={checkboxId}
            checked={isChecked}
            {...props}
          />
          {(label || description) && (
            <div className="flex-1 min-w-0">
              {label && (
                <span className="block font-medium text-[var(--foreground)]">
                  {label}
                </span>
              )}
              {description && (
                <span className="block text-xs text-[var(--foreground-muted)] mt-0.5">
                  {description}
                </span>
              )}
            </div>
          )}
        </label>
      );
    }

    // Default inline variant - wrap everything in a label for clickability
    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          "flex items-start gap-3 cursor-pointer select-none",
          props.disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <CheckboxInput
          ref={ref}
          id={checkboxId}
          checked={isChecked}
          {...props}
        />
        {(label || description) && (
          <div className="flex-1 min-w-0">
            {label && (
              <span className="block font-medium text-[var(--foreground)]">
                {label}
              </span>
            )}
            {description && (
              <span className="block text-xs text-[var(--foreground-muted)] mt-0.5">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

// Internal checkbox input component
interface CheckboxInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

const CheckboxInput = React.forwardRef<HTMLInputElement, CheckboxInputProps>(
  ({ className, checked, ...props }, ref) => {
    return (
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          className="sr-only peer"
          {...props}
        />
        <motion.div
          className={cn(
            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors duration-200",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--primary)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--background)]",
            "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
            checked
              ? "bg-[var(--primary)] border-[var(--primary)]"
              : "bg-[var(--background-tertiary)] border-[var(--border)] hover:border-[var(--primary)]",
            className
          )}
          initial={false}
          animate={{
            scale: checked ? [1, 1.1, 1] : 1,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <AnimatePresence mode="wait">
            {checked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }
);
CheckboxInput.displayName = "CheckboxInput";

export { Checkbox };
