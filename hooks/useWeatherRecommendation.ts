"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { CityId, OutfitRecommendation, ValidatedWeatherData } from "@/lib/domain/types"
import { THREE_HOURS_MS } from "@/lib/domain/validator"

export type WeatherViewState =
  | "idle" // 초기 상태: 도시 미선택 (EX-01)
  | "loading" // 조회 중 (F-08, EX-13)
  | "success" // 정상 표시 (3.2)
  | "partial" // 일부 정보 누락 상태 (EX-08, EX-10)
  | "error_network" // 연결 문제 (EX-02)
  | "error_timeout" // 10초 지연 (EX-03)
  | "error_rate_limit" // 제공처 제한/장애 (EX-04)
  | "error_invalid_temp" // 기온 누락 (EX-05)
  | "error_expired" // 3시간 초과 오래된 정보 (EX-07)
  | "error_generic" // 기타 오류

export interface UseWeatherRecommendationReturn {
  selectedCity: CityId | null
  state: WeatherViewState
  weather: ValidatedWeatherData | null
  recommendation: OutfitRecommendation | null
  errorMessage: string | null
  selectCity: (city: CityId) => void
  refresh: () => void
  isFetching: boolean
}

export function useWeatherRecommendation(): UseWeatherRecommendationReturn {
  const [selectedCity, setSelectedCity] = useState<CityId | null>(null)
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

  const fetchWeatherForCity = useCallback(
    async (city: CityId) => {
      // EX-13: 동일 도시 조회 중 중복 요청 방지
      // (단, 다른 도시로의 변경은 허용)
      if (activeAbortController.current) {
        activeAbortController.current.abort()
        activeAbortController.current = null
      }

      clearAllTimers()

      // EX-12: 최신 요청 ID 발급하여 이전 요청 응답 폐기
      activeRequestId.current += 1
      const currentRequestId = activeRequestId.current

      // 도시 변경 즉시 이전 날씨와 추천 숨김 (F-01, F-08, EX-12)
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
        const response = await fetch(`/api/weather?city=${city}`, {
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

        // 부분 정보 누락 상태 구분 (EX-08 강수량 누락, EX-10 날씨 문구 누락)
        if (fetchedWeather.weatherDescription === null || fetchedWeather.rainfallAmount === null) {
          setState("partial")
        } else {
          setState("success")
        }

        // EX-07, F-04: 화면 체류 중 3시간 만료 감지 타이머 설정
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
          // 이미 timeout 타이머에서 error_timeout으로 처리하지 않은 경우만
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

  const selectCity = useCallback(
    (city: CityId) => {
      // 조회 중 동일 도시 클릭 방지 (EX-13)
      if (state === "loading" && selectedCity === city) {
        return
      }
      setSelectedCity(city)
      fetchWeatherForCity(city)
    },
    [fetchWeatherForCity, selectedCity, state],
  )

  const refresh = useCallback(() => {
    if (!selectedCity || state === "loading") {
      return
    }
    fetchWeatherForCity(selectedCity)
  }, [fetchWeatherForCity, selectedCity, state])

  useEffect(() => {
    return () => {
      clearAllTimers()
      if (activeAbortController.current) {
        activeAbortController.current.abort()
      }
    }
  }, [clearAllTimers])

  return {
    selectedCity,
    state,
    weather,
    recommendation,
    errorMessage,
    selectCity,
    refresh,
    isFetching: state === "loading",
  }
}
