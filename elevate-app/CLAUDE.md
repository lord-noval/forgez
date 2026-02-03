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

// Database ENUM - no hyphen
CREATE TYPE skill_framework AS ENUM ('ESCO', 'SFIA', 'ONET', 'FORGEZ', 'CUSTOM');
```

**Core Features:**
- **8-Quest System**: Progressive journey from character creation to guild hall
- **Archetypes**: Builder, Strategist, Explorer, Competitor - determined by personality quiz
- **XP & Leveling**: Earn XP through quests, courses, hackathons, and portfolio projects
- **Epic Objects**: Showcase technologies like Starlink satellites, Boston Dynamics robots, Mars rovers
- **Guilds**: Discover companies across Poland, Germany, Ukraine, and USA
- **Skill Forge**: Curated learning marketplace with affiliate integrations
- **Guild Hall**: Hackathons, Discord communities, and portfolio showcase

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
src/
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
│   ├── api/                 # API routes
│   │   ├── projects/        # Portfolio CRUD + file upload
│   │   ├── skills/          # Taxonomy and user skills
│   │   ├── epic-objects/    # Epic technology objects
│   │   ├── companies/       # Company/guild data
│   │   ├── roles/           # Talent roles data
│   │   ├── hackathons/      # Hackathon listings
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
│   └── providers/           # WorldProvider, theme management
├── stores/
│   ├── quest-store.ts       # Quest progression state
│   ├── archetype-store.ts   # User archetype state
│   ├── xp-store.ts          # XP and leveling system
│   ├── world-store.ts       # Theme state (FORGE-Z only)
│   ├── projects-store.ts    # Portfolio management
│   └── skills-store.ts      # User skills and taxonomy
├── themes/                  # FORGE-Z theme configuration
│   ├── world-themes.ts      # Color palette (fire orange/gold/cyan)
│   ├── world-labels.ts      # RPG terminology
│   ├── world-assets.ts      # Icons
│   └── types.ts             # WorldId = 'forgez' ONLY
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

### Visual Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `RegionMap` | `components/guilds/` | Interactive map with Poland/Germany/Ukraine/USA |
| `DemandChart` | `components/talent/` | Horizontal bar chart for role demand growth |
| `SuccessRadar` | `components/wisdom/` | 8-axis radar chart for soft skills |
| `SkillTree` | `components/skill-forge/` | Visual skill progression tree |
| `ProgressWidget` | `components/skill-forge/` | Learning path progress tracker |

### Theme System (FORGE-Z)

**CRITICAL**: FORGE-Z uses a **single unified theme**. The `WorldId` type is `'forgez'` only.

```typescript
// In themes/types.ts
export type WorldId = 'forgez';
```

**Theme Colors:**
- **Primary**: Fire Orange (#F97316)
- **Secondary**: Gold (#EAB308)
- **Accent**: Cyan (#22D3EE)
- **Background**: Dark (#0D0D0F)

**Common Pitfall**: Legacy code may reference old world IDs (cosmos, forge, nexus, terra, quantum). These cause TypeScript errors. Always use only `'forgez'` in `Record<WorldId, ...>` types:

```typescript
// WRONG - causes type error
const icons: Record<WorldId, LucideIcon> = {
  cosmos: Rocket,  // Error!
  forge: Hammer,
  // ...
};

// CORRECT
const icons: Record<WorldId, LucideIcon> = {
  forgez: Hammer,
};
```

### XP System

**Valid XP Sources** (defined in `xp-store.ts`):
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

**To add a new XP source**: Update the `XPSource` union type in `stores/xp-store.ts`.

### Key Stores

- `quest-store.ts` - Quest progression, status, XP rewards
- `archetype-store.ts` - User archetype, game/domain preferences
- `xp-store.ts` - Total XP, level, transaction history
- `world-store.ts` - Theme state (fixed to 'forgez')
- `projects-store.ts` - Portfolio projects and artifacts
- `skills-store.ts` - User skills, taxonomy, endorsements

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

**Portfolio:**
- `GET/POST /api/projects` - List/create projects
- `POST /api/projects/upload` - Get signed upload URL

**Learning:**
- `GET /api/learn/recommendations` - Learning recommendations

## Development Notes

### General
- Use `@/*` path alias for imports (maps to `src/*`)
- Supabase clients: `server.ts` for server-side, `client.ts` for client-side
- **i18n Required**: ALL user-visible text must use translations

### Quest Development

**Quest Page Pattern:**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuestStore } from '@/stores/quest-store';
import { useXPStore } from '@/stores/xp-store';

export default function QuestNPage() {
  const router = useRouter();
  const { startQuest, completeQuest, getQuestStatus } = useQuestStore();
  const { awardXP } = useXPStore();

  useEffect(() => {
    const status = getQuestStatus(N);
    if (status === 'available') startQuest(N);
    if (status === 'locked') {
      router.push('/quest/N-1');
      return;
    }
    fetchData();
  }, []);

  const handleComplete = () => {
    completeQuest(N, totalXPEarned);
    router.push('/quest/N+1');
  };

  // ...
}
```

### Adding Visual Components

When creating chart/visualization components:
1. Use Framer Motion for animations
2. Support `animated` prop for entrance animations
3. Use CSS variables for theming (`var(--primary)`, `var(--success)`, etc.)
4. Export component AND types for reuse

```typescript
// Example component structure
export interface ChartData {
  id: string;
  label: string;
  value: number;
}

interface ChartProps {
  data: ChartData[];
  animated?: boolean;
}

export function MyChart({ data, animated = true }: ChartProps) {
  return (
    <motion.div
      initial={animated ? { opacity: 0 } : undefined}
      animate={animated ? { opacity: 1 } : undefined}
    >
      {/* Chart content */}
    </motion.div>
  );
}
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
- `quest6.softSkills.*` for soft skill names (growth-mindset, ownership, etc.)
- `navigation.back`, `navigation.continue` for nav buttons

### Supabase Query Patterns

**Single item lookup** - use separate query to avoid type issues:
```typescript
// BAD - type error with .single()
let query = supabase.from('table').select('*');
if (id) query = query.eq('id', id).single();

// GOOD - separate query
if (id) {
  const { data } = await supabase.from('table').select('*').eq('id', id).single();
  return NextResponse.json({ data });
}
```

## Database Schema

### Key ENUM Types

```sql
-- Skill framework (for skills_taxonomy table)
CREATE TYPE skill_framework AS ENUM ('ESCO', 'SFIA', 'ONET', 'FORGEZ', 'CUSTOM');

-- Skill category
CREATE TYPE skill_category AS ENUM ('KNOWLEDGE', 'SKILL', 'COMPETENCE', 'TRANSVERSAL', 'LANGUAGE');

-- Skill verification level
CREATE TYPE skill_verification_level AS ENUM (
  'SELF_ASSESSED', 'PEER_ENDORSED', 'PROJECT_VERIFIED',
  'AI_ANALYZED', 'ASSESSMENT_PASSED', 'CERTIFICATION_VERIFIED'
);
```

### Key Tables

- `users` - User profiles (extends Supabase auth.users)
- `skills_taxonomy` - Skill definitions with framework, category, and metadata
- `user_skills` - User's skills with proficiency levels and verification status
- `skill_endorsements` - Peer endorsements for user skills
- `projects` - Portfolio projects
- `project_artifacts` - Files uploaded to projects
- `project_skills` - AI-extracted skills from project artifacts

### Migrations

Located in `supabase/migrations/`. Key migrations:
- `20260131_add_skills_system.sql` - Skills taxonomy, user skills, endorsements

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
9. `npm run build` passes without TypeScript errors

## Common Issues & Solutions

### WorldId Type Errors
**Problem**: `Object literal may only specify known properties, and 'cosmos' does not exist`
**Solution**: WorldId is now only `'forgez'`. Update any `Record<WorldId, ...>` to only include `forgez`.

### XPSource Type Errors
**Problem**: `Argument of type 'xxx' is not assignable to parameter of type 'XPSource'`
**Solution**: Add new source to XPSource union in `xp-store.ts`

### Component Type Errors with Mapped Arrays
**Problem**: Union type properties inferred as `string` instead of specific literals
**Solution**: Add explicit return type annotation to map callback: `.map((item): MyType => ({ ... }))`

### SkillFramework Type Errors
**Problem**: `Type '"ELEVATE"' is not assignable to type 'SkillFramework'`
**Solution**: The framework was renamed from `'ELEVATE'` to `'FORGEZ'`. Update all occurrences:
```typescript
// OLD (wrong)
framework: 'ELEVATE'

// NEW (correct)
framework: 'FORGEZ'
```
