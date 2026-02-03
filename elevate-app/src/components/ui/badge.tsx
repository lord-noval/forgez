import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--primary-muted)] text-[var(--primary)]",
        secondary: "bg-[var(--background-tertiary)] text-[var(--foreground-muted)]",
        success: "bg-[var(--success-muted)] text-[var(--success)]",
        warning: "bg-[var(--warning-muted)] text-[var(--warning)]",
        danger: "bg-[var(--danger-muted)] text-[var(--danger)]",
        achievement: "bg-[var(--achievement-muted)] text-[var(--achievement)]",
        // Rarity variants using CSS variables for world theming
        common: "bg-[rgba(113,113,122,0.2)] text-[var(--rarity-common)]",
        uncommon: "bg-[rgba(34,197,94,0.2)] text-[var(--rarity-uncommon)]",
        rare: "bg-[rgba(59,130,246,0.2)] text-[var(--rarity-rare)]",
        epic: "bg-[rgba(168,85,247,0.2)] text-[var(--rarity-epic)]",
        legendary: "bg-[rgba(249,115,22,0.2)] text-[var(--rarity-legendary)]",
        // Outline variants
        outline: "border border-[var(--border)] text-[var(--foreground-muted)]",
        "outline-primary": "border border-[var(--primary)] text-[var(--primary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
