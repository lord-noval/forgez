'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
  Trophy,
  Users,
  Calendar,
  Gift,
  Filter,
  Search,
  Zap,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useXPStore } from '@/stores/xp-store';

interface Hackathon {
  id: string;
  slug: string;
  title: string;
  description: string;
  prize_amount: string;
  prize_type: string;
  team_size_min: number;
  team_size_max: number;
  start_date: string;
  end_date: string;
  skills_tested: string[];
  status: 'upcoming' | 'active' | 'completed';
  sponsor_company?: {
    id: string;
    name: string;
    logo_url: string;
  };
}

type FilterStatus = 'all' | 'upcoming' | 'active' | 'completed';

export default function HackathonsListPage() {
  const t = useTranslations('quest');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [joinedHackathons, setJoinedHackathons] = useState<Set<string>>(new Set());

  const { awardXP } = useXPStore();

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/hackathons');
      const data = await response.json();
      setHackathons(data.data || []);
    } catch (error) {
      console.error('Failed to fetch hackathons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinHackathon = (hackathon: Hackathon, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!joinedHackathons.has(hackathon.id)) {
      setJoinedHackathons((prev) => new Set(prev).add(hackathon.id));
      awardXP(50, 'hackathon_join', hackathon.id, `Joined ${hackathon.title}`);
    }
  };

  const getStatusBadge = (status: Hackathon['status']) => {
    switch (status) {
      case 'upcoming':
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-[var(--warning-muted)] text-[var(--warning)]">
            {t('quest8.hackathons.upcoming')}
          </span>
        );
      case 'active':
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-[var(--success-muted)] text-[var(--success)]">
            {t('quest8.hackathons.active')}
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-[var(--foreground-muted)] text-[var(--foreground)]">
            {t('quest8.hackathons.completed')}
          </span>
        );
    }
  };

  const filteredHackathons = hackathons.filter((hackathon) => {
    const statusMatch = filterStatus === 'all' || hackathon.status === filterStatus;
    const searchMatch = searchQuery === '' ||
      hackathon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hackathon.description.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
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
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.push('/quest/8')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('navigation.back')}
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display gradient-text-fire mb-2">
            {t('quest8.tabs.hackathons')}
          </h1>
          <p className="text-lg text-[var(--foreground-muted)]">
            {t('quest8.hackathons.browseAll', { count: hackathons.length })}
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Search hackathons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--foreground-muted)]" />
            {(['all', 'upcoming', 'active', 'completed'] as FilterStatus[]).map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status)}
              >
                {status === 'all' ? 'All' : t(`quest8.hackathons.${status}`)}
              </Button>
            ))}
          </div>
        </div>

        {/* Hackathons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHackathons.map((hackathon, index) => {
            const isJoined = joinedHackathons.has(hackathon.id);

            return (
              <motion.div
                key={hackathon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={cn(
                    'p-6 h-full flex flex-col cursor-pointer transition-all',
                    'border-[var(--border)] bg-[var(--background-secondary)]',
                    'hover:border-[var(--primary)] hover:shadow-lg',
                    isJoined && 'border-[var(--success)]'
                  )}
                  onClick={() => router.push(`/quest/8/hackathons/${hackathon.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {hackathon.sponsor_company?.logo_url ? (
                        <img
                          src={hackathon.sponsor_company.logo_url}
                          alt={hackathon.sponsor_company.name}
                          className="w-10 h-10 rounded-lg object-contain bg-white p-1"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-[var(--primary)]" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-display font-semibold line-clamp-1">
                          {hackathon.title}
                        </h3>
                        {hackathon.sponsor_company && (
                          <p className="text-xs text-[var(--foreground-muted)]">
                            {t('quest8.hackathons.sponsoredBy', { company: hackathon.sponsor_company.name })}
                          </p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(hackathon.status)}
                  </div>

                  <p className="text-sm text-[var(--foreground-muted)] mb-4 flex-1 line-clamp-2">
                    {hackathon.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-[var(--achievement)]" />
                      <span>{hackathon.prize_amount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[var(--primary)]" />
                      <span>{hackathon.team_size_min}-{hackathon.team_size_max} members</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Calendar className="w-4 h-4 text-[var(--foreground-muted)]" />
                      <span className="text-xs">
                        {new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  {hackathon.skills_tested && hackathon.skills_tested.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {hackathon.skills_tested.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded text-xs bg-[var(--background-tertiary)] text-[var(--foreground-muted)]"
                        >
                          {skill}
                        </span>
                      ))}
                      {hackathon.skills_tested.length > 3 && (
                        <span className="px-2 py-0.5 rounded text-xs text-[var(--foreground-muted)]">
                          +{hackathon.skills_tested.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={(e) => handleJoinHackathon(hackathon, e)}
                    disabled={hackathon.status === 'completed'}
                    className={cn('w-full', isJoined && 'bg-[var(--success)]')}
                  >
                    {isJoined ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t('quest8.hackathons.joined')}
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        {t('quest8.hackathons.join')}
                        <span className="ml-2 text-[var(--accent)]">+50 XP</span>
                      </>
                    )}
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredHackathons.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-[var(--foreground-muted)] mx-auto mb-4" />
            <p className="text-[var(--foreground-muted)]">
              {searchQuery
                ? 'No hackathons match your search.'
                : t('quest8.hackathons.empty')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
