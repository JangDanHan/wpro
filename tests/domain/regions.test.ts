import { describe, it, expect } from "vitest"
import {
  getStep1List,
  getStep2List,
  getStep3List,
  searchKmaRegions,
  findKmaRegionById,
  isFullyQualifiedRegion,
} from "@/lib/domain/regions"

describe("KMA Official Nationwide Regions Module (전국 공식 행정구역 격자 데이터 검증)", () => {
  it("대한민국 17개 광역시·도 1단계를 모두 반환한다", () => {
    const step1 = getStep1List()
    expect(step1.length).toBe(17)
    expect(step1).toContain("서울특별시")
    expect(step1).toContain("부산광역시")
    expect(step1).toContain("세종특별자치시")
    expect(step1).toContain("제주특별자치도")
  })

  it("서울특별시의 2단계 구 목록을 올바르게 반환한다", () => {
    const seoulStep2 = getStep2List("서울특별시")
    expect(seoulStep2.length).toBe(25) // 서울 25개 자치구
    expect(seoulStep2).toContain("종로구")
    expect(seoulStep2).toContain("강남구")
  })

  it("종로구의 3단계 읍·면·동 목록과 공식 격자 좌표(nx:60, ny:127)를 반환한다", () => {
    const step3 = getStep3List("서울특별시", "종로구")
    expect(step3.length).toBeGreaterThan(0)

    const sajik = step3.find((s) => s.name.includes("사직동"))
    expect(sajik).toBeDefined()
    expect(sajik?.grid.nx).toBe(60)
    expect(sajik?.grid.ny).toBe(127)
  })

  it("세종특별자치시의 특수 행정구역 구조를 올바르게 처리한다", () => {
    const sejongStep2 = getStep2List("세종특별자치시")
    expect(sejongStep2).toBeDefined()

    const sejongStep3 = getStep3List("세종특별자치시")
    expect(sejongStep3.length).toBeGreaterThan(0)
    // 세종시 대표 격자 nx: 65, ny: 104
    expect(sejongStep3[0].grid.nx).toBe(65)
    expect(sejongStep3[0].grid.ny).toBe(104)
  })

  it("동일한 이름의 지역 검색 시 전체 주소(label)로 명확히 구분한다", () => {
    const results = searchKmaRegions("사직동")
    expect(results.length).toBeGreaterThanOrEqual(2)

    const labels = results.map((r) => r.label)
    // 서울 종로구 사직동과 부산 동래구 사직동이 명확히 구분됨
    expect(labels.some((l) => l.includes("서울특별시") && l.includes("종로구"))).toBe(true)
    expect(labels.some((l) => l.includes("부산광역시") && l.includes("동래구"))).toBe(true)
  })

  it("임의로 조작된 지역 ID는 검증에 실패하여 null을 반환한다", () => {
    expect(findKmaRegionById("invalid-non-existent-region")).toBeNull()
    expect(findKmaRegionById("화성시-외계동")).toBeNull()
  })

  it("기존 3개 도시 단축 ID(seoul, gwangju, busan)의 하위 호환성을 완벽히 지원한다", () => {
    const seoul = findKmaRegionById("seoul")
    expect(seoul).toBeDefined()
    expect(seoul?.grid.nx).toBe(60)
    expect(seoul?.grid.ny).toBe(127)

    const gwangju = findKmaRegionById("gwangju")
    expect(gwangju).toBeDefined()
    expect(gwangju?.grid.nx).toBe(58)
    expect(gwangju?.grid.ny).toBe(74)

    const busan = findKmaRegionById("busan")
    expect(busan).toBeDefined()
    expect(busan?.grid.nx).toBe(98)
    expect(busan?.grid.ny).toBe(76)
  })

  it("isFullyQualifiedRegion은 읍·면·동까지 모두 선택된 경우에만 true를 반환한다", () => {
    // 1단계 시·도 단독: false
    const step1Only = findKmaRegionById("광주광역시")
    expect(isFullyQualifiedRegion(step1Only)).toBe(false)

    // 2단계 시·군·구 단독: false
    const step2Only = findKmaRegionById("서울특별시-종로구")
    expect(step2Only).toBeDefined()
    expect(isFullyQualifiedRegion(step2Only)).toBe(false)

    // 3단계 읍·면·동 완료: true
    const step3Done = findKmaRegionById("서울특별시-종로구-사직동")
    expect(isFullyQualifiedRegion(step3Done)).toBe(true)

    // null 또는 undefined: false
    expect(isFullyQualifiedRegion(null)).toBe(false)
    expect(isFullyQualifiedRegion(undefined)).toBe(false)
  })

  it("searchKmaRegions 검색 결과는 읍·면·동까지 모두 갖춘 지역만 반환한다", () => {
    const results = searchKmaRegions("광주")
    expect(results.length).toBeGreaterThan(0)
    for (const r of results) {
      expect(isFullyQualifiedRegion(r)).toBe(true)
      expect(r.path.length).toBeGreaterThanOrEqual(3)
    }
  })
})
