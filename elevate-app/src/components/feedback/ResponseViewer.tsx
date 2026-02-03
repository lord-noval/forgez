'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  User,
  MessageCircle,
  Mic,
  Video,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import type { FeedbackRespondentWithResponse, FeedbackType } from '@/lib/supabase/types';

const typeConfig: Record<FeedbackType, {
  label: string;
  icon: typeof Mic;
  color: string;
}> = {
  VOICE: { label: 'Voice', icon: Mic, color: 'var(--primary)' },
  TEXT: { label: 'Text', icon: MessageCircle, color: 'var(--success)' },
  VIDEO: { label: 'Video', icon: Video, color: 'var(--warning)' },
};

interface ResponseViewerProps {
  respondent: FeedbackRespondentWithResponse;
  isAnonymous?: boolean;
}

export function ResponseViewer({ respondent, isAnonymous }: ResponseViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!respondent.responses || respondent.responses.length === 0) {
    return null;
  }

  const response = respondent.responses[0]; // Get the first response
  const config = typeConfig[response.feedback_type];
  const TypeIcon = config.icon;

  const displayName = isAnonymous
    ? `Anonymous Respondent`
    : respondent.respondent_name || respondent.respondent_email.split('@')[0];

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-4 bg-[var(--background-tertiary)] border-[var(--border)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--background-secondary)] flex items-center justify-center">
              <User className="w-5 h-5 text-[var(--foreground-muted)]" />
            </div>
            <div>
              <p className="font-medium">{displayName}</p>
              {!isAnonymous && respondent.relationship && (
                <p className="text-xs text-[var(--foreground-muted)]">
                  {respondent.relationship}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="gap-1"
              style={{ color: config.color }}
            >
              <TypeIcon className="w-3 h-3" />
              {config.label}
            </Badge>
          </div>
        </div>

        {/* Content based on type */}
        {response.feedback_type === 'TEXT' && response.content && (
          <div className="p-3 rounded-lg bg-[var(--background-secondary)]">
            <p className="text-sm whitespace-pre-wrap">{response.content}</p>
          </div>
        )}

        {response.feedback_type === 'VOICE' && response.audio_url && (
          <div className="space-y-3">
            {/* Audio player */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background-secondary)]">
              <Button
                variant="secondary"
                size="sm"
                className="w-10 h-10 rounded-full p-0"
                onClick={toggleAudio}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </Button>

              <div className="flex-1">
                <audio
                  ref={audioRef}
                  src={response.audio_url}
                  onEnded={() => setIsPlaying(false)}
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  className="hidden"
                />
                <div className="h-8 flex items-center">
                  {/* Simple waveform visualization placeholder */}
                  <div className="flex items-center gap-0.5 h-full">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-1 rounded-full transition-all',
                          isPlaying
                            ? 'bg-[var(--primary)] animate-pulse'
                            : 'bg-[var(--foreground-muted)]'
                        )}
                        style={{
                          height: `${Math.random() * 60 + 20}%`,
                          animationDelay: `${i * 50}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-sm text-[var(--foreground-muted)]">
                <Clock className="w-3 h-3" />
                {formatDuration(response.duration_seconds)}
              </div>
            </div>

            {/* Transcription if available */}
            {response.transcription && (
              <div className="p-3 rounded-lg bg-[var(--background-secondary)]">
                <p className="text-xs text-[var(--foreground-muted)] mb-1">
                  Transcription
                </p>
                <p className="text-sm">{response.transcription}</p>
              </div>
            )}
          </div>
        )}

        {response.feedback_type === 'VIDEO' && response.video_url && (
          <div className="rounded-lg overflow-hidden bg-[var(--background-secondary)]">
            <video
              src={response.video_url}
              controls
              className="w-full max-h-64 object-contain"
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between text-xs text-[var(--foreground-muted)]">
          <span>
            Submitted {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
          </span>
          {response.sentiment_analysis && (
            <Badge variant="secondary" className="text-xs">
              Sentiment analyzed
            </Badge>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
