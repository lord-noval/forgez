-- FORGE-Z Database Schema for Supabase
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE exercise_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE tracking_type AS ENUM ('BINARY', 'DURATION', 'COUNT', 'JOURNAL');
CREATE TYPE achievement_rarity AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');
CREATE TYPE challenge_type AS ENUM ('DOMAIN_PUSH', 'COMBO', 'TIME', 'QUALITY');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,

  -- Gamification stats
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  freeze_tokens INTEGER DEFAULT 0,

  -- Preferences
  timezone TEXT DEFAULT 'UTC',
  dark_mode BOOLEAN DEFAULT true,
  reminder_time TEXT,

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  primary_skill_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Behavior clusters (7 skills)
CREATE TABLE public.behavior_clusters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercises within each skill
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cluster_id UUID NOT NULL REFERENCES public.behavior_clusters(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT NOT NULL,
  level exercise_level DEFAULT 'BEGINNER',
  tracking_type tracking_type DEFAULT 'BINARY',
  xp_reward INTEGER DEFAULT 25,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for primary_skill after behavior_clusters exists
ALTER TABLE public.users
  ADD CONSTRAINT fk_primary_skill
  FOREIGN KEY (primary_skill_id)
  REFERENCES public.behavior_clusters(id);

-- Habit logs
CREATE TABLE public.habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id),
  log_date DATE NOT NULL,

  completed BOOLEAN DEFAULT false,
  duration_minutes INTEGER,
  count INTEGER,
  journal_entry TEXT,
  xp_earned INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, exercise_id, log_date)
);

-- Achievements
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity achievement_rarity DEFAULT 'COMMON',
  xp_reward INTEGER DEFAULT 50,

  criteria_type TEXT NOT NULL,
  criteria_value INTEGER NOT NULL,
  criteria_skill TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements (unlocked)
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, achievement_id)
);

-- Streak records
CREATE TABLE public.streak_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  used_freeze BOOLEAN DEFAULT false,

  UNIQUE(user_id, date)
);

-- Daily challenges
CREATE TABLE public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 50,
  challenge_type challenge_type NOT NULL,
  target_value INTEGER NOT NULL,
  skill_slug TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User daily challenges
CREATE TABLE public.user_daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id),
  assigned_date DATE NOT NULL,

  completed BOOLEAN DEFAULT false,
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,

  UNIQUE(user_id, challenge_id, assigned_date)
);

-- Indexes for performance
CREATE INDEX idx_habit_logs_user_date ON public.habit_logs(user_id, log_date);
CREATE INDEX idx_streak_records_user_date ON public.streak_records(user_id, date);
CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX idx_user_daily_challenges_user_date ON public.user_daily_challenges(user_id, assigned_date);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Habit logs - users can only access their own
CREATE POLICY "Users can manage own habit logs" ON public.habit_logs
  FOR ALL USING (auth.uid() = user_id);

-- User achievements - users can only access their own
CREATE POLICY "Users can manage own achievements" ON public.user_achievements
  FOR ALL USING (auth.uid() = user_id);

-- Streak records - users can only access their own
CREATE POLICY "Users can manage own streaks" ON public.streak_records
  FOR ALL USING (auth.uid() = user_id);

-- User daily challenges - users can only access their own
CREATE POLICY "Users can manage own challenges" ON public.user_daily_challenges
  FOR ALL USING (auth.uid() = user_id);

-- Public read access for reference tables
CREATE POLICY "Anyone can read behavior clusters" ON public.behavior_clusters
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read exercises" ON public.exercises
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read achievements" ON public.achievements
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read daily challenges" ON public.daily_challenges
  FOR SELECT USING (true);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- ELEVATE PLATFORM TRANSFORMATION - Extended Schema
-- ============================================================================

-- New Enum Types for Platform Transformation
CREATE TYPE narrative_world AS ENUM ('COSMOS', 'FORGE', 'NEXUS', 'TERRA', 'QUANTUM');
CREATE TYPE project_type AS ENUM ('CODE', 'DOCUMENT', 'VIDEO', 'AUDIO', 'DESIGN', 'MODEL_3D', 'PRESENTATION', 'CERTIFICATION', 'OTHER');
CREATE TYPE upload_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE skill_verification_level AS ENUM ('SELF_ASSESSED', 'PEER_ENDORSED', 'PROJECT_VERIFIED', 'AI_ANALYZED', 'ASSESSMENT_PASSED', 'CERTIFICATION_VERIFIED');
CREATE TYPE skill_framework AS ENUM ('ESCO', 'SFIA', 'ONET', 'ELEVATE', 'CUSTOM');
CREATE TYPE skill_category AS ENUM ('KNOWLEDGE', 'SKILL', 'COMPETENCE', 'TRANSVERSAL', 'LANGUAGE');
CREATE TYPE feedback_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'DECLINED');
CREATE TYPE feedback_type AS ENUM ('VOICE', 'TEXT', 'VIDEO');
CREATE TYPE team_role AS ENUM ('LEADER', 'MEMBER', 'ADVISOR', 'PENDING');
CREATE TYPE employment_type AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'APPRENTICESHIP');
CREATE TYPE job_status AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED', 'FILLED');
CREATE TYPE company_size AS ENUM ('STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- ============================================================================
-- NARRATIVE WORLDS SYSTEM
-- ============================================================================

-- Narrative world definitions
CREATE TABLE public.narrative_worlds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  tagline TEXT NOT NULL,
  primary_color TEXT NOT NULL,
  secondary_color TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  icon TEXT NOT NULL,
  background_pattern TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User world preferences
CREATE TABLE public.user_world_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  world_id UUID NOT NULL REFERENCES public.narrative_worlds(id),
  quiz_responses JSONB,
  selected_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- ============================================================================
-- SKILLS TAXONOMY (ESCO/SFIA/O*NET Mapping)
-- ============================================================================

-- Master skill definitions with framework mappings
CREATE TABLE public.skills_taxonomy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  framework skill_framework NOT NULL,
  framework_id TEXT,
  category skill_category NOT NULL,
  parent_skill_id UUID REFERENCES public.skills_taxonomy(id),
  level_descriptors JSONB,
  alt_labels TEXT[],
  related_occupations TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(framework, framework_id)
);

-- User skill profiles
CREATE TABLE public.user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills_taxonomy(id),
  proficiency_level INTEGER DEFAULT 1 CHECK (proficiency_level >= 1 AND proficiency_level <= 7),
  verification_level skill_verification_level DEFAULT 'SELF_ASSESSED',
  confidence_score DECIMAL(3,2) DEFAULT 0.00 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  evidence_count INTEGER DEFAULT 0,
  years_experience DECIMAL(4,1),
  last_used_date DATE,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, skill_id)
);

-- Skill endorsements from peers
CREATE TABLE public.skill_endorsements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_skill_id UUID NOT NULL REFERENCES public.user_skills(id) ON DELETE CASCADE,
  endorser_id UUID NOT NULL REFERENCES public.users(id),
  relationship TEXT,
  endorsement_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_skill_id, endorser_id)
);

-- ============================================================================
-- PROJECT PORTFOLIO SYSTEM
-- ============================================================================

-- User projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  project_type project_type NOT NULL,
  thumbnail_url TEXT,
  external_url TEXT,
  repository_url TEXT,
  start_date DATE,
  end_date DATE,
  is_ongoing BOOLEAN DEFAULT false,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project artifacts (files within projects)
CREATE TABLE public.project_artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT,
  upload_status upload_status DEFAULT 'PENDING',
  storage_bucket TEXT NOT NULL,
  analysis_status upload_status DEFAULT 'PENDING',
  analysis_result JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI-extracted skills per project
CREATE TABLE public.project_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills_taxonomy(id),
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  evidence_snippets JSONB,
  ai_reasoning TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id, skill_id)
);

-- AI skill analysis jobs
CREATE TABLE public.ai_skill_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artifact_id UUID NOT NULL REFERENCES public.project_artifacts(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,
  status upload_status DEFAULT 'PENDING',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result JSONB,
  error_message TEXT,
  tokens_used INTEGER,
  model_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 360-DEGREE FEEDBACK SYSTEM
-- ============================================================================

-- Feedback requests
CREATE TABLE public.feedback_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  context TEXT,
  prompt_questions JSONB NOT NULL,
  status feedback_status DEFAULT 'PENDING',
  expires_at TIMESTAMPTZ NOT NULL,
  min_respondents INTEGER DEFAULT 3,
  max_respondents INTEGER DEFAULT 10,
  is_anonymous BOOLEAN DEFAULT true,
  aggregated_results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Feedback respondents (invited peers)
CREATE TABLE public.feedback_respondents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES public.feedback_requests(id) ON DELETE CASCADE,
  respondent_email TEXT NOT NULL,
  respondent_name TEXT,
  respondent_user_id UUID REFERENCES public.users(id),
  access_token TEXT UNIQUE NOT NULL,
  relationship TEXT,
  status feedback_status DEFAULT 'PENDING',
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,

  UNIQUE(request_id, respondent_email)
);

-- Feedback responses
CREATE TABLE public.feedback_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  respondent_id UUID NOT NULL REFERENCES public.feedback_respondents(id) ON DELETE CASCADE,
  feedback_type feedback_type NOT NULL,
  content TEXT,
  audio_url TEXT,
  video_url TEXT,
  transcription TEXT,
  sentiment_analysis JSONB,
  skill_indicators JSONB,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CAREER COMPASS SYSTEM
-- ============================================================================

-- Career path definitions
CREATE TABLE public.career_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  typical_titles TEXT[],
  required_skills JSONB,
  preferred_skills JSONB,
  salary_range JSONB,
  growth_outlook TEXT,
  entry_requirements TEXT,
  progression_paths UUID[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User career goals
CREATE TABLE public.user_career_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  career_path_id UUID REFERENCES public.career_paths(id),
  target_role TEXT,
  target_company TEXT,
  target_industry TEXT,
  target_salary_min INTEGER,
  target_salary_max INTEGER,
  target_timeline TEXT,
  priority INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skill gap analysis results
CREATE TABLE public.user_skill_gaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  career_goal_id UUID REFERENCES public.user_career_goals(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills_taxonomy(id),
  current_level INTEGER,
  required_level INTEGER NOT NULL,
  gap_severity TEXT CHECK (gap_severity IN ('low', 'medium', 'high', 'critical')),
  recommended_resources JSONB,
  estimated_time_to_close TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TEAM MATCHING SYSTEM
-- ============================================================================

-- Teams
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  purpose TEXT,
  max_members INTEGER DEFAULT 5,
  skill_requirements JSONB,
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role team_role DEFAULT 'PENDING',
  contribution_area TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(team_id, user_id)
);

-- ============================================================================
-- EMPLOYER PORTAL
-- ============================================================================

-- Companies
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  website_url TEXT,
  linkedin_url TEXT,
  industry TEXT,
  company_size company_size,
  founded_year INTEGER,
  headquarters_location TEXT,
  culture_values JSONB,
  benefits JSONB,
  tech_stack TEXT[],
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  subscription_tier TEXT DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company admins
CREATE TABLE public.company_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin' CHECK (role IN ('owner', 'admin', 'recruiter', 'viewer')),
  invited_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, user_id)
);

-- Job postings
CREATE TABLE public.job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,
  employment_type employment_type NOT NULL,
  location TEXT,
  is_remote BOOLEAN DEFAULT false,
  remote_policy TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'EUR',
  required_skills JSONB,
  preferred_skills JSONB,
  experience_level TEXT,
  education_level TEXT,
  status job_status DEFAULT 'DRAFT',
  application_url TEXT,
  application_email TEXT,
  view_count INTEGER DEFAULT 0,
  application_count INTEGER DEFAULT 0,
  posted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job applications
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  cover_letter TEXT,
  resume_url TEXT,
  portfolio_url TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'viewed', 'shortlisted', 'interviewing', 'offered', 'rejected', 'withdrawn')),
  match_score DECIMAL(5,2),
  skill_match_details JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(job_id, user_id)
);

-- ============================================================================
-- USERS TABLE EXTENSION
-- ============================================================================

-- Add new columns to users table for platform transformation
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS active_world_id UUID REFERENCES public.narrative_worlds(id);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_role TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_company TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS years_experience INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_open_to_work BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS job_search_status TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS show_skills_publicly BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS show_projects_publicly BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_employer BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS employer_company_id UUID REFERENCES public.companies(id);

-- ============================================================================
-- INDEXES FOR NEW TABLES
-- ============================================================================

CREATE INDEX idx_user_skills_user ON public.user_skills(user_id);
CREATE INDEX idx_user_skills_skill ON public.user_skills(skill_id);
CREATE INDEX idx_user_skills_verification ON public.user_skills(verification_level);
CREATE INDEX idx_projects_user ON public.projects(user_id);
CREATE INDEX idx_projects_type ON public.projects(project_type);
CREATE INDEX idx_projects_visibility ON public.projects(visibility);
CREATE INDEX idx_project_artifacts_project ON public.project_artifacts(project_id);
CREATE INDEX idx_project_skills_project ON public.project_skills(project_id);
CREATE INDEX idx_project_skills_skill ON public.project_skills(skill_id);
CREATE INDEX idx_feedback_requests_user ON public.feedback_requests(user_id);
CREATE INDEX idx_feedback_respondents_request ON public.feedback_respondents(request_id);
CREATE INDEX idx_feedback_respondents_token ON public.feedback_respondents(access_token);
CREATE INDEX idx_teams_created_by ON public.teams(created_by);
CREATE INDEX idx_team_members_team ON public.team_members(team_id);
CREATE INDEX idx_team_members_user ON public.team_members(user_id);
CREATE INDEX idx_job_postings_company ON public.job_postings(company_id);
CREATE INDEX idx_job_postings_status ON public.job_postings(status);
CREATE INDEX idx_job_applications_job ON public.job_applications(job_id);
CREATE INDEX idx_job_applications_user ON public.job_applications(user_id);
CREATE INDEX idx_skills_taxonomy_framework ON public.skills_taxonomy(framework);
CREATE INDEX idx_skills_taxonomy_category ON public.skills_taxonomy(category);
CREATE INDEX idx_career_paths_industry ON public.career_paths(industry);

-- ============================================================================
-- ROW LEVEL SECURITY FOR NEW TABLES
-- ============================================================================

ALTER TABLE public.narrative_worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_world_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills_taxonomy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_skill_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_respondents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skill_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Narrative worlds - public read
CREATE POLICY "Anyone can read narrative worlds" ON public.narrative_worlds
  FOR SELECT USING (true);

-- User world preferences - users can manage their own
CREATE POLICY "Users can manage own world preferences" ON public.user_world_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Skills taxonomy - public read
CREATE POLICY "Anyone can read skills taxonomy" ON public.skills_taxonomy
  FOR SELECT USING (true);

-- User skills - users can manage their own, others can view if public
CREATE POLICY "Users can manage own skills" ON public.user_skills
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public skills" ON public.user_skills
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = user_skills.user_id
      AND users.show_skills_publicly = true
      AND users.profile_visibility = 'public'
    )
  );

-- Skill endorsements - endorsers can create, skill owners can view
CREATE POLICY "Users can create endorsements" ON public.skill_endorsements
  FOR INSERT WITH CHECK (auth.uid() = endorser_id);

CREATE POLICY "Users can view endorsements on their skills" ON public.skill_endorsements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_skills
      WHERE user_skills.id = skill_endorsements.user_skill_id
      AND user_skills.user_id = auth.uid()
    )
  );

-- Projects - users can manage their own, others can view public
CREATE POLICY "Users can manage own projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public projects" ON public.projects
  FOR SELECT USING (visibility = 'public');

-- Project artifacts - same as projects
CREATE POLICY "Users can manage own project artifacts" ON public.project_artifacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_artifacts.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view public project artifacts" ON public.project_artifacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_artifacts.project_id
      AND projects.visibility = 'public'
    )
  );

-- Project skills - same as projects
CREATE POLICY "Users can manage own project skills" ON public.project_skills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_skills.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view public project skills" ON public.project_skills
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_skills.project_id
      AND projects.visibility = 'public'
    )
  );

-- AI skill analyses - users can view their own
CREATE POLICY "Users can view own analyses" ON public.ai_skill_analyses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_artifacts
      JOIN public.projects ON projects.id = project_artifacts.project_id
      WHERE project_artifacts.id = ai_skill_analyses.artifact_id
      AND projects.user_id = auth.uid()
    )
  );

-- Feedback requests - users can manage their own
CREATE POLICY "Users can manage own feedback requests" ON public.feedback_requests
  FOR ALL USING (auth.uid() = user_id);

-- Feedback respondents - request owners can manage
CREATE POLICY "Request owners can manage respondents" ON public.feedback_respondents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.feedback_requests
      WHERE feedback_requests.id = feedback_respondents.request_id
      AND feedback_requests.user_id = auth.uid()
    )
  );

-- Allow respondents to view their own record
CREATE POLICY "Respondents can view own record" ON public.feedback_respondents
  FOR SELECT USING (respondent_user_id = auth.uid());

-- Feedback responses - respondents can create, request owners can view
CREATE POLICY "Respondents can create responses" ON public.feedback_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.feedback_respondents
      WHERE feedback_respondents.id = feedback_responses.respondent_id
      AND (feedback_respondents.respondent_user_id = auth.uid() OR feedback_respondents.access_token IS NOT NULL)
    )
  );

CREATE POLICY "Request owners can view responses" ON public.feedback_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.feedback_respondents
      JOIN public.feedback_requests ON feedback_requests.id = feedback_respondents.request_id
      WHERE feedback_respondents.id = feedback_responses.respondent_id
      AND feedback_requests.user_id = auth.uid()
    )
  );

-- Career paths - public read
CREATE POLICY "Anyone can read career paths" ON public.career_paths
  FOR SELECT USING (true);

-- User career goals - users can manage their own
CREATE POLICY "Users can manage own career goals" ON public.user_career_goals
  FOR ALL USING (auth.uid() = user_id);

-- User skill gaps - users can manage their own
CREATE POLICY "Users can manage own skill gaps" ON public.user_skill_gaps
  FOR ALL USING (auth.uid() = user_id);

-- Teams - public teams visible to all, users can create
CREATE POLICY "Anyone can view public teams" ON public.teams
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create teams" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team creators can manage teams" ON public.teams
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Team creators can delete teams" ON public.teams
  FOR DELETE USING (auth.uid() = created_by);

-- Team members - team members can view, leaders can manage
CREATE POLICY "Team members can view membership" ON public.team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members AS tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team leaders can manage members" ON public.team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.team_members AS tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'LEADER'
    )
  );

CREATE POLICY "Users can join teams" ON public.team_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Companies - public companies visible to all
CREATE POLICY "Anyone can view active companies" ON public.companies
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage their companies" ON public.companies
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.company_admins
      WHERE company_admins.company_id = companies.id
      AND company_admins.user_id = auth.uid()
      AND company_admins.role IN ('owner', 'admin')
    )
  );

-- Company admins - admins can view and manage
CREATE POLICY "Company admins can view other admins" ON public.company_admins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.company_admins AS ca
      WHERE ca.company_id = company_admins.company_id
      AND ca.user_id = auth.uid()
    )
  );

CREATE POLICY "Company owners can manage admins" ON public.company_admins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.company_admins AS ca
      WHERE ca.company_id = company_admins.company_id
      AND ca.user_id = auth.uid()
      AND ca.role = 'owner'
    )
  );

-- Job postings - active jobs visible to all
CREATE POLICY "Anyone can view active jobs" ON public.job_postings
  FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Company admins can manage jobs" ON public.job_postings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.company_admins
      WHERE company_admins.company_id = job_postings.company_id
      AND company_admins.user_id = auth.uid()
    )
  );

-- Job applications - applicants can manage their own, companies can view
CREATE POLICY "Users can manage own applications" ON public.job_applications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Company admins can view applications" ON public.job_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      JOIN public.company_admins ON company_admins.company_id = job_postings.company_id
      WHERE job_postings.id = job_applications.job_id
      AND company_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Company admins can update application status" ON public.job_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      JOIN public.company_admins ON company_admins.company_id = job_postings.company_id
      WHERE job_postings.id = job_applications.job_id
      AND company_admins.user_id = auth.uid()
    )
  );

-- ============================================================================
-- SEED DATA FOR NARRATIVE WORLDS
-- ============================================================================

INSERT INTO public.narrative_worlds (slug, name, description, tagline, primary_color, secondary_color, accent_color, icon, background_pattern) VALUES
  ('cosmos', 'COSMOS', 'Navigate the vast frontier of professional growth through cosmic exploration. Chart your course among the stars as you discover new skills and opportunities.', 'Explore the Universe of Potential', '#6366F1', '#06B6D4', '#8B5CF6', 'Rocket', 'stars'),
  ('forge', 'FORGE', 'Craft your career with the heat of determination and the hammer of hard work. Transform raw potential into refined expertise through dedicated practice.', 'Forge Your Legacy', '#F97316', '#EAB308', '#EF4444', 'Hammer', 'sparks'),
  ('nexus', 'NEXUS', 'Connect to the neural network of human potential. Upgrade your capabilities in a world where technology and humanity converge.', 'Connect. Upgrade. Evolve.', '#8B5CF6', '#EC4899', '#06B6D4', 'Zap', 'circuits'),
  ('terra', 'TERRA', 'Cultivate your skills like a garden of endless possibility. Let your abilities take root and grow naturally toward the light of success.', 'Grow Without Limits', '#22C55E', '#84CC16', '#06B6D4', 'Leaf', 'vines'),
  ('quantum', 'QUANTUM', 'Unlock the scientific method for career advancement. Experiment, observe, and iterate your way to professional breakthroughs.', 'Discover. Experiment. Breakthrough.', '#3B82F6', '#8B5CF6', '#F8FAFC', 'Atom', 'particles')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- FUNCTIONS AND TRIGGERS FOR NEW TABLES
-- ============================================================================

-- Update function for user_skills
CREATE TRIGGER update_user_skills_updated_at
  BEFORE UPDATE ON public.user_skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Update function for projects
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Update function for user_career_goals
CREATE TRIGGER update_user_career_goals_updated_at
  BEFORE UPDATE ON public.user_career_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Update function for user_skill_gaps
CREATE TRIGGER update_user_skill_gaps_updated_at
  BEFORE UPDATE ON public.user_skill_gaps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Update function for teams
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Update function for companies
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Update function for job_postings
CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Update function for job_applications
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
