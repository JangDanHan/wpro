import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { POST } from "@/app/api/recommendation/ai-outfit/route"
import { NextRequest } from "next/server"
import { ValidatedWeatherData } from "@/lib/domain/types"

describe("AI Outfit Recommendation Route Handler", () => {
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
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("날씨 데이터가 누락되면 400 에러를 반환한다", async () => {
    const req = new NextRequest("http://localhost:3000/api/recommendation/ai-outfit", {
      method: "POST",
      body: JSON.stringify({ situation: "면접이 있어" }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it("상황 입력이 누락되면 400 에러를 반환한다", async () => {
    const req = new NextRequest("http://localhost:3000/api/recommendation/ai-outfit", {
      method: "POST",
      body: JSON.stringify({ weather: mockWeather, situation: "" }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it("AI 맞춤 추천 성공 시 recommendation 객체와 geminiElapsedMs를 반환한다", async () => {
    const mockAiResponse = {
      basicOutfit: "따뜻한 울 코트와 단정한 슬랙스",
      precipitationNotice: null,
      reason: "쌀쌀한 12도 기온과 면접 상황을 반영하여 보온성과 단정함을 갖췄습니다.",
      situationSummary: "면접 대비",
    }

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: { parts: [{ text: JSON.stringify(mockAiResponse) }] },
          },
        ],
      }),
    } as any)

    const req = new NextRequest("http://localhost:3000/api/recommendation/ai-outfit", {
      method: "POST",
      body: JSON.stringify({
        weather: mockWeather,
        situation: "오늘 중요한 면접이 있어",
      }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.recommendation).toBeDefined()
    expect(data.recommendation.basicOutfit).toBe("따뜻한 울 코트와 단정한 슬랙스")
    expect(data.recommendation.isAiGenerated).toBe(true)
    expect(data.timing.geminiElapsedMs).toBeGreaterThanOrEqual(0)
  })
})
