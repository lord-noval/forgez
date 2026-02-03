'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Filter,
  Download,
  Share2,
  TrendingUp,
  Award,
  Users,
  Sparkles,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SkillBadge, VerificationLegend } from './SkillBadge';
import { SkillProgressChart } from './SkillProgressChart';
import { AddSkillModal } from './AddSkillModal';
import { SkillDetailModal } from './SkillDetailModal';
import { useSkillsStore, useSkillStats, useTopSkills } from '@/stores/skills-store';
import { useWorldLabelsI18n } from '@/i18n/use-world-labels';
import { useTranslations } from 'next-intl';
import type {
  UserSkillWithTaxonomy,
  SkillCategory,
  SkillVerificationLevel,
} from '@/lib/supabase/types';

interface BankOfSkillsProps {
  className?: string;
}

export function BankOfSkills({ className }: BankOfSkillsProps) {
  const labels = useWorldLabelsI18n();
  const t = useTranslations('skills');
  const { userSkills, userSkillsLoading, selectedSkill, setSelectedSkill } = useSkillsStore();

  // Category labels from translations
  const categoryLabels: Record<SkillCategory, string> = {
    KNOWLEDGE: t('categories.KNOWLEDGE'),
    SKILL: t('categories.SKILL'),
    COMPETENCE: t('categories.COMPETENCE'),
    TRANSVERSAL: t('categories.TRANSVERSAL'),
    LANGUAGE: t('categories.LANGUAGE'),
  };
  const stats = useSkillStats();
  const topSkills = useTopSkills(5);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  const [selectedVerification, setSelectedVerification] = useState<SkillVerificationLevel | null>(null);

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Handle skill click to open detail modal
  const handleSkillClick = useCallback((skill: UserSkillWithTaxonomy) => {
    setSelectedSkill(skill);
    setDetailModalOpen(true);
  }, [setSelectedSkill]);

  // Export skills to CSV
  const handleExport = useCallback(() => {
    if (userSkills.length === 0) return;

    const headers = ['Skill Name', 'Category', 'Proficiency Level', 'Verification Level', 'Years Experience', 'Is Primary', 'Notes'];
    const rows = userSkills.map((skill) => [
      skill.skill.name,
      categoryLabels[skill.skill.category],
      skill.proficiency_level.toString(),
      skill.verification_level,
      skill.years_experience?.toString() || '',
      skill.is_primary ? 'Yes' : 'No',
      skill.notes || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `skills-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [userSkills]);

  // Filter skills
  const filteredSkills = useMemo(() => {
    return userSkills.filter((skill) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!skill.skill.name.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (selectedCategory && skill.skill.category !== selectedCategory) {
        return false;
      }
      if (selectedVerification && skill.verification_level !== selectedVerification) {
        return false;
      }
      return true;
    });
  }, [userSkills, searchQuery, selectedCategory, selectedVerification]);

  // Group skills by category
  const skillsByCategory = useMemo(() => {
    const grouped: Record<SkillCategory, UserSkillWithTaxonomy[]> = {
      KNOWLEDGE: [],
      SKILL: [],
      COMPETENCE: [],
      TRANSVERSAL: [],
      LANGUAGE: [],
    };

    filteredSkills.forEach((skill) => {
      grouped[skill.skill.category].push(skill);
    });

    return grouped;
  }, [filteredSkills]);

  // Chart data
  const chartData = useMemo(() => {
    const categories = Object.keys(skillsByCategory) as SkillCategory[];
    return categories.map((category) => {
      const skills = skillsByCategory[category];
      const avgLevel =
        skills.length > 0
          ? skills.reduce((acc, s) => acc + s.proficiency_level, 0) / skills.length
          : 0;
      return {
        category,
        value: Math.round(avgLevel * 10) / 10,
        maxValue: 7,
      };
    });
  }, [skillsByCategory]);

  const hasActiveFilters = searchQuery || selectedCategory || selectedVerification;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedVerification(null);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">{labels.skillsBank}</h1>
          <p className="text-[var(--foreground-muted)]">
            {t('subtitleCount', { count: stats.totalSkills })}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="gap-2"
            onClick={handleExport}
            disabled={userSkills.length === 0}
          >
            <Download className="w-4 h-4" />
            {t('actions.export')}
          </Button>
          <Button variant="secondary" className="gap-2">
            <Share2 className="w-4 h-4" />
            {t('actions.share')}
          </Button>
          <Button className="gap-2" onClick={() => setAddModalOpen(true)}>
            <Plus className="w-4 h-4" />
            {t('actions.addSkill')}
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-[var(--background-secondary)] border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalSkills}</p>
              <p className="text-sm text-[var(--foreground-muted)]">{t('bank.totalSkills')}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-[var(--background-secondary)] border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--success-muted)] flex items-center justify-center">
              <Award className="w-5 h-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.verifiedSkills}</p>
              <p className="text-sm text-[var(--foreground-muted)]">{t('bank.verifiedSkills')}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-[var(--background-secondary)] border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--secondary-muted)] flex items-center justify-center">
              <Users className="w-5 h-5 text-[var(--secondary)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalEndorsements}</p>
              <p className="text-sm text-[var(--foreground-muted)]">{t('bank.endorsements')}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-[var(--background-secondary)] border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--achievement-muted)] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[var(--achievement)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgProficiency.toFixed(1)}</p>
              <p className="text-sm text-[var(--foreground-muted)]">{t('bank.avgLevel')}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main skills list */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
              <Input
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCategory || ''}
                onChange={(e) =>
                  setSelectedCategory(
                    e.target.value ? (e.target.value as SkillCategory) : null
                  )
                }
                className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] text-sm"
              >
                <option value="">{t('search.allCategories')}</option>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  {t('actions.clear')}
                </Button>
              )}
            </div>
          </div>

          {/* Skills by category */}
          {userSkillsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="p-6 bg-[var(--background-secondary)] border-[var(--border)]"
                >
                  <div className="skeleton h-6 w-32 mb-4" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="skeleton h-8 w-24 rounded-full" />
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredSkills.length === 0 ? (
            <Card className="p-12 text-center bg-[var(--background-secondary)] border-[var(--border)]">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-[var(--foreground-muted)]" />
              <h3 className="text-lg font-semibold mb-2">
                {hasActiveFilters ? t('empty.noMatchingSkills') : t('empty.noSkills')}
              </h3>
              <p className="text-[var(--foreground-muted)] mb-4">
                {hasActiveFilters
                  ? t('empty.adjustFilters')
                  : t('empty.startAdding')}
              </p>
              {hasActiveFilters ? (
                <Button variant="secondary" onClick={clearFilters}>
                  {t('actions.clearFilters')}
                </Button>
              ) : (
                <Button className="gap-2" onClick={() => setAddModalOpen(true)}>
                  <Plus className="w-4 h-4" />
                  {t('actions.addFirstSkill')}
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {(Object.entries(skillsByCategory) as [SkillCategory, UserSkillWithTaxonomy[]][])
                .filter(([, skills]) => skills.length > 0)
                .map(([category, skills]) => (
                  <Card
                    key={category}
                    className="p-6 bg-[var(--background-secondary)] border-[var(--border)]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{categoryLabels[category]}</h3>
                      <Badge variant="secondary">{t('overview.skillsCount', { count: skills.length })}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <SkillBadge
                          key={skill.id}
                          name={skill.skill.name}
                          verificationLevel={skill.verification_level}
                          proficiencyLevel={skill.proficiency_level}
                          category={skill.skill.category}
                          showProficiency
                          onClick={() => handleSkillClick(skill)}
                        />
                      ))}
                    </div>
                  </Card>
                ))}
            </div>
          )}

          {/* Verification legend */}
          <Card className="p-4 bg-[var(--background-secondary)] border-[var(--border)]">
            <h4 className="text-sm font-medium mb-3">{t('overview.verificationLevels')}</h4>
            <VerificationLegend />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skills overview chart */}
          <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
            <h3 className="font-semibold mb-4">{t('overview.title')}</h3>
            <SkillProgressChart
              data={chartData}
              type="radar"
              showLabels
              showValues
            />
          </Card>

          {/* Top skills */}
          <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
            <h3 className="font-semibold mb-4">{t('overview.topSkills')}</h3>
            <div className="space-y-3">
              {topSkills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => handleSkillClick(skill)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-[var(--background-tertiary)] hover:bg-[var(--border)] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-[var(--primary)]">
                      L{skill.proficiency_level}
                    </div>
                    <div>
                      <p className="font-medium">{skill.skill.name}</p>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        {categoryLabels[skill.skill.category]}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--foreground-muted)]" />
                </button>
              ))}
            </div>
          </Card>

          {/* Bar chart */}
          <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
            <h3 className="font-semibold mb-4">{t('overview.categoryBreakdown')}</h3>
            <SkillProgressChart
              data={chartData}
              type="bar"
              showLabels
              showValues
            />
          </Card>
        </div>
      </div>

      {/* Add Skill Modal */}
      <AddSkillModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
      />

      {/* Skill Detail Modal */}
      <SkillDetailModal
        skill={selectedSkill}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </div>
  );
}
