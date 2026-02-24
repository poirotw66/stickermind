/**
 * Backend proxy for Gemini API. Keeps GEMINI_API_KEY on server only.
 * Run: GEMINI_API_KEY=xxx node server/index.js
 * Default port: 3001 (use PORT env to override).
 */
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const PORT = Number(process.env.PORT) || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Plain JSON Schema (responseJsonSchema); Node build does not export Type/Schema.
const STICKER_JSON_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      role: { type: 'string', description: 'The character role.' },
      scenario: { type: 'string', description: "Detailed visual description of the character's ACTION or POSE." },
      emotion: { type: 'string', description: 'The primary emotion.' },
      catchphrase: { type: 'string', description: 'Short, punchy phrase (2-6 chars).' },
      cultureTag: { type: 'string', description: 'Category tag.' },
    },
    required: ['role', 'scenario', 'emotion', 'catchphrase', 'cultureTag'],
  },
};

const THEME_JSON_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Creative Title for the Sticker Pack.' },
      description: { type: 'string', description: 'Concept description.' },
      sellingPoint: { type: 'string', description: 'Why this target audience would buy it.' },
      examplePhrases: {
        type: 'array',
        items: { type: 'string' },
        description: '3 example catchphrases.',
      },
    },
    required: ['title', 'description', 'sellingPoint', 'examplePhrases'],
  },
};

const generateId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 9) + Date.now().toString(36));

function getAIClient() {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set. Set it in the environment when starting the server.');
  }
  return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());

app.post('/api/generate-stickers', async (req, res) => {
  try {
    const params = req.body;
    if (!params || !params.roleType) {
      return res.status(400).json({ error: 'Missing or invalid body; roleType is required.' });
    }
    const ai = getAIClient();
    const prompt = `
    你是一位資深的 LINE 貼圖企劃師。
    使用者的需求是：**規劃一套完整的 LINE 貼圖 (共 ${params.count} 張)**。
    
    請針對以下設定，設計出一份**連貫、實用且具有角色特色**的貼圖列表。

    **企劃設定：**
    - 角色設定: ${params.roleType}
    - 貼圖風格: ${params.style}
    - 特定主題: ${params.theme || '無特定主題 (請以該角色的日常生活為主)'}
    - 目標客群: ${params.targetAudience}

    **規劃原則 (Sticker Pack Logic)：**
    請將 ${params.count} 張貼圖分配為以下類別，確保使用者購買後能應付各種聊天情境：
    1. **基本問候 (約 10%)**：早安、晚安、Hi、Bye。
    2. **對話回應 (約 20%)**：OK、好的、收到、謝謝、對不起、沒問題、+1。
    3. **情緒表達 (約 30%)**：開心、大笑、生氣、崩潰、哭泣、驚訝、無言(點點點)。
    4. **工作/生活實用 (約 20%)**：在忙、加班中、吃飯了嗎、要遲到了、累。
    5. **角色特色/時事梗 (約 20%)**：符合 "${params.roleType}" 個性的專屬動作或台灣流行語。

    **欄位要求 (Output Requirements)：**
    1. **catchphrase (台詞)**：
       - **極短**：2~6 字為佳。
       - **口語化**：台灣人日常用語。
    
    2. **scenario (畫面動作)**：
       - 請描述**具體的視覺畫面**或**角色動作**，讓畫師可以直接看文字畫圖。
       - ✅ 正確範例：「趴在地上流淚」、「雙手比讚」、「眼神死盯著電腦螢幕」、「拿著珍珠奶茶吸一口」。
       - ❌ 錯誤範例：「悲傷的感覺」、「工作的樣子」(太抽象)。

    **Output Language**: 繁體中文 (Traditional Chinese, Taiwan).

    請回傳一個包含 ${params.count} 個物件的 JSON Array。
  `;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: STICKER_JSON_SCHEMA,
        maxOutputTokens: 8192,
        temperature: 2,
        systemInstruction: 'You are a professional LINE Sticker Planner.',
      },
    });
    const rawData = JSON.parse(response.text || '[]');
    const ideas = rawData.map((item) => ({
      id: generateId(),
      name: `${item.role} ${item.emotion} - ${item.catchphrase}`,
      role: item.role,
      scenario: item.scenario,
      emotion: item.emotion,
      catchphrase: item.catchphrase,
      cultureTag: item.cultureTag,
      targetAudience: params.targetAudience,
      status: 'new',
      isFavorite: false,
      createdAt: Date.now(),
    }));
    return res.json(ideas);
  } catch (err) {
    console.error('Gemini sticker generation error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate sticker ideas. Please try again.',
    });
  }
});

app.post('/api/generate-themes', async (req, res) => {
  try {
    const params = req.body;
    if (!params || !params.roleType) {
      return res.status(400).json({ error: 'Missing or invalid body; roleType is required.' });
    }
    const count = params.themeCount || 4;
    const ai = getAIClient();
    const prompt = `
    你是一位暢銷 LINE 貼圖的創意總監。
    使用者還沒有具體的貼圖內容想法，請根據他的「角色」與「目標客群」，
    **發想 ${count} 個不同切入點的「貼圖包主題 (Theme Concept)」**。

    **輸入條件：**
    - 角色設定: ${params.roleType}
    - 目標客群: ${params.targetAudience}
    - 繪畫風格: ${params.style}

    **思考方向 (Brainstorming Angles)：**
    請提供 ${count} 個截然不同的主題方向，例如：
    1. **極度實用型** (針對該客群最常用的情境)
    2. **反差萌/性格型** (突出角色的特殊個性)
    3. **特殊情境型** (例如：職場生存、戀愛攻防、節日限定)
    4. **流行梗/迷因型** (結合台灣最新網路用語)
    5. 如果需要更多，請混合以上風格或發想全新的創意情境（如穿越劇、古裝風、科幻風）。

    **Output Requirements:**
    - Title: 吸引人的貼圖標題 (e.g., "社畜貓的崩潰週一")
    - Description: 簡單說明這個主題的內容與風格。
    - SellingPoint: 為什麼這個主題會賣？(Target Audience Insight)
    - ExamplePhrases: 3 句這個主題會出現的代表性台詞。

    **Output Language**: 繁體中文 (Traditional Chinese, Taiwan).
  `;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: THEME_JSON_SCHEMA,
        temperature: 2,
        systemInstruction: 'You are a creative director for LINE Creators Market Taiwan.',
      },
    });
    const rawData = JSON.parse(response.text || '[]');
    const themes = rawData.map((item) => ({
      id: generateId(),
      title: item.title,
      description: item.description,
      sellingPoint: item.sellingPoint,
      examplePhrases: item.examplePhrases,
      createdAt: Date.now(),
    }));
    return res.json(themes);
  } catch (err) {
    console.error('Gemini theme generation error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to brainstorm themes. Please try again.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`StickerMind API server running at http://localhost:${PORT}`);
  if (!GEMINI_API_KEY) {
    console.warn('Warning: GEMINI_API_KEY is not set. /api/generate-* will return 500.');
  }
});
