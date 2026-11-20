import { describe, it, expect } from "vitest"
import { detectPrecipitation, getPrecipitationNotice } from "@/lib/domain/precipitation"

describe("Precipitation Detector (PRD F-06, EX-08, EX-09)", () => {
  it("명시적 강수 타입이 있으면 해당 값을 채택한다", () => {
    expect(detectPrecipitation({ explicitType: "rain" })).toBe("rain")
    expect(detectPrecipitation({ explicitType: "snow" })).toBe("snow")
    expect(detectPrecipitation({ explicitType: "mixed" })).toBe("mixed")
    expect(detectPrecipitation({ explicitType: "none" })).toBe("none")
  })

  it("날씨 문구에서 비, 눈, 진눈깨비를 판별한다", () => {
    expect(detectPrecipitation({ weatherDescription: "약한 비가 내림" })).toBe("rain")
    expect(detectPrecipitation({ weatherDescription: "대설주의보 눈" })).toBe("snow")
    expect(detectPrecipitation({ weatherDescription: "진눈깨비 내림" })).toBe("mixed")
  })

  it("날씨 문구에서 명확한 강수 없음을 판별한다", () => {
    expect(detectPrecipitation({ weatherDescription: "맑음" })).toBe("none")
    expect(detectPrecipitation({ weatherDescription: "구름 많음" })).toBe("none")
    expect(detectPrecipitation({ weatherDescription: "흐림" })).toBe("none")
  })

  it("정보가 없거나 모호하면 확인 불가(unknown)를 반환한다", () => {
    expect(detectPrecipitation({})).toBe("unknown")
    expect(detectPrecipitation({ weatherDescription: "" })).toBe("unknown")
  })

  it("WMO 코드와 명시 타입이 충돌하면 unknown 처리한다 (PRD 규칙 5)", () => {
    expect(detectPrecipitation({ explicitType: "rain", weatherCode: 71 /* snow */ })).toBe("unknown")
  })

  it("강수 상태별 추가 안내 문구가 정확하게 매핑된다", () => {
    expect(getPrecipitationNotice("rain")).toBe("우산과 방수 신발도 함께 준비해 보세요.")
    expect(getPrecipitationNotice("snow")).toBe("방수와 미끄럼 방지를 고려한 신발을 준비해 보세요.")
    expect(getPrecipitationNotice("mixed")).toBe("우산과 함께 방수·미끄럼 방지를 고려한 신발을 함께 준비해 보세요.")
    expect(getPrecipitationNotice("none")).toBeNull()
    expect(getPrecipitationNotice("unknown")).toBe("강수 여부를 확인할 수 없어 기온만 기준으로 추천했어요.")
  })
})
