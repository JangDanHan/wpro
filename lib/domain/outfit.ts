export interface OutfitRule {
  id: string
  temperatureRange: string
  basicOutfit: string
}

export const FIXED_DISCLAIMER =
  "현재 날씨 기준의 참고용 추천입니다. 이후 날씨와 개인의 체감 차이는 반영하지 않습니다."

export const OUTFIT_RULES: OutfitRule[] = [
  { id: "T-01", temperatureRange: "0℃ 미만", basicOutfit: "두꺼운 외투와 보온용품" },
  { id: "T-02", temperatureRange: "0℃ 이상, 5℃ 미만", basicOutfit: "두꺼운 외투와 니트" },
  { id: "T-03", temperatureRange: "5℃ 이상, 10℃ 미만", basicOutfit: "코트와 긴소매" },
  { id: "T-04", temperatureRange: "10℃ 이상, 15℃ 미만", basicOutfit: "재킷과 긴소매" },
  { id: "T-05", temperatureRange: "15℃ 이상, 20℃ 미만", basicOutfit: "얇은 겉옷과 긴소매" },
  { id: "T-06", temperatureRange: "20℃ 이상, 28℃ 미만", basicOutfit: "얇은 상의와 가벼운 하의" },
  { id: "T-07", temperatureRange: "28℃ 이상", basicOutfit: "통풍이 잘되는 가벼운 옷" },
]

/**
 * PRD F-05. 기본 옷차림 추천
 * 기온 하나에는 정확히 하나의 기본 옷차림을 대응시킨다.
 * 경계값: 0, 5, 10, 15, 20, 28℃
 */
export function getBasicOutfit(temperature: number): OutfitRule {
  if (temperature < 0) {
    return OUTFIT_RULES[0] // T-01
  }
  if (temperature < 5) {
    return OUTFIT_RULES[1] // T-02
  }
  if (temperature < 10) {
    return OUTFIT_RULES[2] // T-03
  }
  if (temperature < 15) {
    return OUTFIT_RULES[3] // T-04
  }
  if (temperature < 20) {
    return OUTFIT_RULES[4] // T-05
  }
  if (temperature < 28) {
    return OUTFIT_RULES[5] // T-06
  }
  return OUTFIT_RULES[6] // T-07
}
