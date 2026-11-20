import { describe, it, expect } from "vitest"
import { getBasicOutfit, OUTFIT_RULES } from "@/lib/domain/outfit"

describe("Outfit Recommender (PRD F-05, EX-14)", () => {
  it("0℃ 미만 구간 (T-01)", () => {
    expect(getBasicOutfit(-5).id).toBe("T-01")
    expect(getBasicOutfit(-0.1).id).toBe("T-01")
    expect(getBasicOutfit(-0.1).basicOutfit).toBe("두꺼운 외투와 보온용품")
  })

  it("0℃ 이상, 5℃ 미만 구간 (T-02)", () => {
    expect(getBasicOutfit(0.0).id).toBe("T-02")
    expect(getBasicOutfit(4.9).id).toBe("T-02")
    expect(getBasicOutfit(2.5).basicOutfit).toBe("두꺼운 외투와 니트")
  })

  it("5℃ 이상, 10℃ 미만 구간 (T-03)", () => {
    expect(getBasicOutfit(5.0).id).toBe("T-03")
    expect(getBasicOutfit(9.9).id).toBe("T-03")
    expect(getBasicOutfit(7).basicOutfit).toBe("코트와 긴소매")
  })

  it("10℃ 이상, 15℃ 미만 구간 (T-04)", () => {
    expect(getBasicOutfit(10.0).id).toBe("T-04")
    expect(getBasicOutfit(14.9).id).toBe("T-04")
    expect(getBasicOutfit(12).basicOutfit).toBe("재킷과 긴소매")
  })

  it("15℃ 이상, 20℃ 미만 구간 (T-05)", () => {
    expect(getBasicOutfit(15.0).id).toBe("T-05")
    expect(getBasicOutfit(19.9).id).toBe("T-05")
    expect(getBasicOutfit(17).basicOutfit).toBe("얇은 겉옷과 긴소매")
  })

  it("20℃ 이상, 28℃ 미만 구간 (T-06)", () => {
    expect(getBasicOutfit(20.0).id).toBe("T-06")
    expect(getBasicOutfit(27.9).id).toBe("T-06")
    expect(getBasicOutfit(24).basicOutfit).toBe("얇은 상의와 가벼운 하의")
  })

  it("28℃ 이상 구간 (T-07)", () => {
    expect(getBasicOutfit(28.0).id).toBe("T-07")
    expect(getBasicOutfit(35.0).id).toBe("T-07")
    expect(getBasicOutfit(28.0).basicOutfit).toBe("통풍이 잘되는 가벼운 옷")
  })

  it("모든 기온(-50℃ ~ 50℃)에서 누락 없이 항상 1개의 옷차림을 반환한다 (EX-14 완비성 검증)", () => {
    for (let temp = -50; temp <= 50; temp += 0.5) {
      const outfit = getBasicOutfit(temp)
      expect(outfit).toBeDefined()
      expect(outfit.basicOutfit).toBeTruthy()
      expect(OUTFIT_RULES.some((r) => r.id === outfit.id)).toBe(true)
    }
  })
})
