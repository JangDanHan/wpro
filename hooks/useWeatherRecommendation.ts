"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { MusicRecommendation, OutfitRecommendation, ValidatedWeatherData } from "@/lib/domain/types"
import { THREE_HOURS_MS } from "@/lib/domain/validator"

export type WeatherViewState =
  | "idle" // 초기 상태: 지역 미선택
  | "loading" // 날씨 조회 중
  | "success" // 정상 표시
  | "partial" // 일부 정보 누락 상태
  | "error_network" // 연결 문제
  | "error_timeout" // 10초 지연
  | "error_rate_limit" // 제공처 제한/장애
  | "error_invalid_temp" // 기온 누락
  | "error_expired" // 3시간 초과 오래된 정보
  | "error_generic" // 기타 오류

export type SubFeatureState = "idle" | "loading" | "success" | "error"

export interface StepTimings {
  weatherMs: number | null
  aiOutfitMs: number | null
  musicTotalMs: number | null
  geminiMusicMs: number | null
  youtubeMs: number | null
}

export interface UseWeatherRecommendationReturn {
  selectedCity: string | null
  selectedRegionId: string | null
  selectedRegionLabel: string | null
  situation: string
  setSituation: (situation: string) => void
  validationError: string | null
  setValidationError: (error: string | null) => void

  // 1. 기상청 날씨 및 기본 옷차림 상태 (즉시 응답)
  state: WeatherViewState
  weather: ValidatedWeatherData | null
  recommendation: OutfitRecommendation | null
  errorMessage: string | null
  isFetching: boolean

  // 2. AI 맞춤 추천 상태 (비동기 독립 분리)
  aiState: SubFeatureState
  aiErrorMessage: string | null
  retryAiOutfit: () => void

  // 3. 음악 추천 상태 (비동기 독립 분리)
  musicState: SubFeatureState
  music: MusicRecommendation | null
  musicErrorMessage: string | null
  retryMusic: () => void
  fetchNextMusicTrack: () => void

  // 4. 소요 시간 측정 지표
  timings: StepTimings

  // 공통 핸들러
  selectCity: (regionId: string, label?: string, customSituation?: string) => void
  selectRegion: (regionId: string, label?: string, customSituation?: string) => void
  applySituation: (newSituation: string) => void
  resetSelection: () => void
  refresh: (customSituation?: string) => void
  executeRecommendation: () => Promise<void>
}

export function useWeatherRecommendation(): UseWeatherRecommendationReturn {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)
  const [selectedRegionLabel, setSelectedRegionLabel] = useState<string | null>(null)
  const [situation, setSituation] = useState<string>("")
  const [validationError, setValidationError] = useState<string | null>(null)

  // 1. 날씨 및 기본 옷차림 상태
  const [state, setState] = useState<WeatherViewState>("idle")
  const [weather, setWeather] = useState<ValidatedWeatherData | null>(null)
  const [basicRecommendation, setBasicRecommendation] = useState<OutfitRecommendation | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // 2. AI 맞춤 옷차림 추천 상태 (별도 요청)
  const [aiState, setAiState] = useState<SubFeatureState>("idle")
  const [aiRecommendation, setAiRecommendation] = useState<OutfitRecommendation | null>(null)
  const [aiErrorMessage, setAiErrorMessage] = useState<string | null>(null)

  // 3. 음악 추천 상태 (별도 요청)
  const [musicState, setMusicState] = useState<SubFeatureState>("idle")
  const [music, setMusic] = useState<MusicRecommendation | null>(null)
  const [musicErrorMessage, setMusicErrorMessage] = useState<string | null>(null)

  // 4. 단계별 소요 시간 측정
  const [timings, setTimings] = useState<StepTimings>({
    weatherMs: null,
    aiOutfitMs: null,
    musicTotalMs: null,
    geminiMusicMs: null,
    youtubeMs: null,
  })

  // 독립 AbortController들 (지역 변경 시 이전 요청 취소 및 응답 혼선 방지)
  const weatherAbortRef = useRef<AbortController | null>(null)
  const aiAbortRef = useRef<AbortController | null>(null)
  const musicAbortRef = useRef<AbortController | null>(null)

  // 요청 ID 및 활성 지역 ID 추적 (경쟁 상태 및 섞임 방지)
  const activeRequestIdRef = useRef<number>(0)
  const activeRegionIdRef = useRef<string | null>(null)
  // 세션 동안 노출된 음악 ID/제목 추적 (중복 추천 방지)
  const seenMusicIdsRef = useRef<string[]>([])

  // 타이머 관리
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const aiTimeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const musicTimeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearAllTimers = useCallback(() => {
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current)
      timeoutTimerRef.current = null
    }
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current)
      expiryTimerRef.current = null
    }
    if (aiTimeoutTimerRef.current) {
      clearTimeout(aiTimeoutTimerRef.current)
      aiTimeoutTimerRef.current = null
    }
    if (musicTimeoutTimerRef.current) {
      clearTimeout(musicTimeoutTimerRef.current)
      musicTimeoutTimerRef.current = null
    }
  }, [])

  // 모든 진행 중인 비동기 요청 일괄 취소
  const abortAllRequests = useCallback(() => {
    if (weatherAbortRef.current) {
      weatherAbortRef.current.abort()
      weatherAbortRef.current = null
    }
    if (aiAbortRef.current) {
      aiAbortRef.current.abort()
      aiAbortRef.current = null
    }
    if (musicAbortRef.current) {
      musicAbortRef.current.abort()
      musicAbortRef.current = null
    }
  }, [])

  // 지역 선택 해제 또는 초기화
  const resetSelection = useCallback(() => {
    setSelectedRegionId(null)
    setSelectedRegionLabel(null)
    setValidationError(null)
    seenMusicIdsRef.current = []
  }, [])

  /**
   * 독립 요청: AI 맞춤 옷차림 추천 호출
   */
  const fetchAiOutfit = useCallback(
    async (
      targetWeather: ValidatedWeatherData,
      targetSituation: string,
      targetRequestId: number,
      targetRegionId: string,
    ) => {
      if (aiAbortRef.current) {
        aiAbortRef.current.abort()
        aiAbortRef.current = null
      }
      if (aiTimeoutTimerRef.current) {
        clearTimeout(aiTimeoutTimerRef.current)
        aiTimeoutTimerRef.current = null
      }

      const cleanSit = (targetSituation || "").trim()
      if (!cleanSit) {
        setAiRecommendation(null)
        setAiState("idle")
        setAiErrorMessage(null)
        return
      }

      setAiState("loading")
      setAiErrorMessage(null)

      const controller = new AbortController()
      aiAbortRef.current = controller

      // 8초 독립 타임아웃
      aiTimeoutTimerRef.current = setTimeout(() => {
        controller.abort()
      }, 8000)

      const startMs = performance.now()

      try {
        const response = await fetch("/api/recommendation/ai-outfit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            weather: targetWeather,
            situation: cleanSit,
          }),
          signal: controller.signal,
        })

        if (aiTimeoutTimerRef.current) {
          clearTimeout(aiTimeoutTimerRef.current)
          aiTimeoutTimerRef.current = null
        }

        // 이전 요청이거나 다른 지역으로 변경된 경우 무시 (응답 섞임 방지)
        if (
          activeRequestIdRef.current !== targetRequestId ||
          activeRegionIdRef.current !== targetRegionId
        ) {
          return
        }

        const elapsedMs = Math.round(performance.now() - startMs)
        setTimings((prev) => ({ ...prev, aiOutfitMs: elapsedMs }))

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          setAiState("error")
          setAiErrorMessage(errData.error || "AI 추천을 불러오지 못했어요. 기본 추천을 유지합니다.")
          return
        }

        const data = await response.json()
        if (data.recommendation) {
          setAiRecommendation(data.recommendation)
          setAiState("success")
          console.log(`[Performance Trace] 👗 AI 맞춤 옷차림 응답 완료: ${elapsedMs}ms`)
        } else {
          setAiState("error")
          setAiErrorMessage("AI 추천 결과가 없습니다.")
        }
      } catch (err: any) {
        if (
          activeRequestIdRef.current !== targetRequestId ||
          activeRegionIdRef.current !== targetRegionId
        ) {
          return
        }
        if (err.name === "AbortError") {
          setAiState("error")
          setAiErrorMessage("AI 추천 응답이 지연되어 기본 추천을 표시합니다.")
        } else {
          setAiState("error")
          setAiErrorMessage("AI 추천 통신 오류가 발생했습니다.")
        }
      }
    },
    [],
  )

  /**
   * 독립 요청: 음악 추천 호출
   */
  const fetchMusic = useCallback(
    async (
      targetWeather: ValidatedWeatherData,
      targetSituation: string | undefined,
      targetRequestId: number,
      targetRegionId: string,
      customExcludedIds?: string[],
    ) => {
      if (musicAbortRef.current) {
        musicAbortRef.current.abort()
        musicAbortRef.current = null
      }
      if (musicTimeoutTimerRef.current) {
        clearTimeout(musicTimeoutTimerRef.current)
        musicTimeoutTimerRef.current = null
      }

      setMusicState("loading")
      setMusicErrorMessage(null)

      const controller = new AbortController()
      musicAbortRef.current = controller

      // 8초 독립 타임아웃
      musicTimeoutTimerRef.current = setTimeout(() => {
        controller.abort()
      }, 8000)

      const startMs = performance.now()
      const excluded = customExcludedIds || seenMusicIdsRef.current

      try {
        const response = await fetch("/api/recommendation/music", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            weather: targetWeather,
            situation: targetSituation?.trim() || undefined,
            excludedSongIds: excluded,
          }),
          signal: controller.signal,
        })

        if (musicTimeoutTimerRef.current) {
          clearTimeout(musicTimeoutTimerRef.current)
          musicTimeoutTimerRef.current = null
        }

        // 이전 요청이거나 다른 지역으로 변경된 경우 무시 (응답 섞임 방지)
        if (
          activeRequestIdRef.current !== targetRequestId ||
          activeRegionIdRef.current !== targetRegionId
        ) {
          return
        }

        const elapsedMs = Math.round(performance.now() - startMs)

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          setMusicState("error")
          setMusicErrorMessage(errData.error || "음악 추천을 불러오지 못했습니다.")
          return
        }

        const data = await response.json()
        if (data.music) {
          setMusic(data.music)
          setMusicState("success")

          // 세션 히스토리에 현재 트랙 추가하여 '다른 곡 추천' 시 중복 배제
          const trackKey = data.music.songTitle || data.music.videoId || data.music.title
          if (trackKey && !seenMusicIdsRef.current.includes(trackKey)) {
            seenMusicIdsRef.current.push(trackKey)
          }

          const timing = data.timing || {}
          setTimings((prev) => ({
            ...prev,
            musicTotalMs: elapsedMs,
            geminiMusicMs: timing.geminiElapsedMs || null,
            youtubeMs: timing.youtubeElapsedMs || null,
          }))
          console.log(
            `[Performance Trace] 🎵 음악 추천 완료: 전체 ${elapsedMs}ms (Gemini: ${timing.geminiElapsedMs || 0}ms, YouTube: ${timing.youtubeElapsedMs || 0}ms)`,
          )
        } else {
          setMusicState("error")
          setMusicErrorMessage("추천 음악이 없습니다.")
        }
      } catch (err: any) {
        if (
          activeRequestIdRef.current !== targetRequestId ||
          activeRegionIdRef.current !== targetRegionId
        ) {
          return
        }
        if (err.name === "AbortError") {
          setMusicState("error")
          setMusicErrorMessage("음악 조회가 지연되었습니다.")
        } else {
          setMusicState("error")
          setMusicErrorMessage("음악 추천 연결 중 오류가 발생했습니다.")
        }
      }
    },
    [],
  )

  /**
   * 1단계 기상청 날씨 조회 (기상청 날씨와 기본 규칙 옷차림을 먼저 즉시 표시)
   */
  const fetchWeatherForRegion = useCallback(
    async (regionId: string, targetSituation?: string) => {
      // 1. 이전 지역에 대한 모든 진행 중인 요청 취소
      abortAllRequests()
      clearAllTimers()

      // 2. 새 요청 ID 및 지역 ID 등록
      activeRequestIdRef.current += 1
      const currentRequestId = activeRequestIdRef.current
      activeRegionIdRef.current = regionId

      // 3. 지역 변경 즉시 이전 날씨와 추천 숨김
      setWeather(null)
      setBasicRecommendation(null)
      setAiRecommendation(null)
      setMusic(null)
      setErrorMessage(null)
      setAiErrorMessage(null)
      setMusicErrorMessage(null)
      setState("loading")
      setAiState("idle")
      setMusicState("idle")
      seenMusicIdsRef.current = []

      const controller = new AbortController()
      weatherAbortRef.current = controller

      // 10초 기상청 타임아웃
      timeoutTimerRef.current = setTimeout(() => {
        if (activeRequestIdRef.current === currentRequestId) {
          controller.abort()
          setState("error_timeout")
          setErrorMessage("날씨 조회가 지연되고 있어요. 다시 시도해 주세요.")
        }
      }, 10000)

      const weatherStartMs = performance.now()

      try {
        const response = await fetch(`/api/weather?regionId=${encodeURIComponent(regionId)}`, {
          signal: controller.signal,
          cache: "no-store",
        })

        // 요청 순서 역전 방지 (EX-12)
        if (
          activeRequestIdRef.current !== currentRequestId ||
          activeRegionIdRef.current !== regionId
        ) {
          return
        }

        clearAllTimers()

        const payload = await response.json()
        const weatherElapsedMs = Math.round(performance.now() - weatherStartMs)
        setTimings((prev) => ({ ...prev, weatherMs: weatherElapsedMs }))

        if (!response.ok) {
          if (response.status === 429) {
            setState("error_rate_limit")
            setErrorMessage(payload.error || "날씨 정보를 잠시 이용할 수 없어요. 잠시 후 다시 시도해 주세요.")
            return
          }
          if (payload.errorType === "INCOMPLETE_REGION_SELECTION") {
            setState("error_generic")
            setErrorMessage(payload.error || "시·도, 시·군·구, 읍·면·동을 모두 선택해야 합니다.")
            return
          }
          if (payload.errorType === "TIMEOUT") {
            setState("error_timeout")
            setErrorMessage(payload.error || "날씨 조회가 지연되고 있어요. 다시 시도해 주세요.")
            return
          }
          if (payload.errorType === "INVALID_TEMPERATURE") {
            setState("error_invalid_temp")
            setErrorMessage(payload.error || "기온을 확인할 수 없어 옷차림을 추천하지 못했어요.")
            return
          }
          if (
            payload.errorType === "EXPIRED_REFERENCE_TIME" ||
            payload.errorType === "FUTURE_REFERENCE_TIME"
          ) {
            setState("error_expired")
            setErrorMessage(payload.error || "현재 기준으로 사용할 수 있는 날씨 정보가 아니에요. 다시 확인해 주세요.")
            return
          }

          setState("error_network")
          setErrorMessage(payload.error || "날씨를 불러오지 못했어요. 연결을 확인한 뒤 다시 시도해 주세요.")
          return
        }

        // 성공 응답: 기상청 날씨와 기본 규칙 기반 옷차림을 먼저 즉시 화면에 렌더링!
        const fetchedWeather = payload.weather as ValidatedWeatherData
        const fetchedRecommendation = payload.recommendation as OutfitRecommendation

        setWeather(fetchedWeather)
        setBasicRecommendation(fetchedRecommendation)

        if (fetchedWeather.weatherDescription === null || fetchedWeather.rainfallAmount === null) {
          setState("partial")
        } else {
          setState("success")
        }

        console.log(`[Performance Trace] 🌤️ 기상청 날씨 로드 완료: ${weatherElapsedMs}ms`)

        // 3시간 화면 체류 만료 타이머 등록
        const ageMs = Math.max(0, Date.now() - fetchedWeather.referenceAt)
        const remainingValidMs = Math.max(0, THREE_HOURS_MS - ageMs)

        if (remainingValidMs > 0) {
          expiryTimerRef.current = setTimeout(() => {
            if (activeRequestIdRef.current === currentRequestId) {
              setState("error_expired")
              setErrorMessage("날씨 정보가 만료되었어요. 최신 날씨를 다시 확인해 주세요.")
            }
          }, remainingValidMs)
        }

        // 2단계: AI 맞춤 추천과 음악 추천을 백그라운드에서 별도 비동기 요청으로 호출!
        const currentSit = targetSituation !== undefined ? targetSituation : situation

        if (currentSit && currentSit.trim().length > 0) {
          fetchAiOutfit(fetchedWeather, currentSit, currentRequestId, regionId)
        }

        fetchMusic(fetchedWeather, currentSit, currentRequestId, regionId)
      } catch (err: any) {
        if (
          activeRequestIdRef.current !== currentRequestId ||
          activeRegionIdRef.current !== regionId
        ) {
          return
        }
        if (err.name === "AbortError") {
          setState("error_timeout")
          setErrorMessage("날씨 조회가 지연되고 있어요. 다시 시도해 주세요.")
        } else {
          setState("error_network")
          setErrorMessage("날씨를 불러오지 못했어요. 연결을 확인한 뒤 다시 시도해 주세요.")
        }
      }
    },
    [abortAllRequests, clearAllTimers, fetchAiOutfit, fetchMusic, situation],
  )

  /**
   * 지역 선택 (요구사항: 선택한 지역만 입력값에 저장하고 즉시 날씨를 조회하지 않음)
   */
  const selectRegion = useCallback(
    (regionId: string, label?: string, customSituation?: string) => {
      if (!regionId || regionId.trim() === "") {
        setSelectedRegionId(null)
        setSelectedRegionLabel(null)
        return
      }
      setSelectedRegionId(regionId)
      if (label) setSelectedRegionLabel(label)
      if (customSituation !== undefined) setSituation(customSituation)
      setValidationError(null)
    },
    [],
  )

  /**
   * 사용자가 상황을 입력하고 설정할 때:
   * (요구사항: 조건을 수정해도 자동으로 재조회하지 않고, '추천받기' 버튼 클릭 시 일괄 반영)
   */
  const applySituation = useCallback((newSituation: string) => {
    setSituation(newSituation)
  }, [])

  /**
   * '추천받기' 버튼 클릭 핸들러 (요구사항: 필수 입력 검증 후 날씨 조회 실행, 중복 방지)
   */
  const executeRecommendation = useCallback(async () => {
    if (state === "loading") {
      return
    }

    if (!selectedRegionId) {
      setValidationError("지역을 먼저 선택해 주세요. (시·도, 시·군·구, 읍·면·동 모두 선택)")
      return
    }

    setValidationError(null)
    await fetchWeatherForRegion(selectedRegionId, situation)
  }, [fetchWeatherForRegion, selectedRegionId, situation, state])

  /**
   * AI 옷차림 추천만 단독 재시도
   */
  const retryAiOutfit = useCallback(() => {
    if (!weather || !selectedRegionId || !situation) return
    fetchAiOutfit(weather, situation, activeRequestIdRef.current, selectedRegionId)
  }, [fetchAiOutfit, selectedRegionId, situation, weather])

  /**
   * 음악 추천만 단독 재시도
   */
  const retryMusic = useCallback(() => {
    if (!weather || !selectedRegionId) return
    fetchMusic(weather, situation, activeRequestIdRef.current, selectedRegionId)
  }, [fetchMusic, selectedRegionId, situation, weather])

  /**
   * '다른 곡 추천' (세션 히스토리를 제외하여 새로운 곡 선곡)
   */
  const fetchNextMusicTrack = useCallback(() => {
    if (!weather || !selectedRegionId) return
    if (music) {
      const currentTrackKey = music.songTitle || music.videoId || music.title
      if (currentTrackKey && !seenMusicIdsRef.current.includes(currentTrackKey)) {
        seenMusicIdsRef.current.push(currentTrackKey)
      }
    }
    fetchMusic(weather, situation, activeRequestIdRef.current, selectedRegionId, [...seenMusicIdsRef.current])
  }, [fetchMusic, music, selectedRegionId, situation, weather])

  /**
   * 날씨 새로고침 (카드의 새로고침 버튼 등)
   */
  const refresh = useCallback(
    (customSituation?: string) => {
      if (!selectedRegionId) return
      const sit = customSituation !== undefined ? customSituation : situation
      fetchWeatherForRegion(selectedRegionId, sit)
    },
    [fetchWeatherForRegion, selectedRegionId, situation],
  )

  useEffect(() => {
    return () => {
      clearAllTimers()
      abortAllRequests()
    }
  }, [abortAllRequests, clearAllTimers])

  // AI 추천이 있으면 AI 추천을, 없으면 기본 규칙 추천을 반환
  const activeRecommendation = aiRecommendation || basicRecommendation

  return {
    selectedCity: selectedRegionId,
    selectedRegionId,
    selectedRegionLabel,
    situation,
    setSituation,
    validationError,
    setValidationError,

    state,
    weather,
    recommendation: activeRecommendation,
    errorMessage,
    isFetching: state === "loading",

    aiState,
    aiErrorMessage,
    retryAiOutfit,

    musicState,
    music,
    musicErrorMessage,
    retryMusic,
    fetchNextMusicTrack,

    timings,

    selectCity: selectRegion,
    selectRegion,
    applySituation,
    resetSelection,
    refresh,
    executeRecommendation,
  }
}
