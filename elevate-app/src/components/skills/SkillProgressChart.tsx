'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import type { SkillCategory } from '@/lib/supabase/types';

const categoryColors: Record<SkillCategory, string> = {
  KNOWLEDGE: '#3B82F6',
  SKILL: '#22C55E',
  COMPETENCE: '#8B5CF6',
  TRANSVERSAL: '#F97316',
  LANGUAGE: '#06B6D4',
};

interface SkillDataPoint {
  category: SkillCategory;
  value: number;
  maxValue?: number;
}

interface SkillProgressChartProps {
  data: SkillDataPoint[];
  type?: 'radar' | 'bar';
  showLabels?: boolean;
  showValues?: boolean;
  animated?: boolean;
  className?: string;
}

interface ChartProps extends SkillProgressChartProps {
  categoryLabels: Record<SkillCategory, string>;
  t: ReturnType<typeof useTranslations>;
}

export function SkillProgressChart({
  data,
  type = 'bar',
  showLabels = true,
  showValues = true,
  animated = true,
  className,
}: SkillProgressChartProps) {
  const t = useTranslations('skills');

  // Category labels from translations
  const categoryLabels: Record<SkillCategory, string> = {
    KNOWLEDGE: t('categories.KNOWLEDGE'),
    SKILL: t('categories.SKILL'),
    COMPETENCE: t('categories.COMPETENCE'),
    TRANSVERSAL: t('categories.TRANSVERSAL'),
    LANGUAGE: t('categories.LANGUAGE'),
  };

  if (type === 'radar') {
    return (
      <RadarChart
        data={data}
        showLabels={showLabels}
        showValues={showValues}
        animated={animated}
        className={className}
        categoryLabels={categoryLabels}
        t={t}
      />
    );
  }

  return (
    <BarChart
      data={data}
      showLabels={showLabels}
      showValues={showValues}
      animated={animated}
      className={className}
      categoryLabels={categoryLabels}
      t={t}
    />
  );
}

function BarChart({
  data,
  showLabels,
  showValues,
  animated,
  className,
  categoryLabels,
  t,
}: ChartProps) {
  const maxValue = Math.max(...data.map((d) => d.maxValue || 7));

  return (
    <div className={cn('space-y-4', className)}>
      {data.map((item, index) => {
        const percentage = (item.value / (item.maxValue || maxValue)) * 100;
        const color = categoryColors[item.category];

        return (
          <div key={item.category} className="space-y-1">
            {showLabels && (
              <div className="flex justify-between text-sm">
                <span className="font-medium">{categoryLabels[item.category]}</span>
                {showValues && (
                  <span className="text-[var(--foreground-muted)]">
                    {t('chart.level', { level: item.value })}
                  </span>
                )}
              </div>
            )}
            <div className="h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
              <motion.div
                initial={animated ? { width: 0 } : { width: `${percentage}%` }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RadarChart({
  data,
  showLabels,
  showValues,
  animated,
  className,
  categoryLabels,
}: ChartProps) {
  const size = 240;
  const center = size / 2;
  const maxRadius = (size / 2) - 50;
  const levels = 7;

  const points = useMemo(() => {
    return data.map((item, index) => {
      const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
      const value = item.value / (item.maxValue || 7);
      const x = center + Math.cos(angle) * maxRadius * value;
      const y = center + Math.sin(angle) * maxRadius * value;
      const labelX = center + Math.cos(angle) * (maxRadius + 35);
      const labelY = center + Math.sin(angle) * (maxRadius + 35);

      // Calculate textAnchor based on angle position
      // Convert angle to degrees (0-360) for easier reasoning
      const angleDeg = ((angle + Math.PI / 2) * 180 / Math.PI + 360) % 360;
      let textAnchor: 'start' | 'middle' | 'end' = 'middle';
      let dominantBaseline: 'middle' | 'hanging' | 'auto' = 'middle';

      // Left side (135-225 degrees): end anchor
      if (angleDeg > 135 && angleDeg < 225) {
        textAnchor = 'end';
      }
      // Right side (315-360 or 0-45 degrees): start anchor
      else if (angleDeg > 315 || angleDeg < 45) {
        textAnchor = 'start';
      }
      // Top (45-135): hanging baseline
      if (angleDeg >= 45 && angleDeg <= 135) {
        dominantBaseline = 'hanging';
      }
      // Bottom (225-315): auto baseline
      else if (angleDeg >= 225 && angleDeg <= 315) {
        dominantBaseline = 'auto';
      }

      return { ...item, x, y, labelX, labelY, angle, textAnchor, dominantBaseline };
    });
  }, [data, center, maxRadius]);

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ') + ' Z';

  return (
    <div className={cn('flex justify-center', className)}>
      <svg width={size} height={size} viewBox="-40 -20 320 280">
        {/* Grid circles */}
        {Array.from({ length: levels }).map((_, i) => {
          const radius = (maxRadius / levels) * (i + 1);
          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="var(--border)"
              strokeWidth="1"
              opacity={0.3}
            />
          );
        })}

        {/* Axis lines */}
        {points.map((point, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + Math.cos(point.angle) * maxRadius}
            y2={center + Math.sin(point.angle) * maxRadius}
            stroke="var(--border)"
            strokeWidth="1"
            opacity={0.3}
          />
        ))}

        {/* Data polygon */}
        <motion.path
          d={pathD}
          fill="var(--primary)"
          fillOpacity={0.2}
          stroke="var(--primary)"
          strokeWidth="2"
          initial={animated ? { opacity: 0, scale: 0.5 } : undefined}
          animate={{ opacity: 1, scale: 1 }}
          style={{ transformOrigin: `${center}px ${center}px` }}
          transition={{ duration: 0.5 }}
        />

        {/* Data points */}
        {points.map((point, i) => (
          <motion.circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={categoryColors[point.category]}
            initial={animated ? { scale: 0 } : undefined}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
          />
        ))}

        {/* Labels */}
        {showLabels &&
          points.map((point, i) => (
            <text
              key={i}
              x={point.labelX}
              y={point.labelY}
              textAnchor={point.textAnchor}
              dominantBaseline={point.dominantBaseline}
              fill="var(--foreground-muted)"
              fontSize="11"
            >
              {categoryLabels[point.category]}
              {showValues && ` (${point.value})`}
            </text>
          ))}
      </svg>
    </div>
  );
}
