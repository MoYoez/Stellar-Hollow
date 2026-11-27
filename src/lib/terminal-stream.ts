import { useCallback, useEffect, useRef, useState } from "react";

export interface StreamSegment {
  id: string;
  start: number;
  end: number;
  length: number;
  pauseAfter: number;
}

export interface StreamPlan {
  segments: Record<string, StreamSegment>;
  order: StreamSegment[];
  totalChars: number;
  /** Delay in ms AFTER typing character index i (length === totalChars) */
  delays: number[];
}

/**
 * Strip `~~` strikethrough markers so character counts match visible rendered glyphs.
 */
export function getVisibleChars(text: string): string[] {
  const parts = text.split(/(~~[^~]+~~)/g);
  const chars: string[] = [];
  for (const part of parts) {
    if (!part) continue;
    const content =
      part.startsWith("~~") && part.endsWith("~~") && part.length > 4
        ? part.slice(2, -2)
        : part;
    chars.push(...Array.from(content));
  }
  return chars;
}

function isSentenceEnd(ch: string): boolean {
  return "。！？.!?".includes(ch);
}

function isMinorPause(ch: string): boolean {
  return "，、；：,;—–".includes(ch);
}

function isCjk(ch: string): boolean {
  const code = ch.codePointAt(0) ?? 0;
  return code >= 0x4e00 && code <= 0x9fff;
}

/**
 * Deterministic organic micro-jitter so typing feels human rather than mechanical.
 */
function hashJitter(index: number): number {
  const x = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export class StreamBuilder {
  private order: StreamSegment[] = [];
  private segments: Record<string, StreamSegment> = {};
  private rawChars: Array<{ ch: string; isEndOfSeg: boolean; pauseAfter: number }> = [];
  private cursor = 0;

  add(id: string, text: string | undefined | null, pauseAfter = 190): this {
    if (!text) return this;
    const chars = getVisibleChars(text);
    if (chars.length === 0) return this;

    const start = this.cursor;
    const end = start + chars.length;
    const seg: StreamSegment = {
      id,
      start,
      end,
      length: chars.length,
      pauseAfter,
    };

    this.segments[id] = seg;
    this.order.push(seg);

    for (let i = 0; i < chars.length; i++) {
      this.rawChars.push({
        ch: chars[i],
        isEndOfSeg: i === chars.length - 1,
        pauseAfter: i === chars.length - 1 ? pauseAfter : 0,
      });
    }

    this.cursor = end;
    return this;
  }

  build(): StreamPlan {
    const total = this.rawChars.length;
    // Gentle adaptive pacing if user later fills in a very long page
    const paceScale = total > 480 ? Math.max(0.58, 480 / total) : 1;

    const delays: number[] = new Array(total);
    for (let i = 0; i < total; i++) {
      const { ch, isEndOfSeg, pauseAfter } = this.rawChars[i];
      // Keep the opening ~120 chars at full natural human cadence
      const localScale = i < 120 ? 1 : paceScale;
      const jitter = hashJitter(i);

      let ms: number;
      if (ch === " ") {
        ms = 18 + jitter * 14;
      } else if (isSentenceEnd(ch)) {
        ms = 210 + jitter * 90;
      } else if (isMinorPause(ch)) {
        ms = 125 + jitter * 55;
      } else if (isCjk(ch)) {
        ms = 34 + jitter * 22;
      } else {
        ms = 24 + jitter * 18;
      }

      ms *= localScale;

      if (isEndOfSeg && pauseAfter > 0) {
        ms += pauseAfter * (i < 120 ? 1 : Math.max(0.7, localScale));
      }

      delays[i] = Math.round(ms);
    }

    return {
      segments: this.segments,
      order: this.order,
      totalChars: total,
      delays,
    };
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export interface TerminalStreamController {
  pos: number;
  isDone: boolean;
  isActivelyTyping: boolean;
  /** Whether a segment (or any segment in a group) has begun revealing */
  hasReached: (id: string) => boolean;
  /** Number of visible glyphs to render for a segment */
  visibleCount: (id: string) => number;
  /** Whether the single active terminal cursor currently belongs to this segment */
  isCursorAt: (id: string) => boolean;
  skipToEnd: () => void;
  replay: () => void;
}

export function useTerminalStream(plan: StreamPlan): TerminalStreamController {
  const [pos, setPos] = useState<number>(() =>
    prefersReducedMotion() ? plan.totalChars : 0
  );
  const [isActivelyTyping, setIsActivelyTyping] = useState(false);
  const timerRef = useRef<number | null>(null);

  const isDone = pos >= plan.totalChars;

  useEffect(() => {
    if (prefersReducedMotion()) {
      setPos(plan.totalChars);
      return;
    }
    if (pos >= plan.totalChars) {
      setIsActivelyTyping(false);
      return;
    }

    const delay = pos === 0 ? 280 : (plan.delays[pos - 1] ?? 32);
    // Keep cursor solid during fast character emission, let it softly blink during longer pauses
    setIsActivelyTyping(delay < 150);

    timerRef.current = window.setTimeout(() => {
      setPos((prev) => Math.min(plan.totalChars, prev + 1));
    }, delay);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [pos, plan]);

  const skipToEnd = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsActivelyTyping(false);
    setPos(plan.totalChars);
  }, [plan.totalChars]);

  const replay = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPos(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Determine the single active segment id that owns the live cursor right now
  let activeCursorId: string | null = null;
  if (!isDone && plan.order.length > 0) {
    if (pos === 0) {
      activeCursorId = plan.order[0].id;
    } else {
      for (let i = 0; i < plan.order.length; i++) {
        const seg = plan.order[i];
        if (pos > seg.start && pos <= seg.end) {
          activeCursorId = seg.id;
          break;
        }
      }
    }
  }

  const hasReached = useCallback(
    (id: string) => {
      if (isDone) return true;
      const seg = plan.segments[id];
      if (!seg) return true;
      return pos > seg.start || (pos === 0 && seg.start === 0);
    },
    [isDone, plan.segments, pos]
  );

  const visibleCount = useCallback(
    (id: string) => {
      const seg = plan.segments[id];
      if (!seg) return Infinity;
      if (isDone) return seg.length;
      return Math.max(0, Math.min(seg.length, pos - seg.start));
    },
    [isDone, plan.segments, pos]
  );

  const isCursorAt = useCallback(
    (id: string) => !isDone && activeCursorId === id,
    [isDone, activeCursorId]
  );

  return {
    pos,
    isDone,
    isActivelyTyping,
    hasReached,
    visibleCount,
    isCursorAt,
    skipToEnd,
    replay,
  };
}
