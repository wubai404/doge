import { GoogleGenAI, Type } from "@google/genai";
import { DogePriceData, ChartPoint, MarketAnalysis } from "../types";

const apiKey = process.env.API_KEY; // Assumed to be available
const ai = new GoogleGenAI({ apiKey });

export const analyzeMarket = async (
  currentData: DogePriceData,
  chartHistory: ChartPoint[]
): Promise<MarketAnalysis> => {
  
  if (!chartHistory || chartHistory.length === 0) {
    throw new Error("Insufficient data for analysis");
  }

  // Calculate simple local stats to help the AI
  const prices = chartHistory.map(p => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const startPrice = prices[0];
  const endPrice = prices[prices.length - 1];
  const volatility = ((max - min) / min) * 100;

  const prompt = `
    Analyze the current Dogecoin (DOGE) market data provided below.
    
    Current Price: $${currentData.usd}
    24h Change: ${currentData.usd_24h_change.toFixed(2)}%
    24h Volume: $${currentData.usd_24h_vol.toLocaleString()}
    
    Last 24h Trend:
    - Start: $${startPrice.toFixed(4)}
    - End: $${endPrice.toFixed(4)}
    - High: $${max.toFixed(4)}
    - Low: $${min.toFixed(4)}
    - Volatility Range: ${volatility.toFixed(2)}%

    Provide a structured analysis including sentiment, a concise summary of the volatility, and potential support/resistance levels.
    
    IMPORTANT: Write the 'summary', 'supportLevel', and 'resistanceLevel' in Simplified Chinese (简体中文).
    Keep the tone professional but slightly aware of Dogecoin's meme culture (fun but insightful).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: {
              type: Type.STRING,
              enum: ["Bullish", "Bearish", "Neutral", "Volatile"],
              description: "The overall market sentiment."
            },
            summary: {
              type: Type.STRING,
              description: "A short paragraph explaining the volatility and trend in Chinese."
            },
            supportLevel: {
              type: Type.STRING,
              description: "Estimated support price level in Chinese."
            },
            resistanceLevel: {
              type: Type.STRING,
              description: "Estimated resistance price level in Chinese."
            }
          },
          required: ["sentiment", "summary"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as MarketAnalysis;
    }
    
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
        sentiment: "Neutral",
        summary: "由于连接问题，暂时无法生成 AI 分析。",
        supportLevel: "N/A",
        resistanceLevel: "N/A"
    };
  }
};