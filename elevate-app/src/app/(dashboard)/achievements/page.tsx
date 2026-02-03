"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Award, Trophy } from "lucide-react";
import { AchievementGallery } from "@/components/achievements/AchievementGallery";
import { AchievementUnlockModal } from "@/components/achievements/AchievementUnlockModal";
import {
  useAchievementsStore,
  useAchievementsWithStatus,
  usePendingAchievementUnlock,
} from "@/stores/achievements-store";
import { useRouter } from "next/navigation";

export default function AchievementsPage() {
  const t = useTranslations("achievements");
  const router = useRouter();

  // Initialize achievements store
  const { initializeAchievements, acknowledgePendingUnlock } = useAchievementsStore();

  useEffect(() => {
    initializeAchievements();
  }, [initializeAchievements]);

  // Get achievements with status
  const achievements = useAchievementsWithStatus();
  const pendingUnlock = usePendingAchievementUnlock();

  // Calculate totals for header
  const totalUnlocked = achievements.filter((a) => a.isUnlocked).length;
  const totalAchievements = achievements.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[var(--achievement-muted)] flex items-center justify-center">
              <Trophy className="w-6 h-6 text-[var(--achievement)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">{t("page.title")}</h1>
              <p className="text-[var(--foreground-muted)]">{t("page.subtitle")}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)]">
          <Award className="w-5 h-5 text-[var(--achievement)]" />
          <span className="text-lg font-bold">
            {totalUnlocked} / {totalAchievements}
          </span>
          <span className="text-[var(--foreground-muted)]">{t("page.unlocked")}</span>
        </div>
      </div>

      {/* Achievement Gallery */}
      <AchievementGallery achievements={achievements} />

      {/* Achievement Unlock Modal */}
      <AchievementUnlockModal
        pendingUnlock={pendingUnlock}
        onClose={acknowledgePendingUnlock}
        onViewAll={() => {
          acknowledgePendingUnlock();
          // Already on achievements page, just scroll to top
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
