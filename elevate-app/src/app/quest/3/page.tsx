'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useQuestStore } from '@/stores/quest-store';
import { useArchetypeStore } from '@/stores/archetype-store';
import { useXPStore } from '@/stores/xp-store';

// New Deep Dive components
import { LearningPathCard, PathType } from '@/components/deep-dive/LearningPathCard';
import { ContentRenderer } from '@/components/deep-dive/ContentRenderer';
import { ContentProgress } from '@/components/deep-dive/ContentProgress';
import { QuizCard } from '@/components/deep-dive/QuizCard';
import { QuizCelebration } from '@/components/deep-dive/QuizCelebration';
import { SkillTrialIntro } from '@/components/deep-dive/SkillTrialIntro';

interface DeepDiveContent {
  id: string;
  path_type: string;
  content_type: string;
  title: string;
  content: string;
  media_url: string;
  duration_minutes: number;
  xp_reward: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  xp_reward: number;
}

export default function Quest3Page() {
  const t = useTranslations('quest');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPath, setSelectedPath] = useState<PathType | null>(null);
  const [pathContent, setPathContent] = useState<DeepDiveContent[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showTrialIntro, setShowTrialIntro] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationXP, setCelebrationXP] = useState(0);
  const [completedPaths, setCompletedPaths] = useState<string[]>([]);
  const [totalXPEarned, setTotalXPEarned] = useState(0);

  const { domainInterest } = useArchetypeStore();
  const { startQuest, completeQuest, getQuestStatus } = useQuestStore();
  const { awardXP } = useXPStore();

  useEffect(() => {
    const status = getQuestStatus(3);

    if (status === 'available') {
      startQuest(3);
    }

    if (status === 'locked') {
      router.push('/quest/2');
      return;
    }

    setIsLoading(false);
  }, [getQuestStatus, startQuest, router]);

  // Fetch path content when a path is selected
  useEffect(() => {
    if (!selectedPath) return;

    const fetchPathContent = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/deep-dive?path_type=${selectedPath}&industry=${domainInterest || 'space'}`);
        const data = await response.json();

        if (data.content) {
          setPathContent(data.content);
        }
        if (data.questions) {
          setQuizQuestions(data.questions);
        }
      } catch (error) {
        console.error('Failed to fetch deep dive content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPathContent();
  }, [selectedPath, domainInterest]);

  const handleSelectPath = (path: PathType) => {
    setSelectedPath(path);
    setCurrentContentIndex(0);
    setShowQuiz(false);
    setShowTrialIntro(false);
    setCurrentQuizIndex(0);
  };

  const handleNextContent = () => {
    if (currentContentIndex < pathContent.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1);
    } else {
      // Content finished, show trial intro if quiz available
      if (quizQuestions.length > 0) {
        setShowTrialIntro(true);
      } else {
        handlePathComplete();
      }
    }
  };

  const handleBeginTrial = () => {
    setShowTrialIntro(false);
    setShowQuiz(true);
  };

  const handleQuizAnswer = useCallback((optionId: string, isCorrect: boolean) => {
    if (isCorrect) {
      const question = quizQuestions[currentQuizIndex];
      const xpAmount = question.xp_reward || 50;
      awardXP(xpAmount, 'quiz_correct', question.id, `Correct answer: ${question.question.slice(0, 30)}...`);
      setTotalXPEarned((prev) => prev + xpAmount);
      setCelebrationXP(xpAmount);
      setShowCelebration(true);
    }
  }, [quizQuestions, currentQuizIndex, awardXP]);

  const handleNextQuestion = () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      handlePathComplete();
    }
  };

  const handlePathComplete = () => {
    if (selectedPath && !completedPaths.includes(selectedPath)) {
      setCompletedPaths([...completedPaths, selectedPath]);

      // Award path completion XP
      const pathXP = 75;
      awardXP(pathXP, 'deep_dive_complete', undefined, `Completed ${selectedPath} path`);
      setTotalXPEarned((prev) => prev + pathXP);
    }

    // Reset state
    setSelectedPath(null);
    setPathContent([]);
    setQuizQuestions([]);
    setShowQuiz(false);
    setShowTrialIntro(false);
  };

  const handleQuestComplete = () => {
    completeQuest(3, totalXPEarned);
    router.push('/quest/4');
  };

  const canComplete = completedPaths.length >= 1; // At least one path completed

  if (isLoading && !selectedPath) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  // Path Selection View
  if (!selectedPath) {
    return (
      <div className="min-h-screen p-4 pt-20 pb-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            {/* RPG Intro */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xs font-mono uppercase tracking-widest text-[var(--primary)] mb-2"
            >
              {t('flavor.questIntro.3.title')}
            </motion.p>
            <h1 className="text-3xl md:text-4xl font-bold font-display gradient-text-fire mb-3">
              {t('quest3.title')}
            </h1>
            <p className="text-[var(--foreground-muted)] italic mb-2">
              "{t('flavor.questIntro.3.intro')}"
            </p>
            <p className="text-lg text-[var(--foreground-muted)]">
              {t('quest3.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {(['how_works', 'how_build', 'who_makes', 'who_operates'] as const).map((path, index) => {
              const isCompleted = completedPaths.includes(path);

              return (
                <LearningPathCard
                  key={path}
                  pathType={path}
                  label={t(`quest3.paths.${path}.label`)}
                  description={t(`quest3.paths.${path}.description`)}
                  rpgTitle={t(`flavor.paths.${path}.rpgTitle`)}
                  rpgDescription={t(`flavor.paths.${path}.rpgDesc`)}
                  xpReward={75}
                  isCompleted={isCompleted}
                  onClick={() => !isCompleted && handleSelectPath(path)}
                  index={index}
                />
              );
            })}
          </div>

          {/* Quest Progress */}
          {completedPaths.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--foreground-muted)]">Paths Completed</p>
                  <p className="font-display font-bold text-xl">{completedPaths.length} / 4</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[var(--foreground-muted)]">XP Earned</p>
                  <p className="font-display font-bold text-xl text-[var(--accent)]">+{totalXPEarned}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button variant="ghost" onClick={() => router.push('/quest/2')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('navigation.back')}
            </Button>

            <Button onClick={handleQuestComplete} disabled={!canComplete} className={canComplete ? 'glow-primary' : ''}>
              <Sparkles className="w-4 h-4 mr-2" />
              {t('navigation.continue')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Content/Quiz View
  return (
    <div className="min-h-screen p-4 pt-20 pb-24">
      <div className="max-w-3xl mx-auto">
        {/* Quiz Celebration Overlay */}
        <QuizCelebration
          show={showCelebration}
          xpAmount={celebrationXP}
          message={t('flavor.quiz.correct')}
          onComplete={() => setShowCelebration(false)}
        />

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
          </div>
        ) : showTrialIntro ? (
          // Skill Trial Intro
          <SkillTrialIntro
            title={t('flavor.quiz.trialTitle')}
            description={t('flavor.quiz.trialDesc')}
            questionCount={quizQuestions.length}
            xpPerQuestion={50}
            onBegin={handleBeginTrial}
            beginLabel={t('flavor.quiz.beginTrial')}
          />
        ) : showQuiz && quizQuestions.length > 0 ? (
          // Quiz View with new QuizCard
          <QuizCard
            question={quizQuestions[currentQuizIndex]?.question}
            options={quizQuestions[currentQuizIndex]?.options || []}
            explanation={quizQuestions[currentQuizIndex]?.explanation}
            xpReward={quizQuestions[currentQuizIndex]?.xp_reward || 50}
            questionNumber={currentQuizIndex + 1}
            totalQuestions={quizQuestions.length}
            onAnswer={handleQuizAnswer}
            onNext={handleNextQuestion}
            nextLabel={currentQuizIndex < quizQuestions.length - 1 ? 'Next Question' : 'Complete Path'}
          />
        ) : pathContent.length > 0 ? (
          // Content View with ContentRenderer
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Progress indicator */}
            <div className="mb-8">
              <ContentProgress
                currentStep={currentContentIndex + 1}
                totalSteps={pathContent.length}
                stepTitles={pathContent.map((c) => c.title)}
              />
            </div>

            <h2 className="text-2xl font-display font-bold text-center mb-6">
              {pathContent[currentContentIndex]?.title}
            </h2>

            <div className="p-6 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)]">
              {pathContent[currentContentIndex]?.content_type === 'video' && pathContent[currentContentIndex]?.media_url ? (
                <div className="aspect-video rounded-lg overflow-hidden mb-6">
                  <iframe
                    src={pathContent[currentContentIndex].media_url}
                    title={pathContent[currentContentIndex].title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : null}

              {pathContent[currentContentIndex]?.content && (
                <ContentRenderer
                  content={pathContent[currentContentIndex].content}
                  pathType={selectedPath}
                />
              )}
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={() => setSelectedPath(null)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Paths
              </Button>

              <Button onClick={handleNextContent}>
                {currentContentIndex < pathContent.length - 1 ? 'Next' : 'Start Quiz'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        ) : (
          // Empty state - no content available
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div
              className={cn(
                'w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6',
                'bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]'
              )}
            >
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-2">
              {t(`quest3.paths.${selectedPath}.label`)}
            </h3>
            <p className="text-[var(--foreground-muted)] mb-6 max-w-md mx-auto">
              Content for this path is coming soon. You can still complete this path to continue your journey.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setSelectedPath(null)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Paths
              </Button>
              <Button onClick={handlePathComplete} className="glow-primary">
                <Check className="w-4 h-4 mr-2" />
                Complete Path (+75 XP)
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
