import { describe, it, expect } from "vitest"
import { validateWeatherData, THREE_HOURS_MS } from "@/lib/domain/validator"
import { RawWeatherData } from "@/lib/domain/types"

describe("Weather Data Validator (PRD F-03, F-04, EX-05, EX-06, EX-07, EX-11)", () => {
  const now = 1700000000000 // 고정된 현재 시각

  const baseValidData: RawWeatherData = {
    cityId: "seoul",
    temperature: 12.5,
    weatherDescription: "맑음",
    precipitationType: "none",
    rainfallAmount: 0,
    referenceAt: now - 30 * 60 * 1000, // 30분 전
    provider: "Open-Meteo",
    providerUrl: "https://open-meteo.com/",
    infoType: "모델 기반 현재 날씨",
  }

  it("정상 데이터는 유효성 검사를 통과한다", () => {
    const result = validateWeatherData(baseValidData, now)
    expect(result.isValid).toBe(true)
    expect(result.data).toBeDefined()
    expect(result.data?.cityName).toBe("서울")
    expect(result.data?.temperature).toBe(12.5)
  })

  it("지원하지 않는 도시는 에러를 반환한다 (F-01)", () => {
    const result = validateWeatherData({ ...baseValidData, cityId: "incheon" as any }, now)
    expect(result.isValid).toBe(false)
    expect(result.errorType).toBe("MISSING_REQUIRED_FIELD")
  })

  it("기온이 없거나 NaN이면 0℃로 대체하지 않고 에러를 반환한다 (EX-05)", () => {
    const resultNull = validateWeatherData({ ...baseValidData, temperature: null }, now)
    expect(resultNull.isValid).toBe(false)
    expect(resultNull.errorType).toBe("INVALID_TEMPERATURE")

    const resultNaN = validateWeatherData({ ...baseValidData, temperature: NaN }, now)
    expect(resultNaN.isValid).toBe(false)
    expect(resultNaN.errorType).toBe("INVALID_TEMPERATURE")
  })

  it("정보 기준 시각이 없거나 파싱 불가하면 에러를 반환한다 (EX-06)", () => {
    const resultMissing = validateWeatherData({ ...baseValidData, referenceAt: null }, now)
    expect(resultMissing.isValid).toBe(false)
    expect(resultMissing.errorType).toBe("INVALID_REFERENCE_TIME")

    const resultInvalid = validateWeatherData({ ...baseValidData, referenceAt: "invalid-date" }, now)
    expect(resultInvalid.isValid).toBe(false)
    expect(resultInvalid.errorType).toBe("INVALID_REFERENCE_TIME")
  })

  it("정보 기준 시각이 미래이면 거부한다 (EX-07)", () => {
    const futureTime = now + 1000 * 60 // 1분 미래
    const result = validateWeatherData({ ...baseValidData, referenceAt: futureTime }, now)
    expect(result.isValid).toBe(false)
    expect(result.errorType).toBe("FUTURE_REFERENCE_TIME")
  })

  it("정보 기준 시각이 3시간을 초과하면 만료 에러를 반환한다 (EX-07)", () => {
    const expiredTime = now - (THREE_HOURS_MS + 1000) // 3시간 1초 전
    const result = validateWeatherData({ ...baseValidData, referenceAt: expiredTime }, now)
    expect(result.isValid).toBe(false)
    expect(result.errorType).toBe("EXPIRED_REFERENCE_TIME")
  })

  it("정확히 3시간 전인 정보는 허용한다 (F-04, EX-07)", () => {
    const exactlyThreeHoursAgo = now - THREE_HOURS_MS
    const result = validateWeatherData({ ...baseValidData, referenceAt: exactlyThreeHoursAgo }, now)
    expect(result.isValid).toBe(true)
  })

  it("출처 또는 정보 유형 누락 시 추천을 거부한다 (EX-11)", () => {
    const resultMissingProvider = validateWeatherData({ ...baseValidData, provider: "" }, now)
    expect(resultMissingProvider.isValid).toBe(false)
    expect(resultMissingProvider.errorType).toBe("MISSING_SOURCE_INFO")

    const resultMissingInfoType = validateWeatherData({ ...baseValidData, infoType: null }, now)
    expect(resultMissingInfoType.isValid).toBe(false)
    expect(resultMissingInfoType.errorType).toBe("MISSING_SOURCE_INFO")
  })

  it("강수량만 누락되어도 유효한 기온이 있으면 통과하며 강수량은 null로 유지된다 (EX-08)", () => {
    const result = validateWeatherData({ ...baseValidData, rainfallAmount: null, precipitationType: "rain" }, now)
    expect(result.isValid).toBe(true)
    expect(result.data?.rainfallAmount).toBeNull()
    expect(result.data?.precipitationType).toBe("rain")
  })

  it("날씨 상태 문구만 누락되어도 통과한다 (EX-10)", () => {
    const result = validateWeatherData({ ...baseValidData, weatherDescription: null }, now)
    expect(result.isValid).toBe(true)
    expect(result.data?.weatherDescription).toBeNull()
  })
})
