import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { POST } from "@/app/api/recommendation/music/route"
import { NextRequest } from "next/server"
import { ValidatedWeatherData } from "@/lib/domain/types"

describe("Music Recommendation Route Handler", () => {
  const mockWeather: ValidatedWeatherData = {
    cityId: "1168064000",
    cityName: "서울특별시 강남구 역삼1동",
    temperature: 12.0,
    weatherDescription: "맑음",
    precipitationType: "none",
    rainfallAmount: 0,
    referenceAt: Date.now(),
    referenceAtFormatted: "19:00 발표",
    provider: "기상청",
    providerUrl: "https://www.weather.go.kr",
    infoType: "관측 정보",
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.GEMINI_API_KEY = "test-api-key"
    process.env.YOUTUBE_API_KEY = "test-youtube-key"
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("날씨 데이터가 누락되면 400 에러를 반환한다", async () => {
    const req = new NextRequest("http://localhost:3000/api/recommendation/music", {
      method: "POST",
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it("성공 시 music 객체와 단계별 소요 시간(gemini, youtube, total)을 반환한다", async () => {
    const mockAiResponse = {
      searchQuery: "차분하고 따뜻한 재즈 플레이리스트",
      reason: "쌀쌀한 12도 날씨에 긴장을 풀어줄 수 있는 편안한 재즈를 추천합니다.",
    }

    const mockYouTubeResponse = {
      items: [
        {
          id: { videoId: "video123" },
          snippet: {
            title: "따뜻한 재즈 피아노",
            channelTitle: "Jazz Cafe",
            thumbnails: { medium: { url: "https://i.ytimg.com/vi/video123/mqdefault.jpg" } },
          },
        },
      ],
    }

    // 1. Gemini AI fetch mock
    // 2. YouTube API fetch mock
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: JSON.stringify(mockAiResponse) }] } }],
        }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockYouTubeResponse,
      } as any)

    const req = new NextRequest("http://localhost:3000/api/recommendation/music", {
      method: "POST",
      body: JSON.stringify({
        weather: mockWeather,
        situation: "오늘 면접이 있어",
      }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.music).toBeDefined()
    expect(data.music.videoId).toBe("video123")
    expect(data.music.title).toBe("따뜻한 재즈 피아노")
    expect(data.timing).toBeDefined()
    expect(data.timing.geminiElapsedMs).toBeGreaterThanOrEqual(0)
    expect(data.timing.youtubeElapsedMs).toBeGreaterThanOrEqual(0)
    expect(data.timing.totalElapsedMs).toBeGreaterThanOrEqual(0)
  })
})
