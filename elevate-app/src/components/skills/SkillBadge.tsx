'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Users,
  FolderKanban,
  Brain,
  GraduationCap,
  Award,
  CircleDot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import type { SkillVerificationLevel, SkillCategory } from '@/lib/supabase/types';

const verificationIcons: Record<SkillVerificationLevel, typeof CheckCircle2> = {
  SELF_ASSESSED: CircleDot,
  PEER_ENDORSED: Users,
  PROJECT_VERIFIED: FolderKanban,
  AI_ANALYZED: Brain,
  ASSESSMENT_PASSED: GraduationCap,
  CERTIFICATION_VERIFIED: Award,
};

const verificationColors: Record<SkillVerificationLevel, string> = {
  SELF_ASSESSED: 'var(--foreground-muted)',
  PEER_ENDORSED: 'var(--secondary)',
  PROJECT_VERIFIED: 'var(--primary)',
  AI_ANALYZED: 'var(--achievement)',
  ASSESSMENT_PASSED: 'var(--success)',
  CERTIFICATION_VERIFIED: 'var(--warning)',
};

const verificationLevels: SkillVerificationLevel[] = [
  'SELF_ASSESSED',
  'PEER_ENDORSED',
  'PROJECT_VERIFIED',
  'AI_ANALYZED',
  'ASSESSMENT_PASSED',
  'CERTIFICATION_VERIFIED',
];

const categoryColors: Record<SkillCategory, string> = {
  KNOWLEDGE: '#3B82F6',
  SKILL: '#22C55E',
  COMPETENCE: '#8B5CF6',
  TRANSVERSAL: '#F97316',
  LANGUAGE: '#06B6D4',
};

interface SkillBadgeProps {
  name: string;
  verificationLevel: SkillVerificationLevel;
  proficiencyLevel?: number;
  category?: SkillCategory;
  confidenceScore?: number;
  showVerification?: boolean;
  showProficiency?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export function SkillBadge({
  name,
  verificationLevel,
  proficiencyLevel = 1,
  category,
  confidenceScore,
  showVerification = true,
  showProficiency = false,
  size = 'md',
  onClick,
  className,
}: SkillBadgeProps) {
  const VerificationIcon = verificationIcons[verificationLevel];
  const verificationColor = verificationColors[verificationLevel];

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border transition-all',
        'bg-[var(--background-secondary)] border-[var(--border)]',
        onClick && 'cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--background-tertiary)]',
        sizeClasses[size],
        className
      )}
      style={
        category
          ? { borderLeftColor: categoryColors[category], borderLeftWidth: '3px' }
          : undefined
      }
    >
      <span className="font-medium">{name}</span>

      {showProficiency && (
        <span className="text-[var(--foreground-muted)]">L{proficiencyLevel}</span>
      )}

      {showVerification && (
        <VerificationIcon
          className={cn(iconSizes[size])}
          style={{ color: verificationColor }}
        />
      )}

      {confidenceScore !== undefined && (
        <span
          className="text-xs px-1.5 py-0.5 rounded bg-[var(--background-tertiary)]"
          title="AI Confidence Score"
        >
          {Math.round(confidenceScore * 100)}%
        </span>
      )}
    </motion.button>
  );
}

// Verification legend component
export function VerificationLegend() {
  const t = useTranslations('skills');

  return (
    <div className="flex flex-wrap gap-3 text-sm">
      {verificationLevels.map((level) => {
        const Icon = verificationIcons[level];
        return (
          <div key={level} className="flex items-center gap-1.5">
            <Icon
              className="w-4 h-4"
              style={{ color: verificationColors[level] }}
            />
            <span className="text-[var(--foreground-muted)]">
              {t(`verification.${level}`)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
