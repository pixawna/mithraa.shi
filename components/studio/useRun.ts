"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface RunStep {
  id: string;
  /** ms the step takes */
  ms: number;
}

/**
 * Drives a simulated agent run: a clock that advances through steps and
 * reports, for each step, 0..1 progress. Respects reduced motion by running
 * five times faster.
 */
export function useRun(steps: RunStep[]) {
  const [t, setT] = useState(-1); // -1 = idle
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = steps.reduce((s, x) => s + x.ms, 0);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  const start = useCallback(() => {
    stop();
    const fast = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const tick = fast ? 250 : 50;
    setT(0);
    timer.current = setInterval(() => {
      setT((v) => {
        const n = v + tick;
        if (n >= total) {
          stop();
          return total;
        }
        return n;
      });
    }, 50);
  }, [stop, total]);

  useEffect(() => stop, [stop]);

  const progress = (id: string) => {
    if (t < 0) return 0;
    let acc = 0;
    for (const s of steps) {
      if (s.id === id) return Math.max(0, Math.min(1, (t - acc) / s.ms));
      acc += s.ms;
    }
    return 0;
  };

  return {
    started: t >= 0,
    done: t >= total,
    elapsed: Math.max(0, t),
    total,
    progress,
    start,
    reset: () => {
      stop();
      setT(-1);
    },
  };
}

/** Reveal `text` proportionally to progress p (0..1). */
export const typed = (text: string, p: number) => text.slice(0, Math.round(text.length * Math.max(0, Math.min(1, p))));
