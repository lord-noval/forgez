"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  User,
  Award,
  ChevronRight,
  Settings,
  FolderOpen,
  MessageCircle,
  Target,
  Briefcase,
  GraduationCap,
  MapPin,
  LinkIcon,
  Github,
  Linkedin,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/stores/user-store";
import { useWorldLabelsI18n } from "@/i18n/use-world-labels";

// Mock data for profile stats
const mockStats = {
  projectsUploaded: 5,
  skillsVerified: 12,
  endorsementsReceived: 8,
  feedbackRequests: 3,
  careerMatches: 15,
  joinDate: "January 2024",
};

const mockTopSkills = [
  { name: "React", level: 85, verificationLevel: "PROJECT_VERIFIED" },
  { name: "TypeScript", level: 78, verificationLevel: "AI_ANALYZED" },
  { name: "Python", level: 72, verificationLevel: "PROJECT_VERIFIED" },
  { name: "Machine Learning", level: 45, verificationLevel: "SELF_ASSESSED" },
];

const mockRecentProjects = [
  { id: "1", title: "AI Weather Dashboard", skills: ["React", "TypeScript", "ML"] },
  { id: "2", title: "Robotics Controller", skills: ["C++", "Arduino"] },
  { id: "3", title: "Energy Monitor", skills: ["Python", "IoT"] },
];

export default function ProfilePage() {
  const { user } = useUserStore();
  const labels = useWorldLabelsI18n();
  const t = useTranslations('profile');

  // Verification level styles with translations
  const verificationStyles: Record<string, { bg: string; text: string; label: string }> = {
    SELF_ASSESSED: { bg: "bg-gray-500/20", text: "text-gray-400", label: t('verification.selfAssessed') },
    PEER_ENDORSED: { bg: "bg-blue-500/20", text: "text-blue-400", label: t('verification.peerEndorsed') },
    PROJECT_VERIFIED: { bg: "bg-green-500/20", text: "text-green-400", label: t('verification.projectVerified') },
    AI_ANALYZED: { bg: "bg-purple-500/20", text: "text-purple-400", label: t('verification.aiAnalyzed') },
    ASSESSMENT_PASSED: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: t('verification.assessmentPassed') },
    CERTIFICATION_VERIFIED: { bg: "bg-orange-500/20", text: "text-orange-400", label: t('verification.certificationVerified') },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-display">{labels.profile}</h1>
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Profile Card */}
      <Card className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background:
              "radial-gradient(circle at top right, var(--primary), transparent 70%)",
          }}
        />
        <CardContent className="py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <Avatar size="xl">
              {user?.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.username || ""} />
              ) : (
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              )}
            </Avatar>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold font-display">
                {user?.username || "User"}
              </h2>
              {user?.headline && (
                <p className="text-[var(--foreground-muted)]">{user.headline}</p>
              )}
              <p className="text-sm text-[var(--foreground-subtle)]">{user?.email}</p>

              {user?.location && (
                <div className="flex items-center justify-center md:justify-start gap-1 mt-2 text-sm text-[var(--foreground-muted)]">
                  <MapPin className="w-4 h-4" />
                  {user.location}
                </div>
              )}

              {/* Social Links */}
              <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                {user?.linkedinUrl && (
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-[var(--background-tertiary)] hover:bg-[var(--background-secondary)] transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {user?.githubUrl && (
                  <a
                    href={user.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-[var(--background-tertiary)] hover:bg-[var(--background-secondary)] transition-colors"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {user?.portfolioUrl && (
                  <a
                    href={user.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-[var(--background-tertiary)] hover:bg-[var(--background-secondary)] transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-3xl font-bold font-mono text-[var(--primary)]">
                  {mockStats.projectsUploaded}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">{t('stats.projects')}</p>
              </div>
              <div>
                <p className="text-3xl font-bold font-mono text-[var(--success)]">
                  {mockStats.skillsVerified}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">{t('stats.skills')}</p>
              </div>
              <div>
                <p className="text-3xl font-bold font-mono text-[var(--secondary)]">
                  {mockStats.endorsementsReceived}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">{t('stats.endorsements')}</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          {user?.bio && (
            <div className="mt-6 p-4 bg-[var(--background-secondary)] rounded-lg">
              <p className="text-sm text-[var(--foreground-muted)]">{user.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <FolderOpen className="w-6 h-6 mx-auto mb-2 text-[var(--primary)]" />
            <p className="text-2xl font-bold font-mono">{mockStats.projectsUploaded}</p>
            <p className="text-xs text-[var(--foreground-muted)]">{t('stats.projects')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-[var(--success)]" />
            <p className="text-2xl font-bold font-mono">{mockStats.skillsVerified}</p>
            <p className="text-xs text-[var(--foreground-muted)]">{t('stats.verifiedSkills')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <MessageCircle className="w-6 h-6 mx-auto mb-2 text-[var(--secondary)]" />
            <p className="text-2xl font-bold font-mono">{mockStats.endorsementsReceived}</p>
            <p className="text-xs text-[var(--foreground-muted)]">{t('stats.endorsements')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Briefcase className="w-6 h-6 mx-auto mb-2 text-[var(--warning)]" />
            <p className="text-2xl font-bold font-mono">{mockStats.careerMatches}</p>
            <p className="text-xs text-[var(--foreground-muted)]">{t('stats.careerMatches')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skills */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[var(--primary)]" />
              {t('sections.topSkills')}
            </CardTitle>
            <Link href="/skills/bank">
              <Button variant="ghost" size="sm">
                {t('actions.viewAll')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTopSkills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{skill.name}</span>
                      <Badge
                        className={`text-xs ${verificationStyles[skill.verificationLevel].bg} ${verificationStyles[skill.verificationLevel].text}`}
                      >
                        {verificationStyles[skill.verificationLevel].label}
                      </Badge>
                    </div>
                    <span className="text-sm text-[var(--foreground-muted)]">
                      {skill.level}%
                    </span>
                  </div>
                  <Progress
                    value={skill.level}
                    max={100}
                    size="sm"
                    variant={skill.verificationLevel.includes("VERIFIED") ? "success" : "default"}
                  />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-[var(--primary)]" />
              {t('sections.recentProjects')}
            </CardTitle>
            <Link href="/portfolio">
              <Button variant="ghost" size="sm">
                {t('actions.viewAll')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockRecentProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/portfolio/${project.id}`}>
                    <div className="p-3 bg-[var(--background-secondary)] rounded-lg hover:bg-[var(--background-tertiary)] transition-colors">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{project.title}</h4>
                        <ExternalLink className="w-4 h-4 text-[var(--foreground-muted)]" />
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-[var(--primary-muted)] to-[var(--secondary-muted)] border-[var(--primary)]">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('cta.title')}</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {t('cta.description')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/portfolio/new">
                <Button>{t('cta.addProject')}</Button>
              </Link>
              <Link href="/feedback/new">
                <Button variant="secondary">{t('cta.requestFeedback')}</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
