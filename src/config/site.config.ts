/**
 * Stellar Hollow — 个人内容配置文件
 * ---------------------------------
 * 所有文案与条目都在这里维护；任意列表留空 `[]` 时对应区块会自动隐藏。
 * 文案支持 `~~删除线~~` 写法（悬停时显露）。
 */

export interface DeviceItem {
  id: string;
  /** 可选图标："mac" | "tablet" | "phone" | "watch" | "audio" | "camera" | "steam-deck" | "gamepad" | "vr" */
  icon?: "mac" | "tablet" | "phone" | "watch" | "audio" | "camera" | "steam-deck" | "gamepad" | "vr";
  name: string;
  group?: string;
  note?: string;
}

export interface ToolItem {
  id: string;
  name: string;
  note?: string;
  url?: string;
}

export interface StackGroup {
  label: string;
  items: string[];
}

export interface ProjectItem {
  repo: string;
  title: string;
  summary: string;
  language?: string;
  fallbackStars?: number;
  url: string;
  demoUrl?: string;
}

export interface GameItem {
  name: string;
  platform?: string;
  note?: string;
}

export interface MusicTrack {
  title: string;
  artist: string;
  note?: string;
  url?: string;
}

export interface SocialLink {
  id:
    | "blog"
    | "github"
    | "netease"
    | "qq"
    | "twitter"
    | "mastodon"
    | "discord"
    | "status"
    | "org"
    | "email";
  label: string;
  handle: string;
  href?: string;
  copyText?: string;
}

export const SITE_CONFIG = {
  /** 用于 TanStack Query 自动拉取 GitHub 公开仓库 Star（留空则不请求） */
  githubUsername: "MoYoez",

  /** 背景插画配置（留空 "" 则只保留纯色 + 星图） */
  background: {
    imageUrl: "/hollow-backdrop.jpg",
  },

  /** 活人感细节配置 */
  presence: {
    /** 点一下头像时轮流冒出的小气泡（留空数组 [] 则关闭） */
    avatarPokes: ["qwq", "ʕ ᵔᴥᵔ ʔ", "还在发呆...", "别戳啦"],
  },

  /** 左侧 2 字精简目录与章节标题 */
  sections: {
    about: { nav: "关于" },
    devices: { nav: "设备", heading: "设备" },
    skills: {
      nav: "技能",
      heading: "技能",
      toolsLabel: "工具",
      stackLabel: "技术栈",
    },
    projects: { nav: "作品", heading: "作品" },
    play: {
      nav: "游玩",
      heading: "游玩",
      gamesLabel: "游戏",
      musicLabel: "音乐",
    },
    social: { nav: "联系", heading: "联系" },
  },

  profile: {
    avatarUrl: "https://avatars.githubusercontent.com/u/30306672?v=4",
    name: "MoeMagicMango",
    alias: "",
    command: "seeking stellar & dream",
    tagline: "",
    paragraphs: [
      "过气开发 & 全干工程师，老年吃灰专业户，脑子里没有创意的猪咪，~~但偶尔还是会诈尸写点东西~~。",
      "就职于某家 AI 应用公司。吃饭，睡觉，打豆豆？不知道诶，也许就这样子？",
    ],
    quickFacts: [
      // { label: "坐标", value: "UTC+8" },
    ] as Array<{ label: string; value: string }>,
  },

  /** 设备（填 note 即可在悬停/轻点时浮出吐槽，留空则不显示气泡） */
  devices: {
    intro: "",
    items: [
      { id: "macbook", icon: "mac", group: "日常", name: "MacBook M5 Pro", note: "干活主力，风扇很少转" },
      { id: "ipad", icon: "tablet", group: "日常", name: "iPad Pro M5", note: "买前生产力，买后爱奇艺" },
      { id: "iphone", icon: "phone", group: "日常", name: "iPhone 18 Pro", note: "天蓝色是真的好看（" },
      { id: "fold", icon: "phone", group: "日常", name: "Samsung Fold 8", note: "买前很好看，买后生产 debug 机（" },
      { id: "watch", icon: "watch", group: "随身", name: "Apple Watch S7", note: "也许我真的不喜欢手表/" },
      { id: "airpods", icon: "audio", group: "随身", name: "AirPods Pro 3", note: "它存在的价值只是因为没有别的好用的 tws" },
      { id: "xm5", icon: "audio", group: "随身", name: "Sony XM5", note: "索尼大法好，~~但是有点不好~~" },
      { id: "nikon", icon: "camera", group: "随身", name: "Nikon Z6 III", note: "拍鸟神器，不要拿来拍人，否则会变得非常不幸" },
      { id: "steam-deck", icon: "steam-deck", group: "游玩", name: "Steam Deck", note: "玩终末地玩的（" },
      { id: "switch2", icon: "gamepad", group: "游玩", name: "Switch 2", note: "玩独占游戏玩的" },
      { id: "ps5", icon: "gamepad", group: "游玩", name: "PlayStation 5", note: "玩 GTA6 和 死亡搁浅导致的" },
      { id: "quest3", icon: "vr", group: "游玩", name: "Meta Quest 3", note: "VRC 启动器" },
    ] as DeviceItem[],
  },

  /** 技能（工具 / 技术栈） */
  skills: {
    intro: "",
    tools: [
      { id: "vscode", name: "Visual Studio Code" },
      { id: "codex", name: "Codex" },
      { id: "pi", name: "Pi" },
      { id: "lody", name: "Lody" },
      { id: "git", name: "Git" },
    ] as ToolItem[],
    stack: [
      {
        label: "常用",
        items: ["Golang", "TypeScript", "Rust"],
      },
    ] as StackGroup[],
    stackNote: "~~也许已经进入 Vibe 时代了，技术栈早就不只是个人能力的标签了，创意或许是一切？~~",
  },

  /** 作品 */
  projects: {
    intro: "",
    items: [
      {
        repo: "MoYoez/Paradise-Imagination",
        title: "Paradise-Imagination",
        summary: "莫兰迪自然色系书签个人主页",
        language: "TypeScript",
        url: "https://github.com/MoYoez/Paradise-Imagination",
      },
      {
        repo: "MoYoez/waken-wa",
        title: "waken-wa",
        summary: "轻量在线状态与实时动态卡片",
        language: "TypeScript",
        url: "https://github.com/MoYoez/waken-wa",
      },
      {
        repo: "MoYoez/Decky-LocalSend",
        title: "Decky-LocalSend",
        summary: "Steam Deck 上的 LocalSend 局域网快传插件",
        language: "TypeScript",
        url: "https://github.com/MoYoez/Decky-LocalSend",
      },
    ] as ProjectItem[],
  },

  /** 游玩（复用原项目 Steam 最近游玩接口，支持 PC / Steam Deck 时长气泡） */
  play: {
    intro: "最近以独立游戏为主，玩的还是老几样。",
    steamApiUrl: "/api/steam/recent-games",
    steamCount: 12,
    /** 手动备用列表（Steam 接口未配置或离线时展示，留空则不显示） */
    games: [] as GameItem[],
    music: [] as MusicTrack[],
  },

  /** 联系（照搬原项目 wisteria.tsx） */
  social: {
    intro: "",
    links: [
      {
        id: "github",
        label: "GitHub",
        handle: "MoeMagicMango",
        href: "https://github.com/MoYoez",
      },
      {
        id: "blog",
        label: "Blog",
        handle: "lemonkoi.one",
        href: "https://lemonkoi.one",
      },
      {
        id: "netease",
        label: "Netease",
        handle: "MoeMagicMango",
        href: "https://music.163.com/#/user/home?id=555696683",
      },
      {
        id: "twitter",
        label: "Twitter",
        handle: "@Akirasweetz",
        href: "https://twitter.com/akirasweetz",
      },
      {
        id: "discord",
        label: "Discord",
        handle: "MoeMagicMango",
        href: "https://discord.com/users/529604493642301449",
      },
    ] as SocialLink[],
    closing: "",
  },
} as const;
