import Anthropic from "@anthropic-ai/sdk"

const globalForAnthropic = globalThis as unknown as {
  anthropic: Anthropic | undefined
}

export const anthropic =
  globalForAnthropic.anthropic ??
  new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

if (process.env.NODE_ENV !== "production") globalForAnthropic.anthropic = anthropic

export const GAUGE_ANALYSIS_PROMPT = `You are analyzing a fuel gauge image from a vehicle dashboard.

Your task: Determine the current fuel level shown on the gauge.

Analyze the image and respond with ONLY valid JSON in this exact format:
{
  "percentFull": <number 0-100>,
  "confidence": "<high|medium|low>",
  "gaugeType": "<analog|digital|unknown>",
  "description": "<one sentence describing what you see in Turkish>"
}

Rules:
- percentFull: integer from 0 to 100. Full tank = 100, empty = 0, half = 50
- If the gauge shows E (empty) markers or warning light, set percentFull to 5 or less
- If gauge shows F (full), set percentFull to 100
- confidence: "high" if gauge clearly visible, "medium" if partially obscured, "low" if unclear
- If you cannot determine fuel level, return percentFull: -1 with confidence: "low"
- description: describe in Turkish what you see
- Do NOT include markdown, code blocks, or any text outside the JSON object`
