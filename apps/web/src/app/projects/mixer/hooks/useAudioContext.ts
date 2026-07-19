'use client';

/**
 * Music Mixer - useAudioContext Hook
 * Provides context-based audio state sharing across components
 * Optional hook for apps that need shared audio state
 */

import { createContext, useContext, ReactNode, createElement } from 'react';
import { useAudioEngine } from './useAudioEngine';
import type { SoundInstance } from '../lib/types';

interface AudioContextType {
  /** Whether audio engine is initialized and ready */
  isReady: boolean;
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Whether audio is paused */
  isPaused: boolean;
  /** Current playback time in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
  /** Error message if any */
  error: string | null;
  /** Play a mix of sounds */
  playMix: (sounds: SoundInstance[]) => void;
  /** Stop playback */
  stop: () => void;
  /** Pause playback */
  pause: () => void;
  /** Resume from pause */
  resume: () => void;
  /** Update volume for a sound */
  setVolume: (soundId: string, volume: number) => void;
  /** Update offset for a sound */
  setOffset: (soundId: string, offset: number) => void;
}

/**
 * Audio context for sharing audio state across the app
 */
const AudioStateContext = createContext<AudioContextType | undefined>(undefined);

/**
 * Provider component for audio context
 * Wrap your app with this to use useAudioContext hook
 *
 * Usage:
 * ```tsx
 * <AudioContextProvider>
 *   <YourApp />
 * </AudioContextProvider>
 * ```
 */
export function AudioContextProvider({ children }: { children: ReactNode }) {
  const audioEngine = useAudioEngine();

  return createElement(AudioStateContext.Provider, { value: audioEngine }, children);
}

/**
 * Hook to access audio context from anywhere in the component tree
 * Must be used inside an AudioContextProvider
 *
 * Usage:
 * ```tsx
 * const audio = useAudioContext();
 * audio.playMix(sounds);
 * ```
 */
export function useAudioContext(): AudioContextType {
  const context = useContext(AudioStateContext);
  if (context === undefined) {
    throw new Error(
      'useAudioContext must be used within an AudioContextProvider'
    );
  }
  return context;
}
