'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Briefcase,
  Globe,
  Users,
  Calendar,
  ExternalLink,
  Bookmark,
  Share2,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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

// Mock data - in real app, fetch from API
const mockJob: JobPostingWithCompany = {
  id: '1',
  company_id: 'c1',
  title: 'Senior Frontend Developer',
  description: `We are looking for a skilled frontend developer to join our team and help build the next generation of our product.

## About the Role

You will be working on our core platform, building new features and improving existing ones. You'll collaborate closely with designers, backend engineers, and product managers to deliver exceptional user experiences.

## Responsibilities

- Build and maintain high-quality web applications using React and TypeScript
- Collaborate with designers to implement pixel-perfect UIs
- Write clean, maintainable, and well-tested code
- Participate in code reviews and technical discussions
- Mentor junior developers and share knowledge with the team

## Requirements

- 5+ years of experience in frontend development
- Strong proficiency in React, TypeScript, and modern CSS
- Experience with state management solutions (Redux, Zustand, etc.)
- Familiarity with testing frameworks (Jest, React Testing Library)
- Excellent communication and collaboration skills

## Nice to Have

- Experience with Next.js or similar frameworks
- Knowledge of accessibility best practices
- Background in design systems
- Open source contributions`,
  requirements: null,
  responsibilities: null,
  location: 'Berlin, Germany',
  is_remote: true,
  remote_policy: 'Hybrid',
  employment_type: 'FULL_TIME',
  salary_min: 70000,
  salary_max: 95000,
  salary_currency: 'EUR',
  required_skills: { skills: ['react', 'typescript', 'css', 'git'] },
  preferred_skills: { skills: ['nextjs', 'testing', 'accessibility'] },
  experience_level: 'Senior',
  education_level: null,
  status: 'ACTIVE',
  application_url: null,
  application_email: null,
  posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  expires_at: null,
  view_count: 234,
  application_count: 18,
  created_by: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  company: {
    id: 'c1',
    name: 'TechCorp Innovation',
    slug: 'techcorp-innovation',
    logo_url: null,
    cover_image_url: null,
    description: 'TechCorp Innovation is a leading technology company building the future of digital experiences. We believe in creating products that make a real difference in people\'s lives.',
    website_url: 'https://techcorp.example.com',
    linkedin_url: 'https://linkedin.com/company/techcorp',
    industry: 'Technology',
    company_size: 'MEDIUM',
    founded_year: 2015,
    headquarters_location: 'Berlin, Germany',
    culture_values: { description: 'We foster a culture of innovation, collaboration, and continuous learning. Our team is diverse, inclusive, and passionate about building great products.' },
    benefits: { items: ['Health Insurance', 'Remote Work', 'Learning Budget', 'Stock Options', 'Flexible Hours'] },
    tech_stack: ['React', 'TypeScript', 'Node.js'],
    is_verified: true,
    is_active: true,
    subscription_tier: 'pro',
    subscription_expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<JobPostingWithCompany | null>(mockJob);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const formatSalary = () => {
    if (!job?.salary_min && !job?.salary_max) return null;
    const currency = job?.salary_currency || 'EUR';
    const formatter = new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    });
    const min = job?.salary_min ? formatter.format(job.salary_min) : '';
    const max = job?.salary_max ? formatter.format(job.salary_max) : '';
    if (min && max) return `${min} - ${max}`;
    return min || max;
  };

  const handleApply = () => {
    // In real app, open application modal or redirect
    setHasApplied(true);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: job?.title,
        text: `Check out this job: ${job?.title} at ${job?.company?.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-[var(--primary-muted)] rounded" />
          <div className="h-64 bg-[var(--primary-muted)] rounded" />
          <div className="h-96 bg-[var(--primary-muted)] rounded" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <Card className="p-12 text-center bg-[var(--background-secondary)] border-[var(--border)]">
          <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
          <p className="text-[var(--foreground-muted)] mb-4">
            This job posting may have been removed or is no longer available.
          </p>
          <Button onClick={() => router.push('/careers')}>Browse Jobs</Button>
        </Card>
      </div>
    );
  }

  const salary = formatSalary();

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/careers"
        className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
            <div className="flex items-start gap-4">
              {job.company?.logo_url ? (
                <img
                  src={job.company.logo_url}
                  alt={job.company.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-[var(--primary)]" />
                </div>
              )}

              <div className="flex-1">
                <h1 className="text-2xl font-bold font-display mb-1">{job.title}</h1>
                <p className="text-lg text-[var(--foreground-muted)]">
                  {job.company?.name}
                  {job.company?.is_verified && (
                    <CheckCircle className="w-4 h-4 text-[var(--success)] inline ml-1" />
                  )}
                </p>

                <div className="flex flex-wrap gap-3 mt-4 text-sm text-[var(--foreground-muted)]">
                  {job.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  {job.is_remote && (
                    <Badge variant="secondary" className="gap-1">
                      <Globe className="w-3 h-3" />
                      Remote
                    </Badge>
                  )}
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{employmentTypeLabels[job.employment_type]}</span>
                  </div>
                  {salary && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{salary}/year</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Match Score */}
            <div className="mt-4 p-3 rounded-lg bg-[var(--success-muted)] border border-[var(--success)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--success)]" />
                <span className="font-medium text-[var(--success)]">85% Match</span>
                <span className="text-sm text-[var(--foreground-muted)]">
                  Based on your skills profile
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                className="flex-1 gap-2"
                onClick={handleApply}
                disabled={hasApplied}
              >
                {hasApplied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Applied
                  </>
                ) : (
                  'Apply Now'
                )}
              </Button>
              <Button
                variant="default"
                className={cn(isSaved && 'bg-[var(--primary-muted)]')}
                onClick={handleSave}
              >
                <Bookmark
                  className={cn('w-4 h-4', isSaved && 'fill-current')}
                />
              </Button>
              <Button variant="default" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* Job Description */}
          <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
            <h2 className="text-lg font-semibold mb-4">About the Role</h2>
            <div className="prose prose-invert max-w-none">
              {job.description.split('\n').map((paragraph, i) => {
                if (paragraph.startsWith('## ')) {
                  return (
                    <h3 key={i} className="text-base font-semibold mt-6 mb-3">
                      {paragraph.replace('## ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('- ')) {
                  return (
                    <li key={i} className="text-[var(--foreground-muted)] ml-4">
                      {paragraph.replace('- ', '')}
                    </li>
                  );
                }
                if (paragraph.trim()) {
                  return (
                    <p key={i} className="text-[var(--foreground-muted)] mb-3">
                      {paragraph}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          </Card>

          {/* Required Skills */}
          {job.required_skills && (job.required_skills as { skills?: string[] }).skills && (job.required_skills as { skills?: string[] }).skills!.length > 0 && (
            <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
              <h2 className="text-lg font-semibold mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {((job.required_skills as { skills?: string[] }).skills || []).map((skill) => (
                  <Badge key={skill} variant="default" className="capitalize">
                    {skill}
                  </Badge>
                ))}
              </div>

              {job.preferred_skills && (job.preferred_skills as { skills?: string[] }).skills && (job.preferred_skills as { skills?: string[] }).skills!.length > 0 && (
                <>
                  <h3 className="text-base font-medium mt-6 mb-3">Nice to Have</h3>
                  <div className="flex flex-wrap gap-2">
                    {((job.preferred_skills as { skills?: string[] }).skills || []).map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="capitalize"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Info */}
          <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
            <h2 className="text-lg font-semibold mb-4">About the Company</h2>

            <div className="space-y-4">
              <p className="text-sm text-[var(--foreground-muted)]">
                {job.company?.description}
              </p>

              <div className="space-y-2 text-sm">
                {job.company?.industry && (
                  <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
                    <Building2 className="w-4 h-4" />
                    <span>{job.company.industry}</span>
                  </div>
                )}
                {job.company?.company_size && (
                  <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
                    <Users className="w-4 h-4" />
                    <span className="capitalize">
                      {job.company.company_size.toLowerCase()} company
                    </span>
                  </div>
                )}
                {job.company?.founded_year && (
                  <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
                    <Calendar className="w-4 h-4" />
                    <span>Founded {job.company.founded_year}</span>
                  </div>
                )}
                {job.company?.headquarters_location && (
                  <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
                    <MapPin className="w-4 h-4" />
                    <span>{job.company.headquarters_location}</span>
                  </div>
                )}
              </div>

              {job.company?.website_url && (
                <a
                  href={job.company.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
                >
                  Visit Website
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </Card>

          {/* Benefits */}
          {job.company?.benefits && (job.company.benefits as { items?: string[] }).items && (job.company.benefits as { items?: string[] }).items!.length > 0 && (
            <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
              <h2 className="text-lg font-semibold mb-4">Benefits</h2>
              <div className="flex flex-wrap gap-2">
                {((job.company.benefits as { items?: string[] }).items || []).map((benefit) => (
                  <Badge key={benefit} variant="secondary">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Job Stats */}
          <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
            <h2 className="text-lg font-semibold mb-4">Job Stats</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Posted</span>
                <span>
                  {job.posted_at
                    ? formatDistanceToNow(new Date(job.posted_at), {
                        addSuffix: true,
                      })
                    : 'Recently'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Views</span>
                <span>{job.view_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Applications</span>
                <span>{job.application_count || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
