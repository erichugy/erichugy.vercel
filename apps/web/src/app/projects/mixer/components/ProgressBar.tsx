/**
 * Music Mixer - Progress Bar Component
 * Shows current playback progress and time
 */

import React from 'react';

interface ProgressBarProps {
  /** Current time in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
  /** Whether playback is active */
  isPlaying: boolean;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Format seconds to MM:SS or M:SS format
 */
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Progress bar component showing playback position
 * Displays current time and total duration
 *
 * Usage:
 * ```tsx
 * <ProgressBar
 *   currentTime={currentTime}
 *   duration={duration}
 *   isPlaying={isPlaying}
 * />
 * ```
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  isPlaying,
  className = '',
}) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Progress bar */}
      <div
        className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(displayProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Playback progress"
      >
        <div
          className={`h-full transition-all ${
            isPlaying
              ? 'bg-gradient-to-r from-blue-500 to-blue-400'
              : 'bg-blue-400'
          }`}
          style={{ width: `${displayProgress}%` }}
        />
      </div>

      {/* Time display */}
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
        <span className="font-semibold">{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Status indicator */}
      {isPlaying && (
        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
          <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-pulse" />
          <span>Playing</span>
        </div>
      )}
    </div>
  );
};
