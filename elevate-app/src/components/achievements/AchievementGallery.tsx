"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Award, Filter, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AchievementCard } from "./AchievementCard";
import { AchievementBadge } from "./AchievementBadge";
import type {
  AchievementWithStatus,
  AchievementCategory,
  AchievementRarity,
} from "@/types/achievements";
import { CATEGORY_LABELS, CATEGORY_ICONS, RARITY_ORDER } from "@/types/achievements";
import { ACHIEVEMENT_COUNTS } from "@/data/achievements";
import { useTranslations } from "next-intl";

// ============================================================================
// Filter Types
// ============================================================================

type FilterMode = "all" | "unlocked" | "locked" | "in_progress";
type SortMode = "category" | "rarity" | "recent";

// ============================================================================
// Category Section Component
// ============================================================================

interface CategorySectionProps {
  category: AchievementCategory;
  achievements: AchievementWithStatus[];
  expanded: boolean;
  onToggle: () => void;
}

function CategorySection({
  category,
  achievements,
  expanded,
  onToggle,
}: CategorySectionProps) {
  const t = useTranslations("achievements");
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const progress = (unlockedCount / totalCount) * 100;

  const categoryKey = category.replace(/_/g, "") as
    | "questmaster"
    | "xplegend"
    | "knowledgeseeker"
    | "portfolioartisan"
    | "communitychampion"
    | "archetypespecialist"
    | "pioneer";

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-[var(--background-tertiary)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center">
            <Award className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">{t(`categories.${categoryKey}`)}</h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              {unlockedCount} / {totalCount} {t("gallery.unlocked")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-24 hidden sm:block">
            <Progress value={progress} max={100} size="sm" variant={progress === 100 ? "success" : "default"} />
          </div>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-[var(--foreground-muted)] transition-transform",
              expanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Content */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="border-t border-[var(--border)]"
        >
          <div className="p-4 grid gap-3">
            {achievements.map((achievement, index) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                index={index}
                animated={false}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// Achievement Gallery Component
// ============================================================================

interface AchievementGalleryProps {
  achievements: AchievementWithStatus[];
  className?: string;
}

export function AchievementGallery({ achievements, className }: AchievementGalleryProps) {
  const t = useTranslations("achievements");
  const [filterMode, setFilterMode] = React.useState<FilterMode>("all");
  const [sortMode, setSortMode] = React.useState<SortMode>("category");
  const [expandedCategories, setExpandedCategories] = React.useState<Set<AchievementCategory>>(
    new Set(["quest_master"])
  );

  // Filter achievements
  const filteredAchievements = React.useMemo(() => {
    return achievements.filter((a) => {
      switch (filterMode) {
        case "unlocked":
          return a.isUnlocked;
        case "locked":
          return !a.isUnlocked;
        case "in_progress":
          return !a.isUnlocked && a.progress && a.progress.current > 0;
        default:
          return true;
      }
    });
  }, [achievements, filterMode]);

  // Group by category
  const groupedByCategory = React.useMemo(() => {
    const groups: Record<AchievementCategory, AchievementWithStatus[]> = {
      quest_master: [],
      xp_legend: [],
      knowledge_seeker: [],
      portfolio_artisan: [],
      community_champion: [],
      archetype_specialist: [],
      pioneer: [],
    };

    filteredAchievements.forEach((a) => {
      groups[a.category].push(a);
    });

    return groups;
  }, [filteredAchievements]);

  // Calculate stats
  const totalUnlocked = achievements.filter((a) => a.isUnlocked).length;
  const totalAchievements = achievements.length;
  const overallProgress = (totalUnlocked / totalAchievements) * 100;

  // Toggle category expansion
  const toggleCategory = (category: AchievementCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] p-4">
          <p className="text-sm text-[var(--foreground-muted)] mb-1">{t("gallery.totalProgress")}</p>
          <div className="flex items-end justify-between mb-2">
            <span className="text-2xl font-bold">{totalUnlocked}</span>
            <span className="text-[var(--foreground-muted)]">/ {totalAchievements}</span>
          </div>
          <Progress value={overallProgress} max={100} size="sm" />
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] p-4">
          <p className="text-sm text-[var(--foreground-muted)] mb-2">{t("gallery.byRarity")}</p>
          <div className="flex gap-2 flex-wrap">
            {RARITY_ORDER.map((rarity) => {
              const count = achievements.filter(
                (a) => a.rarity === rarity && a.isUnlocked
              ).length;
              const total = achievements.filter((a) => a.rarity === rarity).length;
              return (
                <Badge key={rarity} variant={rarity} className="capitalize">
                  {count}/{total}
                </Badge>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] p-4">
          <p className="text-sm text-[var(--foreground-muted)] mb-2">{t("gallery.recentUnlocks")}</p>
          <div className="flex gap-2">
            {achievements
              .filter((a) => a.isUnlocked)
              .sort((a, b) => {
                const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
                const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
                return dateB - dateA;
              })
              .slice(0, 4)
              .map((a) => (
                <AchievementBadge
                  key={a.id}
                  achievement={a}
                  size="sm"
                  animated={false}
                />
              ))}
            {totalUnlocked === 0 && (
              <p className="text-sm text-[var(--foreground-muted)]">
                {t("gallery.noUnlocks")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-sm text-[var(--foreground-muted)]">
          <Filter className="w-4 h-4" />
          <span>{t("gallery.filter")}:</span>
        </div>
        {(["all", "unlocked", "locked", "in_progress"] as FilterMode[]).map((mode) => (
          <Button
            key={mode}
            variant={filterMode === mode ? "default" : "secondary"}
            size="sm"
            onClick={() => setFilterMode(mode)}
          >
            {t(`filter.${mode.replace("_", "")}`)}
          </Button>
        ))}
      </div>

      {/* Category Sections */}
      <div className="space-y-4">
        {(Object.keys(groupedByCategory) as AchievementCategory[]).map((category) => {
          const categoryAchievements = groupedByCategory[category];
          if (categoryAchievements.length === 0) return null;

          return (
            <CategorySection
              key={category}
              category={category}
              achievements={categoryAchievements}
              expanded={expandedCategories.has(category)}
              onToggle={() => toggleCategory(category)}
            />
          );
        })}
      </div>
    </div>
  );
}
