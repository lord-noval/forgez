"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  FolderOpen,
  MessageCircle,
  Users,
  Compass,
  BookOpen,
  Briefcase,
  ChevronRight,
  Sparkles,
  Award,
  TrendingUp,
  Clock,
  ExternalLink,
  Map,
  Navigation,
  Route,
  Swords,
  Play,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { WorldId } from "@/themes/types";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AchievementShowcase } from "@/components/achievements/AchievementShowcase";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { JourneyCompleteCard } from "@/components/dashboard/JourneyCompleteCard";
import { useUserStore } from "@/stores/user-store";
import { useWorldStore } from "@/stores/world-store";
import { useWorldLabelsI18n } from "@/i18n/use-world-labels";
import { useAchievementsStore, useAchievementsWithStatus, useUnlockedCount } from "@/stores/achievements-store";
import { useQuestStore, useCompletedQuestsCount } from "@/stores/quest-store";
import { useXPStore } from "@/stores/xp-store";

// World-specific icon mappings for Quick Actions (FORGE-Z only)
const quickActionIcons: Record<WorldId, {
  portfolio: LucideIcon;
  feedback: LucideIcon;
  teams: LucideIcon;
  compass: LucideIcon;
}> = {
  forgez: {
    portfolio: FolderOpen,
    feedback: MessageCircle,
    teams: Users,
    compass: Map,
  },
};

// Mock data - in production, fetch from API
const mockRecentProjects = [
  {
    id: "demo-weather",
    title: "AI-Powered Weather Dashboard",
    description: "Built a React dashboard that uses machine learning to predict local weather patterns",
    skills: ["React", "TypeScript", "Machine Learning", "API Integration"],
    updatedAt: "2 days ago",
    verificationLevel: "PROJECT_VERIFIED",
  },
  {
    id: "demo-robotics",
    title: "Robotics Arm Controller",
    description: "Arduino-based control system for a 6-DOF robotic arm with inverse kinematics",
    skills: ["Arduino", "C++", "Robotics", "Control Systems"],
    updatedAt: "1 week ago",
    verificationLevel: "AI_ANALYZED",
  },
  {
    id: "demo-energy",
    title: "Sustainable Energy Monitor",
    description: "IoT system for monitoring solar panel efficiency and battery storage",
    skills: ["IoT", "Python", "Data Visualization", "Energy Systems"],
    updatedAt: "2 weeks ago",
    verificationLevel: "PEER_ENDORSED",
  },
];

const mockSkillProgress = [
  { name: "React", level: 85, verified: true },
  { name: "TypeScript", level: 78, verified: true },
  { name: "Python", level: 72, verified: true },
  { name: "Machine Learning", level: 45, verified: false },
  { name: "Robotics", level: 38, verified: false },
];

const mockPendingFeedback = [
  { id: "1", from: "Alex Chen", skill: "Problem Solving", requestedAt: "3 days ago" },
  { id: "2", from: "Maria Garcia", skill: "Team Collaboration", requestedAt: "1 week ago" },
];

const mockCareerMatches = [
  { id: "1", title: "Junior Robotics Engineer", company: "SpaceX", matchScore: 92 },
  { id: "2", title: "Software Developer", company: "Tesla Energy", matchScore: 88 },
  { id: "3", title: "AI Research Intern", company: "OpenAI", matchScore: 85 },
];

const mockLearningRecommendations = [
  { id: "1", title: "Introduction to Machine Learning", provider: "Coursera", duration: "4 weeks" },
  { id: "2", title: "Advanced Robotics", provider: "MIT OpenCourseWare", duration: "6 weeks" },
];

type VerificationLevel = 'SELF_ASSESSED' | 'PEER_ENDORSED' | 'PROJECT_VERIFIED' | 'AI_ANALYZED' | 'ASSESSMENT_PASSED' | 'CERTIFICATION_VERIFIED';

export default function DashboardPage() {
  const { user } = useUserStore();
  const labels = useWorldLabelsI18n();
  const { currentWorld } = useWorldStore();
  const quickIcons = quickActionIcons[currentWorld];
  const t = useTranslations('dashboard');

  // Initialize achievements store
  const { initializeAchievements } = useAchievementsStore();
  const achievements = useAchievementsWithStatus();
  const achievementsUnlocked = useUnlockedCount();

  // Quest and XP state
  const completedQuestsCount = useCompletedQuestsCount();
  const currentQuestNumber = useQuestStore((state) => state.currentQuestNumber);
  const totalXP = useXPStore((state) => state.totalXP);
  const level = useXPStore((state) => state.level);

  // Check if user has explored careers (localStorage based)
  const [hasExploredCareers, setHasExploredCareers] = useState(false);

  useEffect(() => {
    initializeAchievements();
    // Check localStorage for career exploration
    const explored = localStorage.getItem('forgez-explored-careers');
    setHasExploredCareers(explored === 'true');
  }, [initializeAchievements]);

  // Determine if journey is complete
  const isJourneyComplete = completedQuestsCount >= 8;

  const verificationBadgeStyles: Record<VerificationLevel, { bg: string; text: string; labelKey: string }> = {
    SELF_ASSESSED: { bg: "bg-gray-500/20", text: "text-gray-400", labelKey: "selfAssessed" },
    PEER_ENDORSED: { bg: "bg-blue-500/20", text: "text-blue-400", labelKey: "peerEndorsed" },
    PROJECT_VERIFIED: { bg: "bg-green-500/20", text: "text-green-400", labelKey: "projectVerified" },
    AI_ANALYZED: { bg: "bg-purple-500/20", text: "text-purple-400", labelKey: "aiAnalyzed" },
    ASSESSMENT_PASSED: { bg: "bg-yellow-500/20", text: "text-yellow-400", labelKey: "assessmentPassed" },
    CERTIFICATION_VERIFIED: { bg: "bg-orange-500/20", text: "text-orange-400", labelKey: "certificationVerified" },
  };

  return (
    <div className="space-y-8">
      {/* Journey Complete Card (for users who finished all quests) */}
      {isJourneyComplete && (
        <JourneyCompleteCard
          totalXP={totalXP}
          level={level}
          achievementsUnlocked={achievementsUnlocked}
          questsCompleted={completedQuestsCount}
        />
      )}

      {/* Quest Progress Hero (for users still on quest journey) */}
      {!isJourneyComplete && completedQuestsCount < 8 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 border-2 border-[var(--primary)] bg-gradient-to-r from-[var(--primary-muted)] to-transparent shadow-[0_0_20px_var(--primary-muted)]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center">
                  <Swords className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-mono text-[var(--primary)] mb-1">
                    {completedQuestsCount === 0 ? t('quest.startJourney') : t('quest.continueJourney')}
                  </p>
                  <h2 className="text-lg font-display font-bold">
                    {completedQuestsCount === 0
                      ? t('quest.beginAdventure')
                      : `${t('quest.questProgress')}: ${completedQuestsCount}/8`}
                  </h2>
                </div>
              </div>
              <Link href={`/quest/${currentQuestNumber}`}>
                <Button className="glow-primary">
                  <Play className="w-4 h-4 mr-2" />
                  {completedQuestsCount === 0 ? t('quest.startQuest') : t('quest.continueQuest')}
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Onboarding Checklist (for users who completed quests) */}
      {isJourneyComplete && (
        <OnboardingChecklist
          projectCount={mockRecentProjects.length}
          skillCount={mockSkillProgress.filter((s) => s.verified).length}
          feedbackCount={mockPendingFeedback.length}
          hasExploredCareers={hasExploredCareers}
          profileComplete={user?.headline !== null && user?.bio !== null}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">{labels.dashboard}</h1>
          <p className="text-[var(--foreground-muted)]">
            {labels.welcomeMessage}. {labels.dailyGreeting}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/portfolio/new">
            <Button>
              <Sparkles className="w-4 h-4 mr-2" />
              {t('actions.addProject')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">{t('stats.projects')}</p>
                <p className="text-2xl font-bold font-mono">{mockRecentProjects.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-[var(--primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">{t('stats.verifiedSkills')}</p>
                <p className="text-2xl font-bold font-mono">
                  {mockSkillProgress.filter((s) => s.verified).length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[var(--success-muted)] flex items-center justify-center">
                <Award className="w-5 h-5 text-[var(--success)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">{t('stats.pendingFeedback')}</p>
                <p className="text-2xl font-bold font-mono">{mockPendingFeedback.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[var(--warning-muted)] flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-[var(--warning)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">{t('stats.careerMatches')}</p>
                <p className="text-2xl font-bold font-mono">{mockCareerMatches.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[var(--secondary-muted)] flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-[var(--secondary)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Projects and Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                {t('sections.recentProjects')}
              </CardTitle>
              <Link href="/portfolio">
                <Button variant="ghost" size="sm">
                  {t('actions.viewAll')} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/portfolio/${project.id}`}>
                      <div className="p-4 bg-[var(--background-secondary)] rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)] transition-all group">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium group-hover:text-[var(--primary)] transition-colors">
                            {project.title}
                          </h4>
                          <Badge
                            className={`${verificationBadgeStyles[project.verificationLevel as VerificationLevel].bg} ${verificationBadgeStyles[project.verificationLevel as VerificationLevel].text}`}
                          >
                            {t(`verification.${verificationBadgeStyles[project.verificationLevel as VerificationLevel].labelKey}`)}
                          </Badge>
                        </div>
                        <p className="text-sm text-[var(--foreground-muted)] mb-3 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {project.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {project.skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{project.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-[var(--foreground-subtle)] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {project.updatedAt}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skill Progress */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {t('sections.skillProgress')}
              </CardTitle>
              <Link href="/skills/bank">
                <Button variant="ghost" size="sm">
                  {labels.skillsBank} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSkillProgress.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{skill.name}</span>
                        {skill.verified && (
                          <Award className="w-4 h-4 text-[var(--success)]" />
                        )}
                      </div>
                      <span className="text-sm text-[var(--foreground-muted)]">
                        {skill.level}%
                      </span>
                    </div>
                    <Progress
                      value={skill.level}
                      max={100}
                      variant={skill.verified ? "success" : "default"}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Feedback, Careers, Learning */}
        <div className="space-y-6">
          {/* Pending Feedback */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                {t('sections.pendingFeedback')}
              </CardTitle>
              <Link href="/feedback">
                <Button variant="ghost" size="sm">
                  {t('actions.view')} <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {mockPendingFeedback.length > 0 ? (
                <div className="space-y-3">
                  {mockPendingFeedback.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="flex items-center justify-between p-3 bg-[var(--background-secondary)] rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">{feedback.from}</p>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          {feedback.skill} • {feedback.requestedAt}
                        </p>
                      </div>
                      <Badge variant="warning">{t('status.pending')}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--foreground-muted)]">
                  {t('empty.noPendingFeedback')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Career Matches */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {t('sections.careerMatches')}
              </CardTitle>
              <Link href="/careers">
                <Button variant="ghost" size="sm">
                  {t('actions.explore')} <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockCareerMatches.map((career) => (
                  <Link key={career.id} href={`/careers/jobs/${career.id}`}>
                    <div className="flex items-center justify-between p-3 bg-[var(--background-secondary)] rounded-lg hover:bg-[var(--background-tertiary)] transition-colors">
                      <div>
                        <p className="text-sm font-medium">{career.title}</p>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          {career.company}
                        </p>
                      </div>
                      <Badge variant="success">{t('status.match', { percent: career.matchScore })}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Learning Recommendations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {labels.learn}
              </CardTitle>
              <Link href="/learn">
                <Button variant="ghost" size="sm">
                  {t('actions.browse')} <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockLearningRecommendations.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 bg-[var(--background-secondary)] rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{course.title}</p>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        {course.provider} • {course.duration}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[var(--foreground-muted)]" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements Showcase */}
          <AchievementShowcase achievements={achievements} />

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('sections.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/portfolio/new">
                  <Button variant="secondary" className="w-full justify-start text-sm overflow-hidden" size="sm">
                    <quickIcons.portfolio className="w-4 h-4 shrink-0" />
                    <span className="truncate">{t('actions.addProject')}</span>
                  </Button>
                </Link>
                <Link href="/feedback/new">
                  <Button variant="secondary" className="w-full justify-start text-sm overflow-hidden" size="sm">
                    <quickIcons.feedback className="w-4 h-4 shrink-0" />
                    <span className="truncate">{t('actions.requestFeedback')}</span>
                  </Button>
                </Link>
                <Link href="/teams">
                  <Button variant="secondary" className="w-full justify-start text-sm overflow-hidden" size="sm">
                    <quickIcons.teams className="w-4 h-4 shrink-0" />
                    <span className="truncate">{t('actions.findTeam')}</span>
                  </Button>
                </Link>
                <Link href="/compass">
                  <Button variant="secondary" className="w-full justify-start text-sm overflow-hidden" size="sm">
                    <quickIcons.compass className="w-4 h-4 shrink-0" />
                    <span className="truncate">{labels.compass}</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
