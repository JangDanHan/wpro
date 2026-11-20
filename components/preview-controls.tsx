"use client"

import { useState } from "react"
import { ChevronDown, FlaskConical, RotateCcw } from "lucide-react"
import type { Precipitation } from "@/lib/weather-data"

export type PreviewMode =
  | "idle"
  | "loading"
  | "success"
  | "missing"
  | "error"
  | "delayed"
  | "expired"
  | "unsupported"
  | "recommendation-error"
  | "provider-error"
  | "rainfall-missing"
  | "precipitation-unknown"
  | "region-list-error"

export type TemperatureChoice = "sample" | "below-zero" | "cold" | "cool" | "mild" | "light" | "warm" | "hot"
export type PrecipitationChoice = "sample" | Precipitation
export type TimeChoice = "current" | "old" | "future"

const stateOptions: { id: PreviewMode; label: string }[] = [
  { id: "idle", label: "초기" },
  { id: "loading", label: "조회 중" },
  { id: "success", label: "정상" },
  { id: "missing", label: "정보 누락" },
  { id: "error", label: "조회 실패" },
  { id: "delayed", label: "조회 지연" },
  { id: "expired", label: "정보 만료" },
  { id: "unsupported", label: "지역 미지원" },
  { id: "recommendation-error", label: "추천 오류" },
  { id: "provider-error", label: "제공처 불가" },
  { id: "rainfall-missing", label: "강수량 누락" },
  { id: "precipitation-unknown", label: "강수 확인 불가" },
  { id: "region-list-error", label: "지역 목록 오류" },
]

const temperatureOptions: { id: TemperatureChoice; label: string; value?: number }[] = [
  { id: "sample", label: "지역 예시값" },
  { id: "below-zero", label: "0℃ 미만", value: -2 },
  { id: "cold", label: "0–4℃", value: 4 },
  { id: "cool", label: "5–9℃", value: 5 },
  { id: "mild", label: "10–14℃", value: 10 },
  { id: "light", label: "15–19℃", value: 15 },
  { id: "warm", label: "20–27℃", value: 20 },
  { id: "hot", label: "28℃ 이상", value: 30 },
]

const precipitationOptions: { id: PrecipitationChoice; label: string }[] = [
  { id: "sample", label: "지역 예시값" },
  { id: "none", label: "강수 없음" },
  { id: "rain", label: "비" },
  { id: "snow", label: "눈" },
  { id: "mixed", label: "비·눈 혼합" },
  { id: "unknown", label: "확인 불가" },
]

type PreviewControlsProps = {
  onModeChange: (mode: PreviewMode) => void
  onTemperatureChange: (temperature: number | null) => void
  onPrecipitationChange: (precipitation: Precipitation | null) => void
  onTimeChange: (time: TimeChoice) => void
}

export function PreviewControls({ onModeChange, onTemperatureChange, onPrecipitationChange, onTimeChange }: PreviewControlsProps) {
  const [open, setOpen] = useState(false)
  const [temperature, setTemperature] = useState<TemperatureChoice>("sample")
  const [precipitation, setPrecipitation] = useState<PrecipitationChoice>("sample")
  const [time, setTime] = useState<TimeChoice>("current")

  function handleTemperatureChange(value: TemperatureChoice) {
    setTemperature(value)
    onTemperatureChange(temperatureOptions.find((option) => option.id === value)?.value ?? null)
  }

  function handlePrecipitationChange(value: PrecipitationChoice) {
    setPrecipitation(value)
    onPrecipitationChange(value === "sample" ? null : value)
  }

  function handleTimeChange(value: TimeChoice) {
    setTime(value)
    onTimeChange(value)
  }

  function reset() {
    setTemperature("sample")
    setPrecipitation("sample")
    setTime("current")
    onTemperatureChange(null)
    onPrecipitationChange(null)
    onTimeChange("current")
    onModeChange("idle")
  }

  return (
    <aside className="preview-tools" aria-label="디자인 검토 도구">
      <button className="preview-toggle" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span className="preview-toggle-icon"><FlaskConical size={17} /></span>
        <span><strong>미리보기 상태</strong><small>디자인 확인용 · 실제 날씨 조회와 분리됨</small></span>
        <ChevronDown className={open ? "preview-chevron is-open" : "preview-chevron"} size={18} />
      </button>
      {open ? (
        <div className="preview-content">
          <div className="preview-section">
            <div className="preview-section-heading"><strong>화면 상태</strong><span>직접 전환할 수 있어요</span></div>
            <div className="state-buttons">
              {stateOptions.map((option) => (
                <button key={option.id} type="button" className="state-button" onClick={() => onModeChange(option.id)}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="preview-selects">
            <label className="preview-select-field">
              <span>기온 조건</span>
              <select value={temperature} onChange={(event) => handleTemperatureChange(event.target.value as TemperatureChoice)}>
                {temperatureOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select>
            </label>
            <label className="preview-select-field">
              <span>강수 조건</span>
              <select value={precipitation} onChange={(event) => handlePrecipitationChange(event.target.value as PrecipitationChoice)}>
                {precipitationOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select>
            </label>
            <label className="preview-select-field">
              <span>예시 기준 시각</span>
              <select value={time} onChange={(event) => handleTimeChange(event.target.value as TimeChoice)}>
                <option value="current">현재 예시</option>
                <option value="old">3시간 초과</option>
                <option value="future">미래 시각</option>
              </select>
            </label>
          </div>
          <div className="preview-footer">
            <p>예시 모드의 상태만 전환해요. 외부 API에 요청하지 않습니다.</p>
            <button type="button" className="text-button" onClick={reset}><RotateCcw size={14} />초기화</button>
          </div>
        </div>
      ) : null}
    </aside>
  )
}
