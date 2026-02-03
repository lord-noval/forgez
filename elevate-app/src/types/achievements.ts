// Achievement System Types
// FORGE-Z Achievement/Medal System

// ============================================================================
// Enums
// ============================================================================

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type AchievementCategory =
  | 'quest_master'
  | 'xp_legend'
  | 'knowledge_seeker'
  | 'portfolio_artisan'
  | 'community_champion'
  | 'archetype_specialist'
  | 'pioneer';

// Triggers that can cause achievement checks
export type AchievementTrigger =
  | 'quest_complete'
  | 'level_up'
  | 'xp_milestone'
  | 'quiz_answer'
  | 'project_upload'
  | 'skill_add'
  | 'feedback_give'
  | 'feedback_receive'
  | 'hackathon_join'
  | 'hackathon_submit'
  | 'guild_join'
  | 'company_view'
  | 'role_explore'
  | 'course_start'
  | 'course_complete'
  | 'deep_dive_complete'
  | 'archetype_complete'
  | 'login'
  | 'profile_complete';

// ============================================================================
// Achievement Definition (static data)
// ============================================================================

export interface AchievementCriteria {
  trigger: AchievementTrigger;
  // Target value for progress-based achievements (e.g., "complete 5 quests")
  targetValue?: number;
  // Specific conditions (e.g., { questNumber: 1 } for "complete quest 1")
  conditions?: Record<string, unknown>;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string; // Lucide icon name
  xpReward: number;
  criteria: AchievementCriteria;
  // Whether this achievement tracks progress (e.g., "5 of 8 quests")
  hasProgress?: boolean;
  // Secret achievements are hidden until unlocked
  isSecret?: boolean;
}

// ============================================================================
// User Achievement (user-specific data)
// ============================================================================

export interface UserAchievement {
  id: string;
  usedId: string;
  achievementId: string;
  unlockedAt: string;
  notified: boolean;
}

export interface AchievementProgress {
  id: string;
  usedId: string;
  achievementId: string;
  currentValue: number;
  targetValue: number;
  updatedAt: string;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface PendingAchievementUnlock {
  achievement: AchievementDefinition;
  xpAwarded: number;
  unlockedAt: string;
}

// Achievement with user context (for display)
export interface AchievementWithStatus extends AchievementDefinition {
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
}

// ============================================================================
// API Response Types
// ============================================================================

export interface AchievementCheckResult {
  unlocked: AchievementDefinition[];
  progressUpdated: {
    achievementId: string;
    currentValue: number;
    targetValue: number;
  }[];
}

// ============================================================================
// Helper Constants
// ============================================================================

export const RARITY_ORDER: AchievementRarity[] = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
];

export const RARITY_XP_MULTIPLIER: Record<AchievementRarity, number> = {
  common: 1,
  uncommon: 1.5,
  rare: 2,
  epic: 3,
  legendary: 5,
};

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  quest_master: 'Quest Master',
  xp_legend: 'XP Legend',
  knowledge_seeker: 'Knowledge Seeker',
  portfolio_artisan: 'Portfolio Artisan',
  community_champion: 'Community Champion',
  archetype_specialist: 'Archetype Specialist',
  pioneer: 'Pioneer',
};

export const CATEGORY_ICONS: Record<AchievementCategory, string> = {
  quest_master: 'Scroll',
  xp_legend: 'Zap',
  knowledge_seeker: 'BookOpen',
  portfolio_artisan: 'Palette',
  community_champion: 'Users',
  archetype_specialist: 'Shield',
  pioneer: 'Compass',
};
