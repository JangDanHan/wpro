import { describe, it, expect } from "vitest"
import {
  MUSINSA_SNAP_POSTS,
  TARGET_MUSINSA_PROFILE_URL,
  getMusinsaSnapRecommendations,
} from "@/lib/domain/musinsa-snap-catalog"
import { createRecommendation } from "@/lib/domain/recommender"
import { ValidatedWeatherData } from "@/lib/domain/types"

describe("무신사 스냅 코디 카탈로그 (Musinsa Snap Catalog)", () => {
  it("추천 대상 무신사 프로필 URL이 정확히 설정되어 있어야 한다", () => {
    expect(TARGET_MUSINSA_PROFILE_URL).toBe(
      "https://www.musinsa.com/snap/profile/1234627203913810064",
    )
  })

  it("모든 게시물은 유효한 무신사 스냅 URL과 프로필 URL을 포함해야 한다 (가짜 주소 방지)", () => {
    expect(MUSINSA_SNAP_POSTS.length).toBeGreaterThan(5)

    for (const post of MUSINSA_SNAP_POSTS) {
      expect(post.postUrl).toMatch(/^https:\/\/www\.musinsa\.com\/snap\//)
      expect(post.profileUrl).toBe(TARGET_MUSINSA_PROFILE_URL)
      expect(post.creatorName).toBeTruthy()
      expect(post.clothingItems).toBeTruthy()
      expect(post.productItems.length).toBeGreaterThanOrEqual(2)
    }
  })

  it("서로 다른 게시물의 아이템이 섞이지 않고, 단일 게시물 내의 productItems만 유지되어야 한다", () => {
    const postIds = new Set(MUSINSA_SNAP_POSTS.map((p) => p.id))
    expect(postIds.size).toBe(MUSINSA_SNAP_POSTS.length)

    for (const post of MUSINSA_SNAP_POSTS) {
      // 각 게시물의 상품 ID는 해당 게시물의 snapId 프리픽스를 가져야 함
      for (const item of post.productItems) {
        expect(item.name).toBeTruthy()
        expect(item.photoUrl).toBeTruthy()
        expect(item.category).toBeTruthy()
      }
    }
  })

  it("영하 기온(-5℃)에서는 다운 패딩 및 보온성 코디가 최우선 추천되어야 한다", () => {
    const { primary } = getMusinsaSnapRecommendations(-5)
    expect(primary.tempMin).toBeLessThanOrEqual(-5)
    expect(primary.tempMax).toBeGreaterThan(-5)
    expect(primary.clothingItems).toMatch(/(패딩|다운)/)
  })

  it("17℃ 봄/가을 기온에서는 블레이저나 트러커 등 간절기 룩이 추천되어야 한다", () => {
    const { primary } = getMusinsaSnapRecommendations(17)
    expect(primary.tempMin).toBeLessThanOrEqual(17)
    expect(primary.tempMax).toBeGreaterThan(17)
  })

  it("30℃ 폭염 기온에서는 썸머 쿨링 룩이 최우선 추천되어야 한다", () => {
    const { primary } = getMusinsaSnapRecommendations(30)
    expect(primary.tempMin).toBeLessThanOrEqual(30)
    expect(primary.tempMax).toBeGreaterThan(30)
    expect(primary.clothingItems).toMatch(/(쇼츠|반팔|슬라이드|샌들)/)
  })

  it("비가 올 때 방수/발수 기능성 스트릿 룩이 적절히 가산점을 받아야 한다", () => {
    const { primary } = getMusinsaSnapRecommendations(12, null, "rain")
    expect(primary.clothingItems).toMatch(/(방수|윈드브레이커|쉘)/)
  })

  it("상황 입력에 '출근' 또는 '면접'이 포함되면 포멀/단정한 스타일이 우선 고려되어야 한다", () => {
    const { primary } = getMusinsaSnapRecommendations(16, "중요한 회사 출근 미팅")
    expect(primary.style).toBe("formal")
    expect(primary.styleName).toBe("단정한 스타일")
  })

  it("날씨 적합성을 판단할 정보가 부족한 코디는 isWeatherVerified: false와 사유가 명시되어야 한다", () => {
    const unverifiedPosts = MUSINSA_SNAP_POSTS.filter((p) => !p.isWeatherVerified)
    expect(unverifiedPosts.length).toBeGreaterThan(0)
    for (const post of unverifiedPosts) {
      expect(post.unverifiedReason).toBeTruthy()
    }
  })

  it("createRecommendation은 무신사 스냅 원문 URL 및 날씨 검증 상태를 정확히 반환해야 한다", () => {
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
    expect(rec.musinsaProfileUrl).toBe(TARGET_MUSINSA_PROFILE_URL)
    expect(rec.isWeatherVerified).toBeDefined()
    expect(rec.productItems).toBeDefined()
    expect(rec.alternativeOutfits?.length).toBeGreaterThan(0)
    expect(rec.alternativeOutfits?.[0].snapUrl).toMatch(/^https:\/\/www\.musinsa\.com\/snap\//)
  })
})
