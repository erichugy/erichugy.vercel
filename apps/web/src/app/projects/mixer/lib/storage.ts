/**
 * Music Mixer - Storage Layer
 * Handles persistent storage of mixes using localStorage
 */

import type { Mix } from './types';
import { isMix } from './types';
import {
  STORAGE_KEYS,
  STORAGE_VERSION,
  STORAGE_SIZE_WARNING_THRESHOLD,
} from './constants';

/**
 * Storage metadata for versioning and compatibility
 */
interface StorageMetadata {
  version: number;
  lastUpdated: number;
}

/**
 * Wrap stored data with metadata
 */
interface StoredData<T> {
  metadata: StorageMetadata;
  data: T;
}

/**
 * Check if localStorage is available and writable
 * Necessary for SSR and private browsing mode
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get estimated size of stored data (bytes)
 * Approximate calculation based on JSON string length
 */
function getStorageSize(key: string): number {
  const data = localStorage.getItem(key);
  if (!data) return 0;
  // Rough approximation: 1 character ≈ 1 byte
  return data.length * 2; // UTF-16 encoding
}

/**
 * Warn if storage is getting full
 */
function checkStorageWarnings(): void {
  try {
    const mixesSize = getStorageSize(STORAGE_KEYS.MIXES);
    if (mixesSize > STORAGE_SIZE_WARNING_THRESHOLD) {
      console.warn(
        `[Mixer Storage] Storage usage is high (${Math.round(mixesSize / 1024 / 1024)}MB). Consider archiving old mixes.`
      );
    }
  } catch (e) {
    // Silently fail - don't crash on warnings
  }
}

/**
 * Save mixes array to localStorage
 * Includes error handling and size warnings
 */
export function saveMixes(mixes: Mix[]): void {
  if (!isStorageAvailable()) {
    console.warn(
      '[Mixer Storage] localStorage is not available. Changes will not persist.'
    );
    return;
  }

  try {
    // Validate all mixes before saving
    const validMixes = mixes.filter((mix) => isMix(mix));
    if (validMixes.length !== mixes.length) {
      console.warn(
        `[Mixer Storage] ${mixes.length - validMixes.length} invalid mixes were skipped.`
      );
    }

    const stored: StoredData<Mix[]> = {
      metadata: {
        version: STORAGE_VERSION,
        lastUpdated: Date.now(),
      },
      data: validMixes,
    };

    localStorage.setItem(STORAGE_KEYS.MIXES, JSON.stringify(stored));
    checkStorageWarnings();
  } catch (e) {
    console.error('[Mixer Storage] Failed to save mixes:', e);
    // Silently fail - don't throw, let app continue
  }
}

/**
 * Load mixes array from localStorage
 * Includes validation and backward compatibility
 */
export function loadMixes(): Mix[] {
  if (!isStorageAvailable()) {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MIXES);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as StoredData<Mix[]>;

    // Check version compatibility
    if (parsed.metadata?.version !== STORAGE_VERSION) {
      console.warn(
        `[Mixer Storage] Storage version mismatch. Expected ${STORAGE_VERSION}, got ${parsed.metadata?.version}`
      );
      // Could implement migration logic here if needed
    }

    // Validate all mixes
    if (!Array.isArray(parsed.data)) {
      console.error('[Mixer Storage] Stored mixes are not an array');
      return [];
    }

    const validMixes = parsed.data.filter((mix) => isMix(mix));
    if (validMixes.length !== parsed.data.length) {
      console.warn(
        `[Mixer Storage] ${parsed.data.length - validMixes.length} invalid mixes were filtered out.`
      );
    }

    return validMixes;
  } catch (e) {
    console.error('[Mixer Storage] Failed to load mixes:', e);
    return [];
  }
}

/**
 * Get the current/active mix ID from localStorage
 */
export function getCurrentMixId(): string | null {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    const id = localStorage.getItem(STORAGE_KEYS.CURRENT_MIX_ID);
    return id && typeof id === 'string' ? id : null;
  } catch (e) {
    console.error('[Mixer Storage] Failed to get current mix ID:', e);
    return null;
  }
}

/**
 * Set the current/active mix ID
 */
export function setCurrentMixId(id: string | null): void {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    if (id === null) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_MIX_ID);
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_MIX_ID, id);
    }
  } catch (e) {
    console.error('[Mixer Storage] Failed to set current mix ID:', e);
  }
}

/**
 * Clear all mixer-related data from localStorage
 * Useful for reset/cleanup operations
 */
export function clearAllMixerData(): void {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (e) {
    console.error('[Mixer Storage] Failed to clear data:', e);
  }
}

/**
 * Export all mixer data as a blob for backup/sharing
 */
export function exportMixerData(): Blob {
  const mixes = loadMixes();
  const currentId = getCurrentMixId();

  const exportData = {
    version: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    mixes,
    currentMixId: currentId,
  };

  return new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
}

/**
 * Import mixer data from a blob/file
 * Validates and merges with existing data
 */
export function importMixerData(blob: Blob): Promise<{
  success: boolean;
  message: string;
  mixes: Mix[];
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);

        if (!Array.isArray(importData.mixes)) {
          throw new Error('Invalid import data: mixes must be an array');
        }

        const validMixes = importData.mixes.filter((mix: unknown) =>
          isMix(mix)
        );

        resolve({
          success: true,
          message: `Imported ${validMixes.length} mixes`,
          mixes: validMixes,
        });
      } catch (e) {
        resolve({
          success: false,
          message: `Import failed: ${(e as Error).message}`,
          mixes: [],
        });
      }
    };
    reader.onerror = () => {
      resolve({
        success: false,
        message: 'Failed to read file',
        mixes: [],
      });
    };
    reader.readAsText(blob);
  }) as Promise<{
    success: boolean;
    message: string;
    mixes: Mix[];
  }>;
}
