/**
 * Music Mixer - Shared TypeScript Types
 * Portable types that work across web, React Native, and future platforms
 */

/**
 * A single sound instance within a mix
 * Represents one instance of a sound with its own volume and timing settings
 */
export interface SoundInstance {
  /** Unique ID for this instance within the mix */
  id: string;
  /** Reference to the built-in sound definition */
  soundId: string;
  /** Whether this sound is enabled in the mix */
  enabled: boolean;
  /** Volume level: 0-100 (maps to 0.0-1.0 for Web Audio) */
  volume: number;
  /** Timing offset in seconds: 0-30 (delay before sound starts) */
  offset: number;
}

/**
 * A complete mix of multiple sounds
 * Represents a saved configuration of sounds with their settings
 */
export interface Mix {
  /** Unique identifier for this mix */
  id: string;
  /** User-friendly name for the mix */
  name: string;
  /** Timestamp when the mix was created (ms since epoch) */
  createdAt: number;
  /** Timestamp when the mix was last updated (ms since epoch) */
  updatedAt: number;
  /** Array of sound instances in this mix */
  sounds: SoundInstance[];
}

/**
 * Definition of a built-in sound
 * Immutable reference to an available sound asset
 */
export interface Sound {
  /** Unique identifier for this sound */
  id: string;
  /** Display name of the sound */
  name: string;
  /** Path to audio file (relative to public folder) */
  path: string;
  /** Duration in seconds (metadata only) */
  duration: number;
}

/**
 * Playback state of the mixer
 * Describes the current playback status
 */
export interface PlaybackState {
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Current playback time in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
}

/**
 * State for the mixer application
 * Complete state snapshot for the entire mixer
 */
export interface MixerState {
  /** Currently selected mix (null if none selected) */
  currentMix: Mix | null;
  /** All saved mixes */
  mixes: Mix[];
  /** Current playback state */
  playback: PlaybackState;
  /** Loading state for initialization */
  isLoading: boolean;
  /** Error message if any operation failed */
  error: string | null;
}

/**
 * API response for mix operations
 * Standard response format for CRUD operations
 */
export interface MixOperationResult {
  /** Whether operation succeeded */
  success: boolean;
  /** The affected mix(es) */
  data?: Mix | Mix[];
  /** Error message if operation failed */
  error?: string;
}

/**
 * Type guard to check if a value is a valid Mix
 */
export function isMix(value: unknown): value is Mix {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.createdAt === 'number' &&
    typeof obj.updatedAt === 'number' &&
    Array.isArray(obj.sounds)
  );
}

/**
 * Type guard to check if a value is a valid SoundInstance
 */
export function isSoundInstance(value: unknown): value is SoundInstance {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.soundId === 'string' &&
    typeof obj.enabled === 'boolean' &&
    typeof obj.volume === 'number' &&
    typeof obj.offset === 'number'
  );
}
