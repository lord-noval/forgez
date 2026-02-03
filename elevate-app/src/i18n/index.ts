// i18n module exports
// Centralized exports for internationalization utilities

// Note: The server config is in src/i18n.ts (used by next-intl plugin)
// This file exports client-side utilities only

export * from './config';
export { useWorldLabelsI18n, useWorldTerminology, useWorldMeta, useLabelsForWorld } from './use-world-labels';
export type { WorldLabelsI18n } from './use-world-labels';
