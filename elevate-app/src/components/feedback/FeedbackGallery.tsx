'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MessageCircle,
  Filter,
  LayoutGrid,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FeedbackCard } from './FeedbackCard';
import { useTranslations } from 'next-intl';
import type { FeedbackStatus, FeedbackRequestWithRespondents } from '@/lib/supabase/types';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | FeedbackStatus;

interface FeedbackGalleryProps {
  requests: FeedbackRequestWithRespondents[];
  isLoading?: boolean;
}

export function FeedbackGallery({ requests, isLoading }: FeedbackGalleryProps) {
  const t = useTranslations('feedback');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  // Status filters with translations
  const statusFilters: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: t('status.all') },
    { value: 'PENDING', label: t('status.PENDING') },
    { value: 'IN_PROGRESS', label: t('status.IN_PROGRESS') },
    { value: 'COMPLETED', label: t('status.COMPLETED') },
    { value: 'EXPIRED', label: t('status.EXPIRED') },
  ];

  const filteredRequests = requests.filter((request) => {
    if (statusFilter === 'all') return true;

    // Check if expired
    const isExpired = new Date(request.expires_at) < new Date();
    if (statusFilter === 'EXPIRED') {
      return isExpired && request.status !== 'COMPLETED';
    }

    return request.status === statusFilter && !isExpired;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'PENDING').length,
    inProgress: requests.filter((r) => r.status === 'IN_PROGRESS').length,
    completed: requests.filter((r) => r.status === 'COMPLETED').length,
  };

  if (requests.length === 0 && !isLoading) {
    return (
      <Card className="p-12 text-center bg-[var(--background-secondary)] border-[var(--border)]">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--primary-muted)] flex items-center justify-center">
          <MessageCircle className="w-8 h-8 text-[var(--primary)]" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{t('empty.noRequests')}</h3>
        <p className="text-[var(--foreground-muted)] mb-4 max-w-md mx-auto">
          {t('empty.noRequestsDesc')}
        </p>
        <Link href="/feedback/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            {t('gallery.createRequest')}
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-[var(--background-secondary)] border-[var(--border)]">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-[var(--foreground-muted)]">{t('gallery.totalRequests')}</p>
        </Card>
        <Card className="p-4 bg-[var(--background-secondary)] border-[var(--border)]">
          <p className="text-2xl font-bold text-[var(--warning)]">{stats.pending}</p>
          <p className="text-sm text-[var(--foreground-muted)]">{t('gallery.pending')}</p>
        </Card>
        <Card className="p-4 bg-[var(--background-secondary)] border-[var(--border)]">
          <p className="text-2xl font-bold text-[var(--primary)]">{stats.inProgress}</p>
          <p className="text-sm text-[var(--foreground-muted)]">{t('gallery.inProgress')}</p>
        </Card>
        <Card className="p-4 bg-[var(--background-secondary)] border-[var(--border)]">
          <p className="text-2xl font-bold text-[var(--success)]">{stats.completed}</p>
          <p className="text-sm text-[var(--foreground-muted)]">{t('gallery.completed')}</p>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Filter className="w-4 h-4 text-[var(--foreground-muted)] flex-shrink-0" />
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-full transition-colors whitespace-nowrap',
                statusFilter === filter.value
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--background-tertiary)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'list'
                ? 'bg-[var(--primary-muted)] text-[var(--primary)]'
                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            )}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'grid'
                ? 'bg-[var(--primary-muted)] text-[var(--primary)]'
                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Request List */}
      <AnimatePresence mode="popLayout">
        {filteredRequests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="p-8 text-center bg-[var(--background-secondary)] border-[var(--border)]">
              <p className="text-[var(--foreground-muted)]">
                {t('gallery.noMatchingFilter')}
              </p>
            </Card>
          </motion.div>
        ) : (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                : 'space-y-4'
            )}
          >
            {filteredRequests.map((request, index) => (
              <FeedbackCard
                key={request.id}
                request={request}
                index={index}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
