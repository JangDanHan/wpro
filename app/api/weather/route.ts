import { NextRequest, NextResponse } from "next/server"
import { RawWeatherData } from "@/lib/domain/types"
import { validateWeatherData } from "@/lib/domain/validator"
import { detectPrecipitation } from "@/lib/domain/precipitation"
import { createRecommendation } from "@/lib/domain/recommender"
import { findKmaRegionById, isFullyQualifiedRegion } from "@/lib/domain/regions"
import { getKmaBaseDateTime } from "@/lib/domain/kma-date"

/**
 * 기상청 PTY 코드 및 SKY 코드를 조합하여 날씨 상태 설명 문구 반환
 */
function resolveWeatherDescription(ptyCode: number | null, skyCode: number | null): string | null {
  if (ptyCode === 1) return "비"
  if (ptyCode === 2) return "진눈깨비"
  if (ptyCode === 3) return "눈"
  if (ptyCode === 5) return "빗방울"
  if (ptyCode === 6) return "빗방울눈날림"
  if (ptyCode === 7) return "눈날림"

  // PTY가 0(강수 없음)일 때 하늘상태(SKY) 적용
  if (skyCode === 1) return "맑음"
  if (skyCode === 3) return "구름 많음"
  if (skyCode === 4) return "흐림"

  if (ptyCode === 0) return "맑음"
  return null
}

/**
 * 기상청 강수량(RN1) 문자열 파싱
 */
function parseKmaRainfall(rn1Raw?: string | null): number | null {
  if (!rn1Raw) return null
  const trimmed = rn1Raw.trim()
  if (trimmed === "강수없음" || trimmed === "0" || trimmed === "0.0") {
    return 0
  }
  const cleaned = trimmed.replace("mm", "").trim()
  const num = parseFloat(cleaned)
  return Number.isNaN(num) ? null : num
}

export async function GET(request: NextRequest) {
  const reqStartTime = performance.now()
  const { searchParams } = new URL(request.url)
  const regionParam = searchParams.get("regionId") || searchParams.get("city")

  // 1. 요청된 지역 파라미터 유무 확인
  if (!regionParam || regionParam.trim() === "") {
    return NextResponse.json(
      {
        error: "조회할 지역을 선택해 주세요.",
        errorType: "INVALID_REGION",
      },
      { status: 400 },
    )
  }

  // 2. 서버의 기상청 공식 행정구역 데이터로 지역 ID 및 격자 좌표 검증
  const region = findKmaRegionById(regionParam.trim())
  if (!region) {
    return NextResponse.json(
      {
        error: "유효하지 않은 지역입니다. 올바른 대한민국 행정구역을 선택해 주세요.",
        errorType: "INVALID_REGION",
      },
      { status: 400 },
    )
  }

  // 2-1. 시·도, 시·군·구, 읍·면·동 전체 선택 완료 여부 검증 (요구사항: 상위 지역만 선택 시 검색 차단)
  if (!isFullyQualifiedRegion(region)) {
    return NextResponse.json(
      {
        error: "시·도, 시·군·구, 읍·면·동을 모두 선택해야 날씨를 조회할 수 있습니다.",
        errorType: "INCOMPLETE_REGION_SELECTION",
      },
      { status: 400 },
    )
  }

  // 3. 기상청 API 인증키 확인 (.env.local)
  const apiKey = process.env.KMA_API_KEY
  if (!apiKey || apiKey.trim() === "") {
    return NextResponse.json(
      {
        error: "기상청 API 인증키가 설정되지 않았습니다. .env.local의 KMA_API_KEY 설정을 확인해 주세요.",
        errorType: "AUTH_KEY_MISSING",
      },
      { status: 500 },
    )
  }

  const { nx, ny } = region.grid
  const { baseDate, baseTime, referenceTimestamp } = getKmaBaseDateTime()

  // 공공데이터포털 serviceKey는 디코딩/인코딩 중복 방지를 위해 decode 후 1회 encode
  const decodedKey = decodeURIComponent(apiKey.trim())
  const encodedKey = encodeURIComponent(decodedKey)

  const commonParams = `serviceKey=${encodedKey}&numOfRows=1000&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`

  // 엔드포인트 URL
  const ncstUrl = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?${commonParams}`
  const fcstUrl = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?${commonParams}`

  // EX-03: 10초 타임아웃 강제 중단
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    // 초단기실황(getUltraSrtNcst)과 초단기예보(getUltraSrtFcst, 하늘상태 보강용)를 병렬 호출
    const [ncstResponse, fcstResponse] = await Promise.all([
      fetch(ncstUrl, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
        cache: "no-store",
      }),
      fetch(fcstUrl, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
        cache: "no-store",
      }).catch(() => null),
    ])

    clearTimeout(timeoutId)

    // HTTP 상태 검사
    if (!ncstResponse.ok) {
      if (ncstResponse.status === 429) {
        return NextResponse.json(
          {
            error: "날씨 정보를 잠시 이용할 수 없어요. 잠시 후 다시 시도해 주세요.",
            errorType: "RATE_LIMITED",
          },
          { status: 429 },
        )
      }
      return NextResponse.json(
        {
          error: "날씨를 불러오지 못했어요. 연결을 확인한 뒤 다시 시도해 주세요.",
          errorType: "PROVIDER_ERROR",
        },
        { status: 502 },
      )
    }

    const ncstText = await ncstResponse.text()

    // XML 에러 응답 파싱 대응
    if (ncstText.trim().startsWith("<")) {
      const errMsgMatch =
        ncstText.match(/<errMsg>(.*?)<\/errMsg>/) ||
        ncstText.match(/<returnAuthMsg>(.*?)<\/returnAuthMsg>/)
      const kmaErrMsg = errMsgMatch ? errMsgMatch[1] : "기상청 서비스 응답 오류"

      return NextResponse.json(
        {
          error: `기상청 서비스 오류: ${kmaErrMsg}`,
          errorType: "PROVIDER_ERROR",
        },
        { status: 502 },
      )
    }

    let ncstData: any
    try {
      ncstData = JSON.parse(ncstText)
    } catch {
      return NextResponse.json(
        {
          error: "기상청 날씨 응답 데이터를 파싱하지 못했습니다.",
          errorType: "PROVIDER_ERROR",
        },
        { status: 502 },
      )
    }

    const header = ncstData?.response?.header
    const resultCode = header?.resultCode

    if (resultCode !== "00") {
      if (resultCode === "03") {
        return NextResponse.json(
          {
            error: "해당 지역의 기상청 관측 데이터가 없습니다.",
            errorType: "EMPTY_DATA",
          },
          { status: 502 },
        )
      }
      return NextResponse.json(
        {
          error: `기상청 서비스 오류 (${header?.resultMsg || resultCode})`,
          errorType: "PROVIDER_ERROR",
        },
        { status: 502 },
      )
    }

    const items = ncstData?.response?.body?.items?.item
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error: "기상청 관측 데이터가 비어 있습니다.",
          errorType: "EMPTY_DATA",
        },
        { status: 502 },
      )
    }

    // 초단기실황 항목 파싱
    let temperature: number | null = null
    let rn1Raw: string | null = null
    let ptyCode: number | null = null

    for (const item of items) {
      if (item.category === "T1H") {
        const parsed = parseFloat(item.obsrValue)
        if (!Number.isNaN(parsed)) {
          temperature = parsed
        }
      } else if (item.category === "RN1") {
        rn1Raw = item.obsrValue
      } else if (item.category === "PTY") {
        const parsed = parseInt(item.obsrValue, 10)
        if (!Number.isNaN(parsed)) {
          ptyCode = parsed
        }
      }
    }

    // 초단기예보에서 하늘상태(SKY) 추출
    let skyCode: number | null = null
    if (fcstResponse && fcstResponse.ok) {
      try {
        const fcstText = await fcstResponse.text()
        if (!fcstText.trim().startsWith("<")) {
          const fcstData = JSON.parse(fcstText)
          const fcstItems = fcstData?.response?.body?.items?.item
          if (Array.isArray(fcstItems)) {
            const skyItem = fcstItems.find((it: any) => it.category === "SKY")
            if (skyItem) {
              const parsed = parseInt(skyItem.fcstValue, 10)
              if (!Number.isNaN(parsed)) {
                skyCode = parsed
              }
            }
          }
        }
      } catch {}
    }

    // 날씨 상태 설명 문구 및 강수 형태 결정
    const weatherDescription = resolveWeatherDescription(ptyCode, skyCode)
    const rainfallAmount = parseKmaRainfall(rn1Raw)

    // PRD F-06 강수 상태 판정
    const precipitationType = detectPrecipitation({
      kmaPtyCode: ptyCode,
      weatherDescription,
    })

    const rawData: RawWeatherData = {
      cityId: region.value,
      cityName: region.label,
      temperature,
      weatherCode: ptyCode,
      weatherDescription,
      precipitationType,
      rainfallAmount,
      referenceAt: referenceTimestamp,
      provider: "기상청",
      providerUrl: "https://www.weather.go.kr/",
      infoType: "관측 정보",
    }

    // PRD F-04 날씨 정보 유효성 검증
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

    // 공식 전체 주소 라벨을 cityName으로 주입
    validation.data.cityName = region.label

    // 기본 결정론적 규칙 기반 옷차림 추천 즉시 생성 (지연 없음)
    const recommendation = createRecommendation(validation.data)

    const totalElapsedMs = Math.round(performance.now() - reqStartTime)

    // 날씨 및 기본 옷차림 데이터 즉시 반환 (AI/음악 지연과 분리)
    return NextResponse.json({
      weather: validation.data,
      recommendation,
      timing: {
        totalElapsedMs,
      },
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
