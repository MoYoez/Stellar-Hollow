import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { DEMO_THEMES } from "@/lib/demo-themes";

export interface ScrollNavChapter {
  id: string;
  path: string;
  label: string;
  themeIdx: number;
}

interface ScrollCurveNavProps {
  chapters: readonly ScrollNavChapter[];
  activeIdx: number;
  dusk: boolean;
  onSelect: (idx: number) => void;
}

interface Point {
  x: number;
  y: number;
}

/** Evaluates point on quadratic Bezier P0 -> P1 -> P2 at t in [0, 1] */
function quadPoint(p0: Point, p1: Point, p2: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

/** Builds a partial SVG path of the quadratic curve between tStart and tEnd (for the gliding arc tail) */
function quadTailPath(p0: Point, p1: Point, p2: Point, tStart: number, tEnd: number): string {
  const segs = 16;
  const pts: string[] = [];
  for (let i = 0; i <= segs; i++) {
    const t = tStart + ((tEnd - tStart) * i) / segs;
    const p = quadPoint(p0, p1, p2, t);
    pts.push(`${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`);
  }
  return pts.join(" ");
}

/**
 * Left-side Minimal Chapter Menu with Right-of-Text Gliding Dot
 * - Clean left-aligned labels like `Websites ●`
 * - When active chapter changes on scroll or click, the dot swoops along an outward
 *   quadratic Bezier arc with a delicate fading curved trail before settling cleanly.
 */
export function ScrollCurveNav({
  chapters,
  activeIdx,
  dusk,
  onSelect,
}: ScrollCurveNavProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const labelRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const anchorsRef = useRef<Point[]>([]);
  const dotPosRef = useRef<Point>({ x: 46, y: 14 });
  const prevIdxRef = useRef<number>(activeIdx);
  const rafRef = useRef<number>(0);

  const [dotPos, setDotPos] = useState<Point>({ x: 46, y: 14 });
  const [trailPath, setTrailPath] = useState<string>("");
  const [trailOpacity, setTrailOpacity] = useState<number>(0);
  const [ready, setReady] = useState(false);

  const activeIdxRef = useRef<number>(activeIdx);
  activeIdxRef.current = activeIdx;

  // Measure the exact anchor point immediately to the right of each chapter label
  const measureAnchors = (syncCurrent = false) => {
    const box = containerRef.current;
    if (!box) return;
    const boxRect = box.getBoundingClientRect();
    const pts: Point[] = chapters.map((_, idx) => {
      const span = labelRefs.current[idx];
      if (!span) return { x: 46, y: idx * 34 + 14 };
      const r = span.getBoundingClientRect();
      return {
        x: r.right - boxRect.left + 12,
        y: r.top - boxRect.top + r.height / 2,
      };
    });
    anchorsRef.current = pts;
    const curPt = pts[activeIdxRef.current];
    if (curPt && (!ready || syncCurrent)) {
      dotPosRef.current = curPt;
      setDotPos(curPt);
      if (!ready) setReady(true);
    }
  };

  useLayoutEffect(() => {
    measureAnchors(true);
    const onResize = () => measureAnchors(true);
    window.addEventListener("resize", onResize);
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) measureAnchors(true);
    });
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters.length]);

  // Animate the dot along an outward curved Bezier arc whenever activeIdx changes
  useEffect(() => {
    if (!ready) return;
    const anchors = anchorsRef.current;
    const target = anchors[activeIdx];
    if (!target) return;

    if (prevIdxRef.current === activeIdx) {
      dotPosRef.current = target;
      setDotPos(target);
      return;
    }

    const from = { ...dotPosRef.current };
    prevIdxRef.current = activeIdx;

    const dy = Math.abs(target.y - from.y);
    // Outward curved control point bowing gently to the right
    const arcOut = 18 + Math.min(28, dy * 0.28);
    const ctrl: Point = {
      x: Math.max(from.x, target.x) + arcOut,
      y: (from.y + target.y) / 2,
    };

    const duration = Math.min(560, Math.max(360, 320 + dy * 1.1));
    const startTime = performance.now();

    cancelAnimationFrame(rafRef.current);

    const step = (now: number) => {
      const raw = Math.min(1, (now - startTime) / duration);
      // Smooth cubic ease-in-out
      const t = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;

      const cur = quadPoint(from, ctrl, target, t);
      dotPosRef.current = cur;
      setDotPos(cur);

      // Ephemeral curved trail swooping behind the dot and dissolving on arrival
      const tTail = Math.max(0, t - 0.55);
      const fade = Math.sin(raw * Math.PI);
      if (fade > 0.02 && t - tTail > 0.02) {
        setTrailPath(quadTailPath(from, ctrl, target, tTail, t));
        setTrailOpacity(fade * 0.65);
      } else {
        setTrailPath("");
        setTrailOpacity(0);
      }

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        dotPosRef.current = target;
        setDotPos(target);
        setTrailPath("");
        setTrailOpacity(0);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [activeIdx, ready]);

  const activeTheme = DEMO_THEMES[chapters[activeIdx]?.themeIdx ?? 0];
  const dotColor = dusk ? activeTheme.signalDark : "#221e1c";
  const trailColor = dusk ? activeTheme.signalDark : activeTheme.inkLight;

  return (
    <aside
      aria-label="章节导航"
      className="hidden xl:block fixed left-10 2xl:left-14 top-1/2 -translate-y-1/2 z-30 select-none"
    >
      <div ref={containerRef} className="relative flex flex-col items-start gap-1.5 pr-12">
        {chapters.map((ch, idx) => {
          const isActive = activeIdx === idx;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => onSelect(idx)}
              className="group w-full border-0 bg-transparent pl-0 pr-8 py-1.5 cursor-pointer text-left transition-colors duration-300"
              style={{
                fontSize: "0.875rem",
                fontWeight: isActive ? 500 : 400,
                color: isActive
                  ? dusk
                    ? "#f4f1ea"
                    : "#1f1c1a"
                  : dusk
                  ? "rgba(240, 237, 230, 0.42)"
                  : "rgba(74, 66, 62, 0.48)",
              }}
            >
              <span
                ref={(el) => {
                  labelRefs.current[idx] = el;
                }}
                className="group-hover:opacity-90 transition-opacity"
              >
                {ch.label}
              </span>
            </button>
          );
        })}

        {/* Floating Curved Arc Trail + Gliding Dot SVG Overlay */}
        {ready && (
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 w-full h-full overflow-visible"
          >
            {trailPath && (
              <path
                d={trailPath}
                fill="none"
                stroke={trailColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity={trailOpacity}
              />
            )}
            <circle
              cx={dotPos.x}
              cy={dotPos.y}
              r="3.8"
              fill={dotColor}
              style={{ transition: "fill 0.5s ease" }}
            />
          </svg>
        )}
      </div>
    </aside>
  );
}
