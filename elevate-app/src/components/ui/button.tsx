"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-lg shadow-[var(--primary-muted)]",
        secondary:
          "bg-[var(--background-secondary)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--background-tertiary)] hover:border-[var(--border-hover)]",
        success:
          "bg-[var(--success)] text-[var(--background)] hover:bg-[var(--success-hover)] shadow-lg shadow-[var(--success-muted)]",
        warning:
          "bg-[var(--warning)] text-[var(--background)] hover:bg-[var(--warning-hover)] shadow-lg shadow-[var(--warning-muted)]",
        danger:
          "bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)] shadow-lg shadow-[var(--danger-muted)]",
        ghost:
          "hover:bg-[var(--background-secondary)] hover:text-[var(--foreground)]",
        link: "text-[var(--primary)] underline-offset-4 hover:underline",
        outline:
          "border border-[var(--border)] bg-transparent hover:bg-[var(--background-secondary)] hover:border-[var(--primary)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8 text-base",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  animate?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, animate = true, disabled, ...props }, ref) => {
    const baseButton = (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    );

    // Return without animation if disabled or animate is false
    if (!animate || disabled) {
      return baseButton;
    }

    // Wrap with motion for interactive animations
    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        type={props.type}
        onClick={props.onClick}
      >
        {props.children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
