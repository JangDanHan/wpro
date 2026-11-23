export type ClothingCategory =
  | "top" // 상의 (티셔츠, 셔츠, 니트, 맨투맨, 후드 등)
  | "bottom" // 하의 (슬랙스, 청바지, 면바지, 반바지, 스커트 등)
  | "outer" // 아우터 (패딩, 코트, 자켓, 가디건, 바람막이 등)
  | "dress" // 원피스 / 점프수트
  | "shoes" // 신발 (스니커즈, 로퍼, 부츠, 샌들 등)
  | "bag" // 가방 (백팩, 숄더백, 토트백, 크로스백 등)
  | "accessory" // 잡화 (머플러, 장갑, 모자, 벨트 등)
  | "etc" // 기타

export const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  top: "상의",
  bottom: "하의",
  outer: "아우터",
  dress: "원피스",
  shoes: "신발",
  bag: "가방",
  accessory: "잡화",
  etc: "기타",
}

export type Season = "spring" | "summer" | "autumn" | "winter" | "all"

export const SEASON_LABELS: Record<Season, string> = {
  spring: "봄",
  summer: "여름",
  autumn: "가을",
  winter: "겨울",
  all: "사계절",
}

export type ClothingStyle =
  | "casual" // 캐주얼
  | "formal" // 포멀 / 비즈니스
  | "minimal" // 미니멀 / 심플
  | "street" // 스트릿
  | "sporty" // 스포티 / 애슬레저
  | "feminine" // 페미닌 / 로맨틱
  | "dandy" // 댄디 / 깔끔한 남친룩
  | "etc" // 기타

export const STYLE_LABELS: Record<ClothingStyle, string> = {
  casual: "캐주얼",
  formal: "포멀/오피스",
  minimal: "미니멀",
  street: "스트릿",
  sporty: "스포티",
  feminine: "페미닌",
  dandy: "댄디/깔끔",
  etc: "기타",
}

export type ThicknessLevel = "thin" | "medium" | "thick" // 얇음, 보통, 두꺼움
export type WarmthLevel = "low" | "medium" | "high" // 낮음, 보통, 높음

export interface ClosetItem {
  id: string
  userId: string // 사용자별 격리용 ID (기본: "default_user")
  name: string // 옷 이름 (예: 베이지 오버핏 울 니트)
  category: ClothingCategory // 카테고리
  subCategory?: string // 세부 분류 (예: 라운드넥 니트)
  colors: string[] // 주요 색상 (예: ["베이지", "아이보리"])
  pattern: string // 패턴 (예: "무지", "스트라이프", "체크", "플로럴", "그래픽")
  style: ClothingStyle // 스타일
  seasons: Season[] // 적합 계절
  
  // 소재 및 두께/보온성 (사진만으로 확실하지 않을 시 추측 여부 명시)
  material?: string // 소재 (예: 울 80%, 면 100%)
  thickness: ThicknessLevel // 두께
  warmth: WarmthLevel // 보온성
  isAttributeConfirmed: boolean // 사용자가 확인/수정 완료했는지 여부
  
  // 이미지 관리 (원본 및 배경 제거 이미지 분리)
  originalImageUrl: string // 원본 업로드 사진 (Base64 또는 URL)
  noBgImageUrl?: string // 배경 제거(누끼) 이미지
  activeImageMode: "original" | "nobg" // 현재 화면 표시용 모드
  
  // 상태 관리
  isFavorite: boolean // 즐겨찾기
  wearCount: number // 착용 횟수
  lastWornDate: string | null // 마지막 착용일 (YYYY-MM-DD)
  
  // 가상 편집 여부
  isVirtualEdit?: boolean // 자연어 가상 편집본 여부
  parentItemId?: string // 가상 편집 원본 아이템 ID
  virtualEditNote?: string // 편집 내용 (예: "파란색으로 변경")

  createdAt: string // ISO 일시
  updatedAt: string // ISO 일시
}

export interface WearRecord {
  id: string
  userId: string
  date: string // YYYY-MM-DD
  outfitId?: string
  itemIds: string[] // 해당 날짜에 착용한 옷 아이템 ID 목록
  situationNote?: string // 당시 상황/메모
  createdAt: string
}

export interface MissingCategoryAdvice {
  category: ClothingCategory
  advice: string // 부족한 이유 및 추천 조언 (예: "체감온도가 영하 2℃이지만 옷장에 두꺼운 겨울 아우터가 없어요.")
}

export interface ClosetOutfitBoardItem {
  category: ClothingCategory
  item: ClosetItem
  isPinned?: boolean // 사용자가 고정한 옷인지 여부
}

export interface ClosetOutfitRecommendation {
  id: string
  title: string
  matchedItems: ClosetOutfitBoardItem[] // 실제 보유 옷들로만 구성된 코디
  missingCategories: MissingCategoryAdvice[] // 옷장에 부족하여 채우지 못한 카테고리와 구체적 조언
  recommendationReason: string // 날씨 + 상황 기반 추천 이유
  style: ClothingStyle
  temperatureFitNote: string // 기온 적합도 안내
  weatherContext: {
    temp: number
    apparentTemp: number
    precipitation: string
    isRainOrSnow: boolean
  }
}

export interface BodyProfile {
  userId: string
  nickname: string
  height?: number // 키 (cm)
  weight?: number // 몸무게 (kg)
  bodyType: "slim" | "standard" | "athletic" | "plus" // 체형 타입
  gender: "unisex" | "female" | "male"
  skinTone: "light" | "medium" | "tan" | "dark"
  updatedAt: string
}

export interface VirtualEditResult {
  id: string
  sourceItemId: string
  prompt: string
  modifiedImageUrl: string
  diffSummary: string
  createdAt: string
}
