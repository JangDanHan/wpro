import { NextRequest, NextResponse } from "next/server"
import { CITIES, CityId, RawWeatherData } from "@/lib/domain/types"
import { validateWeatherData } from "@/lib/domain/validator"
import { detectPrecipitation } from "@/lib/domain/precipitation"
import { createRecommendation } from "@/lib/domain/recommender"

/**
 * 기상청 단기예보 조회서비스 기준 일시 계산 (KST 기준)
 * 초단기실황(getUltraSrtNcst)은 매시 정시 관측 자료가 매시 40분 이후 발표됩니다.
 * 따라서 현재 시각에서 45분을 차감한 시점의 년월일(YYYYMMDD)과 정시(HH00)를 기준 시각으로 삼습니다.
 */
export function getKmaBaseDateTime(nowDate: Date = new Date()): {
  baseDate: string
  baseTime: string
  referenceTimestamp: number
} {
  // 한국 표준시 (UTC+9) Date 생성
  const utc = nowDate.getTime() + nowDate.getTimezoneOffset() * 60000
  const kst = new Date(utc + 9 * 3600000)

  // 45분 전 기준 적용 (정시 40분 이후 발표 보장)
  kst.setMinutes(kst.getMinutes() - 45)

  const year = kst.getFullYear()
  const month = String(kst.getMonth() + 1).padStart(2, "0")
  const date = String(kst.getDate()).padStart(2, "0")
  const hours = String(kst.getHours()).padStart(2, "0")

  const baseDate = `${year}${month}${date}`
  const baseTime = `${hours}00`

  // 관측 기준 시각 타임스탬프 (KST 기준)
  const refDateStr = `${year}-${month}-${date}T${hours}:00:00+09:00`
  const referenceTimestamp = new Date(refDateStr).getTime()

  return { baseDate, baseTime, referenceTimestamp }
}

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
  // "1.2mm" 또는 "1.2" 형태 처리
  const cleaned = trimmed.replace("mm", "").trim()
  const num = parseFloat(cleaned)
  return Number.isNaN(num) ? null : num
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

  // 1. 기상청 API 인증키 확인 (.env.local)
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

  const city = CITIES[cityParam]
  const { baseDate, baseTime, referenceTimestamp } = getKmaBaseDateTime()

  // 공공데이터포털 serviceKey는 디코딩/인코딩 중복 방지를 위해 decode 후 1회 encode
  const decodedKey = decodeURIComponent(apiKey.trim())
  const encodedKey = encodeURIComponent(decodedKey)

  const commonParams = `serviceKey=${encodedKey}&numOfRows=1000&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${city.nx}&ny=${city.ny}`

  // 엔드포인트 URL
  const ncstUrl = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?${commonParams}`
  const fcstUrl = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?${commonParams}`

  // EX-03: 10초 타임아웃 강제 중단
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    // 2. 초단기실황(getUltraSrtNcst)과 초단기예보(getUltraSrtFcst, 하늘상태 보강용)를 병렬 호출
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
      }).catch(() => null), // 초단기예보 실패 시에도 실황 데이터로 진행
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

    // XML 에러 응답 파싱 대응 (공공데이터포털은 에러 시 JSON 대신 XML 반환 가능)
    if (ncstText.trim().startsWith("<")) {
      const errMsgMatch = ncstText.match(/<errMsg>(.*?)<\/errMsg>/) || ncstText.match(/<returnAuthMsg>(.*?)<\/returnAuthMsg>/)
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

    // 3. 초단기예보에서 하늘상태(SKY) 추출
    let skyCode: number | null = null
    if (fcstResponse && fcstResponse.ok) {
      try {
        const fcstText = await fcstResponse.text()
        if (!fcstText.trim().startsWith("<")) {
          const fcstData = JSON.parse(fcstText)
          const fcstItems = fcstData?.response?.body?.items?.item
          if (Array.isArray(fcstItems)) {
            // 가장 빠른 fcstTime의 SKY 값 찾기
            const skyItem = fcstItems.find((it: any) => it.category === "SKY")
            if (skyItem) {
              const parsed = parseInt(skyItem.fcstValue, 10)
              if (!Number.isNaN(parsed)) {
                skyCode = parsed
              }
            }
          }
        }
      } catch {
        // 초단기예보 파싱 실패 시에도 실황 데이터로 계속 진행
      }
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
      cityId: city.id,
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
