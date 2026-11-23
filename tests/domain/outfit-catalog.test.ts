import { describe, it, expect } from "vitest"
import {
  OUTFIT_CATALOG,
  getOutfitRecommendations,
} from "@/lib/domain/outfit-catalog"

describe("Outfit Catalog & Photo-Centric Recommender", () => {
  it("카탈로그의 모든 코디는 실제 사진 URL, 옷 구성 명시, 스타일, 출처를 갖추어야 한다", () => {
    expect(OUTFIT_CATALOG.length).toBeGreaterThanOrEqual(15)

    for (const outfit of OUTFIT_CATALOG) {
      expect(outfit.id).toBeTruthy()
      expect(outfit.title).toBeTruthy()
      expect(outfit.clothingItems).toContain("+") // 옷 조합 명시 ('니트 + 청바지 + 코트' 형태)
      expect(outfit.description).toBeTruthy()
      expect(outfit.photoUrl).toMatch(/^https:\/\/images\.unsplash\.com/)
      expect(outfit.photoCredit).toContain("Unsplash")
      expect(["casual", "formal", "comfort"]).toContain(outfit.style)
    }
  })

  it("모든 기온 대역(-20℃ ~ 35℃)에서 최소 3가지 서로 다른 스타일(캐주얼, 단정, 편한) 코디를 반환한다", () => {
    const testTemps = [-5, 2, 7, 12, 17, 24, 30]

    for (const temp of testTemps) {
      const { primary, alternatives, allForTemp } = getOutfitRecommendations(temp)

      expect(primary).toBeDefined()
      expect(primary.photoUrl).toBeTruthy()
      expect(primary.clothingItems).toBeTruthy()

      // 최소 3가지 스타일이 존재하는지 확인
      const styles = new Set(allForTemp.map((o) => o.style))
      expect(styles.has("casual")).toBe(true)
      expect(styles.has("formal")).toBe(true)
      expect(styles.has("comfort")).toBe(true)
    }
  })

  it("사용자 상황이 '면접'일 때 단정한 스타일(formal) 코디를 우선 추천한다", () => {
    const { primary } = getOutfitRecommendations(12, "중요한 취업 면접이 있어요")
    expect(primary.style).toBe("formal")
    expect(primary.styleName).toBe("단정한 스타일")
  })

  it("사용자 상황이 '운동/러닝'일 때 편한 스타일(comfort) 코디를 우선 추천한다", () => {
    const { primary } = getOutfitRecommendations(18, "저녁에 한강 조깅 및 러닝 운동")
    expect(primary.style).toBe("comfort")
    expect(primary.styleName).toBe("편한 스타일")
  })

  it("사용자 상황이 '데이트'일 때 캐주얼 스타일(casual) 코디를 우선 추천한다", () => {
    const { primary } = getOutfitRecommendations(22, "주말 오후 소개팅 데이트")
    expect(primary.style).toBe("casual")
    expect(primary.styleName).toBe("캐주얼")
  })

  it("특정 스타일을 명시적으로 선택하면 해당 스타일 코디가 primary로 반환된다", () => {
    const { primary } = getOutfitRecommendations(7, null, "formal")
    expect(primary.style).toBe("formal")
  })
})
