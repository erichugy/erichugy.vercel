/**
 * Music Mixer - Playback Controls Component
 * Play, pause, stop buttons with playback state indication
 */

import React, { useCallback } from 'react';

interface PlaybackControlsProps {
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Whether audio is paused */
  isPaused: boolean;
  /** Whether audio engine is ready */
  isReady: boolean;
  /** Callback to start playback */
  onPlay: () => void;
  /** Callback to pause playback */
  onPause: () => void;
  /** Callback to resume from pause */
  onResume: () => void;
  /** Callback to stop playback */
  onStop: () => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Playback control buttons component
 * Provides play, pause, and stop functionality with visual state feedback
 *
 * Usage:
 * ```tsx
 * <PlaybackControls
 *   isPlaying={isPlaying}
 *   isPaused={isPaused}
 *   isReady={isReady}
 *   onPlay={() => playMix(sounds)}
 *   onPause={() => pause()}
 *   onResume={() => resume()}
 *   onStop={() => stop()}
 * />
 * ```
 */
export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  isPaused,
  isReady,
  onPlay,
  onPause,
  onResume,
  onStop,
  className = '',
}) => {
  const handlePlayClick = useCallback(() => {
    onPlay();
  }, [onPlay]);

  const handlePauseClick = useCallback(() => {
    if (isPaused) {
      onResume();
    } else {
      onPause();
    }
  }, [isPaused, onPause, onResume]);

  const handleStopClick = useCallback(() => {
    onStop();
  }, [onStop]);

  return (
    <div className={`flex gap-3 ${className}`}>
      {/* Play Button */}
      <button
        onClick={handlePlayClick}
        disabled={!isReady || isPlaying}
        aria-label="Play"
        title="Start playback"
        className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors text-white ${
          isPlaying
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600 active:bg-green-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className="flex items-center justify-center gap-2">
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
          Play
        </span>
      </button>

      {/* Pause/Resume Button */}
      <button
        onClick={handlePauseClick}
        disabled={!isReady || (!isPlaying && !isPaused)}
        aria-label={isPaused ? 'Resume' : 'Pause'}
        title={isPaused ? 'Resume playback' : 'Pause playback'}
        className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors text-white ${
          isPlaying && !isPaused
            ? 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700'
            : 'bg-gray-400 cursor-not-allowed'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className="flex items-center justify-center gap-2">
          {isPaused ? (
            <>
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              Resume
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              Pause
            </>
          )}
        </span>
      </button>

      {/* Stop Button */}
      <button
        onClick={handleStopClick}
        disabled={!isReady || (!isPlaying && !isPaused)}
        aria-label="Stop"
        title="Stop playback"
        className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors text-white ${
          isPlaying || isPaused
            ? 'bg-red-500 hover:bg-red-600 active:bg-red-700'
            : 'bg-gray-400 cursor-not-allowed'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className="flex items-center justify-center gap-2">
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M6 6h12v12H6z" />
          </svg>
          Stop
        </span>
      </button>
    </div>
  );
};
