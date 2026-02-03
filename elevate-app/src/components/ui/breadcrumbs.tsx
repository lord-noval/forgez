"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Breadcrumb Types
// ============================================================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  showHome?: boolean;
  homeHref?: string;
  separator?: React.ReactNode;
}

// ============================================================================
// Breadcrumbs Component
// ============================================================================

function Breadcrumbs({
  items,
  showHome = true,
  homeHref = "/dashboard",
  separator,
  className,
  ...props
}: BreadcrumbsProps) {
  const allItems = showHome
    ? [{ label: "Home", href: homeHref }, ...items]
    : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm", className)}
      {...props}
    >
      <ol className="flex items-center gap-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isHome = showHome && index === 0;

          return (
            <li key={index} className="flex items-center gap-1">
              {/* Separator */}
              {index > 0 && (
                <span className="text-[var(--foreground-subtle)]">
                  {separator || <ChevronRight className="w-4 h-4" />}
                </span>
              )}

              {/* Breadcrumb Item */}
              {isLast ? (
                <span
                  className="text-[var(--foreground)] font-medium truncate max-w-[200px]"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
                    "transition-colors truncate max-w-[150px]",
                    "flex items-center gap-1"
                  )}
                >
                  {isHome && <Home className="w-4 h-4" />}
                  {!isHome && item.label}
                </Link>
              ) : (
                <span className="text-[var(--foreground-muted)] truncate max-w-[150px]">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ============================================================================
// Breadcrumb Primitives (for custom layouts)
// ============================================================================

const BreadcrumbRoot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm", className)}
      {...props}
    />
  )
);
BreadcrumbRoot.displayName = "BreadcrumbRoot";

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.HTMLAttributes<HTMLOListElement>>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn("flex items-center gap-1 flex-wrap", className)}
      {...props}
    />
  )
);
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  )
);
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
      "transition-colors truncate max-w-[150px]",
      className
    )}
    {...props}
  />
));
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-current="page"
      className={cn(
        "text-[var(--foreground)] font-medium truncate max-w-[200px]",
        className
      )}
      {...props}
    />
  )
);
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn("text-[var(--foreground-subtle)]", className)}
      {...props}
    >
      {children || <ChevronRight className="w-4 h-4" />}
    </span>
  )
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbEllipsis = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn(
        "flex h-9 w-9 items-center justify-center text-[var(--foreground-muted)]",
        className
      )}
      {...props}
    >
      <span className="tracking-widest">...</span>
    </span>
  )
);
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

export {
  Breadcrumbs,
  BreadcrumbRoot,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
