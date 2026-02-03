'use client';

import { motion } from 'framer-motion';
import { Lock, CheckCircle, Circle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Skill {
  id: string;
  name: string;
  level: 'mastered' | 'in-progress' | 'locked';
  prerequisites?: string[];
  category: string;
  xpRequired?: number;
  xpCurrent?: number;
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: Skill[];
}

interface SkillTreeProps {
  categories: SkillCategory[];
  onSkillClick?: (skill: Skill) => void;
}

export function SkillTree({ categories, onSkillClick }: SkillTreeProps) {
  const getStatusIcon = (level: Skill['level']) => {
    switch (level) {
      case 'mastered':
        return <CheckCircle className="w-4 h-4 text-[var(--success)]" />;
      case 'in-progress':
        return <Circle className="w-4 h-4 text-[var(--primary)]" />;
      case 'locked':
        return <Lock className="w-4 h-4 text-[var(--foreground-muted)]" />;
    }
  };

  const getStatusStyles = (level: Skill['level']) => {
    switch (level) {
      case 'mastered':
        return 'border-[var(--success)] bg-[var(--success-muted)]';
      case 'in-progress':
        return 'border-[var(--primary)] bg-[var(--primary-muted)]';
      case 'locked':
        return 'border-[var(--border)] bg-[var(--background-tertiary)] opacity-60';
    }
  };

  return (
    <div className="space-y-8">
      {categories.map((category, categoryIndex) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: categoryIndex * 0.1 }}
        >
          <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
            {category.name}
          </h3>

          <div className="relative">
            {/* Connection lines */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-[var(--border)]" />

            <div className="space-y-3">
              {category.skills.map((skill, skillIndex) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: categoryIndex * 0.1 + skillIndex * 0.05 }}
                  className="relative"
                >
                  {/* Horizontal connector */}
                  <div className="absolute left-6 top-1/2 w-4 h-px bg-[var(--border)]" />

                  <button
                    onClick={() => skill.level !== 'locked' && onSkillClick?.(skill)}
                    disabled={skill.level === 'locked'}
                    className={cn(
                      'ml-12 w-full text-left p-4 rounded-xl border-2 transition-all',
                      getStatusStyles(skill.level),
                      skill.level !== 'locked' && 'hover:shadow-md cursor-pointer'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(skill.level)}
                        <span className={cn(
                          'font-medium',
                          skill.level === 'locked' && 'text-[var(--foreground-muted)]'
                        )}>
                          {skill.name}
                        </span>
                      </div>

                      {skill.level === 'in-progress' && skill.xpRequired && skill.xpCurrent !== undefined && (
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                            <motion.div
                              className="h-full progress-gradient"
                              initial={{ width: 0 }}
                              animate={{ width: `${(skill.xpCurrent / skill.xpRequired) * 100}%` }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                            />
                          </div>
                          <span className="text-xs text-[var(--foreground-muted)]">
                            {skill.xpCurrent}/{skill.xpRequired} XP
                          </span>
                        </div>
                      )}

                      {skill.level !== 'locked' && (
                        <ChevronRight className="w-4 h-4 text-[var(--foreground-muted)]" />
                      )}
                    </div>

                    {skill.prerequisites && skill.prerequisites.length > 0 && skill.level === 'locked' && (
                      <p className="text-xs text-[var(--foreground-muted)] mt-2 ml-7">
                        Requires: {skill.prerequisites.join(', ')}
                      </p>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default SkillTree;
