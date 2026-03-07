/**
 * Music Mixer - Volume Slider Component
 * Reusable slider for controlling sound volume (0-100%)
 */

import React, { useCallback } from 'react';

interface VolumeSliderProps {
  /** Current volume value (0-100) */
  value: number;
  /** Callback when volume changes */
  onChange: (volume: number) => void;
  /** Optional label for accessibility */
  label?: string;
  /** Optional CSS class name */
  className?: string;
  /** Whether the slider is disabled */
  disabled?: boolean;
}

/**
 * Volume slider component with visual feedback
 * Maps 0-100 range for UI, can be converted to 0-1 for Web Audio
 *
 * Usage:
 * ```tsx
 * <VolumeSlider
 *   value={volume}
 *   onChange={(vol) => setVolume(vol)}
 *   label="Sound Volume"
 * />
 * ```
 */
export const VolumeSlider: React.FC<VolumeSliderProps> = ({
  value,
  onChange,
  label = 'Volume',
  className = '',
  disabled = false,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value, 10);
      onChange(newValue);
    },
    [onChange]
  );

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
          max="100"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
          className="flex-1 h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 min-w-[3rem] text-right">
          {value}%
        </span>
      </div>
    </div>
  );
};
