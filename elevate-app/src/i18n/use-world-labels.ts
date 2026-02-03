// i18n-based world labels hook
// Combines useTranslations with useWorldStore for world-specific labels

'use client';

import { useTranslations } from 'next-intl';
import { useWorldStore } from '@/stores/world-store';
import type { WorldId } from '@/themes/types';

// Types for the world labels structure (matches WorldLabels interface)
export interface WorldLabelsI18n {
  // Navigation
  dashboard: string;
  skills: string;
  profile: string;
  settings: string;
  portfolio: string;
  skillsBank: string;
  feedback: string;
  teams: string;
  careers: string;
  learn: string;
  compass: string;

  // Actions
  startJourney: string;
  continueJourney: string;
  viewProgress: string;

  // Greetings
  welcomeMessage: string;
  dailyGreeting: string;
}

/**
 * Hook that provides world-specific labels from i18n translations
 * This is a drop-in replacement for the original useWorldLabels hook
 * that used static TypeScript objects.
 *
 * Usage:
 * ```tsx
 * const labels = useWorldLabelsI18n();
 * console.log(labels.dashboard); // "Command Center" for COSMOS world
 * ```
 */
export function useWorldLabelsI18n(): WorldLabelsI18n {
  const { currentWorld } = useWorldStore();
  const t = useTranslations(`worlds.${currentWorld}`);

  return {
    // Navigation
    dashboard: t('navigation.dashboard'),
    skills: t('navigation.skills'),
    profile: t('navigation.profile'),
    settings: t('navigation.settings'),
    portfolio: t('navigation.portfolio'),
    skillsBank: t('navigation.skillsBank'),
    feedback: t('navigation.feedback'),
    teams: t('navigation.teams'),
    careers: t('navigation.careers'),
    learn: t('navigation.learn'),
    compass: t('navigation.compass'),

    // Actions
    startJourney: t('actions.startJourney'),
    continueJourney: t('actions.continueJourney'),
    viewProgress: t('actions.viewProgress'),

    // Greetings
    welcomeMessage: t('greetings.welcomeMessage'),
    dailyGreeting: t('greetings.dailyGreeting'),
  };
}

/**
 * Hook that provides world-specific terminology from i18n translations
 * Useful for custom vocabulary per world (e.g., "project" -> "mission" in COSMOS)
 */
export function useWorldTerminology() {
  const { currentWorld } = useWorldStore();
  const t = useTranslations(`worlds.${currentWorld}.terminology`);

  return {
    project: t('project'),
    projects: t('projects'),
    skill: t('skill'),
    skills: t('skills'),
    team: t('team'),
    teams: t('teams'),
    goal: t('goal'),
    goals: t('goals'),
    progress: t('progress'),
    achievement: t('achievement'),
    level: t('level'),
  };
}

/**
 * Hook that provides world metadata from i18n translations
 */
export function useWorldMeta() {
  const { currentWorld } = useWorldStore();
  const t = useTranslations(`worlds.${currentWorld}`);

  return {
    name: t('name'),
    tagline: t('tagline'),
    description: t('description'),
  };
}

/**
 * Get labels for a specific world (useful when you need labels for a world other than current)
 */
export function useLabelsForWorld(worldId: WorldId) {
  const t = useTranslations(`worlds.${worldId}`);

  return {
    // Navigation
    dashboard: t('navigation.dashboard'),
    skills: t('navigation.skills'),
    profile: t('navigation.profile'),
    settings: t('navigation.settings'),
    portfolio: t('navigation.portfolio'),
    skillsBank: t('navigation.skillsBank'),
    feedback: t('navigation.feedback'),
    teams: t('navigation.teams'),
    careers: t('navigation.careers'),
    learn: t('navigation.learn'),
    compass: t('navigation.compass'),

    // Actions
    startJourney: t('actions.startJourney'),
    continueJourney: t('actions.continueJourney'),
    viewProgress: t('actions.viewProgress'),

    // Greetings
    welcomeMessage: t('greetings.welcomeMessage'),
    dailyGreeting: t('greetings.dailyGreeting'),
  };
}
