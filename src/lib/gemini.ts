import { GoogleGenerativeAI } from "@google/generative-ai"

const globalForGemini = globalThis as unknown as {
  gemini: GoogleGenerativeAI | undefined
}

export const gemini =
  globalForGemini.gemini ??
  new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "")

if (process.env.NODE_ENV !== "production") globalForGemini.gemini = gemini

export const MODEL = "gemini-1.5-flash"

export const GAUGE_ANALYSIS_PROMPT = `Araç gösterge panelindeki yakıt göstergesi fotoğrafını analiz et.

Gösterge iğnesinin/göstergenin konumunu değerlendirerek yakıt seviyesini belirle.

SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:
{
  "percentFull": <0-100 tam sayı>,
  "confidence": "<high|medium|low>",
  "gaugeType": "<analog|digital|unknown>",
  "description": "<Türkçe kısa açıklama>"
}

Kurallar:
- percentFull: 0 (boş) ile 100 (dolu) arasında tam sayı
- E (empty) veya uyarı ışığı varsa 5 veya daha az yaz
- F (full) görünüyorsa 100 yaz
- confidence: gösterge net görünüyorsa "high", kısmen kapalıysa "medium", belirsizse "low"
- Belirleyemiyorsan percentFull: -1 ve confidence: "low" döndür
- JSON dışında hiçbir metin, markdown veya kod bloğu ekleme`
