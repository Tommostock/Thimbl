'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export function useTimer() {
  const [duration, setDuration] = useState(0); // total seconds
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            // Play completion sound
            try {
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              osc.frequency.value = 800;
              osc.connect(ctx.destination);
              osc.start(); osc.stop(ctx.currentTime + 0.3);
            } catch {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, remaining]);

  const start = useCallback(() => { if (remaining > 0) setIsRunning(true); }, [remaining]);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => { setIsRunning(false); setRemaining(duration); }, [duration]);
  const setTime = useCallback((seconds: number) => {
    setDuration(seconds);
    setRemaining(seconds);
    setIsRunning(false);
  }, []);

  return { remaining, isRunning, duration, start, pause, reset, setTime };
}
