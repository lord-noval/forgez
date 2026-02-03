export type CountryId = 'Poland' | 'Germany' | 'Ukraine' | 'USA';

export interface CountryShape {
  id: CountryId;
  path: string;
  center: { x: number; y: number };
  // Bounding box for label positioning
  labelOffset?: { x: number; y: number };
}

/**
 * Simplified but recognizable country outlines
 * ViewBox: 0 0 600 300
 * Left side: Europe (Germany, Poland, Ukraine)
 * Right side: USA
 *
 * These paths are hand-crafted for optimal aesthetics and performance
 */
export const COUNTRIES: Record<CountryId, CountryShape> = {
  Germany: {
    id: 'Germany',
    // Simplified Germany shape - roughly rectangular with indentations
    path: `
      M 85 95
      L 95 85
      L 115 80
      L 135 85
      L 145 95
      L 150 110
      L 148 130
      L 140 145
      L 125 155
      L 105 155
      L 90 150
      L 80 140
      L 75 125
      L 75 110
      Z
    `,
    center: { x: 112, y: 120 },
    labelOffset: { x: 0, y: -5 },
  },
  Poland: {
    id: 'Poland',
    // Poland - east of Germany, larger territory
    path: `
      M 150 80
      L 175 75
      L 200 78
      L 220 85
      L 230 100
      L 228 120
      L 220 140
      L 200 152
      L 175 155
      L 155 150
      L 145 135
      L 145 115
      L 148 95
      Z
    `,
    center: { x: 185, y: 115 },
    labelOffset: { x: 0, y: -5 },
  },
  Ukraine: {
    id: 'Ukraine',
    // Ukraine - largest European country on the map, eastern position
    path: `
      M 230 75
      L 265 70
      L 300 75
      L 330 85
      L 350 100
      L 355 120
      L 350 145
      L 330 165
      L 295 175
      L 260 172
      L 235 160
      L 225 140
      L 225 110
      L 228 90
      Z
    `,
    center: { x: 290, y: 120 },
    labelOffset: { x: 0, y: -5 },
  },
  USA: {
    id: 'USA',
    // USA - continental shape on right side
    path: `
      M 420 70
      L 460 65
      L 500 68
      L 540 75
      L 570 90
      L 585 110
      L 580 140
      L 565 165
      L 535 180
      L 490 185
      L 450 180
      L 420 165
      L 405 145
      L 400 120
      L 408 95
      Z
    `,
    center: { x: 492, y: 125 },
    labelOffset: { x: 0, y: -5 },
  },
};

// Grid pattern for tech/war room aesthetic
export const GRID_PATTERN_ID = 'tech-grid-pattern';

export function getTechGridPattern(opacity: number = 0.1): string {
  return `
    <defs>
      <pattern id="${GRID_PATTERN_ID}" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" stroke-width="0.5" opacity="${opacity}"/>
      </pattern>
    </defs>
  `;
}

// Glow filter for selected country
export const GLOW_FILTER_ID = 'country-glow';

export function getGlowFilter(): string {
  return `
    <defs>
      <filter id="${GLOW_FILTER_ID}" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  `;
}

// Get all country IDs as array
export function getCountryIds(): CountryId[] {
  return Object.keys(COUNTRIES) as CountryId[];
}

// Type guard for CountryId
export function isCountryId(value: string): value is CountryId {
  return value in COUNTRIES;
}
