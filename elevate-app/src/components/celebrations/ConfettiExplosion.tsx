'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  shape: 'circle' | 'square' | 'triangle';
}

type Intensity = 'subtle' | 'normal' | 'epic';

interface ConfettiExplosionProps {
  show: boolean;
  intensity?: Intensity;
  duration?: number;
  origin?: { x: number; y: number };
  onComplete?: () => void;
}

const COLORS = [
  'var(--primary)',      // Fire orange
  'var(--secondary)',    // Gold
  'var(--accent)',       // Cyan
  'var(--achievement)',  // Achievement gold
  'var(--success)',      // Green
];

const PARTICLE_COUNTS: Record<Intensity, number> = {
  subtle: 15,
  normal: 30,
  epic: 50,
};

function generateParticles(count: number, origin: { x: number; y: number }): Particle[] {
  const shapes: Particle['shape'][] = ['circle', 'square', 'triangle'];

  return Array.from({ length: count }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const velocity = 200 + Math.random() * 300;

    return {
      id: i,
      x: origin.x,
      y: origin.y,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 10,
      rotation: Math.random() * 360,
      velocityX: Math.cos(angle) * velocity,
      velocityY: Math.sin(angle) * velocity - 200, // Bias upward
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    };
  });
}

function ParticleShape({ shape, size, color }: { shape: Particle['shape']; size: number; color: string }) {
  switch (shape) {
    case 'square':
      return (
        <div
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            boxShadow: `0 0 ${size}px ${color}`,
          }}
        />
      );
    case 'triangle':
      return (
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `${size / 2}px solid transparent`,
            borderRight: `${size / 2}px solid transparent`,
            borderBottom: `${size}px solid ${color}`,
            filter: `drop-shadow(0 0 ${size / 2}px ${color})`,
          }}
        />
      );
    case 'circle':
    default:
      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: color,
            boxShadow: `0 0 ${size}px ${color}`,
          }}
        />
      );
  }
}

export function ConfettiExplosion({
  show,
  intensity = 'normal',
  duration = 2000,
  origin = { x: 50, y: 50 },
  onComplete,
}: ConfettiExplosionProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const cleanup = useCallback(() => {
    setParticles([]);
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    if (show) {
      const count = PARTICLE_COUNTS[intensity];
      setParticles(generateParticles(count, origin));

      const timer = setTimeout(cleanup, duration);
      return () => clearTimeout(timer);
    } else {
      setParticles([]);
    }
  }, [show, intensity, origin, duration, cleanup]);

  return (
    <AnimatePresence>
      {show && particles.length > 0 && (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
          {particles.map((particle) => {
            const animDuration = 0.8 + Math.random() * 0.6;

            return (
              <motion.div
                key={particle.id}
                initial={{
                  x: `${particle.x}%`,
                  y: `${particle.y}%`,
                  scale: 1,
                  opacity: 1,
                  rotate: 0,
                }}
                animate={{
                  x: `calc(${particle.x}% + ${particle.velocityX}px)`,
                  y: `calc(${particle.y}% + ${particle.velocityY + 400}px)`, // Gravity effect
                  scale: 0,
                  opacity: 0,
                  rotate: particle.rotation + (Math.random() > 0.5 ? 360 : -360),
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: animDuration,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <ParticleShape
                  shape={particle.shape}
                  size={particle.size}
                  color={particle.color}
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}

export default ConfettiExplosion;
