export type ThemeId =
  | "maple"
  | "sunset"
  | "sand"
  | "forest"
  | "stream"
  | "bluebell"
  | "wisteria";

export interface DemoThemeTokens {
  id: ThemeId;
  index: string;
  section: string;
  natural: string;
  english: string;
  starCode: string;
  coords: string;
  /** Soft Morandi pastel (for Ceramic / Light Hollow) */
  pastel: string;
  /** Readable text ink on light background */
  inkLight: string;
  /** Luminous soft-neon signal color (for Obsidian / Dark Hollow) */
  signalDark: string;
  /** Glow color */
  glow: string;
  rgb: [number, number, number];
  imagery: string;
}

export const DEMO_THEMES: readonly DemoThemeTokens[] = [
  {
    id: "maple",
    index: "01",
    section: "关于",
    natural: "枫叶",
    english: "Origin",
    starCode: "α-MAPLE",
    coords: "04h12m +28°",
    pastel: "#e8b4a0",
    inkLight: "#b46e54",
    signalDark: "#ff9e7d",
    glow: "rgba(232, 180, 160, 0.42)",
    rgb: [232, 180, 160],
    imagery: "✨ [Thinking ...] No output and go to sleep 😴",
  },
  {
    id: "sunset",
    index: "02",
    section: "作品",
    natural: "晚霞",
    english: "Works",
    starCode: "β-SUNSET",
    coords: "07h45m +19°",
    pastel: "#d4a5b5",
    inkLight: "#9c5e74",
    signalDark: "#f28eb0",
    glow: "rgba(212, 165, 181, 0.42)",
    rgb: [212, 165, 181],
    imagery: "Side projects / toys",
  },
  {
    id: "sand",
    index: "03",
    section: "技能",
    natural: "沙滩",
    english: "Craft",
    starCode: "γ-SAND",
    coords: "11h08m +06°",
    pastel: "#e5d4b8",
    inkLight: "#967b4d",
    signalDark: "#f2d68a",
    glow: "rgba(229, 212, 184, 0.45)",
    rgb: [229, 212, 184],
    imagery: "Tech stack / tools",
  },
  {
    id: "forest",
    index: "04",
    section: "游玩",
    natural: "森林",
    english: "Playlog",
    starCode: "δ-FOREST",
    coords: "14h30m -08°",
    pastel: "#a8c4a0",
    inkLight: "#5f8556",
    signalDark: "#9be08c",
    glow: "rgba(168, 196, 160, 0.42)",
    rgb: [168, 196, 160],
    imagery: "Recent games",
  },
  {
    id: "stream",
    index: "05",
    section: "此刻",
    natural: "溪流",
    english: "Drift",
    starCode: "ε-STREAM",
    coords: "17h52m -17°",
    pastel: "#a8c8d4",
    inkLight: "#4f8092",
    signalDark: "#87d6eb",
    glow: "rgba(168, 200, 212, 0.42)",
    rgb: [168, 200, 212],
    imagery: "Status / stream",
  },
  {
    id: "bluebell",
    index: "06",
    section: "随想",
    natural: "蓝铃",
    english: "Echoes",
    starCode: "ζ-BLUEBELL",
    coords: "21h16m -24°",
    pastel: "#b8b8d8",
    inkLight: "#69699e",
    signalDark: "#abaef5",
    glow: "rgba(184, 184, 216, 0.42)",
    rgb: [184, 184, 216],
    imagery: "Scattered thoughts",
  },
  {
    id: "wisteria",
    index: "07",
    section: "联系",
    natural: "紫藤",
    english: "Signal",
    starCode: "η-WISTERIA",
    coords: "23h48m +03°",
    pastel: "#c8b8d8",
    inkLight: "#8264a0",
    signalDark: "#cfabf7",
    glow: "rgba(200, 184, 216, 0.42)",
    rgb: [200, 184, 216],
    imagery: "Link to my social network",
  },
] as const;

export function getDemoTheme(id: ThemeId): DemoThemeTokens {
  return DEMO_THEMES.find((t) => t.id === id) ?? DEMO_THEMES[0];
}
