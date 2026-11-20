export type CityId = "seoul" | "gwangju" | "busan"

export interface CityInfo {
  id: CityId
  name: string
  fullName: string
  latitude: number
  longitude: number
  timezone: string
}

export const CITIES: Record<CityId, CityInfo> = {
  seoul: {
    id: "seoul",
    name: "서울",
    fullName: "서울특별시",
    latitude: 37.5665,
    longitude: 126.9780,
    timezone: "Asia/Seoul",
  },
  gwangju: {
    id: "gwangju",
    name: "광주",
    fullName: "광주광역시",
    latitude: 35.1595,
    longitude: 126.8526,
    timezone: "Asia/Seoul",
  },
  busan: {
    id: "busan",
    name: "부산",
    fullName: "부산광역시",
    latitude: 35.1796,
    longitude: 129.0756,
    timezone: "Asia/Seoul",
  },
}

export type PrecipitationType = "rain" | "snow" | "mixed" | "none" | "unknown"

export type InfoType = "관측 정보" | "모델 기반 현재 날씨"

export interface RawWeatherData {
  cityId: CityId
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

export interface OutfitRecommendation {
  title: string // '지금 참고할 옷차림'
  temperature: number
  basicOutfit: string
  precipitationNotice: string | null
  reason: string
  fixedDisclaimer: string
  missingNotice?: string | null
}
