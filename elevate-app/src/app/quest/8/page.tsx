'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Trophy,
  Users,
  MessageCircle,
  Calendar,
  Gift,
  ExternalLink,
  Upload,
  Star,
  Zap,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useQuestStore } from '@/stores/quest-store';
import { useXPStore } from '@/stores/xp-store';
import { checkAchievements, incrementAchievementProgress } from '@/stores/achievements-store';

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

interface DiscordGuild {
  id: string;
  name: string;
  invite_url: string;
  industry: string;
  member_count: number;
  description: string;
}

type TabType = 'hackathons' | 'community' | 'portfolio';

export default function Quest8Page() {
  const t = useTranslations('quest');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('hackathons');
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [discordGuilds, setDiscordGuilds] = useState<DiscordGuild[]>([]);
  const [joinedHackathons, setJoinedHackathons] = useState<Set<string>>(new Set());
  const [joinedGuilds, setJoinedGuilds] = useState<Set<string>>(new Set());
  const [totalXPEarned, setTotalXPEarned] = useState(0);

  const { startQuest, completeQuest, getQuestStatus } = useQuestStore();
  const { awardXP } = useXPStore();

  useEffect(() => {
    const status = getQuestStatus(8);

    if (status === 'available') {
      startQuest(8);
    }

    if (status === 'locked') {
      router.push('/quest/7');
      return;
    }

    fetchData();
  }, [getQuestStatus, startQuest, router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [hackathonsRes, guildsRes] = await Promise.all([
        fetch('/api/hackathons'),
        fetch('/api/discord-guilds'),
      ]);

      const hackathonsData = await hackathonsRes.json();
      const guildsData = await guildsRes.json();

      setHackathons(hackathonsData.data || []);
      setDiscordGuilds(guildsData.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinHackathon = (hackathon: Hackathon) => {
    if (!joinedHackathons.has(hackathon.id)) {
      setJoinedHackathons((prev) => new Set(prev).add(hackathon.id));
      awardXP(50, 'hackathon_join', hackathon.id, `Joined ${hackathon.title}`);
      setTotalXPEarned((prev) => prev + 50);

      // Check for hackathon achievements
      const newCount = joinedHackathons.size + 1;
      incrementAchievementProgress('hackathon_join', 1);
      const unlocks = checkAchievements('hackathon_join', { hackathonsJoined: newCount });
      unlocks.forEach((unlock) => {
        awardXP(
          unlock.xpAwarded,
          'hackathon_join',
          unlock.achievement.id,
          `Achievement: ${unlock.achievement.name}`
        );
      });
    }
  };

  const handleJoinGuild = (guild: DiscordGuild) => {
    if (!joinedGuilds.has(guild.id)) {
      setJoinedGuilds((prev) => new Set(prev).add(guild.id));
      awardXP(25, 'guild_join', guild.id, `Joined ${guild.name}`);
      setTotalXPEarned((prev) => prev + 25);

      // Check for guild achievements
      const newCount = joinedGuilds.size + 1;
      incrementAchievementProgress('guild_join', 1);
      const unlocks = checkAchievements('guild_join', { guildsJoined: newCount });
      unlocks.forEach((unlock) => {
        awardXP(
          unlock.xpAwarded,
          'guild_join',
          unlock.achievement.id,
          `Achievement: ${unlock.achievement.name}`
        );
      });
    }

    // Open Discord invite
    if (guild.invite_url) {
      window.open(guild.invite_url, '_blank');
    }
  };

  const handleCompleteQuest = () => {
    completeQuest(8, totalXPEarned);
    router.push('/dashboard');
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

  const tabs = [
    { id: 'hackathons' as TabType, label: t('quest8.tabs.hackathons'), icon: Trophy },
    { id: 'community' as TabType, label: t('quest8.tabs.community'), icon: MessageCircle },
    { id: 'portfolio' as TabType, label: t('quest8.tabs.portfolio'), icon: Upload },
  ];

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
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display gradient-text-fire mb-2">
            {t('quest8.title')}
          </h1>
          <p className="text-lg text-[var(--foreground-muted)]">
            {t('quest8.subtitle')}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'gap-2',
                activeTab === tab.id && 'glow-primary'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Hackathons Tab */}
          {activeTab === 'hackathons' && (
            <motion.div
              key="hackathons"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="grid md:grid-cols-2 gap-6">
                {hackathons.map((hackathon, index) => {
                  const isJoined = joinedHackathons.has(hackathon.id);

                  return (
                    <motion.div
                      key={hackathon.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className={cn(
                          'p-6 h-full flex flex-col transition-all',
                          'border-[var(--border)] bg-[var(--background-secondary)]',
                          'hover:border-[var(--primary)] hover:shadow-lg',
                          isJoined && 'border-[var(--success)]'
                        )}
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
                              <h3 className="font-display font-semibold">
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

                        <p className="text-sm text-[var(--foreground-muted)] mb-4 flex-1">
                          {hackathon.description}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Gift className="w-4 h-4 text-[var(--achievement)]" />
                            <span>{hackathon.prize_amount}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-[var(--primary)]" />
                            <span>
                              {hackathon.team_size_min}-{hackathon.team_size_max} {t('quest8.hackathons.members')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm col-span-2">
                            <Calendar className="w-4 h-4 text-[var(--foreground-muted)]" />
                            <span>
                              {new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Skills */}
                        {hackathon.skills_tested && hackathon.skills_tested.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {hackathon.skills_tested.slice(0, 4).map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-0.5 rounded text-xs bg-[var(--background-tertiary)] text-[var(--foreground-muted)]"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        <Button
                          onClick={() => handleJoinHackathon(hackathon)}
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

              {hackathons.length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-[var(--foreground-muted)] mx-auto mb-4" />
                  <p className="text-[var(--foreground-muted)]">
                    {t('quest8.hackathons.empty')}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Community Tab */}
          {activeTab === 'community' && (
            <motion.div
              key="community"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {discordGuilds.map((guild, index) => {
                  const isJoined = joinedGuilds.has(guild.id);

                  return (
                    <motion.div
                      key={guild.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={cn(
                          'p-4 h-full flex flex-col transition-all cursor-pointer',
                          'border-[var(--border)] bg-[var(--background-secondary)]',
                          'hover:border-[var(--primary)] hover:shadow-lg',
                          isJoined && 'border-[var(--success)]'
                        )}
                        onClick={() => handleJoinGuild(guild)}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">
                              {guild.name}
                            </h3>
                            <p className="text-xs text-[var(--foreground-muted)]">
                              {guild.member_count.toLocaleString()} {t('quest8.community.members')}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-[var(--foreground-muted)] mb-3 flex-1 line-clamp-2">
                          {guild.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs px-2 py-0.5 rounded bg-[var(--primary-muted)] text-[var(--primary)]">
                            {guild.industry}
                          </span>
                          {isJoined ? (
                            <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                          ) : (
                            <span className="text-xs text-[var(--accent)]">+25 XP</span>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {discordGuilds.length === 0 && (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-[var(--foreground-muted)] mx-auto mb-4" />
                  <p className="text-[var(--foreground-muted)]">
                    {t('quest8.community.empty')}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-8 bg-[var(--background-secondary)] border-[var(--border)] text-center">
                <div className="w-20 h-20 rounded-full bg-[var(--primary-muted)] flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-10 h-10 text-[var(--primary)]" />
                </div>

                <h2 className="text-2xl font-display font-bold mb-4">
                  {t('quest8.portfolio.title')}
                </h2>

                <p className="text-[var(--foreground-muted)] mb-6 max-w-md mx-auto">
                  {t('quest8.portfolio.description')}
                </p>

                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-[var(--background-tertiary)]">
                    <Upload className="w-6 h-6 text-[var(--primary)] mx-auto mb-2" />
                    <p className="font-medium">{t('quest8.portfolio.upload')}</p>
                    <p className="text-xs text-[var(--accent)]">+100 XP</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--background-tertiary)]">
                    <Star className="w-6 h-6 text-[var(--achievement)] mx-auto mb-2" />
                    <p className="font-medium">{t('quest8.portfolio.review')}</p>
                    <p className="text-xs text-[var(--accent)]">+50 XP</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--background-tertiary)]">
                    <Trophy className="w-6 h-6 text-[var(--warning)] mx-auto mb-2" />
                    <p className="font-medium">{t('quest8.portfolio.submit')}</p>
                    <p className="text-xs text-[var(--accent)]">+200 XP</p>
                  </div>
                </div>

                <Button
                  onClick={() => router.push('/portfolio')}
                  className="glow-primary"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {t('quest8.portfolio.goToPortfolio')}
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Summary */}
        {(joinedHackathons.size > 0 || joinedGuilds.size > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-6">
                <div>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {t('quest8.progress.hackathons')}
                  </p>
                  <p className="font-display font-bold text-xl">{joinedHackathons.size}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {t('quest8.progress.guilds')}
                  </p>
                  <p className="font-display font-bold text-xl">{joinedGuilds.size}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-[var(--foreground-muted)]">
                  {t('quest8.progress.xpEarned')}
                </p>
                <p className="font-display font-bold text-xl text-[var(--accent)]">
                  +{totalXPEarned}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="ghost" onClick={() => router.push('/quest/7')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('navigation.back')}
          </Button>

          <Button
            onClick={handleCompleteQuest}
            disabled={joinedHackathons.size < 1 && joinedGuilds.size < 1}
            className={
              joinedHackathons.size >= 1 || joinedGuilds.size >= 1 ? 'glow-primary' : ''
            }
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {t('quest8.complete')}
          </Button>
        </div>
      </div>
    </div>
  );
}
