// Database types for Supabase
// These match the schema.sql tables

// ============================================================================
// ENUM TYPES (Platform)
// ============================================================================

export type NarrativeWorld = 'COSMOS' | 'FORGE' | 'NEXUS' | 'TERRA' | 'QUANTUM';
export type ProjectType = 'CODE' | 'DOCUMENT' | 'VIDEO' | 'AUDIO' | 'DESIGN' | 'MODEL_3D' | 'PRESENTATION' | 'CERTIFICATION' | 'OTHER';
export type UploadStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type SkillVerificationLevel = 'SELF_ASSESSED' | 'PEER_ENDORSED' | 'PROJECT_VERIFIED' | 'AI_ANALYZED' | 'ASSESSMENT_PASSED' | 'CERTIFICATION_VERIFIED';
export type SkillFramework = 'ESCO' | 'SFIA' | 'ONET' | 'FORGEZ' | 'CUSTOM';
export type SkillCategory = 'KNOWLEDGE' | 'SKILL' | 'COMPETENCE' | 'TRANSVERSAL' | 'LANGUAGE';
export type FeedbackStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'DECLINED';
export type FeedbackType = 'VOICE' | 'TEXT' | 'VIDEO';
export type TeamRole = 'LEADER' | 'MEMBER' | 'ADVISOR' | 'PENDING';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE' | 'APPRENTICESHIP';
export type JobStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'FILLED';
export type CompanySize = 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';

// ============================================================================
// CORE INTERFACES
// ============================================================================

export interface User {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
  timezone: string;
  dark_mode: boolean;
  reminder_time: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  // Personal information fields
  first_name: string | null;
  last_name: string | null;
  birthday: string | null;
  phone_number: string | null;
  phone_country_code: string | null;
  // Consent tracking fields
  privacy_policy_agreed_at: string | null;
  tos_agreed_at: string | null;
  marketing_agreed_at: string | null;
  // Platform fields
  headline: string | null;
  bio: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  active_world_id: string | null;
  current_role: string | null;
  current_company: string | null;
  years_experience: number | null;
  is_open_to_work: boolean;
  job_search_status: string | null;
  profile_visibility: string;
  show_skills_publicly: boolean;
  show_projects_publicly: boolean;
  is_employer: boolean;
  employer_company_id: string | null;
}

// ============================================================================
// NARRATIVE WORLDS SYSTEM
// ============================================================================

export interface NarrativeWorldRecord {
  id: string;
  slug: string;
  name: string;
  description: string;
  tagline: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  icon: string;
  background_pattern: string | null;
  is_active: boolean;
  created_at: string;
}

export interface UserWorldPreference {
  id: string;
  user_id: string;
  world_id: string;
  quiz_responses: Record<string, unknown> | null;
  selected_at: string;
}

// ============================================================================
// SKILLS TAXONOMY SYSTEM
// ============================================================================

export interface SkillsTaxonomy {
  id: string;
  name: string;
  description: string | null;
  framework: SkillFramework;
  framework_id: string | null;
  category: SkillCategory;
  parent_skill_id: string | null;
  level_descriptors: Record<string, unknown> | null;
  alt_labels: string[] | null;
  related_occupations: string[] | null;
  is_active: boolean;
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency_level: number;
  verification_level: SkillVerificationLevel;
  confidence_score: number;
  evidence_count: number;
  years_experience: number | null;
  last_used_date: string | null;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkillEndorsement {
  id: string;
  user_skill_id: string;
  endorser_id: string;
  relationship: string | null;
  endorsement_text: string | null;
  created_at: string;
}

// ============================================================================
// PROJECT PORTFOLIO SYSTEM
// ============================================================================

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  project_type: ProjectType;
  thumbnail_url: string | null;
  external_url: string | null;
  repository_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_ongoing: boolean;
  visibility: 'public' | 'private' | 'unlisted';
  is_featured: boolean;
  view_count: number;
  tags: string[] | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectArtifact {
  id: string;
  project_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  mime_type: string | null;
  upload_status: UploadStatus;
  storage_bucket: string;
  analysis_status: UploadStatus;
  analysis_result: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ProjectSkill {
  id: string;
  project_id: string;
  skill_id: string;
  confidence_score: number;
  evidence_snippets: Record<string, unknown> | null;
  ai_reasoning: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface AISkillAnalysis {
  id: string;
  artifact_id: string;
  analysis_type: string;
  status: UploadStatus;
  started_at: string | null;
  completed_at: string | null;
  result: Record<string, unknown> | null;
  error_message: string | null;
  tokens_used: number | null;
  model_version: string | null;
  created_at: string;
}

// ============================================================================
// 360-DEGREE FEEDBACK SYSTEM
// ============================================================================

export interface FeedbackRequest {
  id: string;
  user_id: string;
  title: string;
  context: string | null;
  prompt_questions: Record<string, unknown>;
  status: FeedbackStatus;
  expires_at: string;
  min_respondents: number;
  max_respondents: number;
  is_anonymous: boolean;
  aggregated_results: Record<string, unknown> | null;
  created_at: string;
  completed_at: string | null;
}

export interface FeedbackRespondent {
  id: string;
  request_id: string;
  respondent_email: string;
  respondent_name: string | null;
  respondent_user_id: string | null;
  access_token: string;
  relationship: string | null;
  status: FeedbackStatus;
  invited_at: string;
  responded_at: string | null;
}

export interface FeedbackResponse {
  id: string;
  respondent_id: string;
  feedback_type: FeedbackType;
  content: string | null;
  audio_url: string | null;
  video_url: string | null;
  transcription: string | null;
  sentiment_analysis: Record<string, unknown> | null;
  skill_indicators: Record<string, unknown> | null;
  duration_seconds: number | null;
  created_at: string;
}

// ============================================================================
// CAREER COMPASS SYSTEM
// ============================================================================

export interface CareerPath {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  typical_titles: string[] | null;
  required_skills: Record<string, unknown> | null;
  preferred_skills: Record<string, unknown> | null;
  salary_range: Record<string, unknown> | null;
  growth_outlook: string | null;
  entry_requirements: string | null;
  progression_paths: string[] | null;
  is_active: boolean;
  created_at: string;
}

export interface UserCareerGoal {
  id: string;
  user_id: string;
  career_path_id: string | null;
  target_role: string | null;
  target_company: string | null;
  target_industry: string | null;
  target_salary_min: number | null;
  target_salary_max: number | null;
  target_timeline: string | null;
  priority: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSkillGap {
  id: string;
  user_id: string;
  career_goal_id: string | null;
  skill_id: string;
  current_level: number | null;
  required_level: number;
  gap_severity: 'low' | 'medium' | 'high' | 'critical' | null;
  recommended_resources: Record<string, unknown> | null;
  estimated_time_to_close: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TEAM MATCHING SYSTEM
// ============================================================================

export interface Team {
  id: string;
  name: string;
  description: string | null;
  purpose: string | null;
  max_members: number;
  skill_requirements: Record<string, unknown> | null;
  is_public: boolean;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  contribution_area: string | null;
  joined_at: string;
}

// ============================================================================
// EMPLOYER PORTAL SYSTEM
// ============================================================================

export interface Company {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  industry: string | null;
  company_size: CompanySize | null;
  founded_year: number | null;
  headquarters_location: string | null;
  culture_values: Record<string, unknown> | null;
  benefits: Record<string, unknown> | null;
  tech_stack: string[] | null;
  is_verified: boolean;
  is_active: boolean;
  subscription_tier: string;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyAdmin {
  id: string;
  company_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'recruiter' | 'viewer';
  invited_by: string | null;
  created_at: string;
}

export interface JobPosting {
  id: string;
  company_id: string;
  title: string;
  description: string;
  requirements: string | null;
  responsibilities: string | null;
  employment_type: EmploymentType;
  location: string | null;
  is_remote: boolean;
  remote_policy: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  required_skills: Record<string, unknown> | null;
  preferred_skills: Record<string, unknown> | null;
  experience_level: string | null;
  education_level: string | null;
  status: JobStatus;
  application_url: string | null;
  application_email: string | null;
  view_count: number;
  application_count: number;
  posted_at: string | null;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  user_id: string;
  cover_letter: string | null;
  resume_url: string | null;
  portfolio_url: string | null;
  status: 'submitted' | 'viewed' | 'shortlisted' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn';
  match_score: number | null;
  skill_match_details: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// DATABASE INTERFACE FOR SUPABASE
// ============================================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Partial<User> & { id: string; email: string };
        Update: Partial<User>;
      };
      narrative_worlds: {
        Row: NarrativeWorldRecord;
        Insert: Omit<NarrativeWorldRecord, 'id' | 'created_at'>;
        Update: Partial<NarrativeWorldRecord>;
      };
      user_world_preferences: {
        Row: UserWorldPreference;
        Insert: Omit<UserWorldPreference, 'id' | 'selected_at'>;
        Update: Partial<UserWorldPreference>;
      };
      skills_taxonomy: {
        Row: SkillsTaxonomy;
        Insert: Omit<SkillsTaxonomy, 'id' | 'created_at'>;
        Update: Partial<SkillsTaxonomy>;
      };
      user_skills: {
        Row: UserSkill;
        Insert: Omit<UserSkill, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<UserSkill>;
      };
      skill_endorsements: {
        Row: SkillEndorsement;
        Insert: Omit<SkillEndorsement, 'id' | 'created_at'>;
        Update: Partial<SkillEndorsement>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Project>;
      };
      project_artifacts: {
        Row: ProjectArtifact;
        Insert: Omit<ProjectArtifact, 'id' | 'created_at'>;
        Update: Partial<ProjectArtifact>;
      };
      project_skills: {
        Row: ProjectSkill;
        Insert: Omit<ProjectSkill, 'id' | 'created_at'>;
        Update: Partial<ProjectSkill>;
      };
      ai_skill_analyses: {
        Row: AISkillAnalysis;
        Insert: Omit<AISkillAnalysis, 'id' | 'created_at'>;
        Update: Partial<AISkillAnalysis>;
      };
      feedback_requests: {
        Row: FeedbackRequest;
        Insert: Omit<FeedbackRequest, 'id' | 'created_at'>;
        Update: Partial<FeedbackRequest>;
      };
      feedback_respondents: {
        Row: FeedbackRespondent;
        Insert: Omit<FeedbackRespondent, 'id' | 'invited_at'>;
        Update: Partial<FeedbackRespondent>;
      };
      feedback_responses: {
        Row: FeedbackResponse;
        Insert: Omit<FeedbackResponse, 'id' | 'created_at'>;
        Update: Partial<FeedbackResponse>;
      };
      career_paths: {
        Row: CareerPath;
        Insert: Omit<CareerPath, 'id' | 'created_at'>;
        Update: Partial<CareerPath>;
      };
      user_career_goals: {
        Row: UserCareerGoal;
        Insert: Omit<UserCareerGoal, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<UserCareerGoal>;
      };
      user_skill_gaps: {
        Row: UserSkillGap;
        Insert: Omit<UserSkillGap, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<UserSkillGap>;
      };
      teams: {
        Row: Team;
        Insert: Omit<Team, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Team>;
      };
      team_members: {
        Row: TeamMember;
        Insert: Omit<TeamMember, 'id' | 'joined_at'>;
        Update: Partial<TeamMember>;
      };
      companies: {
        Row: Company;
        Insert: Omit<Company, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Company>;
      };
      company_admins: {
        Row: CompanyAdmin;
        Insert: Omit<CompanyAdmin, 'id' | 'created_at'>;
        Update: Partial<CompanyAdmin>;
      };
      job_postings: {
        Row: JobPosting;
        Insert: Omit<JobPosting, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<JobPosting>;
      };
      job_applications: {
        Row: JobApplication;
        Insert: Omit<JobApplication, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<JobApplication>;
      };
    };
  };
}

// ============================================================================
// EXPANDED TYPES WITH RELATIONS
// ============================================================================

export interface UserSkillWithTaxonomy extends UserSkill {
  skill: SkillsTaxonomy;
  endorsements?: SkillEndorsement[];
}

export interface ProjectWithArtifacts extends Project {
  artifacts: ProjectArtifact[];
  extracted_skills?: ProjectSkillWithTaxonomy[];
}

export interface ProjectSkillWithTaxonomy extends ProjectSkill {
  skill: SkillsTaxonomy;
}

export interface FeedbackRequestWithRespondents extends FeedbackRequest {
  respondents: FeedbackRespondentWithResponse[];
}

export interface FeedbackRespondentWithResponse extends FeedbackRespondent {
  responses?: FeedbackResponse[];
}

export interface TeamWithMembers extends Team {
  members: TeamMemberWithUser[];
}

export interface TeamMemberWithUser extends TeamMember {
  user: User;
}

export interface JobPostingWithCompany extends JobPosting {
  company: Company;
}

export interface JobApplicationWithDetails extends JobApplication {
  job: JobPostingWithCompany;
  user: User;
}
