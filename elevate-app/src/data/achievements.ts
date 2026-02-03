// Achievement Definitions Registry
// FORGE-Z - 40 Achievements across 7 categories

import type { AchievementDefinition } from '@/types/achievements';

// ============================================================================
// Quest Master Achievements (8)
// ============================================================================

const questMasterAchievements: AchievementDefinition[] = [
  {
    id: 'quest_first_step',
    name: 'First Step',
    description: 'Complete your first quest and begin your FORGE-Z journey',
    category: 'quest_master',
    rarity: 'common',
    icon: 'Footprints',
    xpReward: 25,
    criteria: {
      trigger: 'quest_complete',
      conditions: { questNumber: 1 },
    },
  },
  {
    id: 'quest_artifact_seeker',
    name: 'Artifact Seeker',
    description: 'Discover your first epic technology artifact',
    category: 'quest_master',
    rarity: 'common',
    icon: 'Gem',
    xpReward: 25,
    criteria: {
      trigger: 'quest_complete',
      conditions: { questNumber: 2 },
    },
  },
  {
    id: 'quest_deep_diver',
    name: 'Deep Diver',
    description: 'Complete the Deep Dive quest and unlock knowledge',
    category: 'quest_master',
    rarity: 'uncommon',
    icon: 'Anchor',
    xpReward: 50,
    criteria: {
      trigger: 'quest_complete',
      conditions: { questNumber: 3 },
    },
  },
  {
    id: 'quest_guild_explorer',
    name: 'Guild Explorer',
    description: 'Explore companies and guilds across regions',
    category: 'quest_master',
    rarity: 'uncommon',
    icon: 'Building2',
    xpReward: 50,
    criteria: {
      trigger: 'quest_complete',
      conditions: { questNumber: 4 },
    },
  },
  {
    id: 'quest_talent_hunter',
    name: 'Talent Hunter',
    description: 'Complete the Talent Hunt and discover career roles',
    category: 'quest_master',
    rarity: 'uncommon',
    icon: 'Target',
    xpReward: 50,
    criteria: {
      trigger: 'quest_complete',
      conditions: { questNumber: 5 },
    },
  },
  {
    id: 'quest_wisdom_seeker',
    name: 'Wisdom Seeker',
    description: 'Learn from the leaders and assess your soft skills',
    category: 'quest_master',
    rarity: 'rare',
    icon: 'Brain',
    xpReward: 75,
    criteria: {
      trigger: 'quest_complete',
      conditions: { questNumber: 6 },
    },
  },
  {
    id: 'quest_skill_forger',
    name: 'Skill Forger',
    description: 'Visit the Skill Forge and start your learning path',
    category: 'quest_master',
    rarity: 'rare',
    icon: 'Flame',
    xpReward: 75,
    criteria: {
      trigger: 'quest_complete',
      conditions: { questNumber: 7 },
    },
  },
  {
    id: 'quest_champion',
    name: 'Quest Champion',
    description: 'Complete all 8 quests and master the FORGE-Z journey',
    category: 'quest_master',
    rarity: 'epic',
    icon: 'Crown',
    xpReward: 250,
    criteria: {
      trigger: 'quest_complete',
      targetValue: 8,
    },
    hasProgress: true,
  },
];

// ============================================================================
// XP Legend Achievements (7)
// ============================================================================

const xpLegendAchievements: AchievementDefinition[] = [
  {
    id: 'xp_first_hundred',
    name: 'First Hundred',
    description: 'Earn your first 100 XP',
    category: 'xp_legend',
    rarity: 'common',
    icon: 'Sparkles',
    xpReward: 25,
    criteria: {
      trigger: 'xp_milestone',
      conditions: { xpThreshold: 100 },
    },
  },
  {
    id: 'xp_rising_star',
    name: 'Rising Star',
    description: 'Reach Level 2 and prove your dedication',
    category: 'xp_legend',
    rarity: 'common',
    icon: 'Star',
    xpReward: 25,
    criteria: {
      trigger: 'level_up',
      conditions: { level: 2 },
    },
  },
  {
    id: 'xp_adventurer',
    name: 'Adventurer',
    description: 'Reach Level 5 and establish yourself',
    category: 'xp_legend',
    rarity: 'uncommon',
    icon: 'Compass',
    xpReward: 50,
    criteria: {
      trigger: 'level_up',
      conditions: { level: 5 },
    },
  },
  {
    id: 'xp_veteran',
    name: 'Veteran',
    description: 'Reach Level 10 and become a seasoned explorer',
    category: 'xp_legend',
    rarity: 'uncommon',
    icon: 'Shield',
    xpReward: 75,
    criteria: {
      trigger: 'level_up',
      conditions: { level: 10 },
    },
  },
  {
    id: 'xp_elite',
    name: 'Elite',
    description: 'Reach Level 20 and join the elite ranks',
    category: 'xp_legend',
    rarity: 'rare',
    icon: 'Medal',
    xpReward: 100,
    criteria: {
      trigger: 'level_up',
      conditions: { level: 20 },
    },
  },
  {
    id: 'xp_master',
    name: 'Master',
    description: 'Reach Level 35 and achieve mastery',
    category: 'xp_legend',
    rarity: 'epic',
    icon: 'Award',
    xpReward: 200,
    criteria: {
      trigger: 'level_up',
      conditions: { level: 35 },
    },
  },
  {
    id: 'xp_grandmaster',
    name: 'Grandmaster',
    description: 'Reach the legendary Level 50',
    category: 'xp_legend',
    rarity: 'legendary',
    icon: 'Trophy',
    xpReward: 500,
    criteria: {
      trigger: 'level_up',
      conditions: { level: 50 },
    },
  },
];

// ============================================================================
// Knowledge Seeker Achievements (6)
// ============================================================================

const knowledgeSeekerAchievements: AchievementDefinition[] = [
  {
    id: 'know_first_correct',
    name: 'Quick Learner',
    description: 'Answer your first quiz question correctly',
    category: 'knowledge_seeker',
    rarity: 'common',
    icon: 'CheckCircle',
    xpReward: 25,
    criteria: {
      trigger: 'quiz_answer',
      targetValue: 1,
    },
    hasProgress: true,
  },
  {
    id: 'know_quiz_ace',
    name: 'Quiz Ace',
    description: 'Answer 5 quiz questions correctly',
    category: 'knowledge_seeker',
    rarity: 'common',
    icon: 'GraduationCap',
    xpReward: 25,
    criteria: {
      trigger: 'quiz_answer',
      targetValue: 5,
    },
    hasProgress: true,
  },
  {
    id: 'know_quiz_master',
    name: 'Quiz Master',
    description: 'Answer 20 quiz questions correctly',
    category: 'knowledge_seeker',
    rarity: 'uncommon',
    icon: 'Lightbulb',
    xpReward: 50,
    criteria: {
      trigger: 'quiz_answer',
      targetValue: 20,
    },
    hasProgress: true,
  },
  {
    id: 'know_deep_dive_first',
    name: 'Deep Knowledge',
    description: 'Complete your first deep dive content',
    category: 'knowledge_seeker',
    rarity: 'uncommon',
    icon: 'BookOpen',
    xpReward: 50,
    criteria: {
      trigger: 'deep_dive_complete',
      targetValue: 1,
    },
    hasProgress: true,
  },
  {
    id: 'know_course_starter',
    name: 'Course Starter',
    description: 'Start your first learning course',
    category: 'knowledge_seeker',
    rarity: 'common',
    icon: 'Play',
    xpReward: 25,
    criteria: {
      trigger: 'course_start',
      targetValue: 1,
    },
    hasProgress: true,
  },
  {
    id: 'know_scholar',
    name: 'Scholar',
    description: 'Complete 5 deep dive content paths',
    category: 'knowledge_seeker',
    rarity: 'rare',
    icon: 'Library',
    xpReward: 100,
    criteria: {
      trigger: 'deep_dive_complete',
      targetValue: 5,
    },
    hasProgress: true,
  },
];

// ============================================================================
// Portfolio Artisan Achievements (6)
// ============================================================================

const portfolioArtisanAchievements: AchievementDefinition[] = [
  {
    id: 'port_first_project',
    name: 'Creator',
    description: 'Upload your first project to your portfolio',
    category: 'portfolio_artisan',
    rarity: 'common',
    icon: 'Plus',
    xpReward: 25,
    criteria: {
      trigger: 'project_upload',
      targetValue: 1,
    },
    hasProgress: true,
  },
  {
    id: 'port_three_projects',
    name: 'Builder',
    description: 'Build a portfolio with 3 projects',
    category: 'portfolio_artisan',
    rarity: 'common',
    icon: 'Layers',
    xpReward: 25,
    criteria: {
      trigger: 'project_upload',
      targetValue: 3,
    },
    hasProgress: true,
  },
  {
    id: 'port_five_projects',
    name: 'Craftsman',
    description: 'Expand your portfolio to 5 projects',
    category: 'portfolio_artisan',
    rarity: 'uncommon',
    icon: 'Hammer',
    xpReward: 50,
    criteria: {
      trigger: 'project_upload',
      targetValue: 5,
    },
    hasProgress: true,
  },
  {
    id: 'port_ten_projects',
    name: 'Master Artisan',
    description: 'Showcase 10 projects in your portfolio',
    category: 'portfolio_artisan',
    rarity: 'rare',
    icon: 'Palette',
    xpReward: 100,
    criteria: {
      trigger: 'project_upload',
      targetValue: 10,
    },
    hasProgress: true,
  },
  {
    id: 'port_skill_collector',
    name: 'Skill Collector',
    description: 'Add 10 different skills to your profile',
    category: 'portfolio_artisan',
    rarity: 'uncommon',
    icon: 'Tags',
    xpReward: 50,
    criteria: {
      trigger: 'skill_add',
      targetValue: 10,
    },
    hasProgress: true,
  },
  {
    id: 'port_master_artisan',
    name: 'Portfolio Legend',
    description: 'Have 15+ projects with 25+ total skills',
    category: 'portfolio_artisan',
    rarity: 'epic',
    icon: 'Gem',
    xpReward: 250,
    criteria: {
      trigger: 'project_upload',
      conditions: { minProjects: 15, minSkills: 25 },
    },
  },
];

// ============================================================================
// Community Champion Achievements (6)
// ============================================================================

const communityChampionAchievements: AchievementDefinition[] = [
  {
    id: 'comm_first_feedback',
    name: 'Helpful Peer',
    description: 'Give your first peer feedback',
    category: 'community_champion',
    rarity: 'common',
    icon: 'MessageCircle',
    xpReward: 25,
    criteria: {
      trigger: 'feedback_give',
      targetValue: 1,
    },
    hasProgress: true,
  },
  {
    id: 'comm_feedback_giver',
    name: 'Feedback Champion',
    description: 'Give 5 peer feedback reviews',
    category: 'community_champion',
    rarity: 'uncommon',
    icon: 'MessagesSquare',
    xpReward: 50,
    criteria: {
      trigger: 'feedback_give',
      targetValue: 5,
    },
    hasProgress: true,
  },
  {
    id: 'comm_hackathon_joiner',
    name: 'Hackathon Rookie',
    description: 'Join your first hackathon',
    category: 'community_champion',
    rarity: 'uncommon',
    icon: 'Rocket',
    xpReward: 50,
    criteria: {
      trigger: 'hackathon_join',
      targetValue: 1,
    },
    hasProgress: true,
  },
  {
    id: 'comm_hackathon_submitter',
    name: 'Hackathon Hero',
    description: 'Submit your first hackathon project',
    category: 'community_champion',
    rarity: 'rare',
    icon: 'Trophy',
    xpReward: 100,
    criteria: {
      trigger: 'hackathon_submit',
      targetValue: 1,
    },
    hasProgress: true,
  },
  {
    id: 'comm_guild_member',
    name: 'Guild Member',
    description: 'Join a Discord community guild',
    category: 'community_champion',
    rarity: 'common',
    icon: 'Users',
    xpReward: 25,
    criteria: {
      trigger: 'guild_join',
      targetValue: 1,
    },
    hasProgress: true,
  },
  {
    id: 'comm_mentor',
    name: 'Mentor',
    description: 'Give 10 peer feedback reviews and help others grow',
    category: 'community_champion',
    rarity: 'rare',
    icon: 'HeartHandshake',
    xpReward: 100,
    criteria: {
      trigger: 'feedback_give',
      targetValue: 10,
    },
    hasProgress: true,
  },
];

// ============================================================================
// Archetype Specialist Achievements (4)
// ============================================================================

const archetypeSpecialistAchievements: AchievementDefinition[] = [
  {
    id: 'arch_discovered',
    name: 'Identity Found',
    description: 'Discover your career archetype',
    category: 'archetype_specialist',
    rarity: 'common',
    icon: 'User',
    xpReward: 25,
    criteria: {
      trigger: 'archetype_complete',
    },
  },
  {
    id: 'arch_builder',
    name: 'The Builder',
    description: 'Embrace the Builder archetype - creating is understanding',
    category: 'archetype_specialist',
    rarity: 'uncommon',
    icon: 'Wrench',
    xpReward: 50,
    criteria: {
      trigger: 'archetype_complete',
      conditions: { archetype: 'BUILDER' },
    },
    isSecret: true,
  },
  {
    id: 'arch_strategist',
    name: 'The Strategist',
    description: 'Embrace the Strategist archetype - planning is winning',
    category: 'archetype_specialist',
    rarity: 'uncommon',
    icon: 'Map',
    xpReward: 50,
    criteria: {
      trigger: 'archetype_complete',
      conditions: { archetype: 'STRATEGIST' },
    },
    isSecret: true,
  },
  {
    id: 'arch_explorer',
    name: 'The Explorer',
    description: 'Embrace the Explorer archetype - discovery is the goal',
    category: 'archetype_specialist',
    rarity: 'uncommon',
    icon: 'Compass',
    xpReward: 50,
    criteria: {
      trigger: 'archetype_complete',
      conditions: { archetype: 'EXPLORER' },
    },
    isSecret: true,
  },
];

// ============================================================================
// Pioneer Achievements (3)
// ============================================================================

const pioneerAchievements: AchievementDefinition[] = [
  {
    id: 'pioneer_early_adopter',
    name: 'Early Adopter',
    description: 'Be among the first to join FORGE-Z',
    category: 'pioneer',
    rarity: 'rare',
    icon: 'Rocket',
    xpReward: 100,
    criteria: {
      trigger: 'login',
      conditions: { earlyAdopter: true },
    },
    isSecret: true,
  },
  {
    id: 'pioneer_company_explorer',
    name: 'Industry Scout',
    description: 'Explore 10 different companies',
    category: 'pioneer',
    rarity: 'uncommon',
    icon: 'Building',
    xpReward: 50,
    criteria: {
      trigger: 'company_view',
      targetValue: 10,
    },
    hasProgress: true,
  },
  {
    id: 'pioneer_role_explorer',
    name: 'Career Explorer',
    description: 'Explore 10 different career roles',
    category: 'pioneer',
    rarity: 'uncommon',
    icon: 'Briefcase',
    xpReward: 50,
    criteria: {
      trigger: 'role_explore',
      targetValue: 10,
    },
    hasProgress: true,
  },
];

// ============================================================================
// Combined Achievements Array
// ============================================================================

export const ACHIEVEMENTS: AchievementDefinition[] = [
  ...questMasterAchievements,
  ...xpLegendAchievements,
  ...knowledgeSeekerAchievements,
  ...portfolioArtisanAchievements,
  ...communityChampionAchievements,
  ...archetypeSpecialistAchievements,
  ...pioneerAchievements,
];

// ============================================================================
// Helper Functions
// ============================================================================

export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export function getAchievementsByCategory(
  category: AchievementDefinition['category']
): AchievementDefinition[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

export function getAchievementsByRarity(
  rarity: AchievementDefinition['rarity']
): AchievementDefinition[] {
  return ACHIEVEMENTS.filter((a) => a.rarity === rarity);
}

export function getAchievementsByTrigger(
  trigger: AchievementDefinition['criteria']['trigger']
): AchievementDefinition[] {
  return ACHIEVEMENTS.filter((a) => a.criteria.trigger === trigger);
}

// Category counts for UI
export const ACHIEVEMENT_COUNTS = {
  total: ACHIEVEMENTS.length,
  byCategory: {
    quest_master: questMasterAchievements.length,
    xp_legend: xpLegendAchievements.length,
    knowledge_seeker: knowledgeSeekerAchievements.length,
    portfolio_artisan: portfolioArtisanAchievements.length,
    community_champion: communityChampionAchievements.length,
    archetype_specialist: archetypeSpecialistAchievements.length,
    pioneer: pioneerAchievements.length,
  },
  byRarity: {
    common: ACHIEVEMENTS.filter((a) => a.rarity === 'common').length,
    uncommon: ACHIEVEMENTS.filter((a) => a.rarity === 'uncommon').length,
    rare: ACHIEVEMENTS.filter((a) => a.rarity === 'rare').length,
    epic: ACHIEVEMENTS.filter((a) => a.rarity === 'epic').length,
    legendary: ACHIEVEMENTS.filter((a) => a.rarity === 'legendary').length,
  },
};
