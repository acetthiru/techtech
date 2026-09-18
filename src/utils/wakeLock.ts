/**
 * TECH BRIDGE '26: Screen Wake Lock Manager
 * Prevents contestant screen timeout/sleep on mobile devices and laptops during competition.
 * Utilizes the W3C Screen Wake Lock API with graceful keep-alive fallbacks.
 */
import { useEffect, useState, useRef, useCallback } from 'react';

// Tiny 1x1 pixel silent WebM/MP4 data URI used as keep-awake fallback for legacy browsers/iOS
const SILENT_VIDEO_DATA_URI = 'data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAAptZGF0AAAAAg==';

let globalWakeLockSentinel: any = null;
let globalFallbackVideo: HTMLVideoElement | null = null;
const listeners = new Set<(active: boolean) => void>();

function notifyListeners(active: boolean) {
  listeners.forEach(fn => fn(active));
}

function getFallbackVideo(): HTMLVideoElement | null {
  if (typeof document === 'undefined') return null;
  if (!globalFallbackVideo) {
    const video = document.createElement('video');
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('aria-hidden', 'true');
    video.muted = true;
    video.loop = true;
    video.style.position = 'fixed';
    video.style.top = '-9999px';
    video.style.left = '-9999px';
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.opacity = '0.001';
    video.style.pointerEvents = 'none';
    video.src = SILENT_VIDEO_DATA_URI;
    document.body.appendChild(video);
    globalFallbackVideo = video;
  }
  return globalFallbackVideo;
}

/**
 * Acquire screen wake lock to keep display permanently on
 */
export async function acquireWakeLock(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Primary: Native W3C Screen Wake Lock API (Chrome, Edge, Safari 16.4+, Android)
  if ('wakeLock' in navigator) {
    try {
      if (globalWakeLockSentinel && !globalWakeLockSentinel.released) {
        notifyListeners(true);
        return true;
      }

      const sentinel = await (navigator as any).wakeLock.request('screen');
      globalWakeLockSentinel = sentinel;
      notifyListeners(true);

      sentinel.addEventListener('release', () => {
        globalWakeLockSentinel = null;
        notifyListeners(false);
      });
      return true;
    } catch (err: any) {
      // Browser may require user gesture or battery saver is active; attempt fallback
      console.warn('WakeLock native request failed, activating keep-awake fallback:', err?.message || err);
    }
  }

  // Fallback: Invisible playing video loop keeps mobile OS from sleeping
  try {
    const video = getFallbackVideo();
    if (video) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
      notifyListeners(true);
      return true;
    }
  } catch {
    // Ignore fallback errors
  }

  return false;
}

/**
 * Release screen wake lock (e.g. on logout or exiting arena)
 */
export async function releaseWakeLock(): Promise<void> {
  try {
    if (globalWakeLockSentinel) {
      await globalWakeLockSentinel.release();
      globalWakeLockSentinel = null;
    }
  } catch {
    // Ignore release errors
  }

  try {
    if (globalFallbackVideo) {
      globalFallbackVideo.pause();
    }
  } catch {
    // Ignore video pause errors
  }

  notifyListeners(false);
}

/**
 * Check if the Screen Wake Lock API is natively supported in this browser
 */
export function isWakeLockSupported(): boolean {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
}

/**
 * React hook to automatically prevent screen timeout when enabled
 */
export function useScreenWakeLock(enabled: boolean) {
  const [isActive, setIsActive] = useState<boolean>(false);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const handleAcquire = useCallback(async () => {
    if (enabledRef.current) {
      await acquireWakeLock();
    }
  }, []);

  const handleRelease = useCallback(async () => {
    await releaseWakeLock();
  }, []);

  useEffect(() => {
    const listener = (active: boolean) => {
      setIsActive(active);
    };
    listeners.add(listener);

    if (enabled) {
      // Initial acquisition
      handleAcquire();

      // Browser automatically releases wake lock on tab visibility loss.
      // Re-acquire automatically when user returns to competition arena!
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && enabledRef.current) {
          handleAcquire();
        }
      };

      // User gesture fallback for mobile browsers that require a touch/click
      const handleUserGesture = () => {
        if (enabledRef.current && (!globalWakeLockSentinel || globalWakeLockSentinel.released)) {
          handleAcquire();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('click', handleUserGesture, { passive: true });
      window.addEventListener('touchstart', handleUserGesture, { passive: true });
      window.addEventListener('keydown', handleUserGesture, { passive: true });

      return () => {
        listeners.delete(listener);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('click', handleUserGesture);
        window.removeEventListener('touchstart', handleUserGesture);
        window.removeEventListener('keydown', handleUserGesture);
        handleRelease();
      };
    } else {
      handleRelease();
      return () => {
        listeners.delete(listener);
      };
    }
  }, [enabled, handleAcquire, handleRelease]);

  return {
    isActive,
    acquire: handleAcquire,
    release: handleRelease,
    isSupported: isWakeLockSupported(),
  };
}
