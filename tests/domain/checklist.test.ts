import { describe, it, expect } from "vitest"
import { generateChecklist } from "@/lib/domain/checklist"
import { ValidatedWeatherData } from "@/lib/domain/types"

describe("외출 준비물 체크리스트 생성 도메인 검증", () => {
  const baseWeather: ValidatedWeatherData = {
    cityId: "seoul",
    cityName: "서울특별시",
    temperature: 18.0,
    weatherDescription: "구름많음",
    precipitationType: "none",
    rainfallAmount: 0,
    referenceAt: 1700000000000,
    referenceAtFormatted: "2023-11-15 12:00",
    provider: "기상청",
    providerUrl: "https://www.weather.go.kr",
    infoType: "모델 기반 현재 날씨",
  }

  it("비가 확정된 경우 '우산 — 외출 시간에 비가 내리고 있어요.'를 추천한다", () => {
    const rainWeather: ValidatedWeatherData = {
      ...baseWeather,
      precipitationType: "rain",
      rainfallAmount: 3.5,
      weatherDescription: "흐리고 비",
    }
    const list = generateChecklist(rainWeather)
    const umbrellaItem = list.find((item) => item.name === "우산")
    expect(umbrellaItem).toBeDefined()
    expect(umbrellaItem?.reason).toBe("외출 시간에 비가 내리고 있어요.")
  })

  it("비가 아직 내리지 않지만 비 예보가 있는 경우 '접이식 우산 — 외출 시간에 비 예보가 있어요.'를 추천한다", () => {
    const forecastWeather: ValidatedWeatherData = {
      ...baseWeather,
      precipitationType: "none",
      rainfallAmount: 0,
      weatherDescription: "오후 한때 소나기 예보",
    }
    const list = generateChecklist(forecastWeather)
    const umbrellaItem = list.find((item) => item.name === "접이식 우산")
    expect(umbrellaItem).toBeDefined()
    expect(umbrellaItem?.reason).toBe("외출 시간에 비 예보가 있어요.")
  })

  it("영하의 날씨일 때 핫팩과 방한 장갑을 추천한다", () => {
    const coldWeather: ValidatedWeatherData = {
      ...baseWeather,
      temperature: -3.5,
      weatherDescription: "맑음",
    }
    const list = generateChecklist(coldWeather)
    expect(list.some((i) => i.name === "핫팩")).toBe(true)
    expect(list.some((i) => i.name === "방한 장갑")).toBe(true)
  })

  it("28도 이상의 무더위일 때 휴대용 선풍기와 시원한 생수를 추천한다", () => {
    const hotWeather: ValidatedWeatherData = {
      ...baseWeather,
      temperature: 31.0,
      weatherDescription: "맑음",
    }
    const list = generateChecklist(hotWeather)
    expect(list.some((i) => i.name.includes("선풍기"))).toBe(true)
    expect(list.some((i) => i.name.includes("생수"))).toBe(true)
  })

  it("맑은 날씨에는 자외선 차단제를 추천한다", () => {
    const sunnyWeather: ValidatedWeatherData = {
      ...baseWeather,
      temperature: 22.0,
      weatherDescription: "맑음",
    }
    const list = generateChecklist(sunnyWeather)
    expect(list.some((i) => i.name.includes("자외선 차단제"))).toBe(true)
  })

  it("면접 상황이 입력된 경우 신분증과 메모지를 추천한다", () => {
    const list = generateChecklist(baseWeather, "오늘 오후 중요한 면접이 있어")
    expect(list.some((i) => i.name.includes("신분증"))).toBe(true)
  })

  it("같은 준비물은 중복되지 않고, 3개 이상 5개 이하로 유지된다", () => {
    const list = generateChecklist(baseWeather)
    const names = list.map((i) => i.name)
    const uniqueNames = new Set(names)
    expect(uniqueNames.size).toBe(names.length)
    expect(list.length).toBeGreaterThanOrEqual(3)
    expect(list.length).toBeLessThanOrEqual(5)
  })
})
