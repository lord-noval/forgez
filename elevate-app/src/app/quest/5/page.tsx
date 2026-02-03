'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  TrendingUp,
  DollarSign,
  Target,
  Award,
  Briefcase,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useQuestStore } from '@/stores/quest-store';
import { useXPStore } from '@/stores/xp-store';
import { DemandChart, type DemandData } from '@/components/talent/DemandChart';

interface TalentRole {
  id: string;
  slug: string;
  title: string;
  description: string;
  industry: string;
  department: string;
  level: string;
  salary_range: { min: number; max: number; currency: string; region: string };
  required_skills: string[];
  education_requirements: string;
  market_demand: number;
  growth_rate: string;
  remote_friendly: boolean;
}

export default function Quest5Page() {
  const t = useTranslations('quest');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<TalentRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<TalentRole | null>(null);
  const [exploredRoles, setExploredRoles] = useState<Set<string>>(new Set());
  const [totalXPEarned, setTotalXPEarned] = useState(0);

  const { startQuest, completeQuest, getQuestStatus } = useQuestStore();
  const { awardXP } = useXPStore();

  useEffect(() => {
    const status = getQuestStatus(5);

    if (status === 'available') {
      startQuest(5);
    }

    if (status === 'locked') {
      router.push('/quest/4');
      return;
    }

    fetchRoles();
  }, [getQuestStatus, startQuest, router]);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/roles');
      const data = await response.json();
      setRoles(data.data || []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExploreRole = (role: TalentRole) => {
    setSelectedRole(role);

    if (!exploredRoles.has(role.id)) {
      setExploredRoles((prev) => new Set(prev).add(role.id));
      awardXP(25, 'role_explore', role.id, `Explored ${role.title}`);
      setTotalXPEarned((prev) => prev + 25);
    }
  };

  const handleContinue = () => {
    completeQuest(5, totalXPEarned);
    router.push('/quest/6');
  };

  const formatSalary = (range: TalentRole['salary_range']) => {
    if (!range) return 'N/A';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: range.currency || 'USD',
      maximumFractionDigits: 0,
    });
    return `${formatter.format(range.min)} - ${formatter.format(range.max)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-20 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold font-display gradient-text-fire mb-2">
            {t('quest5.title')}
          </h1>
          <p className="text-lg text-[var(--foreground-muted)]">
            {t('quest5.subtitle')}
          </p>
        </motion.div>

        {/* Market Demand Overview */}
        {roles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
              <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[var(--primary)]" />
                Market Demand Growth
              </h2>
              <DemandChart
                data={roles.slice(0, 6).map((role): DemandData => ({
                  id: role.id,
                  title: role.title,
                  growthRate: parseInt(role.growth_rate?.replace(/[^-\d]/g, '') || '0', 10),
                  demand: role.market_demand || 0,
                }))}
              />
            </Card>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Role List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="font-display font-semibold text-lg mb-4">Career Roles</h2>
            {roles.map((role, index) => {
              const isExplored = exploredRoles.has(role.id);
              const isSelected = selectedRole?.id === role.id;

              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={cn(
                      'p-4 cursor-pointer transition-all',
                      'border-[var(--border)] bg-[var(--background-secondary)]',
                      'hover:border-[var(--primary)]',
                      isSelected && 'border-[var(--primary)] bg-[var(--primary-muted)]',
                      isExplored && !isSelected && 'border-[var(--success)]'
                    )}
                    onClick={() => handleExploreRole(role)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{role.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[var(--foreground-muted)] capitalize">
                            {role.level}
                          </span>
                          <span className="text-xs text-[var(--foreground-muted)]">•</span>
                          <span className="text-xs text-[var(--foreground-muted)] capitalize">
                            {role.industry}
                          </span>
                        </div>
                      </div>
                      {isExplored && (
                        <span className="text-[var(--success)] text-xs">+25 XP</span>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Role Details */}
          <div className="lg:col-span-2">
            {selectedRole ? (
              <motion.div
                key={selectedRole.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-display font-bold">{selectedRole.title}</h2>
                      <p className="text-[var(--foreground-muted)] mt-1">
                        {selectedRole.department} • {selectedRole.level} Level
                      </p>
                    </div>
                    {selectedRole.remote_friendly && (
                      <span className="px-3 py-1 rounded-full text-xs bg-[var(--success-muted)] text-[var(--success)]">
                        Remote OK
                      </span>
                    )}
                  </div>

                  <p className="text-[var(--foreground)] mb-6">{selectedRole.description}</p>

                  {/* Stats Grid */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-[var(--background-tertiary)]">
                      <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm">{t('quest5.salary')}</span>
                      </div>
                      <p className="font-display font-bold text-lg">
                        {formatSalary(selectedRole.salary_range)}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-[var(--background-tertiary)]">
                      <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
                        <Target className="w-4 h-4" />
                        <span className="text-sm">{t('quest5.demand')}</span>
                      </div>
                      <p className="font-display font-bold text-lg">
                        {selectedRole.market_demand?.toLocaleString() || 'N/A'} {t('quest5.openPositions')}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-[var(--background-tertiary)]">
                      <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">{t('quest5.growth')}</span>
                      </div>
                      <p className="font-display font-bold text-lg text-[var(--success)]">
                        {selectedRole.growth_rate || 'N/A'}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-[var(--background-tertiary)]">
                      <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
                        <Award className="w-4 h-4" />
                        <span className="text-sm">Education</span>
                      </div>
                      <p className="font-medium text-sm">
                        {selectedRole.education_requirements || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Required Skills */}
                  {selectedRole.required_skills && selectedRole.required_skills.length > 0 && (
                    <div>
                      <h3 className="font-display font-semibold mb-3">{t('quest5.skills')}</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRole.required_skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 rounded-full text-sm bg-[var(--primary-muted)] text-[var(--primary)]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Briefcase className="w-12 h-12 text-[var(--foreground-subtle)] mx-auto mb-4" />
                  <p className="text-[var(--foreground-muted)]">
                    Select a role to explore details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        {exploredRoles.size > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Roles Explored</p>
                <p className="font-display font-bold text-xl">{exploredRoles.size}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[var(--foreground-muted)]">XP Earned</p>
                <p className="font-display font-bold text-xl text-[var(--accent)]">+{totalXPEarned}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="ghost" onClick={() => router.push('/quest/4')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('navigation.back')}
          </Button>

          <Button
            onClick={handleContinue}
            disabled={exploredRoles.size < 2}
            className={exploredRoles.size >= 2 ? 'glow-primary' : ''}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {t('navigation.continue')}
          </Button>
        </div>
      </div>
    </div>
  );
}
