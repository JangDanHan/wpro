import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET } from "@/app/api/weather/route"
import { NextRequest } from "next/server"

describe("Weather API Route Handler (PRD F-01, F-08, EX-03, EX-04)", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
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

  it("Open-Meteo 429 응답 시 잠시 후 다시 시도 안내를 반환한다 (EX-04)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      status: 429,
      ok: false,
    } as any)

    const req = new NextRequest("http://localhost:3000/api/weather?city=seoul")
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(429)
    expect(data.errorType).toBe("RATE_LIMITED")
    expect(data.error).toContain("날씨 정보를 잠시 이용할 수 없어요")
  })

  it("Open-Meteo 정상 응답 시 날씨와 추천 카드를 조합하여 반환한다", async () => {
    const mockMeteoResponse = {
      latitude: 37.5665,
      longitude: 126.978,
      timezone: "Asia/Seoul",
      current: {
        time: "2026-11-20T17:00",
        temperature_2m: 11.2,
        precipitation: 0.0,
        weather_code: 1, // 대체로 맑음
      },
    }

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => mockMeteoResponse,
    } as any)

    const req = new NextRequest("http://localhost:3000/api/weather?city=seoul")
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.weather).toBeDefined()
    expect(data.weather.cityName).toBe("서울")
    expect(data.weather.temperature).toBe(11.2)
    expect(data.recommendation).toBeDefined()
    expect(data.recommendation.basicOutfit).toBe("재킷과 긴소매") // 10~15℃
  })
})
