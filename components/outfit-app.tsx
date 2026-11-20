"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, CloudSun, MapPin, Shirt } from "lucide-react"
import { PreviewControls, type PreviewMode, type TimeChoice } from "@/components/preview-controls"
import { RegionSelector } from "@/components/region-selector"
import { WeatherPanels } from "@/components/weather-panels"
import {
  createPreviewWeather,
  REGIONS,
  type Precipitation,
  type PreviewWeather,
  type Region,
} from "@/lib/weather-data"

type ViewMode = "idle" | "loading" | "success" | "missing" | "error" | "delayed" | "expired" | "unsupported" | "recommendation-error" | "provider-error"

export function OutfitApp() {
  const [region, setRegion] = useState<Region | null>(null)
  const [weather, setWeather] = useState<PreviewWeather | null>(null)
  const [mode, setMode] = useState<ViewMode>("idle")
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [listFailed, setListFailed] = useState(false)
  const [temperatureOverride, setTemperatureOverride] = useState<number | null>(null)
  const [precipitationOverride, setPrecipitationOverride] = useState<Precipitation | null>(null)
  const [timeChoice, setTimeChoice] = useState<TimeChoice>("current")
  const [selectorKey, setSelectorKey] = useState(0)
  const requestId = useRef(0)
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timeoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearTimers() {
    if (completionTimer.current) clearTimeout(completionTimer.current)
    if (timeoutTimer.current) clearTimeout(timeoutTimer.current)
    completionTimer.current = null
    timeoutTimer.current = null
  }

  function invalidateRequest() {
    requestId.current += 1
    clearTimers()
  }

  function buildWeather(nextRegion: Region, options?: { omitRainfall?: boolean; time?: TimeChoice }) {
    const selectedTime = options?.time ?? timeChoice
    const offset = selectedTime === "old" ? -4 * 60 * 60 * 1000 : selectedTime === "future" ? 60 * 60 * 1000 : 0
    return createPreviewWeather(nextRegion, {
      temperature: temperatureOverride ?? undefined,
      precipitation: precipitationOverride ?? undefined,
      omitRainfall: options?.omitRainfall,
      referenceOffsetMs: offset,
    })
  }

  function runLookup(nextRegion: Region) {
    if (mode === "loading" && region?.id === nextRegion.id) return
    invalidateRequest()
    const currentRequest = requestId.current
    setRegion(nextRegion)
    setWeather(null)
    setMissingFields([])
    setListFailed(false)
    setMode("loading")

    timeoutTimer.current = setTimeout(() => {
      if (requestId.current !== currentRequest) return
      clearTimers()
      setWeather(null)
      setMode("delayed")
    }, 10_000)

    completionTimer.current = setTimeout(() => {
      if (requestId.current !== currentRequest) return
      clearTimers()
      setWeather(buildWeather(nextRegion))
      setMode("success")
    }, 650)
  }

  function handlePreviewMode(previewMode: PreviewMode) {
    invalidateRequest()

    if (previewMode === "idle") {
      setRegion(null)
      setWeather(null)
      setMode("idle")
      setListFailed(false)
      setMissingFields([])
      setSelectorKey((key) => key + 1)
      return
    }

    if (previewMode === "region-list-error") {
      setRegion(null)
      setWeather(null)
      setMode("idle")
      setListFailed(true)
      return
    }

    const nextRegion = region ?? REGIONS[0]
    setRegion(nextRegion)
    setListFailed(false)
    setMissingFields([])
    setWeather(null)

    if (previewMode === "loading") {
      setMode("loading")
      const currentRequest = requestId.current
      timeoutTimer.current = setTimeout(() => {
        if (requestId.current !== currentRequest) return
        clearTimers()
        setMode("delayed")
      }, 10_000)
      return
    }

    if (previewMode === "missing") {
      setMissingFields(["기온", "기준 시각", "출처", "정보 유형"])
      setMode("missing")
      return
    }

    if (previewMode === "error" || previewMode === "delayed" || previewMode === "expired" || previewMode === "unsupported" || previewMode === "provider-error") {
      if (previewMode === "expired") {
        setWeather(buildWeather(nextRegion, { time: "old" }))
      }
      setMode(previewMode)
      return
    }

    const precipitation = previewMode === "precipitation-unknown" ? "unknown" : previewMode === "rainfall-missing" ? "rain" : undefined
    const nextWeather = createPreviewWeather(nextRegion, {
      temperature: temperatureOverride ?? undefined,
      precipitation: precipitation ?? precipitationOverride ?? undefined,
      omitRainfall: previewMode === "rainfall-missing",
      referenceOffsetMs: timeChoice === "old" ? -4 * 60 * 60 * 1000 : timeChoice === "future" ? 60 * 60 * 1000 : 0,
    })
    setWeather(nextWeather)
    setMode(previewMode === "recommendation-error" ? "recommendation-error" : "success")
  }

  function changeTemperature(temperature: number | null) {
    setTemperatureOverride(temperature)
    if (!region || !weather || (mode !== "success" && mode !== "recommendation-error")) return
    const next = createPreviewWeather(region, {
      temperature: temperature ?? region.temperature,
      precipitation: weather.precipitation,
      omitRainfall: weather.rainfallAmount === undefined && ["rain", "snow", "mixed"].includes(weather.precipitation),
    })
    next.queriedAt = weather.queriedAt
    next.referenceAt = weather.referenceAt
    setWeather(next)
  }

  function changePrecipitation(precipitation: Precipitation | null) {
    setPrecipitationOverride(precipitation)
    if (!region || !weather || (mode !== "success" && mode !== "recommendation-error")) return
    const next = createPreviewWeather(region, {
      temperature: weather.temperature,
      precipitation: precipitation ?? region.precipitation,
    })
    next.queriedAt = weather.queriedAt
    next.referenceAt = weather.referenceAt
    setWeather(next)
  }

  function changeTime(time: TimeChoice) {
    setTimeChoice(time)
    if (!region || !weather || (mode !== "success" && mode !== "recommendation-error")) return
    const offset = time === "old" ? -4 * 60 * 60 * 1000 : time === "future" ? 60 * 60 * 1000 : 0
    setWeather({ ...weather, referenceAt: Date.now() + offset })
  }

  function resetForRefresh() {
    if (!region) return
    runLookup(region)
  }

  function retryRegionList() {
    setListFailed(false)
  }

  function focusRegionSelector() {
    document.getElementById("region-heading")?.scrollIntoView({ behavior: "smooth", block: "center" })
    window.setTimeout(() => {
      const searchInput = document.getElementById("region-search-input")
      const stepSelect = document.querySelector<HTMLSelectElement>(".step-fields select")
      ;(searchInput ?? stepSelect)?.focus()
    }, 120)
  }

  useEffect(() => () => {
    invalidateRequest()
  }, [])

  useEffect(() => {
    if (!weather || (mode !== "success" && mode !== "recommendation-error")) return

    const referenceTime = weather.referenceAt
    const currentTime = Date.now()
    if (referenceTime > currentTime || currentTime - referenceTime > 3 * 60 * 60 * 1000) {
      setMode("expired")
      return
    }

    const expiryDelay = referenceTime + 3 * 60 * 60 * 1000 - currentTime + 1
    const expiryTimer = setTimeout(() => setMode("expired"), expiryDelay)
    return () => clearTimeout(expiryTimer)
  }, [weather, mode])

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="오늘의 겉옷 처음으로">
          <span className="brand-mark" aria-hidden="true"><Shirt size={20} strokeWidth={1.8} /></span>
          <span className="brand-name">오늘의 겉옷</span>
        </a>
        <p className="brand-tagline">지금 날씨에 맞춰, 가볍게 골라 입어요.</p>
      </header>

      <main className="main-content" id="top">
        <div className="preview-banner" role="note">
          <span className="preview-banner-icon"><CloudSun size={16} /></span>
          <strong>디자인 미리보기 · 예시 데이터</strong>
          <span className="preview-banner-divider" aria-hidden="true" />
          <span>전국 선택 UI 미리보기 · 일부 예시 지역</span>
        </div>

        {mode === "idle" && !region ? (
          <section className="intro-row" aria-labelledby="intro-heading">
            <div>
              <span className="eyebrow">A SMALL NOTE BEFORE YOU GO</span>
              <h1 id="intro-heading">나가기 전, 옷 고민을 덜어보세요.</h1>
              <p>지역을 선택하면 현재 날씨에 맞는 옷차림을 알려드려요.</p>
            </div>
            <div className="intro-art" aria-hidden="true">
              <svg viewBox="0 0 160 120">
                <path d="M78 19c-1-8 4-13 10-13 6 0 10 5 10 10 0 5-3 8-7 11" fill="none" stroke="#315CF5" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M91 38 45 57l-26 43h111l-24-43-15-19Z" fill="#CAD5EE" stroke="#315CF5" strokeWidth="2.5" strokeLinejoin="round" />
                <path d="m65 49 15 16 15-16M80 65v35" fill="none" stroke="#315CF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M34 101h96" stroke="#A7B1C4" strokeWidth="2" strokeLinecap="round" />
                <circle cx="131" cy="26" r="10" fill="#F1DFAB" />
                <path d="M131 10v-5m0 42v-5m16-16h5m-42 0h5m27-11 4-4m-30 30 4-4m22 0 4 4m-30-30 4 4" stroke="#B98A36" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>오늘도 가볍게</span>
            </div>
          </section>
        ) : null}

        <RegionSelector
          key={selectorKey}
          selectedRegion={region}
          onSelect={runLookup}
          listFailed={listFailed}
          onRetryList={retryRegionList}
        />

        {mode === "idle" && !region ? (
          <p className="privacy-note"><MapPin size={15} />위치 권한을 요청하지 않아요. 원하는 지역을 직접 골라 주세요.</p>
        ) : null}

        <WeatherPanels
          region={region}
          weather={weather}
          mode={mode}
          missingFields={missingFields}
          onRetry={resetForRefresh}
          onChangeRegion={focusRegionSelector}
        />

        <PreviewControls
          onModeChange={handlePreviewMode}
          onTemperatureChange={changeTemperature}
          onPrecipitationChange={changePrecipitation}
          onTimeChange={changeTime}
        />

        <footer className="page-footer">
          <span><span className="footer-dot" />오늘의 겉옷</span>
          <p>가벼운 외출을 위한 현재 날씨 참고 정보</p>
          <a href="#region-heading">지역 선택으로 <ArrowRight size={14} /></a>
        </footer>
      </main>
    </div>
  )
}
