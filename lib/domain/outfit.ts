import { CategorizedOutfitText, PrecipitationType } from "./types"

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

/**
 * 기온, 강수, 상황에 따른 아우터·상의·하의·신발 부위별 텍스트 안내 생성
 * - 브랜드나 상품명 배제, 일반적인 옷 종류 중심 설명
 */
export function getCategorizedOutfit(
  temperature: number,
  precipitationType?: PrecipitationType,
  situation?: string | null,
): CategorizedOutfitText {
  const isRain = precipitationType === "rain" || precipitationType === "mixed"
  const isSnow = precipitationType === "snow"
  const sitLower = (situation || "").toLowerCase()
  const isFormal = sitLower.includes("출근") || sitLower.includes("면접") || sitLower.includes("격식")
  const isSport = sitLower.includes("운동") || sitLower.includes("산책") || sitLower.includes("러닝")

  if (temperature < 0) {
    return {
      outer: isFormal ? "두꺼운 헤비 울 롱코트 또는 패딩" : isSport ? "방풍 기능성 패딩 점퍼" : "두꺼운 롱패딩, 헤비 다운 외투",
      top: "도톰한 긴팔 니트, 목폴라 스웨터",
      bottom: isFormal ? "보온용 기모 슬랙스" : "기모 바지, 두꺼운 데님 팬츠",
      shoes: isSnow ? "미끄럼 방지 방한 부츠" : "발끝 체온을 지켜주는 방한화, 가죽 부츠",
    }
  }

  if (temperature < 5) {
    return {
      outer: isFormal ? "울 롱코트, 패딩 코트" : "숏패딩 또는 두꺼운 울 코트",
      top: "포근한 긴팔 니트, 스웨터",
      bottom: isFormal ? "도톰한 슬랙스" : "도톰한 청바지, 기모 바지",
      shoes: isRain ? "방수 레인부츠 또는 방수화" : "가죽 부츠, 도톰한 양말과 운동화",
    }
  }

  if (temperature < 10) {
    return {
      outer: isFormal ? "클래식 싱글 코트" : isSport ? "바람막이와 플리스" : "울 코트, 가죽 재킷",
      top: "긴소매 맨투맨, 가벼운 니트",
      bottom: isFormal ? "단정한 슬랙스" : "일반 청바지, 면바지",
      shoes: isRain ? "방수화 또는 어두운 가죽화" : "데일리 스니커즈, 로퍼",
    }
  }

  if (temperature < 15) {
    return {
      outer: isFormal ? "단정한 테일러드 블레이저, 트렌치코트" : "간절기 재킷, 트러커, 트렌치코트",
      top: "셔츠, 롱슬리브 긴소매 티셔츠",
      bottom: isFormal ? "슬랙스" : "치노 면바지, 청바지",
      shoes: "단정한 로퍼, 스니커즈",
    }
  }

  if (temperature < 20) {
    return {
      outer: isSport ? "가벼운 윈드브레이커" : "가벼운 가디건, 얇은 재킷",
      top: "긴소매 셔츠, 얇은 긴팔 티셔츠",
      bottom: "슬랙스, 얇은 청바지",
      shoes: "가벼운 스니커즈, 단화",
    }
  }

  if (temperature < 28) {
    return {
      outer: "실내 냉방 대비용 얇은 겉옷 (선택)",
      top: "통기성 좋은 반팔 티셔츠, 린넨 셔츠",
      bottom: "통풍이 잘되는 면바지, 린넨 팬츠",
      shoes: isRain ? "레인슈즈 또는 아쿠아슈즈" : "가벼운 운동화, 슬립온",
    }
  }

  // 28℃ 이상
  return {
    outer: "직사광선 차단용 얇은 셔츠 (선택)",
    top: "시원한 린넨 반팔, 통기성 면 티셔츠",
    bottom: "시원한 반바지(쇼츠), 얇은 린넨 바지",
    shoes: "통풍이 잘되는 샌들, 가벼운 통기성 슈즈",
  }
}

