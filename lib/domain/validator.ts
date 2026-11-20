import {
  CITIES,
  RawWeatherData,
  ValidatedWeatherData,
  ValidationResult,
} from "./types"

export const THREE_HOURS_MS = 3 * 60 * 60 * 1000

export function validateWeatherData(
  raw: RawWeatherData,
  currentTimeMs: number = Date.now(),
): ValidationResult {
  // 1. 도시/지역 ID 확인
  if (!raw.cityId || typeof raw.cityId !== "string" || raw.cityId.trim() === "") {
    return {
      isValid: false,
      errorType: "MISSING_REQUIRED_FIELD",
      errorMessage: "선택된 지역 정보를 확인할 수 없습니다.",
    }
  }

  // 2. 기온 검증 (EX-05: 0℃로 대체하지 않고 에러 반환)
  if (
    raw.temperature === null ||
    raw.temperature === undefined ||
    typeof raw.temperature !== "number" ||
    Number.isNaN(raw.temperature) ||
    !Number.isFinite(raw.temperature)
  ) {
    return {
      isValid: false,
      errorType: "INVALID_TEMPERATURE",
      errorMessage: "기온을 확인할 수 없어 옷차림을 추천하지 못했어요.",
    }
  }

  // 3. 출처 및 정보 유형 검증 (EX-11)
  if (!raw.provider || !raw.providerUrl || !raw.infoType) {
    return {
      isValid: false,
      errorType: "MISSING_SOURCE_INFO",
      errorMessage: "날씨 정보의 출처와 유형을 확인할 수 없어 추천을 제공하지 못했어요.",
    }
  }

  // 4. 정보 기준 시각 검증 (EX-06, EX-07)
  if (!raw.referenceAt) {
    return {
      isValid: false,
      errorType: "INVALID_REFERENCE_TIME",
      errorMessage: "날씨 정보의 기준 시각을 확인할 수 없어 추천을 제공하지 못했어요.",
    }
  }

  let refTimestamp: number
  if (typeof raw.referenceAt === "number") {
    refTimestamp = raw.referenceAt
  } else {
    refTimestamp = new Date(raw.referenceAt).getTime()
  }

  if (Number.isNaN(refTimestamp)) {
    return {
      isValid: false,
      errorType: "INVALID_REFERENCE_TIME",
      errorMessage: "날씨 정보의 기준 시각을 올바르게 해석할 수 없어 추천을 제공하지 못했어요.",
    }
  }

  // 미래 시각 검증 (EX-07)
  if (refTimestamp > currentTimeMs) {
    return {
      isValid: false,
      errorType: "FUTURE_REFERENCE_TIME",
      errorMessage: "현재 기준으로 사용할 수 있는 날씨 정보가 아니에요. 다시 확인해 주세요.",
    }
  }

  // 3시간 초과 오래된 정보 검증 (EX-07, 정확히 3시간은 허용)
  if (currentTimeMs - refTimestamp > THREE_HOURS_MS) {
    return {
      isValid: false,
      errorType: "EXPIRED_REFERENCE_TIME",
      errorMessage: "현재 기준으로 사용할 수 있는 날씨 정보가 아니에요. 다시 확인해 주세요.",
    }
  }

  // 날짜 포맷 (한국 표준시 표기)
  const refDate = new Date(refTimestamp)
  const formattedTime = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(refDate)

  const resolvedCityName =
    raw.cityName?.trim() || (CITIES[raw.cityId] ? CITIES[raw.cityId].name : raw.cityId)

  const validated: ValidatedWeatherData = {
    cityId: raw.cityId,
    cityName: resolvedCityName,
    temperature: raw.temperature,
    weatherDescription: raw.weatherDescription?.trim() || null, // 누락 시 null (EX-10)
    precipitationType: raw.precipitationType || "unknown",
    rainfallAmount: typeof raw.rainfallAmount === "number" && !Number.isNaN(raw.rainfallAmount) ? raw.rainfallAmount : null, // 누락 시 null (EX-08)
    referenceAt: refTimestamp,
    referenceAtFormatted: formattedTime,
    provider: raw.provider,
    providerUrl: raw.providerUrl,
    infoType: raw.infoType,
  }

  return {
    isValid: true,
    data: validated,
  }
}
