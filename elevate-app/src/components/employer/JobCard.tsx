'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Briefcase,
  Globe,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { JobPostingWithCompany, EmploymentType } from '@/lib/supabase/types';
import { formatDistanceToNow } from 'date-fns';

const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
  APPRENTICESHIP: 'Apprenticeship',
};

interface JobCardProps {
  job: JobPostingWithCompany;
  matchScore?: number;
  className?: string;
}

export function JobCard({ job, matchScore, className }: JobCardProps) {
  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    const currency = job.salary_currency || 'EUR';
    const min = job.salary_min ? `${currency}${(job.salary_min / 1000).toFixed(0)}k` : '';
    const max = job.salary_max ? `${currency}${(job.salary_max / 1000).toFixed(0)}k` : '';
    if (min && max) return `${min} - ${max}`;
    return min || max;
  };

  const salary = formatSalary();

  return (
    <Link href={`/careers/jobs/${job.id}`}>
      <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
        <Card
          className={cn(
            'p-6 bg-[var(--background-secondary)] border-[var(--border)]',
            'hover:border-[var(--primary)] hover:shadow-lg hover:shadow-[var(--primary-muted)]',
            'transition-all cursor-pointer',
            className
          )}
        >
          <div className="flex items-start gap-4">
            {/* Company logo */}
            <div className="flex-shrink-0">
              {job.company?.logo_url ? (
                <img
                  src={job.company.logo_url}
                  alt={job.company.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-[var(--primary)]" />
                </div>
              )}
            </div>

            {/* Job details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">{job.title}</h3>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {job.company?.name || 'Company'}
                  </p>
                </div>

                {matchScore !== undefined && (
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-[var(--success-muted)] text-[var(--success)]"
                  >
                    <Sparkles className="w-3 h-3" />
                    {matchScore}% match
                  </Badge>
                )}
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-[var(--foreground-muted)]">
                {job.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.is_remote && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <span>Remote</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{employmentTypeLabels[job.employment_type]}</span>
                </div>
                {salary && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{salary}</span>
                  </div>
                )}
              </div>

              {/* Description preview */}
              {job.description && (
                <p className="text-sm text-[var(--foreground-muted)] line-clamp-2 mt-3">
                  {job.description}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
                <div className="flex items-center gap-1 text-xs text-[var(--foreground-muted)]">
                  <Clock className="w-3 h-3" />
                  <span>
                    Posted{' '}
                    {job.posted_at
                      ? formatDistanceToNow(new Date(job.posted_at), { addSuffix: true })
                      : 'recently'}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--foreground-muted)]" />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}
