/**
 * Music Mixer - Sound Card Component
 * Displays a single sound with volume and offset controls
 */

import React, { useCallback, useMemo } from 'react';
import type { Sound, SoundInstance } from '../lib/types';
import { VolumeSlider } from './VolumeSlider';
import { OffsetSlider } from './OffsetSlider';

interface SoundCardProps {
  /** The sound definition */
  sound: Sound;
  /** The sound instance state in current mix */
  instance: SoundInstance;
  /** Callback when sound is toggled on/off */
  onToggle: (enabled: boolean) => void;
  /** Callback when volume changes */
  onVolumeChange: (volume: number) => void;
  /** Callback when offset changes */
  onOffsetChange: (offset: number) => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Sound card component with toggle, volume, and offset controls
 * Part of the main mixer interface
 *
 * Usage:
 * ```tsx
 * <SoundCard
 *   sound={rainSound}
 *   instance={rainInstance}
 *   onToggle={(enabled) => updateSound({ ...rainInstance, enabled })}
 *   onVolumeChange={(vol) => updateSound({ ...rainInstance, volume: vol })}
 *   onOffsetChange={(off) => updateSound({ ...rainInstance, offset: off })}
 * />
 * ```
 */
export const SoundCard: React.FC<SoundCardProps> = ({
  sound,
  instance,
  onToggle,
  onVolumeChange,
  onOffsetChange,
  className = '',
}) => {
  const handleToggle = useCallback(() => {
    onToggle(!instance.enabled);
  }, [instance.enabled, onToggle]);

  // Memoize waveform heights to prevent re-randomization on every render
  const waveformHeights = useMemo(() => {
    return [...Array(20)].map(() => 20 + Math.random() * 60);
  }, []);

  return (
    <div
      className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 transition-opacity ${
        instance.enabled ? 'opacity-100' : 'opacity-60'
      } ${className}`}
    >
      {/* Header with sound name and toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {sound.name}
        </h3>
        <button
          onClick={handleToggle}
          aria-pressed={instance.enabled}
          aria-label={`${instance.enabled ? 'Disable' : 'Enable'} ${sound.name}`}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            instance.enabled
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-400'
          }`}
        >
          {instance.enabled ? 'On' : 'Off'}
        </button>
      </div>

      {/* Waveform placeholder */}
      <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md h-12 flex items-center justify-center">
        <div className="flex gap-1 items-end h-8">
          {waveformHeights.map((height, i) => (
            <div
              key={i}
              className="w-1 bg-blue-400 rounded-full opacity-60"
              style={{
                height: `${height}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Volume slider */}
      <div className="mb-4">
        <VolumeSlider
          value={instance.volume}
          onChange={onVolumeChange}
          label="Volume"
          disabled={!instance.enabled}
        />
      </div>

      {/* Offset slider */}
      <div>
        <OffsetSlider
          value={instance.offset}
          onChange={onOffsetChange}
          label="Delay"
          disabled={!instance.enabled}
        />
      </div>

      {/* Sound duration info */}
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Duration: ~{Math.floor(sound.duration / 60)}m {sound.duration % 60}s
      </div>
    </div>
  );
};
