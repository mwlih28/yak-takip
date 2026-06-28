import { NextResponse } from "next/server"
import { getUser } from "@/lib/mobile-auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

export async function POST(req: Request) {
  const user = await getUser(req)
  if (!user?.id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 })
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"
    const filename = `${randomUUID()}.${ext}`
    const dir = join(process.cwd(), "public", "uploads", user.id)

    await mkdir(dir, { recursive: true })

    const bytes = await file.arrayBuffer()
    await writeFile(join(dir, filename), Buffer.from(bytes))

    const url = `/uploads/${user.id}/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Yükleme başarısız." }, { status: 500 })
  }
}
