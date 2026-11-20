import { NextRequest, NextResponse } from "next/server"
import { ValidatedWeatherData } from "@/lib/domain/types"
import { generateAiOutfitRecommendation } from "@/lib/ai/gemini-recommender"

export async function POST(request: NextRequest) {
  const startTime = performance.now()

  try {
    const body = await request.json()
    const weather = body.weather as ValidatedWeatherData | undefined
    const situation = body.situation as string | undefined

    if (!weather || typeof weather.temperature !== "number") {
      return NextResponse.json(
        { error: "기상청 날씨 데이터가 필요합니다." },
        { status: 400 },
      )
    }

    if (!situation || situation.trim() === "") {
      return NextResponse.json(
        { error: "상황 입력이 필요합니다." },
        { status: 400 },
      )
    }

    // 제미나이 AI 맞춤 옷차림 생성
    const recommendation = await generateAiOutfitRecommendation(weather, situation.trim())
    const geminiElapsedMs = Math.round(performance.now() - startTime)

    if (!recommendation) {
      return NextResponse.json(
        {
          error: "AI 맞춤 옷차림을 생성하지 못했습니다. 기본 규칙 추천을 사용해 주세요.",
          timing: { geminiElapsedMs },
        },
        { status: 502 },
      )
    }

    return NextResponse.json({
      recommendation,
      timing: {
        geminiElapsedMs,
        totalElapsedMs: geminiElapsedMs,
      },
    })
  } catch (err: any) {
    const geminiElapsedMs = Math.round(performance.now() - startTime)
    return NextResponse.json(
      {
        error: "AI 옷차림 추천 중 오류가 발생했습니다: " + (err.message || "Unknown"),
        timing: { geminiElapsedMs },
      },
      { status: 500 },
    )
  }
}
