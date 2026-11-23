import { OutfitRecommendation, ValidatedWeatherData } from "./types"
import { FIXED_DISCLAIMER, getBasicOutfit } from "./outfit"
import { getPrecipitationNotice } from "./precipitation"
import { generateReason } from "./reason"
import {
  getMusinsaSnapRecommendations,
  TARGET_MUSINSA_PROFILE_URL,
} from "./musinsa-snap-catalog"

/**
 * PRD 3.3. 옷차림 추천 카드 생성기
 * 1. 제목: ‘지금 참고할 옷차림’
 * 2. 기본 옷차림
 * 3. 비·눈이 확인된 경우 강수 대비 항목
 * 4. 실제 날씨와 연결한 추천 이유
 * 5. 필요한 경우 정보 누락 안내
 * 6. 무신사 스냅 실제 코디 게시물(단일 완성 룩) 매핑
 * 7. 무신사 원문 연결 URL 및 비공식 안내 고지
 */
export function createRecommendation(
  weather: ValidatedWeatherData,
  situation?: string | null,
): OutfitRecommendation {
  const outfitRule = getBasicOutfit(weather.temperature)
  const precipitationNotice = getPrecipitationNotice(weather.precipitationType)
  const reason = generateReason(
    weather.temperature,
    outfitRule.basicOutfit,
    weather.precipitationType,
  )

  const { primary, alternatives } = getMusinsaSnapRecommendations(
    weather.temperature,
    situation,
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
    snapPostId: primary.snapId,
    snapUrl: primary.postUrl,
    musinsaProfileUrl: TARGET_MUSINSA_PROFILE_URL,
    clothingItems: primary.clothingItems,
    style: primary.style,
    styleName: primary.styleName,
    productItems: primary.productItems,
    alternativeOutfits: alternatives.map((alt) => ({
      id: alt.id,
      snapPostId: alt.snapId,
      snapUrl: alt.postUrl,
      style: alt.style,
      styleName: alt.styleName,
      title: alt.title,
      clothingItems: alt.clothingItems,
      description: alt.description,
      photoUrl: alt.productItems[0]?.photoUrl || "",
      photoCredit: "Flat Lay Product Studio Cut",
      productItems: alt.productItems,
    })),
  }
}

