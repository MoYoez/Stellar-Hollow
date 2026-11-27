import { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { DEMO_THEMES } from "@/lib/demo-themes";
import type { ScrollNavChapter } from "@/components/ScrollCurveNav";

interface DynamicIslandNavProps {
  chapters: readonly ScrollNavChapter[];
  activeIdx: number;
  dusk: boolean;
  avatarUrl?: string;
  brandName: string;
  onSelect: (idx: number) => void;
  onToggleDusk: () => void;
}

/**
 * Mobile / Tablet Dynamic Island Navigation (< xl)
 * - Collapsed: sleek floating pill showing active chapter dot, title, micro-progress dots, and theme toggle.
 * - Expanded: spring-morphs into a compact rounded island card with a 3x2 chapter grid.
 * - Gives a subtle elastic breath pulse whenever the active chapter changes while scrolling.
 */
export function DynamicIslandNav({
  chapters,
  activeIdx,
  dusk,
  avatarUrl,
  brandName,
  onSelect,
  onToggleDusk,
}: DynamicIslandNavProps) {
  const [expanded, setExpanded] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const prevIdxRef = useRef(activeIdx);

  // Subtle Dynamic-Island elastic breath when active chapter changes on scroll
  useEffect(() => {
    if (prevIdxRef.current === activeIdx) return;
    prevIdxRef.current = activeIdx;
    setPulsing(true);
    const id = window.setTimeout(() => setPulsing(false), 380);
    return () => window.clearTimeout(id);
  }, [activeIdx]);

  // Collapse on Escape or when scrolling manually while open
  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    const onWheel = () => setExpanded(false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("wheel", onWheel);
    };
  }, [expanded]);

  const activeChapter = chapters[activeIdx] ?? chapters[0];
  const activeTheme = DEMO_THEMES[activeChapter.themeIdx];
  const accent = dusk ? activeTheme.signalDark : activeTheme.pastel;
  const accentInk = dusk ? activeTheme.signalDark : activeTheme.inkLight;

  const islandBg = dusk ? "rgba(15, 17, 25, 0.88)" : "rgba(255, 254, 251, 0.88)";
  const islandBorder = dusk ? "rgba(255, 255, 255, 0.09)" : "rgba(82, 70, 62, 0.09)";
  const islandShadow = expanded
    ? dusk
      ? "0 20px 50px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255,255,255,0.06)"
      : "0 20px 50px rgba(72, 60, 54, 0.14), 0 0 0 1px rgba(82,70,62,0.06)"
    : dusk
    ? "0 10px 28px rgba(0, 0, 0, 0.42)"
    : "0 10px 28px rgba(72, 60, 54, 0.1)";

  const titleColor = dusk ? "#f4f1ea" : "#221e1c";
  const mutedColor = dusk ? "rgba(240, 237, 230, 0.52)" : "rgba(74, 66, 62, 0.58)";

  return (
    <div className="xl:hidden">
      {/* Tap-outside backdrop catcher when expanded */}
      {expanded && (
        <div
          aria-hidden
          onClick={() => setExpanded(false)}
          className="fixed inset-0 z-30"
          style={{
            background: dusk ? "rgba(6, 7, 12, 0.28)" : "rgba(42, 36, 32, 0.08)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Morphing Dynamic Island Container */}
      <nav
        aria-label="章节导航"
        className="fixed top-3.5 left-1/2 z-40 select-none"
        style={{
          transform: `translateX(-50%) scale(${pulsing && !expanded ? 1.045 : 1})`,
          width: expanded ? "min(332px, calc(100vw - 24px))" : "178px",
          borderRadius: expanded ? "26px" : "9999px",
          background: islandBg,
          border: `1px solid ${islandBorder}`,
          boxShadow: islandShadow,
          backdropFilter: "blur(20px) saturate(135%)",
          WebkitBackdropFilter: "blur(20px) saturate(135%)",
          transition:
            "width 0.44s cubic-bezier(0.32, 1.22, 0.42, 1), border-radius 0.44s cubic-bezier(0.32, 1.22, 0.42, 1), transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1), background 1.1s ease, box-shadow 0.4s ease",
        }}
      >
        {/* Top Bar (always visible; acts as the entire collapsed pill) */}
        <div
          className="flex items-center justify-between gap-2"
          style={{
            padding: expanded ? "10px 12px 6px 14px" : "6px 7px 6px 13px",
            transition: "padding 0.36s cubic-bezier(0.32, 1.22, 0.42, 1)",
          }}
        >
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            className="flex-1 min-w-0 border-0 bg-transparent p-0 flex items-center gap-2 cursor-pointer text-left"
          >
            {expanded && avatarUrl && !avatarBroken ? (
              <img
                src={avatarUrl}
                alt=""
                onError={() => setAvatarBroken(true)}
                className="w-5 h-5 rounded-full object-cover shrink-0"
              />
            ) : (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  background: accent,
                  boxShadow: `0 0 10px ${accent}`,
                  transition: "background 0.6s ease, box-shadow 0.6s ease",
                }}
              />
            )}

            <span
              className="text-xs font-medium tracking-tight truncate"
              style={{ color: titleColor }}
            >
              {expanded ? brandName : activeChapter.label}
            </span>

            {/* Micro progress dots when collapsed */}
            {!expanded && (
              <span aria-hidden className="ml-auto flex items-center gap-[3.5px] pr-1">
                {chapters.map((ch, idx) => {
                  const isActive = idx === activeIdx;
                  return (
                    <span
                      key={ch.id}
                      className="rounded-full"
                      style={{
                        width: isActive ? "10px" : "3.5px",
                        height: "3.5px",
                        background: isActive
                          ? accent
                          : dusk
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(74,66,62,0.2)",
                        transition: "width 0.32s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.5s ease",
                      }}
                    />
                  );
                })}
              </span>
            )}
          </button>

          {/* Integrated Theme Toggle inside the Island */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleDusk();
            }}
            aria-label={dusk ? "Light" : "Dark"}
            className="w-6 h-6 rounded-full border-0 flex items-center justify-center cursor-pointer shrink-0 transition-transform duration-200 active:scale-90"
            style={{
              background: dusk ? "rgba(255,255,255,0.08)" : "rgba(82,70,62,0.06)",
              color: accentInk,
              transition: "background 0.6s ease, color 0.8s ease, transform 0.2s ease",
            }}
          >
            {dusk ? <Sun size={12} /> : <Moon size={12} />}
          </button>
        </div>

        {/* Expandable 3x2 Chapter Grid (smooth CSS grid-row morph) */}
        <div
          className="grid overflow-hidden"
          style={{
            gridTemplateRows: expanded ? "1fr" : "0fr",
            opacity: expanded ? 1 : 0,
            transition:
              "grid-template-rows 0.4s cubic-bezier(0.32, 1.2, 0.42, 1), opacity 0.26s ease",
          }}
        >
          <div className="min-h-0">
            <div className="grid grid-cols-3 gap-1.5 px-2.5 pt-1.5 pb-2.5">
              {chapters.map((ch, idx) => {
                const isActive = idx === activeIdx;
                const chTheme = DEMO_THEMES[ch.themeIdx];
                const chDot = dusk ? chTheme.signalDark : chTheme.pastel;
                const chInk = dusk ? chTheme.signalDark : chTheme.inkLight;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    tabIndex={expanded ? 0 : -1}
                    onClick={() => {
                      setExpanded(false);
                      onSelect(idx);
                    }}
                    className="border-0 rounded-2xl py-2 px-2.5 flex items-center justify-center gap-1.5 text-xs cursor-pointer transition-all duration-200 active:scale-95"
                    style={{
                      background: isActive
                        ? `${chDot}${dusk ? "26" : "33"}`
                        : dusk
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(82,70,62,0.035)",
                      color: isActive ? chInk : mutedColor,
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{
                        background: chDot,
                        opacity: isActive ? 1 : 0.55,
                      }}
                    />
                    <span>{ch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
