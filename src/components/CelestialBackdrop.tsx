import { useEffect, useState } from "react";
import { SITE_CONFIG } from "@/config/site.config";
import { DEMO_THEMES } from "@/lib/demo-themes";

interface CelestialBackdropProps {
  /** Index of the active chapter's theme in DEMO_THEMES */
  themeIdx: number;
  accent: string;
  secondaryAccent: string;
  dark?: boolean;
}

const MICRO_STARS = [
  { x: 112, y: 128, s: 5.5, o: 0.52 },
  { x: 248, y: 265, s: 3.2, o: 0.38 },
  { x: 156, y: 540, s: 4.2, o: 0.44 },
  { x: 96, y: 740, s: 3.0, o: 0.34 },
  { x: 1295, y: 154, s: 6.0, o: 0.54 },
  { x: 1188, y: 312, s: 3.4, o: 0.4 },
  { x: 1320, y: 510, s: 4.8, o: 0.48 },
  { x: 1235, y: 720, s: 3.5, o: 0.38 },
  { x: 1090, y: 112, s: 2.8, o: 0.32 },
  { x: 318, y: 116, s: 2.6, o: 0.32 },
] as const;

const AURA_THEME_INDICES = [0, 2, 1, 4, 3, 6] as const;

/**
 * Silky-smooth Celestial + Watercolor Backdrop
 * - Dual-layer Light/Dusk base & veil with 1.1s gentle crossfade (zero gradient snap)
 * - Dedicated per-chapter aura layers crossfading via GPU opacity over 1.8s
 * - Direct SVG stroke/fill transitions (1.8s) so astronomical arcs never snap
 */
export function CelestialBackdrop({
  themeIdx,
  accent,
  secondaryAccent,
  dark = false,
}: CelestialBackdropProps) {
  const [scrollY, setScrollY] = useState(0);
  const [imgBroken, setImgBroken] = useState(false);

  useEffect(() => {
    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setScrollY(window.scrollY || 0);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const imgShift = Math.min(80, scrollY * 0.06);
  const svgShift = Math.min(120, scrollY * 0.11);
  const bgUrl = SITE_CONFIG.background.imageUrl;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* True Dual-Layer Base Gradients (1.1s velvety crossfade between Pearl Day & Warm Dusk) */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #fbf9f6 0%, #f3eee7 55%, #ede8f0 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #181a24 0%, #141620 55%, #11131c 100%)",
          opacity: dark ? 1 : 0,
          transition: "opacity 1.1s cubic-bezier(0.33, 1, 0.68, 1)",
        }}
      />

      {/* Softly Veiled Watercolor Backdrop */}
      {bgUrl && !imgBroken && (
        <div
          className="absolute inset-x-[-24px] top-[-24px] bottom-[-100px]"
          style={{
            transform: `translate3d(0, ${(-imgShift).toFixed(1)}px, 0) scale(1.03)`,
            opacity: dark ? 0.19 : 0.35,
            filter: dark ? "blur(3px) saturate(0.82) brightness(0.76)" : "blur(2.5px) saturate(0.92)",
            transition: "opacity 1.1s cubic-bezier(0.33, 1, 0.68, 1), filter 1.1s cubic-bezier(0.33, 1, 0.68, 1)",
          }}
        >
          <img
            src={bgUrl}
            alt=""
            onError={() => setImgBroken(true)}
            className="w-full h-full object-cover object-center block"
          />
        </div>
      )}

      {/* Dual-Layer Reading-Column Veil */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 56% 78% at 50% 45%, rgba(251, 249, 246, 0.85) 0%, rgba(246, 242, 236, 0.64) 62%, rgba(240, 235, 240, 0.44) 100%)",
          opacity: dark ? 0 : 1,
          transition: "opacity 1.1s cubic-bezier(0.33, 1, 0.68, 1)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 56% 78% at 50% 45%, rgba(22, 24, 34, 0.86) 0%, rgba(19, 21, 30, 0.7) 60%, rgba(16, 18, 26, 0.54) 100%)",
          opacity: dark ? 1 : 0,
          transition: "opacity 1.1s cubic-bezier(0.33, 1, 0.68, 1)",
        }}
      />

      {/* Per-Chapter Crossfading Morandi Auras (pure opacity transitions over 1.8s — ZERO gradient snapping!) */}
      {AURA_THEME_INDICES.map((tIdx) => {
        const t = DEMO_THEMES[tIdx];
        const nextT = DEMO_THEMES[(tIdx + 1) % DEMO_THEMES.length];
        const c1 = dark ? t.signalDark : t.pastel;
        const c2 = dark ? nextT.signalDark : nextT.pastel;
        const active = themeIdx === tIdx;
        return (
          <div
            key={t.id}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle 48vmax at 50% 98%, ${c1}${dark ? "1b" : "2e"} 0%, transparent 66%), radial-gradient(circle 34vmax at 88% 14%, ${c2}${dark ? "13" : "22"} 0%, transparent 64%)`,
              opacity: active ? 1 : 0,
              transition: "opacity 1.8s cubic-bezier(0.33, 1, 0.68, 1)",
            }}
          />
        );
      })}

      {/* Delicate Astronomical Hollow Blueprint (smooth 1.8s stroke/fill transitions) */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-x-0 top-[-60px] w-full h-[calc(100%+140px)]"
        style={{
          transform: `translate3d(0, ${(-svgShift).toFixed(1)}px, 0)`,
        }}
      >
        <ellipse
          cx="720"
          cy="450"
          rx="660"
          ry="410"
          transform="rotate(-8 720 450)"
          fill="none"
          stroke={accent}
          strokeOpacity={dark ? 0.2 : 0.28}
          strokeWidth="1.1"
          style={{ transition: "stroke 1.8s cubic-bezier(0.33, 1, 0.68, 1), stroke-opacity 1.1s ease" }}
        />

        <ellipse
          cx="720"
          cy="450"
          rx="710"
          ry="452"
          transform="rotate(-8 720 450)"
          fill="none"
          stroke={dark ? "rgba(255,255,255,0.08)" : "rgba(110,98,90,0.11)"}
          strokeWidth="0.9"
          strokeDasharray="3 11"
          style={{ transition: "stroke 1.1s ease" }}
        />

        <g opacity={dark ? "0.22" : "0.32"} style={{ transition: "opacity 1.1s ease" }}>
          <circle
            cx="1265"
            cy="195"
            r="92"
            fill="none"
            stroke={accent}
            strokeWidth="1"
            style={{ transition: "stroke 1.8s cubic-bezier(0.33, 1, 0.68, 1)" }}
          />
          <circle
            cx="1282"
            cy="185"
            r="68"
            fill="none"
            stroke={secondaryAccent}
            strokeWidth="0.85"
            strokeDasharray="2 7"
            style={{ transition: "stroke 1.8s cubic-bezier(0.33, 1, 0.68, 1)" }}
          />
        </g>

        <g opacity={dark ? "0.18" : "0.26"} style={{ transition: "opacity 1.1s ease" }}>
          <circle
            cx="135"
            cy="720"
            r="138"
            fill="none"
            stroke={secondaryAccent}
            strokeWidth="0.95"
            style={{ transition: "stroke 1.8s cubic-bezier(0.33, 1, 0.68, 1)" }}
          />
          {[0, 18, 36, 54, 72].map((deg) => {
            const rad = ((-65 + deg) * Math.PI) / 180;
            const x1 = 135 + Math.cos(rad) * 133;
            const y1 = 720 + Math.sin(rad) * 133;
            const x2 = 135 + Math.cos(rad) * 143;
            const y2 = 720 + Math.sin(rad) * 143;
            return (
              <line
                key={deg}
                x1={x1.toFixed(1)}
                y1={y1.toFixed(1)}
                x2={x2.toFixed(1)}
                y2={y2.toFixed(1)}
                stroke={accent}
                strokeWidth="1"
                style={{ transition: "stroke 1.8s cubic-bezier(0.33, 1, 0.68, 1)" }}
              />
            );
          })}
        </g>

        {MICRO_STARS.map((st, idx) => {
          const fill = idx % 2 === 0 ? accent : secondaryAccent;
          return (
            <path
              key={idx}
              d={`M ${st.x} ${st.y - st.s} Q ${st.x} ${st.y} ${st.x + st.s} ${st.y} Q ${st.x} ${st.y} ${st.x} ${st.y + st.s} Q ${st.x} ${st.y} ${st.x - st.s} ${st.y} Q ${st.x} ${st.y} ${st.x} ${st.y - st.s} Z`}
              fill={fill}
              opacity={dark ? st.o * 0.82 : st.o}
              style={{ transition: "fill 1.8s cubic-bezier(0.33, 1, 0.68, 1), opacity 1.1s ease" }}
            />
          );
        })}
      </svg>
    </div>
  );
}
