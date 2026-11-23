export type CityId = string
export type RegionId = string

export interface CityInfo {
  id: CityId
  name: string
  fullName: string
  latitude: number
  longitude: number
  nx: number
  ny: number
  timezone: string
}

export const CITIES: Record<CityId, CityInfo> = {
  seoul: {
    id: "seoul",
    name: "서울",
    fullName: "서울특별시",
    latitude: 37.5665,
    longitude: 126.9780,
    nx: 60,
    ny: 127,
    timezone: "Asia/Seoul",
  },
  gwangju: {
    id: "gwangju",
    name: "광주",
    fullName: "광주광역시",
    latitude: 35.1595,
    longitude: 126.8526,
    nx: 58,
    ny: 74,
    timezone: "Asia/Seoul",
  },
  busan: {
    id: "busan",
    name: "부산",
    fullName: "부산광역시",
    latitude: 35.1796,
    longitude: 129.0756,
    nx: 98,
    ny: 76,
    timezone: "Asia/Seoul",
  },
}

export type PrecipitationType = "rain" | "snow" | "mixed" | "none" | "unknown"

export type InfoType = "관측 정보" | "모델 기반 현재 날씨"

export interface RawWeatherData {
  cityId: CityId
  cityName?: string | null
  temperature?: number | null
  weatherCode?: number | null
  weatherDescription?: string | null
  precipitationType?: PrecipitationType | null
  rainfallAmount?: number | null
  referenceAt?: string | number | null // ISO 8601 string or timestamp in ms
  provider?: string | null
  providerUrl?: string | null
  infoType?: InfoType | null
}

export interface ValidatedWeatherData {
  cityId: CityId
  cityName: string
  temperature: number
  apparentTemp?: number
  weatherDescription: string | null // null means '상태 정보 없음' (EX-10)
  precipitationType: PrecipitationType
  rainfallAmount: number | null // null means '강수량 정보 없음' (EX-08)
  referenceAt: number // timestamp ms (KST 기준)
  referenceAtFormatted: string
  provider: string
  providerUrl: string
  infoType: InfoType
}

export type ValidationErrorType =
  | "MISSING_REQUIRED_FIELD"
  | "INVALID_TEMPERATURE"
  | "INVALID_REFERENCE_TIME"
  | "EXPIRED_REFERENCE_TIME"
  | "FUTURE_REFERENCE_TIME"
  | "MISSING_SOURCE_INFO"

export interface ValidationResult {
  isValid: boolean
  data?: ValidatedWeatherData
  errorType?: ValidationErrorType
  errorMessage?: string
}

export interface ProductItem {
  id: string
  category: "outer" | "top" | "bottom" | "shoes" | "accessory" | "headwear" | "bag"
  categoryLabel: string // "외투", "상의", "하의", "신발", "모자", "가방", "소품"
  name: string // 예: "블랙 골지 하이넥 니트", "연청 와이드 데님"
  photoUrl: string // 투명 배경 누끼 단독 상품 사진
  material?: string
  thickness?: string
  description?: string
  collageStyle?: {
    top?: string
    left?: string
    right?: string
    bottom?: string
    width?: string
    zIndex?: number
  }
}

export interface OutfitRecommendation {
  title: string // '지금 참고할 옷차림'
  temperature: number
  basicOutfit: string
  precipitationNotice: string | null
  reason: string
  fixedDisclaimer: string
  missingNotice?: string | null
  isAiGenerated?: boolean
  situation?: string | null
  situationSummary?: string | null
  // 무신사 스냅 기반 코디 추천 확장 필드
  snapPostId?: string
  snapUrl?: string // 무신사 원문 게시물 URL (https://www.musinsa.com/snap/...)
  musinsaProfileUrl?: string // 추천 대상 프로필 URL (https://www.musinsa.com/snap/profile/1234627203913810064)
  creatorName?: string // 크리에이터 / 작성자
  photoUrl?: string
  clothingItems?: string
  style?: "casual" | "formal" | "comfort" | "street" | "minimal"
  styleName?: string
  photoCredit?: string
  productItems?: ProductItem[] // 해당 완성 코디에 포함된 개별 아이템들
  isWeatherVerified?: boolean // 날씨 적합성 검증 완료 여부
  unverifiedReason?: string | null // 날씨 적합성 추가 확인 필요 이유
  alternativeOutfits?: Array<{
    id: string
    snapPostId?: string
    snapUrl?: string
    creatorName?: string
    style: "casual" | "formal" | "comfort" | "street" | "minimal"
    styleName: string
    title: string
    clothingItems: string
    description: string
    photoUrl: string
    photoCredit: string
    productItems?: ProductItem[]
    isWeatherVerified?: boolean
    unverifiedReason?: string | null
  }>
}

export interface MusicRecommendation {
  videoId: string
  title: string
  channelTitle: string
  thumbnailUrl: string
  videoUrl: string
  searchQuery: string
  reason: string
  // 개별 곡(Single Track) 추천 확장 필드
  songTitle?: string
  artist?: string
  genre?: string
  origin?: "domestic" | "international"
  albumArtUrl?: string
  isIndividualTrack?: boolean
  isExhaustedCandidates?: boolean
}
