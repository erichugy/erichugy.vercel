'use client';

/**
 * Music Mixer - Mix Storage Hook
 * Manages loading and persisting mixes from localStorage
 * Handles auto-save on changes
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Mix } from '../lib/types';
import { loadMixes, saveMixes, getCurrentMixId, setCurrentMixId } from '../lib/storage';
import { AUTO_SAVE_DEBOUNCE_MS, STORAGE_KEYS } from '../lib/constants';

interface UseMixStorageReturn {
  /** All loaded mixes */
  mixes: Mix[];
  /** Currently selected mix ID */
  currentMixId: string | null;
  /** Whether data is still loading from storage */
  isLoading: boolean;
  /** Error message if loading/saving failed */
  error: string | null;
  /** Update mixes array (triggers auto-save) */
  setMixes: (mixes: Mix[]) => void;
  /** Set the current active mix */
  setCurrentMixId: (id: string | null) => void;
}

/**
 * Hook to manage mix storage with auto-save
 * Loads mixes on mount, auto-saves on changes with debouncing
 *
 * Usage:
 * ```tsx
 * const { mixes, currentMixId, setMixes, setCurrentMixId } = useMixStorage();
 * ```
 */
export function useMixStorage(): UseMixStorageReturn {
  const [mixes, setMixesState] = useState<Mix[]>([]);
  const [currentMixId, setCurrentMixIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for debouncing auto-save
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<string>('');

  /**
   * Load mixes from storage on mount
   */
  useEffect(() => {
    try {
      setIsLoading(true);
      const loadedMixes = loadMixes();
      const savedCurrentId = getCurrentMixId();

      setMixesState(loadedMixes);
      setCurrentMixIdState(savedCurrentId);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      console.error('Failed to load mixes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Debounced auto-save function
   * Prevents excessive localStorage writes on rapid changes
   */
  const autoSave = useCallback((newMixes: Mix[]) => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for debounced save
    autoSaveTimeoutRef.current = setTimeout(() => {
      try {
        const dataToSave = JSON.stringify(newMixes);
        // Only save if data actually changed
        if (dataToSave !== lastSaveRef.current) {
          saveMixes(newMixes);
          lastSaveRef.current = dataToSave;
        }
      } catch (err) {
        setError((err as Error).message);
        console.error('Failed to auto-save mixes:', err);
      }
    }, AUTO_SAVE_DEBOUNCE_MS);
  }, []);

  /**
   * Update mixes array and trigger auto-save
   */
  const setMixes = useCallback(
    (newMixes: Mix[]) => {
      setMixesState(newMixes);
      autoSave(newMixes);
    },
    [autoSave]
  );

  /**
   * Update current mix ID and persist to storage
   */
  const setCurrentMixId = useCallback((id: string | null) => {
    setCurrentMixIdState(id);
    try {
      if (id === null) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_MIX_ID);
      } else {
        localStorage.setItem(STORAGE_KEYS.CURRENT_MIX_ID, id);
      }
    } catch (err) {
      setError((err as Error).message);
      console.error('Failed to save current mix ID:', err);
    }
  }, []);

  /**
   * Cleanup: save any pending changes on unmount
   * Use ref to access current mixes without triggering debounce reset
   */
  const mixesRef = useRef(mixes);

  useEffect(() => {
    mixesRef.current = mixes;
  }, [mixes]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        // Force final save
        saveMixes(mixesRef.current);
      }
    };
  }, []);

  return {
    mixes,
    currentMixId,
    isLoading,
    error,
    setMixes,
    setCurrentMixId,
  };
}
