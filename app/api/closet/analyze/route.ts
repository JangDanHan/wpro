import { NextRequest, NextResponse } from "next/server"
import { analyzeClothingImage, generateFallbackAnalysis } from "@/lib/ai/gemini-closet-analyzer"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { imageBase64, mimeType } = body

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { error: "이미지 데이터(imageBase64)가 필요합니다." },
        { status: 400 },
      )
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 7000)

    try {
      const result = await analyzeClothingImage(
        imageBase64,
        mimeType || "image/jpeg",
        controller.signal,
      )
      clearTimeout(timeoutId)
      return NextResponse.json({ success: true, analysis: result })
    } catch {
      clearTimeout(timeoutId)
      const fallback = generateFallbackAnalysis()
      return NextResponse.json({
        success: true,
        analysis: fallback,
        fallback: true,
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "이미지 분석 중 오류가 발생했습니다.",
        analysis: generateFallbackAnalysis(),
      },
      { status: 500 },
    )
  }
}
