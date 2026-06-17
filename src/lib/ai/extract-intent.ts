import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

function getAi() {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. AI functions will fallback.");
      return null;
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

const SYSTEM_PROMPT_INTENT = `Eres un extractor de intenciones para una plataforma nicaragüense.
Recibes una consulta en español y devuelves SOLO JSON válido con este esquema:
{
  "category": string | null,         // ej: "Diseño Gráfico", "Plomería", "Carpintería"
  "city": string | null,             // una de: Managua, León, Granada, Masaya, Estelí, Matagalpa, Bluefields, Juigalpa, Nagarote, San Juan de Oriente
  "maxPriceNIO": number | null,
  "urgency": "alta" | "media" | "baja" | null,
  "keywords": string[]
}
No incluyas texto fuera del JSON. Devuelve formato JSON limpio sin bloques de código.`;

export async function extractIntent(query: string) {
  try {
    const aiInstance = getAi();
    if (!aiInstance) throw new Error("AI client not initialized");

    const response = await aiInstance.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: "Query: " + query }] }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT_INTENT,
        temperature: 0.1,
      }
    });

    const text = response.text;
    // Strip markdown JSON wrapping if present
    const cleanJson = text?.replace(/```json/g, '').replace(/```/g, '').trim() || "{}";
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Failed to extract intent with Gemini, falling back to basic extraction", error);
    // Basic fallback parsing
    return {
      category: null,
      city: null,
      keywords: query.split(" ")
    };
  }
}
