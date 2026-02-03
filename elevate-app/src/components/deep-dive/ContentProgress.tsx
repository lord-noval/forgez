'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
  animated?: boolean;
  className?: string;
}

export function ContentProgress({
  currentStep,
  totalSteps,
  stepTitles,
  animated = true,
  className,
}: ContentProgressProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: -10 } : undefined}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      className={cn('flex flex-col items-center', className)}
    >
      {/* Progress dots with connecting lines */}
      <div className="flex items-center gap-1">
        {steps.map((step, index) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isUpcoming = step > currentStep;

          return (
            <div key={step} className="flex items-center">
              {/* Step dot */}
              <motion.div
                initial={animated ? { scale: 0 } : undefined}
                animate={animated ? { scale: 1 } : undefined}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'relative flex items-center justify-center',
                  'transition-all duration-300'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    'font-display font-semibold text-sm',
                    'border-2 transition-all duration-300',
                    isCompleted && 'bg-[var(--success)] border-[var(--success)] text-white',
                    isCurrent && 'bg-[var(--primary-muted)] border-[var(--primary)] text-[var(--primary)]',
                    isUpcoming && 'bg-[var(--background-tertiary)] border-[var(--border)] text-[var(--foreground-muted)]'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step
                  )}
                </div>

                {/* Pulse ring for current step */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-[var(--primary)]"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </motion.div>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="w-6 h-0.5 mx-1">
                  <motion.div
                    initial={animated ? { scaleX: 0 } : undefined}
                    animate={animated ? { scaleX: 1 } : undefined}
                    transition={{ delay: index * 0.05 + 0.1 }}
                    className={cn(
                      'h-full origin-left rounded-full',
                      step < currentStep
                        ? 'bg-[var(--success)]'
                        : 'bg-[var(--border)]'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current step title */}
      {stepTitles && stepTitles[currentStep - 1] && (
        <motion.p
          key={currentStep}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-[var(--foreground-muted)]"
        >
          {stepTitles[currentStep - 1]}
        </motion.p>
      )}

      {/* Progress text */}
      <p className="mt-2 text-xs text-[var(--foreground-subtle)]">
        {currentStep} of {totalSteps}
      </p>
    </motion.div>
  );
}

export default ContentProgress;
