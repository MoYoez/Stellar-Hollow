import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Camera,
  Check,
  Copy,
  ExternalLink,
  Gamepad2,
  Glasses,
  Headphones,
  Laptop,
  Mail,
  Moon,
  Music,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  Tablet,
  Watch,
} from "lucide-react";
import { FaBlog, FaDiscord, FaMusic, FaQq, FaSteam } from "react-icons/fa";
import { SiGithub, SiMastodon, SiSteamdeck, SiX } from "react-icons/si";
import { SITE_CONFIG } from "@/config/site.config";
import { DEMO_THEMES } from "@/lib/demo-themes";
import { useLiveRepoMap } from "@/lib/github";
import { formatPlayTime, getSteamImageUrl, useSteamRecentGames } from "@/lib/steam";
import { StreamBuilder, useTerminalStream } from "@/lib/terminal-stream";
import { TideWaves } from "@/components/TideWaves";
import { ScrollCurveNav } from "@/components/ScrollCurveNav";
import { DynamicIslandNav } from "@/components/DynamicIslandNav";
import { CelestialBackdrop } from "@/components/CelestialBackdrop";
import { RichText, StreamText } from "@/components/RichText";

export const CHAPTERS = [
  { id: "about", path: "/", label: SITE_CONFIG.sections.about.nav, themeIdx: 0 },
  { id: "devices", path: "/devices", label: SITE_CONFIG.sections.devices.nav, themeIdx: 4 },
  { id: "skills", path: "/skills", label: SITE_CONFIG.sections.skills.nav, themeIdx: 2 },
  { id: "projects", path: "/projects", label: SITE_CONFIG.sections.projects.nav, themeIdx: 1 },
  { id: "play", path: "/play", label: SITE_CONFIG.sections.play.nav, themeIdx: 3 },
  { id: "social", path: "/social", label: SITE_CONFIG.sections.social.nav, themeIdx: 6 },
] as const;

const DEVICE_ICONS = {
  mac: Laptop,
  tablet: Tablet,
  phone: Smartphone,
  watch: Watch,
  audio: Headphones,
  camera: Camera,
  "steam-deck": SiSteamdeck,
  gamepad: Gamepad2,
  vr: Glasses,
} as const;

const SOCIAL_ICONS = {
  blog: FaBlog,
  github: SiGithub,
  netease: FaMusic,
  qq: FaQq,
  twitter: SiX,
  mastodon: SiMastodon,
  discord: FaDiscord,
  status: Activity,
  org: Sparkles,
  email: Mail,
} as const;

const LANG_DOT: Record<string, string> = {
  TypeScript: "#7ba7d4",
  Rust: "#d49a89",
  Go: "#87bec9",
  GLSL: "#a8a4d4",
};

function buildAboutStreamPlan() {
  const b = new StreamBuilder();

  b.add("profile.name", SITE_CONFIG.profile.name, 140);
  b.add("profile.alias", SITE_CONFIG.profile.alias, 110);
  b.add("profile.command", SITE_CONFIG.profile.command, 260);
  b.add("profile.tagline", SITE_CONFIG.profile.tagline, 210);
  SITE_CONFIG.profile.paragraphs.forEach((p, i) => {
    b.add(`profile.p.${i}`, p, 220);
  });
  SITE_CONFIG.profile.quickFacts.forEach((fact, i) => {
    b.add(`profile.fact.${i}.label`, fact.label, 80);
    b.add(`profile.fact.${i}.value`, fact.value, 130);
  });

  return b.build();
}

export function PersonalScrollPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const repoMap = useLiveRepoMap();
  const steamQuery = useSteamRecentGames(
    SITE_CONFIG.play.steamApiUrl,
    SITE_CONFIG.play.steamCount
  );

  const aboutPlan = useMemo(() => buildAboutStreamPlan(), []);
  const stream = useTerminalStream(aboutPlan);
  const lastAboutId = aboutPlan.order[aboutPlan.order.length - 1]?.id ?? null;

  const [dusk, setDusk] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openDeviceId, setOpenDeviceId] = useState<string | null>(null);
  const [openSteamAppId, setOpenSteamAppId] = useState<number | null>(null);

  // Avatar poke bubble state
  const [pokeBubble, setPokeBubble] = useState<{ key: number; text: string } | null>(null);
  const pokeCountRef = useRef(0);
  const pokeTimerRef = useRef<number | null>(null);

  // Prevents scroll-spy from fighting programmatic smooth scroll after clicking a chapter
  const scrollLockUntilRef = useRef<number>(0);
  // Tracks whether the user manually skipped typing (skip = instant reveal, natural finish = 1-beat pause)
  const manualSkipRef = useRef(false);

  const triggerSkipToEnd = () => {
    manualSkipRef.current = true;
    stream.skipToEnd();
  };

  const triggerReplay = () => {
    manualSkipRef.current = false;
    stream.replay();
  };

  useEffect(() => {
    return () => {
      if (pokeTimerRef.current !== null) window.clearTimeout(pokeTimerRef.current);
    };
  }, []);

  // Release click-scroll lock immediately if the user manually scrolls via wheel/touch
  useEffect(() => {
    const releaseLock = () => {
      scrollLockUntilRef.current = 0;
    };
    window.addEventListener("wheel", releaseLock, { passive: true });
    window.addEventListener("touchstart", releaseLock, { passive: true });
    return () => {
      window.removeEventListener("wheel", releaseLock);
      window.removeEventListener("touchstart", releaseLock);
    };
  }, []);

  // Enter / Escape completes About typing immediately
  useEffect(() => {
    if (stream.isDone) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") {
        manualSkipRef.current = true;
        stream.skipToEnd();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [stream.isDone, stream.skipToEnd]);

  useEffect(() => {
    const idx = CHAPTERS.findIndex((c) => c.path === pathname);
    if (idx < 0) return;
    scrollLockUntilRef.current = performance.now() + 800;
    setActiveIdx(idx);
    if (idx === 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!stream.isDone) {
      manualSkipRef.current = true;
      stream.skipToEnd();
    }
    window.requestAnimationFrame(() => {
      const el = document.getElementById(CHAPTERS[idx].id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      if (performance.now() < scrollLockUntilRef.current) return;

      // Always keep "关于" active when at the top of the page (even on tall displays)
      if (window.scrollY < 24 || !stream.isDone) {
        setActiveIdx(0);
        return;
      }

      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (maxScroll > 40 && window.scrollY >= maxScroll - 4) {
        setActiveIdx(CHAPTERS.length - 1);
        return;
      }

      // Use viewport-relative getBoundingClientRect().top (immune to offsetParent / transforms)
      const triggerY = Math.min(220, window.innerHeight * 0.26);
      let current = 0;
      CHAPTERS.forEach((ch, idx) => {
        const el = document.getElementById(ch.id);
        if (el && el.getBoundingClientRect().top <= triggerY) {
          current = idx;
        }
      });
      setActiveIdx(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [stream.isDone]);

  const jumpToChapter = (idx: number) => {
    const ch = CHAPTERS[idx];
    scrollLockUntilRef.current = performance.now() + 800;
    if (idx > 0 && !stream.isDone) {
      triggerSkipToEnd();
    }
    setActiveIdx(idx);
    if (pathname !== ch.path) {
      void navigate({ to: ch.path });
    } else if (idx === 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.requestAnimationFrame(() => {
        document.getElementById(ch.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1600);
  };

  const handleToggleDusk = () => {
    setDusk((v) => !v);
  };

  const handlePokeAvatar = () => {
    const pokes = SITE_CONFIG.presence.avatarPokes;
    if (!pokes.length) return;
    const text = pokes[pokeCountRef.current % pokes.length];
    pokeCountRef.current += 1;
    setPokeBubble({ key: pokeCountRef.current, text });
    if (pokeTimerRef.current !== null) window.clearTimeout(pokeTimerRef.current);
    pokeTimerRef.current = window.setTimeout(() => {
      setPokeBubble(null);
    }, 2650);
  };

  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (stream.isDone) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest("a, button, nav")) return;
    if (window.getSelection()?.toString()) return;
    triggerSkipToEnd();
  };

  const activeTheme = DEMO_THEMES[CHAPTERS[activeIdx].themeIdx];
  const secondaryTheme = DEMO_THEMES[(CHAPTERS[activeIdx].themeIdx + 1) % DEMO_THEMES.length];
  const accent = dusk ? activeTheme.signalDark : activeTheme.pastel;
  const secondaryAccent = dusk ? secondaryTheme.signalDark : secondaryTheme.pastel;
  const accentInk = dusk ? activeTheme.signalDark : activeTheme.inkLight;

  const mutedText = dusk ? "rgba(240, 237, 230, 0.58)" : "rgba(74, 66, 62, 0.64)";
  const bodyText = dusk ? "rgba(240, 237, 230, 0.84)" : "#37322e";
  const headingText = dusk ? "#f4f1ea" : "#221e1c";
  const hairline = dusk ? "rgba(255, 255, 255, 0.065)" : "rgba(82, 70, 62, 0.075)";
  const softChipBg = dusk ? "rgba(255, 255, 255, 0.055)" : "rgba(255, 254, 251, 0.72)";

  const deviceColor = dusk ? DEMO_THEMES[4].signalDark : DEMO_THEMES[4].inkLight;
  const skillColor = dusk ? DEMO_THEMES[2].signalDark : DEMO_THEMES[2].inkLight;
  const projectColor = dusk ? DEMO_THEMES[1].signalDark : DEMO_THEMES[1].inkLight;
  const playColor = dusk ? DEMO_THEMES[3].signalDark : DEMO_THEMES[3].inkLight;
  const socialColor = dusk ? DEMO_THEMES[6].signalDark : DEMO_THEMES[6].inkLight;

  return (
    <div
      onClick={handleStageClick}
      className="relative min-h-[100dvh]"
      style={{
        color: bodyText,
        transition: "color 1.1s cubic-bezier(0.33, 1, 0.68, 1)",
      }}
    >
      {/* Combined Backdrop: Softly veiled watercolor sky-islands + delicate astronomical blueprint */}
      <CelestialBackdrop
        themeIdx={CHAPTERS[activeIdx].themeIdx}
        accent={accent}
        secondaryAccent={secondaryAccent}
        dark={dusk}
      />

      {/* Gentle 3-layer Morandi tide waves along the bottom edge */}
      <TideWaves primaryColor={accent} secondaryColor={secondaryAccent} dark={dusk} />

      {/* Minimal Top-Right Light/Dark Toggle (Desktop only; mobile integrates it inside the Dynamic Island) */}
      <button
        type="button"
        onClick={handleToggleDusk}
        aria-label={dusk ? "Light" : "Dark"}
        className="hidden xl:flex fixed top-5 right-5 z-40 w-8 h-8 rounded-full border-0 items-center justify-center cursor-pointer backdrop-blur-md hover:scale-105"
        style={{
          background: dusk ? "rgba(255,255,255,0.09)" : "rgba(255,254,251,0.82)",
          color: dusk ? accent : accentInk,
          transition: "background 1.1s ease, color 1.4s ease, transform 0.25s ease",
        }}
      >
        {dusk ? <Sun size={13} /> : <Moon size={13} />}
      </button>

      {/* Left-Side Minimal 2-Char Chapter Menu with Curved Swooping Dot (Desktop) */}
      <ScrollCurveNav
        chapters={CHAPTERS}
        activeIdx={activeIdx}
        dusk={dusk}
        onSelect={jumpToChapter}
      />

      {/* Mobile / Tablet Dynamic Island Navigation */}
      <DynamicIslandNav
        chapters={CHAPTERS}
        activeIdx={activeIdx}
        dusk={dusk}
        avatarUrl={SITE_CONFIG.profile.avatarUrl}
        brandName={SITE_CONFIG.profile.name}
        onSelect={jumpToChapter}
        onToggleDusk={handleToggleDusk}
      />

      {/* ===== MAIN EDITORIAL READING COLUMN ===== */}
      <main className="relative z-10 mx-auto max-w-[680px] px-6 sm:px-10 pt-22 xl:pt-24 pb-32 space-y-18 sm:space-y-20">
        {/* === 01 · 关于 (Live Terminal Typing Stream) === */}
        <section id="about" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {pokeBubble && (
                <div
                  key={pokeBubble.key}
                  className="poke-bubble pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full font-mono text-[11px] z-20"
                  style={{
                    background: dusk ? "rgba(32, 35, 48, 0.92)" : "rgba(255, 254, 251, 0.94)",
                    color: headingText,
                    boxShadow: dusk
                      ? "0 8px 20px rgba(0,0,0,0.35)"
                      : "0 8px 20px rgba(82,70,64,0.1)",
                  }}
                >
                  {pokeBubble.text}
                </div>
              )}

              <button
                type="button"
                onClick={handlePokeAvatar}
                aria-label={SITE_CONFIG.profile.name}
                className="w-14 h-14 rounded-full overflow-hidden border-0 p-0 flex items-center justify-center cursor-pointer transition-transform duration-200 active:scale-90 hover:scale-[1.03]"
                style={{
                  background: dusk ? `${accent}24` : "#fffdf9",
                  boxShadow: `0 10px 26px ${accent}3d`,
                  transition: "box-shadow 1.6s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {SITE_CONFIG.profile.avatarUrl && !avatarBroken ? (
                  <img
                    src={SITE_CONFIG.profile.avatarUrl}
                    alt={SITE_CONFIG.profile.name}
                    onError={() => setAvatarBroken(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Sparkles size={18} style={{ color: accentInk }} />
                )}
              </button>
            </div>

            <div className="space-y-1 min-h-[3.1rem] flex flex-col justify-center">
              <div className="flex items-baseline gap-2.5">
                <h1
                  className="m-0 text-2xl sm:text-[1.65rem] font-semibold tracking-tight"
                  style={{ color: headingText, transition: "color 1.1s ease" }}
                >
                  <StreamText
                    id="profile.name"
                    text={SITE_CONFIG.profile.name}
                    stream={stream}
                    cursorColor={accentInk}
                    restCursor={stream.isDone && lastAboutId === "profile.name"}
                  />
                </h1>
                {SITE_CONFIG.profile.alias && stream.hasReached("profile.alias") && (
                  <span className="font-mono text-xs" style={{ color: mutedText }}>
                    <StreamText
                      id="profile.alias"
                      text={SITE_CONFIG.profile.alias}
                      stream={stream}
                      cursorColor={accentInk}
                      restCursor={stream.isDone && lastAboutId === "profile.alias"}
                    />
                  </span>
                )}
              </div>
              {SITE_CONFIG.profile.command && stream.hasReached("profile.command") && (
                <button
                  type="button"
                  onClick={() => (stream.isDone ? triggerReplay() : triggerSkipToEnd())}
                  className="w-fit border-0 bg-transparent p-0 font-mono text-xs text-left cursor-pointer"
                  style={{ color: accentInk, transition: "color 1.4s ease" }}
                >
                  <span className="opacity-50 mr-1.5 select-none">$</span>
                  <StreamText
                    id="profile.command"
                    text={SITE_CONFIG.profile.command}
                    stream={stream}
                    cursorColor={accentInk}
                    restCursor={stream.isDone && lastAboutId === "profile.command"}
                  />
                </button>
              )}
            </div>
          </div>

          {SITE_CONFIG.profile.tagline && stream.hasReached("profile.tagline") && (
            <p
              className="m-0 text-[0.98rem] leading-[1.8] font-medium"
              style={{ color: headingText }}
            >
              <StreamText
                id="profile.tagline"
                text={SITE_CONFIG.profile.tagline}
                stream={stream}
                cursorColor={accentInk}
                restCursor={stream.isDone && lastAboutId === "profile.tagline"}
              />
            </p>
          )}

          {SITE_CONFIG.profile.paragraphs.length > 0 && (
            <div className="space-y-3.5 text-[0.92rem] leading-[1.9] min-h-[1.9em]" style={{ color: bodyText }}>
              {SITE_CONFIG.profile.paragraphs.map((p, i) => {
                const id = `profile.p.${i}`;
                if (!stream.hasReached(id)) return null;
                return (
                  <p key={i} className="m-0">
                    <StreamText
                      id={id}
                      text={p}
                      stream={stream}
                      cursorColor={accentInk}
                      restCursor={stream.isDone && lastAboutId === id}
                    />
                  </p>
                );
              })}
            </div>
          )}

          {SITE_CONFIG.profile.quickFacts.length > 0 &&
            stream.hasReached("profile.fact.0.label") && (
              <dl className="m-0 pt-1 flex flex-wrap gap-x-8 gap-y-2">
                {SITE_CONFIG.profile.quickFacts.map((fact, i) => {
                  const labelId = `profile.fact.${i}.label`;
                  const valueId = `profile.fact.${i}.value`;
                  if (!stream.hasReached(labelId)) return null;
                  return (
                    <div key={fact.label} className="flex items-baseline gap-2 text-xs">
                      <dt className="font-mono" style={{ color: accentInk }}>
                        <StreamText
                          id={labelId}
                          text={fact.label}
                          stream={stream}
                          cursorColor={accentInk}
                        />
                      </dt>
                      {stream.hasReached(valueId) && (
                        <dd className="m-0" style={{ color: mutedText }}>
                          <StreamText
                            id={valueId}
                            text={fact.value}
                            stream={stream}
                            cursorColor={accentInk}
                            restCursor={stream.isDone && lastAboutId === valueId}
                          />
                        </dd>
                      )}
                    </div>
                  );
                })}
              </dl>
            )}
        </section>

        {/* === 02–06 · 设备 / 技能 / 作品 / 游玩 / 联系 (Pause a gentle beat after natural typing before revealing) === */}
        {stream.isDone && (
          <div
            className={`space-y-18 sm:space-y-20 stream-reveal ${
              manualSkipRef.current ? "" : "stream-reveal--delayed"
            }`}
          >
        {/* === 02 · 设备 === */}
        <section id="devices" className="scroll-mt-24 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: dusk ? DEMO_THEMES[4].signalDark : DEMO_THEMES[4].pastel }}
              />
              <h2 className="m-0 text-lg font-semibold tracking-tight" style={{ color: headingText }}>
                {SITE_CONFIG.sections.devices.heading}
              </h2>
            </div>
            {SITE_CONFIG.devices.intro && (
              <p className="m-0 text-sm leading-[1.8]" style={{ color: mutedText }}>
                <RichText text={SITE_CONFIG.devices.intro} />
              </p>
            )}
          </div>

          {SITE_CONFIG.devices.items.length > 0 && (
            <div className="space-y-4">
              {Array.from(
                SITE_CONFIG.devices.items.reduce((map, d) => {
                  const key = d.group ?? "";
                  const arr = map.get(key) ?? [];
                  arr.push(d);
                  map.set(key, arr);
                  return map;
                }, new Map<string, (typeof SITE_CONFIG.devices.items)[number][]>())
              ).map(([groupName, items]) => (
                <div
                  key={groupName || "all"}
                  className="grid grid-cols-1 sm:grid-cols-[4.5rem_1fr] gap-2 sm:gap-5 items-baseline"
                >
                  {groupName && (
                    <span className="text-xs font-medium tracking-wide" style={{ color: deviceColor }}>
                      {groupName}
                    </span>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    {items.map((device) => {
                      const Icon = (device.icon && DEVICE_ICONS[device.icon]) || Laptop;
                      const hasNote = Boolean(device.note);
                      const isOpen = openDeviceId === device.id;
                      return (
                        <span
                          key={device.id}
                          onClick={
                            hasNote
                              ? () => setOpenDeviceId((cur) => (cur === device.id ? null : device.id))
                              : undefined
                          }
                          onMouseLeave={hasNote ? () => setOpenDeviceId(null) : undefined}
                          className="group relative inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-transform duration-200 hover:-translate-y-0.5"
                          style={{
                            background: softChipBg,
                            color: headingText,
                            cursor: hasNote ? "pointer" : "default",
                          }}
                        >
                          <Icon size={12} style={{ color: deviceColor }} className="shrink-0 opacity-85" />
                          <span className="font-medium">{device.name}</span>

                          {hasNote && (
                            <span
                              role="tooltip"
                              className={`pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 w-max max-w-[240px] px-3 py-1.5 rounded-xl text-[11px] leading-relaxed transition-all duration-200 ease-out ${
                                isOpen
                                  ? "opacity-100 translate-y-0"
                                  : "opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0"
                              }`}
                              style={{
                                background: dusk
                                  ? "rgba(28, 31, 44, 0.94)"
                                  : "rgba(255, 254, 251, 0.96)",
                                color: bodyText,
                                boxShadow: dusk
                                  ? "0 10px 26px rgba(0, 0, 0, 0.42)"
                                  : "0 10px 26px rgba(72, 60, 54, 0.12)",
                                backdropFilter: "blur(12px)",
                                WebkitBackdropFilter: "blur(12px)",
                              }}
                            >
                              <RichText text={device.note!} />
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* === 03 · 技能 (工具 / 技术栈) === */}
        <section id="skills" className="scroll-mt-24 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: dusk ? DEMO_THEMES[2].signalDark : DEMO_THEMES[2].pastel }}
              />
              <h2 className="m-0 text-lg font-semibold tracking-tight" style={{ color: headingText }}>
                {SITE_CONFIG.sections.skills.heading}
              </h2>
            </div>
            {SITE_CONFIG.skills.intro && (
              <p className="m-0 text-sm leading-[1.8]" style={{ color: mutedText }}>
                <RichText text={SITE_CONFIG.skills.intro} />
              </p>
            )}
          </div>

          <div className="space-y-5">
            {/* 工具 */}
            {SITE_CONFIG.skills.tools.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-[4.5rem_1fr] gap-2 sm:gap-5 items-baseline">
                <span className="text-xs font-medium tracking-wide" style={{ color: skillColor }}>
                  {SITE_CONFIG.sections.skills.toolsLabel}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {SITE_CONFIG.skills.tools.map((tool) => {
                    const inner = (
                      <>
                        <span className="font-medium">{tool.name}</span>
                        {tool.note && (
                          <span className="text-[11px]" style={{ color: mutedText }}>
                            <RichText text={tool.note} />
                          </span>
                        )}
                        {tool.url && (
                          <ExternalLink size={10} style={{ color: skillColor }} className="opacity-70" />
                        )}
                      </>
                    );

                    if (tool.url) {
                      return (
                        <a
                          key={tool.id}
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full no-underline transition-opacity hover:opacity-80"
                          style={{
                            background: softChipBg,
                            color: headingText,
                          }}
                        >
                          {inner}
                        </a>
                      );
                    }

                    return (
                      <span
                        key={tool.id}
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                        style={{
                          background: softChipBg,
                          color: headingText,
                        }}
                      >
                        {inner}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 技术栈 */}
            {SITE_CONFIG.skills.stack.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-[4.5rem_1fr] gap-2 sm:gap-5 items-baseline">
                <span className="text-xs font-medium tracking-wide" style={{ color: skillColor }}>
                  {SITE_CONFIG.sections.skills.stackLabel}
                </span>
                <div className="space-y-3">
                  {SITE_CONFIG.skills.stack.map((group) => (
                    <div key={group.label} className="flex flex-wrap items-center gap-2">
                      {SITE_CONFIG.skills.stack.length > 1 && (
                        <span className="text-xs mr-1" style={{ color: mutedText }}>
                          {group.label}
                        </span>
                      )}
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="font-mono text-xs px-2.5 py-1 rounded-full"
                          style={{
                            background: softChipBg,
                            color: headingText,
                          }}
                        >
                          <RichText text={item} />
                        </span>
                      ))}
                    </div>
                  ))}
                  {SITE_CONFIG.skills.stackNote && (
                    <p className="m-0 pt-0.5 text-xs leading-relaxed" style={{ color: mutedText }}>
                      <RichText text={SITE_CONFIG.skills.stackNote} />
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* === 03 · 作品 (紧凑列表直出) === */}
        <section id="projects" className="scroll-mt-24 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: dusk ? DEMO_THEMES[1].signalDark : DEMO_THEMES[1].pastel }}
              />
              <h2 className="m-0 text-lg font-semibold tracking-tight" style={{ color: headingText }}>
                {SITE_CONFIG.sections.projects.heading}
              </h2>
            </div>
            {SITE_CONFIG.projects.intro && (
              <p className="m-0 text-sm leading-[1.8]" style={{ color: mutedText }}>
                <RichText text={SITE_CONFIG.projects.intro} />
              </p>
            )}
          </div>

          {SITE_CONFIG.projects.items.length > 0 && (
            <ul className="m-0 p-0 list-none">
              {SITE_CONFIG.projects.items.map((proj) => {
                const remote = repoMap[proj.repo.toLowerCase()];
                const stars = remote?.stargazers_count ?? proj.fallbackStars ?? 0;
                const lang = remote?.language ?? proj.language;
                return (
                  <li key={proj.repo} style={{ borderBottom: `1px solid ${hairline}` }}>
                    <a
                      href={proj.demoUrl ?? proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group py-3.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 sm:gap-4 no-underline transition-opacity hover:opacity-85"
                    >
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 min-w-0">
                        <span
                          className="font-mono text-sm font-medium group-hover:underline underline-offset-4"
                          style={{ color: headingText }}
                        >
                          {proj.title}
                        </span>
                        <span className="text-xs leading-relaxed" style={{ color: mutedText }}>
                          <RichText text={proj.summary} />
                        </span>
                      </div>

                      <div
                        className="flex items-center gap-3 shrink-0 font-mono text-[11px]"
                        style={{ color: projectColor }}
                      >
                        {lang && (
                          <span className="inline-flex items-center gap-1.5" style={{ color: mutedText }}>
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: LANG_DOT[lang] ?? projectColor }}
                            />
                            {lang}
                          </span>
                        )}
                        {stars > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Star size={11} /> {stars}
                          </span>
                        )}
                        <ExternalLink size={12} className="opacity-50 group-hover:opacity-100" />
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* === 05 · 游玩 (Steam 最近游玩 PC / Steam Deck + 可选音乐) === */}
        <section id="play" className="scroll-mt-24 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: dusk ? DEMO_THEMES[3].signalDark : DEMO_THEMES[3].pastel }}
                />
                <h2 className="m-0 text-lg font-semibold tracking-tight" style={{ color: headingText }}>
                  {SITE_CONFIG.sections.play.heading}
                </h2>
              </div>
              {SITE_CONFIG.play.steamApiUrl && (
                <div
                  className="inline-flex items-center gap-2 font-mono text-[11px]"
                  style={{ color: playColor }}
                >
                  <span className="inline-flex items-center gap-1">
                    <FaSteam size={12} />
                    <span>PC</span>
                  </span>
                  {steamQuery.data?.games.some((g) => (g.playtime_deck_forever ?? 0) > 0) && (
                    <span className="inline-flex items-center gap-1">
                      <SiSteamdeck size={12} />
                      <span>Deck</span>
                    </span>
                  )}
                </div>
              )}
            </div>
            {SITE_CONFIG.play.intro && (
              <p className="m-0 text-sm leading-[1.8]" style={{ color: mutedText }}>
                <RichText text={SITE_CONFIG.play.intro} />
              </p>
            )}
          </div>

          <div className="space-y-6">
            {/* Steam Live Recent Games */}
            {SITE_CONFIG.play.steamApiUrl && steamQuery.isPending && (
              <p className="m-0 text-xs" style={{ color: mutedText }}>
                正在拉取 Steam 游戏记录…
              </p>
            )}

            {steamQuery.data && steamQuery.data.games.length > 0 && (
              <ul className="m-0 p-0 list-none">
                {steamQuery.data.games.map((game) => {
                  const deckMins = game.playtime_deck_forever ?? 0;
                  const hasDeck = deckMins > 0;
                  const pcMins = Math.max(0, game.playtime_forever - deckMins);
                  const isOpen = openSteamAppId === game.appid;
                  const iconUrl = getSteamImageUrl(game.appid, game.img_icon_url);

                  return (
                    <li
                      key={game.appid}
                      className="flex items-center gap-3 py-2.5 text-sm"
                      style={{ borderBottom: `1px solid ${hairline}` }}
                    >
                      {iconUrl ? (
                        <img
                          src={iconUrl}
                          alt=""
                          width={22}
                          height={22}
                          loading="lazy"
                          className="w-[22px] h-[22px] rounded object-cover shrink-0"
                        />
                      ) : (
                        <span
                          className="w-[22px] h-[22px] rounded shrink-0"
                          style={{ background: softChipBg }}
                        />
                      )}
                      <span className="flex-1 min-w-0 truncate font-medium" style={{ color: headingText }}>
                        {game.name}
                      </span>
                      <div
                        className="group relative shrink-0"
                        onMouseLeave={() => setOpenSteamAppId(null)}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenSteamAppId((cur) => (cur === game.appid ? null : game.appid))
                          }
                          className="border-0 bg-transparent px-2 py-0.5 rounded-md font-mono text-xs cursor-pointer"
                          style={{ color: mutedText }}
                        >
                          {game.playtime_2weeks > 0
                            ? `近两周 ${formatPlayTime(game.playtime_2weeks)}`
                            : `总时长 ${formatPlayTime(game.playtime_forever)}`}
                        </button>
                        <div
                          role="tooltip"
                          className={`pointer-events-none absolute right-0 bottom-full mb-2 z-30 w-max px-3 py-2 rounded-xl font-mono text-[11px] flex flex-col gap-1 transition-all duration-200 ease-out ${
                            isOpen
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0"
                          }`}
                          style={{
                            background: dusk
                              ? "rgba(28, 31, 44, 0.94)"
                              : "rgba(255, 254, 251, 0.96)",
                            color: bodyText,
                            boxShadow: dusk
                              ? "0 10px 26px rgba(0, 0, 0, 0.42)"
                              : "0 10px 26px rgba(72, 60, 54, 0.12)",
                            backdropFilter: "blur(12px)",
                            WebkitBackdropFilter: "blur(12px)",
                          }}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <FaSteam size={11} style={{ color: playColor }} />
                            <span>PC {formatPlayTime(pcMins)}</span>
                          </span>
                          {hasDeck && (
                            <span className="inline-flex items-center gap-1.5">
                              <SiSteamdeck size={11} style={{ color: playColor }} />
                              <span>Deck {formatPlayTime(deckMins)}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {steamQuery.data && steamQuery.data.games.length === 0 && (
              <p className="m-0 text-xs" style={{ color: mutedText }}>
                暂无最近游玩记录。
              </p>
            )}

            {/* Static fallback games if Steam API is not configured yet */}
            {!steamQuery.data && SITE_CONFIG.play.games.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-[4.5rem_1fr] gap-2 sm:gap-5 items-baseline">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide"
                  style={{ color: playColor }}
                >
                  <Gamepad2 size={13} />
                  <span>{SITE_CONFIG.sections.play.gamesLabel}</span>
                </span>
                <ul className="m-0 p-0 list-none space-y-2.5">
                  {SITE_CONFIG.play.games.map((g) => (
                    <li
                      key={g.name}
                      className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 pb-2.5"
                      style={{ borderBottom: `1px solid ${hairline}` }}
                    >
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                        <span className="text-sm font-medium" style={{ color: headingText }}>
                          {g.name}
                        </span>
                        {g.note && (
                          <span className="text-xs leading-relaxed" style={{ color: mutedText }}>
                            <RichText text={g.note} />
                          </span>
                        )}
                      </div>
                      {g.platform && (
                        <span className="font-mono text-[11px]" style={{ color: mutedText }}>
                          {g.platform}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {SITE_CONFIG.play.music.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-[4.5rem_1fr] gap-2 sm:gap-5 items-baseline">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide"
                  style={{ color: playColor }}
                >
                  <Music size={13} />
                  <span>{SITE_CONFIG.sections.play.musicLabel}</span>
                </span>
                <ul className="m-0 p-0 list-none space-y-2.5">
                  {SITE_CONFIG.play.music.map((m) => (
                    <li
                      key={m.title}
                      className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 pb-2.5"
                      style={{ borderBottom: `1px solid ${hairline}` }}
                    >
                      <span className="text-sm font-medium" style={{ color: headingText }}>
                        {m.title}
                      </span>
                      <span className="text-xs" style={{ color: mutedText }}>
                        — {m.artist}
                      </span>
                      {m.note && (
                        <span className="text-xs leading-relaxed" style={{ color: mutedText }}>
                          <RichText text={m.note} />
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* === 05 · 联系 (极简行内链接列表) === */}
        <section id="social" className="scroll-mt-24 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: dusk ? DEMO_THEMES[6].signalDark : DEMO_THEMES[6].pastel }}
              />
              <h2 className="m-0 text-lg font-semibold tracking-tight" style={{ color: headingText }}>
                {SITE_CONFIG.sections.social.heading}
              </h2>
            </div>
            {SITE_CONFIG.social.intro && (
              <p className="m-0 text-sm leading-[1.8]" style={{ color: mutedText }}>
                <RichText text={SITE_CONFIG.social.intro} />
              </p>
            )}
          </div>

          {SITE_CONFIG.social.links.length > 0 && (
            <ul className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
              {SITE_CONFIG.social.links.map((item) => {
                const Icon = SOCIAL_ICONS[item.id];
                const copied = copiedId === item.id;

                const content = (
                  <>
                    <span className="inline-flex items-center gap-2.5 shrink-0">
                      <Icon size={15} style={{ color: socialColor }} />
                      <span className="text-sm font-medium" style={{ color: headingText }}>
                        {item.label}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-2 min-w-0">
                      <span className="font-mono text-xs truncate" style={{ color: mutedText }}>
                        {item.handle}
                      </span>
                      {item.copyText ? (
                        copied ? (
                          <Check size={12} style={{ color: socialColor }} className="shrink-0" />
                        ) : (
                          <Copy
                            size={11}
                            style={{ color: socialColor }}
                            className="shrink-0 opacity-55"
                          />
                        )
                      ) : (
                        <ExternalLink
                          size={11}
                          style={{ color: socialColor }}
                          className="shrink-0 opacity-45 group-hover:opacity-100 transition-opacity"
                        />
                      )}
                    </span>
                  </>
                );

                if (item.copyText) {
                  return (
                    <li key={item.id} style={{ borderBottom: `1px solid ${hairline}` }}>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.id, item.copyText!)}
                        className="group w-full border-0 bg-transparent px-0 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-opacity hover:opacity-80"
                      >
                        {content}
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={item.id} style={{ borderBottom: `1px solid ${hairline}` }}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group w-full py-2.5 flex items-center justify-between gap-3 no-underline transition-opacity hover:opacity-80"
                    >
                      {content}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}

          {SITE_CONFIG.social.closing && (
            <footer className="pt-8 text-xs font-mono" style={{ color: mutedText }}>
              {SITE_CONFIG.social.closing}
            </footer>
          )}
        </section>
          </div>
        )}
      </main>
    </div>
  );
}
