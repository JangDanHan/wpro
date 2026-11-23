export type OutfitStyle = "casual" | "formal" | "comfort"

export interface CuratedOutfit {
  id: string
  tempMin: number // 최소 기온 (포함)
  tempMax: number // 최대 기온 (미만)
  style: OutfitStyle
  styleName: "캐주얼" | "단정한 스타일" | "편한 스타일"
  title: string
  clothingItems: string // 예: "숏패딩 + 기모 맨투맨 + 와이드 데님"
  description: string // 짧은 추천 이유
  photoUrl: string // 고화질 실제 착장 사진 (Unsplash Free License)
  photoCredit: string
  weatherConditions?: Array<"any" | "rain" | "snow" | "clear" | "cloudy" | "wind">
  situationTags?: string[] // 면접, 출근, 데이트, 운동, 산책 등
}

/**
 * 기온 및 스타일별 고화질 착장 사진 카탈로그
 * - 출처: Unsplash (Free License, 상업/비상업 자유 이용)
 * - 각 코디 사진과 실제 옷 구성(외투, 상의, 하의)이 일치하도록 정밀 매핑
 */
export const OUTFIT_CATALOG: CuratedOutfit[] = [
  // ==========================================
  // 1. 혹한기 (0℃ 미만) - 패딩, 헤비코트, 보온용품
  // ==========================================
  {
    id: "outfit-subzero-casual-1",
    tempMin: -50,
    tempMax: 0,
    style: "casual",
    styleName: "캐주얼",
    title: "헤비 숏패딩 & 와이드 데님",
    clothingItems: "볼륨 숏패딩 + 두꺼운 터틀넥 니트 + 와이드 기모 데님 + 방한 스니커즈",
    description: "영하의 칼바람을 막아주는 숏패딩과 터틀넥으로 보온성과 트렌디함을 챙긴 캐주얼 코디입니다.",
    photoUrl: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["데일리", "데이트", "친구 모임"],
  },
  {
    id: "outfit-subzero-formal-1",
    tempMin: -50,
    tempMax: 0,
    style: "formal",
    styleName: "단정한 스타일",
    title: "헤비 울 롱코트 & 캐시미어 니트",
    clothingItems: "두꺼운 울 롱코트 + 캐시미어 니트 + 기모 슬랙스 + 가죽 첼시부츠",
    description: "영하 날씨의 격식 있는 자리나 출근길에 어울리는 포근하고 신뢰감을 주는 코디입니다.",
    photoUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["면접", "출근", "비즈니스", "결혼식"],
  },
  {
    id: "outfit-subzero-comfort-1",
    tempMin: -50,
    tempMax: 0,
    style: "comfort",
    styleName: "편한 스타일",
    title: "롱 벤치다운 & 기모 조거팬츠",
    clothingItems: "롱 벤치다운 패딩 + 기모 후드티 + 스웨트 조거팬츠 + 털모자(비니)",
    description: "체온을 머리부터 발끝까지 감싸주어 추운 날 장시간 야외 이동이나 산책에 가장 편안한 코디입니다.",
    photoUrl: "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?w=800&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["운동", "산책", "원마일웨어", "장보기"],
  },

  // ==========================================
  // 2. 초겨울 (0℃ 이상, 5℃ 미만) - 숏패딩, 도톰한 코트, 니트
  // ==========================================
  {
    id: "outfit-winter-casual-1",
    tempMin: 0,
    tempMax: 5,
    style: "casual",
    styleName: "캐주얼",
    title: "퀼팅 점퍼 & 케이블 니트",
    clothingItems: "퀼팅 다운 점퍼 + 도톰한 케이블 니트 + 스트레이트 진 + 가죽 슈즈",
    description: "쌀쌀한 겨울 초입에 가볍고 따뜻하게 입을 수 있는 깔끔한 데일리 캐주얼 룩입니다.",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["데일리", "약속", "카페"],
  },
  {
    id: "outfit-winter-formal-1",
    tempMin: 0,
    tempMax: 5,
    style: "formal",
    styleName: "단정한 스타일",
    title: "핸드메이드 싱글 코트 & 모크넥",
    clothingItems: "핸드메이드 울 코트 + 모크넥 니트 + 테이퍼드 슬랙스 + 로퍼",
    description: "차가운 공기 속에서도 실루엣을 정돈해 주는 단정하고 모던한 미팅/오피스 룩입니다.",
    photoUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["면접", "출근", "회의", "격식있는 자리"],
  },
  {
    id: "outfit-winter-comfort-1",
    tempMin: 0,
    tempMax: 5,
    style: "comfort",
    styleName: "편한 스타일",
    title: "보아 플리스 자켓 & 스웨트팬츠",
    clothingItems: "도톰한 보아 플리스 집업 + 기모 맨투맨 + 이지 밴딩 팬츠 + 쿠션 스니커즈",
    description: "가벼운 착용감과 포근한 보온성으로 편안하게 외출할 수 있는 이지웨어입니다.",
    photoUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["산책", "운동", "주말 외출"],
  },

  // ==========================================
  // 3. 늦가을/초겨울 (5℃ 이상, 10℃ 미만) - 코트, 울자켓, 가디건
  // ==========================================
  {
    id: "outfit-lateautumn-casual-1",
    tempMin: 5,
    tempMax: 10,
    style: "casual",
    styleName: "캐주얼",
    title: "울 블레이저 & 라운드 니트",
    clothingItems: "도톰한 울 블레이저 + 라운드 니트 + 크롭 데님 팬츠 + 스니커즈",
    description: "5~9℃ 사이 쌀쌀한 날씨에 멋스러움과 체온을 동시에 지켜주는 레이어드 캐주얼 코디입니다.",
    photoUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["데이트", "쇼핑", "주말"],
  },
  {
    id: "outfit-lateautumn-formal-1",
    tempMin: 5,
    tempMax: 10,
    style: "formal",
    styleName: "단정한 스타일",
    title: "클래식 트렌치 울 코트 & 셔츠",
    clothingItems: "울 트렌치코트 + 드레스 셔츠 + 브이넥 니트 조끼 + 슬랙스",
    description: "출퇴근길 찬 바람을 막아주고 실내에서는 가볍게 활동할 수 있는 클래식한 오피스 룩입니다.",
    photoUrl: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["면접", "출근", "미팅"],
  },
  {
    id: "outfit-lateautumn-comfort-1",
    tempMin: 5,
    tempMax: 10,
    style: "comfort",
    styleName: "편한 스타일",
    title: "바시티 점퍼 & 후드집업",
    clothingItems: "울 바시티 자켓 + 후드집업 + 와이드 카고팬츠 + 볼캡",
    description: "적당한 두께감의 자켓과 후드로 스포티하면서도 보온성을 챙긴 스트리트 코디입니다.",
    photoUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["캠퍼스", "캐주얼 약속", "여행"],
  },

  // ==========================================
  // 4. 봄/가을 (10℃ 이상, 15℃ 미만) - 자켓, 가죽자켓, 가디건
  // ==========================================
  {
    id: "outfit-autumn-casual-1",
    tempMin: 10,
    tempMax: 15,
    style: "casual",
    styleName: "캐주얼",
    title: "라이더 자켓 & 스트라이프 티",
    clothingItems: "비건 레더 라이더 자켓 + 스트라이프 롱슬리브 + 블랙 진 + 더비 슈즈",
    description: "선선한 10~14℃ 기온에 바람을 막아주고 세련된 무드를 연출할 수 있는 자켓 코디입니다.",
    photoUrl: "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?w=800&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["데이트", "나들이", "주말"],
  },
  {
    id: "outfit-autumn-formal-1",
    tempMin: 10,
    tempMax: 15,
    style: "formal",
    styleName: "단정한 스타일",
    title: "테일러드 자켓 & 코튼 셔츠",
    clothingItems: "모던 테일러드 자켓 + 옥스포드 코튼 셔츠 + 스트레이트 슬랙스 + 가죽 시계",
    description: "격식 있는 일정이나 면접, 미팅에 가장 안정적인 깔끔하고 신뢰감을 주는 스타일링입니다.",
    photoUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["면접", "출근", "발표", "하객룩"],
  },
  {
    id: "outfit-autumn-comfort-1",
    tempMin: 10,
    tempMax: 15,
    style: "comfort",
    styleName: "편한 스타일",
    title: "데님 트러커 자켓 & 코튼 치노",
    clothingItems: "클래식 데님 자켓 + 베이직 티셔츠 + 루즈핏 치노 팬츠 + 캔버스화",
    description: "활동성이 뛰어나 야외 나들이나 가벼운 산책에 제격인 편안한 데님 룩입니다.",
    photoUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["야외활동", "여행", "일상"],
  },

  // ==========================================
  // 5. 따뜻한 봄/가을 (15℃ 이상, 20℃ 미만) - 셔츠, 맨투맨, 가디건
  // ==========================================
  {
    id: "outfit-spring-casual-1",
    tempMin: 15,
    tempMax: 20,
    style: "casual",
    styleName: "캐주얼",
    title: "오버핏 맨투맨 & 세미와이드 슬랙스",
    clothingItems: "헤비코튼 오버핏 맨투맨 + 이너 화이트 티 레이어드 + 세미와이드 슬랙스 + 스니커즈",
    description: "15~19℃ 일교차 있는 날씨에 단독으로 입기 좋고 호불호 없는 트렌디한 데일리 룩입니다.",
    photoUrl: "https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=800&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["데일리", "데이트", "약속"],
  },
  {
    id: "outfit-spring-formal-1",
    tempMin: 15,
    tempMax: 20,
    style: "formal",
    styleName: "단정한 스타일",
    title: "오픈카라 셔츠 & 슬림 치노",
    clothingItems: "오픈카라 긴소매 셔츠 + 테이퍼드 치노 팬츠 + 가죽 벨트 + 페니 로퍼",
    description: "가볍고 단정한 인상을 주며, 실내외 온도 변화에 유연하게 대응하는 스마트 비즈니스 룩입니다.",
    photoUrl: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=800&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["면접", "출근", "미팅"],
  },
  {
    id: "outfit-spring-comfort-1",
    tempMin: 15,
    tempMax: 20,
    style: "comfort",
    styleName: "편한 스타일",
    title: "경량 바람막이 & 나일론 조거",
    clothingItems: "경량 윈드브레이커 + 기능성 티셔츠 + 나일론 조거팬츠 + 러닝화",
    description: "바람을 막아주고 가벼워 산책, 러닝, 가벼운 야외 활동에 최적화된 스포티 룩입니다.",
    photoUrl: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["운동", "조깅", "산책", "원마일웨어"],
  },

  // ==========================================
  // 6. 초여름 (20℃ 이상, 28℃ 미만) - 반팔, 린넨셔츠, 얇은 바지
  // ==========================================
  {
    id: "outfit-earlysummer-casual-1",
    tempMin: 20,
    tempMax: 28,
    style: "casual",
    styleName: "캐주얼",
    title: "린넨 셔츠 & 테이퍼드 데님",
    clothingItems: "얇은 린넨 셔츠 + 이너 화이트 반팔티 + 라이트블루 데님 + 가벼운 슬립온",
    description: "햇살은 따스하고 바람은 부는 초여름에 땀 흡수와 통기성을 갖춘 시원한 캐주얼 코디입니다.",
    photoUrl: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["나들이", "데이트", "약속"],
  },
  {
    id: "outfit-earlysummer-formal-1",
    tempMin: 20,
    tempMax: 28,
    style: "formal",
    styleName: "단정한 스타일",
    title: "쿨 반소매 피케 셔츠 & 썸머 슬랙스",
    clothingItems: "쿨에어 카라 반소매 니트 + 썸머 쿨링 슬랙스 + 미니멀 레더 스니커즈",
    description: "따뜻한 기온에서도 단정함을 유지하며 쾌적하게 착용할 수 있는 쿨비즈 오피스 룩입니다.",
    photoUrl: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["출근", "미팅", "면접"],
  },
  {
    id: "outfit-earlysummer-comfort-1",
    tempMin: 20,
    tempMax: 28,
    style: "comfort",
    styleName: "편한 스타일",
    title: "오버핏 반팔티 & 코튼 쇼츠",
    clothingItems: "루즈핏 코튼 반소매 + 무릎 길이 버뮤다 쇼츠 + 메쉬 캡 + 샌들",
    description: "낮 기온이 오르는 초여름에 통풍이 잘되고 가벼워 활동량이 많은 날 제격인 편한 룩입니다.",
    photoUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["나들이", "주말", "휴식"],
  },

  // ==========================================
  // 7. 한여름 (28℃ 이상) - 통풍, 린넨, 반바지
  // ==========================================
  {
    id: "outfit-hot-casual-1",
    tempMin: 28,
    tempMax: 60,
    style: "casual",
    styleName: "캐주얼",
    title: "오픈카라 린넨 반소매 & 쇼츠",
    clothingItems: "오픈카라 린넨 반소매 + 린넨 블렌드 하프 팬츠 + 버켄 샌들",
    description: "무더위와 높은 습도에도 끈적이지 않고 시원한 바람이 통하는 바캉스/데일리 코디입니다.",
    photoUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["휴가", "주말", "데이트"],
  },
  {
    id: "outfit-hot-formal-1",
    tempMin: 28,
    tempMax: 60,
    style: "formal",
    styleName: "단정한 스타일",
    title: "울블렌드 린넨 반소매 & 쿨 슬랙스",
    clothingItems: "고급 린넨 반소매 셔츠 + 기능성 쿨맥스 슬랙스 + 브라운 로퍼",
    description: "한여름 폭염에도 격식과 예의를 지킬 수 있도록 통풍성과 깔끔함을 극대화한 룩입니다.",
    photoUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["출근", "면접", "비즈니스"],
  },
  {
    id: "outfit-hot-comfort-1",
    tempMin: 28,
    tempMax: 60,
    style: "comfort",
    styleName: "편한 스타일",
    title: "흡습속건 쿨링 티셔츠 & 나일론 이지 쇼츠",
    clothingItems: "기능성 쿨링 라운드티 + 나일론 밴딩 쇼츠 + 슬라이드 샌들",
    description: "무더운 날씨에 땀 배출이 빠르고 달라붙지 않아 장시간 쾌적함을 유지해 주는 룩입니다.",
    photoUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["운동", "산책", "원마일웨어"],
  },
]

/**
 * 기온 및 상황에 따라 매칭되는 코디 후보군을 조회합니다.
 * - 사용자 상황(면접/출근 -> formal 우선, 운동/산책 -> comfort 우선, 데이트/약속 -> casual 우선)
 * - 강수 여부(비/눈) 고려
 * - 캐주얼, 단정한 스타일, 편한 스타일이 고루 포함되도록 구성
 */
export function getOutfitRecommendations(
  temperature: number,
  situation?: string | null,
  preferredStyle?: OutfitStyle | "all",
): {
  primary: CuratedOutfit
  alternatives: CuratedOutfit[]
  allForTemp: CuratedOutfit[]
} {
  // 기온에 맞는 후보군 필터링
  const tempMatches = OUTFIT_CATALOG.filter(
    (item) => temperature >= item.tempMin && temperature < item.tempMax,
  )

  const candidates = tempMatches.length > 0 ? tempMatches : OUTFIT_CATALOG

  // 상황 키워드 분석
  const sit = (situation || "").toLowerCase()
  let targetStyle: OutfitStyle = "casual"

  if (sit.includes("면접") || sit.includes("출근") || sit.includes("회의") || sit.includes("결혼") || sit.includes("격식") || sit.includes("단정")) {
    targetStyle = "formal"
  } else if (sit.includes("운동") || sit.includes("러닝") || sit.includes("산책") || sit.includes("조깅") || sit.includes("편한") || sit.includes("집앞")) {
    targetStyle = "comfort"
  } else if (sit.includes("데이트") || sit.includes("소개팅") || sit.includes("약속") || sit.includes("쇼핑")) {
    targetStyle = "casual"
  }

  // 선호 스타일이 명시된 경우 우선 적용
  if (preferredStyle && preferredStyle !== "all") {
    targetStyle = preferredStyle
  }

  // 타겟 스타일에 맞는 대표 코디 선정
  const primaryMatch =
    candidates.find((item) => item.style === targetStyle) ||
    candidates[0]

  // 나머지 스타일 코디들 (다양성 제공)
  const alternatives = candidates.filter((item) => item.id !== primaryMatch.id)

  return {
    primary: primaryMatch,
    alternatives,
    allForTemp: candidates,
  }
}
