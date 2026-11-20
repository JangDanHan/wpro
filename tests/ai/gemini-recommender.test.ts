import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { generateAiOutfitRecommendation } from "@/lib/ai/gemini-recommender"
import { ValidatedWeatherData } from "@/lib/domain/types"

describe("generateAiOutfitRecommendation", () => {
  const originalEnv = process.env
  const mockWeather: ValidatedWeatherData = {
    cityId: "1168064000",
    cityName: "서울특별시 강남구 역삼1동",
    temperature: 12.5,
    weatherDescription: "맑음",
    precipitationType: "none",
    rainfallAmount: 0,
    referenceAt: Date.now(),
    referenceAtFormatted: "10:00 발표",
    provider: "기상청",
    providerUrl: "https://www.weather.go.kr",
    infoType: "관측 정보",
  }

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  it("상황 입력이 비어있으면 null을 반환한다", async () => {
    const result1 = await generateAiOutfitRecommendation(mockWeather, "")
    expect(result1).toBeNull()

    const result2 = await generateAiOutfitRecommendation(mockWeather, "   ")
    expect(result2).toBeNull()

    const result3 = await generateAiOutfitRecommendation(mockWeather, null)
    expect(result3).toBeNull()
  })

  it("GEMINI_API_KEY가 설정되지 않았거나 비어있으면 null을 반환한다", async () => {
    process.env.GEMINI_API_KEY = ""

    const result = await generateAiOutfitRecommendation(
      mockWeather,
      "추위를 많이 타고 면접이 있어"
    )

    expect(result).toBeNull()
  })

  it("Gemini API가 성공 응답을 주면 OutfitRecommendation 객체로 파싱하여 반환한다", async () => {
    process.env.GEMINI_API_KEY = "test-api-key"

    const mockAiResponse = {
      basicOutfit: "보온 내의를 받쳐 입은 단정한 정장과 따뜻한 울 코트",
      precipitationNotice: null,
      reason: "기상청 관측 12.5°C의 쌀쌀한 날씨와 면접 상황에 맞춰 보온성과 단정함을 모두 갖췄습니다.",
      situationSummary: "추위 민감 및 면접 일정",
    }

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify(mockAiResponse),
                },
              ],
            },
          },
        ],
      }),
    })

    vi.stubGlobal("fetch", fetchMock)

    const result = await generateAiOutfitRecommendation(
      mockWeather,
      "추위를 많이 타고 면접이 있어"
    )

    expect(result).not.toBeNull()
    expect(result?.title).toBe("지금 참고할 옷차림")
    expect(result?.basicOutfit).toBe(mockAiResponse.basicOutfit)
    expect(result?.reason).toBe(mockAiResponse.reason)
    expect(result?.situation).toBe("추위를 많이 타고 면접이 있어")
    expect(result?.isAiGenerated).toBe(true)
    expect(result?.fixedDisclaimer).toContain("현재 날씨 기준의 참고용 추천입니다")
  })

  it("Gemini API 호출에 실패하면 에러를 던지지 않고 null을 반환하여 기존 규칙으로 fallback되게 한다", async () => {
    process.env.GEMINI_API_KEY = "test-api-key"

    const fetchMock = vi.fn().mockRejectedValue(new Error("Network timeout"))
    vi.stubGlobal("fetch", fetchMock)

    const result = await generateAiOutfitRecommendation(
      mockWeather,
      "추위를 많이 타요"
    )

    expect(result).toBeNull()
  })

  it("Gemini API가 JSON 형식이 아닌 잘못된 텍스트를 반환해도 안전하게 null을 반환한다", async () => {
    process.env.GEMINI_API_KEY = "test-api-key"

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: "Invalid non-json response text",
                },
              ],
            },
          },
        ],
      }),
    })

    vi.stubGlobal("fetch", fetchMock)

    const result = await generateAiOutfitRecommendation(
      mockWeather,
      "추위를 많이 타요"
    )

    expect(result).toBeNull()
  })
})
