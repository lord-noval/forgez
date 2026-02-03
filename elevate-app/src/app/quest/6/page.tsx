'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  Quote,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useQuestStore } from '@/stores/quest-store';
import { useXPStore } from '@/stores/xp-store';
import { SuccessRadar, type RadarDataPoint } from '@/components/wisdom/SuccessRadar';

interface LeaderInsight {
  id: string;
  leader_name: string;
  title: string;
  company: string;
  image_url: string;
  quote: string;
  key_trait: string;
}

interface SoftSkill {
  id: string;
  slug: string;
  name: string;
  description: string;
  importance_rank: number;
  correlation_score: number;
}

// Assessment questions - 10 situational questions covering soft skills
const assessmentQuestions = [
  {
    id: 'q1',
    situation: 'Your project fails after weeks of work.',
    options: [
      { id: 'a', text: 'Analyze what went wrong and plan improvements', trait: 'growth-mindset' },
      { id: 'b', text: 'Feel discouraged but move on to the next project', trait: 'resilience' },
      { id: 'c', text: 'Ask teammates for feedback on what happened', trait: 'collaboration' },
      { id: 'd', text: 'Take responsibility and communicate lessons learned', trait: 'ownership' },
    ],
  },
  {
    id: 'q2',
    situation: 'A teammate is struggling with their tasks.',
    options: [
      { id: 'a', text: 'Offer to help and share your knowledge', trait: 'collaboration' },
      { id: 'b', text: 'Suggest they try a different approach', trait: 'problem-solving' },
      { id: 'c', text: 'Ask questions to understand their challenges', trait: 'curiosity' },
      { id: 'd', text: 'Explain clearly how you would approach it', trait: 'communication' },
    ],
  },
  {
    id: 'q3',
    situation: 'The project requirements suddenly change.',
    options: [
      { id: 'a', text: 'Quickly adjust your plans and keep moving', trait: 'adaptability' },
      { id: 'b', text: 'See it as a chance to learn something new', trait: 'growth-mindset' },
      { id: 'c', text: 'Communicate the impact to stakeholders', trait: 'communication' },
      { id: 'd', text: 'Take charge of replanning the work', trait: 'ownership' },
    ],
  },
  {
    id: 'q4',
    situation: 'You receive harsh feedback on your code during a review.',
    options: [
      { id: 'a', text: 'Thank them and ask for specific improvement suggestions', trait: 'growth-mindset' },
      { id: 'b', text: 'Take a moment to process, then address the feedback constructively', trait: 'resilience' },
      { id: 'c', text: 'Discuss the feedback openly to understand their perspective', trait: 'communication' },
      { id: 'd', text: 'Research the issues raised and come back with solutions', trait: 'problem-solving' },
    ],
  },
  {
    id: 'q5',
    situation: 'A deadline is clearly impossible to meet with the current scope.',
    options: [
      { id: 'a', text: 'Communicate early with stakeholders about realistic options', trait: 'communication' },
      { id: 'b', text: 'Take ownership and propose a prioritized delivery plan', trait: 'ownership' },
      { id: 'c', text: 'Rally the team to find creative solutions together', trait: 'collaboration' },
      { id: 'd', text: 'Stay calm and focus on what can be achieved', trait: 'adaptability' },
    ],
  },
  {
    id: 'q6',
    situation: 'You discover a critical bug just hours before launch.',
    options: [
      { id: 'a', text: 'Immediately diagnose the root cause and fix it', trait: 'problem-solving' },
      { id: 'b', text: 'Alert the team and coordinate a response', trait: 'collaboration' },
      { id: 'c', text: 'Stay focused and work through the pressure', trait: 'resilience' },
      { id: 'd', text: 'Document the issue and communicate status clearly', trait: 'communication' },
    ],
  },
  {
    id: 'q7',
    situation: 'Your idea gets rejected by the team during brainstorming.',
    options: [
      { id: 'a', text: 'Ask what concerns they have and how to improve the idea', trait: 'curiosity' },
      { id: 'b', text: 'Accept the decision and actively support alternative ideas', trait: 'collaboration' },
      { id: 'c', text: 'View it as a learning opportunity for future pitches', trait: 'growth-mindset' },
      { id: 'd', text: 'Stay positive and continue contributing new ideas', trait: 'resilience' },
    ],
  },
  {
    id: 'q8',
    situation: 'A conflict arises between two team members you work with.',
    options: [
      { id: 'a', text: 'Listen to both sides to understand the real issue', trait: 'curiosity' },
      { id: 'b', text: 'Help facilitate a calm discussion between them', trait: 'communication' },
      { id: 'c', text: 'Suggest compromises that address both concerns', trait: 'problem-solving' },
      { id: 'd', text: 'Encourage them to find common ground together', trait: 'collaboration' },
    ],
  },
  {
    id: 'q9',
    situation: 'You need to learn a completely new technology for your project.',
    options: [
      { id: 'a', text: 'Dive in eagerly and explore its capabilities', trait: 'curiosity' },
      { id: 'b', text: 'See it as a valuable addition to your skill set', trait: 'growth-mindset' },
      { id: 'c', text: 'Find mentors or resources to accelerate learning', trait: 'collaboration' },
      { id: 'd', text: 'Adjust your approach as you learn what works', trait: 'adaptability' },
    ],
  },
  {
    id: 'q10',
    situation: 'Your manager asks you to lead a project for the first time.',
    options: [
      { id: 'a', text: 'Accept the challenge and commit to doing your best', trait: 'ownership' },
      { id: 'b', text: 'Ask questions to understand expectations and resources', trait: 'curiosity' },
      { id: 'c', text: 'Communicate your plans clearly to the team', trait: 'communication' },
      { id: 'd', text: 'Stay flexible and learn as you go', trait: 'adaptability' },
    ],
  },
];

export default function Quest6Page() {
  const t = useTranslations('quest');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState<LeaderInsight[]>([]);
  const [softSkills, setSoftSkills] = useState<SoftSkill[]>([]);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [showAssessment, setShowAssessment] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [assessmentComplete, setAssessmentComplete] = useState(false);

  const { startQuest, completeQuest, getQuestStatus } = useQuestStore();
  const { awardXP } = useXPStore();

  useEffect(() => {
    const status = getQuestStatus(6);

    if (status === 'available') {
      startQuest(6);
    }

    if (status === 'locked') {
      router.push('/quest/5');
      return;
    }

    fetchData();
  }, [getQuestStatus, startQuest, router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [insightsRes, skillsRes] = await Promise.all([
        fetch('/api/leader-insights'),
        fetch('/api/soft-skills'),
      ]);

      const insightsData = await insightsRes.json();
      const skillsData = await skillsRes.json();

      setInsights(insightsData.data || []);
      setSoftSkills(skillsData.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextInsight = () => {
    setCurrentInsightIndex((prev) => (prev + 1) % insights.length);
  };

  const prevInsight = () => {
    setCurrentInsightIndex((prev) => (prev - 1 + insights.length) % insights.length);
  };

  const handleAnswerSelect = (trait: string) => {
    setSelectedTraits([...selectedTraits, trait]);

    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Assessment complete
      setAssessmentComplete(true);
      awardXP(100, 'archetype_complete', undefined, 'Completed Soft Skills Assessment');
    }
  };

  const handleContinue = () => {
    completeQuest(6, 100);
    router.push('/quest/7');
  };

  // Calculate top traits
  const topTraits = selectedTraits.reduce((acc, trait) => {
    acc[trait] = (acc[trait] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedTraits = Object.entries(topTraits)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-20 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold font-display gradient-text-fire mb-2">
            {t('quest6.title')}
          </h1>
          <p className="text-lg text-[var(--foreground-muted)]">
            {t('quest6.subtitle')}
          </p>
        </motion.div>

        {!showAssessment && !assessmentComplete ? (
          <>
            {/* Leader Quotes Carousel */}
            {insights.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <Card className="p-8 bg-[var(--background-secondary)] border-[var(--border)] relative overflow-hidden">
                  <Quote className="absolute top-4 left-4 w-12 h-12 text-[var(--primary-muted)]" />

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentInsightIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="text-center pt-8"
                    >
                      <blockquote className="text-xl md:text-2xl font-display italic mb-6 relative z-10">
                        "{insights[currentInsightIndex]?.quote}"
                      </blockquote>

                      <div className="flex items-center justify-center gap-4">
                        {insights[currentInsightIndex]?.image_url && (
                          <img
                            src={insights[currentInsightIndex].image_url}
                            alt={insights[currentInsightIndex].leader_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div className="text-left">
                          <p className="font-semibold">{insights[currentInsightIndex]?.leader_name}</p>
                          <p className="text-sm text-[var(--foreground-muted)]">
                            {insights[currentInsightIndex]?.title}, {insights[currentInsightIndex]?.company}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <span className="px-3 py-1 rounded-full text-xs bg-[var(--achievement-muted)] text-[var(--achievement)]">
                          {insights[currentInsightIndex]?.key_trait}
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation */}
                  <div className="absolute inset-y-0 left-0 flex items-center">
                    <Button variant="ghost" size="icon" onClick={prevInsight} className="ml-2">
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <Button variant="ghost" size="icon" onClick={nextInsight} className="mr-2">
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Dots */}
                  <div className="flex justify-center gap-2 mt-6">
                    {insights.map((_, index) => (
                      <button
                        key={index}
                        className={cn(
                          'w-2 h-2 rounded-full transition-all',
                          index === currentInsightIndex
                            ? 'bg-[var(--primary)] w-4'
                            : 'bg-[var(--border)]'
                        )}
                        onClick={() => setCurrentInsightIndex(index)}
                      />
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Start Assessment Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <Card className="p-8 bg-[var(--background-secondary)] border-[var(--border)]">
                <h2 className="text-xl font-display font-semibold mb-2">
                  {t('quest6.assessment.title')}
                </h2>
                <p className="text-[var(--foreground-muted)] mb-6">
                  {t('quest6.assessment.description')}
                </p>
                <Button onClick={() => setShowAssessment(true)} className="glow-primary">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Assessment
                  <span className="ml-2 text-[var(--accent)]">+100 XP</span>
                </Button>
              </Card>
            </motion.div>
          </>
        ) : showAssessment && !assessmentComplete ? (
          /* Assessment Questions */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-8 bg-[var(--background-secondary)] border-[var(--border)]">
              <div className="text-center mb-8">
                <span className="text-sm text-[var(--foreground-muted)]">
                  Question {currentQuestionIndex + 1} of {assessmentQuestions.length}
                </span>
                <div className="h-1.5 bg-[var(--background-tertiary)] rounded-full mt-2 overflow-hidden">
                  <motion.div
                    className="h-full progress-gradient"
                    animate={{
                      width: `${((currentQuestionIndex + 1) / assessmentQuestions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <h2 className="text-xl font-display font-semibold text-center mb-8">
                {assessmentQuestions[currentQuestionIndex].situation}
              </h2>

              <div className="space-y-3">
                {assessmentQuestions[currentQuestionIndex].options.map((option) => (
                  <motion.button
                    key={option.id}
                    onClick={() => handleAnswerSelect(option.trait)}
                    className={cn(
                      'w-full p-4 rounded-xl border text-left transition-all',
                      'border-[var(--border)] bg-[var(--background-tertiary)]',
                      'hover:border-[var(--primary)] hover:bg-[var(--primary-muted)]'
                    )}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {option.text}
                  </motion.button>
                ))}
              </div>
            </Card>
          </motion.div>
        ) : (
          /* Assessment Results */
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="p-8 bg-[var(--background-secondary)] border-[var(--border)]">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-[var(--success-muted)] flex items-center justify-center mx-auto mb-6"
                >
                  <Sparkles className="w-10 h-10 text-[var(--success)]" />
                </motion.div>

                <h2 className="text-2xl font-display font-bold mb-4">Assessment Complete!</h2>

                <p className="text-[var(--foreground-muted)] mb-6">
                  Your soft skills profile based on your responses:
                </p>
              </div>

              {/* Success Radar Chart */}
              <div className="flex justify-center mb-8">
                <SuccessRadar
                  data={[
                    { trait: 'growth-mindset', label: t('quest6.softSkills.growth-mindset'), value: Math.round((topTraits['growth-mindset'] || 0) / assessmentQuestions.length * 100) || 30 },
                    { trait: 'ownership', label: t('quest6.softSkills.ownership'), value: Math.round((topTraits['ownership'] || 0) / assessmentQuestions.length * 100) || 30 },
                    { trait: 'adaptability', label: t('quest6.softSkills.adaptability'), value: Math.round((topTraits['adaptability'] || 0) / assessmentQuestions.length * 100) || 30 },
                    { trait: 'collaboration', label: t('quest6.softSkills.collaboration'), value: Math.round((topTraits['collaboration'] || 0) / assessmentQuestions.length * 100) || 30 },
                    { trait: 'communication', label: t('quest6.softSkills.communication'), value: Math.round((topTraits['communication'] || 0) / assessmentQuestions.length * 100) || 30 },
                    { trait: 'problem-solving', label: t('quest6.softSkills.problem-solving'), value: Math.round((topTraits['problem-solving'] || 0) / assessmentQuestions.length * 100) || 30 },
                    { trait: 'curiosity', label: t('quest6.softSkills.curiosity'), value: Math.round((topTraits['curiosity'] || 0) / assessmentQuestions.length * 100) || 30 },
                    { trait: 'resilience', label: t('quest6.softSkills.resilience'), value: Math.round((topTraits['resilience'] || 0) / assessmentQuestions.length * 100) || 30 },
                  ]}
                  size={320}
                />
              </div>

              <div className="text-center">
                <p className="text-[var(--foreground-muted)] mb-4">Your top strengths:</p>
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {sortedTraits.map(([trait, count], index) => (
                    <motion.span
                      key={trait}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-[var(--primary-muted)] text-[var(--primary)]"
                    >
                      {t(`quest6.softSkills.${trait}`)}
                    </motion.span>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-[var(--accent)] font-display font-bold text-xl"
                >
                  +100 XP Earned!
                </motion.div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="ghost" onClick={() => router.push('/quest/5')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('navigation.back')}
          </Button>

          {assessmentComplete && (
            <Button onClick={handleContinue} className="glow-primary">
              <Sparkles className="w-4 h-4 mr-2" />
              {t('navigation.continue')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
