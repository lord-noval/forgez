-- ============================================================================
-- FORGE-Z Achievement System Migration
-- ============================================================================

-- Create achievement_rarity enum
CREATE TYPE achievement_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');

-- Create achievement_category enum
CREATE TYPE achievement_category AS ENUM (
  'quest_master',
  'xp_legend',
  'knowledge_seeker',
  'portfolio_artisan',
  'community_champion',
  'archetype_specialist',
  'pioneer'
);

-- ============================================================================
-- Achievement Definitions Table
-- ============================================================================

CREATE TABLE achievement_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category achievement_category NOT NULL,
  rarity achievement_rarity NOT NULL,
  icon TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 25,
  criteria JSONB NOT NULL DEFAULT '{}',
  has_progress BOOLEAN NOT NULL DEFAULT false,
  is_secret BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for category filtering
CREATE INDEX idx_achievement_definitions_category ON achievement_definitions(category);
CREATE INDEX idx_achievement_definitions_rarity ON achievement_definitions(rarity);

-- ============================================================================
-- User Achievements Table
-- ============================================================================

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievement_definitions(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, achievement_id)
);

-- Index for user lookup
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked_at ON user_achievements(unlocked_at DESC);

-- ============================================================================
-- Achievement Progress Table
-- ============================================================================

CREATE TABLE achievement_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievement_definitions(id) ON DELETE CASCADE,
  current_value INTEGER NOT NULL DEFAULT 0,
  target_value INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Index for user lookup
CREATE INDEX idx_achievement_progress_user_id ON achievement_progress(user_id);

-- ============================================================================
-- Row Level Security Policies
-- ============================================================================

-- Achievement definitions are public (read-only for all)
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievement definitions are viewable by everyone"
  ON achievement_definitions FOR SELECT
  USING (true);

-- User achievements are private to each user
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

-- Achievement progress is private to each user
ALTER TABLE achievement_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievement progress"
  ON achievement_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievement progress"
  ON achievement_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievement progress"
  ON achievement_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Seed Achievement Definitions (40 achievements)
-- ============================================================================

INSERT INTO achievement_definitions (id, name, description, category, rarity, icon, xp_reward, criteria, has_progress, is_secret) VALUES

-- Quest Master Achievements (8)
('quest_first_step', 'First Step', 'Complete your first quest and begin your FORGE-Z journey', 'quest_master', 'common', 'Footprints', 25, '{"trigger": "quest_complete", "conditions": {"questNumber": 1}}', false, false),
('quest_artifact_seeker', 'Artifact Seeker', 'Discover your first epic technology artifact', 'quest_master', 'common', 'Gem', 25, '{"trigger": "quest_complete", "conditions": {"questNumber": 2}}', false, false),
('quest_deep_diver', 'Deep Diver', 'Complete the Deep Dive quest and unlock knowledge', 'quest_master', 'uncommon', 'Anchor', 50, '{"trigger": "quest_complete", "conditions": {"questNumber": 3}}', false, false),
('quest_guild_explorer', 'Guild Explorer', 'Explore companies and guilds across regions', 'quest_master', 'uncommon', 'Building2', 50, '{"trigger": "quest_complete", "conditions": {"questNumber": 4}}', false, false),
('quest_talent_hunter', 'Talent Hunter', 'Complete the Talent Hunt and discover career roles', 'quest_master', 'uncommon', 'Target', 50, '{"trigger": "quest_complete", "conditions": {"questNumber": 5}}', false, false),
('quest_wisdom_seeker', 'Wisdom Seeker', 'Learn from the leaders and assess your soft skills', 'quest_master', 'rare', 'Brain', 75, '{"trigger": "quest_complete", "conditions": {"questNumber": 6}}', false, false),
('quest_skill_forger', 'Skill Forger', 'Visit the Skill Forge and start your learning path', 'quest_master', 'rare', 'Flame', 75, '{"trigger": "quest_complete", "conditions": {"questNumber": 7}}', false, false),
('quest_champion', 'Quest Champion', 'Complete all 8 quests and master the FORGE-Z journey', 'quest_master', 'epic', 'Crown', 250, '{"trigger": "quest_complete", "targetValue": 8}', true, false),

-- XP Legend Achievements (7)
('xp_first_hundred', 'First Hundred', 'Earn your first 100 XP', 'xp_legend', 'common', 'Sparkles', 25, '{"trigger": "xp_milestone", "conditions": {"xpThreshold": 100}}', false, false),
('xp_rising_star', 'Rising Star', 'Reach Level 2 and prove your dedication', 'xp_legend', 'common', 'Star', 25, '{"trigger": "level_up", "conditions": {"level": 2}}', false, false),
('xp_adventurer', 'Adventurer', 'Reach Level 5 and establish yourself', 'xp_legend', 'uncommon', 'Compass', 50, '{"trigger": "level_up", "conditions": {"level": 5}}', false, false),
('xp_veteran', 'Veteran', 'Reach Level 10 and become a seasoned explorer', 'xp_legend', 'uncommon', 'Shield', 75, '{"trigger": "level_up", "conditions": {"level": 10}}', false, false),
('xp_elite', 'Elite', 'Reach Level 20 and join the elite ranks', 'xp_legend', 'rare', 'Medal', 100, '{"trigger": "level_up", "conditions": {"level": 20}}', false, false),
('xp_master', 'Master', 'Reach Level 35 and achieve mastery', 'xp_legend', 'epic', 'Award', 200, '{"trigger": "level_up", "conditions": {"level": 35}}', false, false),
('xp_grandmaster', 'Grandmaster', 'Reach the legendary Level 50', 'xp_legend', 'legendary', 'Trophy', 500, '{"trigger": "level_up", "conditions": {"level": 50}}', false, false),

-- Knowledge Seeker Achievements (6)
('know_first_correct', 'Quick Learner', 'Answer your first quiz question correctly', 'knowledge_seeker', 'common', 'CheckCircle', 25, '{"trigger": "quiz_answer", "targetValue": 1}', true, false),
('know_quiz_ace', 'Quiz Ace', 'Answer 5 quiz questions correctly', 'knowledge_seeker', 'common', 'GraduationCap', 25, '{"trigger": "quiz_answer", "targetValue": 5}', true, false),
('know_quiz_master', 'Quiz Master', 'Answer 20 quiz questions correctly', 'knowledge_seeker', 'uncommon', 'Lightbulb', 50, '{"trigger": "quiz_answer", "targetValue": 20}', true, false),
('know_deep_dive_first', 'Deep Knowledge', 'Complete your first deep dive content', 'knowledge_seeker', 'uncommon', 'BookOpen', 50, '{"trigger": "deep_dive_complete", "targetValue": 1}', true, false),
('know_course_starter', 'Course Starter', 'Start your first learning course', 'knowledge_seeker', 'common', 'Play', 25, '{"trigger": "course_start", "targetValue": 1}', true, false),
('know_scholar', 'Scholar', 'Complete 5 deep dive content paths', 'knowledge_seeker', 'rare', 'Library', 100, '{"trigger": "deep_dive_complete", "targetValue": 5}', true, false),

-- Portfolio Artisan Achievements (6)
('port_first_project', 'Creator', 'Upload your first project to your portfolio', 'portfolio_artisan', 'common', 'Plus', 25, '{"trigger": "project_upload", "targetValue": 1}', true, false),
('port_three_projects', 'Builder', 'Build a portfolio with 3 projects', 'portfolio_artisan', 'common', 'Layers', 25, '{"trigger": "project_upload", "targetValue": 3}', true, false),
('port_five_projects', 'Craftsman', 'Expand your portfolio to 5 projects', 'portfolio_artisan', 'uncommon', 'Hammer', 50, '{"trigger": "project_upload", "targetValue": 5}', true, false),
('port_ten_projects', 'Master Artisan', 'Showcase 10 projects in your portfolio', 'portfolio_artisan', 'rare', 'Palette', 100, '{"trigger": "project_upload", "targetValue": 10}', true, false),
('port_skill_collector', 'Skill Collector', 'Add 10 different skills to your profile', 'portfolio_artisan', 'uncommon', 'Tags', 50, '{"trigger": "skill_add", "targetValue": 10}', true, false),
('port_master_artisan', 'Portfolio Legend', 'Have 15+ projects with 25+ total skills', 'portfolio_artisan', 'epic', 'Gem', 250, '{"trigger": "project_upload", "conditions": {"minProjects": 15, "minSkills": 25}}', false, false),

-- Community Champion Achievements (6)
('comm_first_feedback', 'Helpful Peer', 'Give your first peer feedback', 'community_champion', 'common', 'MessageCircle', 25, '{"trigger": "feedback_give", "targetValue": 1}', true, false),
('comm_feedback_giver', 'Feedback Champion', 'Give 5 peer feedback reviews', 'community_champion', 'uncommon', 'MessagesSquare', 50, '{"trigger": "feedback_give", "targetValue": 5}', true, false),
('comm_hackathon_joiner', 'Hackathon Rookie', 'Join your first hackathon', 'community_champion', 'uncommon', 'Rocket', 50, '{"trigger": "hackathon_join", "targetValue": 1}', true, false),
('comm_hackathon_submitter', 'Hackathon Hero', 'Submit your first hackathon project', 'community_champion', 'rare', 'Trophy', 100, '{"trigger": "hackathon_submit", "targetValue": 1}', true, false),
('comm_guild_member', 'Guild Member', 'Join a Discord community guild', 'community_champion', 'common', 'Users', 25, '{"trigger": "guild_join", "targetValue": 1}', true, false),
('comm_mentor', 'Mentor', 'Give 10 peer feedback reviews and help others grow', 'community_champion', 'rare', 'HeartHandshake', 100, '{"trigger": "feedback_give", "targetValue": 10}', true, false),

-- Archetype Specialist Achievements (4)
('arch_discovered', 'Identity Found', 'Discover your career archetype', 'archetype_specialist', 'common', 'User', 25, '{"trigger": "archetype_complete"}', false, false),
('arch_builder', 'The Builder', 'Embrace the Builder archetype - creating is understanding', 'archetype_specialist', 'uncommon', 'Wrench', 50, '{"trigger": "archetype_complete", "conditions": {"archetype": "BUILDER"}}', false, true),
('arch_strategist', 'The Strategist', 'Embrace the Strategist archetype - planning is winning', 'archetype_specialist', 'uncommon', 'Map', 50, '{"trigger": "archetype_complete", "conditions": {"archetype": "STRATEGIST"}}', false, true),
('arch_explorer', 'The Explorer', 'Embrace the Explorer archetype - discovery is the goal', 'archetype_specialist', 'uncommon', 'Compass', 50, '{"trigger": "archetype_complete", "conditions": {"archetype": "EXPLORER"}}', false, true),

-- Pioneer Achievements (3)
('pioneer_early_adopter', 'Early Adopter', 'Be among the first to join FORGE-Z', 'pioneer', 'rare', 'Rocket', 100, '{"trigger": "login", "conditions": {"earlyAdopter": true}}', false, true),
('pioneer_company_explorer', 'Industry Scout', 'Explore 10 different companies', 'pioneer', 'uncommon', 'Building', 50, '{"trigger": "company_view", "targetValue": 10}', true, false),
('pioneer_role_explorer', 'Career Explorer', 'Explore 10 different career roles', 'pioneer', 'uncommon', 'Briefcase', 50, '{"trigger": "role_explore", "targetValue": 10}', true, false);

-- ============================================================================
-- Update timestamp trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_achievement_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER achievement_definitions_updated_at
  BEFORE UPDATE ON achievement_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_achievement_updated_at();

CREATE TRIGGER achievement_progress_updated_at
  BEFORE UPDATE ON achievement_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_achievement_updated_at();
