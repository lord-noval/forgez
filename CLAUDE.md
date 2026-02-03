# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FORGE-Z** is an RPG-style career exploration platform for young people interested in engineering and technical careers. Users complete an **8-Quest journey** to discover their archetype, explore epic technologies, understand industries, and build skills.

> **Note**: This project was previously called "Elevate" with multiple narrative worlds. It has been rebranded to **FORGE-Z** with a single unified theme.

### Branding & Naming Convention

When using the FORGE-Z brand name:
- **Display strings (UI/branding)**: Use `"FORGE-Z"` (with hyphen) - for user-visible text in translations, logos, titles
- **Code identifiers (TypeScript/Database)**: Use `'FORGEZ'` (no hyphen) - for type values, ENUM values, WorldId

```typescript
// UI/Translations - with hyphen
"title": "Welcome to FORGE-Z"

// TypeScript types - no hyphen
export type WorldId = 'forgez';
export type SkillFramework = 'ESCO' | 'SFIA' | 'ONET' | 'FORGEZ' | 'CUSTOM';
```

**Core Features:**
- **8-Quest System**: Progressive journey from character creation to guild hall
- **Archetypes**: Builder, Strategist, Explorer, Competitor - determined by personality quiz
- **XP & Leveling**: Earn XP through quests, courses, hackathons, and portfolio projects
- **Achievements**: 40 achievements across 7 categories with rarity tiers and XP rewards
- **Epic Objects**: Showcase technologies like Starlink satellites, Boston Dynamics robots, Mars rovers
- **Guilds**: Discover companies across Poland, Germany, Ukraine, and USA
- **Skill Forge**: Curated learning marketplace with affiliate integrations
- **Guild Hall**: Hackathons, Discord communities, and portfolio showcase
- **360° Feedback**: Peer feedback system with anonymous response capability
- **Teams**: Team discovery and matching system

**Target Industries**: Space, Energy, Robotics, Defense

## Tech Stack

- **Frontend**: Next.js 16 with React 19, TypeScript, TailwindCSS 4, Framer Motion, Zustand
- **Backend**: Next.js API Routes with Supabase (PostgreSQL + Auth + Storage)
- **State**: Zustand stores for client state, Supabase for persistence
- **AI**: GPT-4o for skill extraction from projects (via Edge Functions)
- **i18n**: next-intl for internationalization (English + Polish)
- **PWA**: Service worker with offline support, installable app
- **Testing**: Vitest for unit tests, Playwright for E2E tests

## Commands

```bash
cd elevate-app          # All commands run from elevate-app directory
npm run dev             # Start development server (port 3000)
npm run build           # Build for production
npm start               # Start production server
npm run lint            # Run ESLint

# Testing
npm run test            # Run Vitest in watch mode
npm run test:run        # Run tests once
npm run test:coverage   # Run tests with coverage report
npm run test:ui         # Run tests with Vitest UI
npm run test:e2e        # Run Playwright E2E tests
npm run test:e2e:ui     # Run Playwright with UI

# Utilities
npm run generate-icons  # Generate PWA icons from source
```

## Architecture

### Directory Structure

```
elevate-app/
├── public/
│   ├── sw.js                    # Service worker for PWA
│   ├── manifest.json            # Web app manifest
│   └── icons/                   # PWA icons
└── src/
    ├── app/
    │   ├── (auth)/              # Login/signup pages
    │   ├── (dashboard)/         # Main app pages with sidebar layout
    │   │   ├── portfolio/       # Project portfolio pages
    │   │   ├── skills/bank/     # Skill Tree dashboard
    │   │   ├── feedback/        # 360-degree feedback pages
    │   │   ├── teams/           # Team discovery and matching
    │   │   ├── careers/         # Job listings and applications
    │   │   ├── learn/           # Learning recommendations
    │   │   ├── compass/         # Career path visualization
    │   │   └── ...
    │   ├── quest/               # 8-Quest journey pages
    │   │   ├── layout.tsx       # Quest wrapper with progress bar
    │   │   ├── 1/page.tsx       # Character Creation
    │   │   ├── 2/page.tsx       # Epic Artifact viewer
    │   │   ├── 3/page.tsx       # Deep Dive with quizzes
    │   │   ├── 4/page.tsx       # Guilds (companies) + RegionMap
    │   │   ├── 5/page.tsx       # Talent Hunt + DemandChart
    │   │   ├── 6/page.tsx       # Leader's Wisdom + SuccessRadar
    │   │   ├── 7/page.tsx       # Skill Forge + SkillTree
    │   │   ├── 8/page.tsx       # Guild Hall
    │   │   └── 8/hackathons/    # Hackathon listing + detail pages
    │   │       ├── page.tsx     # Full hackathon listing
    │   │       └── [id]/page.tsx # Individual hackathon detail
    │   ├── feedback/respond/    # Public feedback response pages
    │   │   └── [token]/page.tsx # Anonymous feedback form
    │   ├── api/                 # API routes
    │   │   ├── achievements/    # Achievement system endpoints
    │   │   ├── projects/        # Portfolio CRUD + file upload
    │   │   ├── skills/          # Taxonomy and user skills
    │   │   ├── feedback/        # Feedback requests + respond endpoint
    │   │   ├── jobs/            # Job listings
    │   │   ├── teams/           # Team discovery
    │   │   ├── epic-objects/    # Epic technology objects
    │   │   ├── deep-dive/       # Deep dive content + quizzes
    │   │   ├── companies/       # Company/guild data
    │   │   ├── roles/           # Talent roles data
    │   │   ├── hackathons/      # Hackathon listings
    │   │   ├── discord-guilds/  # Discord community data
    │   │   └── ...
    │   └── onboarding/          # Onboarding (redirects to quest)
    ├── components/
    │   ├── ui/                  # Reusable primitives (Button, Card, Badge, etc.)
    │   ├── dashboard/           # Sidebar, mobile-nav, layout components
    │   ├── quest/               # Quest components (XPBadge, QuestProgress)
    │   ├── epic-object/         # ArtifactViewer, SpecsGrid
    │   ├── skill-forge/         # SkillTree, ProgressWidget
    │   ├── guilds/              # RegionMap
    │   ├── talent/              # DemandChart
    │   ├── wisdom/              # SuccessRadar
    │   ├── portfolio/           # Project cards, gallery, uploader
    │   ├── skills/              # Skill badges, charts, bank dashboard
    │   ├── achievements/        # AchievementBadge, AchievementUnlockModal
    │   ├── celebrations/        # ConfettiExplosion, FloatingXP, LevelUpCelebration
    │   ├── employer/            # JobCard, CompanyProfile, JobApplicationModal
    │   ├── teams/               # TeamCard
    │   ├── social/              # ShareButton, ShareModal
    │   ├── deep-dive/           # ContentRenderer, QuizCard, LearningPathCard
    │   ├── feedback/            # FeedbackCard, ResponseRecorder
    │   ├── pwa/                 # PWA provider, install prompt
    │   └── providers/           # WorldProvider, theme management
    ├── data/                    # Static data definitions
    │   └── achievements.ts      # 40 achievement definitions
    ├── stores/
    │   ├── quest-store.ts       # Quest progression state
    │   ├── archetype-store.ts   # User archetype state
    │   ├── xp-store.ts          # XP and leveling system
    │   ├── world-store.ts       # Theme state (FORGE-Z theme)
    │   ├── projects-store.ts    # Portfolio management
    │   ├── skills-store.ts      # User skills and taxonomy
    │   ├── achievements-store.ts # Achievement tracking and unlocks
    │   ├── feedback-store.ts    # 360 feedback requests
    │   ├── user-store.ts        # User profile state
    │   ├── locale-store.ts      # Language preference
    │   └── toast-store.ts       # Notification system
    ├── types/                   # TypeScript type definitions
    │   └── achievements.ts      # Achievement system types
    ├── themes/                  # FORGE-Z theme configuration
    │   ├── world-themes.ts      # Color palette (fire orange/gold/cyan)
    │   ├── world-labels.ts      # RPG terminology
    │   ├── world-assets.ts      # Icons
    │   └── types.ts             # Quest, Archetype, WorldId types
    ├── hooks/                   # Custom React hooks
    │   ├── use-pwa-install.ts   # PWA installation hook
    │   └── use-localized-toast.ts # i18n toast notifications
    ├── lib/                     # Utility libraries
    │   ├── supabase/            # Supabase client (server.ts, client.ts)
    │   ├── pwa/                 # PWA utilities (register-sw.ts)
    │   └── social-share.ts      # Social sharing utilities
    └── i18n/                    # Internationalization
        └── locales/             # Translation files (en/pl)
```

### 8-Quest System

| Quest | Name | Purpose | XP Reward | Key Components |
|-------|------|---------|-----------|----------------|
| 1 | Character Creation | Determine archetype via quiz | 100 | Archetype reveal animation |
| 2 | Epic Artifact | Reveal matched technology | 25/object | ArtifactViewer, SpecsGrid |
| 3 | Deep Dive | Educational content + quizzes | 75/path | Video player, quiz cards |
| 4 | The Guilds | Company discovery by region | 10/company | **RegionMap**, company cards |
| 5 | Talent Hunt | Role/salary exploration | 25/role | **DemandChart**, role details |
| 6 | Leader's Wisdom | Soft skills assessment (10 questions) | 100 | Quote carousel, **SuccessRadar** |
| 7 | Skill Forge | Learning marketplace | 25/course | **SkillTree**, **ProgressWidget** |
| 8 | Guild Hall | Hackathons, community, portfolio | 50-200/action | Hackathon detail pages |

### Visual Components (Quest Enhancements)

| Component | Location | Purpose |
|-----------|----------|---------|
| `RegionMap` | `components/guilds/` | Interactive map with Poland/Germany/Ukraine/USA |
| `DemandChart` | `components/talent/` | Horizontal bar chart for role demand growth |
| `SuccessRadar` | `components/wisdom/` | 8-axis radar chart for soft skills |
| `SkillTree` | `components/skill-forge/` | Visual skill progression tree |
| `ProgressWidget` | `components/skill-forge/` | Learning path progress tracker |

### Gamification Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `AchievementBadge` | `components/achievements/` | Display achievement with rarity styling |
| `AchievementUnlockModal` | `components/achievements/` | Celebration modal for new unlocks |
| `ConfettiExplosion` | `components/celebrations/` | Confetti animation effect |
| `FloatingXP` | `components/celebrations/` | Animated XP gain display |
| `LevelUpCelebration` | `components/celebrations/` | Level up notification |
| `QuestCompleteModal` | `components/celebrations/` | Quest completion celebration |

### Archetypes

| Archetype | Tagline | Traits | Game Preference |
|-----------|---------|--------|-----------------|
| BUILDER | Creating is understanding | Hands-on, Creative, Patient | Sandbox (Minecraft, Factorio) |
| STRATEGIST | Planning is winning | Analytical, Systematic, Forward-thinking | Strategy (Civilization, XCOM) |
| EXPLORER | Discovery is the goal | Curious, Adventurous, Open-minded | Adventure (Zelda, Outer Wilds) |
| COMPETITOR | Excellence through challenge | Driven, Focused, Resilient | Esports (LoL, Valorant) |

### XP System

- Level formula: `level = floor(sqrt(totalXP / 100))`
- Transactions logged with source, amount, description

**Valid XP Sources** (see `xp-store.ts`):
```typescript
type XPSource =
  | 'quest_completion'
  | 'quiz_correct'
  | 'project_upload'
  | 'peer_review'
  | 'hackathon_join'
  | 'hackathon_submit'
  | 'guild_join'
  | 'company_view'
  | 'role_explore'
  | 'course_start'
  | 'deep_dive_complete'
  | 'archetype_complete';
```

### Achievement System

40 achievements across 7 categories with rarity-based XP rewards.

**Categories** (`AchievementCategory`):
| Category | Label | Icon |
|----------|-------|------|
| `quest_master` | Quest Master | Scroll |
| `xp_legend` | XP Legend | Zap |
| `knowledge_seeker` | Knowledge Seeker | BookOpen |
| `portfolio_artisan` | Portfolio Artisan | Palette |
| `community_champion` | Community Champion | Users |
| `archetype_specialist` | Archetype Specialist | Shield |
| `pioneer` | Pioneer | Compass |

**Rarity Levels** (with XP multipliers):
| Rarity | Multiplier |
|--------|------------|
| `common` | 1x |
| `uncommon` | 1.5x |
| `rare` | 2x |
| `epic` | 3x |
| `legendary` | 5x |

**Achievement Triggers** (`AchievementTrigger`):
```typescript
type AchievementTrigger =
  | 'quest_complete' | 'level_up' | 'xp_milestone'
  | 'quiz_answer' | 'project_upload' | 'skill_add'
  | 'feedback_give' | 'feedback_receive'
  | 'hackathon_join' | 'hackathon_submit'
  | 'guild_join' | 'company_view' | 'role_explore'
  | 'course_start' | 'course_complete' | 'deep_dive_complete'
  | 'archetype_complete' | 'login' | 'profile_complete';
```

**Key Files:**
- `src/types/achievements.ts` - Type definitions
- `src/data/achievements.ts` - 40 achievement definitions
- `src/stores/achievements-store.ts` - State management
- `src/components/achievements/` - UI components

**Usage Pattern:**
```typescript
import { useAchievementsStore, checkAchievements } from '@/stores/achievements-store';

// Check achievements after an action
checkAchievements('quest_complete', { questNumber: 1 });

// In components
const { pendingUnlock, acknowledgePendingUnlock } = useAchievementsStore();
```

### Theme System (FORGE-Z)

**IMPORTANT**: FORGE-Z uses a **single unified theme**. The `WorldId` type is `'forgez'` only.

```typescript
// In themes/types.ts
export type WorldId = 'forgez';
```

**Theme Colors:**
- **Primary**: Fire Orange (#F97316)
- **Secondary**: Gold (#EAB308)
- **Accent**: Cyan (#22D3EE)
- **Background**: Dark (#0D0D0F)

CSS variables applied via `data-world="forgez"` on `<html>` element.

**Common Pitfall**: Legacy code may reference old world IDs (cosmos, forge, nexus, terra, quantum). Always use `'forgez'` in `Record<WorldId, ...>` types.

### Key Stores

| Store | Purpose |
|-------|---------|
| `quest-store.ts` | Quest progression, status, XP rewards |
| `archetype-store.ts` | User archetype, game/domain preferences |
| `xp-store.ts` | Total XP, level, transaction history |
| `world-store.ts` | Theme state (fixed to 'forgez') |
| `projects-store.ts` | Portfolio projects and artifacts |
| `skills-store.ts` | User skills, taxonomy, endorsements |
| `achievements-store.ts` | Achievement tracking, unlocks, progress |
| `feedback-store.ts` | 360 feedback requests and responses |
| `user-store.ts` | User profile and authentication state |
| `locale-store.ts` | Language preference (en/pl) |
| `toast-store.ts` | Toast notification system |

### API Routes

**Quest System:**
- `GET /api/user/archetype` - Get user archetype
- `POST /api/user/archetype` - Save archetype results
- `GET /api/epic-objects` - Get epic objects (filtered by category/industry)
- `GET /api/deep-dive` - Get deep dive content for an object
- `GET /api/companies` - Get companies by region/industry
- `GET /api/roles` - Get talent roles
- `GET /api/leader-insights` - Get leader quotes
- `GET /api/soft-skills` - Get soft skills list
- `GET /api/hackathons` - Get hackathon listings
- `GET /api/discord-guilds` - Get Discord communities

**Achievements:**
- `GET /api/achievements` - List all achievement definitions
- `POST /api/achievements/check` - Check for unlocked achievements
- `GET /api/achievements/user` - Get user's achievement progress

**Portfolio:**
- `GET/POST /api/projects` - List/create projects
- `GET/PUT/DELETE /api/projects/[projectId]` - Individual project operations
- `POST /api/projects/[projectId]/analyze` - AI skill extraction
- `POST /api/projects/upload` - Get signed upload URL

**Feedback:**
- `GET/POST /api/feedback/requests` - List/create feedback requests
- `GET /api/feedback/requests/[requestId]` - Get feedback request details
- `POST /api/feedback/respond/[token]` - Submit anonymous feedback

**Jobs & Teams:**
- `GET /api/jobs` - List job openings
- `GET /api/jobs/[jobId]` - Get job details
- `GET /api/teams` - List teams
- `GET /api/teams/[teamId]` - Get team details

**Learning:**
- `GET /api/learn/recommendations` - Learning recommendations

### Database Schema (FORGE-Z specific)

**Key ENUM Types:**
```sql
-- Skill framework
CREATE TYPE skill_framework AS ENUM ('ESCO', 'SFIA', 'ONET', 'FORGEZ', 'CUSTOM');

-- Skill category
CREATE TYPE skill_category AS ENUM ('KNOWLEDGE', 'SKILL', 'COMPETENCE', 'TRANSVERSAL', 'LANGUAGE');

-- Achievement rarity
CREATE TYPE achievement_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');
```

**Quest System:**
- `user_archetypes` - User archetype assignment
- `quest_progress` - Quest completion tracking
- `epic_objects` - Technology showcase objects
- `deep_dive_content` - Educational content
- `quiz_questions` - Knowledge check questions
- `forge_companies` - Company profiles
- `talent_roles` - Job role data with salaries
- `leader_insights` - Leader quotes
- `soft_skills` - Soft skill definitions
- `hackathons` - Hackathon listings
- `discord_guilds` - Community channels

**Achievements:**
- `achievements` - Achievement definitions
- `user_achievements` - Unlocked achievements per user
- `achievement_progress` - Progress tracking for multi-step achievements

**Skills:**
- `skills_taxonomy` - Skill definitions with framework and category
- `user_skills` - User's skills with proficiency levels
- `skill_endorsements` - Peer endorsements

**Feedback:**
- `feedback_requests` - 360 feedback request records
- `feedback_responses` - Anonymous feedback responses

## Development Notes

### General
- Use `@/*` path alias for imports (maps to `src/*`)
- Supabase clients: `server.ts` for server-side, `client.ts` for client-side
- **i18n Required**: ALL user-visible text must use translations

### Theming
- Single FORGE-Z theme (no world selection)
- Dark theme by default with CSS variables
- RPG-style gradients: `gradient-text-fire`, `progress-gradient`
- `WorldId` is only `'forgez'` - do NOT use cosmos/forge/nexus/terra/quantum

### Quest Development
- Each quest page checks status via `useQuestStore`
- Redirect to previous quest if locked
- Award XP via `useXPStore.awardXP(amount, source, sourceId?, description?)`
- Complete quest via `completeQuest(questNumber, xpEarned)`

**Quest Page Pattern:**
```typescript
useEffect(() => {
  const status = getQuestStatus(N);
  if (status === 'available') startQuest(N);
  if (status === 'locked') router.push('/quest/N-1');
  fetchData();
}, []);
```

### Adding New Visual Components

When creating chart/visualization components:
1. Use Framer Motion for animations
2. Support `animated` prop for entrance animations
3. Use CSS variables for theming (`var(--primary)`, `var(--success)`, etc.)
4. Export component AND types for reuse

**Example:**
```typescript
export interface RadarDataPoint {
  trait: string;
  label: string;
  value: number;
}

export function SuccessRadar({ data, animated = true }: Props) { ... }
```

### Type Safety with Mapped Data

When mapping data to component props with union types, explicitly type the return:

```typescript
// BAD - TypeScript infers string
skills: resources.map((r) => ({
  level: started ? 'mastered' : 'locked', // string
}))

// GOOD - Explicit type annotation
skills: resources.map((r): Skill => ({
  level: started ? 'mastered' : 'locked', // 'mastered' | 'locked'
}))
```

### Internationalization (i18n)

**CRITICAL**: Every user-visible string MUST be internationalized.

1. Add translations to BOTH `src/i18n/locales/en/*.json` AND `src/i18n/locales/pl/*.json`
2. Use `useTranslations` hook: `const t = useTranslations('quest')`
3. Quest translations in `quest.json` namespace

**Translation Keys for Quests:**
- `quest1.*` through `quest8.*` for quest-specific text
- `quest6.softSkills.*` for soft skill names
- `navigation.back`, `navigation.continue` for nav buttons

### PWA
- Service worker at `/public/sw.js`
- Manifest shortcuts: Quests, Skill Tree, Guild Hall
- Theme color: #F97316 (fire orange)

## Environment Variables

Required in `.env`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct PostgreSQL connection
- `OPENAI_API_KEY` - For AI skill extraction

## Testing

```bash
npm run test           # Unit tests in watch mode
npm run test:coverage  # Unit tests with coverage
npm run test:e2e       # E2E tests with Playwright
```

### Testing Checklist

When making changes, verify:
1. Quest progression works correctly (1 → 2 → ... → 8)
2. XP awards correctly and levels update
3. Archetype quiz saves results
4. Translations display for both EN and PL
5. Mobile navigation is responsive
6. PWA install prompt works
7. Visual components render correctly (RegionMap, DemandChart, SuccessRadar, SkillTree)
8. Hackathon detail pages load and display correctly
9. Achievements unlock and display correctly
10. Feedback requests and anonymous responses work
11. `npm run build` passes without TypeScript errors

## Common Issues & Solutions

### WorldId Type Errors
**Problem**: `Object literal may only specify known properties, and 'cosmos' does not exist`
**Solution**: WorldId is now only `'forgez'`. Update any `Record<WorldId, ...>` to only include `forgez`:
```typescript
const icons: Record<WorldId, LucideIcon> = {
  forgez: Hammer, // Only forgez, not cosmos/forge/etc.
};
```

### XPSource Type Errors
**Problem**: `Argument of type 'xxx' is not assignable to parameter of type 'XPSource'`
**Solution**: Add new source to XPSource union in `xp-store.ts`

### Supabase Query Type Errors
**Problem**: Type mismatch when using `.single()` with query builder
**Solution**: Create a separate query for single-item lookups:
```typescript
// BAD
let query = supabase.from('table').select('*');
if (id) query = query.eq('id', id).single(); // Type error

// GOOD
if (id) {
  const { data } = await supabase.from('table').select('*').eq('id', id).single();
  return data;
}
```

### SkillFramework Type Errors
**Problem**: `Type '"ELEVATE"' is not assignable to type 'SkillFramework'`
**Solution**: The framework was renamed from `'ELEVATE'` to `'FORGEZ'`. Update all occurrences:
```typescript
// OLD (wrong)
framework: 'ELEVATE'

// NEW (correct)
framework: 'FORGEZ'
```

### Component Type Errors with Mapped Arrays
**Problem**: Union type properties inferred as `string` instead of specific literals
**Solution**: Add explicit return type annotation to map callback: `.map((item): MyType => ({ ... }))`
