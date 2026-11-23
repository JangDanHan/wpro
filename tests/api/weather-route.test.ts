import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { GET } from "@/app/api/weather/route"
import { getKmaBaseDateTime } from "@/lib/domain/kma-date"
import { NextRequest } from "next/server"

describe("KMA Weather API Route Handler (기상청 단기예보 조회서비스 전국 연동)", () => {
  const originalApiKey = process.env.KMA_API_KEY

  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.KMA_API_KEY = "dummy-test-kma-key"
  })

  afterEach(() => {
    process.env.KMA_API_KEY = originalApiKey
  })

  it("getKmaBaseDateTime은 45분 전 기준의 KST 년월일시를 정확히 계산한다", () => {
    const mockDate = new Date("2026-11-20T17:50:00+09:00")
    const { baseDate, baseTime } = getKmaBaseDateTime(mockDate)

    expect(baseDate).toBe("20261120")
    expect(baseTime).toBe("1700")

    const mockDateEarly = new Date("2026-11-20T17:30:00+09:00")
    const { baseDate: baseDate2, baseTime: baseTime2 } = getKmaBaseDateTime(mockDateEarly)

    expect(baseDate2).toBe("20261120")
    expect(baseTime2).toBe("1600")
  })

  it("존재하지 않거나 유효하지 않은 지역 요청 시 400 에러를 반환한다", async () => {
    const req = new NextRequest("http://localhost:3000/api/weather?regionId=invalid-unknown-place")
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.errorType).toBe("INVALID_REGION")
  })

  it("지역 파라미터가 없으면 400 에러를 반환한다", async () => {
    const req = new NextRequest("http://localhost:3000/api/weather")
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.errorType).toBe("INVALID_REGION")
  })

  it("시·도만 선택된 경우 400 에러와 INCOMPLETE_REGION_SELECTION을 반환하고 조회를 차단한다", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")

    // 시·도 1단계만 요청 (예: 광주광역시 또는 seoul)
    const req = new NextRequest("http://localhost:3000/api/weather?regionId=광주광역시")
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.errorType).toBe("INCOMPLETE_REGION_SELECTION")
    expect(data.error).toContain("시·도, 시·군·구, 읍·면·동을 모두 선택해야")
    // 기상청 API를 호출하지 않음
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("시·군·구까지만 선택된 경우 400 에러와 INCOMPLETE_REGION_SELECTION을 반환하고 조회를 차단한다", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")

    // 시·군·구 2단계까지만 요청 (예: 서울특별시 종로구)
    const req = new NextRequest("http://localhost:3000/api/weather?regionId=서울특별시-종로구")
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.errorType).toBe("INCOMPLETE_REGION_SELECTION")
    expect(data.error).toContain("시·도, 시·군·구, 읍·면·동을 모두 선택해야")
    // 기상청 API를 호출하지 않음
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("KMA_API_KEY 환경변수가 없으면 500 에러를 반환한다", async () => {
    delete process.env.KMA_API_KEY

    const req = new NextRequest("http://localhost:3000/api/weather?regionId=서울특별시-종로구-사직동")
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(500)
    expect(data.errorType).toBe("AUTH_KEY_MISSING")
    expect(data.error).toContain("기상청 API 인증키가 설정되지 않았습니다")
  })

  it("기상청 실황 정상 응답 시 전체 지역명과 추천 카드를 올바르게 반환한다", async () => {
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

    const req = new NextRequest("http://localhost:3000/api/weather?regionId=서울특별시-종로구-사직동")
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.weather).toBeDefined()
    expect(data.weather.cityName).toBe("서울특별시 종로구 사직동")
    expect(data.weather.temperature).toBe(11.2)
    expect(data.weather.provider).toBe("기상청")
    expect(data.weather.infoType).toBe("관측 정보")
    expect(data.weather.weatherDescription).toBe("맑음")
    expect(data.recommendation).toBeDefined()
    expect(data.recommendation.basicOutfit).toBe("재킷과 긴소매")
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

    const req = new NextRequest("http://localhost:3000/api/weather?regionId=부산광역시-해운대구-우동")
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(502)
    expect(data.errorType).toBe("PROVIDER_ERROR")
    expect(data.error).toContain("SERVICE KEY IS NOT REGISTERED ERROR")
  })
})
