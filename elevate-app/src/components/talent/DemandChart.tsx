'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DemandData {
  id: string;
  title: string;
  growthRate: number; // percentage, e.g., 45 means +45%
  demand: number; // open positions count
}

interface DemandChartProps {
  data: DemandData[];
  maxGrowthRate?: number;
}

export function DemandChart({ data, maxGrowthRate }: DemandChartProps) {
  // Calculate max for scaling
  const max = maxGrowthRate || Math.max(...data.map(d => Math.abs(d.growthRate)), 50);

  // Sort by growth rate descending
  const sortedData = [...data].sort((a, b) => b.growthRate - a.growthRate);

  return (
    <div className="space-y-4">
      {sortedData.map((item, index) => {
        const isPositive = item.growthRate >= 0;
        const width = (Math.abs(item.growthRate) / max) * 100;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium truncate max-w-[60%]">
                {item.title}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--foreground-muted)]">
                  {item.demand.toLocaleString()} positions
                </span>
                <span
                  className={cn(
                    'flex items-center gap-1 text-sm font-bold',
                    isPositive ? 'text-[var(--success)]' : 'text-[var(--error)]'
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {isPositive ? '+' : ''}{item.growthRate}%
                </span>
              </div>
            </div>

            <div className="relative h-6 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  'absolute h-full rounded-full',
                  isPositive
                    ? 'bg-gradient-to-r from-[var(--success)] to-[var(--success-muted)] left-0'
                    : 'bg-gradient-to-r from-[var(--error-muted)] to-[var(--error)] right-0'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
              />

              {/* Glow effect on hover */}
              <motion.div
                className={cn(
                  'absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity',
                  isPositive
                    ? 'bg-[var(--success)]'
                    : 'bg-[var(--error)]'
                )}
                style={{ filter: 'blur(8px)', mixBlendMode: 'overlay' }}
              />

              {/* Value label inside bar */}
              {width > 20 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={cn(
                    'absolute top-1/2 transform -translate-y-1/2 text-xs font-bold text-white',
                    isPositive ? 'left-3' : 'right-3'
                  )}
                >
                  {isPositive ? '+' : ''}{item.growthRate}%
                </motion.span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default DemandChart;
