'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FeedbackDetail } from '@/components/feedback';
import { useFeedbackStore } from '@/stores/feedback-store';
import { useWorldLabels } from '@/stores/world-store';
import type { FeedbackRequestWithRespondents } from '@/lib/supabase/types';

export default function FeedbackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.requestId as string;
  const labels = useWorldLabels();

  const { currentRequest, setCurrentRequest } = useFeedbackStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/feedback/requests/${requestId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Feedback request not found');
          }
          throw new Error('Failed to fetch feedback request');
        }
        const { request } = await response.json();
        setCurrentRequest(request);
      } catch (err) {
        console.error('Error fetching request:', err);
        setError(err instanceof Error ? err.message : 'Failed to load request');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequest();

    return () => {
      setCurrentRequest(null);
    };
  }, [requestId, setCurrentRequest]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/feedback/requests/${requestId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete feedback request');
      }
      router.push('/feedback');
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete request');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      </div>
    );
  }

  if (error || !currentRequest) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <Card className="p-12 text-center bg-[var(--background-secondary)] border-[var(--border)]">
          <h2 className="text-xl font-semibold mb-2">
            {error || 'Feedback request not found'}
          </h2>
          <p className="text-[var(--foreground-muted)] mb-4">
            The feedback request you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Link href="/feedback">
            <Button variant="secondary">Back to {labels.feedback}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Back link */}
      <Link
        href="/feedback"
        className="inline-flex items-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to {labels.feedback}
      </Link>

      <FeedbackDetail
        request={currentRequest}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
