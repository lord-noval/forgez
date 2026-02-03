'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Code2,
  FileText,
  Video,
  Headphones,
  Palette,
  Box,
  Presentation,
  Award,
  File,
  Eye,
  Calendar,
  ChevronRight,
  Sparkles,
  Lock,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Project, ProjectType } from '@/lib/supabase/types';
import { formatDistanceToNow } from 'date-fns';

const projectTypeIcons: Record<ProjectType, typeof Code2> = {
  CODE: Code2,
  DOCUMENT: FileText,
  VIDEO: Video,
  AUDIO: Headphones,
  DESIGN: Palette,
  MODEL_3D: Box,
  PRESENTATION: Presentation,
  CERTIFICATION: Award,
  OTHER: File,
};

const projectTypeLabels: Record<ProjectType, string> = {
  CODE: 'Code',
  DOCUMENT: 'Document',
  VIDEO: 'Video',
  AUDIO: 'Audio',
  DESIGN: 'Design',
  MODEL_3D: '3D Model',
  PRESENTATION: 'Presentation',
  CERTIFICATION: 'Certification',
  OTHER: 'Other',
};

interface ProjectCardProps {
  project: Project & {
    artifact_count?: { count: number }[];
    skill_count?: { count: number }[];
    user?: {
      id: string;
      username: string | null;
      avatar_url: string | null;
      headline: string | null;
    };
  };
  showUser?: boolean;
  compact?: boolean;
  className?: string;
}

export function ProjectCard({
  project,
  showUser = false,
  compact = false,
  className,
}: ProjectCardProps) {
  const TypeIcon = projectTypeIcons[project.project_type];
  const typeLabel = projectTypeLabels[project.project_type];
  const artifactCount = project.artifact_count?.[0]?.count || 0;
  const skillCount = project.skill_count?.[0]?.count || 0;

  const content = (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300',
        'bg-[var(--background-secondary)] border-[var(--border)]',
        'hover:border-[var(--primary)] hover:shadow-lg hover:shadow-[var(--primary-muted)]',
        compact ? 'p-4' : 'p-6',
        className
      )}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-muted)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex items-center justify-center rounded-lg',
                'bg-[var(--primary-muted)] text-[var(--primary)]',
                compact ? 'w-10 h-10' : 'w-12 h-12'
              )}
            >
              <TypeIcon className={compact ? 'w-5 h-5' : 'w-6 h-6'} />
            </div>
            <div>
              <h3
                className={cn(
                  'font-semibold font-display line-clamp-1 group-hover:text-[var(--primary)] transition-colors',
                  compact ? 'text-base' : 'text-lg'
                )}
              >
                {project.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                <span>{typeLabel}</span>
                {project.visibility === 'private' && (
                  <Lock className="w-3 h-3" />
                )}
                {project.visibility === 'public' && (
                  <Globe className="w-3 h-3" />
                )}
              </div>
            </div>
          </div>

          {project.is_featured && (
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" />
              Featured
            </Badge>
          )}
        </div>

        {/* Description */}
        {!compact && project.description && (
          <p className="text-[var(--foreground-muted)] text-sm line-clamp-2 mb-4">
            {project.description}
          </p>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.tags.slice(0, compact ? 3 : 5).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs bg-[var(--background-tertiary)]"
              >
                {tag}
              </Badge>
            ))}
            {project.tags.length > (compact ? 3 : 5) && (
              <Badge
                variant="secondary"
                className="text-xs bg-[var(--background-tertiary)]"
              >
                +{project.tags.length - (compact ? 3 : 5)}
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-[var(--foreground-muted)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <File className="w-4 h-4" />
              <span>{artifactCount} files</span>
            </div>
            {skillCount > 0 && (
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                <span>{skillCount} skills</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{project.view_count}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDistanceToNow(new Date(project.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        {/* User info */}
        {showUser && project.user && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border)]">
            {project.user.avatar_url ? (
              <img
                src={project.user.avatar_url}
                alt={project.user.username || 'User'}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[var(--primary-muted)] flex items-center justify-center">
                <span className="text-xs font-medium text-[var(--primary)]">
                  {project.user.username?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            <span className="text-sm text-[var(--foreground-muted)]">
              {project.user.username || 'Anonymous'}
            </span>
          </div>
        )}

        {/* Arrow indicator */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-5 h-5 text-[var(--primary)]" />
        </div>
      </div>
    </Card>
  );

  return (
    <Link href={`/portfolio/${project.id}`}>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        {content}
      </motion.div>
    </Link>
  );
}
