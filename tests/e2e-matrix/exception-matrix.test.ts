import { describe, it, expect } from "vitest"
import { validateWeatherData, THREE_HOURS_MS } from "@/lib/domain/validator"
import { detectPrecipitation, getPrecipitationNotice } from "@/lib/domain/precipitation"
import { getBasicOutfit } from "@/lib/domain/outfit"
import { generateReason } from "@/lib/domain/reason"
import { RawWeatherData } from "@/lib/domain/types"

describe("PRD 제5절 예외 처리 15종 통합 검증 (EX-01 ~ EX-15)", () => {
  const now = 1700000000000

  const validBase: RawWeatherData = {
    cityId: "seoul",
    temperature: 14.0,
    weatherDescription: "맑음",
    precipitationType: "none",
    rainfallAmount: 0,
    referenceAt: now - 15 * 60 * 1000,
    provider: "Open-Meteo",
    providerUrl: "https://open-meteo.com/",
    infoType: "모델 기반 현재 날씨",
  }

  // EX-01: 도시 미선택
  it("[EX-01] 도시가 선택되지 않으면 필수 항목 검증에서 차단된다", () => {
    const res = validateWeatherData({ ...validBase, cityId: "" as any }, now)
    expect(res.isValid).toBe(false)
    expect(res.errorType).toBe("MISSING_REQUIRED_FIELD")
  })

  // EX-05: 기온 누락 또는 잘못된 기온
  it("[EX-05] 기온이 없거나 NaN일 때 0℃로 대체하지 않고 오류를 반환한다", () => {
    const resNull = validateWeatherData({ ...validBase, temperature: null }, now)
    expect(resNull.isValid).toBe(false)
    expect(resNull.errorType).toBe("INVALID_TEMPERATURE")
    expect(resNull.errorMessage).toBe("기온을 확인할 수 없어 옷차림을 추천하지 못했어요.")

    const resNaN = validateWeatherData({ ...validBase, temperature: NaN }, now)
    expect(resNaN.isValid).toBe(false)
    expect(resNaN.errorType).toBe("INVALID_TEMPERATURE")
  })

  // EX-06: 기준 시각 누락 또는 해석 불가
  it("[EX-06] 기준 시각이 없거나 잘못되면 현재 시각으로 임의 대체하지 않고 오류를 반환한다", () => {
    const resNull = validateWeatherData({ ...validBase, referenceAt: null }, now)
    expect(resNull.isValid).toBe(false)
    expect(resNull.errorType).toBe("INVALID_REFERENCE_TIME")
    expect(resNull.errorMessage).toContain("기준 시각을 확인할 수 없어")

    const resInvalid = validateWeatherData({ ...validBase, referenceAt: "not-a-date" }, now)
    expect(resInvalid.isValid).toBe(false)
    expect(resInvalid.errorType).toBe("INVALID_REFERENCE_TIME")
  })

  // EX-07: 오래된 정보 또는 미래 시각
  it("[EX-07] 3시간 초과 오래된 정보나 미래 시각은 거부한다", () => {
    // 3시간 1초 전 -> 거부
    const resOld = validateWeatherData({ ...validBase, referenceAt: now - (THREE_HOURS_MS + 1000) }, now)
    expect(resOld.isValid).toBe(false)
    expect(resOld.errorType).toBe("EXPIRED_REFERENCE_TIME")

    // 미래 시각 -> 거부
    const resFuture = validateWeatherData({ ...validBase, referenceAt: now + 5000 }, now)
    expect(resFuture.isValid).toBe(false)
    expect(resFuture.errorType).toBe("FUTURE_REFERENCE_TIME")

    // 정확히 3시간 전 -> 허용
    const resExact = validateWeatherData({ ...validBase, referenceAt: now - THREE_HOURS_MS }, now)
    expect(resExact.isValid).toBe(true)
  })

  // EX-08: 강수량만 누락
  it("[EX-08] 강수량이 없어도 확인된 비/눈 상태는 유지되고 강수량은 null로 표기된다", () => {
    const res = validateWeatherData(
      { ...validBase, rainfallAmount: null, precipitationType: "rain" },
      now,
    )
    expect(res.isValid).toBe(true)
    expect(res.data?.rainfallAmount).toBeNull()
    expect(res.data?.precipitationType).toBe("rain")

    const notice = getPrecipitationNotice("rain")
    expect(notice).toBe("우산과 방수 신발도 함께 준비해 보세요.")
  })

  // EX-09: 강수 여부 확인 불가 또는 정보 충돌
  it("[EX-09] 강수 정보가 모호하거나 충돌하면 기온 기반 추천만 제공하고 확인 불가 안내를 한다", () => {
    const conflictType = detectPrecipitation({ explicitType: "rain", weatherCode: 71 /* snow */ })
    expect(conflictType).toBe("unknown")

    const notice = getPrecipitationNotice("unknown")
    expect(notice).toBe("강수 여부를 확인할 수 없어 기온만 기준으로 추천했어요.")

    const reason = generateReason(12, "재킷과 긴소매", "unknown")
    expect(reason).toContain("강수 여부는 확인하지 못했어요.")
  })

  // EX-10: 날씨 상태 문구만 누락
  it("[EX-10] 날씨 상태 문구가 없어도 필수 정보가 유효하면 추천을 유지한다", () => {
    const res = validateWeatherData({ ...validBase, weatherDescription: null }, now)
    expect(res.isValid).toBe(true)
    expect(res.data?.weatherDescription).toBeNull()
  })

  // EX-11: 출처 및 정보 유형 누락
  it("[EX-11] 출처 또는 정보 유형 누락 시 추천 생성을 차단한다", () => {
    const res = validateWeatherData({ ...validBase, provider: null }, now)
    expect(res.isValid).toBe(false)
    expect(res.errorType).toBe("MISSING_SOURCE_INFO")
  })

  // EX-14: 추천 콘텐츠 완비성 검증
  it("[EX-14] 극한 기온을 포함한 모든 온도 구간에서 단 하나의 유효한 추천이 보장된다", () => {
    const testTemps = [-40, -10, -0.1, 0, 4.9, 5.0, 9.9, 10.0, 14.9, 15.0, 19.9, 20.0, 27.9, 28.0, 35, 45]
    for (const temp of testTemps) {
      const outfit = getBasicOutfit(temp)
      expect(outfit).toBeDefined()
      expect(outfit.basicOutfit.length).toBeGreaterThan(0)
    }
  })
})
