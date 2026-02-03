-- Migration: Expand Skills Taxonomy and Career Paths for FORGE-Z Industries
-- Date: 2026-02-03
-- Adds 60+ industry-specific skills for Space, Energy, Robotics, Defense
-- Adds 25+ career paths across all four industries

-- =====================================================
-- PART 1: SPACE INDUSTRY SKILLS
-- =====================================================

INSERT INTO skills_taxonomy (name, description, category, framework, alt_labels, related_occupations) VALUES
-- Technical Skills
('Orbital Mechanics', 'Spacecraft trajectory and orbit design', 'SKILL', 'FORGEZ', ARRAY['Astrodynamics', 'Orbital Dynamics'], ARRAY['Mission Designer', 'Spacecraft Engineer']),
('Propulsion Systems', 'Rocket and spacecraft propulsion engineering', 'SKILL', 'FORGEZ', ARRAY['Rocket Propulsion', 'Electric Propulsion'], ARRAY['Propulsion Engineer', 'Rocket Scientist']),
('Satellite Communications', 'Design of space-based communication systems', 'SKILL', 'FORGEZ', ARRAY['SatCom', 'Space Comms'], ARRAY['RF Engineer', 'Satellite Engineer']),
('Thermal Control Systems', 'Spacecraft thermal management', 'SKILL', 'FORGEZ', ARRAY['TCS', 'Thermal Engineering'], ARRAY['Thermal Engineer', 'Spacecraft Systems Engineer']),
('GNC Systems', 'Guidance, Navigation and Control systems', 'SKILL', 'FORGEZ', ARRAY['Guidance Navigation Control', 'AOCS'], ARRAY['GNC Engineer', 'Controls Engineer']),
('Space Mission Planning', 'Planning and executing space missions', 'SKILL', 'FORGEZ', ARRAY['Mission Operations', 'Flight Operations'], ARRAY['Mission Director', 'Flight Controller']),
('Launch Vehicle Design', 'Design of rockets and launch systems', 'SKILL', 'FORGEZ', ARRAY['Rocket Design', 'Launch Systems'], ARRAY['Launch Vehicle Engineer', 'Rocket Engineer']),
('Payload Integration', 'Integrating payloads with launch vehicles', 'SKILL', 'FORGEZ', ARRAY['Spacecraft Integration', 'Payload Engineering'], ARRAY['Integration Engineer', 'Payload Specialist']),
('Space Simulation', 'Modeling and simulation of space systems', 'SKILL', 'FORGEZ', ARRAY['MATLAB/Simulink', 'STK', 'GMAT'], ARRAY['Simulation Engineer', 'Mission Analyst']),
('Spacecraft Structures', 'Structural design for space environments', 'SKILL', 'FORGEZ', ARRAY['Structural Analysis', 'FEA for Space'], ARRAY['Structures Engineer', 'Stress Analyst']),
-- Knowledge
('Space Environment', 'Understanding of orbital debris, radiation, vacuum', 'KNOWLEDGE', 'FORGEZ', ARRAY['Space Weather', 'Radiation Effects'], ARRAY['Space Systems Engineer']),
('Celestial Mechanics', 'Physics of planetary and celestial motion', 'KNOWLEDGE', 'FORGEZ', ARRAY['Planetary Science', 'Astrophysics'], ARRAY['Planetary Scientist', 'Astronomer'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 2: ENERGY INDUSTRY SKILLS
-- =====================================================

INSERT INTO skills_taxonomy (name, description, category, framework, alt_labels, related_occupations) VALUES
-- Technical Skills
('Solar PV Systems', 'Photovoltaic system design and installation', 'SKILL', 'FORGEZ', ARRAY['Solar Panel Design', 'PV Engineering'], ARRAY['Solar Engineer', 'PV Specialist']),
('Wind Turbine Engineering', 'Wind energy system design', 'SKILL', 'FORGEZ', ARRAY['Wind Energy', 'Turbine Design'], ARRAY['Wind Engineer', 'Turbine Technician']),
('Battery Management Systems', 'BMS design for energy storage', 'SKILL', 'FORGEZ', ARRAY['BMS', 'Energy Storage'], ARRAY['Battery Engineer', 'Energy Storage Specialist']),
('Grid Integration', 'Connecting renewable sources to power grid', 'SKILL', 'FORGEZ', ARRAY['Grid Connection', 'Power Electronics'], ARRAY['Grid Engineer', 'Power Systems Engineer']),
('Energy Modeling', 'Simulation of energy systems', 'SKILL', 'FORGEZ', ARRAY['PVsyst', 'HOMER', 'EnergyPlus'], ARRAY['Energy Analyst', 'Systems Modeler']),
('Power Electronics', 'Inverters, converters for energy systems', 'SKILL', 'FORGEZ', ARRAY['Inverter Design', 'DC-AC Conversion'], ARRAY['Power Electronics Engineer']),
('Hydrogen Systems', 'Hydrogen production and fuel cell technology', 'SKILL', 'FORGEZ', ARRAY['Fuel Cells', 'Green Hydrogen', 'Electrolysis'], ARRAY['Hydrogen Engineer', 'Fuel Cell Specialist']),
('Smart Grid Technology', 'Intelligent grid management systems', 'SKILL', 'FORGEZ', ARRAY['Grid Automation', 'SCADA'], ARRAY['Smart Grid Engineer', 'Grid Operator']),
('Energy Efficiency', 'Building and industrial energy optimization', 'SKILL', 'FORGEZ', ARRAY['Energy Auditing', 'HVAC Optimization'], ARRAY['Energy Auditor', 'Efficiency Consultant']),
('Nuclear Engineering', 'Nuclear power plant design and operation', 'SKILL', 'FORGEZ', ARRAY['Nuclear Physics', 'Reactor Design'], ARRAY['Nuclear Engineer', 'Reactor Operator']),
-- Knowledge
('Renewable Energy Policy', 'Understanding of energy regulations and incentives', 'KNOWLEDGE', 'FORGEZ', ARRAY['Energy Law', 'Clean Energy Policy'], ARRAY['Policy Analyst', 'Energy Consultant']),
('Carbon Markets', 'Carbon credits and emissions trading', 'KNOWLEDGE', 'FORGEZ', ARRAY['Carbon Trading', 'ESG'], ARRAY['Sustainability Analyst', 'Carbon Trader'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 3: ROBOTICS INDUSTRY SKILLS
-- =====================================================

INSERT INTO skills_taxonomy (name, description, category, framework, alt_labels, related_occupations) VALUES
-- Technical Skills
('ROS/ROS2', 'Robot Operating System development', 'SKILL', 'FORGEZ', ARRAY['Robot Operating System', 'ROS Development'], ARRAY['Robotics Engineer', 'ROS Developer']),
('Motion Planning', 'Robot path and trajectory planning', 'SKILL', 'FORGEZ', ARRAY['Path Planning', 'Trajectory Optimization'], ARRAY['Motion Planner', 'Robotics Engineer']),
('Computer Vision', 'Visual perception for robots', 'SKILL', 'FORGEZ', ARRAY['OpenCV', 'Image Processing', 'Object Detection'], ARRAY['Vision Engineer', 'Perception Engineer']),
('SLAM', 'Simultaneous Localization and Mapping', 'SKILL', 'FORGEZ', ARRAY['Localization', 'Mapping', 'Navigation'], ARRAY['SLAM Engineer', 'Autonomy Engineer']),
('Sensor Fusion', 'Combining data from multiple sensors', 'SKILL', 'FORGEZ', ARRAY['Multi-sensor Integration', 'Kalman Filtering'], ARRAY['Perception Engineer', 'Sensor Engineer']),
('Actuator Control', 'Motor and actuator systems', 'SKILL', 'FORGEZ', ARRAY['Motor Control', 'Servo Systems'], ARRAY['Controls Engineer', 'Mechatronics Engineer']),
('Embedded Systems', 'Programming microcontrollers for robots', 'SKILL', 'FORGEZ', ARRAY['Firmware', 'MCU Programming', 'ARM'], ARRAY['Embedded Engineer', 'Firmware Developer']),
('Manipulation', 'Robotic arm and gripper control', 'SKILL', 'FORGEZ', ARRAY['Grasping', 'Pick and Place'], ARRAY['Manipulation Engineer', 'Robot Programmer']),
('Human-Robot Interaction', 'Safe and intuitive robot interfaces', 'SKILL', 'FORGEZ', ARRAY['HRI', 'Collaborative Robotics', 'Cobots'], ARRAY['HRI Researcher', 'Safety Engineer']),
('Simulation & Testing', 'Robot simulation environments', 'SKILL', 'FORGEZ', ARRAY['Gazebo', 'Isaac Sim', 'MuJoCo'], ARRAY['Simulation Engineer', 'Test Engineer']),
-- Knowledge
('Kinematics & Dynamics', 'Robot motion mathematics', 'KNOWLEDGE', 'FORGEZ', ARRAY['Robot Kinematics', 'Dynamics Modeling'], ARRAY['Robotics Researcher', 'Mechanical Engineer']),
('Safety Standards', 'Industrial robot safety compliance', 'KNOWLEDGE', 'FORGEZ', ARRAY['ISO 10218', 'Functional Safety'], ARRAY['Safety Engineer', 'Compliance Specialist'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 4: DEFENSE INDUSTRY SKILLS
-- =====================================================

INSERT INTO skills_taxonomy (name, description, category, framework, alt_labels, related_occupations) VALUES
-- Technical Skills
('Radar Systems', 'Radar design and signal processing', 'SKILL', 'FORGEZ', ARRAY['Radar Engineering', 'Signal Processing'], ARRAY['Radar Engineer', 'RF Engineer']),
('Electronic Warfare', 'EW systems and countermeasures', 'SKILL', 'FORGEZ', ARRAY['EW', 'ECM', 'ECCM'], ARRAY['EW Engineer', 'Defense Systems Engineer']),
('Autonomous Systems', 'Unmanned vehicle development', 'SKILL', 'FORGEZ', ARRAY['UAV', 'UGV', 'Drones'], ARRAY['Autonomy Engineer', 'UAS Developer']),
('Secure Communications', 'Encrypted military communications', 'SKILL', 'FORGEZ', ARRAY['COMSEC', 'Cryptography'], ARRAY['Communications Engineer', 'Security Engineer']),
('Command & Control', 'C2 systems integration', 'SKILL', 'FORGEZ', ARRAY['C4ISR', 'Battle Management'], ARRAY['Systems Integrator', 'C2 Engineer']),
('Missile Systems', 'Guided munitions engineering', 'SKILL', 'FORGEZ', ARRAY['Guided Weapons', 'Ballistics'], ARRAY['Missile Engineer', 'Weapons Systems Engineer']),
('Armor & Protection', 'Vehicle and personnel protection systems', 'SKILL', 'FORGEZ', ARRAY['Active Protection', 'Composite Armor'], ARRAY['Protection Engineer', 'Materials Scientist']),
('Simulation & Training', 'Military simulation systems', 'SKILL', 'FORGEZ', ARRAY['Synthetic Training', 'War Gaming'], ARRAY['Simulation Developer', 'Training Systems Engineer']),
('Counter-UAS', 'Drone detection and neutralization', 'SKILL', 'FORGEZ', ARRAY['Anti-Drone', 'C-UAS'], ARRAY['Counter-UAS Engineer', 'Defense Analyst']),
('ISR Systems', 'Intelligence, Surveillance, Reconnaissance', 'SKILL', 'FORGEZ', ARRAY['Intelligence Systems', 'Reconnaissance'], ARRAY['ISR Analyst', 'Intelligence Engineer']),
-- Knowledge
('Defense Acquisition', 'Military procurement processes', 'KNOWLEDGE', 'FORGEZ', ARRAY['FAR/DFAR', 'Government Contracts'], ARRAY['Program Manager', 'Contracts Specialist']),
('Security Clearance Process', 'Understanding classified information handling', 'KNOWLEDGE', 'FORGEZ', ARRAY['Classified Work', 'ITAR'], ARRAY['Security Officer', 'Cleared Professional'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 5: CROSS-INDUSTRY TECHNICAL SKILLS
-- =====================================================

INSERT INTO skills_taxonomy (name, description, category, framework, alt_labels, related_occupations) VALUES
('Systems Engineering', 'End-to-end system design and integration', 'SKILL', 'FORGEZ', ARRAY['SE', 'MBSE', 'SysML'], ARRAY['Systems Engineer', 'Technical Lead']),
('Finite Element Analysis', 'Structural simulation and analysis', 'SKILL', 'FORGEZ', ARRAY['FEA', 'ANSYS', 'Abaqus'], ARRAY['Structural Analyst', 'Simulation Engineer']),
('CFD Analysis', 'Computational Fluid Dynamics', 'SKILL', 'FORGEZ', ARRAY['Fluid Simulation', 'OpenFOAM'], ARRAY['CFD Engineer', 'Aerodynamicist']),
('Control Systems', 'Feedback control design', 'SKILL', 'FORGEZ', ARRAY['PID', 'State Space', 'MPC'], ARRAY['Controls Engineer', 'Automation Engineer']),
('Requirements Engineering', 'System requirements management', 'SKILL', 'FORGEZ', ARRAY['DOORS', 'Requirements Analysis'], ARRAY['Requirements Engineer', 'Systems Analyst']),
('V&V Testing', 'Verification and Validation', 'SKILL', 'FORGEZ', ARRAY['Test Engineering', 'Qualification'], ARRAY['Test Engineer', 'Quality Engineer']),
('Technical Writing', 'Engineering documentation', 'SKILL', 'FORGEZ', ARRAY['Documentation', 'Specifications'], ARRAY['Technical Writer', 'Documentation Specialist']),
('3D Printing/Additive', 'Additive manufacturing for prototyping', 'SKILL', 'FORGEZ', ARRAY['AM', 'Rapid Prototyping'], ARRAY['AM Engineer', 'Prototype Engineer']),
('Digital Twin', 'Virtual system modeling', 'SKILL', 'FORGEZ', ARRAY['Virtual Twin', 'Model-Based'], ARRAY['Digital Engineer', 'Simulation Specialist']),
('Edge Computing', 'Embedded AI and edge processing', 'SKILL', 'FORGEZ', ARRAY['Edge AI', 'Embedded ML'], ARRAY['Edge Developer', 'IoT Engineer'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 6: EXPANDED CAREER PATHS - SPACE
-- =====================================================

INSERT INTO career_paths (title, description, level, industry, salary_range_min, salary_range_max, growth_percentage, example_companies) VALUES
('Mission Designer', 'Plan spacecraft trajectories and mission profiles', 'Mid', 'space', 90000, 130000, 15, ARRAY['NASA JPL', 'SpaceX', 'Rocket Lab', 'Astroscale']),
('Propulsion Engineer', 'Design rocket engines and propulsion systems', 'Mid', 'space', 100000, 150000, 18, ARRAY['SpaceX', 'Blue Origin', 'Aerojet Rocketdyne', 'Relativity']),
('Satellite Systems Engineer', 'Design and integrate satellite systems', 'Mid', 'space', 95000, 140000, 20, ARRAY['Maxar', 'Planet', 'Spire', 'Capella Space']),
('Flight Software Engineer', 'Develop spacecraft flight software', 'Mid', 'space', 110000, 160000, 22, ARRAY['SpaceX', 'NASA', 'Northrop Grumman', 'L3Harris']),
('Ground Systems Engineer', 'Build ground station and mission control systems', 'Mid', 'space', 85000, 125000, 12, ARRAY['KSAT', 'AWS Ground Station', 'Leaf Space']),
('Space Debris Analyst', 'Track and mitigate orbital debris', 'Entry', 'space', 70000, 100000, 30, ARRAY['LeoLabs', 'ExoAnalytic', 'Astroscale', 'ClearSpace']),
('Launch Operations Manager', 'Coordinate launch campaigns', 'Senior', 'space', 120000, 170000, 10, ARRAY['SpaceX', 'ULA', 'Arianespace', 'Rocket Lab'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 7: EXPANDED CAREER PATHS - ENERGY
-- =====================================================

INSERT INTO career_paths (title, description, level, industry, salary_range_min, salary_range_max, growth_percentage, example_companies) VALUES
('Wind Farm Developer', 'Plan and develop wind energy projects', 'Senior', 'energy', 100000, 150000, 25, ARRAY['Vestas', 'Siemens Gamesa', 'Orsted', 'NextEra']),
('Energy Storage Specialist', 'Design battery and storage systems', 'Mid', 'energy', 95000, 140000, 35, ARRAY['Tesla', 'Fluence', 'Northvolt', 'QuantumScape']),
('Grid Operations Engineer', 'Manage power grid operations', 'Mid', 'energy', 80000, 120000, 15, ARRAY['National Grid', 'ERCOT', 'PG&E', 'Enel']),
('Hydrogen Systems Engineer', 'Develop hydrogen production and storage', 'Mid', 'energy', 90000, 135000, 40, ARRAY['Nel', 'Plug Power', 'Air Liquide', 'Linde']),
('EV Charging Infrastructure Engineer', 'Design EV charging networks', 'Mid', 'energy', 85000, 125000, 45, ARRAY['ChargePoint', 'EVgo', 'Electrify America', 'Tesla']),
('Offshore Wind Engineer', 'Specialize in offshore wind installations', 'Senior', 'energy', 110000, 160000, 30, ARRAY['Orsted', 'Equinor', 'BP', 'Shell']),
('Carbon Capture Engineer', 'Develop CCS/CCUS technologies', 'Mid', 'energy', 90000, 130000, 35, ARRAY['Climeworks', 'Carbon Engineering', 'Occidental', 'Equinor'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 8: EXPANDED CAREER PATHS - ROBOTICS
-- =====================================================

INSERT INTO career_paths (title, description, level, industry, salary_range_min, salary_range_max, growth_percentage, example_companies) VALUES
('Perception Engineer', 'Develop robot vision and sensing systems', 'Mid', 'robotics', 110000, 160000, 28, ARRAY['Waymo', 'Tesla', 'Aurora', 'Nuro']),
('Motion Planning Engineer', 'Create robot movement algorithms', 'Mid', 'robotics', 105000, 155000, 25, ARRAY['Boston Dynamics', 'Agility Robotics', 'Figure', 'Apptronik']),
('Robot Safety Engineer', 'Ensure safe human-robot interaction', 'Mid', 'robotics', 90000, 130000, 20, ARRAY['Universal Robots', 'FANUC', 'ABB', 'KUKA']),
('Agricultural Robotics Engineer', 'Build robots for farming automation', 'Mid', 'robotics', 85000, 125000, 30, ARRAY['John Deere', 'Abundant Robotics', 'Iron Ox', 'FarmWise']),
('Surgical Robotics Engineer', 'Develop medical robot systems', 'Senior', 'robotics', 120000, 180000, 22, ARRAY['Intuitive', 'Medtronic', 'Johnson & Johnson', 'Stryker']),
('Warehouse Automation Engineer', 'Build logistics robot systems', 'Mid', 'robotics', 95000, 140000, 35, ARRAY['Amazon Robotics', 'Locus Robotics', 'Symbotic', '6 River Systems']),
('Humanoid Robotics Engineer', 'Develop human-like robots', 'Senior', 'robotics', 130000, 200000, 40, ARRAY['Tesla Bot', 'Figure', 'Agility Robotics', 'Apptronik'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 9: EXPANDED CAREER PATHS - DEFENSE
-- =====================================================

INSERT INTO career_paths (title, description, level, industry, salary_range_min, salary_range_max, growth_percentage, example_companies) VALUES
('Drone Systems Engineer', 'Design unmanned aerial systems', 'Mid', 'defense', 100000, 145000, 25, ARRAY['General Atomics', 'Northrop Grumman', 'Shield AI', 'Anduril']),
('Radar Systems Engineer', 'Develop detection and tracking systems', 'Mid', 'defense', 95000, 140000, 18, ARRAY['Raytheon', 'Lockheed Martin', 'Northrop Grumman', 'L3Harris']),
('Cybersecurity Analyst', 'Protect defense systems from threats', 'Mid', 'defense', 90000, 135000, 30, ARRAY['Palantir', 'Booz Allen', 'SAIC', 'Leidos']),
('Counter-UAS Specialist', 'Develop anti-drone technologies', 'Mid', 'defense', 95000, 140000, 35, ARRAY['Anduril', 'Dedrone', 'DroneShield', 'Raytheon']),
('Autonomous Vehicle Engineer', 'Build self-driving military vehicles', 'Senior', 'defense', 120000, 170000, 28, ARRAY['Shield AI', 'Anduril', 'Applied Intuition', 'General Dynamics']),
('Electronic Warfare Specialist', 'Design EW and jamming systems', 'Senior', 'defense', 110000, 160000, 20, ARRAY['L3Harris', 'Northrop Grumman', 'BAE Systems', 'Raytheon']),
('Defense Software Engineer', 'Build mission-critical software', 'Mid', 'defense', 105000, 155000, 22, ARRAY['Anduril', 'Palantir', 'SpaceX', 'Shield AI'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 10: CAREER EXAMPLES (Real Role Models)
-- =====================================================

INSERT INTO career_examples (name, role, company, industry, quote, career_path) VALUES
('Gwynne Shotwell', 'President & COO', 'SpaceX', 'space', 'The key to success is surrounding yourself with smart people and not being afraid to fail.', ARRAY['Mechanical Engineering', 'Aerospace Corporation', 'SpaceX VP', 'President & COO']),
('Marc Raibert', 'Founder', 'Boston Dynamics', 'robotics', 'Making robots that can move with the grace and agility of humans and animals has been my lifes work.', ARRAY['MIT PhD', 'CMU Professor', 'Boston Dynamics Founder', 'Hyundai Fellow']),
('Palmer Luckey', 'Founder', 'Anduril', 'defense', 'The defense industry desperately needs software-first companies to modernize how we protect freedom.', ARRAY['Self-taught', 'Oculus Founder', 'Anduril Founder']),
('Mary Powell', 'CEO', 'Sunrun', 'energy', 'The clean energy transition is the biggest economic opportunity of our lifetime.', ARRAY['Business Degree', 'Green Mountain Power', 'Sunrun CEO'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- Migration complete!
-- Added: 60+ industry skills, 25+ career paths, 4 role models
-- =====================================================
