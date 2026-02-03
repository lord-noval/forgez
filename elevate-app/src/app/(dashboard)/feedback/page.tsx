'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FeedbackGallery } from '@/components/feedback';
import { useFeedbackStore } from '@/stores/feedback-store';
import { useWorldLabelsI18n } from '@/i18n/use-world-labels';
import { useTranslations } from 'next-intl';

export default function FeedbackPage() {
  const labels = useWorldLabelsI18n();
  const t = useTranslations('feedback');
  const {
    requests,
    setRequests,
    isLoading,
    setLoading,
    error,
    setError,
  } = useFeedbackStore();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/feedback/requests');
        if (!response.ok) {
          throw new Error('Failed to fetch feedback requests');
        }
        const { requests: fetchedRequests } = await response.json();
        setRequests(fetchedRequests);
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError(err instanceof Error ? err.message : 'Failed to load requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [setRequests, setLoading, setError]);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display">{labels.feedback}</h1>
          <p className="text-[var(--foreground-muted)]">
            {t('subtitle')}
          </p>
        </div>
        <Link href="/feedback/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            {t('actions.newRequest')}
          </Button>
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : error ? (
        <Card className="p-12 text-center bg-[var(--background-secondary)] border-[var(--border)]">
          <p className="text-[var(--danger)] mb-4">{error}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            {t('errors.tryAgain')}
          </Button>
        </Card>
      ) : (
        <FeedbackGallery requests={requests} isLoading={isLoading} />
      )}
    </div>
  );
}
