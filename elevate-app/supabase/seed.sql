-- Seed data for FORGE-Z app
-- Run this after schema.sql

-- Insert the 7 Behavior Clusters
INSERT INTO public.behavior_clusters (slug, name, description, icon, color, order_index) VALUES
('deep-work', 'Deep Work Protection', 'Master the art of focused, uninterrupted work. Build the discipline to protect 2-4 hours of deep work daily, eliminating distractions and entering flow states.', 'Focus', '#8B5CF6', 1),
('problem-diagnosis', 'Systematic Problem Diagnosis', 'Learn to fully understand problems before jumping to solutions. Develop frameworks for root cause analysis and avoid the trap of solving the wrong problem.', 'Search', '#06B6D4', 2),
('failure-documentation', 'Failure Documentation', 'Transform failures into valuable learning data. Build a systematic practice of documenting setbacks, extracting lessons, and preventing repeated mistakes.', 'FileText', '#F97316', 3),
('trade-off-awareness', 'Trade-off Awareness', 'Develop skill in recognizing and documenting trade-offs in every decision. Avoid analysis paralysis while maintaining quality decision-making.', 'Scale', '#EC4899', 4),
('experimentation', 'Minimum Viable Experimentation', 'Master the art of rapid learning through small bets. Design quick experiments to validate assumptions before committing major resources.', 'FlaskConical', '#84CC16', 5),
('relationships', 'Deliberate Relationship Investment', 'Build your network as a strategic asset. Develop systems for meaningful connections, follow-ups, and mutual value creation.', 'Users', '#F472B6', 6),
('growth-mindset', 'Growth-Oriented Mindset', 'Cultivate the belief that abilities develop through effort. Practice embracing challenges, persisting through setbacks, and learning from criticism.', 'TrendingUp', '#A78BFA', 7);

-- Insert Exercises
-- Deep Work
INSERT INTO public.exercises (cluster_id, name, description, instructions, level, tracking_type, xp_reward)
SELECT id, 'Airplane Mode Challenge', 'Complete a focused work session with your phone completely off or in airplane mode.',
  E'1. Put your phone in airplane mode or power it off completely\n2. Set a timer for your target duration\n3. Work on a single important task\n4. Only check your phone after the timer ends',
  'BEGINNER', 'DURATION', 25
FROM public.behavior_clusters WHERE slug = 'deep-work';

INSERT INTO public.exercises (cluster_id, name, description, instructions, level, tracking_type, xp_reward)
SELECT id, 'The Cave', 'Find or create a distraction-free environment and complete a 60-minute deep work block.',
  E'1. Choose a quiet location (library, empty room, noise-canceling headphones)\n2. Close all unnecessary browser tabs and apps\n3. Set a 60-minute timer\n4. Work deeply on your most important task',
  'BEGINNER', 'DURATION', 50
FROM public.behavior_clusters WHERE slug = 'deep-work';

INSERT INTO public.exercises (cluster_id, name, description, instructions, level, tracking_type, xp_reward)
SELECT id, 'Morning Deep Work Ritual', 'Complete your deep work session before checking any social media or messages.',
  E'1. Wake up and avoid checking your phone\n2. Go directly to your deep work task\n3. Complete at least 90 minutes of focused work\n4. Only then check messages and social media',
  'INTERMEDIATE', 'DURATION', 75
FROM public.behavior_clusters WHERE slug = 'deep-work';

INSERT INTO public.exercises (cluster_id, name, description, instructions, level, tracking_type, xp_reward)
SELECT id, 'Flow State Session', 'Complete a session where you achieved a genuine flow state - full immersion in the task.',
  E'1. Set up your environment for minimal interruptions\n2. Work on a challenging but achievable task\n3. Notice when you lose track of time\n4. Log only if you genuinely experienced flow',
  'ADVANCED', 'JOURNAL', 100
FROM public.behavior_clusters WHERE slug = 'deep-work';

-- Problem Diagnosis
INSERT INTO public.exercises (cluster_id, name, description, instructions, level, tracking_type, xp_reward)
SELECT id, '5 Whys Analysis', 'Apply the 5 Whys technique to understand the root cause of a problem.',
  E'1. Identify a problem you''re facing\n2. Ask ''Why?'' and write the answer\n3. Ask ''Why?'' about that answer\n4. Repeat until you''ve asked 5 times\n5. Document the root cause',
  'BEGINNER', 'JOURNAL', 30
FROM public.behavior_clusters WHERE slug = 'problem-diagnosis';

INSERT INTO public.exercises (cluster_id, name, description, instructions, level, tracking_type, xp_reward)
SELECT id, 'Problem Statement Writing', 'Write a clear, specific problem statement before attempting any solution.',
  E'1. Describe the current state\n2. Describe the desired state\n3. Identify the gap\n4. Define success criteria\n5. Only then consider solutions',
  'BEGINNER', 'JOURNAL', 25
FROM public.behavior_clusters WHERE slug = 'problem-diagnosis';

-- Failure Documentation
INSERT INTO public.exercises (cluster_id, name, description, instructions, level, tracking_type, xp_reward)
SELECT id, 'Daily Failure Log', 'Document one failure or mistake from today, no matter how small.',
  E'1. Identify something that didn''t go as planned\n2. Write what happened objectively\n3. Note what you learned\n4. Identify one thing you''ll do differently',
  'BEGINNER', 'JOURNAL', 20
FROM public.behavior_clusters WHERE slug = 'failure-documentation';

INSERT INTO public.exercises (cluster_id, name, description, instructions, level, tracking_type, xp_reward)
SELECT id, 'Failure Resume Entry', 'Add an entry to your Failure Resume - significant failures and their lessons.',
  E'1. Choose a significant failure from your past\n2. Document what you attempted\n3. Write what went wrong\n4. List the lessons learned\n5. Note how it made you stronger',
  'INTERMEDIATE', 'JOURNAL', 75
FROM public.behavior_clusters WHERE slug = 'failure-documentation';

-- Trade-off Awareness
INSERT INTO public.exercises (cluster_id, name, description, instructions, level, tracking_type, xp_reward)
SELECT id, 'Decision Journal Entry', 'Document a significant decision including the trade-offs you considered.',
  E'1. State the decision you made\n2. List the alternatives you considered\n3. Document what you gained with this choice\n4. Document what you gave up\n5. Note your confidence level',
  'BEGINNER', 'JOURNAL', 30
FROM public.behavior_clusters WHERE slug = 'trade-off-awareness';

-- Experimentation
INSERT INTO public.exercises (cluster_id, name, description, instructions, level, tracking_type, xp_reward)
SELECT id, 'Tiny Experiment', 'Run a small, quick experiment to test an assumption before committing resources.',
  E'1. Identify an assumption you''re making\n2. Design the smallest possible test\n3. Run the experiment (max 1 day)\n4. Document what you learned',
  'BEGINNER', 'JOURNAL', 40
FROM public.behavior_clusters WHERE slug = 'experimentation';

-- Relationships
INSERT INTO public.exercises (cluster_id, name, description, instructions, level, tracking_type, xp_reward)
SELECT id, 'Meaningful Check-in', 'Reach out to someone in your network with a genuine, thoughtful message.',
  E'1. Choose someone you haven''t contacted in a while\n2. Write a personalized message (not generic)\n3. Reference something specific about them\n4. Offer value or ask a genuine question',
  'BEGINNER', 'BINARY', 25
FROM public.behavior_clusters WHERE slug = 'relationships';

INSERT INTO public.exercises (cluster_id, name, description, instructions, level, tracking_type, xp_reward)
SELECT id, 'Value-First Outreach', 'Reach out to someone specifically to offer them value with no ask.',
  E'1. Think of someone who could benefit from something you know\n2. Share an article, resource, or introduction\n3. Ask for nothing in return\n4. Make it relevant to their interests',
  'BEGINNER', 'BINARY', 30
FROM public.behavior_clusters WHERE slug = 'relationships';

-- Growth Mindset
INSERT INTO public.exercises (cluster_id, name, description, instructions, level, tracking_type, xp_reward)
SELECT id, 'Challenge Embrace', 'Actively choose a challenging task over an easy one.',
  E'1. Identify two tasks: one comfortable, one challenging\n2. Choose the challenging one\n3. Notice your resistance\n4. Complete it anyway\n5. Reflect on what you learned',
  'BEGINNER', 'BINARY', 25
FROM public.behavior_clusters WHERE slug = 'growth-mindset';

INSERT INTO public.exercises (cluster_id, name, description, instructions, level, tracking_type, xp_reward)
SELECT id, 'Yet Statement', 'Catch yourself saying "I can''t" and reframe it as "I can''t yet".',
  E'1. Notice when you think ''I can''t do X''\n2. Reframe to ''I can''t do X yet''\n3. Identify one small step to learn X\n4. Document the reframe',
  'BEGINNER', 'COUNT', 15
FROM public.behavior_clusters WHERE slug = 'growth-mindset';

INSERT INTO public.exercises (cluster_id, name, description, instructions, level, tracking_type, xp_reward)
SELECT id, 'Deliberate Struggle', 'Spend 30 minutes struggling with something difficult without looking up the answer.',
  E'1. Choose a challenging problem\n2. Set a 30-minute timer\n3. Work through it without external help\n4. Document your thought process\n5. Only then look up solutions',
  'ADVANCED', 'DURATION', 75
FROM public.behavior_clusters WHERE slug = 'growth-mindset';

-- Insert Achievements
INSERT INTO public.achievements (slug, name, description, icon, rarity, xp_reward, criteria_type, criteria_value, criteria_skill) VALUES
('first-step', 'First Step', 'Complete your first daily check-in', 'Footprints', 'COMMON', 50, 'total_sessions', 1, NULL),
('week-warrior', 'Week Warrior', 'Maintain a 7-day streak', 'Calendar', 'COMMON', 100, 'streak', 7, NULL),
('fortnight-focus', 'Fortnight Focus', 'Maintain a 14-day streak', 'CalendarDays', 'UNCOMMON', 200, 'streak', 14, NULL),
('myth-breaker', 'Myth Breaker', 'Reach day 21 - you''ve broken the 21-day myth!', 'Hammer', 'UNCOMMON', 250, 'streak', 21, NULL),
('monthly-master', 'Monthly Master', 'Maintain a 30-day streak', 'Trophy', 'RARE', 350, 'streak', 30, NULL),
('halfway-hero', 'Halfway Hero', 'Reach day 33 - halfway to habit formation', 'Medal', 'RARE', 400, 'streak', 33, NULL),
('habit-formed', 'Habit Formed', 'Complete the full 66-day journey', 'Crown', 'LEGENDARY', 1000, 'streak', 66, NULL),
('first-focus', 'First Focus', 'Complete your first 25-minute focused session', 'Focus', 'COMMON', 50, 'skill_sessions', 1, 'deep-work'),
('phone-free-freshman', 'Phone-Free Freshman', 'Complete 5 sessions without checking your phone', 'SmartphoneOff', 'COMMON', 75, 'skill_sessions', 5, 'deep-work'),
('cave-dweller', 'Cave Dweller', 'Complete 20 sessions of 60+ minutes', 'Mountain', 'UNCOMMON', 200, 'long_sessions', 20, 'deep-work'),
('flow-state-initiate', 'Flow State Initiate', 'Log 10 sessions with self-reported flow state', 'Zap', 'RARE', 300, 'flow_sessions', 10, 'deep-work'),
('deep-work-master', 'Deep Work Master', 'Accumulate 100 hours of deep work', 'Brain', 'EPIC', 500, 'total_minutes', 6000, 'deep-work'),
('first-fall', 'First Fall', 'Document your first failure', 'FileWarning', 'COMMON', 50, 'skill_sessions', 1, 'failure-documentation'),
('failure-collector', 'Failure Collector', 'Document 25 failures with learnings', 'FolderOpen', 'UNCOMMON', 150, 'skill_sessions', 25, 'failure-documentation'),
('edison-method', 'The Edison Method', 'Document 100 failures with learnings', 'Lightbulb', 'EPIC', 500, 'skill_sessions', 100, 'failure-documentation'),
('xp-novice', 'XP Novice', 'Earn your first 500 XP', 'Star', 'COMMON', 50, 'total_xp', 500, NULL),
('xp-apprentice', 'XP Apprentice', 'Earn 2,500 XP total', 'Stars', 'UNCOMMON', 100, 'total_xp', 2500, NULL),
('xp-master', 'XP Master', 'Earn 10,000 XP total', 'Sparkles', 'RARE', 250, 'total_xp', 10000, NULL),
('perfect-week', 'Perfect Week', 'Complete all daily challenges for 7 days straight', 'CheckCircle2', 'RARE', 300, 'perfect_days', 7, NULL);

-- Insert Daily Challenges
INSERT INTO public.daily_challenges (name, description, xp_reward, challenge_type, target_value, skill_slug) VALUES
('Focus Sprint', 'Complete a 30-minute focused work session', 40, 'TIME', 30, 'deep-work'),
('Deep Dive', 'Complete a 60-minute deep work session', 75, 'TIME', 60, 'deep-work'),
('Ultra Focus', 'Complete a 90-minute deep work session', 100, 'TIME', 90, 'deep-work'),
('Root Cause Hunter', 'Complete a 5 Whys analysis on a current problem', 50, 'DOMAIN_PUSH', 1, 'problem-diagnosis'),
('Failure Finder', 'Document a failure from the past week', 45, 'DOMAIN_PUSH', 1, 'failure-documentation'),
('Connection Creator', 'Reach out to someone in your network with value', 40, 'DOMAIN_PUSH', 1, 'relationships'),
('Decision Documenter', 'Write a decision journal entry for today''s biggest choice', 45, 'DOMAIN_PUSH', 1, 'trade-off-awareness'),
('Growth Moment', 'Actively choose a challenging task over an easy one', 40, 'DOMAIN_PUSH', 1, 'growth-mindset'),
('Double Down', 'Complete exercises from two different skill clusters', 60, 'COMBO', 2, NULL),
('Triple Threat', 'Complete exercises from three different skill clusters', 100, 'COMBO', 3, NULL),
('Deep Reflection', 'Write a detailed journal entry (200+ words) about your learning', 60, 'QUALITY', 200, NULL);
