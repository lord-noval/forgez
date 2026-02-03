'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Mic,
  Send,
  CheckCircle2,
  AlertCircle,
  User,
  Clock,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ResponseRecorder } from '@/components/feedback';
import { formatDistanceToNow } from 'date-fns';

type FeedbackMode = 'voice' | 'text';
type PageState = 'loading' | 'ready' | 'submitting' | 'success' | 'error';

interface RequestInfo {
  id: string;
  title: string;
  context: string | null;
  questions: string[];
  expiresAt: string;
  isAnonymous: boolean;
  requesterName: string;
  requesterAvatar: string | null;
}

interface RespondentInfo {
  id: string;
  name: string | null;
  email: string;
  relationship: string | null;
  status: string;
}

export default function RespondPage() {
  const params = useParams();
  const token = params.token as string;

  const [pageState, setPageState] = useState<PageState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [request, setRequest] = useState<RequestInfo | null>(null);
  const [respondent, setRespondent] = useState<RespondentInfo | null>(null);

  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>('voice');
  const [textContent, setTextContent] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await fetch(`/api/feedback/respond/${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load feedback request');
        }

        setRequest(data.request);
        setRespondent(data.respondent);
        setPageState('ready');
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load request');
        setPageState('error');
      }
    };

    fetchRequest();
  }, [token]);

  const handleRecordingComplete = (url: string, duration: number) => {
    setAudioUrl(url);
    setAudioDuration(duration);
  };

  const handleSubmit = async () => {
    if (feedbackMode === 'text' && textContent.trim().length < 10) {
      setError('Please provide at least 10 characters of feedback');
      return;
    }

    if (feedbackMode === 'voice' && !audioUrl) {
      setError('Please record your voice feedback');
      return;
    }

    setPageState('submitting');
    setError(null);

    try {
      const response = await fetch(`/api/feedback/respond/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback_type: feedbackMode === 'voice' ? 'VOICE' : 'TEXT',
          content: feedbackMode === 'text' ? textContent.trim() : null,
          audio_url: feedbackMode === 'voice' ? audioUrl : null,
          duration_seconds: feedbackMode === 'voice' ? audioDuration : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setPageState('success');
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
      setPageState('ready');
    }
  };

  // Error state
  if (pageState === 'error') {
    return (
      <Card className="p-12 text-center bg-[var(--background-secondary)] border-[var(--border)]">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--danger-muted)] flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-[var(--danger)]" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Unable to load feedback request</h2>
        <p className="text-[var(--foreground-muted)] mb-4 max-w-md mx-auto">
          {error}
        </p>
      </Card>
    );
  }

  // Success state
  if (pageState === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="p-12 text-center bg-[var(--background-secondary)] border-[var(--border)]">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--success-muted)] flex items-center justify-center"
          >
            <CheckCircle2 className="w-10 h-10 text-[var(--success)]" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Thank you!</h2>
          <p className="text-[var(--foreground-muted)] max-w-md mx-auto">
            Your feedback has been submitted successfully. {request?.requesterName} will
            really appreciate your insights.
          </p>
        </Card>
      </motion.div>
    );
  }

  // Loading state
  if (pageState === 'loading' || !request || !respondent) {
    return (
      <Card className="p-12 text-center bg-[var(--background-secondary)] border-[var(--border)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mx-auto mb-4" />
        <p className="text-[var(--foreground-muted)]">Loading feedback request...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--primary-muted)] flex items-center justify-center">
            {request.requesterAvatar ? (
              <img
                src={request.requesterAvatar}
                alt={request.requesterName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-[var(--primary)]" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold mb-1">{request.title}</h1>
            <p className="text-[var(--foreground-muted)]">
              {request.requesterName} is requesting your feedback
            </p>
            <div className="flex items-center gap-3 mt-2 text-sm text-[var(--foreground-muted)]">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>
                  Expires {formatDistanceToNow(new Date(request.expiresAt), { addSuffix: true })}
                </span>
              </div>
              {request.isAnonymous && (
                <Badge variant="secondary">Anonymous</Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Context */}
      {request.context && (
        <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
          <h2 className="font-semibold mb-2">Context</h2>
          <p className="text-[var(--foreground-muted)] whitespace-pre-wrap">
            {request.context}
          </p>
        </Card>
      )}

      {/* Questions */}
      <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
        <h2 className="font-semibold mb-4">Please address these questions:</h2>
        <div className="space-y-3">
          {request.questions.map((question, index) => (
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

      {/* Feedback mode toggle */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setFeedbackMode('voice')}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-full transition-all',
            feedbackMode === 'voice'
              ? 'bg-[var(--primary)] text-white'
              : 'bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
          )}
        >
          <Mic className="w-5 h-5" />
          Voice Recording
        </button>
        <button
          onClick={() => setFeedbackMode('text')}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-full transition-all',
            feedbackMode === 'text'
              ? 'bg-[var(--primary)] text-white'
              : 'bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
          )}
        >
          <MessageCircle className="w-5 h-5" />
          Written Response
        </button>
      </div>

      {/* Feedback input */}
      <AnimatePresence mode="wait">
        {feedbackMode === 'voice' ? (
          <motion.div
            key="voice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ResponseRecorder
              token={token}
              onRecordingComplete={handleRecordingComplete}
              disabled={pageState === 'submitting'}
            />
          </motion.div>
        ) : (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
              <Textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Share your feedback here. Be specific and constructive to help them grow..."
                rows={8}
                disabled={pageState === 'submitting'}
              />
              <p className="text-xs text-[var(--foreground-muted)] mt-2">
                {textContent.length} characters (minimum 10)
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-[var(--danger-muted)] text-[var(--danger)] text-sm flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Submit button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={
            pageState === 'submitting' ||
            (feedbackMode === 'text' && textContent.trim().length < 10) ||
            (feedbackMode === 'voice' && !audioUrl)
          }
          className="gap-2"
          size="lg"
        >
          {pageState === 'submitting' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Feedback
            </>
          )}
        </Button>
      </div>

      {/* Privacy note */}
      {request.isAnonymous && (
        <p className="text-center text-sm text-[var(--foreground-muted)]">
          Your response will be anonymous. {request.requesterName} will not see your name.
        </p>
      )}
    </div>
  );
}
