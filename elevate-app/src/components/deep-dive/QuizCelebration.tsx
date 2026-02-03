'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizCelebrationProps {
  show: boolean;
  xpAmount: number;
  message?: string;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  velocity: number;
}

const PARTICLE_COLORS = [
  'var(--primary)',      // Fire orange
  'var(--secondary)',    // Gold
  'var(--accent)',       // Cyan
  'var(--achievement)',  // Achievement gold
  'var(--success)',      // Green
];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 20, // Start near center
    y: 50 + (Math.random() - 0.5) * 20,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    size: 4 + Math.random() * 8,
    angle: Math.random() * 360,
    velocity: 50 + Math.random() * 100,
  }));
}

export function QuizCelebration({
  show,
  xpAmount,
  message = 'Correct!',
  onComplete,
}: QuizCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (show) {
      setParticles(generateParticles(20));
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setParticles([]);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Particles */}
          {particles.map((particle) => {
            const rad = (particle.angle * Math.PI) / 180;
            const endX = particle.x + Math.cos(rad) * particle.velocity;
            const endY = particle.y + Math.sin(rad) * particle.velocity;

            return (
              <motion.div
                key={particle.id}
                initial={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  scale: 1,
                  opacity: 1,
                }}
                animate={{
                  left: `${endX}%`,
                  top: `${endY}%`,
                  scale: 0,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.8 + Math.random() * 0.4,
                  ease: 'easeOut',
                }}
                className="absolute rounded-full"
                style={{
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                }}
              />
            );
          })}

          {/* Central celebration */}
          <div className="relative flex flex-col items-center">
            {/* Glow burst */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{
                scale: [0.5, 1.5, 1],
                opacity: [0, 0.5, 0],
              }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 -m-20 rounded-full"
              style={{
                background: 'radial-gradient(circle, var(--achievement-muted) 0%, transparent 70%)',
              }}
            />

            {/* Message */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', damping: 12 }}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-xl',
                'bg-[var(--success)] text-white',
                'font-display font-bold text-lg',
                'shadow-[0_0_30px_var(--success-muted)]'
              )}
            >
              <Sparkles className="w-5 h-5" />
              {message}
            </motion.div>

            {/* XP Badge */}
            <motion.div
              initial={{ scale: 0, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', damping: 10 }}
              className={cn(
                'mt-4 px-8 py-3 rounded-xl',
                'bg-[var(--accent)] text-white',
                'font-display font-bold text-2xl',
                'shadow-[0_0_40px_var(--accent-muted)]'
              )}
            >
              +{xpAmount} XP
            </motion.div>

            {/* Secondary sparkles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 180],
                }}
                transition={{
                  delay: 0.3 + i * 0.15,
                  duration: 0.6,
                }}
                className="absolute"
                style={{
                  left: `${30 + i * 20}%`,
                  top: `${20 + (i % 2) * 60}%`,
                }}
              >
                <Sparkles className="w-6 h-6 text-[var(--secondary)]" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default QuizCelebration;
