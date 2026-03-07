/**
 * Music Mixer - Main SoundMixer Component
 * Main layout component combining sidebar, sound cards, and controls
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { Mix, SoundInstance } from '../lib/types';
import { BUILT_IN_SOUNDS } from '../lib/constants';
import { SoundCard } from './SoundCard';
import { PlaybackControls } from './PlaybackControls';
import { ProgressBar } from './ProgressBar';
import { MixSidebar } from './MixSidebar';

interface SoundMixerProps {
  /** All available mixes */
  mixes: Mix[];
  /** Currently selected mix */
  currentMix: Mix | null;
  /** Audio playback state */
  isPlaying: boolean;
  isPaused: boolean;
  isReady: boolean;
  currentTime: number;
  duration: number;
  /** Callback to update mixes list */
  onMixesChange: (mixes: Mix[]) => void;
  /** Callback to select a mix */
  onSelectMix: (mixId: string) => void;
  /** Callback to create new mix */
  onCreateMix: (name?: string) => void;
  /** Callback to delete mix */
  onDeleteMix: (mixId: string) => void;
  /** Callback to rename mix */
  onRenameMix: (mixId: string, newName: string) => void;
  /** Callback to duplicate mix */
  onDuplicateMix: (mixId: string) => void;
  /** Callback to play mix */
  onPlayMix: (sounds: SoundInstance[]) => void;
  /** Callback to pause playback */
  onPause: () => void;
  /** Callback to resume playback */
  onResume: () => void;
  /** Callback to stop playback */
  onStop: () => void;
  /** Callback to update sound volume */
  onSetVolume: (soundId: string, volume: number) => void;
  /** Callback to update sound offset */
  onSetOffset: (soundId: string, offset: number) => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Main sound mixer component
 * Integrates all mixer functionality: sidebar, sound cards, playback controls
 *
 * Usage:
 * ```tsx
 * <SoundMixer
 *   mixes={mixes}
 *   currentMix={currentMix}
 *   isPlaying={isPlaying}
 *   onMixesChange={setMixes}
 *   onPlayMix={playMix}
 *   ...
 * />
 * ```
 */
export const SoundMixer: React.FC<SoundMixerProps> = ({
  mixes,
  currentMix,
  isPlaying,
  isPaused,
  isReady,
  currentTime,
  duration,
  onMixesChange,
  onSelectMix,
  onCreateMix,
  onDeleteMix,
  onRenameMix,
  onDuplicateMix,
  onPlayMix,
  onPause,
  onResume,
  onStop,
  onSetVolume,
  onSetOffset,
  className = '',
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handlePlayClick = useCallback(() => {
    if (currentMix) {
      onPlayMix(currentMix.sounds);
    }
  }, [currentMix, onPlayMix]);

  const handleSoundUpdate = useCallback(
    (soundInstanceId: string, updates: Partial<SoundInstance>) => {
      if (!currentMix) return;

      const soundIndex = currentMix.sounds.findIndex(
        (s) => s.id === soundInstanceId
      );
      if (soundIndex === -1) return;

      const updatedSounds = [...currentMix.sounds];
      updatedSounds[soundIndex] = {
        ...updatedSounds[soundIndex],
        ...updates,
      };

      const updatedMix = {
        ...currentMix,
        sounds: updatedSounds,
        updatedAt: Date.now(),
      };

      const updatedMixes = mixes.map((m) => (m.id === currentMix.id ? updatedMix : m));
      onMixesChange(updatedMixes);
    },
    [currentMix, mixes, onMixesChange]
  );

  const handleVolumeChange = useCallback(
    (soundInstanceId: string, volume: number) => {
      handleSoundUpdate(soundInstanceId, { volume });
      // Also update audio engine in real-time
      const soundId = currentMix?.sounds.find(
        (s) => s.id === soundInstanceId
      )?.soundId;
      if (soundId) {
        onSetVolume(soundId, volume);
      }
    },
    [currentMix, handleSoundUpdate, onSetVolume]
  );

  const handleOffsetChange = useCallback(
    (soundInstanceId: string, offset: number) => {
      handleSoundUpdate(soundInstanceId, { offset });
      // Also update audio engine in real-time
      const soundId = currentMix?.sounds.find(
        (s) => s.id === soundInstanceId
      )?.soundId;
      if (soundId) {
        onSetOffset(soundId, offset);
      }
    },
    [currentMix, handleSoundUpdate, onSetOffset]
  );

  return (
    <div className={`flex h-full bg-gray-100 dark:bg-gray-950 ${className}`}>
      {/* Sidebar toggle button (mobile) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-20 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
        aria-label="Toggle sidebar"
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-full md:w-64' : 'hidden md:w-64'
        } transition-all duration-300 flex-shrink-0`}
      >
        <MixSidebar
          mixes={mixes}
          currentMixId={currentMix?.id ?? null}
          onSelectMix={onSelectMix}
          onCreateMix={onCreateMix}
          onDeleteMix={onDeleteMix}
          onRenameMix={onRenameMix}
          onDuplicateMix={onDuplicateMix}
          className="h-full"
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!currentMix ? (
          // No mix selected
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No Mix Selected
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Create or select a mix from the sidebar to get started.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {currentMix.name}
              </h1>

              {/* Progress bar */}
              <ProgressBar
                currentTime={currentTime}
                duration={duration}
                isPlaying={isPlaying}
                className="mb-4"
              />

              {/* Playback controls */}
              <PlaybackControls
                isPlaying={isPlaying}
                isPaused={isPaused}
                isReady={isReady}
                onPlay={handlePlayClick}
                onPause={onPause}
                onResume={onResume}
                onStop={onStop}
              />
            </div>

            {/* Sound cards grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentMix.sounds.map((soundInstance) => {
                  const soundDef = BUILT_IN_SOUNDS.find(
                    (s) => s.id === soundInstance.soundId
                  );
                  if (!soundDef) return null;

                  return (
                    <SoundCard
                      key={soundInstance.id}
                      sound={soundDef}
                      instance={soundInstance}
                      onToggle={(enabled) =>
                        handleSoundUpdate(soundInstance.id, { enabled })
                      }
                      onVolumeChange={(volume) =>
                        handleVolumeChange(soundInstance.id, volume)
                      }
                      onOffsetChange={(offset) =>
                        handleOffsetChange(soundInstance.id, offset)
                      }
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
