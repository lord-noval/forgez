-- Migration: Add Skills System (skills_taxonomy, user_skills, skill_endorsements)
-- Date: 2026-01-31

-- =====================================================
-- PART 1: CREATE ENUM TYPES
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_category') THEN
        CREATE TYPE skill_category AS ENUM ('KNOWLEDGE', 'SKILL', 'COMPETENCE', 'TRANSVERSAL', 'LANGUAGE');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_framework') THEN
        CREATE TYPE skill_framework AS ENUM ('ESCO', 'SFIA', 'ONET', 'FORGEZ', 'CUSTOM');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_verification_level') THEN
        CREATE TYPE skill_verification_level AS ENUM ('SELF_ASSESSED', 'PEER_ENDORSED', 'PROJECT_VERIFIED', 'AI_ANALYZED', 'ASSESSMENT_PASSED', 'CERTIFICATION_VERIFIED');
    END IF;
END $$;

-- =====================================================
-- PART 2: CREATE SKILLS TAXONOMY TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS skills_taxonomy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    framework skill_framework NOT NULL DEFAULT 'FORGEZ',
    framework_id TEXT,
    category skill_category NOT NULL,
    parent_skill_id UUID REFERENCES skills_taxonomy(id),
    level_descriptors JSONB,
    alt_labels TEXT[] DEFAULT '{}',
    related_occupations TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- PART 3: CREATE USER_SKILLS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills_taxonomy(id) ON DELETE CASCADE,
    proficiency_level INTEGER NOT NULL CHECK (proficiency_level BETWEEN 1 AND 7) DEFAULT 1,
    verification_level skill_verification_level NOT NULL DEFAULT 'SELF_ASSESSED',
    confidence_score DECIMAL(3,2) DEFAULT 1.0,
    evidence_count INTEGER DEFAULT 0,
    years_experience INTEGER,
    last_used_date DATE,
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, skill_id)
);

-- =====================================================
-- PART 4: CREATE SKILL_ENDORSEMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS skill_endorsements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_skill_id UUID NOT NULL REFERENCES user_skills(id) ON DELETE CASCADE,
    endorser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship TEXT,
    endorsement_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_skill_id, endorser_id)
);

-- =====================================================
-- PART 5: CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_skills_taxonomy_category ON skills_taxonomy(category);
CREATE INDEX IF NOT EXISTS idx_skills_taxonomy_framework ON skills_taxonomy(framework);
CREATE INDEX IF NOT EXISTS idx_skills_taxonomy_active ON skills_taxonomy(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_skills_taxonomy_name_search ON skills_taxonomy USING gin(to_tsvector('english', name));

CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill ON user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_verification ON user_skills(verification_level);

CREATE INDEX IF NOT EXISTS idx_skill_endorsements_user_skill ON skill_endorsements(user_skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_endorsements_endorser ON skill_endorsements(endorser_id);

-- =====================================================
-- PART 6: ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE skills_taxonomy ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_endorsements ENABLE ROW LEVEL SECURITY;

-- Skills taxonomy: public read
CREATE POLICY "Skills taxonomy viewable by everyone"
    ON skills_taxonomy FOR SELECT
    USING (true);

-- User skills: users can manage their own, view public profiles
CREATE POLICY "Users can view own skills"
    ON user_skills FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own skills"
    ON user_skills FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills"
    ON user_skills FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own skills"
    ON user_skills FOR DELETE
    USING (auth.uid() = user_id);

-- Skill endorsements: users can manage endorsements they give
CREATE POLICY "Users can view endorsements on own skills"
    ON skill_endorsements FOR SELECT
    USING (
        endorser_id = auth.uid() OR
        user_skill_id IN (SELECT id FROM user_skills WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create endorsements for others"
    ON skill_endorsements FOR INSERT
    WITH CHECK (
        auth.uid() = endorser_id AND
        user_skill_id NOT IN (SELECT id FROM user_skills WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete own endorsements"
    ON skill_endorsements FOR DELETE
    USING (auth.uid() = endorser_id);

-- =====================================================
-- PART 7: TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS update_user_skills_updated_at ON user_skills;
CREATE TRIGGER update_user_skills_updated_at
    BEFORE UPDATE ON user_skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PART 8: SEED INITIAL SKILLS DATA
-- =====================================================

-- Technical Skills (SKILL category)
INSERT INTO skills_taxonomy (name, description, category, framework, alt_labels) VALUES
('Python', 'General-purpose programming language', 'SKILL', 'FORGEZ', ARRAY['Python3', 'Python Programming']),
('JavaScript', 'Web programming language', 'SKILL', 'FORGEZ', ARRAY['JS', 'ECMAScript', 'ES6+']),
('TypeScript', 'Typed superset of JavaScript', 'SKILL', 'FORGEZ', ARRAY['TS']),
('React', 'JavaScript library for building user interfaces', 'SKILL', 'FORGEZ', ARRAY['React.js', 'ReactJS']),
('Node.js', 'JavaScript runtime environment', 'SKILL', 'FORGEZ', ARRAY['NodeJS', 'Node']),
('SQL', 'Database query language', 'SKILL', 'FORGEZ', ARRAY['Structured Query Language', 'PostgreSQL', 'MySQL']),
('Git', 'Version control system', 'SKILL', 'FORGEZ', ARRAY['Git VCS', 'GitHub', 'GitLab']),
('Docker', 'Container platform', 'SKILL', 'FORGEZ', ARRAY['Containerization', 'Docker Compose']),
('AWS', 'Amazon Web Services cloud platform', 'SKILL', 'FORGEZ', ARRAY['Amazon Web Services', 'Cloud Computing']),
('Machine Learning', 'Building predictive models and AI systems', 'SKILL', 'FORGEZ', ARRAY['ML', 'Deep Learning', 'Neural Networks']),
('Data Analysis', 'Analyzing and interpreting data', 'SKILL', 'FORGEZ', ARRAY['Data Analytics', 'Statistical Analysis']),
('API Development', 'Designing and building APIs', 'SKILL', 'FORGEZ', ARRAY['REST API', 'GraphQL', 'API Design']),
('C++', 'Systems programming language', 'SKILL', 'FORGEZ', ARRAY['CPP', 'C Plus Plus']),
('Java', 'Object-oriented programming language', 'SKILL', 'FORGEZ', ARRAY['Java SE', 'Java EE']),
('Rust', 'Systems programming language focused on safety', 'SKILL', 'FORGEZ', ARRAY['Rust Lang']),
('Go', 'Compiled programming language by Google', 'SKILL', 'FORGEZ', ARRAY['Golang']),
('Kubernetes', 'Container orchestration platform', 'SKILL', 'FORGEZ', ARRAY['K8s', 'K8']),
('Linux', 'Operating system administration', 'SKILL', 'FORGEZ', ARRAY['Linux Admin', 'Ubuntu', 'RHEL']),
('Robotics', 'Design and programming of robotic systems', 'SKILL', 'FORGEZ', ARRAY['ROS', 'Robot Operating System']),
('CAD Design', 'Computer-aided design for engineering', 'SKILL', 'FORGEZ', ARRAY['SolidWorks', 'AutoCAD', 'Fusion 360'])
ON CONFLICT DO NOTHING;

-- Knowledge areas (KNOWLEDGE category)
INSERT INTO skills_taxonomy (name, description, category, framework, alt_labels) VALUES
('Computer Science Fundamentals', 'Core CS concepts including algorithms and data structures', 'KNOWLEDGE', 'FORGEZ', ARRAY['CS Basics', 'Algorithms']),
('Software Architecture', 'Designing scalable software systems', 'KNOWLEDGE', 'FORGEZ', ARRAY['System Design', 'Architecture Patterns']),
('Cybersecurity', 'Information security principles and practices', 'KNOWLEDGE', 'FORGEZ', ARRAY['InfoSec', 'Security']),
('Cloud Architecture', 'Designing cloud-native systems', 'KNOWLEDGE', 'FORGEZ', ARRAY['Cloud Computing', 'Cloud Design']),
('Database Design', 'Relational and NoSQL database architecture', 'KNOWLEDGE', 'FORGEZ', ARRAY['DB Design', 'Schema Design']),
('Networking', 'Computer networking concepts', 'KNOWLEDGE', 'FORGEZ', ARRAY['TCP/IP', 'Network Engineering']),
('Aerospace Engineering', 'Principles of aircraft and spacecraft design', 'KNOWLEDGE', 'FORGEZ', ARRAY['Aeronautics', 'Space Engineering']),
('Electrical Engineering', 'Electrical systems and circuits', 'KNOWLEDGE', 'FORGEZ', ARRAY['EE', 'Electronics']),
('Mechanical Engineering', 'Mechanical systems and design', 'KNOWLEDGE', 'FORGEZ', ARRAY['ME', 'Mechanics']),
('Physics', 'Fundamental physics principles', 'KNOWLEDGE', 'FORGEZ', ARRAY['Applied Physics', 'Engineering Physics'])
ON CONFLICT DO NOTHING;

-- Competencies (COMPETENCE category)
INSERT INTO skills_taxonomy (name, description, category, framework, alt_labels) VALUES
('Problem Solving', 'Analytical thinking and solution development', 'COMPETENCE', 'FORGEZ', ARRAY['Analytical Skills', 'Critical Thinking']),
('Project Management', 'Planning and executing projects', 'COMPETENCE', 'FORGEZ', ARRAY['PM', 'Agile', 'Scrum']),
('Technical Leadership', 'Leading engineering teams', 'COMPETENCE', 'FORGEZ', ARRAY['Tech Lead', 'Engineering Management']),
('System Thinking', 'Understanding complex interconnected systems', 'COMPETENCE', 'FORGEZ', ARRAY['Systems Analysis']),
('Quality Assurance', 'Ensuring product quality and testing', 'COMPETENCE', 'FORGEZ', ARRAY['QA', 'Testing', 'TDD'])
ON CONFLICT DO NOTHING;

-- Soft Skills (TRANSVERSAL category)
INSERT INTO skills_taxonomy (name, description, category, framework, alt_labels) VALUES
('Communication', 'Clear verbal and written communication', 'TRANSVERSAL', 'FORGEZ', ARRAY['Written Communication', 'Verbal Communication']),
('Teamwork', 'Collaborating effectively with others', 'TRANSVERSAL', 'FORGEZ', ARRAY['Collaboration', 'Team Player']),
('Leadership', 'Guiding and inspiring others', 'TRANSVERSAL', 'FORGEZ', ARRAY['Team Leadership', 'People Management']),
('Adaptability', 'Adjusting to new situations and challenges', 'TRANSVERSAL', 'FORGEZ', ARRAY['Flexibility', 'Agility']),
('Time Management', 'Organizing and prioritizing work', 'TRANSVERSAL', 'FORGEZ', ARRAY['Prioritization', 'Organization']),
('Creativity', 'Generating innovative ideas and solutions', 'TRANSVERSAL', 'FORGEZ', ARRAY['Innovation', 'Creative Thinking']),
('Attention to Detail', 'Focus on accuracy and thoroughness', 'TRANSVERSAL', 'FORGEZ', ARRAY['Detail Oriented', 'Precision']),
('Mentoring', 'Teaching and guiding others', 'TRANSVERSAL', 'FORGEZ', ARRAY['Coaching', 'Knowledge Transfer'])
ON CONFLICT DO NOTHING;

-- Languages (LANGUAGE category)
INSERT INTO skills_taxonomy (name, description, category, framework, alt_labels) VALUES
('English', 'English language proficiency', 'LANGUAGE', 'FORGEZ', ARRAY['English Language']),
('Spanish', 'Spanish language proficiency', 'LANGUAGE', 'FORGEZ', ARRAY['Español']),
('French', 'French language proficiency', 'LANGUAGE', 'FORGEZ', ARRAY['Français']),
('German', 'German language proficiency', 'LANGUAGE', 'FORGEZ', ARRAY['Deutsch']),
('Mandarin Chinese', 'Mandarin Chinese proficiency', 'LANGUAGE', 'FORGEZ', ARRAY['Chinese', '中文']),
('Japanese', 'Japanese language proficiency', 'LANGUAGE', 'FORGEZ', ARRAY['日本語']),
('Portuguese', 'Portuguese language proficiency', 'LANGUAGE', 'FORGEZ', ARRAY['Português']),
('Arabic', 'Arabic language proficiency', 'LANGUAGE', 'FORGEZ', ARRAY['العربية'])
ON CONFLICT DO NOTHING;
