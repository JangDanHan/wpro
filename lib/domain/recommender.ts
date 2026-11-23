import { OutfitRecommendation, ValidatedWeatherData } from "./types"
import { FIXED_DISCLAIMER, getBasicOutfit, getCategorizedOutfit } from "./outfit"
import { getPrecipitationNotice } from "./precipitation"
import { generateReason } from "./reason"

/**
 * PRD 3.3. 옷차림 추천 카드 생성기 (텍스트 중심 안내)
 * 1. 제목: ‘지금 참고할 옷차림’
 * 2. 기본 옷차림
 * 3. 아우터·상의·하의·신발 부위별 간결한 텍스트 안내
 * 4. 비·눈이 확인된 경우 강수 대비 항목
 * 5. 실제 날씨(기온·바람·강수)와 연결한 구체적인 추천 이유
 * 6. 필요한 경우 정보 누락 안내
 * 7. 고정 안내 문구
 */
export function createRecommendation(
  weather: ValidatedWeatherData,
  situation?: string | null,
): OutfitRecommendation {
  const outfitRule = getBasicOutfit(weather.temperature)
  const categorizedOutfit = getCategorizedOutfit(
    weather.temperature,
    weather.precipitationType,
    situation,
  )
  const precipitationNotice = getPrecipitationNotice(weather.precipitationType)
  const reason = generateReason(
    weather.temperature,
    outfitRule.basicOutfit,
    weather.precipitationType,
  )

  let missingNotice: string | null = null
  if (weather.weatherDescription === null && weather.rainfallAmount === null) {
    missingNotice = "날씨 상태 문구와 강수량 정보가 없습니다."
  } else if (weather.weatherDescription === null) {
    missingNotice = "날씨 상태 문구 정보가 없습니다."
  } else if (
    weather.rainfallAmount === null &&
    (weather.precipitationType === "rain" ||
      weather.precipitationType === "snow" ||
      weather.precipitationType === "mixed")
  ) {
    missingNotice = "강수량 정보 없음"
  }

  return {
    title: "지금 참고할 옷차림",
    temperature: weather.temperature,
    basicOutfit: outfitRule.basicOutfit,
    precipitationNotice,
    reason,
    fixedDisclaimer: FIXED_DISCLAIMER,
    missingNotice,
    situation,
    categorizedOutfit,
  }
}
