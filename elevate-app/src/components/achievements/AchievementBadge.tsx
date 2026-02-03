"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Lock,
  // Quest Master icons
  Footprints,
  Gem,
  Anchor,
  Building2,
  Target,
  Brain,
  Flame,
  Crown,
  // XP Legend icons
  Sparkles,
  Star,
  Compass,
  Shield,
  Medal,
  Award,
  Trophy,
  // Knowledge Seeker icons
  CheckCircle,
  GraduationCap,
  Lightbulb,
  BookOpen,
  Play,
  Library,
  // Portfolio Artisan icons
  Plus,
  Layers,
  Hammer,
  Palette,
  Tags,
  // Community Champion icons
  MessageCircle,
  MessagesSquare,
  Rocket,
  Users,
  HeartHandshake,
  // Archetype Specialist icons
  User,
  Wrench,
  Map,
  // Pioneer icons
  Building,
  Briefcase,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AchievementRarity, AchievementWithStatus } from "@/types/achievements";

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Footprints,
  Gem,
  Anchor,
  Building2,
  Target,
  Brain,
  Flame,
  Crown,
  Sparkles,
  Star,
  Compass,
  Shield,
  Medal,
  Award,
  Trophy,
  CheckCircle,
  GraduationCap,
  Lightbulb,
  BookOpen,
  Play,
  Library,
  Plus,
  Layers,
  Hammer,
  Palette,
  Tags,
  MessageCircle,
  MessagesSquare,
  Rocket,
  Users,
  HeartHandshake,
  User,
  Wrench,
  Map,
  Building,
  Briefcase,
};

// Rarity styles
const rarityStyles: Record<AchievementRarity, {
  bg: string;
  border: string;
  glow: string;
  text: string;
  iconBg: string;
}> = {
  common: {
    bg: "bg-zinc-800/50",
    border: "border-zinc-600/50",
    glow: "",
    text: "text-zinc-400",
    iconBg: "bg-zinc-700/50",
  },
  uncommon: {
    bg: "bg-emerald-900/30",
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/10",
    text: "text-emerald-400",
    iconBg: "bg-emerald-900/50",
  },
  rare: {
    bg: "bg-blue-900/30",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/20",
    text: "text-blue-400",
    iconBg: "bg-blue-900/50",
  },
  epic: {
    bg: "bg-purple-900/30",
    border: "border-purple-500/30",
    glow: "shadow-purple-500/30",
    text: "text-purple-400",
    iconBg: "bg-purple-900/50",
  },
  legendary: {
    bg: "bg-orange-900/30",
    border: "border-orange-500/40",
    glow: "shadow-orange-500/40",
    text: "text-orange-400",
    iconBg: "bg-orange-900/50",
  },
};

// ============================================================================
// Achievement Badge Component
// ============================================================================

interface AchievementBadgeProps {
  achievement: AchievementWithStatus;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  animated?: boolean;
  onClick?: () => void;
  className?: string;
}

export function AchievementBadge({
  achievement,
  size = "md",
  showName = false,
  animated = true,
  onClick,
  className,
}: AchievementBadgeProps) {
  const { rarity, icon, name, isUnlocked, isSecret } = achievement;
  const styles = rarityStyles[rarity];
  const Icon = iconMap[icon] ?? Award;

  // Size mappings
  const sizeClasses = {
    sm: { container: "w-12 h-12", icon: "w-5 h-5", text: "text-xs" },
    md: { container: "w-16 h-16", icon: "w-7 h-7", text: "text-sm" },
    lg: { container: "w-20 h-20", icon: "w-9 h-9", text: "text-base" },
  };

  const sizeConfig = sizeClasses[size];

  // Locked state for secret achievements
  const showLocked = !isUnlocked && isSecret;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <motion.button
        onClick={onClick}
        disabled={!onClick}
        className={cn(
          "relative rounded-xl border-2 transition-all",
          sizeConfig.container,
          "flex items-center justify-center",
          isUnlocked ? styles.bg : "bg-zinc-900/50",
          isUnlocked ? styles.border : "border-zinc-700/50",
          isUnlocked && (rarity === "epic" || rarity === "legendary") && `shadow-lg ${styles.glow}`,
          onClick && "cursor-pointer hover:scale-105",
          !isUnlocked && "opacity-50 grayscale"
        )}
        whileHover={animated && onClick ? { scale: 1.05 } : undefined}
        whileTap={animated && onClick ? { scale: 0.95 } : undefined}
      >
        {/* Glow effect for rare+ */}
        {isUnlocked && (rarity === "rare" || rarity === "epic" || rarity === "legendary") && (
          <div
            className={cn(
              "absolute inset-0 rounded-xl blur-md opacity-30",
              rarity === "rare" && "bg-blue-500",
              rarity === "epic" && "bg-purple-500",
              rarity === "legendary" && "bg-orange-500"
            )}
          />
        )}

        {/* Icon container */}
        <div
          className={cn(
            "relative rounded-lg p-2",
            isUnlocked ? styles.iconBg : "bg-zinc-800/50"
          )}
        >
          {showLocked ? (
            <Lock className={cn(sizeConfig.icon, "text-zinc-500")} />
          ) : (
            <Icon
              className={cn(
                sizeConfig.icon,
                isUnlocked ? styles.text : "text-zinc-600"
              )}
            />
          )}
        </div>

        {/* Legendary shimmer effect */}
        {isUnlocked && rarity === "legendary" && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-orange-400/20 to-transparent"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
        )}
      </motion.button>

      {showName && (
        <span
          className={cn(
            sizeConfig.text,
            "font-medium text-center max-w-[100px] truncate",
            isUnlocked ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)]"
          )}
        >
          {showLocked ? "???" : name}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// Mini Badge for inline use
// ============================================================================

interface AchievementMiniBadgeProps {
  rarity: AchievementRarity;
  icon: string;
  className?: string;
}

export function AchievementMiniBadge({ rarity, icon, className }: AchievementMiniBadgeProps) {
  const styles = rarityStyles[rarity];
  const Icon = iconMap[icon] ?? Award;

  return (
    <div
      className={cn(
        "w-8 h-8 rounded-lg border flex items-center justify-center",
        styles.bg,
        styles.border,
        className
      )}
    >
      <Icon className={cn("w-4 h-4", styles.text)} />
    </div>
  );
}

export { iconMap, rarityStyles };
