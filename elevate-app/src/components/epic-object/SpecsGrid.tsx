'use client';

import { motion } from 'framer-motion';
import {
  Scale,
  Ruler,
  Zap,
  Gauge,
  DollarSign,
  Clock,
  Thermometer,
  Satellite,
  Battery,
} from 'lucide-react';

interface SpecsGridProps {
  specs: Record<string, unknown>;
}

// Map spec keys to icons and labels
const specConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; format?: (v: unknown) => string }> = {
  mass_kg: { icon: Scale, label: 'Mass', format: (v) => `${v} kg` },
  weight_kg: { icon: Scale, label: 'Weight', format: (v) => `${v} kg` },
  dimensions: { icon: Ruler, label: 'Dimensions' },
  orbit_km: { icon: Satellite, label: 'Orbit', format: (v) => `${v} km` },
  speed_kmh: { icon: Gauge, label: 'Speed', format: (v) => `${Number(v).toLocaleString()} km/h` },
  max_speed_kmh: { icon: Gauge, label: 'Max Speed', format: (v) => `${Number(v).toLocaleString()} km/h` },
  speed_ms: { icon: Gauge, label: 'Speed', format: (v) => `${v} m/s` },
  cost_usd: { icon: DollarSign, label: 'Cost' },
  lifespan_years: { icon: Clock, label: 'Lifespan', format: (v) => `${v} years` },
  runtime_min: { icon: Battery, label: 'Runtime', format: (v) => `${v} min` },
  power_hp: { icon: Zap, label: 'Power', format: (v) => `${v} HP` },
  power_source: { icon: Zap, label: 'Power Source' },
  plasma_temp_c: { icon: Thermometer, label: 'Plasma Temp', format: (v) => `${Number(v).toLocaleString()}°C` },
  brake_temp_c: { icon: Thermometer, label: 'Brake Temp', format: (v) => `${Number(v).toLocaleString()}°C` },
  payload_kg: { icon: Scale, label: 'Payload', format: (v) => `${v} kg` },
  cameras: { icon: Satellite, label: 'Cameras' },
  sensors: { icon: Satellite, label: 'Sensors' },
  laser_links: { icon: Zap, label: 'Laser Links', format: (v) => v ? 'Yes' : 'No' },
  degrees_of_freedom: { icon: Ruler, label: 'DOF' },
  magnetic_field_t: { icon: Zap, label: 'Magnetic Field', format: (v) => `${v} T` },
  plasma_volume_m3: { icon: Ruler, label: 'Plasma Volume', format: (v) => `${v} m³` },
  height_m: { icon: Ruler, label: 'Height', format: (v) => `${v} m` },
  diameter_m: { icon: Ruler, label: 'Diameter', format: (v) => `${v} m` },
  downforce_kg: { icon: Scale, label: 'Downforce', format: (v) => `${Number(v).toLocaleString()} kg` },
  acceleration_0_100_s: { icon: Gauge, label: '0-100 km/h', format: (v) => `${v}s` },
  floor_area_sqm: { icon: Ruler, label: 'Floor Area', format: (v) => `${Number(v).toLocaleString()} m²` },
  employees: { icon: Scale, label: 'Employees', format: (v) => Number(v).toLocaleString() },
  battery_gwh_year: { icon: Battery, label: 'Battery Output', format: (v) => `${v} GWh/yr` },
  vehicles_per_week: { icon: Gauge, label: 'Vehicles/Week', format: (v) => Number(v).toLocaleString() },
  solar_roof_mw: { icon: Zap, label: 'Solar Roof', format: (v) => `${v} MW` },
  first_plasma_year: { icon: Clock, label: 'First Plasma' },
  landing_date: { icon: Clock, label: 'Landing Date' },
};

export function SpecsGrid({ specs }: SpecsGridProps) {
  if (!specs || typeof specs !== 'object') {
    return null;
  }

  const entries = Object.entries(specs).filter(([key, value]) => {
    // Filter out null/undefined values and keys we don't have config for
    return value !== null && value !== undefined;
  });

  return (
    <div className="grid grid-cols-2 gap-3">
      {entries.map(([key, value], index) => {
        const config = specConfig[key] || {
          icon: Ruler,
          label: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        };
        const Icon = config.icon;
        const displayValue = config.format ? config.format(value) : String(value);

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background-tertiary)]"
          >
            <div className="w-8 h-8 rounded-md bg-[var(--primary-muted)] flex items-center justify-center">
              <Icon className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--foreground-muted)] truncate">
                {config.label}
              </p>
              <p className="text-sm font-medium text-[var(--foreground)] truncate">
                {displayValue}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
