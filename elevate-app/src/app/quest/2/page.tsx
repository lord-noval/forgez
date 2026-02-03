'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Play,
  ExternalLink,
  Sparkles,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { useQuestStore } from '@/stores/quest-store';
import { useArchetypeStore } from '@/stores/archetype-store';
import { useXPStore } from '@/stores/xp-store';
import { ArtifactViewer } from '@/components/epic-object/ArtifactViewer';
import { SpecsGrid } from '@/components/epic-object/SpecsGrid';

interface EpicObject {
  id: string;
  slug: string;
  name: string;
  category: string;
  industry: string;
  tagline: string;
  description: string;
  specs: Record<string, unknown>;
  image_url: string;
  video_url: string;
  wikipedia_url: string;
  fun_facts: string[];
}

export default function Quest2Page() {
  const t = useTranslations('quest');
  const router = useRouter();
  const [epicObject, setEpicObject] = useState<EpicObject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  const { domainInterest } = useArchetypeStore();
  const { startQuest, completeQuest, getQuestStatus } = useQuestStore();
  const { awardXP } = useXPStore();

  // Fetch matching epic object based on domain interest
  useEffect(() => {
    const fetchEpicObject = async () => {
      const status = getQuestStatus(2);

      // Start quest if available
      if (status === 'available') {
        startQuest(2);
      }

      // Redirect if quest is locked
      if (status === 'locked') {
        router.push('/quest/1');
        return;
      }

      try {
        const response = await fetch(`/api/epic-objects?industry=${domainInterest || 'space'}&featured=true`);
        const data = await response.json();

        if (data.data && data.data.length > 0) {
          setEpicObject(data.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch epic object:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEpicObject();
  }, [domainInterest, getQuestStatus, startQuest, router]);

  const handleContinue = async () => {
    // Award XP
    awardXP(25, 'deep_dive_complete', epicObject?.id, 'Viewed Epic Artifact');

    // Complete quest 2, unlock quest 3
    completeQuest(2, 25);

    // Navigate to Quest 3
    router.push('/quest/3');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!epicObject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--foreground-muted)]">No epic object found for your domain.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-20 pb-24">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[var(--primary-muted)] text-[var(--primary)] mb-4">
            {t('quest2.yourMatch')}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold font-display gradient-text-fire mb-2">
            {epicObject.name}
          </h1>
          <p className="text-lg text-[var(--foreground-muted)]">
            {epicObject.tagline}
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Image/Video */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ArtifactViewer
              imageUrl={epicObject.image_url}
              videoUrl={epicObject.video_url}
              name={epicObject.name}
              showVideo={showVideo}
              onToggleVideo={() => setShowVideo(!showVideo)}
            />

            {/* Fun Facts */}
            {epicObject.fun_facts && epicObject.fun_facts.length > 0 && (
              <Card className="mt-6 p-4 bg-[var(--background-secondary)] border-[var(--border)]">
                <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--achievement)]" />
                  {t('quest2.funFacts')}
                </h3>
                <ul className="space-y-2">
                  {epicObject.fun_facts.slice(0, 3).map((fact, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-2 text-sm text-[var(--foreground-muted)]"
                    >
                      <ChevronRight className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                      {fact}
                    </motion.li>
                  ))}
                </ul>
              </Card>
            )}
          </motion.div>

          {/* Right Column - Description & Specs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Description */}
            <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
              <p className="text-[var(--foreground)] leading-relaxed">
                {epicObject.description}
              </p>

              {/* Links */}
              <div className="flex gap-3 mt-4">
                {epicObject.video_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVideo(true)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {t('quest2.watchVideo')}
                  </Button>
                )}
                {epicObject.wikipedia_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <a href={epicObject.wikipedia_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {t('quest2.learnMore')}
                    </a>
                  </Button>
                )}
              </div>
            </Card>

            {/* Specifications */}
            <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
              <h3 className="font-display font-semibold mb-4">
                {t('quest2.specs')}
              </h3>
              <SpecsGrid specs={epicObject.specs} />
            </Card>
          </motion.div>
        </div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between mt-12"
        >
          <Button variant="ghost" onClick={() => router.push('/quest/1')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('navigation.back')}
          </Button>

          <Button onClick={handleContinue} className="glow-primary">
            <Sparkles className="w-4 h-4 mr-2" />
            {t('navigation.continue')}
            <span className="ml-2 text-[var(--accent)]">+25 XP</span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
