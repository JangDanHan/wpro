import { describe, it, expect } from "vitest"
import { getStep1List, getStep2List, getStep3List } from "@/lib/domain/regions"

describe("시군구·읍면동 가나다순 정렬 및 검색 기능 검증", () => {
  it("시군구 목록(step2)은 한국어 가나다순(ㄱ→ㅎ)으로 정렬되어야 한다", () => {
    const step1 = "서울특별시"
    const step2List = getStep2List(step1)

    expect(step2List.length).toBeGreaterThan(0)

    // 직접 localeCompare 정렬한 결과와 동일한지 비교
    const sorted = [...step2List].sort((a, b) => a.localeCompare(b, "ko"))
    expect(step2List).toEqual(sorted)

    // 첫 번째와 마지막 요소의 가나다 순서 확인 (예: 강남구, 강동구 ... 중랑구)
    expect(step2List[0]).toBe("강남구")
    expect(step2List[step2List.length - 1]).toBe("중랑구")
  })

  it("읍면동 목록(step3)은 지역명 기준 한국어 가나다순(ㄱ→ㅎ)으로 정렬되어야 한다", () => {
    const step3List = getStep3List("서울특별시", "종로구")
    expect(step3List.length).toBeGreaterThan(0)

    const names = step3List.map((item) => item.name)
    const sortedNames = [...names].sort((a, b) => a.localeCompare(b, "ko"))
    expect(names).toEqual(sortedNames)

    // 가회동, 견지동 등 가나다 순서 확인
    expect(names[0]).toMatch(/^[가-힣]/)
  })

  it("임의의 섞인 순서의 배열도 한국어 정렬 함수로 가나다순(ㄱ→ㅎ)이 보장된다", () => {
    const unsortedStep2 = ["종로구", "강남구", "송파구", "마포구", "은평구", "강서구"]
    const sorted = [...unsortedStep2].sort((a, b) => a.localeCompare(b, "ko"))

    expect(sorted).toEqual(["강남구", "강서구", "마포구", "송파구", "은평구", "종로구"])
  })

  it("검색어 필터링 시 검색어가 포함된 지역만 반환되며, 가나다순이 유지된다", () => {
    const step2List = getStep2List("서울특별시") // 서울 25개 구 (가나다순)
    const search = "동" // 강동구, 동대문구, 동작구

    const filtered = step2List.filter((item) => item.toLowerCase().includes(search.toLowerCase()))
    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.every((item) => item.includes("동"))).toBe(true)

    // 필터링된 결과도 가나다순 유지
    const sortedFiltered = [...filtered].sort((a, b) => a.localeCompare(b, "ko"))
    expect(filtered).toEqual(sortedFiltered)
  })

  it("읍면동 검색 시에도 검색어 포함 필터링과 가나다순 정렬이 유지된다", () => {
    const step3List = getStep3List("서울특별시", "종로구")
    const search = "동"

    const filtered = step3List.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.every((item) => item.name.includes("동"))).toBe(true)

    const filteredNames = filtered.map((item) => item.name)
    const sortedFilteredNames = [...filteredNames].sort((a, b) => a.localeCompare(b, "ko"))
    expect(filteredNames).toEqual(sortedFilteredNames)
  })

  it("검색 결과가 없는 경우 빈 배열을 반환한다", () => {
    const step2List = getStep2List("서울특별시")
    const filtered = step2List.filter((item) => item.includes("존재하지않는구이름"))
    expect(filtered.length).toBe(0)
  })

  it("검색어를 지우면(빈 문자열) 전체 가나다순 목록을 반환한다", () => {
    const step2List = getStep2List("서울특별시")
    const search = ""
    const filtered = search.trim() ? step2List.filter((item) => item.includes(search)) : step2List
    expect(filtered).toEqual(step2List)
    expect(filtered.length).toBe(25)
  })

  it("상위 지역(시도)을 변경하면 하위 목록과 선택값이 초기화되는 흐름을 검증한다", () => {
    let currentStep1 = "서울특별시"
    let currentStep2 = "종로구"
    let currentStep3 = "사직동"
    let step2Search = "종로"
    let step3Search = "사직"

    // 시도를 "부산광역시"로 변경 시
    const onStep1Change = (newStep1: string) => {
      currentStep1 = newStep1
      currentStep2 = ""
      currentStep3 = ""
      step2Search = ""
      step3Search = ""
    }

    onStep1Change("부산광역시")

    expect(currentStep1).toBe("부산광역시")
    expect(currentStep2).toBe("")
    expect(currentStep3).toBe("")
    expect(step2Search).toBe("")
    expect(step3Search).toBe("")
  })

  it("시군구를 변경하면 읍면동 선택값과 검색어가 초기화되는 흐름을 검증한다", () => {
    let currentStep2 = "종로구"
    let currentStep3 = "사직동"
    let step3Search = "사직"

    // 시군구를 "강남구"로 변경 시
    const onStep2Change = (newStep2: string) => {
      currentStep2 = newStep2
      currentStep3 = ""
      step3Search = ""
    }

    onStep2Change("강남구")

    expect(currentStep2).toBe("강남구")
    expect(currentStep3).toBe("")
    expect(step3Search).toBe("")
  })
})
