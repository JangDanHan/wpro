import { OutfitRecommendation } from "@/lib/domain/types"
import { Shirt, Umbrella, AlertCircle, RefreshCw } from "lucide-react"

interface OutfitCardProps {
  recommendation: OutfitRecommendation
  onRefresh: () => void
  isFetching: boolean
}

export function OutfitCard({
  recommendation,
  onRefresh,
  isFetching,
}: OutfitCardProps) {
  return (
    <article
      aria-label="옷차림 추천 카드"
      className="w-full bg-gradient-to-br from-sky-50 to-indigo-50/50 dark:from-zinc-900 dark:to-zinc-850 border border-sky-100 dark:border-zinc-700/60 rounded-2xl p-6 shadow-sm space-y-5"
    >
      {/* 카드 상단: 제목 & 재확인 버튼 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-sky-500 text-white rounded-xl shadow-xs">
            <Shirt className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {recommendation.title}
          </h2>
        </div>
        <button
          type="button"
          disabled={isFetching}
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-50 cursor-pointer active:scale-95"
          aria-label="날씨 다시 확인"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} aria-hidden="true" />
          <span>날씨 다시 확인</span>
        </button>
      </div>

      {/* 기본 옷차림 */}
      <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xs p-4 rounded-xl border border-sky-100/60 dark:border-zinc-700/40">
        <span className="text-xs font-medium text-sky-600 dark:text-sky-400 block mb-1">
          추천 옷차림
        </span>
        <p className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          {recommendation.basicOutfit}
        </p>
      </div>

      {/* 강수 대비 추가 안내 (해당하는 경우만 표시) */}
      {recommendation.precipitationNotice && (
        <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 rounded-xl text-amber-900 dark:text-amber-200 text-sm">
          <Umbrella className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="font-medium leading-relaxed">
            {recommendation.precipitationNotice}
          </p>
        </div>
      )}

      {/* 정보 누락 안내 (해당하는 경우 표시) */}
      {recommendation.missingNotice && (
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100/70 dark:bg-zinc-800/50 p-2.5 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" aria-hidden="true" />
          <span>{recommendation.missingNotice}</span>
        </div>
      )}

      {/* 추천 이유 */}
      <div className="pt-2 border-t border-sky-100 dark:border-zinc-800">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
          추천 이유
        </span>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
          {recommendation.reason}
        </p>
      </div>

      {/* 고정 안내 문구 (PRD 3.3) */}
      <div className="p-3 bg-zinc-100/60 dark:bg-zinc-800/40 rounded-xl">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed text-center sm:text-left">
          {recommendation.fixedDisclaimer}
        </p>
      </div>
    </article>
  )
}
