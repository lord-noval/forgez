'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizCardProps {
  question: string;
  options: QuizOption[];
  explanation?: string;
  xpReward?: number;
  questionNumber?: number;
  totalQuestions?: number;
  onAnswer?: (optionId: string, isCorrect: boolean) => void;
  onNext?: () => void;
  nextLabel?: string;
  animated?: boolean;
  className?: string;
}

export function QuizCard({
  question,
  options,
  explanation,
  xpReward = 50,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext,
  nextLabel = 'Next Question',
  animated = true,
  className,
}: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelectAnswer = (optionId: string) => {
    if (showResult) return;

    setSelectedAnswer(optionId);
    setShowResult(true);

    const option = options.find((o) => o.id === optionId);
    const isCorrect = option?.isCorrect || false;

    onAnswer?.(optionId, isCorrect);
  };

  const isAnswerCorrect = selectedAnswer
    ? options.find((o) => o.id === selectedAnswer)?.isCorrect
    : false;

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : undefined}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      className={className}
    >
      {/* Question badge */}
      {questionNumber !== undefined && totalQuestions !== undefined && (
        <div className="text-center mb-6">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'inline-block px-4 py-1.5 rounded-full',
              'text-xs font-semibold font-mono uppercase tracking-wider',
              'bg-[var(--accent-muted)] text-[var(--accent)]',
              'border border-[var(--accent)]'
            )}
          >
            Question {questionNumber}/{totalQuestions}
          </motion.span>
        </div>
      )}

      <Card
        className={cn(
          'p-6 md:p-8',
          'bg-[var(--background-secondary)] border-2 border-[var(--border)]',
          showResult && isAnswerCorrect && 'border-[var(--success)]',
          showResult && !isAnswerCorrect && 'border-[var(--danger)]'
        )}
      >
        {/* Question */}
        <motion.h2
          initial={animated ? { opacity: 0 } : undefined}
          animate={animated ? { opacity: 1 } : undefined}
          transition={{ delay: 0.1 }}
          className="text-xl md:text-2xl font-display font-semibold text-[var(--foreground)] mb-8"
        >
          {question}
        </motion.h2>

        {/* Options */}
        <div className="space-y-3">
          {options.map((option, index) => {
            const isSelected = selectedAnswer === option.id;
            const isCorrect = option.isCorrect;
            const showCorrectness = showResult;

            return (
              <motion.button
                key={option.id}
                initial={animated ? { opacity: 0, x: -20 } : undefined}
                animate={animated ? { opacity: 1, x: 0 } : undefined}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={() => handleSelectAnswer(option.id)}
                disabled={showResult}
                className={cn(
                  'w-full p-4 rounded-xl border-2 text-left',
                  'transition-all duration-300',
                  'group relative overflow-hidden',
                  // Default state
                  !showResult && 'border-[var(--border)] bg-[var(--background-tertiary)]',
                  !showResult && 'hover:border-[var(--primary)] hover:bg-[var(--primary-muted)]',
                  // Selected but not revealed
                  isSelected && !showResult && 'border-[var(--primary)] bg-[var(--primary-muted)]',
                  // Correct answer revealed
                  showCorrectness && isCorrect && 'border-[var(--success)] bg-[var(--success-muted)]',
                  // Wrong answer selected
                  showCorrectness && isSelected && !isCorrect && 'border-[var(--danger)] bg-[var(--danger-muted)]',
                  // Other options when result shown
                  showCorrectness && !isSelected && !isCorrect && 'opacity-40'
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Option letter/indicator */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      'text-sm font-bold font-mono transition-all duration-300',
                      // Default
                      !showResult && 'bg-[var(--background-secondary)] text-[var(--foreground-muted)]',
                      // Correct
                      showCorrectness && isCorrect && 'bg-[var(--success)] text-white',
                      // Wrong selected
                      showCorrectness && isSelected && !isCorrect && 'bg-[var(--danger)] text-white'
                    )}
                  >
                    {showCorrectness && isCorrect ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 10 }}
                      >
                        <Check className="w-5 h-5" />
                      </motion.div>
                    ) : showCorrectness && isSelected && !isCorrect ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 10 }}
                      >
                        <X className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </div>

                  {/* Option text */}
                  <span className="flex-1 text-[var(--foreground)]">{option.text}</span>
                </div>

                {/* Hover shine effect */}
                {!showResult && (
                  <div
                    className={cn(
                      'absolute inset-0 opacity-0 group-hover:opacity-100',
                      'transition-opacity duration-300 pointer-events-none'
                    )}
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(249, 115, 22, 0.1) 50%, transparent 100%)',
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {showResult && explanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <div
                className={cn(
                  'p-4 rounded-xl',
                  'bg-[var(--background-tertiary)] border border-[var(--border)]'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-[var(--accent)]" />
                  <span className="text-sm font-semibold text-[var(--accent)]">Explanation</span>
                </div>
                <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                  {explanation}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Next button */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end mt-6"
          >
            <Button
              onClick={onNext}
              className={cn(
                'px-6 py-2',
                isAnswerCorrect
                  ? 'bg-[var(--success)] hover:bg-[var(--success-hover)]'
                  : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)]'
              )}
            >
              {nextLabel}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default QuizCard;
