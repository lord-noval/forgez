'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface RadarDataPoint {
  trait: string;
  label: string;
  value: number; // 0-100
}

interface SuccessRadarProps {
  data: RadarDataPoint[];
  size?: number;
  showLabels?: boolean;
  animated?: boolean;
}

export function SuccessRadar({
  data,
  size = 300,
  showLabels = true,
  animated = true,
}: SuccessRadarProps) {
  const center = size / 2;
  const radius = (size / 2) - 40; // Leave room for labels
  const angleStep = (2 * Math.PI) / data.length;

  // Calculate points for the data polygon
  const dataPoints = data.map((point, index) => {
    const angle = index * angleStep - Math.PI / 2; // Start from top
    const r = (point.value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  });

  // Create path string for data polygon
  const dataPath = dataPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ') + ' Z';

  // Generate grid circles
  const gridLevels = [0.25, 0.5, 0.75, 1];

  // Calculate label positions
  const labelPositions = data.map((_, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius + 25;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid circles */}
        {gridLevels.map((level, i) => (
          <circle
            key={`grid-${i}`}
            cx={center}
            cy={center}
            r={radius * level}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity={0.5}
          />
        ))}

        {/* Axis lines */}
        {data.map((_, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);
          return (
            <line
              key={`axis-${index}`}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="var(--border)"
              strokeWidth="1"
              opacity={0.3}
            />
          );
        })}

        {/* Data polygon - filled area */}
        <motion.path
          d={dataPath}
          fill="var(--primary)"
          fillOpacity={0.2}
          stroke="var(--primary)"
          strokeWidth="2"
          initial={animated ? { opacity: 0, scale: 0.5 } : undefined}
          animate={animated ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />

        {/* Data points */}
        {dataPoints.map((point, index) => (
          <motion.circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r="6"
            fill="var(--primary)"
            stroke="var(--background)"
            strokeWidth="2"
            initial={animated ? { opacity: 0, scale: 0 } : undefined}
            animate={animated ? { opacity: 1, scale: 1 } : undefined}
            transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
          />
        ))}

        {/* Center point */}
        <circle
          cx={center}
          cy={center}
          r="4"
          fill="var(--foreground-muted)"
          opacity={0.5}
        />
      </svg>

      {/* Labels */}
      {showLabels && labelPositions.map((pos, index) => {
        const isTop = pos.y < center;
        const isLeft = pos.x < center;
        const isCenter = Math.abs(pos.x - center) < 10;

        return (
          <motion.div
            key={`label-${index}`}
            initial={animated ? { opacity: 0 } : undefined}
            animate={animated ? { opacity: 1 } : undefined}
            transition={{ delay: 0.5 + index * 0.05 }}
            className={cn(
              'absolute text-xs font-medium text-[var(--foreground-muted)]',
              'transform whitespace-nowrap'
            )}
            style={{
              left: pos.x,
              top: pos.y,
              transform: `translate(${isCenter ? '-50%' : isLeft ? '-100%' : '0%'}, ${isTop ? '-100%' : '0%'})`,
            }}
          >
            <div className={cn(
              'flex flex-col items-center gap-0.5',
              isLeft && !isCenter && 'items-end',
              !isLeft && !isCenter && 'items-start'
            )}>
              <span className="text-[var(--foreground)]">{data[index].label}</span>
              <span className="text-[var(--primary)] font-bold">{data[index].value}%</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default SuccessRadar;
