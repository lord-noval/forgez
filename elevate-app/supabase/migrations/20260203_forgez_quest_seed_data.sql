-- FORGE-Z Quest System Seed Data Migration
-- Date: 2026-02-03
-- This migration adds all seed data for the 8-Quest journey

-- =====================================================
-- PART 1: CREATE MISSING TABLES (if not exist)
-- =====================================================

-- Epic Objects Table (Quest 2)
CREATE TABLE IF NOT EXISTS epic_objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT NOT NULL,
    industry TEXT NOT NULL CHECK (industry IN ('space', 'energy', 'robotics', 'defense')),
    category TEXT,
    specs JSONB DEFAULT '{}',
    video_url TEXT,
    wikipedia_url TEXT,
    image_url TEXT,
    fun_facts TEXT[] DEFAULT '{}',
    quote TEXT,
    quote_author TEXT,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Deep Dive Content Table (Quest 3)
CREATE TABLE IF NOT EXISTS deep_dive_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    epic_object_id UUID REFERENCES epic_objects(id) ON DELETE CASCADE,
    path_type TEXT NOT NULL CHECK (path_type IN ('how_works', 'how_build', 'who_makes', 'who_operates')),
    content_type TEXT NOT NULL CHECK (content_type IN ('video', 'text', 'interactive')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    duration_minutes INTEGER DEFAULT 10,
    order_index INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 25,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Quiz Questions Table (Quest 3)
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deep_dive_id UUID REFERENCES deep_dive_content(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option_id TEXT NOT NULL,
    explanation TEXT,
    order_index INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Forge Companies Table (Quest 4)
CREATE TABLE IF NOT EXISTS forge_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    website_url TEXT,
    linkedin_url TEXT,
    country TEXT NOT NULL CHECK (country IN ('poland', 'germany', 'ukraine', 'usa')),
    city TEXT,
    industry TEXT NOT NULL CHECK (industry IN ('space', 'energy', 'robotics', 'defense')),
    employee_count TEXT,
    founded_year INTEGER,
    culture_tags TEXT[] DEFAULT '{}',
    tech_stack TEXT[] DEFAULT '{}',
    mission TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Talent Roles Table (Quest 5)
CREATE TABLE IF NOT EXISTS talent_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    industry TEXT NOT NULL CHECK (industry IN ('space', 'energy', 'robotics', 'defense')),
    level TEXT NOT NULL CHECK (level IN ('junior', 'mid', 'senior', 'lead')),
    salary_junior_min INTEGER,
    salary_junior_max INTEGER,
    salary_mid_min INTEGER,
    salary_mid_max INTEGER,
    salary_senior_min INTEGER,
    salary_senior_max INTEGER,
    market_demand INTEGER DEFAULT 50 CHECK (market_demand >= 0 AND market_demand <= 100),
    growth_rate INTEGER DEFAULT 0,
    required_skills TEXT[] DEFAULT '{}',
    education_paths TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Leader Insights Table (Quest 6)
CREATE TABLE IF NOT EXISTS leader_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    industry TEXT CHECK (industry IN ('space', 'energy', 'robotics', 'defense')),
    quote TEXT NOT NULL,
    soft_skill TEXT,
    image_url TEXT,
    linkedin_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Soft Skills Table (Quest 6)
CREATE TABLE IF NOT EXISTS soft_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Hackathons Table (Quest 8)
CREATE TABLE IF NOT EXISTS hackathons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    theme TEXT,
    sponsor_company_id UUID REFERENCES forge_companies(id),
    prize_pool TEXT,
    prizes JSONB DEFAULT '[]',
    required_skills TEXT[] DEFAULT '{}',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_deadline DATE,
    location TEXT,
    is_remote BOOLEAN DEFAULT true,
    max_team_size INTEGER DEFAULT 5,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
    registration_url TEXT,
    discord_channel TEXT,
    xp_reward INTEGER DEFAULT 200,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Discord Guilds Table (Quest 8)
CREATE TABLE IF NOT EXISTS discord_guilds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    industry TEXT CHECK (industry IN ('space', 'energy', 'robotics', 'defense', 'general')),
    invite_url TEXT,
    member_count INTEGER DEFAULT 0,
    icon_url TEXT,
    is_official BOOLEAN DEFAULT false,
    channels TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- PART 2: ENABLE RLS AND CREATE POLICIES
-- =====================================================

ALTER TABLE epic_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE deep_dive_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forge_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leader_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE soft_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE discord_guilds ENABLE ROW LEVEL SECURITY;

-- Public read policies (these are reference data tables)
CREATE POLICY IF NOT EXISTS "Epic objects are viewable by everyone" ON epic_objects FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Deep dive content is viewable by everyone" ON deep_dive_content FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Quiz questions are viewable by everyone" ON quiz_questions FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Forge companies are viewable by everyone" ON forge_companies FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Talent roles are viewable by everyone" ON talent_roles FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Leader insights are viewable by everyone" ON leader_insights FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Soft skills are viewable by everyone" ON soft_skills FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Hackathons are viewable by everyone" ON hackathons FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Discord guilds are viewable by everyone" ON discord_guilds FOR SELECT USING (true);

-- =====================================================
-- PART 3: CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_epic_objects_industry ON epic_objects(industry);
CREATE INDEX IF NOT EXISTS idx_epic_objects_featured ON epic_objects(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_deep_dive_epic ON deep_dive_content(epic_object_id);
CREATE INDEX IF NOT EXISTS idx_deep_dive_path ON deep_dive_content(path_type);
CREATE INDEX IF NOT EXISTS idx_quiz_deep_dive ON quiz_questions(deep_dive_id);
CREATE INDEX IF NOT EXISTS idx_forge_companies_country ON forge_companies(country);
CREATE INDEX IF NOT EXISTS idx_forge_companies_industry ON forge_companies(industry);
CREATE INDEX IF NOT EXISTS idx_talent_roles_industry ON talent_roles(industry);
CREATE INDEX IF NOT EXISTS idx_hackathons_status ON hackathons(status);
CREATE INDEX IF NOT EXISTS idx_discord_guilds_industry ON discord_guilds(industry);

-- =====================================================
-- PART 4: SEED EPIC OBJECTS (Quest 2)
-- =====================================================

INSERT INTO epic_objects (slug, name, tagline, description, industry, category, specs, video_url, wikipedia_url, image_url, fun_facts, quote, quote_author, difficulty_level, is_featured) VALUES

-- SPACE INDUSTRY (4 objects)
('starlink-satellite', 'Starlink Satellite', 'Connecting the Unconnected',
'Starlink is a satellite internet constellation operated by SpaceX, providing satellite Internet access coverage to most of the Earth. The constellation consists of thousands of mass-produced small satellites in low Earth orbit (LEO), which communicate with designated ground transceivers.',
'space', 'satellite',
'{"mass": "260 kg (v1.5)", "altitude": "550 km", "speed": "27,000 km/h", "latency": "20-40 ms", "bandwidth": "150-500 Mbps", "lifespan": "5 years", "antenna_type": "Phased array", "propulsion": "Krypton Hall thrusters", "solar_power": "3 kW"}',
'https://www.youtube.com/embed/0LtfKS0Z4sU',
'https://en.wikipedia.org/wiki/Starlink',
'/images/epic/starlink.jpg',
ARRAY['Each satellite weighs about as much as two adult pandas', 'The satellites autonomously avoid space debris', 'SpaceX launches 60 satellites at once', 'The constellation will eventually have 42,000 satellites'],
'We want to be the Internet provider for people who currently have none.',
'Elon Musk', 2, true),

('james-webb-telescope', 'James Webb Space Telescope', 'Seeing the First Light',
'The James Webb Space Telescope is the largest, most powerful space telescope ever built. It allows scientists to look farther than ever before and peer back in time to see the first galaxies that formed in the early universe.',
'space', 'telescope',
'{"mirror_diameter": "6.5 meters", "mass": "6,500 kg", "orbit_distance": "1.5 million km (L2)", "wavelength_range": "0.6 to 28.5 micrometers", "operating_temp": "-233°C", "sunshield_size": "21m x 14m", "cost": "$10 billion", "build_time": "25 years"}',
'https://www.youtube.com/embed/shPfqTK7WpI',
'https://en.wikipedia.org/wiki/James_Webb_Space_Telescope',
'/images/epic/jwst.jpg',
ARRAY['Its sunshield is the size of a tennis court', 'It can detect a bumblebee on the Moon', 'Over 10,000 people worked on the project', 'It observes in infrared to see through cosmic dust'],
'The JWST is not just looking at the past; it is looking at our cosmic origins.',
'Dr. John Mather', 4, true),

('mars-perseverance-rover', 'Mars Perseverance Rover', 'Searching for Ancient Life',
'Perseverance is a car-sized Mars rover designed to explore Jezero crater on Mars as part of NASA''s Mars 2020 mission. It is designed to seek signs of ancient life and collect rock samples for possible return to Earth.',
'space', 'rover',
'{"mass": "1,025 kg", "length": "3 meters", "power": "Nuclear (MMRTG)", "top_speed": "152 m/hour", "cameras": "23 cameras", "microphones": "2", "drill_depth": "7 cm", "helicopter": "Ingenuity drone"}',
'https://www.youtube.com/embed/4czjS9h4Fpg',
'https://en.wikipedia.org/wiki/Perseverance_(rover)',
'/images/epic/perseverance.jpg',
ARRAY['It carries a piece of Martian meteorite back to Mars', 'Has a helicopter named Ingenuity', 'Contains DNA of 11 million people on a chip', 'Traveled 472 million km to reach Mars'],
'This is the most ambitious mission ever sent to Mars.',
'Dr. Thomas Zurbuchen', 3, false),

('falcon-heavy-rocket', 'Falcon Heavy', 'Most Powerful Operational Rocket',
'Falcon Heavy is a partially reusable heavy-lift launch vehicle designed by SpaceX. It is the most powerful operational rocket in the world by a factor of two, capable of carrying large payloads to orbit and supporting human spaceflight.',
'space', 'launch_vehicle',
'{"height": "70 meters", "mass": "1,420,788 kg", "payload_leo": "63,800 kg", "payload_mars": "16,800 kg", "thrust": "22,819 kN", "boosters": "3 (2 reusable)", "engines": "27 Merlin engines", "cost_per_launch": "$97 million"}',
'https://www.youtube.com/embed/wbSwFU6tY1c',
'https://en.wikipedia.org/wiki/Falcon_Heavy',
'/images/epic/falcon-heavy.jpg',
ARRAY['First payload was a Tesla Roadster', 'Side boosters land simultaneously', 'Can lift more than a 737 airplane full of passengers', 'First commercial heavy-lift rocket'],
'Falcon Heavy will change everything about space access.',
'Gwynne Shotwell', 3, false),

-- ENERGY INDUSTRY (4 objects)
('offshore-wind-turbine', 'Offshore Wind Turbine', 'Harvesting the Ocean Winds',
'Offshore wind turbines are massive structures installed in bodies of water to harness wind energy. Modern offshore turbines can reach heights of 260 meters and generate up to 15 MW of clean electricity - enough to power 13,000 homes.',
'energy', 'renewable',
'{"height": "260 meters", "rotor_diameter": "220 meters", "capacity": "15 MW", "water_depth": "Up to 60 meters", "foundation_weight": "2,500 tonnes", "lifespan": "25-30 years", "capacity_factor": "50-60%", "annual_output": "67 GWh"}',
'https://www.youtube.com/embed/yYYS3BuClQw',
'https://en.wikipedia.org/wiki/Offshore_wind_power',
'/images/epic/offshore-wind.jpg',
ARRAY['Blade tips move at 290 km/h', 'One turbine can power a town', 'Fish populations increase around foundations', 'Capacity has grown 10x in 20 years'],
'Offshore wind is the cornerstone of our energy transition.',
'Henrik Poulsen', 2, true),

('grid-scale-battery', 'Grid-Scale Battery Storage', 'Storing the Sun and Wind',
'Grid-scale battery storage systems are massive installations that store excess renewable energy for later use. These systems help balance the grid, prevent blackouts, and enable higher renewable energy adoption.',
'energy', 'storage',
'{"capacity": "100-1000 MWh", "power_output": "100-400 MW", "efficiency": "85-95%", "response_time": "< 1 second", "lifespan": "15-20 years", "technology": "Lithium-ion / Flow batteries", "footprint": "1-5 acres per 100MWh", "cycles": "5000-10000"}',
'https://www.youtube.com/embed/9AMJJOcPBiU',
'https://en.wikipedia.org/wiki/Grid_energy_storage',
'/images/epic/battery-storage.jpg',
ARRAY['Tesla''s Hornsdale battery paid for itself in 2 years', 'Can respond 100x faster than gas plants', 'Flow batteries can last 25+ years', 'Global capacity doubled every year since 2018'],
'Storage is the key that unlocks 100% renewable energy.',
'Mary Powell', 3, true),

('fusion-reactor-iter', 'ITER Fusion Reactor', 'Capturing the Power of Stars',
'ITER is the world''s largest fusion experiment, designed to prove that fusion power can be generated at a commercial scale. Located in France, this international collaboration aims to produce 500 MW of fusion power - 10 times the energy put in.',
'energy', 'nuclear',
'{"plasma_volume": "840 cubic meters", "plasma_temp": "150 million °C", "magnetic_field": "11.8 Tesla", "fusion_power": "500 MW", "input_power": "50 MW", "weight": "23,000 tonnes", "height": "30 meters", "countries": "35 participating"}',
'https://www.youtube.com/embed/M6NlsaPJVBg',
'https://en.wikipedia.org/wiki/ITER',
'/images/epic/iter.jpg',
ARRAY['Plasma is hotter than the Sun''s core', 'Uses superconducting magnets cooled to -269°C', 'Fuel is found in seawater', 'Zero carbon emissions during operation'],
'ITER will show that a new form of energy is possible.',
'Dr. Bernard Bigot', 5, false),

('smart-grid-system', 'Smart Grid Infrastructure', 'The Intelligent Power Network',
'Smart grids use digital technology to monitor and manage electricity flow from all generation sources to meet varying demand. They enable two-way communication, predict failures, and integrate renewable sources seamlessly.',
'energy', 'infrastructure',
'{"sensors": "Millions deployed", "data_points": "Billions per day", "efficiency_gain": "10-15%", "outage_reduction": "50-70%", "renewable_integration": "Up to 80%", "ev_charging": "Managed automatically", "demand_response": "Real-time"}',
'https://www.youtube.com/embed/JwRTpWZReJk',
'https://en.wikipedia.org/wiki/Smart_grid',
'/images/epic/smart-grid.jpg',
ARRAY['Processes more data than social media platforms', 'Can predict equipment failure 6 months ahead', 'Enables neighbors to trade solar power', 'Saves billions in infrastructure costs'],
'The smart grid is the internet of energy.',
'Jesse Berst', 3, false),

-- ROBOTICS INDUSTRY (4 objects)
('boston-dynamics-atlas', 'Boston Dynamics Atlas', 'The Humanoid Athlete',
'Atlas is the world''s most dynamic humanoid robot, capable of running, jumping, backflipping, and navigating complex terrain. It represents the cutting edge of mobility, balance, and whole-body coordination.',
'robotics', 'humanoid',
'{"height": "1.5 meters", "weight": "89 kg", "degrees_of_freedom": "28", "power": "Electric + hydraulic", "speed": "2.5 m/s running", "jump_height": "1.5 meters", "payload": "11 kg", "sensors": "LIDAR, stereo vision"}',
'https://www.youtube.com/embed/tF4DML7FIWk',
'https://en.wikipedia.org/wiki/Atlas_(robot)',
'/images/epic/atlas.jpg',
ARRAY['Can do a standing backflip', 'Processes 1 TB of data per day', 'Uses 28 hydraulic joints', 'Learns from watching humans'],
'We want robots to be helpful partners for people.',
'Marc Raibert', 4, true),

('surgical-robot-davinci', 'da Vinci Surgical System', 'The Precision Surgeon',
'The da Vinci Surgical System enables surgeons to perform complex procedures through tiny incisions with enhanced precision. The robot translates the surgeon''s hand movements into smaller, more precise movements.',
'robotics', 'medical',
'{"arms": "4 robotic arms", "precision": "0.1 mm", "instruments": "60+ specialized tools", "3d_vision": "10x magnification", "procedures_performed": "10+ million", "recovery_time": "50% faster", "blood_loss": "90% less", "installations": "7,500+ worldwide"}',
'https://www.youtube.com/embed/VRqX_9dVCls',
'https://en.wikipedia.org/wiki/Da_Vinci_Surgical_System',
'/images/epic/davinci.jpg',
ARRAY['Has performed 10+ million surgeries', 'Instruments fit through incisions smaller than a dime', 'Surgeon sits at a console nearby', 'Filters hand tremors completely'],
'This technology has transformed surgery as we know it.',
'Dr. Catherine Mohr', 4, true),

('warehouse-robot-kiva', 'Amazon Warehouse Robots', 'The Tireless Workers',
'Amazon''s warehouse robots revolutionized logistics by bringing shelves to workers instead of workers to shelves. Over 750,000 robots now work alongside humans in fulfillment centers worldwide.',
'robotics', 'logistics',
'{"units_deployed": "750,000+", "speed": "1.3 m/s", "payload": "340 kg", "battery_life": "8 hours", "charge_time": "5 minutes", "accuracy": "99.99%", "picks_per_hour": "Up to 400", "navigation": "QR codes + vision"}',
'https://www.youtube.com/embed/HSA5Bq-1fU4',
'https://en.wikipedia.org/wiki/Amazon_Robotics',
'/images/epic/kiva.jpg',
ARRAY['Reduced walking by 50% for workers', 'Self-navigating with no central control', 'Process 1 million packages per day', 'Charge themselves automatically'],
'Robotics is not about replacing humans; it''s about augmenting them.',
'Tye Brady', 2, false),

('spot-robot-dog', 'Boston Dynamics Spot', 'The Robotic Explorer',
'Spot is a nimble robot that climbs stairs, traverses rough terrain, and operates in environments where wheeled robots can''t go. It''s used for inspection, data collection, and remote operations in hazardous environments.',
'robotics', 'quadruped',
'{"weight": "32 kg", "payload": "14 kg", "speed": "1.6 m/s", "runtime": "90 minutes", "cameras": "5 stereo pairs", "degrees_of_freedom": "12", "waterproof": "IP54 rated", "operating_temp": "-20 to 45°C"}',
'https://www.youtube.com/embed/wlkCQXHEgjA',
'https://en.wikipedia.org/wiki/Spot_(robot)',
'/images/epic/spot.jpg',
ARRAY['Can open doors autonomously', 'Used in Chernobyl reactor inspection', 'Has danced in a Mick Jagger video', 'Can self-right after falling'],
'Spot goes where people can''t or shouldn''t.',
'Michael Perry', 3, false),

-- DEFENSE INDUSTRY (4 objects)
('f35-lightning', 'F-35 Lightning II', 'The Digital Warrior',
'The F-35 Lightning II is the world''s most advanced multi-role stealth fighter. It combines unprecedented situational awareness, stealth, and information sharing capabilities in a single platform.',
'defense', 'aircraft',
'{"max_speed": "Mach 1.6", "range": "2,220 km", "ceiling": "15,200 m", "thrust": "191 kN", "sensors": "360° sensor fusion", "stealth": "Very Low Observable", "variants": "3 (A, B, C)", "countries": "14 operating"}',
'https://www.youtube.com/embed/IiVLqQQFCLU',
'https://en.wikipedia.org/wiki/Lockheed_Martin_F-35_Lightning_II',
'/images/epic/f35.jpg',
ARRAY['Helmet costs $400,000', 'Can see through the aircraft floor', 'Software has 8 million lines of code', 'Shares data with entire fleet in real-time'],
'The F-35 is a computer that happens to fly.',
'Gen. Mark Kelly', 5, true),

('unmanned-aerial-system', 'MQ-9 Reaper Drone', 'The Persistent Guardian',
'The MQ-9 Reaper is an unmanned aerial vehicle capable of remotely controlled or autonomous flight operations. It provides persistent intelligence, surveillance, and reconnaissance capabilities.',
'defense', 'uav',
'{"wingspan": "20 meters", "endurance": "27 hours", "ceiling": "15,000 m", "speed": "480 km/h", "payload": "1,700 kg", "sensors": "Multi-spectral targeting", "communication": "Satellite link", "range": "1,850 km"}',
'https://www.youtube.com/embed/kKqE-GR1DuU',
'https://en.wikipedia.org/wiki/General_Atomics_MQ-9_Reaper',
'/images/epic/reaper.jpg',
ARRAY['Pilots operate from thousands of miles away', 'Can loiter for over a day', 'Multiple sensors see day and night', 'Operates in teams with AI coordination'],
'Unmanned systems are transforming how we understand the battlefield.',
'Gen. Atomics', 4, true),

('cyber-defense-system', 'AI Cyber Defense Platform', 'The Digital Shield',
'Advanced AI-powered cyber defense systems use machine learning to detect, analyze, and respond to cyber threats in milliseconds. They protect critical infrastructure from nation-state attacks and emerging threats.',
'defense', 'cyber',
'{"detection_time": "< 1 second", "threats_analyzed": "Billions daily", "false_positive_rate": "< 0.1%", "response_time": "Automated", "learning_rate": "Continuous", "coverage": "Network to endpoint", "updates": "Real-time"}',
'https://www.youtube.com/embed/1PSAuFjJb4A',
'https://en.wikipedia.org/wiki/Computer_security',
'/images/epic/cyber-defense.jpg',
ARRAY['Analyzes 10 billion events per day', 'Learns attacker behavior patterns', 'Can isolate threats automatically', 'Predicts attacks before they happen'],
'In cyberspace, defense must be as intelligent as the threat.',
'Gen. Paul Nakasone', 4, false),

('autonomous-naval-vessel', 'Sea Hunter ACTUV', 'The Robot Warship',
'Sea Hunter is an autonomous unmanned surface vessel designed for anti-submarine warfare. It can operate for months at sea without a crew, tracking submarines and transmitting intelligence.',
'defense', 'naval',
'{"length": "40 meters", "displacement": "145 tonnes", "endurance": "70+ days", "speed": "27 knots", "range": "19,000 km", "crew": "0 (fully autonomous)", "sensors": "Sonar arrays, radar", "cost_per_day": "$15-20k vs $700k crewed"}',
'https://www.youtube.com/embed/VT_3XQSp4XA',
'https://en.wikipedia.org/wiki/Sea_Hunter',
'/images/epic/sea-hunter.jpg',
ARRAY['First fully autonomous warship', 'Operates 95% cheaper than crewed ships', 'Can navigate shipping lanes autonomously', 'Tracks submarines for weeks'],
'Autonomous vessels will redefine naval warfare.',
'Rear Adm. Robert Girrier', 5, false)

ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    specs = EXCLUDED.specs,
    video_url = EXCLUDED.video_url,
    wikipedia_url = EXCLUDED.wikipedia_url,
    fun_facts = EXCLUDED.fun_facts,
    quote = EXCLUDED.quote,
    quote_author = EXCLUDED.quote_author,
    difficulty_level = EXCLUDED.difficulty_level,
    is_featured = EXCLUDED.is_featured,
    updated_at = now();

-- =====================================================
-- PART 5: SEED DEEP DIVE CONTENT (Quest 3)
-- =====================================================

-- We'll create content for featured objects in each industry
-- Each object gets 4 paths: how_works, how_build, who_makes, who_operates

-- STARLINK SATELLITE DEEP DIVE
INSERT INTO deep_dive_content (epic_object_id, path_type, content_type, title, content, media_url, duration_minutes, order_index, xp_reward)
SELECT id, 'how_works', 'video', 'Understanding Satellite Internet',
'<h2>How Starlink Works</h2>
<p>Starlink uses a constellation of thousands of satellites in low Earth orbit (LEO) to provide internet service. Unlike traditional geostationary satellites that orbit at 35,786 km, Starlink satellites orbit at just 550 km.</p>
<h3>Key Components</h3>
<ul>
<li><strong>Phased Array Antenna:</strong> Electronically steers the signal without moving parts</li>
<li><strong>Inter-Satellite Links:</strong> Laser connections between satellites for global coverage</li>
<li><strong>Ground Stations:</strong> Connect the constellation to the terrestrial internet</li>
</ul>
<h3>Signal Path</h3>
<ol>
<li>User dish communicates with overhead satellite</li>
<li>Signal bounces between satellites via laser links</li>
<li>Reaches ground station connected to internet backbone</li>
<li>Return path completes the connection</li>
</ol>',
'https://www.youtube.com/embed/0LtfKS0Z4sU', 15, 1, 25
FROM epic_objects WHERE slug = 'starlink-satellite';

INSERT INTO deep_dive_content (epic_object_id, path_type, content_type, title, content, media_url, duration_minutes, order_index, xp_reward)
SELECT id, 'how_build', 'text', 'Building the Starlink Constellation',
'<h2>Manufacturing at Scale</h2>
<p>SpaceX builds Starlink satellites using mass production techniques borrowed from automotive manufacturing. Each satellite is assembled in Redmond, Washington.</p>
<h3>Production Process</h3>
<ul>
<li><strong>Circuit Board Assembly:</strong> Automated placement of thousands of components</li>
<li><strong>Antenna Manufacturing:</strong> Precision phased array construction</li>
<li><strong>Integration:</strong> Combining electronics, propulsion, and solar panels</li>
<li><strong>Testing:</strong> Thermal vacuum and vibration testing</li>
</ul>
<h3>Key Technologies</h3>
<ul>
<li><strong>Krypton Hall-Effect Thrusters:</strong> Efficient electric propulsion</li>
<li><strong>Autonomous Collision Avoidance:</strong> AI-powered debris avoidance</li>
<li><strong>Solar Arrays:</strong> Single panel design for compact stacking</li>
</ul>',
NULL, 12, 1, 25
FROM epic_objects WHERE slug = 'starlink-satellite';

INSERT INTO deep_dive_content (epic_object_id, path_type, content_type, title, content, media_url, duration_minutes, order_index, xp_reward)
SELECT id, 'who_makes', 'text', 'The Teams Behind Starlink',
'<h2>SpaceX Starlink Teams</h2>
<p>Thousands of engineers and technicians work on Starlink across multiple locations.</p>
<h3>Key Roles</h3>
<ul>
<li><strong>RF Engineers:</strong> Design antenna systems and signal processing</li>
<li><strong>Propulsion Engineers:</strong> Develop and optimize electric thrusters</li>
<li><strong>Software Engineers:</strong> Build satellite OS and ground systems</li>
<li><strong>Manufacturing Engineers:</strong> Optimize production processes</li>
<li><strong>Network Engineers:</strong> Design the mesh network architecture</li>
</ul>
<h3>Career Paths</h3>
<p>Entry points include aerospace engineering, electrical engineering, computer science, and physics degrees. SpaceX values hands-on experience and quick learning over specific credentials.</p>',
NULL, 10, 1, 25
FROM epic_objects WHERE slug = 'starlink-satellite';

INSERT INTO deep_dive_content (epic_object_id, path_type, content_type, title, content, media_url, duration_minutes, order_index, xp_reward)
SELECT id, 'who_operates', 'text', 'Operating the Starlink Network',
'<h2>Network Operations</h2>
<p>Starlink requires 24/7 operations to manage thousands of satellites and millions of customers.</p>
<h3>Operations Roles</h3>
<ul>
<li><strong>Mission Control:</strong> Monitor satellite health and orbits</li>
<li><strong>Network Operations Center:</strong> Manage traffic and capacity</li>
<li><strong>Customer Operations:</strong> Support 2+ million subscribers</li>
<li><strong>Ground Station Technicians:</strong> Maintain gateway infrastructure</li>
</ul>
<h3>Day-to-Day Operations</h3>
<ul>
<li>Collision avoidance maneuvers (daily)</li>
<li>Software updates pushed to entire constellation</li>
<li>Capacity management during peak hours</li>
<li>Deorbiting end-of-life satellites</li>
</ul>',
NULL, 10, 1, 25
FROM epic_objects WHERE slug = 'starlink-satellite';

-- ATLAS ROBOT DEEP DIVE
INSERT INTO deep_dive_content (epic_object_id, path_type, content_type, title, content, media_url, duration_minutes, order_index, xp_reward)
SELECT id, 'how_works', 'video', 'Inside Atlas: Dynamic Balance',
'<h2>How Atlas Moves</h2>
<p>Atlas achieves human-like movement through advanced control algorithms and powerful actuators.</p>
<h3>Balance System</h3>
<ul>
<li><strong>Model Predictive Control:</strong> Plans movements 0.5 seconds ahead</li>
<li><strong>Whole-Body Control:</strong> Coordinates all 28 joints simultaneously</li>
<li><strong>Inertial Measurement:</strong> High-speed orientation sensing</li>
</ul>
<h3>Power System</h3>
<ul>
<li>Electric-hydraulic hybrid for explosive power</li>
<li>Custom hydraulic actuators with integrated valves</li>
<li>Battery delivers 15 kW peak power</li>
</ul>',
'https://www.youtube.com/embed/tF4DML7FIWk', 15, 1, 25
FROM epic_objects WHERE slug = 'boston-dynamics-atlas';

INSERT INTO deep_dive_content (epic_object_id, path_type, content_type, title, content, media_url, duration_minutes, order_index, xp_reward)
SELECT id, 'how_build', 'text', 'Building a Humanoid Robot',
'<h2>Atlas Construction</h2>
<p>Building Atlas requires expertise across mechanical, electrical, and software engineering.</p>
<h3>Mechanical Systems</h3>
<ul>
<li><strong>Skeleton:</strong> 3D-printed titanium and aluminum frame</li>
<li><strong>Actuators:</strong> Custom hydraulic cylinders with force sensing</li>
<li><strong>Transmission:</strong> Low-backlash gears for precision</li>
</ul>
<h3>Sensor Suite</h3>
<ul>
<li>Stereo cameras for depth perception</li>
<li>LIDAR for mapping environments</li>
<li>Force/torque sensors in every joint</li>
<li>IMU for orientation tracking</li>
</ul>',
NULL, 12, 1, 25
FROM epic_objects WHERE slug = 'boston-dynamics-atlas';

INSERT INTO deep_dive_content (epic_object_id, path_type, content_type, title, content, media_url, duration_minutes, order_index, xp_reward)
SELECT id, 'who_makes', 'text', 'Boston Dynamics Engineering Teams',
'<h2>The Atlas Team</h2>
<p>Boston Dynamics employs approximately 1,000 people, with diverse backgrounds in robotics.</p>
<h3>Key Teams</h3>
<ul>
<li><strong>Locomotion:</strong> Walking, running, jumping algorithms</li>
<li><strong>Manipulation:</strong> Hands, arms, and object handling</li>
<li><strong>Perception:</strong> Computer vision and environment understanding</li>
<li><strong>Controls:</strong> Real-time motion planning and execution</li>
</ul>
<h3>Getting Hired</h3>
<p>They look for people who build things. Personal robotics projects, competition experience (FIRST, RoboCup), and strong fundamentals matter more than degrees.</p>',
NULL, 10, 1, 25
FROM epic_objects WHERE slug = 'boston-dynamics-atlas';

INSERT INTO deep_dive_content (epic_object_id, path_type, content_type, title, content, media_url, duration_minutes, order_index, xp_reward)
SELECT id, 'who_operates', 'text', 'Deploying Humanoid Robots',
'<h2>Atlas in Action</h2>
<p>While Atlas is primarily a research platform, it points to future deployment scenarios.</p>
<h3>Current Uses</h3>
<ul>
<li><strong>R&D Platform:</strong> Testing new algorithms and capabilities</li>
<li><strong>Demos:</strong> Showcasing the state of the art</li>
<li><strong>Algorithm Development:</strong> Transferring to commercial robots</li>
</ul>
<h3>Future Applications</h3>
<ul>
<li>Disaster response in human environments</li>
<li>Construction and heavy labor</li>
<li>Healthcare assistance</li>
<li>Entertainment and performance</li>
</ul>',
NULL, 8, 1, 25
FROM epic_objects WHERE slug = 'boston-dynamics-atlas';

-- OFFSHORE WIND TURBINE DEEP DIVE
INSERT INTO deep_dive_content (epic_object_id, path_type, content_type, title, content, media_url, duration_minutes, order_index, xp_reward)
SELECT id, 'how_works', 'video', 'Harnessing Ocean Wind Power',
'<h2>Wind to Electricity</h2>
<p>Offshore wind turbines convert kinetic wind energy into electricity through electromagnetic induction.</p>
<h3>Power Generation</h3>
<ul>
<li><strong>Blades:</strong> Aerodynamic lift creates rotation</li>
<li><strong>Gearbox:</strong> Increases rotation speed for generator</li>
<li><strong>Generator:</strong> Electromagnetic induction produces AC power</li>
<li><strong>Transformer:</strong> Steps up voltage for transmission</li>
</ul>
<h3>Control Systems</h3>
<ul>
<li>Pitch control adjusts blade angle for optimal power</li>
<li>Yaw system turns nacelle to face wind</li>
<li>Safety systems for storm conditions</li>
</ul>',
'https://www.youtube.com/embed/yYYS3BuClQw', 15, 1, 25
FROM epic_objects WHERE slug = 'offshore-wind-turbine';

INSERT INTO deep_dive_content (epic_object_id, path_type, content_type, title, content, media_url, duration_minutes, order_index, xp_reward)
SELECT id, 'how_build', 'text', 'Manufacturing Wind Turbines',
'<h2>Building Giants</h2>
<p>Modern offshore turbines are assembled from components built across multiple facilities.</p>
<h3>Key Components</h3>
<ul>
<li><strong>Blades:</strong> Fiberglass and carbon fiber composites, 100+ meters long</li>
<li><strong>Tower:</strong> Steel sections welded and transported by ship</li>
<li><strong>Nacelle:</strong> Houses generator, gearbox, and controls</li>
<li><strong>Foundation:</strong> Monopile, jacket, or floating platform</li>
</ul>
<h3>Installation Process</h3>
<ol>
<li>Foundation installation (3-7 days)</li>
<li>Tower section assembly (1-2 days)</li>
<li>Nacelle lift (1 day)</li>
<li>Blade installation (1 day)</li>
</ol>',
NULL, 12, 1, 25
FROM epic_objects WHERE slug = 'offshore-wind-turbine';

INSERT INTO deep_dive_content (epic_object_id, path_type, content_type, title, content, media_url, duration_minutes, order_index, xp_reward)
SELECT id, 'who_makes', 'text', 'Wind Energy Industry Careers',
'<h2>Building the Wind Industry</h2>
<p>The offshore wind industry employs hundreds of thousands globally.</p>
<h3>Manufacturing Roles</h3>
<ul>
<li><strong>Blade Technicians:</strong> Composite layup and quality control</li>
<li><strong>Mechanical Engineers:</strong> Drivetrain and structural design</li>
<li><strong>Electrical Engineers:</strong> Generator and power systems</li>
<li><strong>Marine Engineers:</strong> Foundation and installation vessels</li>
</ul>
<h3>Major Employers</h3>
<p>Vestas, Siemens Gamesa, GE Renewable Energy, Ørsted, and Equinor lead the industry.</p>',
NULL, 10, 1, 25
FROM epic_objects WHERE slug = 'offshore-wind-turbine';

INSERT INTO deep_dive_content (epic_object_id, path_type, content_type, title, content, media_url, duration_minutes, order_index, xp_reward)
SELECT id, 'who_operates', 'text', 'Operating Wind Farms',
'<h2>Wind Farm Operations</h2>
<p>Operating an offshore wind farm requires specialized skills and vessels.</p>
<h3>Operations Roles</h3>
<ul>
<li><strong>Wind Turbine Technicians:</strong> Maintenance and repairs at height and sea</li>
<li><strong>Control Room Operators:</strong> Monitor performance and respond to issues</li>
<li><strong>Marine Coordinators:</strong> Manage vessel operations</li>
<li><strong>SCADA Engineers:</strong> Maintain monitoring systems</li>
</ul>
<h3>Career Path</h3>
<p>Many technicians start with electrical or mechanical backgrounds. GWO (Global Wind Organisation) certification is standard for safety training.</p>',
NULL, 10, 1, 25
FROM epic_objects WHERE slug = 'offshore-wind-turbine';

-- F-35 LIGHTNING DEEP DIVE
INSERT INTO deep_dive_content (epic_object_id, path_type, content_type, title, content, media_url, duration_minutes, order_index, xp_reward)
SELECT id, 'how_works', 'video', 'Fifth Generation Fighter Technology',
'<h2>F-35 Systems Integration</h2>
<p>The F-35 represents the most integrated fighter aircraft ever built.</p>
<h3>Sensor Fusion</h3>
<ul>
<li><strong>AN/APG-81 Radar:</strong> AESA radar with electronic warfare</li>
<li><strong>Distributed Aperture System:</strong> 360° infrared coverage</li>
<li><strong>Electro-Optical Targeting System:</strong> Long-range identification</li>
<li><strong>Helmet Mounted Display:</strong> See-through-aircraft capability</li>
</ul>
<h3>Stealth Technology</h3>
<ul>
<li>Radar-absorbing materials and coatings</li>
<li>Internal weapons bays</li>
<li>Carefully shaped airframe</li>
</ul>',
'https://www.youtube.com/embed/IiVLqQQFCLU', 15, 1, 25
FROM epic_objects WHERE slug = 'f35-lightning';

INSERT INTO deep_dive_content (epic_object_id, path_type, content_type, title, content, media_url, duration_minutes, order_index, xp_reward)
SELECT id, 'how_build', 'text', 'Building the F-35',
'<h2>Global Manufacturing</h2>
<p>The F-35 is built by an international consortium led by Lockheed Martin.</p>
<h3>Major Assemblies</h3>
<ul>
<li><strong>Forward Fuselage:</strong> Lockheed Martin, Fort Worth</li>
<li><strong>Wings:</strong> Lockheed Martin, Marietta + international partners</li>
<li><strong>Center Fuselage:</strong> Northrop Grumman</li>
<li><strong>Aft Fuselage:</strong> BAE Systems</li>
<li><strong>Engine:</strong> Pratt & Whitney F135</li>
</ul>
<h3>Assembly Process</h3>
<p>Final assembly takes 18-24 months at Fort Worth, with extensive testing before delivery.</p>',
NULL, 12, 1, 25
FROM epic_objects WHERE slug = 'f35-lightning';

INSERT INTO deep_dive_content (epic_object_id, path_type, content_type, title, content, media_url, duration_minutes, order_index, xp_reward)
SELECT id, 'who_makes', 'text', 'Aerospace Defense Careers',
'<h2>Working in Defense Aerospace</h2>
<p>The F-35 program employs over 250,000 people across 1,500+ suppliers.</p>
<h3>Engineering Roles</h3>
<ul>
<li><strong>Systems Engineers:</strong> Integrate complex subsystems</li>
<li><strong>Software Engineers:</strong> 8 million lines of flight code</li>
<li><strong>Avionics Engineers:</strong> Sensors and electronic systems</li>
<li><strong>Structural Engineers:</strong> Airframe design and analysis</li>
</ul>
<h3>Security Clearance</h3>
<p>Most positions require Secret or Top Secret clearance. U.S. citizenship typically required for classified programs.</p>',
NULL, 10, 1, 25
FROM epic_objects WHERE slug = 'f35-lightning';

INSERT INTO deep_dive_content (epic_object_id, path_type, content_type, title, content, media_url, duration_minutes, order_index, xp_reward)
SELECT id, 'who_operates', 'text', 'Operating the F-35',
'<h2>F-35 Operations</h2>
<p>14 countries operate the F-35, with extensive support infrastructure.</p>
<h3>Operator Roles</h3>
<ul>
<li><strong>Fighter Pilots:</strong> Elite aviators with years of training</li>
<li><strong>Maintenance Crews:</strong> Avionics, engines, and structures specialists</li>
<li><strong>Mission Planners:</strong> Prepare flight plans and tactics</li>
<li><strong>Intelligence Officers:</strong> Analyze mission data</li>
</ul>
<h3>ALIS/ODIN System</h3>
<p>Autonomous Logistics Information System manages parts, maintenance, and mission planning across the global fleet.</p>',
NULL, 10, 1, 25
FROM epic_objects WHERE slug = 'f35-lightning';

-- =====================================================
-- PART 6: SEED QUIZ QUESTIONS (Quest 3)
-- =====================================================

-- Starlink Quiz Questions
INSERT INTO quiz_questions (deep_dive_id, question, options, correct_option_id, explanation, order_index, xp_reward)
SELECT id,
'At what altitude do Starlink satellites orbit?',
'[{"id": "a", "text": "35,786 km (geostationary orbit)", "isCorrect": false}, {"id": "b", "text": "550 km (low Earth orbit)", "isCorrect": true}, {"id": "c", "text": "2,000 km (medium Earth orbit)", "isCorrect": false}, {"id": "d", "text": "36,000 km (high Earth orbit)", "isCorrect": false}]',
'b',
'Starlink satellites orbit at approximately 550 km in low Earth orbit, which enables lower latency compared to traditional geostationary satellites at 35,786 km.',
1, 50
FROM deep_dive_content WHERE path_type = 'how_works' AND epic_object_id = (SELECT id FROM epic_objects WHERE slug = 'starlink-satellite');

INSERT INTO quiz_questions (deep_dive_id, question, options, correct_option_id, explanation, order_index, xp_reward)
SELECT id,
'What type of propulsion do Starlink satellites use?',
'[{"id": "a", "text": "Chemical rockets", "isCorrect": false}, {"id": "b", "text": "Solar sails", "isCorrect": false}, {"id": "c", "text": "Krypton Hall-effect thrusters", "isCorrect": true}, {"id": "d", "text": "Nuclear thermal", "isCorrect": false}]',
'c',
'Starlink uses Krypton Hall-effect thrusters - efficient electric propulsion systems that use krypton gas as propellant.',
1, 50
FROM deep_dive_content WHERE path_type = 'how_build' AND epic_object_id = (SELECT id FROM epic_objects WHERE slug = 'starlink-satellite');

-- Atlas Robot Quiz Questions
INSERT INTO quiz_questions (deep_dive_id, question, options, correct_option_id, explanation, order_index, xp_reward)
SELECT id,
'How many degrees of freedom does the Atlas robot have?',
'[{"id": "a", "text": "12", "isCorrect": false}, {"id": "b", "text": "20", "isCorrect": false}, {"id": "c", "text": "28", "isCorrect": true}, {"id": "d", "text": "36", "isCorrect": false}]',
'c',
'Atlas has 28 hydraulic degrees of freedom, allowing it to perform complex movements like running, jumping, and backflips.',
1, 50
FROM deep_dive_content WHERE path_type = 'how_works' AND epic_object_id = (SELECT id FROM epic_objects WHERE slug = 'boston-dynamics-atlas');

INSERT INTO quiz_questions (deep_dive_id, question, options, correct_option_id, explanation, order_index, xp_reward)
SELECT id,
'What type of power system does Atlas use?',
'[{"id": "a", "text": "Fully electric", "isCorrect": false}, {"id": "b", "text": "Electric-hydraulic hybrid", "isCorrect": true}, {"id": "c", "text": "Pneumatic", "isCorrect": false}, {"id": "d", "text": "Internal combustion", "isCorrect": false}]',
'b',
'Atlas uses an electric-hydraulic hybrid system - electric motors power hydraulic pumps that drive the actuators for explosive, powerful movements.',
1, 50
FROM deep_dive_content WHERE path_type = 'how_build' AND epic_object_id = (SELECT id FROM epic_objects WHERE slug = 'boston-dynamics-atlas');

-- Wind Turbine Quiz Questions
INSERT INTO quiz_questions (deep_dive_id, question, options, correct_option_id, explanation, order_index, xp_reward)
SELECT id,
'What is the typical capacity factor for offshore wind turbines?',
'[{"id": "a", "text": "20-30%", "isCorrect": false}, {"id": "b", "text": "30-40%", "isCorrect": false}, {"id": "c", "text": "50-60%", "isCorrect": true}, {"id": "d", "text": "80-90%", "isCorrect": false}]',
'c',
'Offshore wind turbines achieve 50-60% capacity factor due to stronger and more consistent wind at sea, compared to 25-35% for onshore turbines.',
1, 50
FROM deep_dive_content WHERE path_type = 'how_works' AND epic_object_id = (SELECT id FROM epic_objects WHERE slug = 'offshore-wind-turbine');

INSERT INTO quiz_questions (deep_dive_id, question, options, correct_option_id, explanation, order_index, xp_reward)
SELECT id,
'What material are modern wind turbine blades primarily made of?',
'[{"id": "a", "text": "Aluminum", "isCorrect": false}, {"id": "b", "text": "Steel", "isCorrect": false}, {"id": "c", "text": "Fiberglass and carbon fiber composites", "isCorrect": true}, {"id": "d", "text": "Wood", "isCorrect": false}]',
'c',
'Wind turbine blades are made from fiberglass and carbon fiber composites for their high strength-to-weight ratio, essential for efficiency.',
1, 50
FROM deep_dive_content WHERE path_type = 'how_build' AND epic_object_id = (SELECT id FROM epic_objects WHERE slug = 'offshore-wind-turbine');

-- F-35 Quiz Questions
INSERT INTO quiz_questions (deep_dive_id, question, options, correct_option_id, explanation, order_index, xp_reward)
SELECT id,
'How many lines of code does the F-35 flight software contain?',
'[{"id": "a", "text": "500,000", "isCorrect": false}, {"id": "b", "text": "2 million", "isCorrect": false}, {"id": "c", "text": "8 million", "isCorrect": true}, {"id": "d", "text": "50 million", "isCorrect": false}]',
'c',
'The F-35 contains approximately 8 million lines of code - more than any other fighter aircraft and comparable to a modern operating system.',
1, 50
FROM deep_dive_content WHERE path_type = 'how_works' AND epic_object_id = (SELECT id FROM epic_objects WHERE slug = 'f35-lightning');

INSERT INTO quiz_questions (deep_dive_id, question, options, correct_option_id, explanation, order_index, xp_reward)
SELECT id,
'How many countries participate in the F-35 program?',
'[{"id": "a", "text": "5", "isCorrect": false}, {"id": "b", "text": "8", "isCorrect": false}, {"id": "c", "text": "14", "isCorrect": true}, {"id": "d", "text": "20", "isCorrect": false}]',
'c',
'14 countries currently operate or have ordered F-35s: USA, UK, Italy, Netherlands, Turkey, Canada, Australia, Denmark, Norway, Israel, Japan, South Korea, Poland, and Singapore.',
1, 50
FROM deep_dive_content WHERE path_type = 'who_makes' AND epic_object_id = (SELECT id FROM epic_objects WHERE slug = 'f35-lightning');

-- =====================================================
-- PART 7: SEED FORGE COMPANIES (Quest 4)
-- =====================================================

INSERT INTO forge_companies (slug, name, description, logo_url, website_url, country, city, industry, employee_count, founded_year, culture_tags, tech_stack, mission, is_featured) VALUES

-- POLAND (Space, Energy, Robotics, Defense)
('novasat-technologies', 'NovaSat Technologies', 'Polish space startup developing advanced satellite communication systems and ground stations for LEO constellations.', '/images/companies/novasat.png', 'https://novasat.example.com', 'poland', 'Warsaw', 'space', '50-200', 2019, ARRAY['Innovation-driven', 'Startup culture', 'Remote-friendly', 'Work-life balance'], ARRAY['C++', 'Python', 'MATLAB', 'Verilog', 'Linux'], 'Democratizing access to space communications for European enterprises', true),

('baltic-wind-energy', 'Baltic Wind Energy', 'Leading developer of offshore wind projects in the Baltic Sea, contributing to Poland''s energy transition.', '/images/companies/baltic-wind.png', 'https://balticwind.example.com', 'poland', 'Gdańsk', 'energy', '200-500', 2015, ARRAY['Sustainability-focused', 'Engineering excellence', 'Growth opportunities', 'International teams'], ARRAY['AutoCAD', 'ANSYS', 'Python', 'SAP', 'GIS'], 'Powering Poland''s future with clean Baltic wind', true),

('robotics-lab-wroclaw', 'Robotics Lab Wrocław', 'University spin-off developing collaborative robots for manufacturing and healthcare applications.', '/images/companies/rl-wroclaw.png', 'https://roboticslab.example.com', 'poland', 'Wrocław', 'robotics', '20-50', 2020, ARRAY['R&D focused', 'Academic partnerships', 'Patent incentives', 'Flexible hours'], ARRAY['ROS2', 'C++', 'Python', 'TensorFlow', 'NVIDIA Isaac'], 'Making robotics accessible to every Polish manufacturer', false),

('cybershield-polska', 'CyberShield Polska', 'Cybersecurity firm specializing in defense-grade network protection and threat intelligence.', '/images/companies/cybershield.png', 'https://cybershield.example.com', 'poland', 'Kraków', 'defense', '100-200', 2017, ARRAY['Security clearance available', 'Continuous learning', 'Mission-driven', 'Competitive salary'], ARRAY['Python', 'Go', 'Rust', 'Splunk', 'Kubernetes'], 'Protecting Poland''s critical infrastructure from cyber threats', false),

('stellar-dynamics-pl', 'Stellar Dynamics PL', 'Developing propulsion systems and structural components for small satellites and space probes.', '/images/companies/stellar-pl.png', 'https://stellar-dynamics.example.com', 'poland', 'Łódź', 'space', '30-80', 2021, ARRAY['Deep tech', 'ESA partnerships', 'Equity participation', 'Innovation sprints'], ARRAY['MATLAB', 'Simulink', 'C', 'FreeRTOS', 'CATIA'], 'Engineering the next generation of European space propulsion', false),

-- GERMANY (Space, Energy, Robotics, Defense)
('orbit-systems-gmbh', 'Orbit Systems GmbH', 'German aerospace company building satellite platforms and space-qualified electronics for ESA missions.', '/images/companies/orbit-systems.png', 'https://orbit-systems.example.com', 'germany', 'Munich', 'space', '500-1000', 2008, ARRAY['Engineering culture', 'Work-life balance', '13th month bonus', 'Career progression'], ARRAY['C', 'Ada', 'VHDL', 'DOORS', 'ECSS standards'], 'German precision engineering for European space exploration', true),

('energiewende-tech', 'Energiewende Tech', 'Developing AI-powered smart grid solutions to integrate renewable energy across European grids.', '/images/companies/energiewende.png', 'https://energiewende.example.com', 'germany', 'Berlin', 'energy', '100-300', 2016, ARRAY['Green mission', 'Flat hierarchy', 'Innovation sprints', 'International team'], ARRAY['Python', 'TensorFlow', 'Kubernetes', 'PostgreSQL', 'React'], 'Accelerating Germany''s energy transition through intelligent grids', true),

('franka-robotik', 'Franka Robotik', 'World-class collaborative robot manufacturer known for sensitive, precise cobot arms.', '/images/companies/franka.png', 'https://franka.example.com', 'germany', 'Munich', 'robotics', '200-500', 2016, ARRAY['Hardware excellence', 'Research partnerships', 'Patent focus', 'Diverse teams'], ARRAY['C++', 'ROS', 'Python', 'Real-time Linux', 'PyTorch'], 'Making robots as intuitive to use as smartphones', true),

('defense-solutions-de', 'Defense Solutions DE', 'Systems integrator for German armed forces, specializing in command and control systems.', '/images/companies/defense-de.png', 'https://defense-de.example.com', 'germany', 'Bonn', 'defense', '1000+', 2005, ARRAY['Security cleared work', 'Government contracts', 'Stable careers', 'Excellent benefits'], ARRAY['Java', 'C#', '.NET', 'Oracle', 'NATO standards'], 'Strengthening European defense through integrated systems', false),

('hydrogen-tech-hamburg', 'Hydrogen Tech Hamburg', 'Pioneering green hydrogen production and fuel cell technology for maritime and industrial use.', '/images/companies/hydrogen-hamburg.png', 'https://hydrogen-tech.example.com', 'germany', 'Hamburg', 'energy', '80-150', 2018, ARRAY['Climate impact', 'Rapid growth', 'Engineering excellence', 'Stock options'], ARRAY['Python', 'MATLAB', 'Simulink', 'PLCs', 'SCADA'], 'Powering the hydrogen economy from Hamburg to the world', false),

-- UKRAINE (Space, Energy, Robotics, Defense)
('yuzhnoye-new-space', 'Yuzhnoye New Space', 'Leveraging Ukraine''s rocket heritage to build next-gen small launch vehicles and satellite buses.', '/images/companies/yuzhnoye-ns.png', 'https://yuzhnoye-newspace.example.com', 'ukraine', 'Dnipro', 'space', '100-300', 2020, ARRAY['Heritage technology', 'Startup agility', 'Remote work', 'Equity options'], ARRAY['C', 'Python', 'MATLAB', 'SolidWorks', 'Altium'], 'New space innovation built on 70 years of rocket science', true),

('solartek-ukraine', 'SolarTek Ukraine', 'Manufacturing high-efficiency solar panels and developing utility-scale solar installations.', '/images/companies/solartek.png', 'https://solartek.example.com', 'ukraine', 'Kyiv', 'energy', '200-500', 2014, ARRAY['Manufacturing excellence', 'Export focused', 'Skills development', 'Team spirit'], ARRAY['AutoCAD', 'PVSYST', 'SAP', 'PLC programming', 'Python'], 'Producing world-class solar technology from the heart of Europe', false),

('autonomy-robotics-ua', 'Autonomy Robotics UA', 'Building autonomous ground vehicles for agriculture, logistics, and demining operations.', '/images/companies/autonomy-ua.png', 'https://autonomy-robotics.example.com', 'ukraine', 'Kharkiv', 'robotics', '30-80', 2019, ARRAY['Deep tech', 'Social impact', 'International clients', 'Rapid growth'], ARRAY['ROS2', 'C++', 'Python', 'PyTorch', 'GPS/RTK'], 'Autonomous systems making Ukraine''s fields and roads safer', true),

('aegis-defense-ua', 'Aegis Defense UA', 'Developing drone detection, electronic warfare, and counter-UAS systems for national defense.', '/images/companies/aegis-ua.png', 'https://aegis-defense.example.com', 'ukraine', 'Kyiv', 'defense', '50-150', 2022, ARRAY['Mission critical', 'Rapid innovation', 'Combat proven', 'Global impact'], ARRAY['C++', 'VHDL', 'Python', 'SDR', 'Machine Learning'], 'Protecting Ukrainian skies with advanced technology', true),

-- USA (Space, Energy, Robotics, Defense)
('quantum-propulsion-inc', 'Quantum Propulsion Inc', 'Developing revolutionary electric propulsion systems for deep space missions and lunar infrastructure.', '/images/companies/quantum-prop.png', 'https://quantum-propulsion.example.com', 'usa', 'Seattle', 'space', '100-300', 2018, ARRAY['Moonshot projects', 'Equity heavy', 'NASA contracts', 'Top talent'], ARRAY['C++', 'Python', 'MATLAB', 'Simulink', 'FreeCAD'], 'Enabling humanity''s expansion beyond Earth orbit', true),

('clean-grid-solutions', 'Clean Grid Solutions', 'AI-powered energy management platform for utilities transitioning to 100% renewable grids.', '/images/companies/clean-grid.png', 'https://cleangrid.example.com', 'usa', 'San Francisco', 'energy', '200-400', 2016, ARRAY['VC backed', 'Remote-first', 'Unlimited PTO', 'Learning budget'], ARRAY['Python', 'TensorFlow', 'Kubernetes', 'PostgreSQL', 'React'], 'Orchestrating America''s clean energy transition', true),

('agility-robotics', 'Agility Robotics', 'Building bipedal robots designed to work alongside humans in warehouses and industrial settings.', '/images/companies/agility.png', 'https://agilityrobotics.example.com', 'usa', 'Pittsburgh', 'robotics', '200-500', 2015, ARRAY['Stanford spin-out', 'Venture backed', 'Research culture', 'Diversity focused'], ARRAY['C++', 'ROS2', 'Python', 'PyTorch', 'Gazebo'], 'Creating robots that go where people go', true),

('paladin-defense-systems', 'Paladin Defense Systems', 'Next-generation autonomous systems and AI for defense applications and critical infrastructure protection.', '/images/companies/paladin.png', 'https://paladin-defense.example.com', 'usa', 'Washington D.C.', 'defense', '500-1000', 2012, ARRAY['Clearance required', 'DoD contracts', 'Top compensation', 'Impactful work'], ARRAY['Python', 'C++', 'Go', 'Kubernetes', 'PyTorch'], 'AI-powered defense for the 21st century', true),

('stellar-energy-labs', 'Stellar Energy Labs', 'Developing next-gen nuclear fusion technology for clean, limitless energy production.', '/images/companies/stellar-energy.png', 'https://stellar-energy.example.com', 'usa', 'Boston', 'energy', '100-200', 2019, ARRAY['PhD heavy', 'Breakthrough research', 'High risk/reward', 'World changing'], ARRAY['Python', 'C++', 'COMSOL', 'MATLAB', 'HPC'], 'Bringing star power to Earth', false)

ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    country = EXCLUDED.country,
    industry = EXCLUDED.industry,
    employee_count = EXCLUDED.employee_count,
    culture_tags = EXCLUDED.culture_tags,
    tech_stack = EXCLUDED.tech_stack,
    is_featured = EXCLUDED.is_featured;

-- =====================================================
-- PART 8: SEED TALENT ROLES (Quest 5)
-- =====================================================

INSERT INTO talent_roles (slug, title, description, industry, level, salary_junior_min, salary_junior_max, salary_mid_min, salary_mid_max, salary_senior_min, salary_senior_max, market_demand, growth_rate, required_skills, education_paths) VALUES

-- SPACE ROLES
('satellite-systems-engineer', 'Satellite Systems Engineer', 'Design and integrate satellite subsystems including power, thermal, communications, and attitude control.', 'space', 'mid', 65000, 85000, 90000, 120000, 130000, 170000, 85, 18, ARRAY['Systems Engineering', 'MATLAB', 'Thermal Analysis', 'Power Systems', 'Orbital Mechanics'], ARRAY['Aerospace Engineering BSc', 'Electrical Engineering BSc', 'Physics MSc']),

('mission-operations-engineer', 'Mission Operations Engineer', 'Plan and execute spacecraft operations, monitor telemetry, and respond to anomalies.', 'space', 'mid', 55000, 75000, 80000, 110000, 115000, 150000, 78, 15, ARRAY['Spacecraft Operations', 'Python', 'Linux', 'Anomaly Resolution', 'Communication Protocols'], ARRAY['Aerospace Engineering', 'Computer Science', 'Physics']),

('propulsion-engineer', 'Propulsion Engineer', 'Design, test, and optimize rocket engines and spacecraft propulsion systems.', 'space', 'senior', 70000, 90000, 100000, 135000, 145000, 200000, 72, 12, ARRAY['Propulsion Systems', 'Thermodynamics', 'CFD', 'Test Engineering', 'Materials Science'], ARRAY['Mechanical Engineering MSc', 'Aerospace Engineering MSc', 'Chemical Engineering']),

-- ENERGY ROLES
('wind-turbine-engineer', 'Wind Turbine Engineer', 'Design and optimize wind turbine components including blades, drivetrains, and control systems.', 'energy', 'mid', 55000, 70000, 75000, 100000, 105000, 140000, 88, 25, ARRAY['Mechanical Design', 'ANSYS', 'SCADA', 'Blade Aerodynamics', 'Gearbox Design'], ARRAY['Mechanical Engineering', 'Renewable Energy MSc', 'Electrical Engineering']),

('grid-integration-engineer', 'Grid Integration Engineer', 'Connect renewable energy sources to power grids while maintaining stability and power quality.', 'energy', 'mid', 60000, 78000, 85000, 115000, 120000, 155000, 90, 28, ARRAY['Power Electronics', 'Grid Codes', 'SCADA', 'Python', 'Power Systems Analysis'], ARRAY['Electrical Engineering', 'Power Systems MSc', 'Energy Engineering']),

('battery-systems-engineer', 'Battery Systems Engineer', 'Design and optimize battery storage systems for EVs, grid storage, and renewable integration.', 'energy', 'mid', 65000, 85000, 95000, 125000, 135000, 175000, 95, 35, ARRAY['Battery Chemistry', 'BMS Design', 'Thermal Management', 'Python', 'Testing & Validation'], ARRAY['Chemical Engineering', 'Materials Science', 'Electrical Engineering']),

-- ROBOTICS ROLES
('robotics-software-engineer', 'Robotics Software Engineer', 'Develop software for robot perception, planning, and control using ROS and modern ML frameworks.', 'robotics', 'mid', 70000, 90000, 100000, 135000, 145000, 195000, 92, 30, ARRAY['ROS/ROS2', 'C++', 'Python', 'Computer Vision', 'Motion Planning'], ARRAY['Computer Science', 'Robotics MSc', 'Electrical Engineering']),

('controls-engineer', 'Controls Engineer', 'Design and implement control systems for robots including feedback loops, state estimation, and trajectory tracking.', 'robotics', 'mid', 65000, 85000, 90000, 125000, 130000, 170000, 82, 20, ARRAY['Control Theory', 'MATLAB/Simulink', 'C++', 'Real-time Systems', 'Sensor Fusion'], ARRAY['Electrical Engineering', 'Mechanical Engineering', 'Mechatronics']),

('robot-perception-engineer', 'Robot Perception Engineer', 'Develop computer vision and sensor fusion systems enabling robots to understand their environment.', 'robotics', 'mid', 75000, 95000, 105000, 140000, 150000, 200000, 88, 28, ARRAY['Computer Vision', 'Deep Learning', 'SLAM', 'Python', 'Point Cloud Processing'], ARRAY['Computer Science', 'AI/ML MSc', 'Robotics MSc']),

-- DEFENSE ROLES
('cybersecurity-engineer', 'Cybersecurity Engineer', 'Protect critical systems from cyber threats through security architecture, testing, and incident response.', 'defense', 'mid', 70000, 90000, 100000, 140000, 150000, 200000, 95, 32, ARRAY['Network Security', 'Penetration Testing', 'SIEM', 'Python', 'Cloud Security'], ARRAY['Computer Science', 'Cybersecurity MSc', 'Information Systems']),

('systems-integration-engineer', 'Systems Integration Engineer', 'Integrate complex defense systems ensuring interoperability between hardware, software, and networks.', 'defense', 'mid', 65000, 85000, 95000, 130000, 140000, 185000, 80, 15, ARRAY['Systems Engineering', 'Requirements Management', 'Testing', 'Technical Documentation', 'Model-Based Design'], ARRAY['Systems Engineering', 'Electrical Engineering', 'Computer Engineering']),

('uav-systems-engineer', 'UAV Systems Engineer', 'Design and develop unmanned aerial systems including airframes, avionics, and ground control.', 'defense', 'mid', 70000, 90000, 100000, 135000, 145000, 190000, 85, 22, ARRAY['Aerospace Design', 'Avionics', 'Autopilot Systems', 'GCS Development', 'Flight Testing'], ARRAY['Aerospace Engineering', 'Electrical Engineering', 'Mechatronics'])

ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    salary_junior_min = EXCLUDED.salary_junior_min,
    salary_junior_max = EXCLUDED.salary_junior_max,
    salary_mid_min = EXCLUDED.salary_mid_min,
    salary_mid_max = EXCLUDED.salary_mid_max,
    salary_senior_min = EXCLUDED.salary_senior_min,
    salary_senior_max = EXCLUDED.salary_senior_max,
    market_demand = EXCLUDED.market_demand,
    growth_rate = EXCLUDED.growth_rate;

-- =====================================================
-- PART 9: SEED LEADER INSIGHTS (Quest 6)
-- =====================================================

INSERT INTO leader_insights (name, role, company, industry, quote, soft_skill, image_url, is_featured) VALUES

('Gwynne Shotwell', 'President & COO', 'SpaceX', 'space', 'The best engineers I know are the ones who can explain their work to a 5-year-old. Technical brilliance means nothing if you can not communicate it.', 'communication', '/images/leaders/shotwell.jpg', true),

('Jensen Huang', 'CEO', 'NVIDIA', 'robotics', 'The willingness to be wrong and learn from it is the foundation of innovation. We celebrate the lessons learned from our failures.', 'growth-mindset', '/images/leaders/huang.jpg', true),

('Sundar Pichai', 'CEO', 'Google', 'defense', 'It is not about having all the answers. Great leaders ask great questions and create space for others to contribute.', 'collaboration', '/images/leaders/pichai.jpg', true),

('Mary Barra', 'CEO', 'General Motors', 'energy', 'Taking ownership means not just accepting responsibility when things go wrong, but actively seeking ways to make things better.', 'ownership', '/images/leaders/barra.jpg', true),

('Elon Musk', 'CEO', 'Tesla & SpaceX', 'space', 'People should pursue what they are passionate about. That will make them happier than pretty much anything else.', 'adaptability', '/images/leaders/musk.jpg', true),

('Satya Nadella', 'CEO', 'Microsoft', 'defense', 'Empathy is key. Understanding where the other person is coming from, what they need, that changes everything in how you build products and lead teams.', 'empathy', '/images/leaders/nadella.jpg', true),

('Marc Raibert', 'Founder', 'Boston Dynamics', 'robotics', 'Resilience in engineering means trying 1,000 things that do not work to find the one that does. Each failure brings you closer to success.', 'resilience', '/images/leaders/raibert.jpg', true),

('Kathleen Hogan', 'Chief People Officer', 'Microsoft', 'defense', 'Initiative is not about waiting to be told what to do. It is about seeing what needs to be done and stepping up, even when it is not your job.', 'initiative', '/images/leaders/hogan.jpg', false),

('Dr. Peter Diamandis', 'Founder', 'XPRIZE & Singularity University', 'space', 'The day before something is a breakthrough, it is a crazy idea. Critical thinking helps you distinguish between truly crazy and crazy-brilliant.', 'critical-thinking', '/images/leaders/diamandis.jpg', false),

('Henrik Poulsen', 'Former CEO', 'Ørsted', 'energy', 'Transforming from one of Europe''s most coal-intensive utilities to a global leader in offshore wind required adapting our entire business model.', 'adaptability', '/images/leaders/poulsen.jpg', false),

('Clara Shih', 'CEO', 'Salesforce AI', 'robotics', 'The most successful teams I have built combined technical excellence with genuine care for each other. Empathy is a superpower in tech.', 'empathy', '/images/leaders/shih.jpg', false),

('General James Mattis', 'Former Secretary of Defense', 'US Department of Defense', 'defense', 'The most important six inches on the battlefield is between your ears. Critical thinking under pressure separates good from great.', 'critical-thinking', '/images/leaders/mattis.jpg', false)

ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 10: SEED SOFT SKILLS (Quest 6)
-- =====================================================

INSERT INTO soft_skills (slug, name, description, icon, order_index) VALUES
('growth-mindset', 'Growth Mindset', 'Belief that abilities can be developed through dedication and hard work.', 'TrendingUp', 1),
('ownership', 'Ownership', 'Taking full responsibility for outcomes and proactively solving problems.', 'Shield', 2),
('collaboration', 'Collaboration', 'Working effectively with others toward shared goals.', 'Users', 3),
('communication', 'Communication', 'Clearly expressing ideas and actively listening to others.', 'MessageSquare', 4),
('adaptability', 'Adaptability', 'Adjusting approach when circumstances change.', 'RefreshCw', 5),
('resilience', 'Resilience', 'Persisting through setbacks and bouncing back from failure.', 'Heart', 6),
('initiative', 'Initiative', 'Taking action without being asked and seeking opportunities to contribute.', 'Zap', 7),
('critical-thinking', 'Critical Thinking', 'Analyzing information objectively to make reasoned judgments.', 'Brain', 8)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    order_index = EXCLUDED.order_index;

-- =====================================================
-- PART 11: SEED HACKATHONS (Quest 8)
-- =====================================================

INSERT INTO hackathons (slug, name, description, theme, sponsor_company_id, prize_pool, prizes, required_skills, start_date, end_date, registration_deadline, location, is_remote, max_team_size, difficulty, status, xp_reward) VALUES

('satellite-optimization-2026', 'Satellite Power Optimization Challenge',
'Design AI algorithms to optimize power management for LEO satellite constellations during eclipse periods.',
'AI & Space Systems',
(SELECT id FROM forge_companies WHERE slug = 'novasat-technologies'),
'€15,000',
'[{"place": "1st", "amount": "€8,000", "perks": "Internship opportunity"}, {"place": "2nd", "amount": "€5,000"}, {"place": "3rd", "amount": "€2,000"}]',
ARRAY['Python', 'Machine Learning', 'Orbital Mechanics', 'Power Systems'],
'2026-04-15', '2026-04-17', '2026-04-01',
'Warsaw, Poland + Online', true, 4, 'intermediate', 'upcoming', 200),

('green-grid-iot-hack', 'Green Grid IoT Hackathon',
'Build IoT solutions that enable households to participate in smart grid demand response programs.',
'IoT & Clean Energy',
(SELECT id FROM forge_companies WHERE slug = 'energiewende-tech'),
'€12,000',
'[{"place": "1st", "amount": "€6,000", "perks": "Fast-track interview"}, {"place": "2nd", "amount": "€4,000"}, {"place": "3rd", "amount": "€2,000"}]',
ARRAY['IoT', 'Python', 'React', 'MQTT', 'Energy Systems'],
'2026-03-22', '2026-03-24', '2026-03-10',
'Berlin, Germany', false, 5, 'beginner', 'upcoming', 150),

('autonomous-nav-sprint', 'Autonomous Navigation Sprint',
'Develop perception and path planning algorithms for warehouse robots in dynamic environments.',
'Robotics & AI',
(SELECT id FROM forge_companies WHERE slug = 'agility-robotics'),
'$25,000',
'[{"place": "1st", "amount": "$15,000", "perks": "Interview + Boston trip"}, {"place": "2nd", "amount": "$7,000"}, {"place": "3rd", "amount": "$3,000"}]',
ARRAY['ROS2', 'Python', 'Computer Vision', 'SLAM', 'Motion Planning'],
'2026-05-10', '2026-05-12', '2026-04-25',
'Online Only', true, 4, 'advanced', 'upcoming', 250),

('cyber-defense-ctf', 'European Cyber Defense CTF',
'Capture-the-flag competition focusing on defending critical infrastructure from simulated nation-state attacks.',
'Cybersecurity',
(SELECT id FROM forge_companies WHERE slug = 'cybershield-polska'),
'€10,000',
'[{"place": "1st", "amount": "€5,000", "perks": "Security clearance sponsorship"}, {"place": "2nd", "amount": "€3,000"}, {"place": "3rd", "amount": "€2,000"}]',
ARRAY['Network Security', 'Linux', 'Python', 'Reverse Engineering', 'Forensics'],
'2026-06-05', '2026-06-07', '2026-05-20',
'Kraków, Poland + Online', true, 3, 'advanced', 'upcoming', 200),

('fusion-simulation-challenge', 'Fusion Reactor Simulation Challenge',
'Create physics simulations of plasma behavior in tokamak fusion reactors using open-source tools.',
'Nuclear Fusion',
(SELECT id FROM forge_companies WHERE slug = 'stellar-energy-labs'),
'$20,000',
'[{"place": "1st", "amount": "$12,000", "perks": "Lab visit + mentorship"}, {"place": "2nd", "amount": "$5,000"}, {"place": "3rd", "amount": "$3,000"}]',
ARRAY['Python', 'Physics Simulation', 'Plasma Physics', 'HPC', 'Data Visualization'],
'2026-07-20', '2026-07-22', '2026-07-01',
'Boston, MA + Online', true, 4, 'advanced', 'upcoming', 250),

('drone-swarm-challenge', 'Drone Swarm Coordination Challenge',
'Program coordinated behavior for drone swarms performing search and rescue operations.',
'UAV & AI',
(SELECT id FROM forge_companies WHERE slug = 'autonomy-robotics-ua'),
'€8,000',
'[{"place": "1st", "amount": "€4,000", "perks": "Paid project opportunity"}, {"place": "2nd", "amount": "€2,500"}, {"place": "3rd", "amount": "€1,500"}]',
ARRAY['Python', 'Multi-Agent Systems', 'ROS', 'Path Planning', 'Simulation'],
'2026-04-01', '2026-04-03', '2026-03-15',
'Online Only', true, 3, 'intermediate', 'upcoming', 175)

ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    prize_pool = EXCLUDED.prize_pool,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    status = EXCLUDED.status;

-- =====================================================
-- PART 12: SEED DISCORD GUILDS (Quest 8)
-- =====================================================

INSERT INTO discord_guilds (slug, name, description, industry, invite_url, member_count, icon_url, is_official, channels) VALUES

('forge-z-space-explorers', 'FORGE-Z Space Explorers', 'Community for aspiring aerospace engineers, rocket scientists, and space enthusiasts. Share projects, find mentors, and join study groups.', 'space', '#coming-soon', 2500, '/images/discord/space.png', true, ARRAY['#introductions', '#satellite-projects', '#rocket-science', '#career-advice', '#study-groups', '#job-postings']),

('forge-z-energy-pioneers', 'FORGE-Z Energy Pioneers', 'Connect with renewable energy enthusiasts, grid engineers, and sustainability advocates. Discuss solar, wind, batteries, and nuclear fusion.', 'energy', '#coming-soon', 1800, '/images/discord/energy.png', true, ARRAY['#introductions', '#solar-projects', '#wind-energy', '#battery-tech', '#grid-systems', '#career-paths']),

('forge-z-robotics-builders', 'FORGE-Z Robotics Builders', 'Home for robotics hobbyists and professionals. Share your builds, troubleshoot ROS issues, and collaborate on open-source projects.', 'robotics', '#coming-soon', 3200, '/images/discord/robotics.png', true, ARRAY['#introductions', '#show-your-robot', '#ros-help', '#computer-vision', '#competitions', '#job-board']),

('forge-z-defense-tech', 'FORGE-Z Defense Tech', 'Community for those interested in defense technology, cybersecurity, and national security careers. Security-cleared members welcome.', 'defense', '#coming-soon', 1200, '/images/discord/defense.png', true, ARRAY['#introductions', '#cyber-security', '#aerospace-defense', '#career-guidance', '#security-clearance', '#news']),

('forge-z-general', 'FORGE-Z Community Hub', 'The main gathering place for all FORGE-Z members. Cross-industry networking, general tech discussions, and community events.', 'general', '#coming-soon', 5000, '/images/discord/general.png', true, ARRAY['#welcome', '#general', '#events', '#hackathons', '#portfolio-showcase', '#mentorship'])

ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    member_count = EXCLUDED.member_count,
    channels = EXCLUDED.channels;

-- =====================================================
-- PART 13: UPDATE LEARNING RESOURCES WITH MORE DATA
-- =====================================================

-- Add more learning resources with real course URLs
INSERT INTO learning_resources (title, provider, description, url, duration, level, industry, rating, enrollments, featured) VALUES

-- Space Industry Courses
('Space Mission Engineering', 'MIT OpenCourseWare', 'Comprehensive introduction to space systems engineering covering mission design, spacecraft systems, and launch operations.', 'https://ocw.mit.edu/courses/16-851-satellite-engineering-fall-2003/', '12 weeks', 'Advanced', 'space', 4.8, '50K+', true),
('Introduction to Aerospace Engineering', 'edX (Delft)', 'Learn the fundamentals of aircraft and spacecraft design including aerodynamics, structures, and propulsion.', 'https://www.edx.org/learn/aerospace-engineering', '10 weeks', 'Beginner', 'space', 4.7, '100K+', true),
('Satellite Communications', 'Coursera (CU Boulder)', 'Master the principles of satellite communication systems including link budgets, modulation, and orbital mechanics.', 'https://www.coursera.org/learn/satellite-communications', '4 weeks', 'Intermediate', 'space', 4.6, '35K+', false),

-- Energy Industry Courses
('Solar Energy Engineering', 'edX (TU Delft)', 'Learn how to design and deploy solar photovoltaic systems for residential and utility-scale applications.', 'https://www.edx.org/learn/solar-energy', '8 weeks', 'Intermediate', 'energy', 4.7, '80K+', true),
('Wind Energy', 'Coursera (DTU)', 'Comprehensive introduction to wind energy including turbine design, wind resource assessment, and farm layout.', 'https://www.coursera.org/learn/wind-energy', '5 weeks', 'Beginner', 'energy', 4.8, '60K+', true),
('Energy Storage Systems', 'edX', 'Explore battery technologies, grid storage solutions, and the integration of storage with renewable energy.', 'https://www.edx.org/learn/energy-storage', '6 weeks', 'Intermediate', 'energy', 4.5, '25K+', false),
('Smart Grid Technology', 'Udemy', 'Learn about modern power grids including SCADA systems, demand response, and renewable integration.', 'https://www.udemy.com/topic/smart-grid/', '20 hours', 'Beginner', 'energy', 4.4, '15K+', false),

-- Robotics Industry Courses
('Modern Robotics: Mechanics, Planning, and Control', 'Coursera (Northwestern)', 'The most comprehensive robotics course covering kinematics, dynamics, motion planning, and control.', 'https://www.coursera.org/specializations/modernrobotics', '6 months', 'Advanced', 'robotics', 4.9, '150K+', true),
('ROS2 for Beginners', 'Udemy', 'Learn the Robot Operating System 2 from scratch including nodes, topics, services, and navigation.', 'https://www.udemy.com/course/ros2-for-beginners/', '15 hours', 'Beginner', 'robotics', 4.6, '40K+', true),
('Computer Vision with OpenCV and Deep Learning', 'Udemy', 'Master computer vision techniques including object detection, image segmentation, and neural networks.', 'https://www.udemy.com/topic/opencv/', '30 hours', 'Intermediate', 'robotics', 4.7, '80K+', false),
('Motion Planning for Self-Driving Cars', 'Coursera (Toronto)', 'Learn path planning, trajectory optimization, and decision making for autonomous vehicles.', 'https://www.coursera.org/learn/motion-planning-self-driving-cars', '4 weeks', 'Advanced', 'robotics', 4.8, '50K+', false),

-- Defense/Cybersecurity Courses
('Cybersecurity Specialization', 'Coursera (Maryland)', 'Comprehensive cybersecurity training covering network security, cryptography, and incident response.', 'https://www.coursera.org/specializations/cyber-security', '8 months', 'Beginner', 'software', 4.7, '200K+', true),
('Ethical Hacking', 'Udemy', 'Learn penetration testing, vulnerability assessment, and security auditing techniques.', 'https://www.udemy.com/topic/ethical-hacking/', '25 hours', 'Intermediate', 'software', 4.6, '300K+', true),
('Cloud Security', 'Coursera (Google)', 'Master security best practices for cloud infrastructure on AWS, GCP, and Azure.', 'https://www.coursera.org/professional-certificates/google-cloud-security', '6 months', 'Intermediate', 'software', 4.5, '75K+', false),

-- General Technical Skills
('Python for Data Science and Machine Learning', 'Udemy', 'Complete Python bootcamp covering pandas, scikit-learn, TensorFlow, and real-world projects.', 'https://www.udemy.com/topic/python/', '40 hours', 'Beginner', 'software', 4.8, '500K+', true),
('C++ for Embedded Systems', 'Udemy', 'Learn C++ programming specifically for robotics, IoT, and real-time embedded applications.', 'https://www.udemy.com/topic/c-plus-plus/', '20 hours', 'Intermediate', 'software', 4.5, '50K+', false),
('MATLAB for Engineers', 'Coursera (Vanderbilt)', 'Master MATLAB programming for engineering applications including simulation and data analysis.', 'https://www.coursera.org/learn/matlab', '4 weeks', 'Beginner', 'software', 4.7, '100K+', false)

ON CONFLICT DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
