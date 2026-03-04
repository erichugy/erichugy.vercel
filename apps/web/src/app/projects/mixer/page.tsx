'use client';

/**
 * Music Mixer - Main Page
 * Entry point for the music mixer application
 * Combines all components and providers
 */

import React from 'react';
import { MixerProvider, useMixer } from './components/MixerProvider';
import { SoundMixer } from './components/SoundMixer';

/**
 * Inner component that uses the mixer context
 * Separated to avoid context consumer issues
 */
function MixerContent() {
  const {
    mixes,
    currentMix,
    isLoading,
    error,
    selectMix,
    createMix,
    deleteMix,
    renameMix,
    duplicateMix,
    updateMixes,
    isReady,
    isPlaying,
    isPaused,
    currentTime,
    duration,
    playMix,
    pause,
    resume,
    stop,
    setVolume,
    setOffset,
  } = useMixer();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-950">
        <div className="text-center">
          <div className="inline-block">
            <svg
              className="animate-spin h-12 w-12 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading mixer...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-950">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
            Error Loading Mixer
          </h2>
          <p className="text-red-700 dark:text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <SoundMixer
      mixes={mixes}
      currentMix={currentMix}
      isPlaying={isPlaying}
      isPaused={isPaused}
      isReady={isReady}
      currentTime={currentTime}
      duration={duration}
      onMixesChange={updateMixes}
      onSelectMix={selectMix}
      onCreateMix={createMix}
      onDeleteMix={deleteMix}
      onRenameMix={renameMix}
      onDuplicateMix={duplicateMix}
      onPlayMix={playMix}
      onPause={pause}
      onResume={resume}
      onStop={stop}
      onSetVolume={setVolume}
      onSetOffset={setOffset}
    />
  );
}

/**
 * Main page component wrapped in MixerProvider
 */
export default function MusicMixerPage() {
  return (
    <MixerProvider>
      <MixerContent />
    </MixerProvider>
  );
}
