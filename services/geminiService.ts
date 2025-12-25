
import { GoogleGenAI } from "@google/genai";

/**
 * Generates a fun hype message for the lucky winner.
 * Uses the latest 'gemini-3-flash-preview' model for efficient and high-quality text generation.
 * Returns a fallback message if the API call fails to ensure the game flow isn't interrupted.
 */
export const getWinnerHype = async (name: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return `Hooray for ${name}! Enjoy your win!`;
    }

    // Create a new instance right before the call to ensure the latest API key is used
    const ai = new GoogleGenAI({ apiKey });
    
    // Using gemini-3-flash-preview for the task as per latest guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Winner: ${name}. Write one super energetic, lucky sentence (max 10 words) to celebrate their win.`,
    });

    // Access the .text property directly as per the latest @google/genai guidelines
    const resultText = response.text;
    
    return resultText?.trim() || `The spotlight is on you, ${name}!`;
  } catch (error) {
    // Gracefully handle any API or proxy errors by returning a friendly local fallback.
    console.warn("Gemini hype generator encountered an error, using local fallback.", error);
    return `Fortune favors the bold! Congratulations, ${name}!`;
  }
};
