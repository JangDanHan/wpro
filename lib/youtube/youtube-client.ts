import fs from "fs"
import path from "path"
import { MusicRecommendation, ValidatedWeatherData } from "@/lib/domain/types"
import { generateAiMusicQuery } from "@/lib/ai/gemini-recommender"

/**
 * YouTube API 클라이언트
 * 
 * - YOUTUBE_API_KEY 서버 전용 안전 로드 (키 값은 콘솔/브라우저에 절대 출력하지 않음)
 * - 인메모리 캐싱 (TTL 1시간)으로 반복 검색 최소화 및 Quota 절약
 * - 진행 중인 동일 요청 de-duplication (중복 호출 방지)
 * - HTML 엔티티 디코딩
 * - 키 누락, 할당량 초과(403), 검색 결과 없음, 네트워크 실패에 대해 안전하게 null 반환
 */

interface CacheEntry {
  data: Omit<MusicRecommendation, "reason" | "searchQuery">
  expiresAt: number
}

// 1시간 캐시 TTL
const CACHE_TTL_MS = 60 * 60 * 1000

// YouTube Data API 검색 타임아웃 (전체 시간 배분: 최대 3.5초)
const YOUTUBE_SEARCH_TIMEOUT_MS = 3500

// 인메모리 검색 결과 캐시 (쿼리 -> 결과)
const searchCache = new Map<string, CacheEntry>()

// 동일 검색어 동시 요청 de-duplication용 Map
const pendingRequests = new Map<string, Promise<Omit<MusicRecommendation, "reason" | "searchQuery"> | null>>()

/**
 * 서버 환경 변수에서 YOUTUBE_API_KEY 로드
 * (키 값은 절대 로그/출력하지 않음)
 */
export function getYouTubeApiKey(): string | null {
  if (process.env.YOUTUBE_API_KEY !== undefined) {
    const key = process.env.YOUTUBE_API_KEY.trim()
    return key !== "" ? key : null
  }

  // Next.js 환경 및 로컬 .env.local fallback 탐색
  try {
    const envLocalPath = path.join(process.cwd(), ".env.local")
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, "utf-8")
      for (const line of content.split("\n")) {
        const trimmed = line.trim()
        if (trimmed.startsWith("YOUTUBE_API_KEY=")) {
          const val = trimmed.slice("YOUTUBE_API_KEY=".length).trim()
          if (val) return val
        }
      }
    }

    const envPath = path.join(process.cwd(), ".env")
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8")
      for (const line of content.split("\n")) {
        const trimmed = line.trim()
        if (trimmed.startsWith("YOUTUBE_API_KEY=")) {
          const val = trimmed.slice("YOUTUBE_API_KEY=".length).trim()
          if (val) return val
        }
      }
    }
  } catch { }

  return null
}

/**
 * YouTube 제목 등에서 나타나는 HTML 특수문자 디코딩
 */
export function decodeHtmlEntities(str: string): string {
  if (!str) return ""
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

/**
 * YouTube Data API v3를 호출하여 검색어에 해당하는 첫 번째 영상 정보를 가져옵니다.
 * 캐시 및 중복 요청 방지가 적용되어 있습니다.
 */
export async function searchYouTubeVideo(
  searchQuery: string,
  reason: string,
  parentSignal?: AbortSignal,
): Promise<MusicRecommendation | null> {
  const cleanQuery = (searchQuery || "").trim()
  if (!cleanQuery) {
    return null
  }

  if (parentSignal?.aborted) {
    return null
  }

  const apiKey = getYouTubeApiKey()
  if (!apiKey) {
    // 키 누락 시 조용히 null 반환 (키 값 출력 금지)
    return null
  }

  // 1. 캐시 확인
  const now = Date.now()
  const cached = searchCache.get(cleanQuery)
  if (cached && cached.expiresAt > now) {
    return {
      ...cached.data,
      searchQuery: cleanQuery,
      reason,
    }
  }

  // 2. 동시 동일 요청 중복 방지 (In-flight De-duplication)
  if (pendingRequests.has(cleanQuery)) {
    const pendingResult = await pendingRequests.get(cleanQuery)!
    if (pendingResult) {
      return {
        ...pendingResult,
        searchQuery: cleanQuery,
        reason,
      }
    }
    return null
  }

  // 3. 실제 YouTube Data API v3 호출
  const fetchPromise = (async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), YOUTUBE_SEARCH_TIMEOUT_MS)

    const onParentAbort = () => controller.abort()
    if (parentSignal) {
      parentSignal.addEventListener("abort", onParentAbort, { once: true })
    }

    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(cleanQuery)}&key=${apiKey}`
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      })

      clearTimeout(timeoutId)
      if (parentSignal) parentSignal.removeEventListener("abort", onParentAbort)

      if (!response.ok) {
        // 403 quotaExceeded 또는 기타 오류 대응
        return null
      }

      const data = await response.json()
      if (!data.items || data.items.length === 0) {
        // 검색 결과 없음
        return null
      }

      const item = data.items[0]
      const videoId = item.id?.videoId
      if (!videoId) {
        return null
      }

      const rawTitle = item.snippet?.title || "추천 음악"
      const channelTitle = item.snippet?.channelTitle || "YouTube"
      const thumbnails = item.snippet?.thumbnails
      const thumbnailUrl =
        thumbnails?.medium?.url ||
        thumbnails?.high?.url ||
        thumbnails?.default?.url ||
        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`

      const videoData: Omit<MusicRecommendation, "reason" | "searchQuery"> = {
        videoId,
        title: decodeHtmlEntities(rawTitle),
        channelTitle: decodeHtmlEntities(channelTitle),
        thumbnailUrl,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      }

      // 캐시에 저장
      searchCache.set(cleanQuery, {
        data: videoData,
        expiresAt: Date.now() + CACHE_TTL_MS,
      })

      return videoData
    } catch {
      clearTimeout(timeoutId)
      return null
    }
  })()

  pendingRequests.set(cleanQuery, fetchPromise)

  try {
    const videoData = await fetchPromise
    if (!videoData) return null

    return {
      ...videoData,
      searchQuery: cleanQuery,
      reason,
    }
  } finally {
    pendingRequests.delete(cleanQuery)
  }
}

/**
 * 테스트용 캐시 초기화 함수
 */
export function clearYouTubeCache(): void {
  searchCache.clear()
  pendingRequests.clear()
}

/**
 * 기상청 실시간 관측 날씨와 사용자 상황을 바탕으로
 * 제미나이 음악 검색어 생성 -> YouTube Data API 검색을 수행하여
 * 최종 MusicRecommendation 객체를 반환합니다.
 * 
 * 실패 시 null을 반환하여 상위 날씨 및 옷차림 추천에 영향을 주지 않습니다.
 */
export async function getRecommendedMusic(
  weather: ValidatedWeatherData,
  situation?: string | null,
  parentSignal?: AbortSignal,
): Promise<MusicRecommendation | null> {
  const result = await getRecommendedMusicWithTiming(weather, situation, parentSignal)
  return result.music
}

export interface MusicWithTimingResult {
  music: MusicRecommendation | null
  timing: {
    geminiElapsedMs: number
    youtubeElapsedMs: number
    totalElapsedMs: number
  }
}

/**
 * 단계별(Gemini 쿼리 생성, YouTube API 검색) 소요 시간을 정밀 측정하여 반환하는 함수
 * - 전체 시간 배분 적용 (Gemini 최대 2.5초 지연 시 즉시 Fallback 전환 -> YouTube 최대 3.5초)
 * - 사용자 요청 취소(parentSignal) 시 서버 외부 통신 즉시 중단
 */
export async function getRecommendedMusicWithTiming(
  weather: ValidatedWeatherData,
  situation?: string | null,
  parentSignal?: AbortSignal,
): Promise<MusicWithTimingResult> {
  const totalStart = performance.now()
  let geminiElapsedMs = 0
  let youtubeElapsedMs = 0

  if (parentSignal?.aborted) {
    return {
      music: null,
      timing: { geminiElapsedMs: 0, youtubeElapsedMs: 0, totalElapsedMs: 0 },
    }
  }

  try {
    const geminiStart = performance.now()
    const { searchQuery, reason } = await generateAiMusicQuery(weather, situation, parentSignal)
    geminiElapsedMs = Math.round(performance.now() - geminiStart)

    if (parentSignal?.aborted || !searchQuery) {
      return {
        music: null,
        timing: {
          geminiElapsedMs,
          youtubeElapsedMs: 0,
          totalElapsedMs: Math.round(performance.now() - totalStart),
        },
      }
    }

    const youtubeStart = performance.now()
    const musicResult = await searchYouTubeVideo(searchQuery, reason, parentSignal)
    youtubeElapsedMs = Math.round(performance.now() - youtubeStart)

    return {
      music: musicResult,
      timing: {
        geminiElapsedMs,
        youtubeElapsedMs,
        totalElapsedMs: Math.round(performance.now() - totalStart),
      },
    }
  } catch {
    return {
      music: null,
      timing: {
        geminiElapsedMs,
        youtubeElapsedMs,
        totalElapsedMs: Math.round(performance.now() - totalStart),
      },
    }
  }
}
