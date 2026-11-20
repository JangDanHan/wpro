import fs from "fs"
import path from "path"
import { OutfitRecommendation, ValidatedWeatherData } from "@/lib/domain/types"
import { FIXED_DISCLAIMER } from "@/lib/domain/outfit"

/**
 * 서버 환경 변수에서 GEMINI_API_KEY 로드
 * (키 값은 브라우저 클라이언트에 절대 노출하지 않음)
 */
function getGeminiApiKey(): string | null {
  if (process.env.GEMINI_API_KEY !== undefined) {
    const envKey = process.env.GEMINI_API_KEY.trim()
    return envKey !== "" ? envKey : null
  }

  // Next.js 개발 서버에서 파일로부터 직접 로드 fallback
  try {
    const envPath = path.join(process.cwd(), ".env")
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8")
      for (const line of content.split("\n")) {
        const trimmed = line.trim()
        if (trimmed.startsWith("GEMINI_API_KEY=")) {
          const val = trimmed.slice("GEMINI_API_KEY=".length).trim()
          if (val) return val
        }
      }
    }
  } catch {}

  return null
}

const PRIMARY_MODELS = [
  "gemini-3.1-flash-lite", // 초고속 경량 모델 (1.5초 내 응답)
  "gemini-3.5-flash",
  "gemini-3.8-flash",
]

// 음악 검색어 생성용 Gemini 타임아웃 (전체 시간 배분: 최대 2.5초, 초과 시 즉시 Fallback 전환)
const GEMINI_MUSIC_TIMEOUT_MS = 2500

// AI 옷차림 추천용 Gemini 타임아웃
const GEMINI_OUTFIT_TIMEOUT_MS = 5000

/**
 * 기상청 공식 관측 날씨와 사용자 상황을 제미나이에 전달하여
 * 맞춤 옷차림 추천 1개를 생성하는 함수.
 * 
 * 실패(오류, 할당량 초과, 타임아웃 등) 시 null을 반환하여
 * 호출부에서 규칙 기반 추천으로 안전하게 fallback 되도록 합니다.
 */
export async function generateAiOutfitRecommendation(
  weather: ValidatedWeatherData,
  situation?: string | null,
  parentSignal?: AbortSignal,
): Promise<OutfitRecommendation | null> {
  const cleanSituation = (situation || "").trim()
  if (!cleanSituation) {
    return null
  }

  if (parentSignal?.aborted) {
    return null
  }

  const apiKey = getGeminiApiKey()
  if (!apiKey) {
    return null
  }

  // 엄격한 시스템 지시 프롬프트 구성:
  // 1. 날씨는 오직 주어진 기상청 관측값만을 진실로 인정하며, AI가 임의로 날씨를 날조/변경하지 못하게 함
  // 2. 사용자의 상황(면접, 체질, 일정 등)을 반영한 단 1개의 맞춤 옷차림과 추천 이유 생성
  const prompt = `
[역할 및 지침]
당신은 대한민국 기상청 날씨 데이터 기반의 전문 의류 코디네이터입니다.
반드시 아래 제공된 [기상청 공식 관측 날씨]만을 사실로 사용해야 하며, 절대 날씨나 기온, 강수 상태를 임의로 지어내거나 변경해서는 안 됩니다.
사용자가 입력한 [사용자 상황/일정]과 [기상청 공식 관측 날씨]를 종합적으로 고려하여 외출 시 참고할 실용적인 옷차림 1개와 친절한 추천 이유를 제안하세요.

[기상청 공식 관측 날씨]
- 관측 지역: ${weather.cityName}
- 현재 기온: ${weather.temperature}℃
- 날씨 상태: ${weather.weatherDescription || "상태 정보 없음"}
- 강수 형태: ${weather.precipitationType === "none" ? "강수 없음" : weather.precipitationType}
- 1시간 강수량: ${weather.rainfallAmount !== null ? `${weather.rainfallAmount}mm` : "강수량 정보 없음"}

[사용자 상황/일정]
"${cleanSituation}"

[응답 요구사항]
오직 순수한 JSON 형식으로만 응답해야 하며, 마크다운 코드블록(\`\`\`json)이나 기타 설명 텍스트를 붙이지 마세요.
JSON 스키마:
{
  "basicOutfit": "문자열 (상황과 기온에 꼭 맞는 구체적인 옷차림 1개, 예: 단정한 셔츠에 보온용 니트, 포멀 코트와 슬랙스)",
  "precipitationNotice": "문자열 또는 null (비나 눈이 오거나 우산이 필요할 경우 안내, 없으면 null)",
  "reason": "문자열 (현재 기온과 날씨, 그리고 사용자의 상황을 명시적으로 연결하여 왜 이 옷차림을 추천했는지 설명하는 1~2문장)",
  "situationSummary": "문자열 (상황의 핵심 요약, 10자 내외, 예: 추위 민감 및 면접 대비)"
}
`.trim()

  for (const model of PRIMARY_MODELS) {
    if (parentSignal?.aborted) return null

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_OUTFIT_TIMEOUT_MS)

    const onParentAbort = () => controller.abort()
    if (parentSignal) {
      parentSignal.addEventListener("abort", onParentAbort, { once: true })
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2, // 결정론적이고 안정적인 응답
            maxOutputTokens: 500,
          },
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        continue // 다음 fallback 모델 시도
      }

      const data = await response.json()
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!rawText) continue

      // JSON 추출 및 파싱
      const cleanedJsonText = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim()

      const parsed = JSON.parse(cleanedJsonText)

      if (parsed.basicOutfit && parsed.reason) {
        return {
          title: "지금 참고할 옷차림",
          temperature: weather.temperature,
          basicOutfit: parsed.basicOutfit,
          precipitationNotice: parsed.precipitationNotice || null,
          reason: parsed.reason,
          fixedDisclaimer: FIXED_DISCLAIMER,
          missingNotice: null,
          isAiGenerated: true,
          situation: cleanSituation,
          situationSummary: parsed.situationSummary || "맞춤 상황 반영",
        }
      }
    } catch {
      clearTimeout(timeoutId)
      // 네트워크 에러나 타임아웃 시 다음 모델 시도 또는 fallback
    }
  }

  // 모든 AI 호출 실패 시 null 반환 (규칙 기반으로 안전한 fallback)
  return null
}

export interface MusicQueryResponse {
  searchQuery: string
  reason: string
}

/**
 * AI 장애나 키 누락 시 안전하게 사용하는 규칙 기반 기본 음악 검색어 및 이유
 */
export function getFallbackMusicQuery(
  weather: ValidatedWeatherData,
  situation?: string | null,
): MusicQueryResponse {
  const cleanSituation = (situation || "").trim()

  if (weather.precipitationType === "rain") {
    return {
      searchQuery: "비 오는 날 듣기 좋은 감성 음악 플레이리스트",
      reason: `${weather.cityName}에 비가 내리는 날씨에 맞춰, 차분하고 편안한 분위기를 더해주는 감성 플레이리스트입니다.${cleanSituation ? ` (${cleanSituation} 상황에 어울리는 추천)` : ""}`,
    }
  }

  if (weather.precipitationType === "snow") {
    return {
      searchQuery: "눈 내리는 날 듣는 따뜻한 팝송 플레이리스트",
      reason: `눈 내리는 겨울 풍경에 어울리는 포근하고 따뜻한 멜로디의 음악입니다.${cleanSituation ? ` (${cleanSituation} 상황 고려)` : ""}`,
    }
  }

  if (weather.temperature <= 5) {
    return {
      searchQuery: "추운 겨울날 따뜻한 로파이 재즈 음악",
      reason: `현재 기온 ${weather.temperature}℃의 쌀쌀한 날씨에 어울리는 포근하고 안정감을 주는 음악입니다.${cleanSituation ? ` (${cleanSituation} 상황 고려)` : ""}`,
    }
  }

  if (weather.temperature >= 23) {
    return {
      searchQuery: "맑은 날 기분 좋은 청량한 드라이브 팝송",
      reason: `활동하기 좋은 활기찬 날씨에 기분을 한층 상쾌하고 밝게 해주는 음악입니다.${cleanSituation ? ` (${cleanSituation} 상황 고려)` : ""}`,
    }
  }

  return {
    searchQuery: "날씨 좋은 날 산책하며 듣는 어쿠스틱 노래",
    reason: `현재 기온 ${weather.temperature}℃의 쾌적한 날씨를 즐기며 가볍게 듣기 좋은 감성적인 음악입니다.${cleanSituation ? ` (${cleanSituation} 상황 고려)` : ""}`,
  }
}

/**
 * 기상청 공식 관측 날씨와 사용자 상황을 제미나이에 전달하여
 * 유튜브에서 검색할 음악 검색어(searchQuery)와 추천 이유(reason)를 생성합니다.
 * 
 * 실패 시 규칙 기반 기본 검색어로 안전하게 fallback 됩니다.
 */
export async function generateAiMusicQuery(
  weather: ValidatedWeatherData,
  situation?: string | null,
  parentSignal?: AbortSignal,
): Promise<MusicQueryResponse> {
  const cleanSituation = (situation || "").trim()

  if (parentSignal?.aborted) {
    return getFallbackMusicQuery(weather, situation)
  }

  const apiKey = getGeminiApiKey()
  if (!apiKey) {
    return getFallbackMusicQuery(weather, situation)
  }

  const prompt = `
[역할 및 지침]
당신은 대한민국 기상청 날씨 데이터와 사용자 상황에 꼭 맞는 음악을 큐레이션하는 전문 음악 디렉터입니다.
반드시 아래 제공된 [기상청 공식 관측 날씨]만을 사실로 사용해야 하며, 절대 날씨나 기온, 강수 상태를 임의로 지어내거나 변경해서는 안 됩니다.
사용자가 입력한 [사용자 상황/일정]과 [기상청 공식 관측 날씨]를 종합적으로 고려하여 외출 시 또는 이동 시 듣기 좋은 음악을 찾을 수 있는 유튜브 검색어와 친절한 추천 이유를 제안하세요.

[중요 제약사항]
1. 당신은 절대로 임의의 유튜브 영상 제목, 영상 링크, 채널명, 동영상 ID를 지어내거나 반환해서는 안 됩니다.
2. 당신이 작성하는 검색어(searchQuery)는 사용자가 유튜브 검색창에 직접 입력했을 때 실제 좋은 플레이리스트/노래가 나올 수 있는 자연스러운 검색 키워드(예: "비 오는 날 듣기 좋은 잔잔한 어쿠스틱", "면접 전 긴장 풀리는 차분한 클래식", "12도 쌀쌀한 출근길 산뜻한 로파이")여야 합니다.
3. 추천 이유(reason)는 현재 기온/날씨와 사용자 상황(입력된 경우)을 연결하여 왜 이 분위기의 음악을 추천했는지 1~2문장으로 설명하세요.

[기상청 공식 관측 날씨]
- 관측 지역: ${weather.cityName}
- 현재 기온: ${weather.temperature}℃
- 날씨 상태: ${weather.weatherDescription || "상태 정보 없음"}
- 강수 형태: ${weather.precipitationType === "none" ? "강수 없음" : weather.precipitationType}

[사용자 상황/일정]
${cleanSituation ? `"${cleanSituation}"` : "특별한 상황 입력 없음 (현재 날씨 분위기에 어울리는 음악 추천)"}

[응답 요구사항]
오직 순수한 JSON 형식으로만 응답해야 하며, 마크다운 코드블록(\`\`\`json)이나 기타 설명 텍스트를 붙이지 마세요.
JSON 스키마:
{
  "searchQuery": "문자열 (유튜브에 검색할 감성적이고 구체적인 검색 쿼리, 20자 내외)",
  "reason": "문자열 (날씨와 상황을 명시적으로 연결하여 추천 이유를 설명하는 1~2문장)"
}
`.trim()

  // 가장 빠르고 안정적인 모델(gemini-3.1-flash-lite)로 최대 2.5초만 시도
  // 지연되거나 실패하면 즉시 규칙 기반 Fallback 검색어로 전환하여 전체 제한 시간 보장
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_MUSIC_TIMEOUT_MS)

  const onParentAbort = () => controller.abort()
  if (parentSignal) {
    parentSignal.addEventListener("abort", onParentAbort, { once: true })
  }

  try {
    const fastModel = PRIMARY_MODELS[0] // gemini-3.1-flash-lite
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${fastModel}:generateContent?key=${apiKey}`
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 300,
        },
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    if (parentSignal) parentSignal.removeEventListener("abort", onParentAbort)

    if (response.ok) {
      const data = await response.json()
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (rawText) {
        const cleanedJsonText = rawText
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim()

        const parsed = JSON.parse(cleanedJsonText)
        if (parsed.searchQuery && parsed.reason) {
          return {
            searchQuery: parsed.searchQuery.trim(),
            reason: parsed.reason.trim(),
          }
        }
      }
    }
  } catch {
    clearTimeout(timeoutId)
    if (parentSignal) parentSignal.removeEventListener("abort", onParentAbort)
  }

  // Gemini가 지연되거나 실패하면 즉시 날씨 기반 기본 검색어로 전환 (0ms 대기)
  return getFallbackMusicQuery(weather, situation)
}
