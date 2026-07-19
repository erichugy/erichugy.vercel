'use client';

/**
 * Music Mixer - Mix Actions Hook
 * Provides CRUD operations for mixes
 * Uses crypto.randomUUID for ID generation
 */

import { useCallback } from 'react';
import type { Mix, SoundInstance } from '../lib/types';
import {
  BUILT_IN_SOUNDS,
  DEFAULT_SOUND_INSTANCE,
  getNextDefaultMixName,
  getNextDuplicateName,
} from '../lib/constants';

interface UseMixActionsProps {
  mixes: Mix[];
  onMixesChange: (mixes: Mix[]) => void;
}

interface UseMixActionsReturn {
  /** Create a new mix with optional name */
  createMix: (name?: string) => Mix;
  /** Delete a mix by ID */
  deleteMix: (id: string) => boolean;
  /** Rename a mix */
  renameMix: (id: string, newName: string) => boolean;
  /** Duplicate a mix with optional new name */
  duplicateMix: (id: string, newName?: string) => Mix | null;
  /** Update a sound instance in a mix */
  updateSoundInstance: (
    mixId: string,
    soundInstanceId: string,
    updates: Partial<SoundInstance>
  ) => boolean;
  /** Get mix by ID */
  getMixById: (id: string) => Mix | undefined;
}

/**
 * Generate a unique ID for new objects
 * Uses Web Crypto API for secure randomness
 */
function generateId(): string {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback: generate UUID v4 manually
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Create a new SoundInstance for a given sound
 */
function createSoundInstance(soundId: string): SoundInstance {
  return {
    id: generateId(),
    soundId,
    enabled: DEFAULT_SOUND_INSTANCE.enabled,
    volume: DEFAULT_SOUND_INSTANCE.volume,
    offset: DEFAULT_SOUND_INSTANCE.offset,
  };
}

/**
 * Create a new Mix with all built-in sounds
 */
function createNewMix(name: string): Mix {
  const now = Date.now();
  return {
    id: generateId(),
    name,
    createdAt: now,
    updatedAt: now,
    sounds: BUILT_IN_SOUNDS.map((sound) => createSoundInstance(sound.id)),
  };
}

/**
 * Hook to manage mix CRUD operations
 * Provides methods to create, update, delete, and duplicate mixes
 *
 * Usage:
 * ```tsx
 * const { createMix, deleteMix, renameMix } = useMixActions({
 *   mixes,
 *   onMixesChange: setMixes
 * });
 * ```
 */
export function useMixActions({
  mixes,
  onMixesChange,
}: UseMixActionsProps): UseMixActionsReturn {
  /**
   * Create a new mix with auto-generated name if none provided
   */
  const createMix = useCallback(
    (name?: string): Mix => {
      const finalName =
        name && name.trim()
          ? name.trim()
          : getNextDefaultMixName(mixes.map((m) => m.name));

      const newMix = createNewMix(finalName);
      onMixesChange([...mixes, newMix]);
      return newMix;
    },
    [mixes, onMixesChange]
  );

  /**
   * Delete a mix by ID
   * Returns true if successful, false if not found
   */
  const deleteMix = useCallback(
    (id: string): boolean => {
      const initialLength = mixes.length;
      const updated = mixes.filter((mix) => mix.id !== id);

      if (updated.length === initialLength) {
        console.warn(`[Mixer] Mix with ID ${id} not found`);
        return false;
      }

      onMixesChange(updated);
      return true;
    },
    [mixes, onMixesChange]
  );

  /**
   * Rename a mix
   * Returns true if successful, false if not found
   */
  const renameMix = useCallback(
    (id: string, newName: string): boolean => {
      const trimmedName = newName.trim();
      if (!trimmedName) {
        console.warn('[Mixer] Cannot rename mix to empty name');
        return false;
      }

      const mixIndex = mixes.findIndex((m) => m.id === id);
      if (mixIndex === -1) {
        console.warn(`[Mixer] Mix with ID ${id} not found`);
        return false;
      }

      const updated = [...mixes];
      updated[mixIndex] = {
        ...updated[mixIndex],
        name: trimmedName,
        updatedAt: Date.now(),
      };

      onMixesChange(updated);
      return true;
    },
    [mixes, onMixesChange]
  );

  /**
   * Duplicate a mix with optional new name
   * Returns the new mix or null if original not found
   */
  const duplicateMix = useCallback(
    (id: string, newName?: string): Mix | null => {
      const original = mixes.find((m) => m.id === id);
      if (!original) {
        console.warn(`[Mixer] Mix with ID ${id} not found`);
        return null;
      }

      const finalName =
        newName && newName.trim()
          ? newName.trim()
          : getNextDuplicateName(
              original.name,
              mixes.map((m) => m.name)
            );

      const duplicate: Mix = {
        ...original,
        id: generateId(),
        name: finalName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        sounds: original.sounds.map((sound) => ({
          ...sound,
          id: generateId(), // New IDs for sound instances
        })),
      };

      onMixesChange([...mixes, duplicate]);
      return duplicate;
    },
    [mixes, onMixesChange]
  );

  /**
   * Update a sound instance in a mix
   * Returns true if successful, false if not found
   */
  const updateSoundInstance = useCallback(
    (
      mixId: string,
      soundInstanceId: string,
      updates: Partial<SoundInstance>
    ): boolean => {
      const mixIndex = mixes.findIndex((m) => m.id === mixId);
      if (mixIndex === -1) {
        console.warn(`[Mixer] Mix with ID ${mixId} not found`);
        return false;
      }

      const mix = mixes[mixIndex];
      const soundIndex = mix.sounds.findIndex((s) => s.id === soundInstanceId);
      if (soundIndex === -1) {
        console.warn(
          `[Mixer] Sound instance with ID ${soundInstanceId} not found in mix ${mixId}`
        );
        return false;
      }

      const updated = [...mixes];
      updated[mixIndex] = {
        ...mix,
        sounds: [...mix.sounds],
        updatedAt: Date.now(),
      };

      // Apply updates to the sound instance
      updated[mixIndex].sounds[soundIndex] = {
        ...mix.sounds[soundIndex],
        ...updates,
        // Always preserve the ID
        id: soundInstanceId,
      };

      onMixesChange(updated);
      return true;
    },
    [mixes, onMixesChange]
  );

  /**
   * Get a mix by ID
   */
  const getMixById = useCallback(
    (id: string): Mix | undefined => {
      return mixes.find((m) => m.id === id);
    },
    [mixes]
  );

  return {
    createMix,
    deleteMix,
    renameMix,
    duplicateMix,
    updateSoundInstance,
    getMixById,
  };
}
