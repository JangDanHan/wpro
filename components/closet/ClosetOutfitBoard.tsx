"use client"

import { useState } from "react"
import {
  ClosetItem,
  ClosetOutfitRecommendation,
  ClothingCategory,
  CATEGORY_LABELS,
} from "@/lib/domain/closet-types"
import { ValidatedWeatherData } from "@/lib/domain/types"
import {
  Sparkles,
  Pin,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Info,
  Calendar,
  Undo2,
  Layers,
  Thermometer,
  CloudRain,
  Wind,
} from "lucide-react"

interface ClosetOutfitBoardProps {
  recommendation: ClosetOutfitRecommendation | null
  weather: ValidatedWeatherData | null
  situation: string
  pinnedItemIds: string[]
  isTodayWorn: boolean
  onTogglePin: (itemId: string) => void
  onRefreshRecommendation: () => void
  onRecordWearToday: () => Promise<void>
  onCancelWearToday: () => Promise<void>
  onOpenUploadModal: () => void
}

export function ClosetOutfitBoard({
  recommendation,
  weather,
  situation,
  pinnedItemIds,
  isTodayWorn,
  onTogglePin,
  onRefreshRecommendation,
  onRecordWearToday,
  onCancelWearToday,
  onOpenUploadModal,
}: ClosetOutfitBoardProps) {
  const [isRecording, setIsRecording] = useState(false)

  if (!recommendation) {
    return (
      <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-3">
        <Sparkles className="w-10 h-10 text-sky-500 mx-auto animate-pulse" />
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          내 옷장 기반 코디를 준비 중입니다.
        </h3>
        <p className="text-xs text-zinc-500">
          지역 날씨를 선택하고 추천받기를 눌러보세요.
        </p>
      </div>
    )
  }

  const { matchedItems, missingCategories, recommendationReason, title, weatherContext } =
    recommendation

  const handleWearClick = async () => {
    setIsRecording(true)
    try {
      await onRecordWearToday()
    } finally {
      setIsRecording(false)
    }
  }

  const handleCancelWearClick = async () => {
    setIsRecording(true)
    try {
      await onCancelWearToday()
    } finally {
      setIsRecording(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 1. 상단 타이틀 & 날씨 컨텍스트 카드 */}
      <div className="p-4 bg-gradient-to-br from-sky-500/10 via-white to-indigo-500/10 dark:from-sky-950/40 dark:via-zinc-900 dark:to-indigo-950/30 border border-sky-200 dark:border-sky-900/60 rounded-3xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-sky-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
              내 옷장 맞춤
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-sky-500" />
              <span>
                {weatherContext.temp.toFixed(1)}℃ (체감 {weatherContext.apparentTemp.toFixed(1)}℃)
              </span>
              {weatherContext.isRainOrSnow && (
                <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400 ml-1">
                  <CloudRain className="w-3.5 h-3.5" />
                  <span>비/눈</span>
                </span>
              )}
            </span>
          </div>

          {/* '다른 코디 추천' 버튼 */}
          <button
            type="button"
            onClick={onRefreshRecommendation}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-sky-600" />
            <span>다른 코디 추천</span>
          </button>
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-50">
            {title}
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
            {recommendationReason}
          </p>
        </div>
      </div>

      {/* 2. 보유 옷 코디 콜라주 보드 (실제 옷 사진 크게 배치) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 pb-1 border-b border-zinc-100 dark:border-zinc-800">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-sky-600" />
            <span>실제 등록된 옷 조합 ({matchedItems.length}벌 매칭)</span>
          </span>
          <span className="text-[11px] text-zinc-400 font-normal">
            마음에 드는 옷을 핀(Pin)으로 고정해보세요
          </span>
        </div>

        {matchedItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            매칭할 수 있는 옷이 없습니다. 새 옷을 등록해주세요.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {matchedItems.map(({ item, category, isPinned }) => {
              const displayImg =
                item.activeImageMode === "nobg" && item.noBgImageUrl
                  ? item.noBgImageUrl
                  : item.originalImageUrl

              return (
                <div
                  key={item.id}
                  className={`relative rounded-2xl border p-2.5 flex flex-col justify-between transition-all group ${
                    isPinned
                      ? "border-amber-400 dark:border-amber-500/80 bg-amber-50/30 dark:bg-amber-950/20 shadow-xs ring-1 ring-amber-400/50"
                      : "border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-sky-300"
                  }`}
                >
                  {/* 카테고리 뱃지 & 고정(Pin) 버튼 */}
                  <div className="flex items-center justify-between z-10 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 shadow-xs">
                      {CATEGORY_LABELS[category]}
                    </span>

                    <button
                      type="button"
                      onClick={() => onTogglePin(item.id)}
                      title={isPinned ? "고정 해제" : "이 옷 고정하고 다른 옷만 추천받기"}
                      className={`p-1.5 rounded-full transition-transform active:scale-90 cursor-pointer shadow-xs ${
                        isPinned
                          ? "bg-amber-500 text-white"
                          : "bg-white/80 dark:bg-zinc-800 text-zinc-400 hover:text-amber-500"
                      }`}
                    >
                      <Pin className={`w-3.5 h-3.5 ${isPinned ? "fill-white" : ""}`} />
                    </button>
                  </div>

                  {/* 실제 보유 옷 사진 크게 배치 */}
                  <div className="h-36 sm:h-40 w-full flex items-center justify-center p-1 overflow-hidden my-1">
                    <img
                      src={displayImg}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                    />
                  </div>

                  {/* 옷 정보 */}
                  <div className="pt-1.5 border-t border-zinc-200/60 dark:border-zinc-700/60">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {item.name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-0.5">
                      <span>{item.colors.join(", ")}</span>
                      <span className="flex items-center gap-0.5 text-amber-600">
                        <Flame className="w-3 h-3" />
                        {item.wearCount || 0}회 착용
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 3. 부족한 옷 안내 (요구사항: 보유하지 않은 옷을 날조 추천하지 않고 부족한 항목 명확히 안내) */}
      {missingCategories.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-3xl space-y-2.5 animate-in fade-in-50">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>옷장에 없는 필수 아이템 안내 (날조 추천 방지)</span>
          </div>
          <div className="space-y-1.5">
            {missingCategories.map((m, idx) => (
              <div
                key={idx}
                className="text-xs text-amber-800 dark:text-amber-300 bg-white/70 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 flex items-center justify-between"
              >
                <span>• {m.advice}</span>
                <button
                  type="button"
                  onClick={onOpenUploadModal}
                  className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold shrink-0 ml-2 cursor-pointer"
                >
                  옷 등록하기
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. '오늘 입었어요' 액션 카드 (요구사항: 추천만으로는 횟수 증가 금지, 클릭 시에만 증가, 중복 방지 및 취소 기능) */}
      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
              오늘의 코디 확정 & 착용 기록
            </h4>
            <p className="text-[11px] text-zinc-500">
              실제로 입었을 때만 착용 횟수가 기록됩니다.
            </p>
          </div>

          {isTodayWorn ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>오늘 착용 완료</span>
              </span>
              <button
                type="button"
                disabled={isRecording}
                onClick={handleCancelWearClick}
                className="flex items-center gap-1 py-1 px-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>기록 취소</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={isRecording || matchedItems.length === 0}
              onClick={handleWearClick}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>오늘 입었어요!</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
