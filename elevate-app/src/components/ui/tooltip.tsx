"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================================================
// Tooltip Context
// ============================================================================

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  delayDuration: number;
}

const TooltipContext = React.createContext<TooltipContextValue | undefined>(undefined);

function useTooltipContext() {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip components must be used within a TooltipProvider");
  }
  return context;
}

// ============================================================================
// Tooltip Provider (Root)
// ============================================================================

interface TooltipProviderProps {
  delayDuration?: number;
  children: React.ReactNode;
}

function TooltipProvider({ delayDuration = 300, children }: TooltipProviderProps) {
  return <>{children}</>;
}

// ============================================================================
// Tooltip Root
// ============================================================================

interface TooltipProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  children: React.ReactNode;
}

function Tooltip({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  delayDuration = 300,
  children,
}: TooltipProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);

  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [controlledOpen, onOpenChange]);

  return (
    <TooltipContext.Provider value={{ open, setOpen, delayDuration }}>
      <div className="relative inline-flex">
        {children}
      </div>
    </TooltipContext.Provider>
  );
}

// ============================================================================
// Tooltip Trigger
// ============================================================================

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const TooltipTrigger = React.forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ asChild, children, ...props }, ref) => {
    const { setOpen, delayDuration } = useTooltipContext();
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
      timeoutRef.current = setTimeout(() => setOpen(true), delayDuration);
    };

    const handleMouseLeave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setOpen(false);
    };

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    return (
      <div
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TooltipTrigger.displayName = "TooltipTrigger";

// ============================================================================
// Tooltip Content
// ============================================================================

type TooltipSide = "top" | "right" | "bottom" | "left";
type TooltipAlign = "start" | "center" | "end";

interface TooltipContentProps {
  side?: TooltipSide;
  align?: TooltipAlign;
  sideOffset?: number;
  className?: string;
  children?: React.ReactNode;
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, side = "top", align = "center", sideOffset = 4, children }, ref) => {
    const { open } = useTooltipContext();

    // Position classes based on side
    const positionClasses: Record<TooltipSide, string> = {
      top: `bottom-full mb-${sideOffset} left-1/2 -translate-x-1/2`,
      bottom: `top-full mt-${sideOffset} left-1/2 -translate-x-1/2`,
      left: `right-full mr-${sideOffset} top-1/2 -translate-y-1/2`,
      right: `left-full ml-${sideOffset} top-1/2 -translate-y-1/2`,
    };

    // Align adjustments
    const alignClasses: Record<TooltipAlign, Record<TooltipSide, string>> = {
      start: {
        top: "left-0 translate-x-0",
        bottom: "left-0 translate-x-0",
        left: "top-0 translate-y-0",
        right: "top-0 translate-y-0",
      },
      center: {
        top: "",
        bottom: "",
        left: "",
        right: "",
      },
      end: {
        top: "right-0 left-auto translate-x-0",
        bottom: "right-0 left-auto translate-x-0",
        left: "bottom-0 top-auto translate-y-0",
        right: "bottom-0 top-auto translate-y-0",
      },
    };

    // Animation offsets based on side
    const getAnimation = (s: TooltipSide) => {
      switch (s) {
        case "top":
          return { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 4 } };
        case "bottom":
          return { initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -4 } };
        case "left":
          return { initial: { opacity: 0, x: 4 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 4 } };
        case "right":
          return { initial: { opacity: 0, x: -4 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -4 } };
      }
    };

    const anim = getAnimation(side);

    return (
      <AnimatePresence>
        {open && (
          <motion.div
            ref={ref}
            initial={anim.initial}
            animate={anim.animate}
            exit={anim.exit}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 px-3 py-1.5",
              "text-sm text-[var(--foreground)]",
              "bg-[var(--background-secondary)] border border-[var(--border)]",
              "rounded-md shadow-lg",
              "whitespace-nowrap",
              positionClasses[side],
              align !== "center" && alignClasses[align][side],
              className
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
TooltipContent.displayName = "TooltipContent";

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
};
