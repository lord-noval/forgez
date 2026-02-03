"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AchievementBadge, rarityStyles } from "./AchievementBadge";
import type { PendingAchievementUnlock } from "@/types/achievements";
import { useTranslations } from "next-intl";

// ============================================================================
// Confetti Particle Component
// ============================================================================

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
}

function generateConfetti(count: number, colors: string[]): ConfettiParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -20 - Math.random() * 20,
    rotation: Math.random() * 360,
    scale: 0.5 + Math.random() * 0.5,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.3,
  }));
}

function ConfettiExplosion({ intensity }: { intensity: "subtle" | "normal" | "epic" }) {
  const confettiCounts = {
    subtle: 20,
    normal: 40,
    epic: 80,
  };

  const colors = {
    subtle: ["#71717a", "#a1a1aa"],
    normal: ["#22c55e", "#3b82f6", "#8b5cf6"],
    epic: ["#f97316", "#eab308", "#22d3ee", "#ec4899", "#8b5cf6"],
  };

  const particles = React.useMemo(
    () => generateConfetti(confettiCounts[intensity], colors[intensity]),
    [intensity]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: `${particle.x}%`,
            backgroundColor: particle.color,
          }}
          initial={{
            y: particle.y,
            rotate: particle.rotation,
            scale: particle.scale,
            opacity: 1,
          }}
          animate={{
            y: 500,
            rotate: particle.rotation + 720,
            opacity: 0,
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: particle.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Achievement Unlock Modal
// ============================================================================

interface AchievementUnlockModalProps {
  pendingUnlock: PendingAchievementUnlock | null;
  onClose: () => void;
  onViewAll?: () => void;
}

export function AchievementUnlockModal({
  pendingUnlock,
  onClose,
  onViewAll,
}: AchievementUnlockModalProps) {
  const t = useTranslations("achievements");
  const [showConfetti, setShowConfetti] = React.useState(false);

  const achievement = pendingUnlock?.achievement;
  const rarity = achievement?.rarity ?? "common";
  const styles = rarityStyles[rarity];

  // Determine confetti intensity based on rarity
  const confettiIntensity: "subtle" | "normal" | "epic" =
    rarity === "legendary" || rarity === "epic"
      ? "epic"
      : rarity === "rare"
      ? "normal"
      : "subtle";

  // Trigger confetti when modal opens
  React.useEffect(() => {
    if (pendingUnlock) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [pendingUnlock]);

  if (!pendingUnlock || !achievement) return null;

  return (
    <AnimatePresence>
      {pendingUnlock && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
          >
            {/* Confetti */}
            {showConfetti && <ConfettiExplosion intensity={confettiIntensity} />}

            {/* Content */}
            <div
              className={cn(
                "relative rounded-2xl border-2 p-8 text-center",
                "bg-[var(--background-secondary)]/95 backdrop-blur-xl",
                styles.border,
                (rarity === "epic" || rarity === "legendary") && `shadow-2xl ${styles.glow}`
              )}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-1 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-center gap-2 mb-6"
              >
                <Sparkles className={cn("w-5 h-5", styles.text)} />
                <span className={cn("text-sm font-medium uppercase tracking-wider", styles.text)}>
                  {t("unlocked.title")}
                </span>
                <Sparkles className={cn("w-5 h-5", styles.text)} />
              </motion.div>

              {/* Badge with animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
                className="mb-6"
              >
                <AchievementBadge
                  achievement={{ ...achievement, isUnlocked: true }}
                  size="lg"
                  animated={false}
                />
              </motion.div>

              {/* Achievement name */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold font-display mb-2"
              >
                {achievement.name}
              </motion.h2>

              {/* Achievement description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-[var(--foreground-muted)] mb-4"
              >
                {achievement.description}
              </motion.p>

              {/* Rarity badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 }}
                className="mb-6"
              >
                <Badge variant={rarity} className="capitalize">
                  {rarity}
                </Badge>
              </motion.div>

              {/* XP Reward with counter animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-2 mb-8 p-4 rounded-xl bg-[var(--background-tertiary)]"
              >
                <Zap className="w-5 h-5 text-[var(--xp)]" />
                <span className="text-lg font-bold text-[var(--xp)]">
                  +{pendingUnlock.xpAwarded} XP
                </span>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex gap-3 justify-center"
              >
                <Button variant="secondary" onClick={onClose}>
                  {t("unlocked.continue")}
                </Button>
                {onViewAll && (
                  <Button onClick={onViewAll}>
                    {t("unlocked.viewAll")}
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export { ConfettiExplosion };
