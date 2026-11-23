import {
  ClosetItem,
  ClosetOutfitRecommendation,
  ClosetOutfitBoardItem,
  ClothingCategory,
  MissingCategoryAdvice,
} from "@/lib/domain/closet-types"
import { ValidatedWeatherData } from "@/lib/domain/types"

export interface RecommendFromClosetParams {
  clothes: ClosetItem[]
  weather: ValidatedWeatherData
  situation?: string
  pinnedItemIds?: string[]
  yesterdayWornItemIds?: string[]
  variationIndex?: number
}

/**
 * 기온별 필요한 카테고리 및 추천 가이드
 */
interface TempRequirement {
  needsOuter: boolean
  outerDesc?: string
  topDesc: string
  bottomDesc: string
  preferredWarmth: ("low" | "medium" | "high")[]
  preferredThickness: ("thin" | "medium" | "thick")[]
}

function getTempRequirement(temp: number): TempRequirement {
  if (temp <= 4) {
    return {
      needsOuter: true,
      outerDesc: "두꺼운 패딩 또는 헤비 울 코트",
      topDesc: "보온성 높은 두꺼운 니트, 기모 상의",
      bottomDesc: "방한 기모 팬츠 또는 두터운 슬랙스/청바지",
      preferredWarmth: ["high", "medium"],
      preferredThickness: ["thick", "medium"],
    }
  } else if (temp <= 9) {
    return {
      needsOuter: true,
      outerDesc: "울 코트, 누빔 자켓, 가죽 자켓",
      topDesc: "니트 또는 셔츠+가디건 레이어드",
      bottomDesc: "세미와이드 슬랙스 또는 데님 팬츠",
      preferredWarmth: ["high", "medium"],
      preferredThickness: ["medium", "thick"],
    }
  } else if (temp <= 16) {
    return {
      needsOuter: true,
      outerDesc: "트렌치코트, 블레이저 자켓, 바람막이, 도톰한 가디건",
      topDesc: "맨투맨, 긴팔 티셔츠, 셔츠",
      bottomDesc: "슬랙스, 데님, 코튼 팬츠",
      preferredWarmth: ["medium", "low"],
      preferredThickness: ["medium", "thin"],
    }
  } else if (temp <= 22) {
    return {
      needsOuter: false,
      topDesc: "긴팔 셔츠, 얇은 니트, 칠부 티셔츠",
      bottomDesc: "코튼 팬츠, 청바지, 슬랙스",
      preferredWarmth: ["medium", "low"],
      preferredThickness: ["thin", "medium"],
    }
  } else if (temp <= 27) {
    return {
      needsOuter: false,
      topDesc: "반팔 티셔츠, 얇은 린넨 셔츠",
      bottomDesc: "통기성 슬랙스, 린넨 팬츠, 반바지",
      preferredWarmth: ["low"],
      preferredThickness: ["thin"],
    }
  } else {
    return {
      needsOuter: false,
      topDesc: "통기성 좋은 반팔, 민소매, 린넨 상의",
      bottomDesc: "반바지, 시원한 린넨 팬츠",
      preferredWarmth: ["low"],
      preferredThickness: ["thin"],
    }
  }
}

/**
 * 사용자 옷장(보유 의류) 기반 날씨·상황 맞춤 코디 추천 알고리즘
 */
export function recommendOutfitFromCloset(params: RecommendFromClosetParams): ClosetOutfitRecommendation {
  const {
    clothes,
    weather,
    situation = "",
    pinnedItemIds = [],
    yesterdayWornItemIds = [],
    variationIndex = 0,
  } = params

  const temp = weather.temperature
  const apparentTemp = weather.apparentTemp ?? weather.temperature
  const effectiveTemp = Math.min(temp, apparentTemp)
  const isRainOrSnow = weather.precipitationType === "rain" || weather.precipitationType === "snow" || weather.precipitationType === "mixed"

  const req = getTempRequirement(effectiveTemp)
  const situationLower = situation.toLowerCase()

  // 1. 후보 의류 필터링 (가상 편집본 제외, 어제 입은 옷 제외 요청 시 필터링)
  const excludeYesterday =
    situationLower.includes("어제") &&
    (situationLower.includes("빼") || situationLower.includes("제외") || situationLower.includes("말고"))

  let candidateClothes = clothes.filter((item) => !item.isVirtualEdit)

  if (excludeYesterday && yesterdayWornItemIds.length > 0) {
    candidateClothes = candidateClothes.filter((item) => !yesterdayWornItemIds.includes(item.id))
  }

  // 2. 상황별 선호 스타일 판별
  let preferredStyle: string | null = null
  if (
    situationLower.includes("출근") ||
    situationLower.includes("면접") ||
    situationLower.includes("격식") ||
    situationLower.includes("비즈니스") ||
    situationLower.includes("단정")
  ) {
    preferredStyle = "formal"
  } else if (
    situationLower.includes("데이트") ||
    situationLower.includes("소개팅") ||
    situationLower.includes("약속")
  ) {
    preferredStyle = "dandy" // 또는 feminine/minimal
  } else if (
    situationLower.includes("운동") ||
    situationLower.includes("러닝") ||
    situationLower.includes("등산")
  ) {
    preferredStyle = "sporty"
  } else if (
    situationLower.includes("편안") ||
    situationLower.includes("동네") ||
    situationLower.includes("산책")
  ) {
    preferredStyle = "casual"
  }

  // 3. 고정(Pinned) 아이템 분리
  const pinnedItems = candidateClothes.filter((item) => pinnedItemIds.includes(item.id))
  const pinnedCategories = new Set(pinnedItems.map((item) => item.category))

  // 아이템 선호도 점수 산출 함수
  function scoreItem(item: ClosetItem): number {
    let score = 0

    // 계절 적합도
    if (effectiveTemp <= 9 && (item.seasons.includes("winter") || item.seasons.includes("all"))) {
      score += 4
    } else if (effectiveTemp > 9 && effectiveTemp <= 22 && (item.seasons.includes("spring") || item.seasons.includes("autumn") || item.seasons.includes("all"))) {
      score += 4
    } else if (effectiveTemp > 22 && (item.seasons.includes("summer") || item.seasons.includes("all"))) {
      score += 4
    }

    // 보온성/두께 점수
    if (req.preferredWarmth.includes(item.warmth)) score += 3
    if (req.preferredThickness.includes(item.thickness)) score += 2

    // 스타일 매칭
    if (preferredStyle && (item.style === preferredStyle || item.style === "minimal")) {
      score += 5
    }

    // 즐겨찾기 가산점
    if (item.isFavorite) score += 2

    // 비/눈 올 때 밝은색 하의 감점
    if (isRainOrSnow && item.category === "bottom") {
      const isBright = item.colors.some((c) => ["화이트", "아이보리", "베이지", "크림"].includes(c))
      if (isBright) score -= 3
    }

    return score
  }

  // 카테고리별 아이템 선택 헬퍼
  function pickItemForCategory(category: ClothingCategory): ClosetItem | null {
    // 사용자가 해당 카테고리를 고정해 두었다면 고정된 아이템 사용
    const pinned = pinnedItems.find((p) => p.category === category)
    if (pinned) return pinned

    const items = candidateClothes.filter((item) => item.category === category)
    if (items.length === 0) return null

    // 점수순 정렬
    const sorted = [...items].sort((a, b) => scoreItem(b) - scoreItem(a))

    // 다양성 인덱스(variationIndex) 반영 (다른 코디 추천 시 순환 선택)
    const index = variationIndex % sorted.length
    return sorted[index]
  }

  const matchedItems: ClosetOutfitBoardItem[] = []
  const missingCategories: MissingCategoryAdvice[] = []

  // 필수 부위 1: 상의 (Top) 또는 원피스 (Dress)
  const pickedTop = pickItemForCategory("top")
  const pickedDress = pickItemForCategory("dress")

  if (pickedTop) {
    matchedItems.push({
      category: "top",
      item: pickedTop,
      isPinned: pinnedItemIds.includes(pickedTop.id),
    })
  } else if (pickedDress) {
    matchedItems.push({
      category: "dress",
      item: pickedDress,
      isPinned: pinnedItemIds.includes(pickedDress.id),
    })
  } else {
    missingCategories.push({
      category: "top",
      advice: `옷장에 등록된 상의가 없습니다. (${req.topDesc} 등록 권장)`,
    })
  }

  // 필수 부위 2: 하의 (Bottom) - 원피스가 선택되지 않은 경우
  if (!pickedDress) {
    const pickedBottom = pickItemForCategory("bottom")
    if (pickedBottom) {
      matchedItems.push({
        category: "bottom",
        item: pickedBottom,
        isPinned: pinnedItemIds.includes(pickedBottom.id),
      })
    } else {
      missingCategories.push({
        category: "bottom",
        advice: `옷장에 등록된 하의가 없습니다. (${req.bottomDesc} 등록 권장)`,
      })
    }
  }

  // 필수 부위 3: 아우터 (기온에 따라 필수 여부 결정)
  if (req.needsOuter) {
    const pickedOuter = pickItemForCategory("outer")
    if (pickedOuter) {
      matchedItems.push({
        category: "outer",
        item: pickedOuter,
        isPinned: pinnedItemIds.includes(pickedOuter.id),
      })
    } else {
      missingCategories.push({
        category: "outer",
        advice: `체감온도 ${effectiveTemp.toFixed(1)}℃로 쌀쌀하지만 옷장에 적합한 아우터가 없습니다. (${req.outerDesc || "외투"} 등록 권장)`,
      })
    }
  }

  // 신발 (Shoes)
  const pickedShoes = pickItemForCategory("shoes")
  if (pickedShoes) {
    matchedItems.push({
      category: "shoes",
      item: pickedShoes,
      isPinned: pinnedItemIds.includes(pickedShoes.id),
    })
  }

  // 가방 또는 잡화 (선택적)
  const pickedBag = pickItemForCategory("bag")
  if (pickedBag && matchedItems.length < 5) {
    matchedItems.push({
      category: "bag",
      item: pickedBag,
      isPinned: pinnedItemIds.includes(pickedBag.id),
    })
  }

  // 추천 이유 문장 생성
  let title = `${effectiveTemp.toFixed(0)}℃ 맞춤 내 옷장 코디`
  if (situation) {
    title = `'${situation.trim()}' 맞춤 내 옷장 코디`
  }

  const reasons: string[] = []
  reasons.push(`현재 기온은 ${temp.toFixed(1)}℃(체감 ${apparentTemp.toFixed(1)}℃)입니다.`)
  if (req.needsOuter) {
    reasons.push(`체온 유지를 위해 보온성 높은 외투와 적절한 두께의 이너를 조합했습니다.`)
  } else {
    reasons.push(`선선하고 쾌적한 날씨에 어울리는 가벼운 조합입니다.`)
  }

  if (isRainOrSnow) {
    reasons.push(`비/눈 예보가 있어 오염에 취약하지 않고 활동하기 좋은 옷을 우선 매칭했습니다.`)
  }

  if (preferredStyle) {
    reasons.push(`요청하신 분위기(${situation})에 맞추어 깔끔한 스타일의 보유 옷들을 매칭했습니다.`)
  }

  if (pinnedItems.length > 0) {
    reasons.push(`고정하신 [${pinnedItems.map((p) => p.name).join(", ")}]을 중심으로 어울리는 아이템을 완성했습니다.`)
  }

  return {
    id: `outfit_${Date.now()}`,
    title,
    matchedItems,
    missingCategories,
    recommendationReason: reasons.join(" "),
    style: (preferredStyle as any) || "casual",
    temperatureFitNote: `체감 ${apparentTemp.toFixed(1)}℃ 기준 ${req.needsOuter ? "아우터 필수 구간" : "가벼운 외출 적합"}`,
    weatherContext: {
      temp,
      apparentTemp,
      precipitation: weather.precipitationType,
      isRainOrSnow,
    },
  }
}
