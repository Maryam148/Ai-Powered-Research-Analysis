import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: 'hello',
  });
  console.log("TEXT IS:", response.text);
}
run();
