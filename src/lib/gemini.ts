import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface AIEnrichmentOutput {
  budget_estimate: {
    min: number;
    max: number;
    currency: string;
    notes: string;
  };
  time_required: {
    value: number;
    unit: "weeks" | "months";
    breakdown: string;
  };
  opportunities: string[];
  drawbacks: string[];
  pain_points: string[];
  why_good_for_you: string;
  how_it_works: string;
  scores: {
    feasibility: number;
    marketPotential: number;
    innovation: number;
    effort: number;
  };
}

export async function enrichIdea(ideaData: { name: string; description: string; category: string; location?: string; targetMarket?: string }) {
  const model = "gemini-3-flash-preview";
  
  const systemPrompt = `You are a world-class business analyst and product strategy expert.
Evaluate the provided business idea and return a detailed, structured business analysis in JSON format.
Focus on realism, market data points, and actionable insights.
Scores must be between 1 and 10.`;

  const userPrompt = `
Idea Name: ${ideaData.name}
Description: ${ideaData.description}
Category: ${ideaData.category}
Location Context: ${ideaData.location || "Global"}
Target Market: ${ideaData.targetMarket || "General Consumer"}
`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          budget_estimate: {
            type: Type.OBJECT,
            properties: {
              min: { type: Type.NUMBER },
              max: { type: Type.NUMBER },
              currency: { type: Type.STRING },
              notes: { type: Type.STRING }
            },
            required: ["min", "max", "currency", "notes"]
          },
          time_required: {
            type: Type.OBJECT,
            properties: {
              value: { type: Type.NUMBER },
              unit: { type: Type.STRING, enum: ["weeks", "months"] },
              breakdown: { type: Type.STRING }
            },
            required: ["value", "unit", "breakdown"]
          },
          opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
          drawbacks: { type: Type.ARRAY, items: { type: Type.STRING } },
          pain_points: { type: Type.ARRAY, items: { type: Type.STRING } },
          why_good_for_you: { type: Type.STRING },
          how_it_works: { type: Type.STRING },
          scores: {
            type: Type.OBJECT,
            properties: {
              feasibility: { type: Type.NUMBER, description: "1-10" },
              marketPotential: { type: Type.NUMBER, description: "1-10" },
              innovation: { type: Type.NUMBER, description: "1-10" },
              effort: { type: Type.NUMBER, description: "1-10" }
            },
            required: ["feasibility", "marketPotential", "innovation", "effort"]
          }
        },
        required: [
          "budget_estimate", "time_required", "opportunities", "drawbacks", 
          "pain_points", "why_good_for_you", "how_it_works", "scores"
        ]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI failed to generate response");
  
  return JSON.parse(text) as AIEnrichmentOutput;
}
