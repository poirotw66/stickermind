import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GenerationParams, StickerIdea } from "../types";

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

const RESPONSE_SCHEMA: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      role: { type: Type.STRING, description: "The character role, e.g., 'Lazy Cat', 'Boss'." },
      scenario: { type: Type.STRING, description: "Concise visual description of the action." },
      emotion: { type: Type.STRING, description: "The primary emotion displayed." },
      catchphrase: { type: Type.STRING, description: "Short, punchy phrase (2-6 chars) in Traditional Chinese (Taiwan usage)." },
      cultureTag: { type: Type.STRING, description: "A tag related to Taiwan culture, slang, or trend." },
    },
    required: ["role", "scenario", "emotion", "catchphrase", "cultureTag"],
  },
};

export const generateStickerIdeas = async (params: GenerationParams): Promise<StickerIdea[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    你是一位台灣 LINE 貼圖的創意總監與行銷專家。請根據以下條件生成 ${params.count} 個貼圖題材靈感。
    
    條件設定：
    - 目標客群: ${params.targetAudience}
    - 角色類型: ${params.roleType}
    - 主題/情境: ${params.theme || "日常實用"}
    - 風格: ${params.style}

    **關鍵要求 (Critical Requirements)**：
    1. **台詞 (catchphrase) 必須極度簡短有力**：
       - **嚴格限制在 2~6 個字以內**，最多不超過 8 個字。
       - 必須是台灣人秒懂的口語、流行語、諧音梗、注音文。
       - ❌ 絕對避免書面語、說教或長句子。
       - ✅ 範例：「笑死」、「歸剛欸」、「+1」、「我就爛」、「輸贏？」、「是在哈囉」、「好的」。

    2. **情境 (scenario) 具體且直觀**：
       - 描述一個明確的動作或畫面，讓畫師能直接構圖。
       - ✅ 範例：「躺在沙發上滑手機」、「眼神死翻白眼」、「跪在地上哭」、「拿著珍奶吸一口」。

    3. **高度在地化**：符合台灣職場/生活文化（如：訂飲料、加班、捷運、夜市、颱風假）。
    4. **實用性**：確保是用戶在 LINE 聊天室高頻率使用的內容（敷衍、道謝、嗆聲、裝可愛）。
    5. **多樣性**：平均分配不同情緒。

    **Output Language**: 繁體中文 (Traditional Chinese, Taiwan).

    請回傳一個 JSON Array，符合定義的 Schema。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        systemInstruction: "You are an expert AI assistant for creating LINE Sticker ideas for the Taiwan market. You prioritize short, punchy slang and clear visual descriptions.",
      },
    });

    const rawData = JSON.parse(response.text || "[]");

    // Map the raw API response to our app's StickerIdea format
    return rawData.map((item: any) => ({
      id: generateId(),
      name: `${item.role} ${item.emotion} - ${item.catchphrase}`, // Automatically construct name
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