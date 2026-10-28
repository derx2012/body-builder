import { useEffect } from 'react';

/** Не даёт экрану погаснуть, пока смонтирован компонент; повторно берёт блокировку после сворачивания. */
export function useWakeLock(): void {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const acquire = async () => {
      try {
        if (document.visibilityState === 'visible') lock = await navigator.wakeLock?.request('screen');
      } catch {
        // Браузер не дал блокировку — экран может погаснуть.
      }
    };
    void acquire();
    document.addEventListener('visibilitychange', acquire);
    return () => {
      document.removeEventListener('visibilitychange', acquire);
      void lock?.release();
    };
  }, []);
}
