import { describe, it, expect } from "vitest"
import { getDefaultSmartCropBox } from "@/lib/utils/image-processing"

describe("의류 상품 이미지 정제 및 쇼핑몰 UI 크롭 유틸리티", () => {
  it("세로로 긴 쇼핑몰 캡처(비율 < 0.9)인 경우 하단 뱃지/하트 UI 영역을 스마트하게 제외한다", () => {
    // 세로형 쇼핑몰 이미지 (예: 600x900, ratio = 0.66)
    const cropBox = getDefaultSmartCropBox(0.66)

    expect(cropBox.ymin).toBeGreaterThanOrEqual(10)
    // 하단 10~15% 제외 (ymax가 865 수준으로 설정되어 하트/무신사 뱃지 제외)
    expect(cropBox.ymax).toBeLessThan(900)
    expect(cropBox.xmax).toBeGreaterThan(950)
  })

  it("정방형 이미지(비율 >= 0.9)인 경우 전체 여백을 유지한다", () => {
    const cropBox = getDefaultSmartCropBox(1.0)
    expect(cropBox.ymax).toBeGreaterThan(950)
  })
})
