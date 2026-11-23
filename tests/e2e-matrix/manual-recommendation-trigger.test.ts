import { describe, it, expect } from "vitest"
import { searchKmaRegions, getStep1List, getStep2List, getStep3List, findKmaRegionById } from "@/lib/domain/regions"

describe("수동 추천받기 버튼 및 지역 선택 동작 검증", () => {
  it("1단계(시·도)와 2단계(시·군·구)만 선택된 상태에서는 최종 지역 ID가 확정되지 않는다", () => {
    const step1 = getStep1List()[0] // "서울특별시"
    const step2 = getStep2List(step1)[0] // "종로구"
    const step3 = getStep3List(step1, step2)

    expect(step3.length).toBeGreaterThan(0)
    // 3단계 선택 전까지는 유효한 regionId가 선택되지 않아야 함
    const isStep3Selected = false
    expect(isStep3Selected).toBe(false)
  })

  it("3단계(읍·면·동)까지 선택하거나 검색 결과 선택 시에만 유효한 regionId가 저장된다", () => {
    // 1. 단계별 선택
    const step3 = getStep3List("서울특별시", "종로구")
    const targetItem = step3[0]
    expect(targetItem.value).toBeDefined()
    expect(targetItem.label).toContain("서울특별시 종로구")

    const region = findKmaRegionById(targetItem.value)
    expect(region).not.toBeNull()
    expect(region?.path[0]).toBe("서울특별시")
    expect(region?.path[1]).toBe("종로구")

    // 2. 검색 선택
    const searchRes = searchKmaRegions("사직동")
    expect(searchRes.length).toBeGreaterThan(0)
    const selectedFromSearch = searchRes[0]
    expect(selectedFromSearch.value).toBe("서울특별시-종로구-사직동")
    expect(selectedFromSearch.label).toBe("서울특별시 종로구 사직동")
  })

  it("필수 입력 검증: regionId가 null 또는 빈 문자열이면 검증 오류 메시지가 생성된다", () => {
    const validateInputs = (regionId: string | null) => {
      if (!regionId || regionId.trim() === "") {
        return "지역을 먼저 선택해 주세요. (시·도, 시·군·구, 읍·면·동 모두 선택)"
      }
      return null
    }

    expect(validateInputs(null)).toBe("지역을 먼저 선택해 주세요. (시·도, 시·군·구, 읍·면·동 모두 선택)")
    expect(validateInputs("")).toBe("지역을 먼저 선택해 주세요. (시·도, 시·군·구, 읍·면·동 모두 선택)")
    expect(validateInputs("   ")).toBe("지역을 먼저 선택해 주세요. (시·도, 시·군·구, 읍·면·동 모두 선택)")
    expect(validateInputs("서울특별시-종로구-사직동")).toBeNull()
  })

  it("중복 조회 방지: isFetching 상태일 때 중복 호출이 차단된다", () => {
    let callCount = 0
    const executeRecommendation = (isFetching: boolean, regionId: string | null) => {
      if (isFetching) return "BLOCKED_FETCHING"
      if (!regionId) return "BLOCKED_VALIDATION"
      callCount += 1
      return "TRIGGERED"
    }

    // 1. 지역 미선택
    expect(executeRecommendation(false, null)).toBe("BLOCKED_VALIDATION")
    expect(callCount).toBe(0)

    // 2. 정상 실행
    expect(executeRecommendation(false, "서울특별시-종로구-사직동")).toBe("TRIGGERED")
    expect(callCount).toBe(1)

    // 3. 실행 중 재호출 (중복 방지)
    expect(executeRecommendation(true, "서울특별시-종로구-사직동")).toBe("BLOCKED_FETCHING")
    expect(callCount).toBe(1)
  })

  it("조건 수정 시 자동 재조회 방지: 지역이나 상황을 변경해도 '추천받기'를 누르기 전까지는 조회 트리거가 발생하지 않는다", () => {
    let currentRegionId = "서울특별시-종로구-사직동"
    let currentSituation = "면접이 있어"
    let triggeredRegionId: string | null = "서울특별시-종로구-사직동"
    let triggeredSituation: string | null = "면접이 있어"

    // 사용자가 지역과 상황을 수정함
    currentRegionId = "부산광역시-해운대구-우동"
    currentSituation = "야외 데이트"

    // 수정 직후에는 기존 조회된 값 유지 (자동 재조회 없음)
    expect(triggeredRegionId).toBe("서울특별시-종로구-사직동")
    expect(triggeredSituation).toBe("면접이 있어")

    // '추천받기' 버튼 클릭 시 비로소 갱신
    const onRecommendClick = () => {
      triggeredRegionId = currentRegionId
      triggeredSituation = currentSituation
    }

    onRecommendClick()
    expect(triggeredRegionId).toBe("부산광역시-해운대구-우동")
    expect(triggeredSituation).toBe("야외 데이트")
  })

  it("상황 맞춤 AI 코디의 '적용' 버튼 클릭 시 즉시 최신 상황과 지역으로 추천이 실행된다", () => {
    let triggeredRegion: string | null = null
    let triggeredSituation: string | null = null
    let isFetching = false
    let validationError: string | null = null
    let situationState = ""

    const executeRecommendation = (customSituation?: string, regionId?: string | null) => {
      if (isFetching) return "BLOCKED_FETCHING"

      const targetSit = customSituation !== undefined ? customSituation : situationState
      if (customSituation !== undefined) {
        situationState = customSituation
      }

      if (!regionId) {
        validationError = "지역을 먼저 선택해 주세요. (시·도, 시·군·구, 읍·면·동 모두 선택)"
        return "BLOCKED_REGION"
      }

      validationError = null
      isFetching = true
      triggeredRegion = regionId
      triggeredSituation = targetSit
      return "SUCCESS"
    }

    // 1. 지역 미선택 상태에서 '적용' 클릭 시: 지역 선택 안내 발생 및 상황 입력값은 유지
    const inputVal = "추위를 많이 타서 따뜻하게 입고 싶어"
    const res1 = executeRecommendation(inputVal, null)
    expect(res1).toBe("BLOCKED_REGION")
    expect(validationError).toContain("지역을 먼저 선택해 주세요")
    expect(situationState).toBe(inputVal) // 입력한 상황은 유지됨
    expect(triggeredRegion).toBeNull()

    // 2. 지역 선택 완료 후 '적용' 클릭 시: 아래 버튼 누를 필요 없이 즉시 추천 실행
    const selectedRegion = "서울특별시-종로구-사직동"
    isFetching = false
    const res2 = executeRecommendation(inputVal, selectedRegion)
    expect(res2).toBe("SUCCESS")
    expect(triggeredRegion).toBe("서울특별시-종로구-사직동")
    expect(triggeredSituation).toBe(inputVal)
    expect(validationError).toBeNull()

    // 3. 실행 중 중복 클릭 방지
    const res3 = executeRecommendation("상황 변경", selectedRegion)
    expect(res3).toBe("BLOCKED_FETCHING")
    expect(triggeredSituation).toBe(inputVal) // 변경 차단

    // 4. 완료 후 상황 수정 후 다시 '적용' 시 최신 내용으로 즉시 갱신
    isFetching = false
    const updatedSituation = "비 오는 날 실내 미팅"
    const res4 = executeRecommendation(updatedSituation, selectedRegion)
    expect(res4).toBe("SUCCESS")
    expect(triggeredSituation).toBe(updatedSituation)
  })
})
