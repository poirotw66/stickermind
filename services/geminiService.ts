import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GenerationParams, StickerIdea, ThemeIdea } from "../types";

// Prefer crypto.randomUUID when available (browser/Node), fallback for older envs
const generateId = (): string =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

// Schema for Sticker Content (The 40 stickers)
const STICKER_SCHEMA: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      role: { type: Type.STRING, description: "The character role." },
      scenario: { type: Type.STRING, description: "Detailed visual description of the character's ACTION or POSE." },
      emotion: { type: Type.STRING, description: "The primary emotion." },
      catchphrase: { type: Type.STRING, description: "Short, punchy phrase (2-6 chars)." },
      cultureTag: { type: Type.STRING, description: "Category tag." },
    },
    required: ["role", "scenario", "emotion", "catchphrase", "cultureTag"],
  },
};

// Schema for Theme Brainstorming
const THEME_SCHEMA: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Creative Title for the Sticker Pack." },
      description: { type: Type.STRING, description: "Concept description." },
      sellingPoint: { type: Type.STRING, description: "Why this target audience would buy it." },
      examplePhrases: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "3 example catchphrases." 
      }
    },
    required: ["title", "description", "sellingPoint", "examplePhrases"],
  },
};

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Generate specific sticker list (Actions/Text)
 */
export const generateStickerIdeas = async (params: GenerationParams): Promise<StickerIdea[]> => {
  const ai = getAIClient();

  const prompt = `
    你是一位資深的 LINE 貼圖企劃師。
    使用者的需求是：**規劃一套完整的 LINE 貼圖 (共 ${params.count} 張)**。
    
    請針對以下設定，設計出一份**連貫、實用且具有角色特色**的貼圖列表。

    **企劃設定：**
    - 角色設定: ${params.roleType}
    - 貼圖風格: ${params.style}
    - 特定主題: ${params.theme || "無特定主題 (請以該角色的日常生活為主)"}
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

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: STICKER_SCHEMA,
        maxOutputTokens: 8192, 
        systemInstruction: "You are a professional LINE Sticker Planner.",
      },
    });

    const rawData = JSON.parse(response.text || "[]");

    return rawData.map((item: any) => ({
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

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate sticker ideas. Please try again.");
  }
};

/**
 * Generate Sticker Pack Themes (Brainstorming)
 */
export const generateStickerThemes = async (params: GenerationParams): Promise<ThemeIdea[]> => {
  const ai = getAIClient();
  
  // Default to 4 if not specified (though UI should handle it)
  const count = params.themeCount || 4;

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

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: THEME_SCHEMA,
        systemInstruction: "You are a creative director for LINE Creators Market Taiwan.",
      },
    });

    const rawData = JSON.parse(response.text || "[]");
    
    // Add IDs and Timestamps
    return rawData.map((item: any) => ({
      id: generateId(),
      title: item.title,
      description: item.description,
      sellingPoint: item.sellingPoint,
      examplePhrases: item.examplePhrases,
      createdAt: Date.now()
    }));

  } catch (error) {
    console.error("Gemini Theme Generation Error:", error);
    throw new Error("Failed to brainstorm themes. Please try again.");
  }
};