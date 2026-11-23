import { describe, it, expect } from "vitest"
import {
  MUSINSA_SNAP_POSTS,
  TARGET_MUSINSA_PROFILE_URL,
  getMusinsaSnapRecommendations,
} from "@/lib/domain/musinsa-snap-catalog"
import { createRecommendation } from "@/lib/domain/recommender"
import { ValidatedWeatherData } from "@/lib/domain/types"
import fs from "fs"
import path from "path"

describe("날씨 맞춤 코디 보드 카탈로그 (Outfit Board Catalog)", () => {
  it("추천 대상 무신사 프로필 URL이 정확히 설정되어 있어야 한다", () => {
    expect(TARGET_MUSINSA_PROFILE_URL).toBe(
      "https://www.musinsa.com/snap/profile/1234627203913810064",
    )
  })

  it("모든 코디는 유효한 원문 링크와 구체적인 추천 이유를 포함해야 한다", () => {
    expect(MUSINSA_SNAP_POSTS.length).toBeGreaterThanOrEqual(5)

    for (const post of MUSINSA_SNAP_POSTS) {
      expect(post.postUrl).toMatch(/^https:\/\/www\.musinsa\.com\/snap\//)
      expect(post.title).toBeTruthy()
      expect(post.clothingItems).toBeTruthy()
      expect(post.description).toBeTruthy()
      expect(post.productItems.length).toBeGreaterThanOrEqual(3)
    }
  })

  it("모든 상품 사진은 실제 존재하는 로컬 파일이어야 하며, 이미지 로딩 실패가 발생하지 않아야 한다", () => {
    for (const post of MUSINSA_SNAP_POSTS) {
      for (const item of post.productItems) {
        expect(item.photoUrl).toMatch(/^\/images\/products\//)
        const localPath = path.join(process.cwd(), "public", item.photoUrl)
        expect(fs.existsSync(localPath)).toBe(true)
      }
    }
  })

  it("영하 기온(-5℃)에서는 다운 패딩 및 보온성 코디가 최우선 추천되어야 한다", () => {
    const { primary } = getMusinsaSnapRecommendations(-5)
    expect(primary.tempMin).toBeLessThanOrEqual(-5)
    expect(primary.tempMax).toBeGreaterThan(-5)
    expect(primary.clothingItems).toMatch(/(패딩|다운)/)
  })

  it("초겨울 단정한 출근 상황에서는 울 롱코트와 셔츠 룩이 최우선 추천되어야 한다", () => {
    const { primary } = getMusinsaSnapRecommendations(3, "회사 출근")
    expect(primary.style).toBe("formal")
    expect(primary.clothingItems).toMatch(/(코트|셔츠)/)
  })

  it("간절기(12℃) 캐주얼 상황에서는 데님 및 스니커즈 조합이 추천되어야 한다", () => {
    const { primary } = getMusinsaSnapRecommendations(12, "대학생 캠퍼스 데일리")
    expect(primary.style).toBe("casual")
    expect(primary.clothingItems).toMatch(/(데님|스니커즈)/)
  })

  it("createRecommendation은 코디 보드 구성과 상품 리스트를 정확히 반환해야 한다", () => {
    const mockWeather: ValidatedWeatherData = {
      cityId: "seoul",
      cityName: "서울특별시 종로구 청운동",
      temperature: -2.5,
      weatherDescription: "맑음",
      precipitationType: "none",
      rainfallAmount: 0,
      referenceAt: Date.now(),
      referenceAtFormatted: "12:00",
      provider: "기상청",
      providerUrl: "https://www.weather.go.kr",
      infoType: "관측 정보",
    }

    const rec = createRecommendation(mockWeather, "데이트")
    expect(rec.snapUrl).toMatch(/^https:\/\/www\.musinsa\.com\/snap\//)
    expect(rec.productItems).toBeDefined()
    expect(rec.productItems!.length).toBeGreaterThanOrEqual(3)
    expect(rec.alternativeOutfits?.length).toBeGreaterThan(0)
  })
})
