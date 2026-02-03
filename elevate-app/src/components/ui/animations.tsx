"use client";

import * as React from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================================================
// Animation Variants
// ============================================================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// ============================================================================
// Page Transition Wrapper
// ============================================================================

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeInUp}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// Stagger Container (for list animations)
// ============================================================================

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.05,
  initialDelay = 0,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className={className}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: initialDelay,
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// Stagger Item (for use inside StaggerContainer)
// ============================================================================

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  variant?: "fadeIn" | "fadeInUp" | "fadeInDown" | "scaleIn" | "slideInLeft" | "slideInRight";
}

const variantMap = {
  fadeIn,
  fadeInUp,
  fadeInDown,
  scaleIn,
  slideInLeft,
  slideInRight,
};

export function StaggerItem({
  children,
  className,
  variant = "fadeInUp",
}: StaggerItemProps) {
  return (
    <motion.div
      variants={variantMap[variant]}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// Animated List (combines StaggerContainer + StaggerItem)
// ============================================================================

interface AnimatedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  className?: string;
  itemClassName?: string;
  staggerDelay?: number;
  variant?: StaggerItemProps["variant"];
  emptyState?: React.ReactNode;
}

export function AnimatedList<T>({
  items,
  renderItem,
  keyExtractor,
  className,
  itemClassName,
  staggerDelay = 0.05,
  variant = "fadeInUp",
  emptyState,
}: AnimatedListProps<T>) {
  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <StaggerContainer className={className} staggerDelay={staggerDelay}>
      {items.map((item, index) => (
        <StaggerItem
          key={keyExtractor(item, index)}
          variant={variant}
          className={itemClassName}
        >
          {renderItem(item, index)}
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}

// ============================================================================
// Hover Scale (for cards and interactive elements)
// ============================================================================

interface HoverScaleProps {
  children: React.ReactNode;
  scale?: number;
  className?: string;
}

export function HoverScale({
  children,
  scale = 1.02,
  className,
}: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// Pulse Animation (for notifications, live indicators)
// ============================================================================

interface PulseProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  color?: string;
  size?: "sm" | "md" | "lg";
}

export function Pulse({
  children,
  color = "var(--primary)",
  size = "md",
  className,
  ...props
}: PulseProps) {
  const sizeMap = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <span
      className={cn("relative inline-flex", className)}
      {...props}
    >
      <motion.span
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.7, 0, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeOut",
        }}
        className={cn(
          "absolute inline-flex rounded-full",
          sizeMap[size]
        )}
        style={{ backgroundColor: color }}
      />
      <span
        className={cn("relative inline-flex rounded-full", sizeMap[size])}
        style={{ backgroundColor: color }}
      />
      {children}
    </span>
  );
}

// ============================================================================
// Shimmer Loading (for skeleton states)
// ============================================================================

interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

export function Shimmer({
  width = "100%",
  height = "1rem",
  rounded = "md",
  className,
  ...props
}: ShimmerProps) {
  const roundedMap = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  return (
    <div
      className={cn("skeleton", roundedMap[rounded], className)}
      style={{ width, height }}
      {...props}
    />
  );
}

// ============================================================================
// Number Counter Animation
// ============================================================================

interface CounterProps {
  value: number;
  duration?: number;
  className?: string;
  formatter?: (value: number) => string;
}

export function Counter({
  value,
  duration = 1,
  className,
  formatter = (v) => Math.round(v).toString(),
}: CounterProps) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startValue + diff * easeProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className={className}>{formatter(displayValue)}</span>;
}

// ============================================================================
// Presence Animation (for conditional rendering)
// ============================================================================

interface PresenceProps {
  children: React.ReactNode;
  show: boolean;
  variant?: keyof typeof variantMap;
  duration?: number;
}

export function Presence({
  children,
  show,
  variant = "fadeIn",
  duration = 0.2,
}: PresenceProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variantMap[variant]}
          transition={{ duration }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
