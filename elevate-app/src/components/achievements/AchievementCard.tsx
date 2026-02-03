"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Zap, Lock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AchievementMiniBadge, rarityStyles } from "./AchievementBadge";
import type { AchievementWithStatus } from "@/types/achievements";
import { useTranslations } from "next-intl";

// ============================================================================
// Achievement Card Component
// ============================================================================

interface AchievementCardProps {
  achievement: AchievementWithStatus;
  onClick?: () => void;
  className?: string;
  animated?: boolean;
  index?: number;
}

export function AchievementCard({
  achievement,
  onClick,
  className,
  animated = true,
  index = 0,
}: AchievementCardProps) {
  const t = useTranslations("achievements");
  const {
    name,
    description,
    rarity,
    icon,
    xpReward,
    isUnlocked,
    isSecret,
    progress,
    unlockedAt,
  } = achievement;

  const styles = rarityStyles[rarity];
  const showLocked = !isUnlocked && isSecret;

  // Format unlock date
  const formattedDate = unlockedAt
    ? new Date(unlockedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : undefined}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={animated ? { delay: index * 0.05 } : undefined}
      onClick={onClick}
      className={cn(
        "group relative rounded-xl border p-4 transition-all",
        "bg-[var(--background-secondary)]",
        isUnlocked ? styles.border : "border-[var(--border)]",
        isUnlocked && (rarity === "epic" || rarity === "legendary") && `shadow-lg ${styles.glow}`,
        onClick && "cursor-pointer hover:border-[var(--border-hover)] hover:-translate-y-0.5",
        !isUnlocked && "opacity-60",
        className
      )}
    >
      {/* Locked overlay for secret achievements */}
      {showLocked && (
        <div className="absolute inset-0 rounded-xl bg-[var(--background-secondary)]/90 flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="w-8 h-8 text-[var(--foreground-muted)] mx-auto mb-2" />
            <p className="text-sm text-[var(--foreground-muted)]">{t("card.secret")}</p>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {/* Badge */}
        <AchievementMiniBadge rarity={rarity} icon={icon} className={!isUnlocked ? "grayscale" : ""} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className={cn(
                "font-semibold truncate",
                isUnlocked ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)]"
              )}
            >
              {name}
            </h4>
            {isUnlocked && (
              <CheckCircle className="w-4 h-4 text-[var(--success)] flex-shrink-0" />
            )}
          </div>

          <p className="text-sm text-[var(--foreground-muted)] line-clamp-2 mb-2">
            {description}
          </p>

          {/* Progress bar for progress-based achievements */}
          {progress && !isUnlocked && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)] mb-1">
                <span>{t("card.progress")}</span>
                <span>
                  {progress.current} / {progress.target}
                </span>
              </div>
              <Progress
                value={progress.percentage}
                max={100}
                size="sm"
                variant="default"
              />
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={rarity} className="capitalize text-xs">
                {t(`rarity.${rarity}`)}
              </Badge>
              {formattedDate && (
                <span className="text-xs text-[var(--foreground-subtle)]">
                  {formattedDate}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[var(--xp)]">
              <Zap className="w-3 h-3" />
              <span className="text-xs font-medium">+{xpReward}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Compact Achievement Card (for grids)
// ============================================================================

interface AchievementCardCompactProps {
  achievement: AchievementWithStatus;
  onClick?: () => void;
  className?: string;
}

export function AchievementCardCompact({
  achievement,
  onClick,
  className,
}: AchievementCardCompactProps) {
  const { name, rarity, icon, isUnlocked, isSecret, progress } = achievement;
  const styles = rarityStyles[rarity];
  const showLocked = !isUnlocked && isSecret;

  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={cn(
        "relative rounded-lg border p-3 transition-all",
        "bg-[var(--background-secondary)]",
        isUnlocked ? styles.border : "border-[var(--border)]",
        onClick && "cursor-pointer",
        !isUnlocked && "opacity-50 grayscale",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <AchievementMiniBadge rarity={rarity} icon={icon} />
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium truncate",
              isUnlocked ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)]"
            )}
          >
            {showLocked ? "???" : name}
          </p>
          {progress && !isUnlocked && (
            <div className="flex items-center gap-2 mt-1">
              <Progress
                value={progress.percentage}
                max={100}
                size="sm"
                className="flex-1"
              />
              <span className="text-xs text-[var(--foreground-muted)]">
                {Math.round(progress.percentage)}%
              </span>
            </div>
          )}
        </div>
        {isUnlocked && (
          <CheckCircle className="w-4 h-4 text-[var(--success)] flex-shrink-0" />
        )}
      </div>
    </motion.div>
  );
}
