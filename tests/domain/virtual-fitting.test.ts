import { describe, it, expect } from "vitest"
import { applyNaturalLanguageEdit, VIRTUAL_FITTING_DISCLAIMER } from "@/lib/domain/virtual-fitting"
import { ClosetItem } from "@/lib/domain/closet-types"

describe("가상 피팅 및 자연어 코디 편집 (virtual-fitting)", () => {
  const mockItem: ClosetItem = {
    id: "source-tshirt-1",
    userId: "user_test",
    name: "화이트 반팔 티셔츠",
    category: "top",
    colors: ["화이트"],
    pattern: "무지",
    style: "casual",
    seasons: ["summer"],
    thickness: "thin",
    warmth: "low",
    isAttributeConfirmed: true,
    originalImageUrl: "mock-url.jpg",
    noBgImageUrl: "mock-nobg.png",
    activeImageMode: "nobg",
    isFavorite: false,
    wearCount: 0,
    lastWornDate: null,
    createdAt: "",
    updatedAt: "",
  }

  it("가상 피팅 안내문구가 정확히 정의되어 있다 (과장/보장 방지)", () => {
    expect(VIRTUAL_FITTING_DISCLAIMER).toContain("시뮬레이션용 참고 미리보기")
    expect(VIRTUAL_FITTING_DISCLAIMER).toContain("실제 체형에 따른 정확한 치수나 착용감(핏)을 보증하지 않습니다")
  })

  it("자연어 색상 변경 요청 시 원본 옷은 절대 수정하지 않고 별도의 VirtualEditResult를 생성한다", async () => {
    const originalColorsCopy = [...mockItem.colors]
    const result = await applyNaturalLanguageEdit(mockItem, "이 티셔츠를 파란색으로 바꿔줘")

    // 원본 객체 불변성 검증
    expect(mockItem.colors).toEqual(originalColorsCopy)
    expect(mockItem.id).toBe("source-tshirt-1")

    // 편집 결과 검증
    expect(result.sourceItemId).toBe("source-tshirt-1")
    expect(result.diffSummary).toContain("파란색")
    expect(result.modifiedImageUrl).toBeDefined()
  })

  it("자연어 소매 길이 변경 요청 시 형태 변경 요약이 포함된다", async () => {
    const result = await applyNaturalLanguageEdit(mockItem, "소매를 긴팔 스타일로 변경해줘")
    expect(result.diffSummary).toContain("긴팔")
  })
})
