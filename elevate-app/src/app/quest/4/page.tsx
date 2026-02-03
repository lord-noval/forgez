'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  MapPin,
  Globe,
  Users,
  ExternalLink,
  Building2,
  Map,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useQuestStore } from '@/stores/quest-store';
import { useXPStore } from '@/stores/xp-store';
import { RegionMap, type Region } from '@/components/guilds/RegionMap';

interface Company {
  id: string;
  slug: string;
  name: string;
  country: string;
  city: string;
  industry: string;
  description: string;
  mission: string;
  employee_count: string;
  funding_stage: string;
  logo_url: string;
  website_url: string;
  culture_tags: string[];
  is_featured: boolean;
}

const regions = ['all', 'Poland', 'Germany', 'Ukraine', 'USA'] as const;
const industries = ['all', 'space', 'energy', 'robotics', 'defense'] as const;

export default function Quest4Page() {
  const t = useTranslations('quest');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [viewedCompanies, setViewedCompanies] = useState<Set<string>>(new Set());
  const [totalXPEarned, setTotalXPEarned] = useState(0);
  const [showMap, setShowMap] = useState(true);

  const { startQuest, completeQuest, getQuestStatus } = useQuestStore();
  const { awardXP } = useXPStore();

  useEffect(() => {
    const status = getQuestStatus(4);

    if (status === 'available') {
      startQuest(4);
    }

    if (status === 'locked') {
      router.push('/quest/3');
      return;
    }

    fetchCompanies();
  }, [getQuestStatus, startQuest, router]);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/companies');
      const data = await response.json();
      setCompanies(data.data || []);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCompany = (company: Company) => {
    if (!viewedCompanies.has(company.id)) {
      setViewedCompanies((prev) => new Set(prev).add(company.id));
      awardXP(10, 'company_view', company.id, `Explored ${company.name}`);
      setTotalXPEarned((prev) => prev + 10);
    }
  };

  const handleContinue = () => {
    completeQuest(4, totalXPEarned);
    router.push('/quest/5');
  };

  const filteredCompanies = companies.filter((company) => {
    const regionMatch = selectedRegion === 'all' || company.country === selectedRegion;
    const industryMatch = selectedIndustry === 'all' || company.industry === selectedIndustry;
    return regionMatch && industryMatch;
  });

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
            {t('quest4.title')}
          </h1>
          <p className="text-lg text-[var(--foreground-muted)]">
            {t('quest4.subtitle')}
          </p>
        </motion.div>

        {/* Region Map */}
        {showMap && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold flex items-center gap-2">
                <Map className="w-5 h-5 text-[var(--primary)]" />
                Explore Regions
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMap(false)}
              >
                Hide Map
              </Button>
            </div>
            <RegionMap
              regions={[
                { id: 'Poland', name: t('quest4.regions.poland'), flag: '🇵🇱', companyCount: companies.filter(c => c.country === 'Poland').length, position: { x: 52, y: 35 } },
                { id: 'Germany', name: t('quest4.regions.germany'), flag: '🇩🇪', companyCount: companies.filter(c => c.country === 'Germany').length, position: { x: 45, y: 38 } },
                { id: 'Ukraine', name: t('quest4.regions.ukraine'), flag: '🇺🇦', companyCount: companies.filter(c => c.country === 'Ukraine').length, position: { x: 58, y: 40 } },
                { id: 'USA', name: t('quest4.regions.usa'), flag: '🇺🇸', companyCount: companies.filter(c => c.country === 'USA').length, position: { x: 18, y: 45 } },
              ]}
              selectedRegion={selectedRegion}
              onRegionSelect={(region) => setSelectedRegion(region)}
            />
          </motion.div>
        )}

        {!showMap && (
          <div className="mb-4">
            <Button variant="ghost" size="sm" onClick={() => setShowMap(true)}>
              <Map className="w-4 h-4 mr-2" />
              Show Map
            </Button>
          </div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          {/* Region Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Globe className="w-4 h-4 text-[var(--foreground-muted)]" />
            {regions.map((region) => (
              <Button
                key={region}
                variant={selectedRegion === region ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRegion(region)}
              >
                {region === 'all' ? 'All Regions' : t(`quest4.regions.${region.toLowerCase()}`)}
              </Button>
            ))}
          </div>

          {/* Industry Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Building2 className="w-4 h-4 text-[var(--foreground-muted)]" />
            {industries.map((industry) => (
              <Button
                key={industry}
                variant={selectedIndustry === industry ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedIndustry(industry)}
              >
                {t(`quest4.filters.${industry}`)}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Companies Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company, index) => {
            const isViewed = viewedCompanies.has(company.id);

            return (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={cn(
                    'p-5 h-full cursor-pointer transition-all',
                    'border-[var(--border)] bg-[var(--background-secondary)]',
                    'hover:border-[var(--primary)] hover:shadow-lg',
                    isViewed && 'border-[var(--success)]'
                  )}
                  onClick={() => handleViewCompany(company)}
                >
                  <div className="flex items-start gap-4">
                    {company.logo_url ? (
                      <img
                        src={company.logo_url}
                        alt={company.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-[var(--primary)]" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold truncate">{company.name}</h3>
                        {company.is_featured && (
                          <span className="px-2 py-0.5 rounded text-xs bg-[var(--achievement-muted)] text-[var(--achievement)]">
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] mt-1">
                        <MapPin className="w-3 h-3" />
                        {company.city}, {company.country}
                      </div>
                    </div>

                    {isViewed && (
                      <span className="text-[var(--success)] text-xs">+10 XP</span>
                    )}
                  </div>

                  <p className="text-sm text-[var(--foreground-muted)] mt-4 line-clamp-2">
                    {company.description}
                  </p>

                  {company.culture_tags && company.culture_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-4">
                      {company.culture_tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded text-xs bg-[var(--background-tertiary)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
                    <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                      <Users className="w-3 h-3" />
                      {company.employee_count || 'N/A'}
                    </div>

                    {company.website_url && (
                      <a
                        href={company.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--primary)] hover:underline text-sm flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Visit <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--foreground-muted)]">No companies found for the selected filters.</p>
          </div>
        )}

        {/* Progress */}
        {viewedCompanies.size > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Companies Explored</p>
                <p className="font-display font-bold text-xl">{viewedCompanies.size}</p>
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
          <Button variant="ghost" onClick={() => router.push('/quest/3')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('navigation.back')}
          </Button>

          <Button
            onClick={handleContinue}
            disabled={viewedCompanies.size < 3}
            className={viewedCompanies.size >= 3 ? 'glow-primary' : ''}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {t('navigation.continue')}
          </Button>
        </div>
      </div>
    </div>
  );
}
