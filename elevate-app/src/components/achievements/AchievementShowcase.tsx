"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Award, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AchievementBadge } from "./AchievementBadge";
import { AchievementCardCompact } from "./AchievementCard";
import type { AchievementWithStatus } from "@/types/achievements";
import { useTranslations } from "next-intl";

// ============================================================================
// Achievement Showcase (Dashboard Widget)
// ============================================================================

interface AchievementShowcaseProps {
  achievements: AchievementWithStatus[];
  className?: string;
}

export function AchievementShowcase({ achievements, className }: AchievementShowcaseProps) {
  const t = useTranslations("achievements");

  // Calculate stats
  const totalUnlocked = achievements.filter((a) => a.isUnlocked).length;
  const totalAchievements = achievements.length;
  const progress = (totalUnlocked / totalAchievements) * 100;

  // Get recent unlocks (up to 3)
  const recentUnlocks = achievements
    .filter((a) => a.isUnlocked)
    .sort((a, b) => {
      const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
      const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  // Get achievements in progress (up to 2)
  const inProgress = achievements
    .filter((a) => !a.isUnlocked && a.progress && a.progress.current > 0)
    .sort((a, b) => (b.progress?.percentage ?? 0) - (a.progress?.percentage ?? 0))
    .slice(0, 2);

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Award className="w-4 h-4" />
          {t("showcase.title")}
        </CardTitle>
        <Link href="/achievements">
          <Button variant="ghost" size="sm">
            {t("showcase.viewAll")} <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {/* Progress summary */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--foreground-muted)]">
              {t("showcase.progress")}
            </span>
            <span className="text-sm font-medium">
              {totalUnlocked} / {totalAchievements}
            </span>
          </div>
          <Progress value={progress} max={100} size="sm" />
        </div>

        {/* Recent unlocks */}
        {recentUnlocks.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-[var(--foreground-muted)] mb-2">
              {t("showcase.recentUnlocks")}
            </p>
            <div className="flex gap-2">
              {recentUnlocks.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  size="sm"
                  showName={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* In progress */}
        {inProgress.length > 0 && (
          <div>
            <p className="text-sm text-[var(--foreground-muted)] mb-2">
              {t("showcase.inProgress")}
            </p>
            <div className="space-y-2">
              {inProgress.map((achievement) => (
                <AchievementCardCompact key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {recentUnlocks.length === 0 && inProgress.length === 0 && (
          <div className="text-center py-4">
            <Sparkles className="w-8 h-8 text-[var(--foreground-muted)] mx-auto mb-2" />
            <p className="text-sm text-[var(--foreground-muted)]">
              {t("showcase.empty")}
            </p>
            <Link href="/quest/1">
              <Button variant="secondary" size="sm" className="mt-2">
                {t("showcase.startQuest")}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Achievement Toast Content (for toast notifications)
// ============================================================================

interface AchievementToastProps {
  achievement: AchievementWithStatus;
  xpAwarded: number;
}

export function AchievementToastContent({ achievement, xpAwarded }: AchievementToastProps) {
  const t = useTranslations("achievements");

  return (
    <div className="flex items-center gap-3">
      <AchievementBadge achievement={achievement} size="sm" animated={false} />
      <div>
        <p className="font-medium">{achievement.name}</p>
        <p className="text-sm text-[var(--foreground-muted)]">
          +{xpAwarded} XP
        </p>
      </div>
    </div>
  );
}

export default AchievementShowcase;
