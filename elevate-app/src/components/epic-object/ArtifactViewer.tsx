'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Maximize2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ArtifactViewerProps {
  imageUrl: string;
  videoUrl?: string;
  name: string;
  showVideo: boolean;
  onToggleVideo: () => void;
}

export function ArtifactViewer({
  imageUrl,
  videoUrl,
  name,
  showVideo,
  onToggleVideo,
}: ArtifactViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:embed\/|v=|youtu\.be\/)([^&?/]+)/);
    return match ? match[1] : null;
  };

  const videoId = videoUrl ? getYouTubeId(videoUrl) : null;

  return (
    <>
      <Card className="relative aspect-video overflow-hidden bg-[var(--background-secondary)] border-[var(--border)] group">
        <AnimatePresence mode="wait">
          {showVideo && videoId ? (
            <motion.div
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title={name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 bg-[var(--background)]/80 hover:bg-[var(--background)]"
                onClick={onToggleVideo}
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover"
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent opacity-60" />

              {/* Play button overlay */}
              {videoUrl && (
                <motion.button
                  onClick={onToggleVideo}
                  className={cn(
                    'absolute inset-0 flex items-center justify-center',
                    'bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity'
                  )}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center glow-primary">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </motion.button>
              )}

              {/* Fullscreen button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-3 right-3 bg-[var(--background)]/80 hover:bg-[var(--background)] opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsFullscreen(true)}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setIsFullscreen(false)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/10"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            <motion.img
              src={imageUrl}
              alt={name}
              className="max-w-full max-h-full object-contain"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
