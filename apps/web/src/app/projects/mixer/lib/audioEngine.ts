/**
 * Music Mixer - Audio Engine
 * Web Audio API wrapper for multi-sound playback with volume and offset control
 * Abstracts audio logic for portability to other platforms
 */

import type { Sound, SoundInstance } from './types';
import { BUILT_IN_SOUNDS } from './constants';

/**
 * Represents a loaded sound with its buffer and metadata
 */
interface LoadedSound {
  buffer: AudioBuffer;
  sound: Sound;
  source: AudioBufferSourceNode | null;
  gainNode: GainNode;
  delayNode: DelayNode;
}

/**
 * Tracks playback state
 */
interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  startTime: number; // When playback started
  pauseTime: number; // When pause occurred
  currentOffset: number; // Current time offset for resume
}

/**
 * Main audio engine class
 * Manages Web Audio context, sound loading, and playback
 */
export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private loadedSounds: Map<string, LoadedSound> = new Map();
  private playbackState: PlaybackState = {
    isPlaying: false,
    isPaused: false,
    startTime: 0,
    pauseTime: 0,
    currentOffset: 0,
  };
  private soundInstances: Map<string, AudioBufferSourceNode> = new Map();
  private lastPlayedSounds: SoundInstance[] | null = null;

  /**
   * Initialize audio context and setup
   * Must be called before any audio operations
   * Requires user interaction due to browser autoplay policies
   */
  public async initialize(): Promise<void> {
    try {
      if (this.audioContext) return; // Already initialized

      // Create audio context
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();

      // Create master gain node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 1.0; // Full volume
      this.masterGain.connect(this.audioContext.destination);

      console.log('[AudioEngine] Initialized with sample rate:', this.audioContext.sampleRate);
    } catch (error) {
      console.error('[AudioEngine] Initialization failed:', error);
      throw new Error(
        'Audio context initialization failed. Your browser may not support Web Audio API.'
      );
    }
  }

  /**
   * Check if audio context is available and ready
   */
  public isReady(): boolean {
    return this.audioContext !== null && this.audioContext.state !== 'closed';
  }

  /**
   * Get audio context (for advanced usage)
   */
  public getContext(): AudioContext | null {
    return this.audioContext;
  }

  /**
   * Load a single sound file into the audio context
   */
  private async loadSoundFile(soundPath: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    try {
      // Fetch the audio file
      const response = await fetch(soundPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio file: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();

      // Decode audio data
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      console.log(`[AudioEngine] Loaded sound: ${soundPath} (${audioBuffer.duration.toFixed(2)}s)`);
      return audioBuffer;
    } catch (error) {
      console.error(`[AudioEngine] Failed to load sound ${soundPath}:`, error);
      throw error;
    }
  }

  /**
   * Load all built-in sounds
   * This should be called once after initialization
   */
  public async loadAllSounds(): Promise<void> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized. Call initialize() first.');
    }

    try {
      const loadPromises = BUILT_IN_SOUNDS.map(async (sound) => {
        const buffer = await this.loadSoundFile(sound.path);

        // Create gain and delay nodes for this sound
        const gainNode = this.audioContext!.createGain();
        gainNode.gain.value = 0.7; // Default 70%

        const delayNode = this.audioContext!.createDelay(30); // Max 30 second delay
        delayNode.delayTime.value = 0;

        // Connect: gainNode -> delayNode -> masterGain
        gainNode.connect(delayNode);
        delayNode.connect(this.masterGain!);

        this.loadedSounds.set(sound.id, {
          buffer,
          sound,
          source: null,
          gainNode,
          delayNode,
        });
      });

      await Promise.all(loadPromises);
      console.log(`[AudioEngine] All ${BUILT_IN_SOUNDS.length} sounds loaded successfully`);
    } catch (error) {
      console.error('[AudioEngine] Failed to load sounds:', error);
      throw new Error('Failed to load audio sounds. Check console for details.');
    }
  }

  /**
   * Play a specific sound instance with volume and offset
   * @param soundId - ID of the sound definition to play
   * @param soundInstanceId - Unique ID of this sound instance (for tracking multiple plays of same sound)
   * @param volume - Volume level 0-100
   * @param offset - Timing offset in seconds 0-30
   */
  public playSound(
    soundId: string,
    soundInstanceId: string,
    volume: number = 70,
    offset: number = 0
  ): void {
    if (!this.audioContext) {
      console.warn('[AudioEngine] Audio context not initialized');
      return;
    }

    const loaded = this.loadedSounds.get(soundId);
    if (!loaded) {
      console.warn(`[AudioEngine] Sound ${soundId} not found or not loaded`);
      return;
    }

    try {
      // Create unique key for this sound instance to allow multiple plays of same sound
      const instanceKey = `${soundId}_${soundInstanceId}`;

      // Stop any existing instance (shouldn't happen in normal flow, but safe)
      const existingSource = this.soundInstances.get(instanceKey);
      if (existingSource) {
        try {
          existingSource.stop();
        } catch (e) {
          // Source might already be stopped
        }
      }

      // Create new source
      const source = this.audioContext.createBufferSource();
      source.buffer = loaded.buffer;
      source.connect(loaded.gainNode);

      // Enable looping so sounds repeat continuously
      source.loop = true;

      // Set volume (convert 0-100 to 0-1, with logarithmic scaling for better UX)
      const normalizedVolume = Math.max(0, Math.min(100, volume)) / 100;
      const logVolume = normalizedVolume === 0 ? 0 : Math.pow(normalizedVolume, 2);
      loaded.gainNode.gain.value = logVolume;

      // Set offset/delay (start after N seconds)
      loaded.delayNode.delayTime.value = Math.max(0, Math.min(30, offset));

      // Store for reference using composite key
      this.soundInstances.set(instanceKey, source);

      // Start playback
      const currentTime = this.audioContext.currentTime;
      source.start(currentTime);

      console.log(
        `[AudioEngine] Playing ${soundId} (instance: ${soundInstanceId}) at volume ${volume}% with offset ${offset}s`
      );
    } catch (error) {
      console.error(`[AudioEngine] Failed to play sound ${soundId}:`, error);
    }
  }

  /**
   * Stop a specific sound instance
   */
  public stopSound(soundId: string, soundInstanceId?: string): void {
    try {
      // If soundInstanceId is provided, use the composite key
      const key = soundInstanceId ? `${soundId}_${soundInstanceId}` : soundId;
      const source = this.soundInstances.get(key);
      if (source) {
        source.stop();
        this.soundInstances.delete(key);
        console.log(`[AudioEngine] Stopped ${key}`);
      }
    } catch (error) {
      console.error(`[AudioEngine] Failed to stop sound ${soundId}:`, error);
    }
  }

  /**
   * Stop all sounds immediately
   */
  public stopAll(): void {
    try {
      this.soundInstances.forEach((source) => {
        try {
          source.stop();
        } catch (e) {
          // Already stopped
        }
      });
      this.soundInstances.clear();
      this.playbackState.isPlaying = false;
      this.playbackState.isPaused = false;
      console.log('[AudioEngine] Stopped all sounds');
    } catch (error) {
      console.error('[AudioEngine] Failed to stop all sounds:', error);
    }
  }

  /**
   * Set volume for a specific sound (0-100)
   */
  public setVolume(soundId: string, volume: number): void {
    const loaded = this.loadedSounds.get(soundId);
    if (!loaded) {
      console.warn(`[AudioEngine] Sound ${soundId} not loaded`);
      return;
    }

    try {
      const normalizedVolume = Math.max(0, Math.min(100, volume)) / 100;
      const logVolume = normalizedVolume === 0 ? 0 : Math.pow(normalizedVolume, 2);
      loaded.gainNode.gain.setValueAtTime(
        logVolume,
        this.audioContext?.currentTime || 0
      );
    } catch (error) {
      console.error(`[AudioEngine] Failed to set volume for ${soundId}:`, error);
    }
  }

  /**
   * Set offset/delay for a specific sound (0-30 seconds)
   */
  public setOffset(soundId: string, offset: number): void {
    const loaded = this.loadedSounds.get(soundId);
    if (!loaded) {
      console.warn(`[AudioEngine] Sound ${soundId} not loaded`);
      return;
    }

    try {
      const clampedOffset = Math.max(0, Math.min(30, offset));
      loaded.delayNode.delayTime.setValueAtTime(
        clampedOffset,
        this.audioContext?.currentTime || 0
      );
    } catch (error) {
      console.error(`[AudioEngine] Failed to set offset for ${soundId}:`, error);
    }
  }

  /**
   * Play all sounds in a mix
   */
  public playMix(soundInstances: SoundInstance[]): void {
    if (!this.audioContext) {
      console.warn('[AudioEngine] Audio context not initialized');
      return;
    }

    try {
      // Store sounds for resume functionality
      this.lastPlayedSounds = soundInstances;

      // Stop any currently playing sounds first
      this.stopAll();

      // Play enabled sounds, passing both soundId and soundInstanceId
      soundInstances.forEach((instance) => {
        if (instance.enabled) {
          this.playSound(instance.soundId, instance.id, instance.volume, instance.offset);
        }
      });

      this.playbackState.isPlaying = true;
      this.playbackState.isPaused = false;
      this.playbackState.startTime = this.audioContext.currentTime;
      this.playbackState.currentOffset = 0;

      console.log('[AudioEngine] Mix playback started');
    } catch (error) {
      console.error('[AudioEngine] Failed to play mix:', error);
    }
  }

  /**
   * Pause all sounds
   */
  public pause(): void {
    if (!this.audioContext) return;

    try {
      if (this.playbackState.isPlaying && !this.playbackState.isPaused) {
        // Record pause time for resume
        this.playbackState.pauseTime = this.audioContext.currentTime;
        this.playbackState.currentOffset =
          this.audioContext.currentTime - this.playbackState.startTime;

        // Stop all sounds
        this.soundInstances.forEach((source) => {
          try {
            source.stop();
          } catch (e) {
            // Already stopped
          }
        });
        this.soundInstances.clear();

        this.playbackState.isPaused = true;
        console.log('[AudioEngine] Paused at', this.playbackState.currentOffset.toFixed(2), 's');
      }
    } catch (error) {
      console.error('[AudioEngine] Failed to pause:', error);
    }
  }

  /**
   * Resume playback from pause
   */
  public resume(): void {
    if (!this.audioContext) {
      console.warn('[AudioEngine] Audio context not initialized');
      return;
    }

    try {
      if (this.playbackState.isPaused) {
        if (this.lastPlayedSounds) {
          // Replay the mix from current offset
          this.playMix(this.lastPlayedSounds);
          // Adjust start time to account for pause duration
          const pauseDuration = this.audioContext.currentTime - this.playbackState.pauseTime;
          this.playbackState.startTime = this.audioContext.currentTime - this.playbackState.currentOffset;
        } else {
          console.warn('[AudioEngine] No previous mix to resume');
        }
      }
    } catch (error) {
      console.error('[AudioEngine] Failed to resume:', error);
    }
  }

  /**
   * Get current playback time in seconds
   */
  public getCurrentTime(): number {
    if (!this.audioContext) return 0;

    if (this.playbackState.isPaused) {
      return this.playbackState.currentOffset;
    }

    if (this.playbackState.isPlaying) {
      return this.audioContext.currentTime - this.playbackState.startTime;
    }

    return 0;
  }

  /**
   * Get total duration (longest sound in current playback)
   */
  public getDuration(): number {
    let maxDuration = 0;
    this.loadedSounds.forEach((loaded) => {
      if (loaded.buffer.duration > maxDuration) {
        maxDuration = loaded.buffer.duration;
      }
    });
    return maxDuration;
  }

  /**
   * Get duration of a specific sound
   */
  public getSoundDuration(soundId: string): number {
    const loaded = this.loadedSounds.get(soundId);
    return loaded ? loaded.buffer.duration : 0;
  }

  /**
   * Check if currently playing
   */
  public isPlaying(): boolean {
    return this.playbackState.isPlaying && !this.playbackState.isPaused;
  }

  /**
   * Check if currently paused
   */
  public isPaused(): boolean {
    return this.playbackState.isPaused;
  }

  /**
   * Get audio context state
   */
  public getState(): AudioContextState {
    return this.audioContext?.state || 'closed';
  }

  /**
   * Resume audio context if suspended (required after user interaction)
   */
  public async resumeContext(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
      console.log('[AudioEngine] Audio context resumed');
    }
  }

  /**
   * Cleanup and close audio context
   */
  public dispose(): void {
    try {
      this.stopAll();
      this.loadedSounds.clear();
      this.soundInstances.clear();

      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close();
      }

      console.log('[AudioEngine] Disposed');
    } catch (error) {
      console.error('[AudioEngine] Error during disposal:', error);
    }
  }
}

/**
 * Singleton instance of the audio engine
 * Ensures only one audio context is created
 */
let audioEngineInstance: AudioEngine | null = null;

/**
 * Get or create the audio engine singleton
 */
export function getAudioEngine(): AudioEngine {
  if (!audioEngineInstance) {
    audioEngineInstance = new AudioEngine();
  }
  return audioEngineInstance;
}

/**
 * Reset the audio engine (mainly for testing)
 */
export function resetAudioEngine(): void {
  if (audioEngineInstance) {
    audioEngineInstance.dispose();
    audioEngineInstance = null;
  }
}
