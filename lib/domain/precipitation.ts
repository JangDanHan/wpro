import { PrecipitationType } from "./types"

export interface PrecipitationDetectionInput {
  explicitType?: PrecipitationType | null
  weatherDescription?: string | null
  weatherCode?: number | null
}

/**
 * PRD F-06. 강수 상태 판단 순서
 * 1. 강수 유형 정보가 유효하면 해당 값을 사용한다.
 * 2. 강수 유형이 없더라도 확인된 날씨 상태가 명확히 비·눈·혼합을 나타내면 이를 사용한다.
 * 3. 강수 없음은 제공처의 정보에서 명확히 확인된 경우에만 적용한다.
 * 4. 정보가 없거나 해석할 수 없으면 ‘강수 여부 확인 불가’를 적용한다.
 * 5. 같은 기준 시각의 정보끼리 비·눈 또는 강수 유무가 충돌하면 ‘강수 여부 확인 불가’를 적용한다.
 */
export function detectPrecipitation(input: PrecipitationDetectionInput): PrecipitationType {
  const { explicitType, weatherDescription, weatherCode } = input

  // WMO 코드 매핑 보조 (Open-Meteo)
  let codeDerivedType: PrecipitationType | null = null
  if (typeof weatherCode === "number") {
    if (weatherCode === 0 || (weatherCode >= 1 && weatherCode <= 3) || weatherCode === 45 || weatherCode === 48) {
      codeDerivedType = "none"
    } else if (
      (weatherCode >= 51 && weatherCode <= 55) ||
      (weatherCode >= 61 && weatherCode <= 65) ||
      (weatherCode >= 80 && weatherCode <= 82) ||
      weatherCode === 95
    ) {
      codeDerivedType = "rain"
    } else if (
      (weatherCode >= 71 && weatherCode <= 77) ||
      weatherCode === 85 ||
      weatherCode === 86
    ) {
      codeDerivedType = "snow"
    } else if (
      weatherCode === 56 ||
      weatherCode === 57 ||
      weatherCode === 66 ||
      weatherCode === 67 ||
      weatherCode === 96 ||
      weatherCode === 99
    ) {
      codeDerivedType = "mixed"
    }
  }

  // 1. 강수 유형 정보가 명시되어 있는 경우
  if (explicitType && explicitType !== "unknown") {
    // 충돌 검사 (규칙 5): codeDerivedType과 명백히 상충될 경우 unknown
    if (codeDerivedType && codeDerivedType !== "none" && explicitType !== "none" && codeDerivedType !== explicitType) {
      return "unknown"
    }
    return explicitType
  }

  if (codeDerivedType) {
    return codeDerivedType
  }

  // 2. 날씨 상태 문구 분석
  if (weatherDescription && weatherDescription.trim().length > 0) {
    const desc = weatherDescription.trim().toLowerCase()

    const hasRain = desc.includes("비") || desc.includes("소나기") || desc.includes("drizzle") || desc.includes("rain")
    const hasSnow = desc.includes("눈") || desc.includes("snow")
    const isMixed = desc.includes("진눈깨비") || desc.includes("sleet") || (hasRain && hasSnow)

    if (isMixed) return "mixed"
    if (hasRain) return "rain"
    if (hasSnow) return "snow"

    // 3. 강수 없음이 명확히 확인된 경우
    const isClear = desc.includes("맑음") || desc.includes("구름") || desc.includes("흐림") || desc.includes("안개") || desc.includes("clear") || desc.includes("cloud")
    if (isClear) return "none"
  }

  // 4. 정보가 없거나 해석할 수 없음
  return "unknown"
}

/**
 * PRD F-06. 강수 상태별 추가 안내 문구
 */
export function getPrecipitationNotice(type: PrecipitationType): string | null {
  switch (type) {
    case "rain":
      return "우산과 방수 신발도 함께 준비해 보세요."
    case "snow":
      return "방수와 미끄럼 방지를 고려한 신발을 준비해 보세요."
    case "mixed":
      return "우산과 함께 방수·미끄럼 방지를 고려한 신발을 함께 준비해 보세요."
    case "none":
      return null
    case "unknown":
      return "강수 여부를 확인할 수 없어 기온만 기준으로 추천했어요."
  }
}
