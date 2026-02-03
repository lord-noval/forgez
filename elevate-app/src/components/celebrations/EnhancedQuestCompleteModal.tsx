'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Trophy,
  ChevronRight,
  UserCircle,
  BookOpen,
  Building2,
  Target,
  Award,
  Flame,
  Users,
  FolderPlus,
  User,
  MessageSquare,
  Compass,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfettiExplosion } from './ConfettiExplosion';
import { AchievementBadge } from '@/components/achievements/AchievementBadge';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import type { PendingAchievementUnlock } from '@/types/achievements';

interface Suggestion {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  xp?: number;
}

interface EnhancedQuestCompleteModalProps {
  show: boolean;
  questNumber: number;
  questTitle: string;
  xpEarned: number;
  flavorText?: string;
  recentAchievements?: PendingAchievementUnlock[];
  onContinue?: () => void;
  onViewAchievements?: () => void;
}

// Quest icons mapping
const QUEST_ICONS: Record<number, React.ElementType> = {
  1: UserCircle,
  2: Sparkles,
  3: BookOpen,
  4: Building2,
  5: Target,
  6: Award,
  7: Flame,
  8: Users,
};

// Quest-specific suggestions
const QUEST_SUGGESTIONS: Record<number, Suggestion[]> = {
  1: [
    {
      label: 'addProject',
      description: 'addProjectDesc',
      href: '/portfolio/new',
      icon: FolderPlus,
      xp: 100,
    },
    {
      label: 'completeProfile',
      description: 'completeProfileDesc',
      href: '/profile',
      icon: User,
    },
  ],
  2: [
    {
      label: 'addProject',
      description: 'addProjectDesc',
      href: '/portfolio/new',
      icon: FolderPlus,
      xp: 100,
    },
  ],
  3: [
    {
      label: 'viewSkills',
      description: 'viewSkillsDesc',
      href: '/skills/bank',
      icon: GraduationCap,
    },
    {
      label: 'exploreCareers',
      description: 'exploreCareersDesc',
      href: '/compass',
      icon: Compass,
    },
  ],
  4: [
    {
      label: 'browseJobs',
      description: 'browseJobsDesc',
      href: '/careers',
      icon: Briefcase,
    },
  ],
  5: [
    {
      label: 'browseJobs',
      description: 'browseJobsDesc',
      href: '/careers',
      icon: Briefcase,
    },
    {
      label: 'updateSkills',
      description: 'updateSkillsDesc',
      href: '/skills/bank',
      icon: GraduationCap,
    },
  ],
  6: [
    {
      label: 'requestFeedback',
      description: 'requestFeedbackDesc',
      href: '/feedback/new',
      icon: MessageSquare,
    },
  ],
  7: [
    {
      label: 'startLearning',
      description: 'startLearningDesc',
      href: '/learn',
      icon: BookOpen,
    },
  ],
  8: [
    {
      label: 'buildPortfolio',
      description: 'buildPortfolioDesc',
      href: '/portfolio',
      icon: FolderPlus,
      xp: 100,
    },
    {
      label: 'requestFeedback',
      description: 'requestFeedbackDesc',
      href: '/feedback/new',
      icon: MessageSquare,
    },
    {
      label: 'exploreCareers',
      description: 'exploreCareersDesc',
      href: '/compass',
      icon: Compass,
    },
  ],
};

export function EnhancedQuestCompleteModal({
  show,
  questNumber,
  questTitle,
  xpEarned,
  flavorText,
  recentAchievements = [],
  onContinue,
  onViewAchievements,
}: EnhancedQuestCompleteModalProps) {
  const t = useTranslations('quest');
  const [showConfetti, setShowConfetti] = useState(false);
  const [displayedXP, setDisplayedXP] = useState(0);

  const QuestIcon = QUEST_ICONS[questNumber] || Trophy;
  const suggestions = QUEST_SUGGESTIONS[questNumber] || [];
  const isLastQuest = questNumber === 8;

  useEffect(() => {
    if (show) {
      // Trigger confetti with a slight delay
      const confettiTimer = setTimeout(() => setShowConfetti(true), 200);

      // Animate XP counter
      const duration = 1500;
      const steps = 30;
      const increment = xpEarned / steps;
      let current = 0;
      const counterTimer = setInterval(() => {
        current += increment;
        if (current >= xpEarned) {
          setDisplayedXP(xpEarned);
          clearInterval(counterTimer);
        } else {
          setDisplayedXP(Math.floor(current));
        }
      }, duration / steps);

      return () => {
        clearTimeout(confettiTimer);
        clearInterval(counterTimer);
      };
    } else {
      setShowConfetti(false);
      setDisplayedXP(0);
    }
  }, [show, xpEarned]);

  return (
    <>
      <ConfettiExplosion
        show={showConfetti}
        intensity={isLastQuest ? 'epic' : 'epic'}
        duration={3000}
        origin={{ x: 50, y: 40 }}
        onComplete={() => setShowConfetti(false)}
      />

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="celebration-backdrop flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20 }}
              className={cn(
                'relative w-full max-w-lg p-8 rounded-2xl my-8',
                'bg-[var(--background-secondary)] border-2 border-[var(--achievement)]',
                'shadow-[0_0_60px_var(--achievement-muted)]'
              )}
            >
              {/* Quest icon with glow */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', damping: 12 }}
                className="flex justify-center mb-6"
              >
                <div
                  className={cn(
                    'w-24 h-24 rounded-2xl flex items-center justify-center',
                    'bg-gradient-to-br from-[var(--primary)] to-[var(--achievement)]',
                    'glow-epic'
                  )}
                >
                  <QuestIcon className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              {/* Quest number badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center mb-2"
              >
                <span
                  className={cn(
                    'px-4 py-1 rounded-full text-xs font-mono uppercase tracking-wider',
                    'bg-[var(--success-muted)] text-[var(--success)] border border-[var(--success)]'
                  )}
                >
                  {isLastQuest ? t('completion.journeyComplete') : `Quest ${questNumber} Complete`}
                </span>
              </motion.div>

              {/* Quest title */}
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center text-2xl md:text-3xl font-display font-bold gradient-text-fire mb-4"
              >
                {questTitle}
              </motion.h2>

              {/* Flavor text */}
              {flavorText && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center text-[var(--foreground-muted)] mb-6 italic"
                >
                  "{flavorText}"
                </motion.p>
              )}

              {/* XP Summary */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className={cn(
                  'p-4 rounded-xl mb-6',
                  'bg-[var(--accent-muted)] border border-[var(--accent)]',
                  'text-center'
                )}
              >
                <p className="text-sm text-[var(--foreground-muted)] mb-1">{t('postQuest.xpEarned')}</p>
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 text-[var(--accent)]" />
                  <span className="text-4xl font-display font-bold text-[var(--accent)]">
                    +{displayedXP}
                  </span>
                </div>
              </motion.div>

              {/* Recent Achievements */}
              {recentAchievements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  className="mb-6"
                >
                  <p className="text-sm text-[var(--foreground-muted)] text-center mb-3">
                    {t('postQuest.achievementsUnlocked')}
                  </p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {recentAchievements.slice(0, 3).map((unlock) => (
                      <div key={unlock.achievement.id} className="text-center">
                        <AchievementBadge
                          achievement={{ ...unlock.achievement, isUnlocked: true }}
                          size="sm"
                          animated={false}
                        />
                        <Badge variant={unlock.achievement.rarity} className="mt-1 text-xs">
                          +{unlock.xpAwarded} XP
                        </Badge>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Primary Continue button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  onClick={onContinue}
                  className={cn(
                    'w-full py-6 text-lg font-display font-semibold',
                    'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]',
                    'hover:from-[var(--primary-hover)] hover:to-[var(--secondary-hover)]',
                    'shadow-[0_0_30px_var(--primary-muted)]'
                  )}
                >
                  {isLastQuest ? t('postQuest.goToDashboard') : t('navigation.continue')}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>

              {/* What's Next Section */}
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 pt-6 border-t border-[var(--border)]"
                >
                  <p className="text-sm font-medium text-center mb-4">
                    {t('postQuest.whatsNext')}
                  </p>
                  <div className="space-y-2">
                    {suggestions.slice(0, 3).map((suggestion) => (
                      <Link key={suggestion.href} href={suggestion.href}>
                        <div
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg',
                            'bg-[var(--background-tertiary)] hover:bg-[var(--background-hover)]',
                            'border border-transparent hover:border-[var(--border-hover)]',
                            'transition-all cursor-pointer group'
                          )}
                        >
                          <div className="w-8 h-8 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center">
                            <suggestion.icon className="w-4 h-4 text-[var(--primary)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium group-hover:text-[var(--primary)] transition-colors">
                              {t(`postQuest.suggestions.${suggestion.label}`)}
                            </p>
                            <p className="text-xs text-[var(--foreground-muted)] truncate">
                              {t(`postQuest.suggestions.${suggestion.description}`)}
                            </p>
                          </div>
                          {suggestion.xp && (
                            <span className="text-xs text-[var(--accent)] font-medium">
                              +{suggestion.xp} XP
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-[var(--foreground-muted)] group-hover:text-[var(--primary)] transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Secondary Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex justify-center gap-4 mt-6"
              >
                {onViewAchievements && recentAchievements.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={onViewAchievements}>
                    <Trophy className="w-4 h-4 mr-2" />
                    {t('postQuest.viewAchievements')}
                  </Button>
                )}
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    {t('postQuest.goToDashboard')}
                  </Button>
                </Link>
              </motion.div>

              {/* Decorative corner elements */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-[var(--achievement)] opacity-50" />
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-[var(--achievement)] opacity-50" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-[var(--achievement)] opacity-50" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-[var(--achievement)] opacity-50" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default EnhancedQuestCompleteModal;
