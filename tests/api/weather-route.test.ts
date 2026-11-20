import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { GET, getKmaBaseDateTime } from "@/app/api/weather/route"
import { NextRequest } from "next/server"

describe("KMA Weather API Route Handler (기상청 단기예보 조회서비스 연동)", () => {
  const originalApiKey = process.env.KMA_API_KEY

  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.KMA_API_KEY = "dummy-test-kma-key"
  })

  afterEach(() => {
    process.env.KMA_API_KEY = originalApiKey
  })

  it("getKmaBaseDateTime은 45분 전 기준의 KST 년월일시를 정확히 계산한다", () => {
    // 2026년 11월 20일 17시 50분 (KST)
    const mockDate = new Date("2026-11-20T17:50:00+09:00")
    const { baseDate, baseTime } = getKmaBaseDateTime(mockDate)

    expect(baseDate).toBe("20261120")
    expect(baseTime).toBe("1700")

    // 2026년 11월 20일 17시 30분 -> 45분 전 = 16시 45분 -> baseTime: 1600
    const mockDateEarly = new Date("2026-11-20T17:30:00+09:00")
    const { baseDate: baseDate2, baseTime: baseTime2 } = getKmaBaseDateTime(mockDateEarly)

    expect(baseDate2).toBe("20261120")
    expect(baseTime2).toBe("1600")
  })

  it("지원하지 않는 도시 요청 시 400 에러를 반환한다 (F-01)", async () => {
    const req = new NextRequest("http://localhost:3000/api/weather?city=incheon")
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.errorType).toBe("INVALID_CITY")
  })

  it("도시 파라미터가 없으면 400 에러를 반환한다", async () => {
    const req = new NextRequest("http://localhost:3000/api/weather")
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.errorType).toBe("INVALID_CITY")
  })

  it("KMA_API_KEY 환경변수가 없으면 500 에러를 반환한다", async () => {
    delete process.env.KMA_API_KEY

    const req = new NextRequest("http://localhost:3000/api/weather?city=seoul")
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(500)
    expect(data.errorType).toBe("AUTH_KEY_MISSING")
    expect(data.error).toContain("기상청 API 인증키가 설정되지 않았습니다")
  })

  it("기상청 실황 정상 응답 시 기상청 데이터와 추천 카드를 올바르게 조합하여 반환한다", async () => {
    const mockNcstResponse = {
      response: {
        header: { resultCode: "00", resultMsg: "NORMAL_SERVICE" },
        body: {
          items: {
            item: [
              { category: "T1H", obsrValue: "11.2" },
              { category: "RN1", obsrValue: "0" },
              { category: "PTY", obsrValue: "0" },
            ],
          },
        },
      },
    }

    const mockFcstResponse = {
      response: {
        header: { resultCode: "00", resultMsg: "NORMAL_SERVICE" },
        body: {
          items: {
            item: [
              { category: "SKY", fcstValue: "1" }, // 맑음
            ],
          },
        },
      },
    }

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockNcstResponse),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockFcstResponse),
      } as any)

    const req = new NextRequest("http://localhost:3000/api/weather?city=seoul")
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.weather).toBeDefined()
    expect(data.weather.cityName).toBe("서울")
    expect(data.weather.temperature).toBe(11.2)
    expect(data.weather.provider).toBe("기상청")
    expect(data.weather.infoType).toBe("관측 정보")
    expect(data.weather.weatherDescription).toBe("맑음")
    expect(data.recommendation).toBeDefined()
    expect(data.recommendation.basicOutfit).toBe("재킷과 긴소매") // 10~15℃
  })

  it("기상청 실황 강수형태(PTY: 1 비) 응답 시 비 옷차림 안내가 포함된다", async () => {
    const mockNcstResponse = {
      response: {
        header: { resultCode: "00", resultMsg: "NORMAL_SERVICE" },
        body: {
          items: {
            item: [
              { category: "T1H", obsrValue: "8.0" },
              { category: "RN1", obsrValue: "2.5" },
              { category: "PTY", obsrValue: "1" }, // 비
            ],
          },
        },
      },
    }

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockNcstResponse),
      } as any)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as any)

    const req = new NextRequest("http://localhost:3000/api/weather?city=gwangju")
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.weather.precipitationType).toBe("rain")
    expect(data.weather.rainfallAmount).toBe(2.5)
    expect(data.recommendation.basicOutfit).toBe("코트와 긴소매")
    expect(data.recommendation.precipitationNotice).toContain("우산과 방수 신발")
  })

  it("기상청 XML 에러 응답 시 502 에러를 반환한다", async () => {
    const xmlError = `<OpenAPI_ServiceResponse>
      <cmmMsgHeader>
        <errMsg>SERVICE KEY IS NOT REGISTERED ERROR.</errMsg>
        <returnAuthMsg>SERVICE_KEY_IS_NOT_REGISTERED</returnAuthMsg>
      </cmmMsgHeader>
    </OpenAPI_ServiceResponse>`

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => xmlError,
    } as any)

    const req = new NextRequest("http://localhost:3000/api/weather?city=busan")
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(502)
    expect(data.errorType).toBe("PROVIDER_ERROR")
    expect(data.error).toContain("SERVICE KEY IS NOT REGISTERED ERROR")
  })
})
