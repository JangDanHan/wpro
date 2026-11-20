import { NextRequest, NextResponse } from "next/server"
import { CITIES, CityId, RawWeatherData } from "@/lib/domain/types"
import { validateWeatherData } from "@/lib/domain/validator"
import { detectPrecipitation } from "@/lib/domain/precipitation"
import { createRecommendation } from "@/lib/domain/recommender"

// WMO 기상 코드별 한글 설명 매핑
const WMO_DESCRIPTIONS: Record<number, string> = {
  0: "맑음",
  1: "대체로 맑음",
  2: "구름 조금",
  3: "흐림",
  45: "안개",
  48: "결빙성 안개",
  51: "약한 이슬비",
  53: "이슬비",
  55: "강한 이슬비",
  56: "약한 결빙성 이슬비",
  57: "강한 결빙성 이슬비",
  61: "약한 비",
  63: "비",
  65: "강한 비",
  66: "약한 결빙성 비",
  67: "강한 결빙성 비",
  71: "약한 눈",
  73: "눈",
  75: "강한 눈",
  77: "싸락눈",
  80: "약한 소나기",
  81: "소나기",
  82: "강한 소나기",
  85: "약한 눈 소나기",
  86: "강한 눈 소나기",
  95: "뇌우",
  96: "약한 우박을 동반한 뇌우",
  99: "강한 우박을 동반한 뇌우",
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cityParam = searchParams.get("city") as CityId | null

  // F-01: 지원 도시는 서울, 광주, 부산
  if (!cityParam || !CITIES[cityParam]) {
    return NextResponse.json(
      {
        error: "지원하지 않는 도시입니다. 서울, 광주, 부산 중 하나를 선택해 주세요.",
        errorType: "INVALID_CITY",
      },
      { status: 400 },
    )
  }

  const city = CITIES[cityParam]
  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,precipitation,weather_code&timezone=Asia%2FSeoul`

  // EX-03: 10초 타임아웃 강제 중단
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
      // 실시간 날씨 데이터이므로 캐시 비활성화
      cache: "no-store",
    })

    clearTimeout(timeoutId)

    // EX-04: 제공처 장애 및 Rate Limit 대응
    if (response.status === 429) {
      return NextResponse.json(
        {
          error: "날씨 정보를 잠시 이용할 수 없어요. 잠시 후 다시 시도해 주세요.",
          errorType: "RATE_LIMITED",
        },
        { status: 429 },
      )
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "날씨를 불러오지 못했어요. 연결을 확인한 뒤 다시 시도해 주세요.",
          errorType: "PROVIDER_ERROR",
        },
        { status: 502 },
      )
    }

    const data = await response.json()
    const current = data.current

    if (!current) {
      return NextResponse.json(
        {
          error: "날씨 정보를 불러오지 못했습니다.",
          errorType: "EMPTY_DATA",
        },
        { status: 502 },
      )
    }

    // Open-Meteo 응답의 time은 '2026-11-20T17:00' (KST) 형태
    // KST 타임스탬프로 정확히 변환
    const timeStr = current.time ? `${current.time}:00+09:00` : null
    const referenceTimestamp = timeStr ? new Date(timeStr).getTime() : null

    const weatherCode = typeof current.weather_code === "number" ? current.weather_code : null
    const weatherDescription = weatherCode !== null ? WMO_DESCRIPTIONS[weatherCode] || null : null

    // PRD F-06 강수 판정
    const precipitationType = detectPrecipitation({
      weatherCode,
      weatherDescription,
    })

    const rawData: RawWeatherData = {
      cityId: city.id,
      temperature: current.temperature_2m,
      weatherCode,
      weatherDescription,
      precipitationType,
      rainfallAmount: typeof current.precipitation === "number" ? current.precipitation : null,
      referenceAt: referenceTimestamp,
      provider: "Open-Meteo",
      providerUrl: "https://open-meteo.com/",
      infoType: "모델 기반 현재 날씨",
    }

    // PRD F-04 유효성 검증
    const validation = validateWeatherData(rawData)

    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        {
          error: validation.errorMessage || "날씨 유효성 검증에 실패했습니다.",
          errorType: validation.errorType,
        },
        { status: 422 },
      )
    }

    // PRD F-05, F-06, F-07 추천 생성
    const recommendation = createRecommendation(validation.data)

    return NextResponse.json({
      weather: validation.data,
      recommendation,
    })
  } catch (error: any) {
    clearTimeout(timeoutId)

    if (error.name === "AbortError") {
      return NextResponse.json(
        {
          error: "날씨 조회가 지연되고 있어요. 다시 시도해 주세요.",
          errorType: "TIMEOUT",
        },
        { status: 504 },
      )
    }

    return NextResponse.json(
      {
        error: "날씨를 불러오지 못했어요. 연결을 확인한 뒤 다시 시도해 주세요.",
        errorType: "NETWORK_ERROR",
      },
      { status: 500 },
    )
  }
}
