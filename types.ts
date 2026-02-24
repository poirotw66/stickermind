
export interface StickerIdea {
  id: string;
  name: string;          // Display name (role + emotion + catchphrase)
  role: string;          // Character role (e.g. office cat)
  scenario: string;      // Visual/situation (e.g. Monday meeting)
  emotion: string;       // Emotion (e.g. exhausted)
  catchphrase: string;   // Short phrase (e.g. I want to go home)
  cultureTag: string;    // Culture tag (e.g. pun, bubble tea)
  targetAudience: string;// Target audience
  status: 'new' | 'drafting' | 'completed';
  isFavorite: boolean;
  createdAt: number;
}

export interface ThemeIdea {
  id: string;           // Unique ID for saving
  title: string;        // Theme title (e.g. Office cat's exhausting daily)
  description: string;  // What this theme is about
  sellingPoint: string; // Why this audience would buy
  examplePhrases: string[]; // Example phrases (3 items)
  createdAt: number;
}

export interface GenerationParams {
  targetAudience: string;
  roleType: string;
  theme: string;
  style: string;
  count: number;      // Number of stickers to generate
  themeCount: number; // Number of themes to brainstorm
}

/** LINE sticker phrase set JSON: single = 4×4 grid (≤16), set = no grid (>16). */
export type LineStickerPhraseSetJson =
  | {
      format: 'line-sticker-phrase-set';
      version: number;
      mode: 'single';
      gridCols: 4;
      gridRows: 4;
      phrases: string[];
      actionDescs: string[];
    }
  | {
      format: 'line-sticker-phrase-set';
      version: number;
      mode: 'set';
      phrases: string[];
      actionDescs: string[];
    };

export function toLineStickerPhraseSetJson(ideas: StickerIdea[]): LineStickerPhraseSetJson {
  const phrases = ideas.map((i) => i.catchphrase);
  const actionDescs = ideas.map((i) => i.scenario);
  if (ideas.length <= 16) {
    return {
      format: 'line-sticker-phrase-set',
      version: 1,
      mode: 'single',
      gridCols: 4,
      gridRows: 4,
      phrases,
      actionDescs,
    };
  }
  return {
    format: 'line-sticker-phrase-set',
    version: 1,
    mode: 'set',
    phrases,
    actionDescs,
  };
}

export enum EmotionType {
  HAPPY = '開心/慶祝',
  SAD = '難過/討拍',
  ANGRY = '生氣/翻桌',
  TIRED = '累/崩潰',
  WORK = '職場/敷衍',
  LOVE = '愛/撒嬌',
  GREETING = '問候/早晚安',
  FUNNY = '搞笑/白爛'
}

export const TARGET_AUDIENCES = [
  "上班族 (社畜)",
  "情侶 (放閃/吵架)",
  "學生 (校園生活)",
  "長輩 (早安圖風格)",
  "貓奴/狗奴",
  "通用大眾"
];

export const ROLE_TYPES = [
  "可愛動物 (貓/狗/兔)",
  "搞怪生物 (不明物體)",
  "職場人物 (老闆/同事)",
  "純文字 (大字報)",
  "女性角色 (可愛/氣質)",
  "男性角色 (帥氣/醜怪)"
];

export const STYLES = [
  "可愛療癒風",
  "醜怪白爛風",
  "手繪隨意風",
  "精緻插畫風",
  "像素風格",
  "迷因梗圖風"
];
