"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Sparkles,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastStore, type Toast, type ToastType } from "@/stores/toast-store";
import { Button } from "./button";

// ============================================================================
// Toast Configuration
// ============================================================================

interface ToastConfig {
  icon: React.ElementType;
  iconColor: string;
  borderColor: string;
  bgGradient: string;
  glowColor: string;
}

const toastConfig: Record<ToastType, ToastConfig> = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    bgGradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    glowColor: "shadow-emerald-500/20",
  },
  error: {
    icon: XCircle,
    iconColor: "text-rose-400",
    borderColor: "border-rose-500/30",
    bgGradient: "from-rose-500/10 via-rose-500/5 to-transparent",
    glowColor: "shadow-rose-500/20",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    bgGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    glowColor: "shadow-amber-500/20",
  },
  info: {
    icon: Info,
    iconColor: "text-sky-400",
    borderColor: "border-sky-500/30",
    bgGradient: "from-sky-500/10 via-sky-500/5 to-transparent",
    glowColor: "shadow-sky-500/20",
  },
  achievement: {
    icon: Trophy,
    iconColor: "text-orange-400",
    borderColor: "border-orange-500/30",
    bgGradient: "from-orange-500/10 via-orange-500/5 to-transparent",
    glowColor: "shadow-orange-500/20",
  },
};

// ============================================================================
// Single Toast Component
// ============================================================================

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;
  const [isHovered, setIsHovered] = React.useState(false);
  const [progress, setProgress] = React.useState(100);

  // Progress bar animation
  React.useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / toast.duration!) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast.duration]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95, x: 20 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 1,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative overflow-hidden",
        "w-full max-w-sm",
        "rounded-xl border backdrop-blur-xl",
        "bg-[var(--background-secondary)]/95",
        config.borderColor,
        "shadow-lg",
        config.glowColor
      )}
    >
      {/* Background gradient */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-50",
          config.bgGradient
        )}
      />

      {/* Animated glow effect */}
      <motion.div
        className={cn(
          "absolute -inset-1 rounded-xl opacity-0",
          "bg-gradient-to-r blur-xl",
          config.bgGradient
        )}
        animate={{ opacity: isHovered ? 0.3 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <div className="relative flex items-start gap-3 p-4">
        {/* Icon with animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
          className={cn("flex-shrink-0 mt-0.5", config.iconColor)}
        >
          <Icon className="w-5 h-5" />
        </motion.div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <motion.h4
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="font-semibold text-sm text-[var(--foreground)]"
            >
              {toast.title}
            </motion.h4>
          )}
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "text-sm text-[var(--foreground-muted)]",
              toast.title && "mt-0.5"
            )}
          >
            {toast.message}
          </motion.p>

          {/* Action button */}
          {toast.action && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-3"
            >
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  toast.action?.onClick();
                  onDismiss(toast.id);
                }}
                className="h-7 text-xs"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {toast.action.label}
              </Button>
            </motion.div>
          )}
        </div>

        {/* Dismiss button */}
        {toast.dismissible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => onDismiss(toast.id)}
            className={cn(
              "flex-shrink-0 p-1.5 rounded-lg",
              "text-[var(--foreground-subtle)] hover:text-[var(--foreground)]",
              "hover:bg-[var(--background-tertiary)]",
              "transition-colors duration-200"
            )}
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--background-tertiary)]">
          <motion.div
            className={cn(
              "h-full",
              toast.type === "success" && "bg-emerald-400",
              toast.type === "error" && "bg-rose-400",
              toast.type === "warning" && "bg-amber-400",
              toast.type === "info" && "bg-sky-400",
              toast.type === "achievement" && "bg-orange-400"
            )}
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.05 }}
          />
        </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// Toast Container (renders all toasts)
// ============================================================================

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-[100]",
        "flex flex-col gap-3",
        "pointer-events-none"
      )}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Toast Provider (wraps app to provide toast rendering)
// ============================================================================

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
