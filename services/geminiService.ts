
import { GoogleGenAI } from "@google/genai";

/**
 * Generates a fun hype message for the lucky winner.
 * Uses the stable 'gemini-flash-latest' alias to improve compatibility with proxy environments.
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
    
    // Using a simplified request to minimize potential proxy/XHR failures.
    // We use the 'gemini-flash-latest' alias which is highly reliable for simple text tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: `Winner: ${name}. Write one super energetic, lucky sentence (max 10 words) to celebrate their win.`,
    });

    // Access the .text property directly as per the latest @google/genai guidelines
    const resultText = response.text;
    
    return resultText?.trim() || `The spotlight is on you, ${name}!`;
  } catch (error) {
    // Gracefully handle the XHR/Proxy error by returning a friendly local fallback.
    // This prevents the "Rpc failed" error from breaking the application state.
    console.warn("Gemini hype generator encountered a transient error, using local fallback.", error);
    return `Fortune favors the bold! Congratulations, ${name}!`;
  }
};
