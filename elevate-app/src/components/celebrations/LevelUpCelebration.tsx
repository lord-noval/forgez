'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, Crown } from 'lucide-react';
import { ConfettiExplosion } from './ConfettiExplosion';
import { cn } from '@/lib/utils';

interface LevelUpCelebrationProps {
  show: boolean;
  fromLevel: number;
  toLevel: number;
  onComplete?: () => void;
}

export function LevelUpCelebration({
  show,
  fromLevel,
  toLevel,
  onComplete,
}: LevelUpCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [phase, setPhase] = useState<'flash' | 'reveal' | 'done'>('flash');

  useEffect(() => {
    if (show) {
      // Phase 1: Flash
      setPhase('flash');

      // Phase 2: Reveal after flash
      const revealTimer = setTimeout(() => {
        setPhase('reveal');
        setShowConfetti(true);
      }, 400);

      // Phase 3: Auto-dismiss
      const dismissTimer = setTimeout(() => {
        setPhase('done');
        onComplete?.();
      }, 4000);

      return () => {
        clearTimeout(revealTimer);
        clearTimeout(dismissTimer);
      };
    } else {
      setPhase('flash');
      setShowConfetti(false);
    }
  }, [show, onComplete]);

  return (
    <>
      <ConfettiExplosion
        show={showConfetti}
        intensity="epic"
        duration={3500}
        origin={{ x: 50, y: 50 }}
        onComplete={() => setShowConfetti(false)}
      />

      <AnimatePresence>
        {show && phase !== 'done' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="celebration-backdrop flex items-center justify-center"
            onClick={onComplete}
          >
            {/* Flash effect */}
            <AnimatePresence>
              {phase === 'flash' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 bg-[var(--achievement)]"
                />
              )}
            </AnimatePresence>

            {/* Content */}
            <AnimatePresence mode="wait">
              {phase === 'reveal' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Decorative stars */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        rotate: [0, 180],
                      }}
                      transition={{
                        delay: 0.2 + i * 0.1,
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                      className="absolute"
                      style={{
                        left: `${20 + (i % 3) * 30}%`,
                        top: `${20 + Math.floor(i / 3) * 60}%`,
                      }}
                    >
                      <Star className="w-8 h-8 text-[var(--achievement)] fill-[var(--achievement)]" />
                    </motion.div>
                  ))}

                  {/* LEVEL UP text with typewriter effect */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="w-8 h-8 text-[var(--achievement)]" />
                      <h1
                        className={cn(
                          'text-4xl md:text-6xl font-display font-black',
                          'bg-gradient-to-r from-[var(--achievement)] via-[var(--secondary)] to-[var(--primary)]',
                          'bg-clip-text text-transparent',
                          'drop-shadow-[0_0_30px_var(--achievement-muted)]'
                        )}
                      >
                        LEVEL UP!
                      </h1>
                      <Zap className="w-8 h-8 text-[var(--achievement)] transform scale-x-[-1]" />
                    </div>
                  </motion.div>

                  {/* Level badge transition */}
                  <div className="flex items-center gap-6 mb-8">
                    {/* Old level */}
                    <motion.div
                      initial={{ opacity: 1, scale: 1 }}
                      animate={{ opacity: 0.3, scale: 0.8 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="level-badge opacity-50"
                      style={{
                        width: 80,
                        height: 80,
                        fontSize: '2rem',
                        background: 'var(--background-tertiary)',
                        boxShadow: 'none',
                      }}
                    >
                      {fromLevel}
                    </motion.div>

                    {/* Arrow */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <svg
                        width="40"
                        height="24"
                        viewBox="0 0 40 24"
                        fill="none"
                        className="text-[var(--achievement)]"
                      >
                        <motion.path
                          d="M0 12H35M35 12L25 2M35 12L25 22"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                        />
                      </svg>
                    </motion.div>

                    {/* New level with badge-reveal animation */}
                    <motion.div
                      initial={{ rotateY: 90, scale: 0.5, opacity: 0 }}
                      animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                      transition={{
                        delay: 0.6,
                        duration: 0.6,
                        type: 'spring',
                        damping: 12,
                      }}
                      className="level-badge"
                    >
                      {toLevel}
                    </motion.div>
                  </div>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-xl text-[var(--foreground-muted)]"
                  >
                    Your power grows, Champion!
                  </motion.p>

                  {/* Crown decoration */}
                  <motion.div
                    initial={{ opacity: 0, y: 20, rotate: -10 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ delay: 1, type: 'spring' }}
                    className="mt-6"
                  >
                    <Crown className="w-12 h-12 text-[var(--secondary)]" />
                  </motion.div>

                  {/* Tap to continue hint */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.5, 0.5] }}
                    transition={{ delay: 2, duration: 0.5 }}
                    className="mt-8 text-sm text-[var(--foreground-subtle)]"
                  >
                    Tap anywhere to continue
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default LevelUpCelebration;
