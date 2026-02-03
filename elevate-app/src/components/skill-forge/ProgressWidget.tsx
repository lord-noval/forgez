'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Circle, Lock, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CourseProgress {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'locked';
  duration?: string;
}

interface ProgressWidgetProps {
  pathName: string;
  completionPercentage: number;
  courses: CourseProgress[];
  totalHours?: number;
  onCourseClick?: (course: CourseProgress) => void;
}

export function ProgressWidget({
  pathName,
  completionPercentage,
  courses,
  totalHours,
  onCourseClick,
}: ProgressWidgetProps) {
  const completedCount = courses.filter(c => c.status === 'completed').length;
  const currentCourse = courses.find(c => c.status === 'current');

  return (
    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-display font-semibold text-lg">{pathName}</h3>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            {completedCount} of {courses.length} courses completed
          </p>
        </div>
        {totalHours && (
          <div className="flex items-center gap-1 text-sm text-[var(--foreground-muted)]">
            <Clock className="w-4 h-4" />
            <span>{totalHours}h total</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--foreground-muted)]">Progress</span>
          <span className="text-sm font-bold text-[var(--primary)]">
            {completionPercentage}%
          </span>
        </div>
        <div className="h-3 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
          <motion.div
            className="h-full progress-gradient"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Course list */}
      <div className="space-y-2">
        {courses.map((course, index) => {
          const statusIcon = {
            completed: <CheckCircle className="w-5 h-5 text-[var(--success)]" />,
            current: (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Circle className="w-5 h-5 text-[var(--primary)]" />
              </motion.div>
            ),
            locked: <Lock className="w-5 h-5 text-[var(--foreground-muted)]" />,
          };

          return (
            <motion.button
              key={course.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => course.status !== 'locked' && onCourseClick?.(course)}
              disabled={course.status === 'locked'}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left',
                course.status === 'completed' && 'bg-[var(--success-muted)]',
                course.status === 'current' && 'bg-[var(--primary-muted)] border border-[var(--primary)]',
                course.status === 'locked' && 'bg-[var(--background-tertiary)] opacity-60',
                course.status !== 'locked' && 'hover:shadow-md cursor-pointer'
              )}
            >
              {statusIcon[course.status]}

              <div className="flex-1 min-w-0">
                <p className={cn(
                  'font-medium text-sm truncate',
                  course.status === 'locked' && 'text-[var(--foreground-muted)]'
                )}>
                  {course.title}
                </p>
                {course.duration && (
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {course.duration}
                  </p>
                )}
              </div>

              {course.status === 'current' && (
                <span className="px-2 py-0.5 rounded text-xs bg-[var(--primary)] text-white">
                  Current
                </span>
              )}

              {course.status !== 'locked' && (
                <ChevronRight className="w-4 h-4 text-[var(--foreground-muted)]" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Current course CTA */}
      {currentCourse && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 pt-6 border-t border-[var(--border)]"
        >
          <p className="text-sm text-[var(--foreground-muted)] mb-2">Continue learning:</p>
          <button
            onClick={() => onCourseClick?.(currentCourse)}
            className="w-full py-3 px-4 rounded-xl bg-[var(--primary)] text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            Resume: {currentCourse.title}
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default ProgressWidget;
