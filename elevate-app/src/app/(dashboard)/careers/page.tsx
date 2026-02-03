'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Search,
  Filter,
  Briefcase,
  Globe,
  Sparkles,
  ChevronDown,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JobCard } from '@/components/employer';
import { useWorldLabelsI18n } from '@/i18n/use-world-labels';
import type { JobPostingWithCompany, EmploymentType, Company } from '@/lib/supabase/types';

// Helper to create mock company
function createMockCompany(id: string, name: string, industry: string, size: Company['company_size'], location: string): Company {
  return {
    id,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    logo_url: null,
    cover_image_url: null,
    description: `${name} - ${industry} company`,
    website_url: `https://${name.toLowerCase().replace(/\s+/g, '')}.example.com`,
    linkedin_url: null,
    industry,
    company_size: size,
    founded_year: 2015,
    headquarters_location: location,
    culture_values: null,
    benefits: null,
    tech_stack: null,
    is_verified: true,
    is_active: true,
    subscription_tier: 'free',
    subscription_expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// Helper to create mock job
function createMockJob(
  id: string,
  companyId: string,
  title: string,
  description: string,
  location: string,
  isRemote: boolean,
  employmentType: EmploymentType,
  salaryMin: number,
  salaryMax: number,
  company: Company
): JobPostingWithCompany {
  return {
    id,
    company_id: companyId,
    title,
    description,
    requirements: null,
    responsibilities: null,
    employment_type: employmentType,
    location,
    is_remote: isRemote,
    remote_policy: null,
    salary_min: salaryMin,
    salary_max: salaryMax,
    salary_currency: 'EUR',
    required_skills: null,
    preferred_skills: null,
    experience_level: null,
    education_level: null,
    status: 'ACTIVE',
    application_url: null,
    application_email: null,
    view_count: 0,
    application_count: 0,
    posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: null,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company,
  };
}

// Mock data for demonstration
const mockJobs: JobPostingWithCompany[] = [
  createMockJob(
    '1',
    'c1',
    'Senior Frontend Developer',
    'We are looking for a skilled frontend developer to join our team and help build the next generation of our product.',
    'Berlin, Germany',
    true,
    'FULL_TIME',
    70000,
    95000,
    createMockCompany('c1', 'TechCorp Innovation', 'Technology', 'MEDIUM', 'Berlin, Germany')
  ),
  createMockJob(
    '2',
    'c2',
    'UX Designer',
    'Join our design team to create beautiful and intuitive user experiences for our global platform.',
    'Amsterdam, Netherlands',
    true,
    'FULL_TIME',
    55000,
    75000,
    createMockCompany('c2', 'DesignHub', 'Design', 'SMALL', 'Amsterdam, Netherlands')
  ),
  createMockJob(
    '3',
    'c3',
    'Data Science Intern',
    'Great opportunity for students or recent graduates to gain hands-on experience in data science and machine learning.',
    'Munich, Germany',
    false,
    'INTERNSHIP',
    1500,
    2000,
    createMockCompany('c3', 'DataMinds', 'AI/ML', 'STARTUP', 'Munich, Germany')
  ),
];

export default function CareersPage() {
  const labels = useWorldLabelsI18n();
  const t = useTranslations('careers');
  const tCommon = useTranslations('common');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<EmploymentType[]>([]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [jobs] = useState<JobPostingWithCompany[]>(mockJobs);
  const [isLoading] = useState(false);

  const employmentTypes: { value: EmploymentType; label: string }[] = [
    { value: 'FULL_TIME', label: t('types.fullTime') },
    { value: 'PART_TIME', label: t('types.partTime') },
    { value: 'CONTRACT', label: t('types.contract') },
    { value: 'INTERNSHIP', label: t('types.internship') },
    { value: 'FREELANCE', label: t('types.freelance') },
    { value: 'APPRENTICESHIP', label: t('types.internship') },
  ];

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchQuery === '' ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedTypes.length === 0 || selectedTypes.includes(job.employment_type);

    const matchesRemote = !remoteOnly || job.is_remote;

    return matchesSearch && matchesType && matchesRemote;
  });

  const toggleEmploymentType = (type: EmploymentType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setRemoteOnly(false);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedTypes.length > 0 || remoteOnly || searchQuery !== '';

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display mb-2">{labels.careers}</h1>
        <p className="text-[var(--foreground-muted)]">
          {t('subtitle')}
        </p>
      </div>

      {/* AI Match Banner */}
      <Card className="p-4 mb-6 bg-gradient-to-r from-[var(--primary-muted)] to-[var(--achievement-muted)] border-[var(--primary)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--background)] flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{t('aiMatching.title')}</h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              {t('aiMatching.description')}
            </p>
          </div>
          <Button variant="secondary" className="gap-2">
            <Sparkles className="w-4 h-4" />
            {t('aiMatching.viewMatches')}
          </Button>
        </div>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
            <Input
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="secondary"
            className={cn('gap-2', showFilters && 'bg-[var(--primary-muted)]')}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            {tCommon('buttons.filter')}
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {selectedTypes.length + (remoteOnly ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4 bg-[var(--background-secondary)] border-[var(--border)]">
              <div className="flex flex-wrap gap-4">
                {/* Employment Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('filters.employmentType')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {employmentTypes.map((type) => (
                      <Badge
                        key={type.value}
                        variant={
                          selectedTypes.includes(type.value)
                            ? 'default'
                            : 'secondary'
                        }
                        className="cursor-pointer"
                        onClick={() => toggleEmploymentType(type.value)}
                      >
                        {type.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Remote Toggle */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('filters.workLocation')}
                  </label>
                  <Badge
                    variant={remoteOnly ? 'default' : 'secondary'}
                    className="cursor-pointer gap-1"
                    onClick={() => setRemoteOnly(!remoteOnly)}
                  >
                    <Globe className="w-3 h-3" />
                    {t('filters.remoteOnly')}
                  </Badge>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-[var(--foreground-muted)]"
                      onClick={clearFilters}
                    >
                      <X className="w-3 h-3" />
                      {t('filters.clearAll')}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--foreground-muted)]">
          {t('results.jobsFound', { count: filteredJobs.length })}
        </p>
      </div>

      {/* Job Listings */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="p-6 bg-[var(--background-secondary)] border-[var(--border)] animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-[var(--primary-muted)]" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-48 bg-[var(--primary-muted)] rounded" />
                  <div className="h-4 w-32 bg-[var(--primary-muted)] rounded" />
                  <div className="h-4 w-full bg-[var(--primary-muted)] rounded" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card className="p-12 text-center bg-[var(--background-secondary)] border-[var(--border)]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--primary-muted)] flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t('empty.noJobs')}</h3>
          <p className="text-[var(--foreground-muted)] mb-4 max-w-md mx-auto">
            {hasActiveFilters
              ? t('empty.noJobs')
              : t('empty.startExploring')}
          </p>
          {hasActiveFilters && (
            <Button variant="secondary" onClick={clearFilters}>
              {t('filters.clearAll')}
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <JobCard job={job} matchScore={85 - index * 10} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Load More */}
      {filteredJobs.length > 0 && filteredJobs.length >= 10 && (
        <div className="mt-8 text-center">
          <Button variant="secondary" className="gap-2">
            {t('results.loadMore')}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
