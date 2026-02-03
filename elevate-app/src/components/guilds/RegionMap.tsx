'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  COUNTRIES,
  CountryId,
  GRID_PATTERN_ID,
  GLOW_FILTER_ID,
  getCountryIds,
} from './country-paths';

export type Region = 'Poland' | 'Germany' | 'Ukraine' | 'USA';

interface RegionData {
  id: Region;
  name: string;
  flag: string;
  companyCount: number;
  position: { x: number; y: number };
}

interface RegionMapProps {
  regions: RegionData[];
  selectedRegion: string;
  onRegionSelect: (region: Region | 'all') => void;
}

export function RegionMap({ regions, selectedRegion, onRegionSelect }: RegionMapProps) {
  const countryIds = getCountryIds();

  // Find region data by country ID
  const getRegionData = (countryId: CountryId): RegionData | undefined => {
    return regions.find((r) => r.id === countryId);
  };

  return (
    <div className="relative w-full aspect-[2/1] bg-[var(--background-secondary)] rounded-xl border border-[var(--border)] overflow-hidden">
      {/* SVG Map */}
      <svg
        viewBox="0 0 600 300"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Definitions */}
        <defs>
          {/* Tech grid pattern */}
          <pattern
            id={GRID_PATTERN_ID}
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 30 0 L 0 0 0 30"
              fill="none"
              stroke="var(--border)"
              strokeWidth="0.5"
              opacity="0.3"
            />
          </pattern>

          {/* Glow filter for selected country */}
          <filter id={GLOW_FILTER_ID} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient for selected country */}
          <linearGradient id="selected-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.2" />
          </linearGradient>

          {/* Hover gradient */}
          <linearGradient id="hover-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Grid background */}
        <rect
          width="100%"
          height="100%"
          fill={`url(#${GRID_PATTERN_ID})`}
        />

        {/* Ocean/Background decoration */}
        <ellipse
          cx="200"
          cy="150"
          rx="180"
          ry="100"
          fill="var(--accent)"
          opacity="0.03"
        />
        <ellipse
          cx="490"
          cy="140"
          rx="120"
          ry="80"
          fill="var(--primary)"
          opacity="0.03"
        />

        {/* Render countries */}
        {countryIds.map((countryId, index) => {
          const country = COUNTRIES[countryId];
          const regionData = getRegionData(countryId);
          const isSelected = selectedRegion === countryId;
          const isAll = selectedRegion === 'all';
          const isActive = isSelected || isAll;

          return (
            <g key={countryId}>
              {/* Country shape */}
              <motion.path
                d={country.path}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                  type: 'spring',
                }}
                fill={
                  isSelected
                    ? 'url(#selected-gradient)'
                    : isAll
                      ? 'rgba(38, 26, 20, 0.4)'
                      : 'rgba(38, 26, 20, 0.2)'
                }
                stroke={isSelected ? 'var(--primary)' : 'var(--border)'}
                strokeWidth={isSelected ? 2 : 1}
                filter={isSelected ? `url(#${GLOW_FILTER_ID})` : undefined}
                className={cn(
                  'cursor-pointer transition-all duration-300',
                  !isSelected && 'hover:fill-[url(#hover-gradient)] hover:stroke-[var(--primary)]'
                )}
                style={{
                  transformOrigin: `${country.center.x}px ${country.center.y}px`,
                }}
                onClick={() => onRegionSelect(isSelected ? 'all' : countryId)}
              />

              {/* Pulse ring for selected country */}
              {isSelected && (
                <motion.path
                  d={country.path}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth={1}
                  initial={{ opacity: 0.5, scale: 1 }}
                  animate={{
                    opacity: [0.5, 0, 0.5],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{
                    transformOrigin: `${country.center.x}px ${country.center.y}px`,
                  }}
                />
              )}

              {/* Country label */}
              <motion.g
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                {/* Flag + Name container */}
                <foreignObject
                  x={country.center.x - 35}
                  y={country.center.y - 25}
                  width="70"
                  height="50"
                  className="pointer-events-none"
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    {/* Flag */}
                    <span className="text-lg drop-shadow-lg">
                      {regionData?.flag || ''}
                    </span>
                    {/* Country name */}
                    <span
                      className={cn(
                        'text-[10px] font-semibold tracking-wide mt-0.5',
                        'drop-shadow-lg',
                        isSelected
                          ? 'text-[var(--primary)]'
                          : 'text-[var(--foreground-muted)]'
                      )}
                    >
                      {regionData?.name || countryId}
                    </span>
                    {/* Company count */}
                    {regionData && (
                      <span className="text-[8px] text-[var(--foreground-subtle)]">
                        {regionData.companyCount} {regionData.companyCount === 1 ? 'guild' : 'guilds'}
                      </span>
                    )}
                  </div>
                </foreignObject>
              </motion.g>
            </g>
          );
        })}

        {/* Decorative connection lines between European countries */}
        <motion.path
          d="M 112 120 Q 150 100 185 115"
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
          strokeDasharray="4 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ delay: 0.5, duration: 1 }}
        />
        <motion.path
          d="M 185 115 Q 235 100 290 120"
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
          strokeDasharray="4 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ delay: 0.7, duration: 1 }}
        />

        {/* Transatlantic connection line */}
        <motion.path
          d="M 350 125 Q 400 80 420 95"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1"
          strokeDasharray="6 6"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.2 }}
          transition={{ delay: 1, duration: 1.5 }}
        />
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <button
          onClick={() => onRegionSelect('all')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
            selectedRegion === 'all'
              ? 'bg-[var(--primary)] text-white shadow-[0_0_15px_var(--primary-muted)]'
              : 'bg-[var(--background-tertiary)] text-[var(--foreground-muted)] hover:bg-[var(--primary-muted)] hover:text-[var(--primary)]'
          )}
        >
          All Regions
        </button>
      </div>

      {/* Selected region info panel */}
      {selectedRegion !== 'all' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className={cn(
            'absolute top-3 right-3 p-3 rounded-lg',
            'bg-[var(--background)] border border-[var(--primary)]',
            'shadow-[0_0_20px_var(--primary-muted)]'
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">
              {regions.find((r) => r.id === selectedRegion)?.flag}
            </span>
            <p className="text-sm font-display font-semibold text-[var(--primary)]">
              {regions.find((r) => r.id === selectedRegion)?.name}
            </p>
          </div>
          <p className="text-xs text-[var(--foreground-muted)]">
            {regions.find((r) => r.id === selectedRegion)?.companyCount} guilds available
          </p>
        </motion.div>
      )}

      {/* Tech corner decorations */}
      <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-[var(--border)] opacity-50" />
      <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-[var(--border)] opacity-50" />
      <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-[var(--border)] opacity-50" />
      <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-[var(--border)] opacity-50" />
    </div>
  );
}

export default RegionMap;
