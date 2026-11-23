import { describe, it, expect } from "vitest"
import { recommendOutfitFromCloset } from "@/lib/domain/closet-recommender"
import { ClosetItem } from "@/lib/domain/closet-types"
import { ValidatedWeatherData } from "@/lib/domain/types"

const mockColdWeather: ValidatedWeatherData = {
  cityId: "seoul",
  cityName: "서울특별시",
  temperature: 2.5,
  apparentTemp: 0.5,
  weatherDescription: "맑음",
  precipitationType: "none",
  rainfallAmount: null,
  referenceAt: Date.now(),
  referenceAtFormatted: "10:00 발표",
  provider: "기상청",
  providerUrl: "https://www.weather.go.kr",
  infoType: "관측 정보",
}

const mockWarmWeather: ValidatedWeatherData = {
  cityId: "gwangju",
  cityName: "광주광역시",
  temperature: 22.0,
  apparentTemp: 21.5,
  weatherDescription: "맑음",
  precipitationType: "none",
  rainfallAmount: null,
  referenceAt: Date.now(),
  referenceAtFormatted: "14:00 발표",
  provider: "기상청",
  providerUrl: "https://www.weather.go.kr",
  infoType: "관측 정보",
}

const mockSampleClothes: ClosetItem[] = [
  {
    id: "outer-coat",
    userId: "test_user",
    name: "울 싱글 코트",
    category: "outer",
    colors: ["블랙"],
    pattern: "무지",
    style: "formal",
    seasons: ["winter"],
    thickness: "thick",
    warmth: "high",
    isAttributeConfirmed: true,
    originalImageUrl: "test.jpg",
    activeImageMode: "original",
    isFavorite: true,
    wearCount: 3,
    lastWornDate: null,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "top-knit",
    userId: "test_user",
    name: "도톰한 울 니트",
    category: "top",
    colors: ["아이보리"],
    pattern: "무지",
    style: "casual",
    seasons: ["winter", "autumn"],
    thickness: "thick",
    warmth: "high",
    isAttributeConfirmed: true,
    originalImageUrl: "test.jpg",
    activeImageMode: "original",
    isFavorite: false,
    wearCount: 5,
    lastWornDate: null,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "bottom-slacks",
    userId: "test_user",
    name: "기모 슬랙스",
    category: "bottom",
    colors: ["차콜"],
    pattern: "무지",
    style: "minimal",
    seasons: ["winter", "all"],
    thickness: "thick",
    warmth: "high",
    isAttributeConfirmed: true,
    originalImageUrl: "test.jpg",
    activeImageMode: "original",
    isFavorite: false,
    wearCount: 2,
    lastWornDate: null,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "shoes-sneakers",
    userId: "test_user",
    name: "클린 레더 스니커즈",
    category: "shoes",
    colors: ["화이트"],
    pattern: "무지",
    style: "casual",
    seasons: ["all"],
    thickness: "medium",
    warmth: "medium",
    isAttributeConfirmed: true,
    originalImageUrl: "test.jpg",
    activeImageMode: "original",
    isFavorite: true,
    wearCount: 10,
    lastWornDate: null,
    createdAt: "",
    updatedAt: "",
  },
]

describe("내 옷장 맞춤 코디 추천 엔진 (closet-recommender)", () => {
  it("추운 날씨(0.5℃ 체감)에 보유한 아우터, 상의, 하의, 신발을 적절히 매칭한다", () => {
    const res = recommendOutfitFromCloset({
      clothes: mockSampleClothes,
      weather: mockColdWeather,
    })

    expect(res.matchedItems.length).toBeGreaterThanOrEqual(3)
    const categories = res.matchedItems.map((m) => m.category)
    expect(categories).toContain("outer")
    expect(categories).toContain("top")
    expect(categories).toContain("bottom")
    expect(res.missingCategories.length).toBe(0)
    // 실제 보유 옷의 id만 포함되어야 함
    expect(res.matchedItems.every((m) => mockSampleClothes.some((c) => c.id === m.item.id))).toBe(true)
  })

  it("보유한 옷장에 겨울 아우터가 없을 때 날조하지 않고 missingCategories로 안내한다", () => {
    // 아우터를 제외한 옷 목록
    const clothesWithoutOuter = mockSampleClothes.filter((c) => c.category !== "outer")

    const res = recommendOutfitFromCloset({
      clothes: clothesWithoutOuter,
      weather: mockColdWeather,
    })

    const categories = res.matchedItems.map((m) => m.category)
    expect(categories).not.toContain("outer")
    // 부족한 옷 안내에 아우터가 포함되어 있어야 함
    const missingOuter = res.missingCategories.find((m) => m.category === "outer")
    expect(missingOuter).toBeDefined()
    expect(missingOuter?.advice).toContain("아우터")
  })

  it("특정 옷을 핀(Pin) 고정하면 해당 옷이 반드시 추천 결과에 포함된다", () => {
    const res = recommendOutfitFromCloset({
      clothes: mockSampleClothes,
      weather: mockColdWeather,
      pinnedItemIds: ["top-knit"],
    })

    const pinnedMatch = res.matchedItems.find((m) => m.item.id === "top-knit")
    expect(pinnedMatch).toBeDefined()
    expect(pinnedMatch?.isPinned).toBe(true)
  })

  it("어제 입은 옷 제외 요청 시 어제 착용한 아이템을 배제한다", () => {
    const res = recommendOutfitFromCloset({
      clothes: mockSampleClothes,
      weather: mockColdWeather,
      situation: "어제 입은 옷은 빼줘",
      yesterdayWornItemIds: ["top-knit"],
    })

    const topMatch = res.matchedItems.find((m) => m.category === "top")
    expect(topMatch).toBeUndefined() // 상의가 top-knit 1개뿐이므로 어제 입은 옷 제외 시 상의 누락 안내
    expect(res.missingCategories.some((m) => m.category === "top")).toBe(true)
  })
})
