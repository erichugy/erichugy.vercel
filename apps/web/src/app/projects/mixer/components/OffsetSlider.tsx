/**
 * Music Mixer - Offset Slider Component
 * Reusable slider for controlling sound timing offset (0-30 seconds)
 */

import React, { useCallback } from 'react';

interface OffsetSliderProps {
  /** Current offset value in seconds (0-30) */
  value: number;
  /** Callback when offset changes */
  onChange: (offset: number) => void;
  /** Optional label for accessibility */
  label?: string;
  /** Optional CSS class name */
  className?: string;
  /** Whether the slider is disabled */
  disabled?: boolean;
}

/**
 * Offset slider component with time display
 * Controls timing delay for sound playback (0-30 seconds)
 *
 * Usage:
 * ```tsx
 * <OffsetSlider
 *   value={offset}
 *   onChange={(offset) => setOffset(offset)}
 *   label="Timing Offset"
 * />
 * ```
 */
export const OffsetSlider: React.FC<OffsetSliderProps> = ({
  value,
  onChange,
  label = 'Offset',
  className = '',
  disabled = false,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      onChange(newValue);
    },
    [onChange]
  );

  /**
   * Format seconds as MM:SS or just seconds for values < 60
   */
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}:${secs.padStart(4, '0')}`;
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="30"
          step="0.1"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={30}
          aria-valuenow={value}
          className="flex-1 h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 min-w-[3.5rem] text-right">
          {formatTime(value)}
        </span>
      </div>
    </div>
  );
};
