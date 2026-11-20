import { describe, it, expect } from "vitest"
import { generateReason } from "@/lib/domain/reason"
import { createRecommendation } from "@/lib/domain/recommender"
import { ValidatedWeatherData } from "@/lib/domain/types"

describe("Recommendation Reason & Card Generator (PRD F-07, 3.3)", () => {
  it("비가 올 때 추천 이유 템플릿", () => {
    const reason = generateReason(8, "코트와 긴소매", "rain")
    expect(reason).toBe("현재 8℃이고 비가 내려 코트와 긴소매에 우산과 방수 신발을 함께 추천해요.")
  })

  it("눈이 올 때 추천 이유 템플릿", () => {
    const reason = generateReason(-2, "두꺼운 외투와 보온용품", "snow")
    expect(reason).toBe("현재 -2℃이고 눈이 내려 두꺼운 외투와 보온용품에 방수·미끄럼 방지를 고려한 신발을 함께 추천해요.")
  })

  it("비·눈 혼합일 때 추천 이유 템플릿", () => {
    const reason = generateReason(2, "두꺼운 외투와 니트", "mixed")
    expect(reason).toBe("현재 2℃이고 비와 눈이 섞여 내려 두꺼운 외투와 니트에 우산과 방수·미끄럼 방지를 고려한 신발을 함께 추천해요.")
  })

  it("강수 없음일 때 추천 이유 템플릿", () => {
    const reason = generateReason(18, "얇은 겉옷과 긴소매", "none")
    expect(reason).toBe("현재 기온 18℃를 기준으로 얇은 겉옷과 긴소매을 추천해요.")
  })

  it("강수 여부 확인 불가일 때 추천 이유 템플릿", () => {
    const reason = generateReason(22, "얇은 상의와 가벼운 하의", "unknown")
    expect(reason).toBe("현재 기온 22℃를 기준으로 얇은 상의와 가벼운 하의을 추천해요. 강수 여부는 확인하지 못했어요.")
  })

  it("추천 카드는 필수 항목과 고정 안내 문구를 포함한다", () => {
    const weather: ValidatedWeatherData = {
      cityId: "seoul",
      cityName: "서울",
      temperature: 8,
      weatherDescription: "비",
      precipitationType: "rain",
      rainfallAmount: 2.5,
      referenceAt: Date.now(),
      referenceAtFormatted: "2026. 11. 20. 17:00",
      provider: "Open-Meteo",
      providerUrl: "https://open-meteo.com/",
      infoType: "모델 기반 현재 날씨",
    }

    const card = createRecommendation(weather)
    expect(card.title).toBe("지금 참고할 옷차림")
    expect(card.basicOutfit).toBe("코트와 긴소매")
    expect(card.precipitationNotice).toBe("우산과 방수 신발도 함께 준비해 보세요.")
    expect(card.fixedDisclaimer).toBe(
      "현재 날씨 기준의 참고용 추천입니다. 이후 날씨와 개인의 체감 차이는 반영하지 않습니다.",
    )
  })
})
