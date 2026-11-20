import { WeatherViewState } from "@/hooks/useWeatherRecommendation"
import { AlertTriangle, Clock, Loader2, MapPin, RefreshCw, WifiOff } from "lucide-react"

interface StateFeedbackProps {
  state: WeatherViewState
  errorMessage: string | null
  cityName?: string
  onRetry: () => void
  isFetching: boolean
}

export function StateFeedback({
  state,
  errorMessage,
  cityName,
  onRetry,
  isFetching,
}: StateFeedbackProps) {
  // 1. 초기 상태 (EX-01)
  if (state === "idle") {
    return (
      <div
        role="status"
        className="w-full bg-zinc-50 dark:bg-zinc-850/60 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 text-center space-y-3"
      >
        <div className="w-12 h-12 mx-auto rounded-full bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400">
          <MapPin className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
            도시를 선택하면 지금 참고할 옷차림을 알려드려요.
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            위 목록에서 서울, 광주, 부산 중 하나를 선택해 주세요.
          </p>
        </div>
      </div>
    )
  }

  // 2. 조회 중 상태 (F-08, EX-13)
  if (state === "loading") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 text-center space-y-3 shadow-xs"
      >
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto" aria-hidden="true" />
        <div>
          <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {cityName ? `${cityName} 날씨를 확인하고 있어요.` : "날씨를 확인하고 있어요."}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            잠시만 기다려 주세요.
          </p>
        </div>
      </div>
    )
  }

  // 3. 에러 또는 만료 상태
  const isExpired = state === "error_expired"
  const isRateLimited = state === "error_rate_limit"

  return (
    <div
      role="alert"
      className="w-full bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-2xl p-6 text-center space-y-4"
    >
      <div className="w-10 h-10 mx-auto rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
        {state === "error_network" ? (
          <WifiOff className="w-5 h-5" aria-hidden="true" />
        ) : isExpired ? (
          <Clock className="w-5 h-5" aria-hidden="true" />
        ) : (
          <AlertTriangle className="w-5 h-5" aria-hidden="true" />
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-bold text-red-900 dark:text-red-200">
          {errorMessage ?? "날씨 정보를 불러오지 못했어요."}
        </h3>
        <p className="text-xs text-red-700/80 dark:text-red-300/70">
          {isRateLimited
            ? "잠시 후 다시 시도해 주세요."
            : "문제가 지속되면 잠시 후 다시 확인해 주세요."}
        </p>
      </div>

      {!isRateLimited && (
        <button
          type="button"
          disabled={isFetching}
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} aria-hidden="true" />
          <span>{isExpired ? "날씨 다시 확인" : "다시 시도"}</span>
        </button>
      )}
    </div>
  )
}
