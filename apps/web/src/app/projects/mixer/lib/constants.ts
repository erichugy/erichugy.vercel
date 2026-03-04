/**
 * Music Mixer - Constants
 * Built-in sounds and configuration constants
 */

import type { Sound } from './types';

/**
 * Array of 8 built-in nature sounds
 * These are the core sounds available in the mixer
 */
export const BUILT_IN_SOUNDS: Sound[] = [
  {
    id: 'rain',
    name: 'Rain',
    path: '/sounds/rain.mp3',
    duration: 120, // 2 minutes default
  },
  {
    id: 'thunder',
    name: 'Thunder',
    path: '/sounds/thunder.mp3',
    duration: 90, // 1.5 minutes default
  },
  {
    id: 'fireplace',
    name: 'Fireplace',
    path: '/sounds/fireplace.mp3',
    duration: 180, // 3 minutes default
  },
  {
    id: 'birds',
    name: 'Birds',
    path: '/sounds/birds.mp3',
    duration: 120, // 2 minutes default
  },
  {
    id: 'wind',
    name: 'Wind',
    path: '/sounds/wind.mp3',
    duration: 150, // 2.5 minutes default
  },
  {
    id: 'ocean',
    name: 'Ocean',
    path: '/sounds/ocean.mp3',
    duration: 180, // 3 minutes default
  },
  {
    id: 'forest',
    name: 'Forest',
    path: '/sounds/forest.mp3',
    duration: 120, // 2 minutes default
  },
  {
    id: 'stream',
    name: 'Stream',
    path: '/sounds/stream.mp3',
    duration: 150, // 2.5 minutes default
  },
];

/**
 * Create a sound lookup map for quick access
 */
export const SOUND_MAP = new Map(
  BUILT_IN_SOUNDS.map((sound) => [sound.id, sound])
);

/**
 * Default values for sound instances
 */
export const DEFAULT_SOUND_INSTANCE = {
  volume: 70, // 70% default volume
  offset: 0, // No offset by default
  enabled: true, // Enabled by default
} as const;

/**
 * Mixer configuration constants
 */
export const MIXER_CONFIG = {
  MIN_VOLUME: 0,
  MAX_VOLUME: 100,
  DEFAULT_VOLUME: 70,
  MIN_OFFSET: 0,
  MAX_OFFSET: 30, // 30 seconds max offset
  DEFAULT_OFFSET: 0,
  MIN_MIX_DURATION: 120, // Minimum 2 minutes
  MAX_MIX_DURATION: 3600, // Maximum 1 hour
} as const;

/**
 * localStorage key constants
 */
export const STORAGE_KEYS = {
  MIXES: 'mixer_mixes',
  CURRENT_MIX_ID: 'mixer_current_id',
  LAST_USED_SETTINGS: 'mixer_settings',
} as const;

/**
 * Default mix name for auto-generated names
 */
export const DEFAULT_MIX_NAME_PREFIX = 'My Mix';

/**
 * Get next default mix name based on existing mixes
 * Example: "My Mix 1", "My Mix 2", etc.
 */
export function getNextDefaultMixName(existingNames: string[]): string {
  let counter = 1;
  let name = `${DEFAULT_MIX_NAME_PREFIX} ${counter}`;

  while (existingNames.includes(name)) {
    counter++;
    name = `${DEFAULT_MIX_NAME_PREFIX} ${counter}`;
  }

  return name;
}

/**
 * Get next duplicate name for copied mixes
 * Example: "Original (copy)", "Original (copy 2)", etc.
 */
export function getNextDuplicateName(
  baseName: string,
  existingNames: string[]
): string {
  let name = `${baseName} (copy)`;
  let counter = 2;

  while (existingNames.includes(name)) {
    name = `${baseName} (copy ${counter})`;
    counter++;
  }

  return name;
}

/**
 * Maximum file size for localStorage (typical ~5-10MB)
 * Safety threshold to prevent exceeding limits
 */
export const STORAGE_SIZE_WARNING_THRESHOLD = 4 * 1024 * 1024; // 4MB

/**
 * Default debounce delay for auto-save operations (ms)
 */
export const AUTO_SAVE_DEBOUNCE_MS = 500;

/**
 * Metadata version for storage compatibility checking
 * Increment this if storage schema changes
 */
export const STORAGE_VERSION = 1;
