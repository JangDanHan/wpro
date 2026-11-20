import {
  AlertCircle,
  Check,
  CircleCheck,
  CircleHelp,
  CloudRain,
  CloudSnow,
  Clock3,
  Footprints,
  MapPin,
  RefreshCcw,
  Umbrella,
  Wind,
} from "lucide-react"
import {
  formatKoreanTime,
  getOutfitReason,
  getOutfitRule,
  getPrecipitationPreparation,
  PRECIPITATION_LABELS,
  type Precipitation,
  type PreviewWeather,
  type Region,
} from "@/lib/weather-data"

type WeatherMode = "idle" | "loading" | "success" | "missing" | "error" | "delayed" | "expired" | "unsupported" | "recommendation-error" | "provider-error"

type WeatherPanelsProps = {
  region: Region | null
  weather: PreviewWeather | null
  mode: WeatherMode
  missingFields?: string[]
  onRetry: () => void
  onChangeRegion: () => void
}

function PrecipitationIcon({ precipitation }: { precipitation: Precipitation }) {
  if (precipitation === "rain") return <CloudRain size={18} aria-hidden="true" />
  if (precipitation === "snow") return <CloudSnow size={18} aria-hidden="true" />
  if (precipitation === "mixed") return <CloudSnow size={18} aria-hidden="true" />
  if (precipitation === "none") return <CircleCheck size={18} aria-hidden="true" />
  return <CircleHelp size={18} aria-hidden="true" />
}

function WeatherIllustration({ precipitation }: { precipitation: Precipitation }) {
  const Icon = precipitation === "rain" ? CloudRain : precipitation === "snow" || precipitation === "mixed" ? CloudSnow : precipitation === "none" ? CircleCheck : CircleHelp
  return (
    <div className={`weather-illustration weather-${precipitation}`} aria-hidden="true">
      <span className="weather-orbit" />
      <Icon size={62} strokeWidth={1.25} />
    </div>
  )
}

function OutfitIllustration({ outfitId }: { outfitId: string }) {
  const isLight = ["light-layer", "light-clothes", "breezy"].includes(outfitId)
  const isWarm = ["light-clothes", "breezy"].includes(outfitId)
  const isThick = ["winter", "heavy-coat"].includes(outfitId)
  const coatFill = isThick ? "#8A9BCB" : isLight ? "#A9B9D2" : "#6178B3"
  const innerFill = isWarm ? "#E2A67F" : "#E8C99B"

  return (
    <div className="outfit-illustration" aria-hidden="true">
      <svg viewBox="0 0 280 230" role="img">
        <ellipse cx="140" cy="208" rx="100" ry="10" fill="#E8EAE6" />
        <circle cx="221" cy="54" r="28" fill="#F5E8BD" />
        <path d="M215 40v28m-14-14h28m-24-10 20 20m0-20-20 20" stroke="#B98A36" strokeWidth="1.4" strokeLinecap="round" opacity=".8" />
        <path d="M44 72c-8-13 3-27 15-25 2-15 24-18 32-5 15-2 24 13 18 25-8 14-55 18-65 5Z" fill="#EFF3F9" />
        <path d={isWarm ? "M93 71 108 66l18 12h8l18-12 15 5 18 21-16 10-14-15v56h-49V87l-14 15-16-10 18-21Z" : "M84 65 69 79l-17 40 17 7 11-25v64h74v-64l11 25 17-7-17-40-15-14-19 11h-30L84 65Z"} fill={coatFill} />
        <path d="m91 67 16 13 9-14 13 14-18 18-22-18Zm70 0-16 13-9-14-13 14 18 18 22-18Z" fill={isLight ? "#8798B7" : "#42598F"} />
        <path d="M116 66c3 8 8 13 14 14 6-1 11-6 14-14l-14 7-14-7Z" fill={innerFill} />
        <path d={isWarm ? "M109 83h36v54h-36z" : "M114 94h32v67h-32z"} fill={innerFill} />
        <path d={isWarm ? "M127 85v48" : "M130 96v57"} stroke="#B58A59" strokeWidth="1.5" strokeDasharray="2 5" />
        <circle cx="137" cy="112" r="2" fill="#54688F" />
        <circle cx="137" cy="128" r="2" fill="#54688F" />
        <path d={isWarm ? "M106 138h62v8c0 5-4 9-9 9h-44c-5 0-9-4-9-9v-8Z" : "M83 165h72v9c0 6-5 11-11 11H94c-6 0-11-5-11-11v-9Z"} fill={isWarm ? "#7285AA" : "#455475"} />
        {isThick ? <path d="M109 47c3-15 14-23 21-23s18 8 21 23l-7 4-14-7-14 7-7-4Z" fill="#D7E1F1" /> : null}
        {isWarm ? (
          <path d="M106 155h28v24l-28-1v-23Zm34 0h28v23l-28 1v-24Z" fill="#8291A8" stroke="#53627A" strokeWidth="2" />
        ) : (
          <path d="M88 178v18h34v-18m10 0v18h34v-18" fill="#8793A4" stroke="#53627A" strokeWidth="2" />
        )}
        <path d="M81 198h42c1 5-3 9-9 9H79c-5 0-7-4-5-7l7-2Zm51 0h42c1 5-3 9-9 9h-35c-5 0-7-4-5-7l7-2Z" fill="#39465B" />
        {outfitId === "winter" ? <path d="M106 83c8 7 35 7 48 0v12c-12 9-36 9-48 0V83Z" fill="#D7E1F1" /> : null}
      </svg>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <section className="result-grid" aria-label="날씨 조회 중">
      <div className="weather-card loading-card" aria-hidden="true">
        <div className="skeleton-line skeleton-short" />
        <div className="skeleton-weather-row"><div className="skeleton-temp" /><div className="skeleton-cloud" /></div>
        <div className="skeleton-line" />
        <div className="skeleton-line skeleton-medium" />
      </div>
      <div className="recommendation-card loading-card" aria-hidden="true">
        <div className="skeleton-line skeleton-short" />
        <div className="skeleton-outfit-row"><div className="skeleton-copy"><div className="skeleton-title" /><div className="skeleton-line" /><div className="skeleton-line skeleton-medium" /></div><div className="skeleton-art" /></div>
        <div className="skeleton-line skeleton-medium" />
      </div>
    </section>
  )
}

function StatusPanel({ mode, region, weather, missingFields, onRetry, onChangeRegion }: WeatherPanelsProps) {
  const configs: Record<Exclude<WeatherMode, "idle" | "loading" | "success" | "recommendation-error">, { icon: typeof AlertCircle; title: string; description: string; tone: string }> = {
    missing: {
      icon: AlertCircle,
      title: "필수 날씨 정보를 확인할 수 없어요.",
      description: `누락 항목: ${missingFields?.join(" · ") || "기온 · 기준 시각 · 출처 · 정보 유형"}. 정보를 다시 확인해 주세요.`,
      tone: "status-error",
    },
    error: {
      icon: AlertCircle,
      title: "날씨를 불러오지 못했어요. 다시 시도해 주세요.",
      description: "확인되지 않은 날씨나 다른 지역의 정보로 대신하지 않았어요.",
      tone: "status-error",
    },
    delayed: {
      icon: Clock3,
      title: "날씨 조회가 지연되고 있어요. 다시 시도해 주세요.",
      description: "10초 안에 도착하지 않은 조회 결과는 사용하지 않아요.",
      tone: "status-warning",
    },
    expired: {
      icon: Clock3,
      title: "현재 기준으로 사용할 수 있는 날씨 정보가 아니에요.",
      description: weather ? `예시 기준 시각 · ${formatKoreanTime(weather.referenceAt)} (한국 시간)` : "기준 시각을 확인할 수 없어요.",
      tone: "status-warning",
    },
    unsupported: {
      icon: MapPin,
      title: "이 지역의 날씨는 현재 제공하지 못해요.",
      description: "날씨를 임의로 바꾸지 않았어요. 다른 지역을 선택해 주세요.",
      tone: "status-warning",
    },
    "provider-error": {
      icon: AlertCircle,
      title: "날씨 정보를 잠시 이용할 수 없어요.",
      description: "잠시 후 다시 시도해 주세요. 자동으로 반복 요청하지 않아요.",
      tone: "status-error",
    },
  }

  const config = configs[mode as keyof typeof configs]
  if (!config) return null
  const Icon = config.icon

  return (
    <section className={`status-panel ${config.tone}`} role="alert" aria-live="assertive">
      <span className="status-icon"><Icon size={20} aria-hidden="true" /></span>
      <div className="status-copy">
        <h3>{config.title}</h3>
        <p>{config.description}</p>
        {region && mode === "expired" && weather ? <p className="status-time">조회 시각 · {formatKoreanTime(weather.queriedAt)} (한국 시간)</p> : null}
      </div>
      <div className="status-actions">
        {mode !== "unsupported" ? <button className="button button-primary button-small" type="button" onClick={onRetry}><RefreshCcw size={15} /> 다시 확인</button> : null}
        <button className="button button-quiet button-small" type="button" onClick={onChangeRegion}>지역 변경</button>
      </div>
    </section>
  )
}

function WeatherSummary({ region, weather, onRetry }: { region: Region; weather: PreviewWeather; onRetry: () => void }) {
  return (
    <section className="weather-card" aria-labelledby="weather-heading">
      <div className="card-topline">
        <span className="eyebrow">STEP 02 · 현재 날씨</span>
        <span className="example-type"><span className="example-dot" />예시 데이터</span>
      </div>
      <h2 className="weather-region" id="weather-heading">{region.fullName}</h2>
      <div className="weather-main">
        <div className="temperature"><span>{weather.temperature}</span><sup>°</sup><small>C</small></div>
        <WeatherIllustration precipitation={weather.precipitation} />
      </div>
      <div className="weather-condition">
        <span className={`condition-icon condition-${weather.precipitation}`}><PrecipitationIcon precipitation={weather.precipitation} /></span>
        <span>{PRECIPITATION_LABELS[weather.precipitation]}</span>
      </div>
      <div className="weather-details">
        <div className="weather-detail-row">
          <span className="detail-label"><Clock3 size={15} />예시 기준 시각</span>
          <strong>{formatKoreanTime(weather.referenceAt)} <small>KST</small></strong>
        </div>
        <div className="weather-detail-row">
          <span className="detail-label"><RefreshCcw size={15} />조회 시각</span>
          <strong>{formatKoreanTime(weather.queriedAt)} <small>KST</small></strong>
        </div>
        {weather.precipitation === "rain" || weather.precipitation === "snow" || weather.precipitation === "mixed" ? (
          <div className="weather-detail-row">
            <span className="detail-label"><CloudRain size={15} />강수량</span>
            <strong>{weather.rainfallAmount === undefined ? "강수량 정보 없음" : `${weather.rainfallAmount.toFixed(1)} mm · 최근 1시간`}</strong>
          </div>
        ) : null}
      </div>
      <div className="representative-note"><span className="note-mark" aria-hidden="true">i</span>선택 지역의 대표 지점 기준</div>
      <button type="button" className="button button-outline weather-refresh" onClick={onRetry}>
        <RefreshCcw size={16} /> 날씨 다시 확인
      </button>
    </section>
  )
}

function PreparationIcon({ icon }: { icon: ReturnType<typeof getPrecipitationPreparation>["icon"] }) {
  if (icon === "rain") return <Umbrella size={19} aria-hidden="true" />
  if (icon === "snow") return <Footprints size={19} aria-hidden="true" />
  if (icon === "mixed") return <Umbrella size={19} aria-hidden="true" />
  if (icon === "none") return <Check size={19} aria-hidden="true" />
  return <CircleHelp size={19} aria-hidden="true" />
}

function RecommendationCard({ weather }: { weather: PreviewWeather }) {
  const rule = getOutfitRule(weather.temperature)
  const preparation = getPrecipitationPreparation(weather.precipitation)
  const reason = getOutfitReason(weather, rule)

  return (
    <section className="recommendation-card" aria-labelledby="outfit-heading">
      <div className="card-topline">
        <span className="eyebrow">STEP 03 · 지금 참고할 옷차림</span>
        <span className="recommendation-index">오늘의 겉옷 <span>01</span></span>
      </div>
      <div className="recommendation-main">
        <div className="recommendation-copy">
          <p className="recommendation-kicker">현재 기온에 맞춘 한 가지 제안</p>
          <h2 id="outfit-heading">{rule.title}</h2>
          <ul className="clothing-list" aria-label="추천 의류">
            {rule.pieces.map((piece) => <li key={piece}>{piece}</li>)}
          </ul>
          <p className="outfit-reason">{reason}</p>
        </div>
        <OutfitIllustration outfitId={rule.id} />
      </div>
      <div className={`preparation-callout preparation-${preparation.icon}`}>
        <div className="preparation-icon"><PreparationIcon icon={preparation.icon} /></div>
        <div><span>{preparation.title}</span><strong>{preparation.detail}</strong></div>
        <span className="preparation-check" aria-hidden="true"><Check size={14} /></span>
      </div>
      <p className="recommendation-footnote">현재 날씨 기준의 참고용 추천입니다. 이후 날씨와 개인의 체감 차이는 반영하지 않습니다.</p>
    </section>
  )
}

function SourceCard({ weather }: { weather: PreviewWeather }) {
  return (
    <section className="source-card" aria-labelledby="source-heading">
      <div className="source-heading-row">
        <div className="source-heading-icon"><Wind size={18} /></div>
        <div><span className="eyebrow">DATA · 출처 안내</span><h2 id="source-heading">정보의 기준을 확인해 주세요</h2></div>
      </div>
      <div className="source-content">
        <div className="source-item"><span>제공 기관 · 원문</span><strong>실제 서비스 연결 시 제공 기관과 원문 링크가 표시됩니다.</strong></div>
        <div className="source-item"><span>정보 유형</span><strong>관측 정보 표시 예시</strong></div>
        <div className="source-item"><span>정보 기준 시각</span><strong>{formatKoreanTime(weather.referenceAt)} (한국 시간)</strong></div>
      </div>
      <p className="source-disclaimer">옷차림은 서비스의 편집 기준에 따른 추천입니다.</p>
    </section>
  )
}

export function WeatherPanels({ region, weather, mode, missingFields, onRetry, onChangeRegion }: WeatherPanelsProps) {
  if (mode === "idle") return null

  if (mode === "loading") {
    return (
      <div className="results-area" aria-live="polite" aria-busy="true">
        <div className="loading-message"><span className="spinner" aria-hidden="true" /><div><strong>날씨를 확인하고 있어요.</strong><span>{region?.fullName} · 예시 날씨 데이터를 불러오는 중</span></div></div>
        <LoadingSkeleton />
      </div>
    )
  }

  if (mode === "success" && region && weather) {
    return (
      <div className="results-area" aria-live="polite">
        <div className="result-header">
          <div><span className="eyebrow">YOUR LOCAL NOTE</span><h2>가볍게 확인하고, 편하게 나가요.</h2></div>
          <span className="reference-label"><Clock3 size={14} />대표 지점 기준</span>
        </div>
        <div className="result-grid">
          <WeatherSummary region={region} weather={weather} onRetry={onRetry} />
          <RecommendationCard weather={weather} />
        </div>
        <SourceCard weather={weather} />
      </div>
    )
  }

  if (mode === "recommendation-error" && region && weather) {
    return (
      <div className="results-area">
        <div className="result-header"><div><span className="eyebrow">YOUR LOCAL NOTE</span><h2>날씨는 확인했어요.</h2></div><span className="reference-label"><Clock3 size={14} />대표 지점 기준</span></div>
        <div className="result-grid">
          <WeatherSummary region={region} weather={weather} onRetry={onRetry} />
          <section className="recommendation-card recommendation-error" role="alert">
            <div className="status-icon"><AlertCircle size={20} /></div>
            <span className="eyebrow">옷차림 추천</span>
            <h2>날씨는 확인했지만 옷차림 추천을 준비하지 못했어요.</h2>
            <p>확인된 날씨 정보는 아래 출처 안내에서 확인할 수 있어요.</p>
          </section>
        </div>
        <SourceCard weather={weather} />
      </div>
    )
  }

  if (region) {
    return (
      <div className="results-area">
        <div className="result-header"><div><span className="eyebrow">YOUR LOCAL NOTE</span><h2>{region.fullName}</h2></div><span className="reference-label"><Clock3 size={14} />예시 정보</span></div>
        <StatusPanel mode={mode} region={region} weather={weather} missingFields={missingFields} onRetry={onRetry} onChangeRegion={onChangeRegion} />
      </div>
    )
  }

  return null
}
