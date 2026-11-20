"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { OutfitRecommendation, ValidatedWeatherData } from "@/lib/domain/types"
import { THREE_HOURS_MS } from "@/lib/domain/validator"

export type WeatherViewState =
  | "idle" // 초기 상태: 지역 미선택
  | "loading" // 조회 중
  | "success" // 정상 표시
  | "partial" // 일부 정보 누락 상태
  | "error_network" // 연결 문제
  | "error_timeout" // 10초 지연
  | "error_rate_limit" // 제공처 제한/장애
  | "error_invalid_temp" // 기온 누락
  | "error_expired" // 3시간 초과 오래된 정보
  | "error_generic" // 기타 오류

export interface UseWeatherRecommendationReturn {
  selectedCity: string | null
  selectedRegionId: string | null
  selectedRegionLabel: string | null
  state: WeatherViewState
  weather: ValidatedWeatherData | null
  recommendation: OutfitRecommendation | null
  errorMessage: string | null
  selectCity: (regionId: string, label?: string) => void
  selectRegion: (regionId: string, label?: string) => void
  refresh: () => void
  isFetching: boolean
}

export function useWeatherRecommendation(): UseWeatherRecommendationReturn {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)
  const [selectedRegionLabel, setSelectedRegionLabel] = useState<string | null>(null)
  const [state, setState] = useState<WeatherViewState>("idle")
  const [weather, setWeather] = useState<ValidatedWeatherData | null>(null)
  const [recommendation, setRecommendation] = useState<OutfitRecommendation | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const activeAbortController = useRef<AbortController | null>(null)
  const activeRequestId = useRef<number>(0)
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearAllTimers = useCallback(() => {
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current)
      timeoutTimerRef.current = null
    }
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current)
      expiryTimerRef.current = null
    }
  }, [])

  const fetchWeatherForRegion = useCallback(
    async (regionId: string) => {
      if (activeAbortController.current) {
        activeAbortController.current.abort()
        activeAbortController.current = null
      }

      clearAllTimers()

      // EX-12: 최신 요청 ID 발급하여 이전 요청 응답 폐기
      activeRequestId.current += 1
      const currentRequestId = activeRequestId.current

      // 지역 변경 즉시 이전 날씨와 추천 숨김
      setWeather(null)
      setRecommendation(null)
      setErrorMessage(null)
      setState("loading")

      const controller = new AbortController()
      activeAbortController.current = controller

      // EX-03: 10초 클라이언트 타임아웃
      timeoutTimerRef.current = setTimeout(() => {
        if (activeRequestId.current === currentRequestId) {
          controller.abort()
          setState("error_timeout")
          setErrorMessage("날씨 조회가 지연되고 있어요. 다시 시도해 주세요.")
        }
      }, 10000)

      try {
        const response = await fetch(`/api/weather?regionId=${encodeURIComponent(regionId)}`, {
          signal: controller.signal,
          cache: "no-store",
        })

        // 요청 순서 역전 방지 (EX-12)
        if (activeRequestId.current !== currentRequestId) {
          return
        }

        clearAllTimers()

        const payload = await response.json()

        if (!response.ok) {
          if (response.status === 429) {
            setState("error_rate_limit")
            setErrorMessage(payload.error || "날씨 정보를 잠시 이용할 수 없어요. 잠시 후 다시 시도해 주세요.")
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

          if (payload.errorType === "EXPIRED_REFERENCE_TIME" || payload.errorType === "FUTURE_REFERENCE_TIME") {
            setState("error_expired")
            setErrorMessage(payload.error || "현재 기준으로 사용할 수 있는 날씨 정보가 아니에요. 다시 확인해 주세요.")
            return
          }

          setState("error_network")
          setErrorMessage(payload.error || "날씨를 불러오지 못했어요. 연결을 확인한 뒤 다시 시도해 주세요.")
          return
        }

        // 성공 응답 처리
        const fetchedWeather = payload.weather as ValidatedWeatherData
        const fetchedRecommendation = payload.recommendation as OutfitRecommendation

        setWeather(fetchedWeather)
        setRecommendation(fetchedRecommendation)

        if (fetchedWeather.weatherDescription === null || fetchedWeather.rainfallAmount === null) {
          setState("partial")
        } else {
          setState("success")
        }

        // 화면 체류 중 3시간 만료 감지 타이머
        const now = Date.now()
        const elapsedSinceRef = now - fetchedWeather.referenceAt
        const remainingUntilExpired = THREE_HOURS_MS - elapsedSinceRef

        if (remainingUntilExpired > 0) {
          expiryTimerRef.current = setTimeout(() => {
            if (activeRequestId.current === currentRequestId) {
              setWeather(null)
              setRecommendation(null)
              setState("error_expired")
              setErrorMessage("현재 기준으로 사용할 수 있는 날씨 정보가 아니에요. 다시 확인해 주세요.")
            }
          }, remainingUntilExpired)
        } else {
          setState("error_expired")
          setErrorMessage("현재 기준으로 사용할 수 있는 날씨 정보가 아니에요. 다시 확인해 주세요.")
        }
      } catch (err: any) {
        if (activeRequestId.current !== currentRequestId) {
          return
        }

        clearAllTimers()

        if (err.name === "AbortError") {
          if (state !== "error_timeout") {
            setState("error_timeout")
            setErrorMessage("날씨 조회가 지연되고 있어요. 다시 시도해 주세요.")
          }
          return
        }

        setState("error_network")
        setErrorMessage("날씨를 불러오지 못했어요. 연결을 확인한 뒤 다시 시도해 주세요.")
      }
    },
    [clearAllTimers, state],
  )

  const selectRegion = useCallback(
    (regionId: string, label?: string) => {
      if (state === "loading" && selectedRegionId === regionId) {
        return
      }
      setSelectedRegionId(regionId)
      if (label) setSelectedRegionLabel(label)
      fetchWeatherForRegion(regionId)
    },
    [fetchWeatherForRegion, selectedRegionId, state],
  )

  const refresh = useCallback(() => {
    if (!selectedRegionId || state === "loading") {
      return
    }
    fetchWeatherForRegion(selectedRegionId)
  }, [fetchWeatherForRegion, selectedRegionId, state])

  useEffect(() => {
    return () => {
      clearAllTimers()
      if (activeAbortController.current) {
        activeAbortController.current.abort()
      }
    }
  }, [clearAllTimers])

  return {
    selectedCity: selectedRegionId,
    selectedRegionId,
    selectedRegionLabel,
    state,
    weather,
    recommendation,
    errorMessage,
    selectCity: selectRegion,
    selectRegion,
    refresh,
    isFetching: state === "loading",
  }
}
