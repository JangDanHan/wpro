import { describe, it, expect } from "vitest"
import {
  OUTFIT_CATALOG,
  getOutfitRecommendations,
} from "@/lib/domain/outfit-catalog"

describe("Outfit Catalog & Product Photo Recommender", () => {
  it("카탈로그의 모든 코디는 상의·하의·신발 등 개별 상품 사진(productItems)을 갖추어야 한다", () => {
    expect(OUTFIT_CATALOG.length).toBeGreaterThanOrEqual(7)

    for (const outfit of OUTFIT_CATALOG) {
      expect(outfit.id).toBeTruthy()
      expect(outfit.title).toBeTruthy()
      expect(outfit.clothingItems).toContain("+")
      expect(outfit.description).toBeTruthy()
      expect(outfit.photoUrl).toMatch(/^https:\/\/images\.unsplash\.com/)
      expect(outfit.photoCredit).toContain("Unsplash")
      expect(["casual", "formal", "comfort"]).toContain(outfit.style)

      // 개별 상품 사진(productItems) 검증: 상의, 하의, 신발 등 최소 3개 이상
      expect(outfit.productItems).toBeDefined()
      expect(outfit.productItems.length).toBeGreaterThanOrEqual(3)

      for (const item of outfit.productItems) {
        expect(item.id).toBeTruthy()
        expect(item.name).toBeTruthy()
        expect(item.photoUrl).toBeTruthy()
        expect(["outer", "top", "bottom", "shoes", "accessory"]).toContain(item.category)
        expect(item.categoryLabel).toBeTruthy()
      }
    }
  })

  it("모든 기온 대역(-20℃ ~ 35℃)에서 최소 2가지 이상 서로 다른 스타일 코디를 반환한다", () => {
    const testTemps = [-5, 2, 7, 12, 17, 24, 30]

    for (const temp of testTemps) {
      const { primary, alternatives, allForTemp } = getOutfitRecommendations(temp)

      expect(primary).toBeDefined()
      expect(primary.photoUrl).toBeTruthy()
      expect(primary.productItems.length).toBeGreaterThanOrEqual(3)

      const styles = new Set(allForTemp.map((o) => o.style))
      expect(styles.size).toBeGreaterThanOrEqual(1)
    }
  })

  it("사용자 상황이 '면접'일 때 단정한 스타일(formal) 코디를 우선 추천한다", () => {
    const { primary } = getOutfitRecommendations(2, "중요한 취업 면접이 있어요")
    expect(primary.style).toBe("formal")
    expect(primary.styleName).toBe("단정한 스타일")
  })

  it("사용자 상황이 '운동/러닝'일 때 편한 스타일(comfort) 코디를 우선 추천한다", () => {
    const { primary } = getOutfitRecommendations(2, "저녁에 산책 및 편한 옷차림")
    expect(primary.style).toBe("comfort")
    expect(primary.styleName).toBe("편한 스타일")
  })

  it("사용자 상황이 '데이트'일 때 캐주얼 스타일(casual) 코디를 우선 추천한다", () => {
    const { primary } = getOutfitRecommendations(2, "주말 오후 소개팅 데이트")
    expect(primary.style).toBe("casual")
    expect(primary.styleName).toBe("캐주얼")
  })

  it("특정 스타일을 명시적으로 선택하면 해당 스타일 코디가 primary로 반환된다", () => {
    const { primary } = getOutfitRecommendations(2, null, "formal")
    expect(primary.style).toBe("formal")
  })
})
