'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Target,
  Calendar,
  ChevronRight,
  Lock,
  Globe,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import type { TeamWithMembers } from '@/lib/supabase/types';
import { formatDistanceToNow } from 'date-fns';

interface TeamCardProps {
  team: TeamWithMembers;
  showJoinButton?: boolean;
  onJoin?: () => void;
  className?: string;
}

export function TeamCard({
  team,
  showJoinButton = false,
  onJoin,
  className,
}: TeamCardProps) {
  const memberCount = team.members?.length || 0;
  const leader = team.members?.find((m) => m.role === 'LEADER');

  return (
    <Link href={`/teams/${team.id}`}>
      <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
        <Card
          className={cn(
            'p-6 bg-[var(--background-secondary)] border-[var(--border)]',
            'hover:border-[var(--primary)] hover:shadow-lg hover:shadow-[var(--primary-muted)]',
            'transition-all cursor-pointer',
            className
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg">{team.name}</h3>
                {team.is_public ? (
                  <Globe className="w-4 h-4 text-[var(--foreground-muted)]" />
                ) : (
                  <Lock className="w-4 h-4 text-[var(--foreground-muted)]" />
                )}
              </div>

              {/* Description */}
              {team.description && (
                <p className="text-sm text-[var(--foreground-muted)] line-clamp-2 mb-3">
                  {team.description}
                </p>
              )}

              {/* Purpose badge */}
              {team.purpose && (
                <Badge variant="secondary" className="mb-3">
                  {team.purpose}
                </Badge>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-[var(--foreground-muted)]">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>
                    {memberCount}/{team.max_members} members
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Created{' '}
                    {formatDistanceToNow(new Date(team.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>

              {/* Members preview */}
              {team.members && team.members.length > 0 && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="flex -space-x-2">
                    {team.members.slice(0, 5).map((member) => (
                      <div
                        key={member.id}
                        className="relative"
                        title={member.user?.username || 'Team member'}
                      >
                        {member.user?.avatar_url ? (
                          <img
                            src={member.user.avatar_url}
                            alt=""
                            className="w-8 h-8 rounded-full border-2 border-[var(--background-secondary)]"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[var(--primary-muted)] flex items-center justify-center border-2 border-[var(--background-secondary)]">
                            <span className="text-xs font-medium text-[var(--primary)]">
                              {member.user?.username?.[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                        {member.role === 'LEADER' && (
                          <Crown className="absolute -top-1 -right-1 w-3 h-3 text-[var(--warning)]" />
                        )}
                      </div>
                    ))}
                  </div>
                  {team.members.length > 5 && (
                    <span className="text-xs text-[var(--foreground-muted)]">
                      +{team.members.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>

            <ChevronRight className="w-5 h-5 text-[var(--foreground-muted)] flex-shrink-0" />
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}
