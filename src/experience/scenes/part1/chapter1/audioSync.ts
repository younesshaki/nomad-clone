/**
 * Audio Sync Registry
 * 
 * Provides a way for components to listen to VO audio currentTime
 * for syncing visual elements (like image slideshows) to specific moments in the audio.
 */

type AudioSyncCallback = (currentTime: number, sceneId: string) => void;

class AudioSyncRegistry {
  private listeners: Set<AudioSyncCallback> = new Set();
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private rafId: number | null = null;
  private isPolling = false;

  /**
   * Register an audio element for a scene
   */
  registerAudio(sceneId: string, audio: HTMLAudioElement): void {
    this.audioElements.set(sceneId, audio);
    this.startPolling();
  }

  /**
   * Unregister an audio element
   */
  unregisterAudio(sceneId: string): void {
    this.audioElements.delete(sceneId);
    if (this.audioElements.size === 0) {
      this.stopPolling();
    }
  }

  /**
   * Subscribe to audio time updates
   */
  subscribe(callback: AudioSyncCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Get current time for a specific scene's audio
   */
  getCurrentTime(sceneId: string): number {
    const audio = this.audioElements.get(sceneId);
    return audio?.currentTime ?? 0;
  }

  /**
   * Check if audio is currently playing for a scene
   */
  isPlaying(sceneId: string): boolean {
    const audio = this.audioElements.get(sceneId);
    return audio ? !audio.paused : false;
  }

  private startPolling(): void {
    if (this.isPolling) return;
    this.isPolling = true;
    this.poll();
  }

  private stopPolling(): void {
    this.isPolling = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private poll = (): void => {
    if (!this.isPolling) return;

    // Notify listeners of current times for all playing audio
    this.audioElements.forEach((audio, sceneId) => {
      if (!audio.paused) {
        this.listeners.forEach(callback => {
          callback(audio.currentTime, sceneId);
        });
      }
    });

    this.rafId = requestAnimationFrame(this.poll);
  };

  /**
   * Clear all registrations (for cleanup)
   */
  clear(): void {
    this.stopPolling();
    this.audioElements.clear();
    this.listeners.clear();
  }
}

// Singleton instance
export const audioSyncRegistry = new AudioSyncRegistry();

// Hook for easy subscription in React components
import { useEffect, useState } from "react";

export function useAudioSync(sceneId: string): number {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const unsubscribe = audioSyncRegistry.subscribe((time, id) => {
      if (id === sceneId) {
        setCurrentTime(time);
      }
    });

    return unsubscribe;
  }, [sceneId]);

  return currentTime;
}
