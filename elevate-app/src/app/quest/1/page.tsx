'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Hammer,
  Lightbulb,
  Compass,
  Trophy,
  Rocket,
  Zap,
  Bot,
  Shield,
  Atom,
  Users,
  Settings,
  Sparkles,
  Map,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import {
  useArchetypeStore,
  ARCHETYPES,
  GAME_PREFERENCES,
  DOMAIN_INTERESTS,
  FOCUS_AREAS,
} from '@/stores/archetype-store';
import { useQuestStore } from '@/stores/quest-store';
import { useXPStore } from '@/stores/xp-store';
import { checkAchievements } from '@/stores/achievements-store';
import type { GamePreference, DomainInterest, FocusArea, ArchetypeId } from '@/themes/types';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Hammer,
  Lightbulb,
  Compass,
  Trophy,
  Rocket,
  Zap,
  Bot,
  Shield,
  Atom,
  Users,
  Settings,
  Map,
};

const STEPS = ['game', 'domain', 'focus', 'reveal'] as const;
type Step = (typeof STEPS)[number];

export default function Quest1Page() {
  const t = useTranslations('quest');
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('game');
  const [isLoading, setIsLoading] = useState(false);
  const [showReveal, setShowReveal] = useState(false);

  const {
    gamePreference,
    domainInterest,
    focusArea,
    archetype,
    setGamePreference,
    setDomainInterest,
    setFocusArea,
    completeQuiz,
    isComplete,
  } = useArchetypeStore();

  const { startQuest, completeQuest, getQuestStatus } = useQuestStore();
  const { awardXP } = useXPStore();

  // Start quest on mount
  useEffect(() => {
    const status = getQuestStatus(1);
    if (status === 'available') {
      startQuest(1);
    }
    // If already completed, redirect to quest 2
    if (status === 'completed' || isComplete) {
      router.push('/quest/2');
    }
  }, [getQuestStatus, startQuest, isComplete, router]);

  const stepIndex = STEPS.indexOf(currentStep);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 'game':
        return gamePreference !== null;
      case 'domain':
        return domainInterest !== null;
      case 'focus':
        return focusArea !== null;
      case 'reveal':
        return true;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;

    const nextIndex = stepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);

      // Show reveal animation when entering reveal step
      if (STEPS[nextIndex] === 'reveal') {
        setTimeout(() => setShowReveal(true), 300);
      }
    }
  };

  const handleBack = () => {
    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
      setShowReveal(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);

    try {
      // Complete the archetype quiz
      completeQuiz();

      // Award XP
      awardXP(100, 'archetype_complete', undefined, 'Completed Character Creation');

      // Check for archetype-related achievements
      if (archetype) {
        const unlocks = checkAchievements('archetype_complete', { archetype });
        // Award XP for any achievements unlocked
        unlocks.forEach((unlock) => {
          awardXP(
            unlock.xpAwarded,
            'quest_completion',
            unlock.achievement.id,
            `Achievement: ${unlock.achievement.name}`
          );
        });
      }

      // Complete quest 1, unlock quest 2
      completeQuest(1, 100);

      // Save to database
      await fetch('/api/user/archetype', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archetype,
          gamePreference,
          domainInterest,
          focusArea,
        }),
      });

      // Navigate to Quest 2
      router.push('/quest/2');
    } catch (error) {
      console.error('Failed to save archetype:', error);
      router.push('/quest/2');
    } finally {
      setIsLoading(false);
    }
  };

  const archetypeData = archetype ? ARCHETYPES[archetype] : null;
  const ArchetypeIcon = archetypeData ? iconMap[archetypeData.icon] : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-[var(--foreground-muted)]">
              {t('quest1.title')}
            </span>
            <span className="text-sm font-mono text-[var(--primary)]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1.5 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
            <motion.div
              className="h-full progress-gradient"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Game Preference */}
          {currentStep === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold font-display mb-2">
                  {t('quest1.game.title')}
                </h2>
                <p className="text-[var(--foreground-muted)]">
                  {t('quest1.game.subtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.entries(GAME_PREFERENCES) as [GamePreference, typeof GAME_PREFERENCES[GamePreference]][]).map(
                  ([key, pref]) => {
                    const Icon = iconMap[pref.icon];
                    const isSelected = gamePreference === key;

                    return (
                      <motion.button
                        key={key}
                        onClick={() => setGamePreference(key)}
                        className={cn(
                          'p-5 rounded-xl border text-left transition-all',
                          isSelected
                            ? 'border-[var(--primary)] bg-[var(--primary-muted)] glow-primary'
                            : 'border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--border-hover)]'
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              'w-12 h-12 rounded-lg flex items-center justify-center',
                              isSelected
                                ? 'bg-[var(--primary)]'
                                : 'bg-[var(--background-tertiary)]'
                            )}
                          >
                            {Icon && (
                              <Icon
                                className={cn(
                                  'w-6 h-6',
                                  isSelected ? 'text-white' : 'text-[var(--foreground-muted)]'
                                )}
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="font-display font-semibold text-lg">
                              {t(`quest1.game.options.${key}.label`)}
                            </span>
                            <p className="text-sm text-[var(--foreground-muted)] mt-1">
                              {t(`quest1.game.options.${key}.description`)}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-[var(--primary)]" />
                          )}
                        </div>
                      </motion.button>
                    );
                  }
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Domain Interest */}
          {currentStep === 'domain' && (
            <motion.div
              key="domain"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold font-display mb-2">
                  {t('quest1.domain.title')}
                </h2>
                <p className="text-[var(--foreground-muted)]">
                  {t('quest1.domain.subtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.entries(DOMAIN_INTERESTS) as [DomainInterest, typeof DOMAIN_INTERESTS[DomainInterest]][]).map(
                  ([key, domain]) => {
                    const Icon = iconMap[domain.icon];
                    const isSelected = domainInterest === key;

                    return (
                      <motion.button
                        key={key}
                        onClick={() => setDomainInterest(key)}
                        className={cn(
                          'p-5 rounded-xl border text-left transition-all',
                          isSelected
                            ? 'border-[var(--primary)] bg-[var(--primary-muted)] glow-primary'
                            : 'border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--border-hover)]'
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              'w-12 h-12 rounded-lg flex items-center justify-center'
                            )}
                            style={{
                              backgroundColor: isSelected
                                ? domain.color
                                : 'var(--background-tertiary)',
                            }}
                          >
                            {Icon && (
                              <Icon
                                className={cn(
                                  'w-6 h-6',
                                  isSelected ? 'text-white' : 'text-[var(--foreground-muted)]'
                                )}
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="font-display font-semibold text-lg">
                              {t(`quest1.domain.options.${key}.label`)}
                            </span>
                            <p className="text-sm text-[var(--foreground-muted)] mt-1">
                              {t(`quest1.domain.options.${key}.description`)}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-[var(--primary)]" />
                          )}
                        </div>
                      </motion.button>
                    );
                  }
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Focus Area */}
          {currentStep === 'focus' && (
            <motion.div
              key="focus"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold font-display mb-2">
                  {t('quest1.focus.title')}
                </h2>
                <p className="text-[var(--foreground-muted)]">
                  {t('quest1.focus.subtitle')}
                </p>
              </div>

              <div className="grid gap-3">
                {(Object.entries(FOCUS_AREAS) as [FocusArea, typeof FOCUS_AREAS[FocusArea]][]).map(
                  ([key, area]) => {
                    const Icon = iconMap[area.icon];
                    const isSelected = focusArea === key;

                    return (
                      <motion.button
                        key={key}
                        onClick={() => setFocusArea(key)}
                        className={cn(
                          'p-4 rounded-xl border text-left transition-all',
                          isSelected
                            ? 'border-[var(--primary)] bg-[var(--primary-muted)]'
                            : 'border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--border-hover)]'
                        )}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center',
                              isSelected
                                ? 'bg-[var(--primary)]'
                                : 'bg-[var(--background-tertiary)]'
                            )}
                          >
                            {Icon && (
                              <Icon
                                className={cn(
                                  'w-5 h-5',
                                  isSelected ? 'text-white' : 'text-[var(--foreground-muted)]'
                                )}
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="font-medium">
                              {t(`quest1.focus.options.${key}.label`)}
                            </span>
                            <p className="text-sm text-[var(--foreground-muted)]">
                              {t(`quest1.focus.options.${key}.description`)}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-[var(--primary)]" />
                          )}
                        </div>
                      </motion.button>
                    );
                  }
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Archetype Reveal */}
          {currentStep === 'reveal' && archetypeData && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <AnimatePresence>
                {showReveal && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                    className="text-center space-y-6"
                  >
                    {/* Archetype Icon */}
                    <motion.div
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mx-auto w-24 h-24 rounded-2xl flex items-center justify-center glow-achievement"
                      style={{ backgroundColor: archetypeData.color }}
                    >
                      {ArchetypeIcon && (
                        <ArchetypeIcon className="w-12 h-12 text-white" />
                      )}
                    </motion.div>

                    {/* Archetype Name */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h2 className="text-3xl md:text-4xl font-bold font-display gradient-text-fire">
                        {t(`quest1.reveal.archetype.${archetype}.name`)}
                      </h2>
                      <p className="text-lg text-[var(--foreground-muted)] mt-2">
                        {t(`quest1.reveal.archetype.${archetype}.tagline`)}
                      </p>
                    </motion.div>

                    {/* Description */}
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-[var(--foreground-muted)] max-w-md mx-auto"
                    >
                      {t(`quest1.reveal.archetype.${archetype}.description`)}
                    </motion.p>

                    {/* Traits */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="flex flex-wrap justify-center gap-2"
                    >
                      {archetypeData.traits.map((trait, index) => (
                        <span
                          key={trait}
                          className="px-3 py-1 rounded-full text-sm bg-[var(--background-secondary)] border border-[var(--border)]"
                        >
                          {t(`quest1.reveal.traits.${trait.toLowerCase()}`)}
                        </span>
                      ))}
                    </motion.div>

                    {/* XP Reward */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1, type: 'spring' }}
                      className="flex items-center justify-center gap-2 text-[var(--accent)]"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span className="font-display font-bold text-xl">+100 XP</span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={stepIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('navigation.back')}
          </Button>

          {currentStep !== 'reveal' ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              {t('navigation.next')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isLoading} className="glow-primary">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {t('quest1.reveal.continue')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
