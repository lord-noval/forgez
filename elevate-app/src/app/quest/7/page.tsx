'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  Clock,
  Award,
  ExternalLink,
  Star,
  Flame,
  GitBranch,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useQuestStore } from '@/stores/quest-store';
import { useXPStore } from '@/stores/xp-store';
import { SkillTree, type SkillCategory, type Skill } from '@/components/skill-forge/SkillTree';
import { ProgressWidget, type CourseProgress } from '@/components/skill-forge/ProgressWidget';

interface LearningResource {
  id: string;
  title: string;
  provider: string;
  description: string;
  url: string;
  affiliate_url: string;
  duration: string;
  level: string;
  industry: string;
  rating: number;
  price: string;
  certificate_offered: boolean;
  estimated_hours: number;
}

export default function Quest7Page() {
  const t = useTranslations('quest');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [startedCourses, setStartedCourses] = useState<Set<string>>(new Set());
  const [totalXPEarned, setTotalXPEarned] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'tree'>('grid');

  const { startQuest, completeQuest, getQuestStatus } = useQuestStore();
  const { awardXP } = useXPStore();

  useEffect(() => {
    const status = getQuestStatus(7);

    if (status === 'available') {
      startQuest(7);
    }

    if (status === 'locked') {
      router.push('/quest/6');
      return;
    }

    fetchResources();
  }, [getQuestStatus, startQuest, router]);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/learn/recommendations');
      const data = await response.json();
      setResources(data.recommendations || []);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCourse = (resource: LearningResource) => {
    if (!startedCourses.has(resource.id)) {
      setStartedCourses((prev) => new Set(prev).add(resource.id));
      awardXP(25, 'course_start', resource.id, `Started ${resource.title}`);
      setTotalXPEarned((prev) => prev + 25);
    }

    // Open course URL
    const url = resource.affiliate_url || resource.url;
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleContinue = () => {
    completeQuest(7, totalXPEarned);
    router.push('/quest/8');
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
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display gradient-text-fire mb-2">
            {t('quest7.title')}
          </h1>
          <p className="text-lg text-[var(--foreground-muted)]">
            {t('quest7.subtitle')}
          </p>
        </motion.div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-end gap-2 mb-6">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'tree' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('tree')}
          >
            <GitBranch className="w-4 h-4 mr-2" />
            Skill Tree
          </Button>
        </div>

        {/* Progress Widget */}
        {startedCourses.size > 0 && viewMode === 'grid' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <ProgressWidget
              pathName="Your Learning Path"
              completionPercentage={Math.round((startedCourses.size / Math.max(resources.length, 1)) * 100)}
              courses={resources.map((r): CourseProgress => ({
                id: r.id,
                title: r.title,
                status: startedCourses.has(r.id) ? 'completed' : startedCourses.size === 0 ? 'current' : 'locked',
                duration: r.estimated_hours ? `${r.estimated_hours}h` : undefined,
              }))}
              totalHours={resources.reduce((sum, r) => sum + (r.estimated_hours || 0), 0)}
              onCourseClick={(course) => {
                const resource = resources.find(r => r.id === course.id);
                if (resource) handleStartCourse(resource);
              }}
            />
          </motion.div>
        )}

        {/* Skill Tree View */}
        {viewMode === 'tree' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <SkillTree
              categories={[
                {
                  id: 'fundamentals',
                  name: 'Fundamentals',
                  skills: resources.slice(0, 3).map((r, i): Skill => ({
                    id: r.id,
                    name: r.title,
                    level: startedCourses.has(r.id) ? 'mastered' : i === 0 ? 'in-progress' : 'locked',
                    category: 'fundamentals',
                    xpRequired: 100,
                    xpCurrent: startedCourses.has(r.id) ? 100 : 25,
                  })),
                },
                {
                  id: 'intermediate',
                  name: 'Intermediate',
                  skills: resources.slice(3, 6).map((r): Skill => ({
                    id: r.id,
                    name: r.title,
                    level: startedCourses.has(r.id) ? 'mastered' : 'locked',
                    category: 'intermediate',
                    prerequisites: ['Complete Fundamentals'],
                  })),
                },
                {
                  id: 'advanced',
                  name: 'Advanced',
                  skills: resources.slice(6).map((r): Skill => ({
                    id: r.id,
                    name: r.title,
                    level: startedCourses.has(r.id) ? 'mastered' : 'locked',
                    category: 'advanced',
                    prerequisites: ['Complete Intermediate'],
                  })),
                },
              ].filter(cat => cat.skills.length > 0)}
              onSkillClick={(skill) => {
                const resource = resources.find(r => r.id === skill.id);
                if (resource) handleStartCourse(resource);
              }}
            />
          </motion.div>
        )}

        {/* Course Grid */}
        {viewMode === 'grid' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, index) => {
            const isStarted = startedCourses.has(resource.id);

            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={cn(
                    'p-5 h-full flex flex-col transition-all',
                    'border-[var(--border)] bg-[var(--background-secondary)]',
                    'hover:border-[var(--primary)] hover:shadow-lg',
                    isStarted && 'border-[var(--success)]'
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs text-[var(--foreground-muted)] uppercase tracking-wide">
                      {resource.provider}
                    </span>
                    {resource.certificate_offered && (
                      <Award className="w-4 h-4 text-[var(--achievement)]" />
                    )}
                  </div>

                  <h3 className="font-display font-semibold text-lg mb-2 line-clamp-2">
                    {resource.title}
                  </h3>

                  <p className="text-sm text-[var(--foreground-muted)] mb-4 flex-1 line-clamp-3">
                    {resource.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-[var(--foreground-muted)] mb-4">
                    {resource.estimated_hours && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{t('quest7.estimatedTime', { hours: resource.estimated_hours })}</span>
                      </div>
                    )}
                    {resource.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-[var(--achievement)]" />
                        <span>{resource.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Level & Price */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-xs',
                        resource.level === 'Beginner' && 'bg-[var(--success-muted)] text-[var(--success)]',
                        resource.level === 'Intermediate' && 'bg-[var(--warning-muted)] text-[var(--warning)]',
                        resource.level === 'Advanced' && 'bg-[var(--primary-muted)] text-[var(--primary)]'
                      )}
                    >
                      {resource.level}
                    </span>
                    {resource.price && (
                      <span className="text-sm font-medium">{resource.price}</span>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleStartCourse(resource)}
                    className={cn('w-full', isStarted && 'bg-[var(--success)]')}
                  >
                    {isStarted ? (
                      <>
                        {t('quest7.viewCourse')}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        {t('quest7.startCourse')}
                        <span className="ml-2 text-[var(--accent)]">+25 XP</span>
                      </>
                    )}
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </div>
        )}

        {resources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--foreground-muted)]">No learning resources available yet.</p>
          </div>
        )}

        {/* Progress */}
        {startedCourses.size > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Courses Started</p>
                <p className="font-display font-bold text-xl">{startedCourses.size}</p>
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
          <Button variant="ghost" onClick={() => router.push('/quest/6')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('navigation.back')}
          </Button>

          <Button
            onClick={handleContinue}
            disabled={startedCourses.size < 1}
            className={startedCourses.size >= 1 ? 'glow-primary' : ''}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {t('navigation.continue')}
          </Button>
        </div>
      </div>
    </div>
  );
}
