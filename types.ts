export interface StickerIdea {
  id: string;
  name: string;          // 題材名稱 (組合欄位: 角色 + 情緒 + 台詞)
  role: string;          // 角色 (e.g., 社畜貓)
  scenario: string;      // 情境 (e.g., 週一開會)
  emotion: string;       // 情緒 (e.g., 崩潰)
  catchphrase: string;   // 建議台詞 (e.g., 我想回家)
  cultureTag: string;    // 台灣文化標籤 (e.g., 諧音梗, 珍奶)
  targetAudience: string;// 目標客群
  status: 'new' | 'drafting' | 'completed';
  isFavorite: boolean;
  createdAt: number;
}

export interface GenerationParams {
  targetAudience: string;
  roleType: string;
  theme: string;
  style: string;
  count: number;
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