'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Upload,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ResponseRecorderProps {
  token: string;
  onRecordingComplete: (audioUrl: string, duration: number) => void;
  disabled?: boolean;
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'recorded';

export function ResponseRecorder({
  token,
  onRecordingComplete,
  disabled,
}: ResponseRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setState('recorded');

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setState('recording');

      // Start timer
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Could not access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const discardRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setDuration(0);
    setState('idle');
  };

  const uploadRecording = async () => {
    if (!audioBlob) return;

    setIsUploading(true);
    setError(null);

    try {
      // Get signed upload URL
      const uploadResponse = await fetch('/api/feedback/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          fileName: `recording_${Date.now()}.webm`,
          fileType: 'audio/webm',
          fileSize: audioBlob.size,
        }),
      });

      if (!uploadResponse.ok) {
        const data = await uploadResponse.json();
        throw new Error(data.error || 'Failed to get upload URL');
      }

      const { uploadUrl, publicUrl } = await uploadResponse.json();

      // Upload the file
      const uploadResult = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'audio/webm',
        },
        body: audioBlob,
      });

      if (!uploadResult.ok) {
        throw new Error('Failed to upload recording');
      }

      // Notify parent with the public URL
      onRecordingComplete(publicUrl, duration);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload recording');
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  return (
    <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
      <div className="text-center">
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-[var(--primary-muted)] flex items-center justify-center">
                <Mic className="w-10 h-10 text-[var(--primary)]" />
              </div>
              <div>
                <p className="font-medium mb-1">Record your voice feedback</p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Click the button below to start recording
                </p>
              </div>
              <Button
                onClick={startRecording}
                disabled={disabled}
                className="gap-2"
              >
                <Mic className="w-4 h-4" />
                Start Recording
              </Button>
            </motion.div>
          )}

          {state === 'recording' && (
            <motion.div
              key="recording"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <div className="relative">
                <motion.div
                  className="w-20 h-20 mx-auto rounded-full bg-[var(--danger)] flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Mic className="w-10 h-10 text-white" />
                </motion.div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--danger)] animate-pulse" />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold">{formatTime(duration)}</p>
                <p className="text-sm text-[var(--danger)]">Recording...</p>
              </div>
              <Button
                onClick={stopRecording}
                variant="secondary"
                className="gap-2 border-[var(--danger)] text-[var(--danger)]"
              >
                <Square className="w-4 h-4" />
                Stop Recording
              </Button>
            </motion.div>
          )}

          {state === 'recorded' && audioUrl && (
            <motion.div
              key="recorded"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-[var(--success-muted)] flex items-center justify-center">
                <Play className="w-10 h-10 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold">{formatTime(duration)}</p>
                <p className="text-sm text-[var(--success)]">Recording complete</p>
              </div>

              {/* Audio player */}
              <div className="p-3 rounded-lg bg-[var(--background-tertiary)]">
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  className="w-full"
                />
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="secondary"
                  onClick={discardRecording}
                  disabled={isUploading}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Discard
                </Button>
                <Button
                  onClick={uploadRecording}
                  disabled={isUploading}
                  className="gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Use Recording
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg bg-[var(--danger-muted)] text-[var(--danger)] text-sm flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </div>
    </Card>
  );
}
