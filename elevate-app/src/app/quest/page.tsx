'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Swords,
  Trophy,
  Sparkles,
  ChevronRight,
  Award,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressPath } from '@/components/quest/ProgressPath';
import { AchievementBadge } from '@/components/achievements/AchievementBadge';
import { cn } from '@/lib/utils';
import { useQuestStore, QUESTS, useCompletedQuestsCount } from '@/stores/quest-store';
import { useXPStore } from '@/stores/xp-store';
import { useAchievementsStore, useAchievementsWithStatus } from '@/stores/achievements-store';
import type { QuestNode } from '@/components/quest/ProgressPath';

export default function QuestHubPage() {
  const t = useTranslations('quest');

  // Quest state
  const questProgress = useQuestStore((state) => state.questProgress);
  const currentQuestNumber = useQuestStore((state) => state.currentQuestNumber);
  const completedQuestsCount = useCompletedQuestsCount();

  // XP state
  const totalXP = useXPStore((state) => state.totalXP);
  const level = useXPStore((state) => state.level);

  // Achievements state
  const { initializeAchievements } = useAchievementsStore();
  const achievements = useAchievementsWithStatus();

  useEffect(() => {
    initializeAchievements();
  }, [initializeAchievements]);

  // Build quest nodes for ProgressPath
  const questNodes: QuestNode[] = QUESTS.map((quest) => {
    const progress = questProgress.find((qp) => qp.questNumber === quest.number);
    return {
      number: quest.number,
      title: quest.title,
      status: progress?.status || 'locked',
      xpReward: quest.xpReward,
    };
  });

  // Get quest-related achievements
  const questAchievements = achievements.filter(
    (a) => a.category === 'quest_master'
  );

  const isJourneyComplete = completedQuestsCount >= 8;
  const currentQuest = QUESTS.find((q) => q.number === currentQuestNumber);

  // Calculate total XP earned from quests
  const questXPEarned = questProgress.reduce((sum, qp) => sum + qp.xpEarned, 0);

  return (
    <div className="min-h-screen p-4 pt-20 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Swords className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display gradient-text-fire mb-2">
            {t('hub.title')}
          </h1>
          <p className="text-lg text-[var(--foreground-muted)]">
            {isJourneyComplete
              ? t('hub.journeyComplete')
              : t('hub.subtitle')}
          </p>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <Card className="p-4 text-center">
            <Trophy className="w-6 h-6 text-[var(--success)] mx-auto mb-2" />
            <p className="text-2xl font-display font-bold">
              {completedQuestsCount}/8
            </p>
            <p className="text-xs text-[var(--foreground-muted)]">
              {t('hub.stats.questsCompleted')}
            </p>
          </Card>
          <Card className="p-4 text-center">
            <Sparkles className="w-6 h-6 text-[var(--accent)] mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-[var(--accent)]">
              {questXPEarned}
            </p>
            <p className="text-xs text-[var(--foreground-muted)]">
              {t('hub.stats.questXP')}
            </p>
          </Card>
          <Card className="p-4 text-center">
            <Zap className="w-6 h-6 text-[var(--primary)] mx-auto mb-2" />
            <p className="text-2xl font-display font-bold">
              {level}
            </p>
            <p className="text-xs text-[var(--foreground-muted)]">
              {t('hub.stats.currentLevel')}
            </p>
          </Card>
        </motion.div>

        {/* Current Quest CTA (if not complete) */}
        {!isJourneyComplete && currentQuest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card
              className={cn(
                'p-6 border-2 border-[var(--primary)]',
                'bg-gradient-to-r from-[var(--primary-muted)] to-transparent',
                'shadow-[0_0_30px_var(--primary-muted)]'
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-mono text-[var(--primary)] mb-1">
                    {t('hub.currentQuest')}
                  </p>
                  <h2 className="text-xl font-display font-bold mb-1">
                    Quest {currentQuestNumber}: {currentQuest.title}
                  </h2>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {currentQuest.description}
                  </p>
                </div>
                <Link href={`/quest/${currentQuestNumber}`}>
                  <Button className="glow-primary whitespace-nowrap">
                    {t('hub.continueJourney')}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Journey Complete Banner */}
        {isJourneyComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card
              className={cn(
                'p-6 border-2 border-[var(--achievement)]',
                'bg-gradient-to-r from-[var(--achievement-muted)] to-transparent',
                'shadow-[0_0_30px_var(--achievement-muted)]',
                'text-center'
              )}
            >
              <Trophy className="w-12 h-12 text-[var(--achievement)] mx-auto mb-4" />
              <h2 className="text-2xl font-display font-bold gradient-text-fire mb-2">
                {t('hub.champion')}
              </h2>
              <p className="text-[var(--foreground-muted)] mb-4">
                {t('hub.championMessage')}
              </p>
              <div className="flex justify-center gap-3">
                <Link href="/portfolio">
                  <Button>{t('hub.buildPortfolio')}</Button>
                </Link>
                <Link href="/compass">
                  <Button variant="secondary">{t('hub.exploreCareers')}</Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Quest Progress Path */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h3 className="font-display font-semibold mb-6 flex items-center gap-2">
              <Swords className="w-5 h-5 text-[var(--primary)]" />
              {t('hub.questJourney')}
            </h3>
            <ProgressPath
              quests={questNodes}
              currentQuest={currentQuestNumber}
              animated={true}
            />
          </Card>
        </motion.div>

        {/* Quest Achievements */}
        {questAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold flex items-center gap-2">
                  <Award className="w-5 h-5 text-[var(--achievement)]" />
                  {t('hub.questAchievements')}
                </h3>
                <Link href="/achievements">
                  <Button variant="ghost" size="sm">
                    {t('hub.viewAll')}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-4">
                {questAchievements.slice(0, 8).map((achievement) => (
                  <div key={achievement.id} className="text-center">
                    <AchievementBadge
                      achievement={achievement}
                      size="sm"
                    />
                    <p className="text-xs text-[var(--foreground-muted)] mt-1 truncate">
                      {achievement.name}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Post-Quest Activities (for completed users) */}
        {isJourneyComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Card className="p-6">
              <h3 className="font-display font-semibold mb-4">
                {t('hub.nextSteps')}
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/portfolio/new">
                  <div className="p-4 rounded-lg bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] transition-colors cursor-pointer">
                    <Sparkles className="w-6 h-6 text-[var(--primary)] mb-2" />
                    <p className="font-medium">{t('hub.activities.addProject')}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {t('hub.activities.addProjectDesc')}
                    </p>
                  </div>
                </Link>
                <Link href="/feedback/new">
                  <div className="p-4 rounded-lg bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] transition-colors cursor-pointer">
                    <Award className="w-6 h-6 text-[var(--achievement)] mb-2" />
                    <p className="font-medium">{t('hub.activities.getFeedback')}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {t('hub.activities.getFeedbackDesc')}
                    </p>
                  </div>
                </Link>
                <Link href="/learn">
                  <div className="p-4 rounded-lg bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] transition-colors cursor-pointer">
                    <Zap className="w-6 h-6 text-[var(--accent)] mb-2" />
                    <p className="font-medium">{t('hub.activities.keepLearning')}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {t('hub.activities.keepLearningDesc')}
                    </p>
                  </div>
                </Link>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Back to Dashboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center mt-8"
        >
          <Link href="/dashboard">
            <Button variant="ghost">
              {t('hub.backToDashboard')}
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
