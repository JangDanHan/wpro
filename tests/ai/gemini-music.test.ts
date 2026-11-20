import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  generateAiMusicQuery,
  getFallbackMusicQuery,
} from "@/lib/ai/gemini-recommender"
import { ValidatedWeatherData } from "@/lib/domain/types"

describe("Gemini Music Query Recommender", () => {
  const originalEnv = process.env

  const baseWeather: ValidatedWeatherData = {
    cityId: "1168064000",
    cityName: "서울특별시 강남구 역삼1동",
    temperature: 15,
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
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  describe("getFallbackMusicQuery", () => {
    it("비가 올 때 비에 어울리는 감성 음악 검색어와 이유를 반환한다", () => {
      const rainWeather: ValidatedWeatherData = {
        ...baseWeather,
        precipitationType: "rain",
      }
      const fallback = getFallbackMusicQuery(rainWeather)
      expect(fallback.searchQuery).toContain("비 오는 날")
      expect(fallback.reason).toContain("비가 내리는 날씨")
    })

    it("눈이 올 때 눈에 어울리는 따뜻한 음악 검색어를 반환한다", () => {
      const snowWeather: ValidatedWeatherData = {
        ...baseWeather,
        precipitationType: "snow",
      }
      const fallback = getFallbackMusicQuery(snowWeather)
      expect(fallback.searchQuery).toContain("눈 내리는 날")
    })

    it("기온이 5도 이하로 추울 때 포근한 음악 검색어를 반환한다", () => {
      const coldWeather: ValidatedWeatherData = {
        ...baseWeather,
        temperature: 2,
      }
      const fallback = getFallbackMusicQuery(coldWeather)
      expect(fallback.searchQuery).toContain("추운 겨울날")
    })

    it("기온이 23도 이상으로 따뜻/더울 때 청량한 음악 검색어를 반환한다", () => {
      const warmWeather: ValidatedWeatherData = {
        ...baseWeather,
        temperature: 26,
      }
      const fallback = getFallbackMusicQuery(warmWeather)
      expect(fallback.searchQuery).toContain("청량한")
    })

    it("상황이 주어지면 추천 이유에 상황을 포함한다", () => {
      const fallback = getFallbackMusicQuery(baseWeather, "면접 준비 중")
      expect(fallback.reason).toContain("면접 준비 중")
    })
  })

  describe("generateAiMusicQuery", () => {
    it("GEMINI_API_KEY가 없으면 fallback 결과를 즉시 반환한다", async () => {
      process.env.GEMINI_API_KEY = ""
      const result = await generateAiMusicQuery(baseWeather, "산책 나가는 길")
      expect(result).toBeDefined()
      expect(result.searchQuery).toBeTruthy()
      expect(result.reason).toContain("산책 나가는 길")
    })

    it("Gemini API가 정상 응답하면 AI가 생성한 searchQuery와 reason을 반환한다", async () => {
      process.env.GEMINI_API_KEY = "test-api-key"

      const mockAiResponse = {
        searchQuery: "선선한 가을 저녁 산책 재즈 팝",
        reason: "15도의 쾌적한 맑은 날씨에 어울리는 차분하고 기분 좋은 멜로디입니다.",
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

      const result = await generateAiMusicQuery(baseWeather, "가벼운 외출")
      expect(result.searchQuery).toBe(mockAiResponse.searchQuery)
      expect(result.reason).toBe(mockAiResponse.reason)
    })

    it("Gemini API 호출 실패 시 에러를 던지지 않고 안전하게 fallback 결과를 반환한다", async () => {
      process.env.GEMINI_API_KEY = "test-api-key"

      const fetchMock = vi.fn().mockRejectedValue(new Error("Timeout"))
      vi.stubGlobal("fetch", fetchMock)

      const result = await generateAiMusicQuery(baseWeather, "면접 준비")
      expect(result).toBeDefined()
      expect(result.searchQuery).toBeTruthy()
      expect(result.reason).toBeTruthy()
    })
  })
})
