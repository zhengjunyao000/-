
import { GoogleGenAI } from "@google/genai";
import { DrinkRecord } from "../types";

export const getAIInsights = async (records: DrinkRecord[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const simplifiedRecords = records.slice(0, 20).map(r => ({
    name: r.name,
    brand: r.brand,
    sugar: r.sugarLevel,
    date: r.date,
    price: r.price
  }));

  const prompt = `
    我是一名奶茶爱好者，以下是我最近的奶茶消费记录：
    ${JSON.stringify(simplifiedRecords)}
    
    请根据这些数据给我一些有趣的洞察和健康建议：
    1. 我的饮用频率是否过高？
    2. 糖分摄入建议。
    3. 消费习惯分析。
    4. 推荐一种可能适合我口味的新品（基于我的历史喜好）。
    
    请使用亲切、幽默的语气，并以 Markdown 格式返回。如果记录很少，请鼓励我开始记录。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.8,
      }
    });
    return response.text || "暂时无法生成 AI 洞察，请稍后再试。";
  } catch (error) {
    console.error("AI Insights Error:", error);
    return "AI 思考出了一些小状况，请检查您的网络。";
  }
};

export const getDrinkQuickComment = async (record: DrinkRecord): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    请为这杯奶茶写一句非常简短、有趣、有个性的评价（20字以内），用于社交媒体分享：
    名称：${record.name}
    品牌：${record.brand}
    甜度：${record.sugarLevel}
    冰量：${record.iceLevel}
    热量：${record.calories}kcal
    
    语气要像个奶茶达人，可以带点幽默感或凡尔赛。只返回评价文本本身。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 0.9,
      }
    });
    return response.text?.trim() || "每一口都是稳稳的幸福！";
  } catch (error) {
    console.error("Quick Comment Error:", error);
    return "生活苦短，奶茶加满！🥤";
  }
};
