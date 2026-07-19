'use client';

/**
 * Music Mixer - useAudioEngine Hook
 * React hook to manage audio engine lifecycle and playback state
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { getAudioEngine } from '../lib/audioEngine';
import type { SoundInstance } from '../lib/types';

interface UseAudioEngineReturn {
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
  /** Error message if initialization failed */
  error: string | null;
  /** Play all sounds in a mix */
  playMix: (sounds: SoundInstance[]) => void;
  /** Stop all playback */
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
 * React hook for audio engine integration
 * Handles initialization, state management, and provides playback controls
 *
 * Usage:
 * ```tsx
 * const { isReady, isPlaying, playMix, stop } = useAudioEngine();
 * ```
 */
export function useAudioEngine(): UseAudioEngineReturn {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const engineRef = useRef(getAudioEngine());
  const animationFrameRef = useRef<number | null>(null);

  /**
   * Initialize audio engine on mount
   * Also loads all sounds
   */
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        const engine = engineRef.current;

        // Initialize context (may require user interaction)
        await engine.initialize();

        // Resume if suspended
        await engine.resumeContext();

        // Load all sounds
        await engine.loadAllSounds();

        // Get duration
        const dur = engine.getDuration();
        setDuration(dur);

        setIsReady(true);
        setError(null);
        console.log('[useAudioEngine] Ready');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown audio initialization error';
        setError(message);
        setIsReady(false);
        console.error('[useAudioEngine] Initialization error:', err);
      }
    };

    initializeAudio();

    return () => {
      // Cleanup on unmount
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  /**
   * Update playback position on animation frame
   */
  useEffect(() => {
    if (!isReady || !isPlaying || isPaused) {
      return;
    }

    const updatePosition = () => {
      const engine = engineRef.current;
      setCurrentTime(engine.getCurrentTime());
      setIsPlaying(engine.isPlaying());
      animationFrameRef.current = requestAnimationFrame(updatePosition);
    };

    animationFrameRef.current = requestAnimationFrame(updatePosition);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isReady, isPlaying, isPaused]);

  /**
   * Play a mix of sounds
   */
  const playMix = useCallback(
    (sounds: SoundInstance[]) => {
      if (!isReady) {
        console.warn('[useAudioEngine] Engine not ready');
        return;
      }

      try {
        const engine = engineRef.current;
        engine.playMix(sounds);
        setIsPlaying(true);
        setIsPaused(false);
        setCurrentTime(0);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Playback error';
        setError(message);
        console.error('[useAudioEngine] Playback error:', err);
      }
    },
    [isReady]
  );

  /**
   * Stop playback
   */
  const stop = useCallback(() => {
    const engine = engineRef.current;
    engine.stopAll();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
  }, []);

  /**
   * Pause playback
   */
  const pause = useCallback(() => {
    if (!isPlaying) return;

    const engine = engineRef.current;
    engine.pause();
    setIsPlaying(false);
    setIsPaused(true);
  }, [isPlaying]);

  /**
   * Resume from pause
   */
  const resume = useCallback(() => {
    if (!isPaused) return;

    const engine = engineRef.current;
    engine.resume();
    setIsPlaying(true);
    setIsPaused(false);
  }, [isPaused]);

  /**
   * Set volume for a sound
   */
  const setVolume = useCallback((soundId: string, volume: number) => {
    const engine = engineRef.current;
    engine.setVolume(soundId, volume);
  }, []);

  /**
   * Set offset for a sound
   */
  const setOffset = useCallback((soundId: string, offset: number) => {
    const engine = engineRef.current;
    engine.setOffset(soundId, offset);
  }, []);

  return {
    isReady,
    isPlaying,
    isPaused,
    currentTime,
    duration,
    error,
    playMix,
    stop,
    pause,
    resume,
    setVolume,
    setOffset,
  };
}
