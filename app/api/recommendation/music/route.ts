import { NextRequest, NextResponse } from "next/server"
import { ValidatedWeatherData } from "@/lib/domain/types"
import { getRecommendedMusicWithTiming } from "@/lib/youtube/youtube-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const weather = body.weather as ValidatedWeatherData | undefined
    const situation = body.situation as string | undefined
    const excludedSongIds = (body.excludedSongIds || body.excludedTrackIds || []) as string[]

    if (!weather || typeof weather.temperature !== "number") {
      return NextResponse.json(
        { error: "기상청 날씨 데이터가 필요합니다." },
        { status: 400 },
      )
    }

    // 제미나이 음악 검색어 생성 및 YouTube Data API 검색 (단계별 시간 배분 및 클라이언트 요청 취소 전파)
    const result = await getRecommendedMusicWithTiming(
      weather,
      situation || null,
      request.signal,
      excludedSongIds,
    )

    if (!result.music) {
      return NextResponse.json(
        {
          error: "음악 추천 결과를 찾을 수 없습니다.",
          music: null,
          timing: result.timing,
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      music: result.music,
      timing: result.timing,
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "음악 추천 처리 중 오류가 발생했습니다: " + (err.message || "Unknown"),
        music: null,
      },
      { status: 500 },
    )
  }
}
