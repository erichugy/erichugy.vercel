/**
 * Music Mixer - MixerProvider Context Component
 * Provides audio and mix state across the entire mixer application
 */

import React, { useState, useCallback, useEffect, ReactNode } from 'react';
import { useMixStorage } from '../hooks/useMixStorage';
import { useMixActions } from '../hooks/useMixActions';
import { useAudioEngine } from '../hooks/useAudioEngine';
import type { Mix, SoundInstance } from '../lib/types';

interface MixerContextType {
  // Mix state
  mixes: Mix[];
  currentMix: Mix | null;
  isLoading: boolean;
  error: string | null;

  // Mix actions
  selectMix: (mixId: string) => void;
  createMix: (name?: string) => void;
  deleteMix: (mixId: string) => void;
  renameMix: (mixId: string, newName: string) => void;
  duplicateMix: (mixId: string) => void;
  updateMixes: (mixes: Mix[]) => void;

  // Audio state
  isReady: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;

  // Audio controls
  playMix: (sounds: SoundInstance[]) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVolume: (soundId: string, volume: number) => void;
  setOffset: (soundId: string, offset: number) => void;
}

const MixerContext = React.createContext<MixerContextType | undefined>(
  undefined
);

interface MixerProviderProps {
  children: ReactNode;
}

/**
 * Provider component for the entire mixer application
 * Combines mix storage, mix actions, and audio engine state
 *
 * Usage:
 * ```tsx
 * <MixerProvider>
 *   <YourMixerApp />
 * </MixerProvider>
 * ```
 */
export function MixerProvider({ children }: MixerProviderProps) {
  const {
    mixes,
    currentMixId,
    setMixes,
    setCurrentMixId,
    isLoading,
    error: storageError,
  } = useMixStorage();

  const audio = useAudioEngine();

  const { createMix, deleteMix, renameMix, duplicateMix } = useMixActions({
    mixes,
    onMixesChange: setMixes,
  });

  const [currentMix, setCurrentMix] = useState<Mix | null>(null);

  /**
   * Update current mix when currentMixId changes
   */
  useEffect(() => {
    if (currentMixId) {
      const mix = mixes.find((m) => m.id === currentMixId);
      setCurrentMix(mix || null);
    } else {
      setCurrentMix(null);
    }
  }, [currentMixId, mixes]);

  /**
   * Select a mix
   */
  const selectMix = useCallback(
    (mixId: string) => {
      setCurrentMixId(mixId);
    },
    [setCurrentMixId]
  );

  /**
   * Create a new mix
   */
  const createNewMix = useCallback(
    (name?: string) => {
      const newMix = createMix(name);
      selectMix(newMix.id);
    },
    [createMix, selectMix]
  );

  /**
   * Delete a mix
   */
  const deleteMixLocal = useCallback(
    (mixId: string) => {
      deleteMix(mixId);
      if (currentMixId === mixId) {
        setCurrentMixId(null);
      }
    },
    [deleteMix, currentMixId, setCurrentMixId]
  );

  /**
   * Duplicate a mix
   */
  const duplicateMixLocal = useCallback(
    (mixId: string) => {
      const newMix = duplicateMix(mixId);
      if (newMix) {
        selectMix(newMix.id);
      }
    },
    [duplicateMix, selectMix]
  );

  const value: MixerContextType = {
    // Mix state
    mixes,
    currentMix,
    isLoading,
    error: storageError,

    // Mix actions
    selectMix,
    createMix: createNewMix,
    deleteMix: deleteMixLocal,
    renameMix,
    duplicateMix: duplicateMixLocal,
    updateMixes: setMixes,

    // Audio state
    isReady: audio.isReady,
    isPlaying: audio.isPlaying,
    isPaused: audio.isPaused,
    currentTime: audio.currentTime,
    duration: audio.duration,

    // Audio controls
    playMix: audio.playMix,
    pause: audio.pause,
    resume: audio.resume,
    stop: audio.stop,
    setVolume: audio.setVolume,
    setOffset: audio.setOffset,
  };

  return (
    <MixerContext.Provider value={value}>
      {children}
    </MixerContext.Provider>
  );
}

/**
 * Hook to access mixer context
 * Must be used inside a MixerProvider
 */
export function useMixer(): MixerContextType {
  const context = React.useContext(MixerContext);
  if (context === undefined) {
    throw new Error('useMixer must be used within a MixerProvider');
  }
  return context;
}
