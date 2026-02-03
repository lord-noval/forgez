'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Plus,
  Search,
  Users,
  Filter,
  Sparkles,
  Mail,
  CheckCircle2,
  ArrowRight,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorldLabelsI18n } from '@/i18n/use-world-labels';

// Mock team data for preview
const mockTeams = [
  {
    id: '1',
    name: 'Rocket Propulsion R&D',
    description: 'Developing next-gen propulsion systems for space exploration',
    members: 4,
    maxMembers: 6,
    skills: ['Aerospace Engineering', 'Fluid Dynamics', 'CAD'],
    industry: 'Space',
  },
  {
    id: '2',
    name: 'Green Grid Solutions',
    description: 'Building smart grid solutions for renewable energy',
    members: 3,
    maxMembers: 5,
    skills: ['Electrical Engineering', 'Python', 'Machine Learning'],
    industry: 'Energy',
  },
  {
    id: '3',
    name: 'Autonomous Systems Lab',
    description: 'Research team focused on robotics perception and control',
    members: 5,
    maxMembers: 7,
    skills: ['Robotics', 'Computer Vision', 'ROS'],
    industry: 'Robotics',
  },
];

export default function TeamsPage() {
  const labels = useWorldLabelsI18n();
  const t = useTranslations('teams');
  const tCommon = useTranslations('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display">{labels.teams}</h1>
          <p className="text-[var(--foreground-muted)]">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="gap-2" disabled>
            <Sparkles className="w-4 h-4" />
            {t('buttons.findMatch')}
          </Button>
          <Button className="gap-2" disabled>
            <Plus className="w-4 h-4" />
            {t('actions.createTeam')}
          </Button>
        </div>
      </div>

      {/* Search (disabled for preview) */}
      <div className="flex gap-4 mb-6 opacity-50 pointer-events-none">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
          <Input
            placeholder={t('buttons.searchTeams')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            disabled
          />
        </div>
        <Button variant="secondary" className="gap-2" disabled>
          <Filter className="w-4 h-4" />
          {tCommon('buttons.filter')}
        </Button>
      </div>

      {/* Waitlist Card */}
      <Card variant="glass-card" className="p-8 mb-8">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>

          {!isSubmitted ? (
            <>
              <h2 className="text-xl font-bold font-display mb-2">
                {t('comingSoon.title')}
              </h2>
              <p className="text-[var(--foreground-muted)] mb-6">
                {t('comingSoon.description')}
              </p>

              <form onSubmit={handleWaitlistSubmit} className="flex gap-2 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder={t('comingSoon.enterEmail')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Mail className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      {t('comingSoon.joinWaitlist')}
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircle2 className="w-12 h-12 text-[var(--success)] mx-auto mb-4" />
              <h2 className="text-xl font-bold font-display mb-2">
                {t('comingSoon.onTheList')}
              </h2>
              <p className="text-[var(--foreground-muted)]">
                {t('comingSoon.willNotify', { email })}
              </p>
            </motion.div>
          )}
        </div>
      </Card>

      {/* CTA to complete profile */}
      <Card className="p-6 mb-8 border-[var(--primary)] bg-[var(--primary-muted)]">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--primary)] flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">{t('cta.completeProfile')}</h3>
              <p className="text-sm text-[var(--foreground-muted)]">
                {t('cta.addSkillsForMatches')}
              </p>
            </div>
          </div>
          <Link href="/skills/bank">
            <Button variant="secondary" className="gap-2">
              {t('cta.goToSkillsBank')}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>

      {/* Preview Teams Grid */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold font-display mb-1">{t('preview.title')}</h3>
        <p className="text-sm text-[var(--foreground-muted)]">
          {t('preview.description')}
        </p>
      </div>

      <div className="grid gap-4 opacity-75">
        {mockTeams.map((team, index) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:border-[var(--border-hover)] transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold font-display">{team.name}</h4>
                    <Badge variant="secondary">{team.industry}</Badge>
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)] mb-3">
                    {team.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {team.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 text-sm text-[var(--foreground-muted)]">
                    <Users className="w-4 h-4" />
                    <span>{team.members}/{team.maxMembers}</span>
                  </div>
                  <Button size="sm" variant="secondary" className="mt-2" disabled>
                    {t('buttons.viewTeam')}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Feature preview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
          <div className="w-10 h-10 mb-3 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <h4 className="font-semibold mb-2">{t('features.skillComplementarity.title')}</h4>
          <p className="text-sm text-[var(--foreground-muted)]">
            {t('features.skillComplementarity.description')}
          </p>
        </Card>

        <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
          <div className="w-10 h-10 mb-3 rounded-lg bg-[var(--success-muted)] flex items-center justify-center">
            <Users className="w-5 h-5 text-[var(--success)]" />
          </div>
          <h4 className="font-semibold mb-2">{t('features.experienceBalance.title')}</h4>
          <p className="text-sm text-[var(--foreground-muted)]">
            {t('features.experienceBalance.description')}
          </p>
        </Card>

        <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
          <div className="w-10 h-10 mb-3 rounded-lg bg-[var(--achievement-muted)] flex items-center justify-center">
            <Filter className="w-5 h-5 text-[var(--achievement)]" />
          </div>
          <h4 className="font-semibold mb-2">{t('features.workingStyleMatch.title')}</h4>
          <p className="text-sm text-[var(--foreground-muted)]">
            {t('features.workingStyleMatch.description')}
          </p>
        </Card>
      </div>
    </div>
  );
}
