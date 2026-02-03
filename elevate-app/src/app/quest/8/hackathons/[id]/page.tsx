'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
  Trophy,
  Users,
  Calendar,
  Gift,
  Clock,
  Target,
  Zap,
  CheckCircle,
  ExternalLink,
  UserPlus,
  Share2,
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
  registration_deadline?: string;
  skills_tested: string[];
  status: 'upcoming' | 'active' | 'completed';
  rules?: string;
  judging_criteria?: string[];
  sponsor_company?: {
    id: string;
    name: string;
    logo_url: string;
    website_url?: string;
  };
}

export default function HackathonDetailPage() {
  const t = useTranslations('quest');
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [isJoined, setIsJoined] = useState(false);

  const { awardXP } = useXPStore();

  useEffect(() => {
    if (params.id) {
      fetchHackathon(params.id as string);
    }
  }, [params.id]);

  const fetchHackathon = async (id: string) => {
    setIsLoading(true);
    try {
      // Try to get from the list first
      const response = await fetch('/api/hackathons');
      const data = await response.json();
      const found = (data.data || []).find((h: Hackathon) => h.id === id);
      if (found) {
        setHackathon(found);
      }
    } catch (error) {
      console.error('Failed to fetch hackathon:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = () => {
    if (!isJoined && hackathon) {
      setIsJoined(true);
      awardXP(50, 'hackathon_join', hackathon.id, `Joined ${hackathon.title}`);
    }
  };

  const getStatusBadge = (status: Hackathon['status']) => {
    switch (status) {
      case 'upcoming':
        return (
          <span className="px-3 py-1 rounded-full text-sm bg-[var(--warning-muted)] text-[var(--warning)]">
            {t('quest8.hackathons.upcoming')}
          </span>
        );
      case 'active':
        return (
          <span className="px-3 py-1 rounded-full text-sm bg-[var(--success-muted)] text-[var(--success)]">
            {t('quest8.hackathons.active')}
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-sm bg-[var(--foreground-muted)] text-[var(--foreground)]">
            {t('quest8.hackathons.completed')}
          </span>
        );
    }
  };

  const getDaysRemaining = () => {
    if (!hackathon) return null;
    const now = new Date();
    const start = new Date(hackathon.start_date);
    const end = new Date(hackathon.end_date);

    if (hackathon.status === 'upcoming') {
      const days = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return `Starts in ${days} day${days === 1 ? '' : 's'}`;
    } else if (hackathon.status === 'active') {
      const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return `${days} day${days === 1 ? '' : 's'} remaining`;
    }
    return 'Event ended';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Trophy className="w-12 h-12 text-[var(--foreground-muted)] mb-4" />
        <p className="text-[var(--foreground-muted)] mb-4">Hackathon not found</p>
        <Button onClick={() => router.push('/quest/8/hackathons')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to hackathons
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-20 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Button variant="ghost" onClick={() => router.push('/quest/8/hackathons')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('navigation.back')}
        </Button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start gap-4 mb-4">
            {hackathon.sponsor_company?.logo_url ? (
              <img
                src={hackathon.sponsor_company.logo_url}
                alt={hackathon.sponsor_company.name}
                className="w-16 h-16 rounded-xl object-contain bg-white p-2"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[var(--primary-muted)] flex items-center justify-center">
                <Trophy className="w-8 h-8 text-[var(--primary)]" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold font-display">
                  {hackathon.title}
                </h1>
                {getStatusBadge(hackathon.status)}
              </div>
              {hackathon.sponsor_company && (
                <p className="text-[var(--foreground-muted)]">
                  {t('quest8.hackathons.sponsoredBy', { company: hackathon.sponsor_company.name })}
                </p>
              )}
            </div>
          </div>

          {/* Time remaining badge */}
          <div className="flex items-center gap-2 text-[var(--primary)]">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{getDaysRemaining()}</span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
                <h2 className="font-display font-semibold text-lg mb-4">About</h2>
                <p className="text-[var(--foreground-muted)] whitespace-pre-line">
                  {hackathon.description}
                </p>
              </Card>
            </motion.div>

            {/* Skills Tested */}
            {hackathon.skills_tested && hackathon.skills_tested.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
                  <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-[var(--primary)]" />
                    Skills Tested
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {hackathon.skills_tested.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 rounded-full text-sm bg-[var(--primary-muted)] text-[var(--primary)]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Judging Criteria */}
            {hackathon.judging_criteria && hackathon.judging_criteria.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
                  <h2 className="font-display font-semibold text-lg mb-4">Judging Criteria</h2>
                  <ul className="space-y-2">
                    {hackathon.judging_criteria.map((criteria, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-[var(--success)] mt-0.5 shrink-0" />
                        <span className="text-[var(--foreground-muted)]">{criteria}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            )}

            {/* Rules */}
            {hackathon.rules && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
                  <h2 className="font-display font-semibold text-lg mb-4">Rules</h2>
                  <p className="text-[var(--foreground-muted)] whitespace-pre-line">
                    {hackathon.rules}
                  </p>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--achievement-muted)] flex items-center justify-center">
                      <Gift className="w-5 h-5 text-[var(--achievement)]" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--foreground-muted)]">Prize Pool</p>
                      <p className="font-display font-bold">{hackathon.prize_amount}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center">
                      <Users className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--foreground-muted)]">Team Size</p>
                      <p className="font-display font-bold">
                        {hackathon.team_size_min}-{hackathon.team_size_max} members
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--success-muted)] flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[var(--success)]" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--foreground-muted)]">Duration</p>
                      <p className="font-medium text-sm">
                        {new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <Button
                onClick={handleJoin}
                disabled={hackathon.status === 'completed' || isJoined}
                className={cn('w-full', isJoined ? 'bg-[var(--success)]' : 'glow-primary')}
                size="lg"
              >
                {isJoined ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {t('quest8.hackathons.joined')}
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    {t('quest8.hackathons.join')}
                    <span className="ml-2 text-[var(--accent)]">+50 XP</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/teams')}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Find Teammates
              </Button>

              <Button variant="ghost" className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Share Hackathon
              </Button>
            </motion.div>

            {/* Sponsor Info */}
            {hackathon.sponsor_company && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
                  <h3 className="font-display font-semibold mb-4">Sponsor</h3>
                  <div className="flex items-center gap-3">
                    {hackathon.sponsor_company.logo_url && (
                      <img
                        src={hackathon.sponsor_company.logo_url}
                        alt={hackathon.sponsor_company.name}
                        className="w-12 h-12 rounded-lg object-contain bg-white p-1"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{hackathon.sponsor_company.name}</p>
                    </div>
                  </div>
                  {hackathon.sponsor_company.website_url && (
                    <a
                      href={hackathon.sponsor_company.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
                    >
                      Visit website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
