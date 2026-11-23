"use client"

import { OutfitRecommendation } from "@/lib/domain/types"
import {
  Shirt,
  Umbrella,
  AlertCircle,
  RefreshCw,
  User,
  Sparkles,
  Layers,
} from "lucide-react"

interface OutfitCardProps {
  recommendation: OutfitRecommendation
  onRefresh: () => void
  isFetching: boolean
  aiState?: "idle" | "loading" | "success" | "error"
  aiErrorMessage?: string | null
  onRetryAi?: () => void
}

export function OutfitCard({
  recommendation,
  onRefresh,
  isFetching,
}: OutfitCardProps) {
  const cat = recommendation.categorizedOutfit

  return (
    <article
      aria-label="옷차림 추천 카드"
      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4"
    >
      {/* 1. 카드 상단: 제목 & 날씨 다시 확인 버튼 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-2xl">
            <Shirt className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {recommendation.title || "지금 참고할 옷차림"}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              현재 기온과 날씨 조건에 어울리는 추천 구성입니다
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isFetching}
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-50 cursor-pointer active:scale-95"
          aria-label="날씨 다시 확인"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-sky-600 ${isFetching ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          <span>날씨 다시 확인</span>
        </button>
      </div>

      {/* 2. 사용자 상황 반영 안내 */}
      {recommendation.situation && (
        <div className="flex items-center gap-2 p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl text-xs text-amber-900 dark:text-amber-200">
          <User className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <span className="font-bold text-amber-800 dark:text-amber-300">반영된 일정·상황: </span>
            <span className="font-medium">{recommendation.situation}</span>
          </div>
        </div>
      )}

      {/* 3. 대표 옷차림 요약 */}
      <div className="bg-sky-50/60 dark:bg-sky-950/30 p-4 rounded-2xl border border-sky-100 dark:border-sky-900/40">
        <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300 block mb-1">
          기본 권장 옷차림
        </span>
        <p className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          {recommendation.basicOutfit}
        </p>
      </div>

      {/* 4. [핵심] 아우터·상의·하의·신발 부위별 간결한 텍스트 안내 (일반 옷 종류 설명) */}
      {cat && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {/* 아우터 */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
              <span className="text-sm">🧥</span>
              <span>외투 (아우터)</span>
            </div>
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {cat.outer}
            </p>
          </div>

          {/* 상의 */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
              <span className="text-sm">👕</span>
              <span>상의</span>
            </div>
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {cat.top}
            </p>
          </div>

          {/* 하의 */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
              <span className="text-sm">👖</span>
              <span>하의</span>
            </div>
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {cat.bottom}
            </p>
          </div>

          {/* 신발 */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
              <span className="text-sm">👟</span>
              <span>신발</span>
            </div>
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {cat.shoes}
            </p>
          </div>
        </div>
      )}

      {/* 5. 강수 대비 추가 안내 */}
      {recommendation.precipitationNotice && (
        <div className="flex items-start gap-2.5 p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 rounded-2xl text-blue-950 dark:text-blue-200 text-xs">
          <Umbrella className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="font-semibold leading-relaxed">
            {recommendation.precipitationNotice}
          </p>
        </div>
      )}

      {/* 6. 정보 누락 안내 */}
      {recommendation.missingNotice && (
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100/70 dark:bg-zinc-800/50 p-2.5 rounded-xl">
          <AlertCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" aria-hidden="true" />
          <span>{recommendation.missingNotice}</span>
        </div>
      )}

      {/* 7. 추천 이유 (날씨·기온·상황 연결 설명) */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-1.5">
        <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block">
          추천 이유
        </span>
        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
          {recommendation.reason}
        </p>
      </div>

      {/* 8. 고정 안내 문구 (PRD 3.3) */}
      <div className="p-3 bg-zinc-100/60 dark:bg-zinc-800/40 rounded-xl text-center">
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {recommendation.fixedDisclaimer}
        </p>
      </div>
    </article>
  )
}
