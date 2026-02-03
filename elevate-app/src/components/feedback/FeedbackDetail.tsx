'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Users,
  Clock,
  Trash2,
  Copy,
  CheckCircle2,
  Timer,
  AlertCircle,
  Mail,
  MessageCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponseViewer } from './ResponseViewer';
import { formatDistanceToNow, format } from 'date-fns';
import type {
  FeedbackStatus,
  FeedbackRequestWithRespondents,
  FeedbackRespondentWithResponse,
} from '@/lib/supabase/types';

const statusConfig: Record<FeedbackStatus, {
  label: string;
  variant: 'default' | 'secondary' | 'success' | 'warning' | 'danger';
  icon: typeof CheckCircle2;
}> = {
  PENDING: { label: 'Pending', variant: 'warning', icon: Timer },
  IN_PROGRESS: { label: 'In Progress', variant: 'default', icon: Clock },
  COMPLETED: { label: 'Completed', variant: 'success', icon: CheckCircle2 },
  EXPIRED: { label: 'Expired', variant: 'secondary', icon: AlertCircle },
  DECLINED: { label: 'Declined', variant: 'danger', icon: AlertCircle },
};

interface FeedbackDetailProps {
  request: FeedbackRequestWithRespondents;
  onDelete?: () => Promise<void>;
  isDeleting?: boolean;
}

export function FeedbackDetail({ request, onDelete, isDeleting }: FeedbackDetailProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const isExpired = new Date(request.expires_at) < new Date();
  const effectiveStatus = isExpired && request.status !== 'COMPLETED' ? 'EXPIRED' : request.status;
  const config = statusConfig[effectiveStatus];
  const StatusIcon = config.icon;

  const responseCount = request.respondents?.filter(
    (r) => r.status === 'COMPLETED'
  ).length || 0;
  const totalRespondents = request.respondents?.length || 0;

  const questions = (request.prompt_questions as { questions?: string[] })?.questions || [];

  const copyRespondentLink = async (respondent: FeedbackRespondentWithResponse) => {
    const link = `${window.location.origin}/feedback/respond/${respondent.access_token}`;
    await navigator.clipboard.writeText(link);
    setCopiedToken(respondent.id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold font-display">{request.title}</h1>
            <Badge variant={config.variant} className="gap-1">
              <StatusIcon className="w-3 h-3" />
              {config.label}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--foreground-muted)]">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{responseCount}/{totalRespondents} responses</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                {isExpired
                  ? `Expired ${formatDistanceToNow(new Date(request.expires_at), { addSuffix: true })}`
                  : `Expires ${formatDistanceToNow(new Date(request.expires_at), { addSuffix: true })}`}
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="secondary"
          className="text-[var(--danger)] hover:bg-[var(--danger-muted)]"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 bg-[var(--danger-muted)] border-[var(--danger)]">
            <div className="flex items-center justify-between">
              <p className="text-[var(--danger)]">
                Are you sure you want to delete this feedback request? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-[var(--danger)] hover:bg-[var(--danger)]"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Delete'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Context */}
          {request.context && (
            <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
              <h2 className="text-lg font-semibold mb-3">Context</h2>
              <p className="text-[var(--foreground-muted)] whitespace-pre-wrap">
                {request.context}
              </p>
            </Card>
          )}

          {/* Questions */}
          <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
            <h2 className="text-lg font-semibold mb-4">Prompt Questions</h2>
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[var(--background-tertiary)]"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary-muted)] text-[var(--primary)] flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <p className="text-sm">{question}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Responses */}
          <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
            <h2 className="text-lg font-semibold mb-4">Responses</h2>
            {request.respondents?.filter((r) => r.responses && r.responses.length > 0).length > 0 ? (
              <div className="space-y-4">
                {request.respondents
                  .filter((r) => r.responses && r.responses.length > 0)
                  .map((respondent) => (
                    <ResponseViewer
                      key={respondent.id}
                      respondent={respondent}
                      isAnonymous={request.is_anonymous}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-[var(--foreground-muted)] mx-auto mb-3" />
                <p className="text-[var(--foreground-muted)]">
                  No responses received yet
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Respondents */}
          <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
            <h2 className="text-lg font-semibold mb-4">Respondents</h2>
            <div className="space-y-3">
              {request.respondents?.map((respondent) => {
                const hasResponded = respondent.status === 'COMPLETED';
                const respondentConfig = statusConfig[respondent.status];

                return (
                  <div
                    key={respondent.id}
                    className="p-3 rounded-lg bg-[var(--background-tertiary)]"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {respondent.respondent_name || respondent.respondent_email}
                        </p>
                        <p className="text-xs text-[var(--foreground-muted)] truncate">
                          {respondent.respondent_email}
                        </p>
                      </div>
                      <Badge
                        variant={respondentConfig.variant}
                        className="flex-shrink-0 text-xs"
                      >
                        {respondentConfig.label}
                      </Badge>
                    </div>

                    {respondent.relationship && (
                      <p className="text-xs text-[var(--foreground-muted)] mb-2">
                        {respondent.relationship}
                      </p>
                    )}

                    {!hasResponded && !isExpired && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => copyRespondentLink(respondent)}
                      >
                        {copiedToken === respondent.id ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy Link
                          </>
                        )}
                      </Button>
                    )}

                    {hasResponded && respondent.responded_at && (
                      <p className="text-xs text-[var(--success)]">
                        Responded {formatDistanceToNow(new Date(respondent.responded_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Details */}
          <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
            <h2 className="text-lg font-semibold mb-4">Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Created</span>
                <span>{format(new Date(request.created_at), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Expires</span>
                <span>{format(new Date(request.expires_at), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Anonymous</span>
                <span>{request.is_anonymous ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Min Responses</span>
                <span>{request.min_respondents}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
