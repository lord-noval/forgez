"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, AlertTriangle, Info, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

// ============================================================================
// Error Message Types
// ============================================================================

type ErrorVariant = "error" | "warning" | "info";

interface ErrorMessageProps {
  variant?: ErrorVariant;
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  retryAction?: () => void;
  className?: string;
  children?: React.ReactNode;
}

// ============================================================================
// Error Message Component
// ============================================================================

const variantConfig: Record<ErrorVariant, {
  icon: React.ElementType;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  titleColor: string;
}> = {
  error: {
    icon: AlertCircle,
    bgColor: "bg-[var(--danger-muted)]",
    borderColor: "border-[var(--danger)]",
    iconColor: "text-[var(--danger)]",
    titleColor: "text-[var(--danger)]",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-[var(--warning-muted)]",
    borderColor: "border-[var(--warning)]",
    iconColor: "text-[var(--warning)]",
    titleColor: "text-[var(--warning)]",
  },
  info: {
    icon: Info,
    bgColor: "bg-[var(--primary-muted)]",
    borderColor: "border-[var(--primary)]",
    iconColor: "text-[var(--primary)]",
    titleColor: "text-[var(--primary)]",
  },
};

function ErrorMessage({
  variant = "error",
  title,
  message,
  dismissible = false,
  onDismiss,
  action,
  retryAction,
  className,
  ...props
}: ErrorMessageProps) {
  const [isVisible, setIsVisible] = React.useState(true);
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "rounded-lg border p-4",
            config.bgColor,
            config.borderColor,
            className
          )}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.iconColor)} />

            {/* Content */}
            <div className="flex-1 min-w-0">
              {title && (
                <h4 className={cn("font-semibold text-sm mb-1", config.titleColor)}>
                  {title}
                </h4>
              )}
              <p className="text-sm text-[var(--foreground-muted)]">
                {message}
              </p>

              {/* Actions */}
              {(action || retryAction) && (
                <div className="flex items-center gap-2 mt-3">
                  {retryAction && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={retryAction}
                      className="gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Retry
                    </Button>
                  )}
                  {action && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={action.onClick}
                    >
                      {action.label}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Dismiss Button */}
            {dismissible && (
              <button
                onClick={handleDismiss}
                className={cn(
                  "flex-shrink-0 p-1 rounded hover:bg-[var(--background-tertiary)]",
                  "transition-colors",
                  "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                )}
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Dismiss</span>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Inline Error (for form fields)
// ============================================================================

interface InlineErrorProps {
  message?: string;
  className?: string;
}

function InlineError({ message, className }: InlineErrorProps) {
  if (!message) return null;

  return (
    <motion.p
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className={cn(
        "text-xs text-[var(--danger)] mt-1 flex items-center gap-1",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="w-3 h-3" aria-hidden="true" />
      {message}
    </motion.p>
  );
}

// ============================================================================
// Form Error Summary
// ============================================================================

interface FormErrorSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  errors: Record<string, string | undefined>;
  title?: string;
}

function FormErrorSummary({
  errors,
  title = "Please fix the following errors:",
  className,
  ...props
}: FormErrorSummaryProps) {
  const errorEntries = Object.entries(errors).filter(([, value]) => value);

  if (errorEntries.length === 0) return null;

  return (
    <ErrorMessage
      variant="error"
      title={title}
      message=""
      className={className}
      {...props}
    >
      <ul className="list-disc list-inside text-sm text-[var(--foreground-muted)] mt-2 space-y-1">
        {errorEntries.map(([field, error]) => (
          <li key={field}>{error}</li>
        ))}
      </ul>
    </ErrorMessage>
  );
}

export { ErrorMessage, InlineError, FormErrorSummary };
