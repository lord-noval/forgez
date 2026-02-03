'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  Plus,
  Code2,
  FileText,
  Video,
  Headphones,
  Palette,
  Box,
  Presentation,
  Award,
  File,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectCard } from './ProjectCard';
import { useProjectsStore } from '@/stores/projects-store';
import { useWorldLabelsI18n } from '@/i18n/use-world-labels';
import type { Project, ProjectType } from '@/lib/supabase/types';
import Link from 'next/link';

interface ProjectGalleryProps {
  projects?: Project[];
  isLoading?: boolean;
  showCreateButton?: boolean;
  showFilters?: boolean;
  showSearch?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function ProjectGallery({
  projects: externalProjects,
  isLoading: externalLoading,
  showCreateButton = true,
  showFilters = true,
  showSearch = true,
  emptyMessage,
  className,
}: ProjectGalleryProps) {
  const { projects: storeProjects, isLoading: storeLoading } = useProjectsStore();
  const labels = useWorldLabelsI18n();
  const t = useTranslations('portfolio');
  const tCommon = useTranslations('common');

  const projects = externalProjects ?? storeProjects;
  const isLoading = externalLoading ?? storeLoading;

  const projectTypeFilters: { type: ProjectType; label: string; icon: typeof Code2 }[] = [
    { type: 'CODE', label: t('types.code'), icon: Code2 },
    { type: 'DOCUMENT', label: t('types.document'), icon: FileText },
    { type: 'VIDEO', label: t('types.video'), icon: Video },
    { type: 'AUDIO', label: t('types.audio'), icon: Headphones },
    { type: 'DESIGN', label: t('types.design'), icon: Palette },
    { type: 'MODEL_3D', label: t('types.model3d'), icon: Box },
    { type: 'PRESENTATION', label: t('types.presentation'), icon: Presentation },
    { type: 'CERTIFICATION', label: t('types.certification'), icon: Award },
    { type: 'OTHER', label: t('types.other'), icon: File },
  ];

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<ProjectType[]>([]);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = project.title.toLowerCase().includes(query);
      const matchesDescription = project.description?.toLowerCase().includes(query);
      const matchesTags = project.tags?.some((tag) =>
        tag.toLowerCase().includes(query)
      );
      if (!matchesTitle && !matchesDescription && !matchesTags) {
        return false;
      }
    }

    // Type filter
    if (selectedTypes.length > 0 && !selectedTypes.includes(project.project_type)) {
      return false;
    }

    return true;
  });

  const toggleTypeFilter = (type: ProjectType) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
  };

  const hasActiveFilters = searchQuery || selectedTypes.length > 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">{labels.portfolio}</h1>
          <p className="text-[var(--foreground-muted)]">
            {t('projectsCount', { count: filteredProjects.length })}
          </p>
        </div>

        {showCreateButton && (
          <Link href="/portfolio/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {t('actions.newProject')}
            </Button>
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {showSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
              <Input
                placeholder={t('gallery.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <div className="flex gap-2">
            {showFilters && (
              <Button
                variant={showFiltersPanel ? 'default' : 'secondary'}
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {tCommon('buttons.filter')}
                {selectedTypes.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedTypes.length}
                  </Badge>
                )}
              </Button>
            )}

            <div className="flex border border-[var(--border)] rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-[var(--primary)] text-white'
                    : 'hover:bg-[var(--background-tertiary)]'
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'list'
                    ? 'bg-[var(--primary)] text-white'
                    : 'hover:bg-[var(--background-tertiary)]'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      <AnimatePresence>
        {showFiltersPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card className="p-4 bg-[var(--background-secondary)] border-[var(--border)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">{t('project.type')}</span>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[var(--primary)] hover:underline"
                  >
                    {tCommon('buttons.reset')}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {projectTypeFilters.map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => toggleTypeFilter(type)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                      selectedTypes.includes(type)
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--background-tertiary)] hover:bg-[var(--border)]'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isLoading && (
        <div className={cn(
          'gap-4',
          viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'
        )}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card
              key={i}
              className="p-6 bg-[var(--background-secondary)] border-[var(--border)]"
            >
              <div className="skeleton h-12 w-12 rounded-lg mb-4" />
              <div className="skeleton h-6 w-3/4 mb-2" />
              <div className="skeleton h-4 w-1/2 mb-4" />
              <div className="skeleton h-4 w-full" />
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredProjects.length === 0 && (
        <Card className="p-12 text-center bg-[var(--background-secondary)] border-[var(--border)]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--primary-muted)] flex items-center justify-center">
            <File className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {hasActiveFilters ? t('empty.noResults') : t('empty.noProjects')}
          </h3>
          <p className="text-[var(--foreground-muted)] mb-4 max-w-md mx-auto">
            {hasActiveFilters
              ? t('empty.noResults')
              : emptyMessage || t('empty.startCreating')}
          </p>
          {hasActiveFilters ? (
            <Button variant="secondary" onClick={clearFilters}>
              {tCommon('buttons.reset')}
            </Button>
          ) : (
            showCreateButton && (
              <Link href="/portfolio/new">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t('actions.newProject')}
                </Button>
              </Link>
            )
          )}
        </Card>
      )}

      {/* Projects Grid/List */}
      {!isLoading && filteredProjects.length > 0 && (
        <motion.div
          layout
          className={cn(
            'gap-4',
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'space-y-4'
          )}
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <ProjectCard
                  project={project as any}
                  compact={viewMode === 'list'}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
