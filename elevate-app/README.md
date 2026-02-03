# Elevate

**Your Skills. Verified by AI. Valued by Industry.**

A portfolio-based skill verification platform for young people interested in engineering and technical careers. Built around promoting career paths in Space, Energy, Robotics, and Software/AI.

## Vision

Elevate transforms how technical professionals showcase and verify their skills through **proof of work** — not just credentials. Users upload their real projects (apps, videos, presentations, analyses, 3D models, code) which are analyzed by AI to extract and verify skills. This creates a credible skill profile that surpasses traditional qualifications.

## Core Value Proposition

- **Clarity** on what you're good at and which career path to pursue
- **Credible evidence** of skills through actual work, not just self-assessment
- **Direction** showing where your skills can lead with real career examples

## Key Features

### 📁 Portfolio System
Upload your work — code repositories, design files, presentations, videos, 3D models, certifications. Share projects through channels where you already connect (Discord, Reddit, WhatsApp, Facebook, LinkedIn).

### 🤖 AI Skill Analysis
Your uploaded work is automatically analyzed to extract demonstrated skills. AI identifies technologies, frameworks, and competencies from your project artifacts.

### 🏦 Bank of Skills
A deeper, multi-dimensional alternative to traditional CVs. Skills are mapped to industry-standard frameworks (ESCO, SFIA, O*NET) with multiple verification levels:
- Self-assessed → Peer-endorsed → Project-verified → AI-analyzed → Assessment-passed → Certification-verified

### 🎙️ 360° Voice Feedback
Request voice feedback from peers to validate soft skills and get cross-checked perspectives on your abilities.

### 🧭 Career Compass
See where your skills can lead — discover career paths in Space, Energy, Robotics, and Software/AI industries. Learn from real stories of professionals who've walked these paths.

### 👥 Team Matching
Find complementary collaborators based on skill profiles. Build balanced teams for startups and projects with the right mix of capabilities.

### 📚 Learning Pathways
Curated learning resources from partners like Coursera, edX, Brilliant, and MIT OpenCourseWare to fill skill gaps and advance your career.

## Target Industries

| Industry | Focus Areas |
|----------|-------------|
| 🚀 **Space & Aerospace** | Rockets, satellites, orbital mechanics, space exploration |
| ⚡ **Energy & Sustainability** | Renewable energy, batteries, EVs, sustainable technology |
| 🤖 **Robotics & Automation** | Industrial robots, autonomous systems, ROS, control systems |
| 💻 **Software & AI** | Software development, machine learning, deep learning, MLOps |

## Narrative Worlds

Choose your experience theme based on your interests and style:

| World | Theme | Personality |
|-------|-------|-------------|
| **COSMOS** | Space Exploration | Strategic thinkers, long-term visionaries |
| **FORGE** | Industrial Crafting | Hands-on builders, practical makers |
| **NEXUS** | Cyberpunk Network | Digital natives, tech enthusiasts |
| **TERRA** | Nature & Growth | Sustainable thinkers, patient developers |
| **QUANTUM** | Research & Science | Analytical minds, scientific explorers |

Each world provides themed UI, unique terminology, and a personalized experience.

## Tech Stack

- **Frontend**: Next.js 16 / React 19 / TypeScript
- **Styling**: TailwindCSS 4 / Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: GPT-4o for skill extraction and analysis
- **State**: Zustand for client state management
- **i18n**: next-intl (English + Polish)
- **PWA**: Installable app with offline support
- **Testing**: Vitest + Playwright

## Project Structure

```
elevate/
├── elevate-app/          # Next.js application
│   ├── public/
│   │   ├── sw.js             # Service worker (PWA)
│   │   └── manifest.json     # Web app manifest
│   ├── tests/
│   │   └── e2e/              # Playwright E2E tests
│   └── src/
│       ├── app/          # Pages and API routes
│       │   ├── (auth)/       # Login/signup
│       │   ├── (dashboard)/  # Main app pages
│       │   │   ├── portfolio/    # Project portfolio
│       │   │   ├── skills/bank/  # Bank of Skills
│       │   │   ├── feedback/     # 360° feedback
│       │   │   ├── teams/        # Team matching
│       │   │   ├── careers/      # Job listings
│       │   │   ├── learn/        # Learning resources
│       │   │   └── compass/      # Career paths
│       │   └── api/          # API routes
│       ├── components/   # React components
│       │   ├── ui/           # Reusable primitives
│       │   ├── dashboard/    # Layout components
│       │   ├── portfolio/    # Project components
│       │   ├── skills/       # Skill components
│       │   ├── social/       # Sharing components
│       │   ├── pwa/          # PWA install prompt
│       │   └── ...
│       ├── hooks/        # Custom React hooks
│       ├── i18n/         # Internationalization
│       │   └── locales/      # EN + PL translations
│       ├── stores/       # Zustand state stores
│       ├── themes/       # Narrative worlds config
│       └── lib/          # Utilities
├── CLAUDE.md             # Technical documentation
└── README.md             # This file
```

## Getting Started

```bash
cd elevate-app
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## Environment Setup

Copy `.env.example` to `.env` and configure:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=your-postgres-connection-string
OPENAI_API_KEY=your-openai-key
```

## Database

The platform uses Supabase (PostgreSQL) with the following key tables:

- **Users**: Profiles with headline, bio, location, social links
- **Projects**: Portfolio projects with artifacts
- **Skills**: User skills mapped to ESCO/SFIA/O*NET
- **Feedback**: 360° feedback requests and responses
- **Career Paths**: Industry career paths with required skills
- **Learning Resources**: Curated courses and resources
- **Teams**: Team formation and matching

Run migrations:
```bash
# Via Supabase CLI
supabase db push

# Or via MCP
# Use the apply_migration tool with the SQL from supabase/migrations/
```

## Internationalization

The platform supports multiple languages:

| Language | Code | Status |
|----------|------|--------|
| English | `en` | Complete |
| Polish | `pl` | Complete |

Language preference is stored in a cookie and detected from:
1. User's saved preference (cookie)
2. Browser's Accept-Language header
3. Defaults to English

## Progressive Web App (PWA)

Elevate can be installed as a native-like app:

- **Offline Support**: Service worker caches static assets for offline access
- **Install Prompt**: World-themed installation UI on supported browsers
- **App Shortcuts**: Quick access to Portfolio, Skills Bank, and Career Compass
- **Mobile Optimized**: Standalone display mode without browser chrome

## Testing

```bash
# Unit tests
npm run test           # Watch mode
npm run test:coverage  # With coverage report

# E2E tests
npm run test:e2e       # Headless
npm run test:e2e:ui    # With Playwright UI
```

## Documentation

See [CLAUDE.md](./CLAUDE.md) for detailed technical documentation including:
- Architecture and directory structure
- Database schema
- API routes reference
- Component patterns
- Theming system
- Social sharing implementation
- Internationalization setup
- PWA configuration

## Recent Changes (January 2026)

### New Features
- **Internationalization**: Full i18n support with English and Polish translations
- **Progressive Web App**: Installable app with offline support and app shortcuts
- **Testing Infrastructure**: Vitest for unit tests, Playwright for E2E tests
- **Enhanced Feedback System**: Dedicated Zustand store, token-based anonymous responses

### Platform Pivot
The platform was pivoted from a habit-building gamification system to a portfolio-based skill verification platform:

**Removed:**
- XP/leveling system
- Streak mechanics
- Daily challenges
- Achievement system
- 66-day habit journey

**Added:**
- Career Compass with industry-specific paths
- Learning recommendations page
- Social sharing (Discord, Reddit, WhatsApp, Facebook, Twitter, LinkedIn)
- Career journey examples/testimonials
- Industry filtering (Space, Energy, Robotics, Software/AI)
- Locale preference management
- PWA install prompts with world theming

**Enhanced:**
- Dashboard redesigned around portfolio, skills, and career matches
- Onboarding focused on industry interests
- Profile page with project highlights and verified skills
- Middleware for locale detection and Supabase session handling

## Revenue Model

- Partnership channel with educational providers
- Referrals to EdTech partners and courses
- Employer partnerships for talent access
- Premium features for job seekers and companies

## License

Proprietary - All rights reserved
