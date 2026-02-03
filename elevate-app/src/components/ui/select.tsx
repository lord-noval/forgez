"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Select Context
// ============================================================================

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined);

function useSelectContext() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a Select");
  }
  return context;
}

// ============================================================================
// Select Root
// ============================================================================

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

function Select({ value: controlledValue, defaultValue = "", onValueChange, children }: SelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);

  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const handleValueChange = React.useCallback((newValue: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(newValue);
    }
    onValueChange?.(newValue);
    setOpen(false);
  }, [controlledValue, onValueChange]);

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

// ============================================================================
// Select Trigger
// ============================================================================

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  placeholder?: string;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, placeholder, children, ...props }, ref) => {
    const { value, open, setOpen } = useSelectContext();

    return (
      <button
        ref={ref}
        type="button"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg",
          "bg-[var(--background-tertiary)] border border-[var(--border)]",
          "px-3 py-2 text-sm",
          "placeholder:text-[var(--foreground-muted)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-colors",
          className
        )}
        {...props}
      >
        <span className={cn(!value && "text-[var(--foreground-muted)]")}>
          {children || (value ? value : placeholder)}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 text-[var(--foreground-muted)] transition-transform",
          open && "rotate-180"
        )} />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

// ============================================================================
// Select Value
// ============================================================================

interface SelectValueProps {
  placeholder?: string;
}

function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = useSelectContext();
  return <span>{value || placeholder}</span>;
}

// ============================================================================
// Select Content
// ============================================================================

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: "popper" | "item-aligned";
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, position = "popper", ...props }, ref) => {
    const { open, setOpen } = useSelectContext();
    const contentRef = React.useRef<HTMLDivElement>(null);

    // Close on click outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
          const trigger = contentRef.current.previousElementSibling;
          if (trigger && !trigger.contains(event.target as Node)) {
            setOpen(false);
          }
        }
      };

      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [open, setOpen]);

    if (!open) return null;

    return (
      <div
        ref={contentRef}
        className={cn(
          "absolute z-50 mt-1 w-full min-w-[8rem] overflow-hidden",
          "rounded-lg border border-[var(--border)]",
          "bg-[var(--background-secondary)] backdrop-blur-lg",
          "shadow-lg",
          "animate-in fade-in-0 zoom-in-95",
          className
        )}
        {...props}
      >
        <div className="p-1">
          {children}
        </div>
      </div>
    );
  }
);
SelectContent.displayName = "SelectContent";

// ============================================================================
// Select Item
// ============================================================================

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value: itemValue, disabled, ...props }, ref) => {
    const { value, onValueChange } = useSelectContext();
    const isSelected = value === itemValue;

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        aria-disabled={disabled}
        onClick={() => !disabled && onValueChange(itemValue)}
        className={cn(
          "relative flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm outline-none",
          "transition-colors",
          isSelected
            ? "bg-[var(--primary-muted)] text-[var(--primary)]"
            : "hover:bg-[var(--background-tertiary)]",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        {...props}
      >
        <span className="flex-1">{children}</span>
        {isSelected && (
          <Check className="w-4 h-4 ml-2" />
        )}
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

// ============================================================================
// Select Group & Label
// ============================================================================

const SelectGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("py-1", className)} {...props} />
  )
);
SelectGroup.displayName = "SelectGroup";

const SelectLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-2 py-1.5 text-xs font-semibold text-[var(--foreground-muted)]",
        className
      )}
      {...props}
    />
  )
);
SelectLabel.displayName = "SelectLabel";

// ============================================================================
// Select Separator
// ============================================================================

const SelectSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-[var(--border)]", className)}
      {...props}
    />
  )
);
SelectSeparator.displayName = "SelectSeparator";

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
};
