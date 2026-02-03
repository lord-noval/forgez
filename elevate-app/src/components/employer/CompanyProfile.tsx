'use client';

import { motion } from 'framer-motion';
import {
  Building2,
  MapPin,
  Users,
  Calendar,
  Globe,
  ExternalLink,
  CheckCircle,
  Linkedin,
  Twitter,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Company, JobPosting } from '@/lib/supabase/types';

interface CompanyProfileProps {
  company: Company;
  jobCount?: number;
  className?: string;
}

const companySizeLabels: Record<string, string> = {
  STARTUP: '1-10 employees',
  SMALL: '11-50 employees',
  MEDIUM: '51-200 employees',
  LARGE: '201-1000 employees',
  ENTERPRISE: '1000+ employees',
};

export function CompanyProfile({ company, jobCount = 0, className }: CompanyProfileProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden bg-[var(--background-secondary)] border-[var(--border)]',
        className
      )}
    >
      {/* Header Banner */}
      <div className="h-32 bg-gradient-to-r from-[var(--primary)] to-[var(--achievement)]" />

      {/* Company Info */}
      <div className="p-6 -mt-12">
        <div className="flex items-end gap-4 mb-6">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              className="w-24 h-24 rounded-xl object-cover border-4 border-[var(--background-secondary)] bg-[var(--background)]"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-[var(--background)] border-4 border-[var(--background-secondary)] flex items-center justify-center">
              <Building2 className="w-12 h-12 text-[var(--primary)]" />
            </div>
          )}

          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold font-display">{company.name}</h2>
              {company.is_verified && (
                <CheckCircle className="w-5 h-5 text-[var(--success)]" />
              )}
            </div>
            {company.industry && (
              <p className="text-[var(--foreground-muted)]">{company.industry}</p>
            )}
          </div>

          <div className="flex gap-2 pb-2">
            {company.website_url && (
              <Button variant="secondary" size="sm" asChild>
                <a
                  href={company.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-1"
                >
                  <Globe className="w-4 h-4" />
                  Website
                </a>
              </Button>
            )}
            <Button size="sm">Follow</Button>
          </div>
        </div>

        {/* Description */}
        {company.description && (
          <p className="text-[var(--foreground-muted)] mb-6">{company.description}</p>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {company.headquarters_location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-[var(--foreground-muted)]" />
              <span>{company.headquarters_location}</span>
            </div>
          )}
          {company.company_size && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-[var(--foreground-muted)]" />
              <span>{companySizeLabels[company.company_size] || company.company_size}</span>
            </div>
          )}
          {company.founded_year && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-[var(--foreground-muted)]" />
              <span>Founded {company.founded_year}</span>
            </div>
          )}
          {jobCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4 text-[var(--foreground-muted)]" />
              <span>{jobCount} open position{jobCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Culture */}
        {company.culture_values && Object.keys(company.culture_values).length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Culture & Values</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(company.culture_values).map((value) => (
                <Badge key={value} variant="secondary">
                  {value}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Benefits */}
        {company.benefits && Object.keys(company.benefits).length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Benefits & Perks</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(company.benefits).map((benefit) => (
                <Badge key={benefit} variant="secondary">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* LinkedIn */}
        {company.linkedin_url && (
          <div className="pt-4 border-t border-[var(--border)]">
            <h3 className="font-semibold mb-3">Connect</h3>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" asChild>
                <a
                  href={company.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
