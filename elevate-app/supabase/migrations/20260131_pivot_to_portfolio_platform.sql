-- Migration: Pivot from habit-building to portfolio-based skill verification platform
-- Date: 2026-01-31

-- =====================================================
-- PART 1: DROP HABIT/GAMIFICATION TABLES
-- =====================================================

-- Drop user daily challenges (depends on daily_challenges and users)
DROP TABLE IF EXISTS user_daily_challenges CASCADE;

-- Drop daily challenges
DROP TABLE IF EXISTS daily_challenges CASCADE;

-- Drop user achievements (depends on achievements and users)
DROP TABLE IF EXISTS user_achievements CASCADE;

-- Drop achievements
DROP TABLE IF EXISTS achievements CASCADE;

-- Drop streak records
DROP TABLE IF EXISTS streak_records CASCADE;

-- Drop habit logs (depends on exercises and users)
DROP TABLE IF EXISTS habit_logs CASCADE;

-- Drop exercises (depends on behavior_clusters)
DROP TABLE IF EXISTS exercises CASCADE;

-- Drop behavior clusters
DROP TABLE IF EXISTS behavior_clusters CASCADE;

-- =====================================================
-- PART 2: DROP RELATED ENUM TYPES
-- =====================================================

DROP TYPE IF EXISTS exercise_level CASCADE;
DROP TYPE IF EXISTS tracking_type CASCADE;
DROP TYPE IF EXISTS achievement_rarity CASCADE;
DROP TYPE IF EXISTS challenge_type CASCADE;

-- =====================================================
-- PART 3: REMOVE GAMIFICATION COLUMNS FROM USERS TABLE
-- =====================================================

ALTER TABLE users DROP COLUMN IF EXISTS total_xp;
ALTER TABLE users DROP COLUMN IF EXISTS current_level;
ALTER TABLE users DROP COLUMN IF EXISTS current_streak;
ALTER TABLE users DROP COLUMN IF EXISTS longest_streak;
ALTER TABLE users DROP COLUMN IF EXISTS freeze_tokens;
ALTER TABLE users DROP COLUMN IF EXISTS primary_skill_id;

-- =====================================================
-- PART 4: ADD NEW COLUMNS TO USERS TABLE (if not exist)
-- =====================================================

-- Add headline, bio, location, social links if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'headline') THEN
        ALTER TABLE users ADD COLUMN headline TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
        ALTER TABLE users ADD COLUMN bio TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'location') THEN
        ALTER TABLE users ADD COLUMN location TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'linkedin_url') THEN
        ALTER TABLE users ADD COLUMN linkedin_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'github_url') THEN
        ALTER TABLE users ADD COLUMN github_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'portfolio_url') THEN
        ALTER TABLE users ADD COLUMN portfolio_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_employer') THEN
        ALTER TABLE users ADD COLUMN is_employer BOOLEAN DEFAULT false;
    END IF;
END $$;

-- =====================================================
-- PART 5: CREATE NEW TABLES FOR PIVOT
-- =====================================================

-- Industry enum for categorizing resources and careers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'industry_type') THEN
        CREATE TYPE industry_type AS ENUM ('space', 'energy', 'robotics', 'software', 'other');
    END IF;
END $$;

-- Learning resources table
CREATE TABLE IF NOT EXISTS learning_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    provider TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    duration TEXT,
    level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
    industry industry_type,
    skill_ids UUID[] DEFAULT '{}',
    rating DECIMAL(2,1),
    enrollments TEXT,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Career paths table
CREATE TABLE IF NOT EXISTS career_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    level TEXT CHECK (level IN ('Entry', 'Mid', 'Senior', 'Lead', 'Executive')),
    industry industry_type NOT NULL,
    salary_range_min INTEGER,
    salary_range_max INTEGER,
    growth_percentage INTEGER,
    required_skill_ids UUID[] DEFAULT '{}',
    example_companies TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Career examples (real people testimonials)
CREATE TABLE IF NOT EXISTS career_examples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    industry industry_type NOT NULL,
    image_url TEXT,
    quote TEXT,
    career_path TEXT[] DEFAULT '{}',
    linkedin_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Project shares tracking
CREATE TABLE IF NOT EXISTS project_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('discord', 'reddit', 'facebook', 'whatsapp', 'twitter', 'linkedin', 'copy')),
    shared_at TIMESTAMPTZ DEFAULT now()
);

-- User learning progress
CREATE TABLE IF NOT EXISTS user_learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, resource_id)
);

-- User career interests
CREATE TABLE IF NOT EXISTS user_career_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    career_path_id UUID NOT NULL REFERENCES career_paths(id) ON DELETE CASCADE,
    interest_level INTEGER CHECK (interest_level BETWEEN 1 AND 5) DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, career_path_id)
);

-- =====================================================
-- PART 6: CREATE INDEXES FOR NEW TABLES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_learning_resources_industry ON learning_resources(industry);
CREATE INDEX IF NOT EXISTS idx_learning_resources_featured ON learning_resources(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_career_paths_industry ON career_paths(industry);
CREATE INDEX IF NOT EXISTS idx_career_examples_industry ON career_examples(industry);
CREATE INDEX IF NOT EXISTS idx_project_shares_user ON project_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_project_shares_project ON project_shares(project_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_user ON user_learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_career_interests_user ON user_career_interests(user_id);

-- =====================================================
-- PART 7: ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_career_interests ENABLE ROW LEVEL SECURITY;

-- Learning resources: public read
CREATE POLICY "Learning resources are viewable by everyone"
    ON learning_resources FOR SELECT
    USING (true);

-- Career paths: public read
CREATE POLICY "Career paths are viewable by everyone"
    ON career_paths FOR SELECT
    USING (true);

-- Career examples: public read
CREATE POLICY "Career examples are viewable by everyone"
    ON career_examples FOR SELECT
    USING (true);

-- Project shares: users can see their own, create their own
CREATE POLICY "Users can view own project shares"
    ON project_shares FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own project shares"
    ON project_shares FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- User learning progress: users can manage their own
CREATE POLICY "Users can view own learning progress"
    ON user_learning_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own learning progress"
    ON user_learning_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning progress"
    ON user_learning_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- User career interests: users can manage their own
CREATE POLICY "Users can view own career interests"
    ON user_career_interests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own career interests"
    ON user_career_interests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own career interests"
    ON user_career_interests FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own career interests"
    ON user_career_interests FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- PART 8: SEED SAMPLE DATA
-- =====================================================

-- Insert sample learning resources
INSERT INTO learning_resources (title, provider, description, url, duration, level, industry, rating, enrollments, featured) VALUES
('Introduction to Machine Learning', 'Coursera', 'Learn the fundamentals of machine learning and neural networks', 'https://coursera.org/learn/ml-intro', '4 weeks', 'Beginner', 'software', 4.8, '250K+', true),
('Orbital Mechanics and Space Mission Design', 'MIT OpenCourseWare', 'Comprehensive course on orbital mechanics and trajectory design', 'https://ocw.mit.edu/orbital-mechanics', '12 weeks', 'Advanced', 'space', 4.9, '50K+', true),
('Industrial Robotics and Automation', 'edX', 'Master industrial robotics concepts including kinematics and control', 'https://edx.org/robotics', '8 weeks', 'Intermediate', 'robotics', 4.7, '75K+', false),
('Renewable Energy Systems', 'Khan Academy', 'Explore solar, wind, and battery storage technologies', 'https://khanacademy.org/renewable-energy', '6 weeks', 'Beginner', 'energy', 4.6, '120K+', true),
('Deep Learning Specialization', 'DeepLearning.AI', 'Master deep learning including CNNs, RNNs, and transformers', 'https://deeplearning.ai/specialization', '5 months', 'Intermediate', 'software', 4.9, '500K+', true),
('ROS2 for Robotics Development', 'The Construct', 'Learn Robot Operating System 2 for autonomous robots', 'https://theconstructsim.com/ros2', '10 weeks', 'Intermediate', 'robotics', 4.8, '25K+', true)
ON CONFLICT DO NOTHING;

-- Insert sample career paths
INSERT INTO career_paths (title, description, level, industry, salary_range_min, salary_range_max, growth_percentage, example_companies) VALUES
('Aerospace Engineer', 'Design and develop aircraft, spacecraft, and missiles', 'Mid', 'space', 95000, 140000, 8, ARRAY['SpaceX', 'Boeing', 'NASA', 'Lockheed Martin']),
('Machine Learning Engineer', 'Build and deploy machine learning models at scale', 'Mid', 'software', 120000, 180000, 35, ARRAY['Google', 'Meta', 'OpenAI', 'Anthropic']),
('Robotics Software Engineer', 'Develop software for autonomous robotic systems', 'Mid', 'robotics', 100000, 150000, 18, ARRAY['Boston Dynamics', 'Tesla', 'iRobot', 'ABB']),
('Solar Energy Engineer', 'Design and optimize solar power systems', 'Mid', 'energy', 80000, 120000, 22, ARRAY['SunPower', 'First Solar', 'Tesla Energy', 'Sunrun']),
('Full Stack Developer', 'Build complete web applications from frontend to backend', 'Entry', 'software', 80000, 120000, 20, ARRAY['Amazon', 'Microsoft', 'Stripe', 'Shopify']),
('Battery Systems Engineer', 'Develop energy storage solutions for EVs and grid', 'Senior', 'energy', 110000, 160000, 25, ARRAY['Northvolt', 'Tesla', 'LG Energy', 'CATL'])
ON CONFLICT DO NOTHING;

-- Insert sample career examples
INSERT INTO career_examples (name, role, company, industry, quote, career_path) VALUES
('Dr. Sarah Chen', 'Lead Propulsion Engineer', 'SpaceX', 'space', 'Starting with a physics degree, I worked my way up through hands-on projects and constant learning.', ARRAY['Physics BSc', 'Aerospace MSc', 'Junior Engineer', 'Senior Engineer', 'Lead Engineer']),
('Marcus Rodriguez', 'Robotics Team Lead', 'Boston Dynamics', 'robotics', 'Building robots in my garage as a kid led me to a career making machines that can walk and dance.', ARRAY['Mechanical Engineering', 'ROS Developer', 'Controls Engineer', 'Team Lead']),
('Emma Okonkwo', 'AI Research Scientist', 'DeepMind', 'software', 'Curiosity about how humans learn led me to create AI systems that learn in similar ways.', ARRAY['Computer Science', 'PhD in ML', 'Research Fellow', 'Research Scientist']),
('Thomas Virtanen', 'Senior Battery Engineer', 'Northvolt', 'energy', 'The transition to sustainable energy is the challenge of our generation.', ARRAY['Chemistry', 'Materials Science PhD', 'R&D Engineer', 'Senior Engineer'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 9: UPDATE TIMESTAMPS TRIGGER
-- =====================================================

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to new tables with updated_at column
DROP TRIGGER IF EXISTS update_learning_resources_updated_at ON learning_resources;
CREATE TRIGGER update_learning_resources_updated_at
    BEFORE UPDATE ON learning_resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_career_paths_updated_at ON career_paths;
CREATE TRIGGER update_career_paths_updated_at
    BEFORE UPDATE ON career_paths
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_learning_progress_updated_at ON user_learning_progress;
CREATE TRIGGER update_user_learning_progress_updated_at
    BEFORE UPDATE ON user_learning_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Migration complete!
-- =====================================================
