import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { anthropic, GAUGE_ANALYSIS_PROMPT } from "@/lib/claude"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("image") as File | null

    if (!file) {
      return NextResponse.json({ error: "Resim dosyası gerekli." }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Dosya boyutu 10MB'dan büyük olamaz." }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")
    const mimeType = file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif"

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType || "image/jpeg",
                data: base64,
              },
            },
            {
              type: "text",
              text: GAUGE_ANALYSIS_PROMPT,
            },
          ],
        },
      ],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""

    // JSON parse et
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AI yanıtı işlenemedi.", rawText: text },
        { status: 422 }
      )
    }

    const parsed = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      percentFull: parsed.percentFull ?? -1,
      confidence: parsed.confidence ?? "low",
      gaugeType: parsed.gaugeType ?? "unknown",
      description: parsed.description ?? "",
    })
  } catch (error) {
    console.error("Gauge analysis error:", error)
    return NextResponse.json({ error: "Analiz sırasında hata oluştu." }, { status: 500 })
  }
}
