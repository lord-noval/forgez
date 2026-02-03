'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Clock,
  Users,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useTranslations } from 'next-intl';
import type { FeedbackStatus, FeedbackRequestWithRespondents } from '@/lib/supabase/types';

const statusIcons: Record<FeedbackStatus, typeof CheckCircle2> = {
  PENDING: Timer,
  IN_PROGRESS: Clock,
  COMPLETED: CheckCircle2,
  EXPIRED: AlertCircle,
  DECLINED: AlertCircle,
};

const statusColors: Record<FeedbackStatus, string> = {
  PENDING: 'var(--warning)',
  IN_PROGRESS: 'var(--primary)',
  COMPLETED: 'var(--success)',
  EXPIRED: 'var(--foreground-muted)',
  DECLINED: 'var(--danger)',
};

interface FeedbackCardProps {
  request: FeedbackRequestWithRespondents;
  index?: number;
}

export function FeedbackCard({ request, index = 0 }: FeedbackCardProps) {
  const t = useTranslations('feedback');
  const isExpired = new Date(request.expires_at) < new Date();
  const effectiveStatus = isExpired && request.status !== 'COMPLETED' ? 'EXPIRED' : request.status;
  const StatusIcon = statusIcons[effectiveStatus];
  const statusColor = statusColors[effectiveStatus];

  const responseCount = request.respondents?.filter(
    (r) => r.status === 'COMPLETED' || (r.responses && r.responses.length > 0)
  ).length || 0;
  const totalRespondents = request.respondents?.length || 0;
  const progress = totalRespondents > 0 ? (responseCount / totalRespondents) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/feedback/${request.id}`}>
        <Card
          className={cn(
            'p-6 bg-[var(--background-secondary)] border-[var(--border)]',
            'hover:border-[var(--primary)] transition-all cursor-pointer'
          )}
          hover
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg truncate">{request.title}</h3>
                <Badge
                  variant="secondary"
                  className="flex-shrink-0 gap-1"
                  style={{
                    borderColor: statusColor,
                    color: statusColor,
                  }}
                >
                  <StatusIcon className="w-3 h-3" />
                  {t(`status.${effectiveStatus}`)}
                </Badge>
              </div>

              {request.context && (
                <p className="text-sm text-[var(--foreground-muted)] line-clamp-2 mb-3">
                  {request.context}
                </p>
              )}

              {/* Progress bar */}
              <div className="mb-3">
                <div className="h-1.5 rounded-full bg-[var(--background-tertiary)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--primary)] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-[var(--foreground-muted)]">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>
                    {t('card.responses', { count: responseCount, total: totalRespondents })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {isExpired
                      ? t('card.expired')
                      : t('card.expires', { time: formatDistanceToNow(new Date(request.expires_at), { addSuffix: true }) })}
                  </span>
                </div>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-[var(--foreground-muted)] flex-shrink-0" />
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
