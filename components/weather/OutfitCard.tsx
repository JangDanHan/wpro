"use client"

import { useState, useMemo } from "react"
import { OutfitRecommendation } from "@/lib/domain/types"
import { OutfitStyle } from "@/lib/domain/outfit-catalog"
import {
  Shirt,
  Umbrella,
  AlertCircle,
  RefreshCw,
  Sparkles,
  User,
  Loader2,
  ImageOff,
  Layers,
  CheckCircle2,
} from "lucide-react"

interface OutfitCardProps {
  recommendation: OutfitRecommendation
  onRefresh: () => void
  isFetching: boolean
  aiState?: "idle" | "loading" | "success" | "error"
  aiErrorMessage?: string | null
  onRetryAi?: () => void
}

interface DisplayOutfit {
  id: string
  title: string
  clothingItems: string
  description: string
  photoUrl?: string
  photoCredit?: string
  style: OutfitStyle
  styleName: string
}

export function OutfitCard({
  recommendation,
  onRefresh,
  isFetching,
  aiState = "idle",
  aiErrorMessage,
  onRetryAi,
}: OutfitCardProps) {
  // 사용 가능한 코디 리스트 (대표 코디 + 스타일별 대체 코디들)
  const allOutfits = useMemo<DisplayOutfit[]>(() => {
    const list: DisplayOutfit[] = []

    // 1. 대표 코디
    list.push({
      id: "primary",
      title: recommendation.title || "지금 참고할 옷차림",
      clothingItems: recommendation.clothingItems || recommendation.basicOutfit,
      description: recommendation.reason,
      photoUrl: recommendation.photoUrl,
      photoCredit: recommendation.photoCredit || "Unsplash (Free License)",
      style: (recommendation.style as OutfitStyle) || "casual",
      styleName: recommendation.styleName || "캐주얼",
    })

    // 2. 대체 코디들 (다양한 스타일 후보)
    if (Array.isArray(recommendation.alternativeOutfits)) {
      for (const alt of recommendation.alternativeOutfits) {
        list.push({
          id: alt.id,
          title: alt.title,
          clothingItems: alt.clothingItems,
          description: alt.description,
          photoUrl: alt.photoUrl,
          photoCredit: alt.photoCredit || "Unsplash (Free License)",
          style: alt.style,
          styleName: alt.styleName,
        })
      }
    }

    return list
  }, [recommendation])

  // 스타일 필터 (전체, 캐주얼, 단정한 스타일, 편한 스타일)
  const [selectedStyleFilter, setSelectedStyleFilter] = useState<"all" | OutfitStyle>("all")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({})

  // 현재 필터에 맞는 코디 목록
  const filteredOutfits = useMemo(() => {
    if (selectedStyleFilter === "all") return allOutfits
    const matches = allOutfits.filter((o) => o.style === selectedStyleFilter)
    return matches.length > 0 ? matches : allOutfits
  }, [allOutfits, selectedStyleFilter])

  // 현재 선택된 코디 인덱스 보정
  const safeIndex = currentIndex % (filteredOutfits.length || 1)
  const currentOutfit = filteredOutfits[safeIndex] || allOutfits[0]

  // '다른 코디 보기' 핸들러 (순환 회전)
  const handleNextOutfit = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredOutfits.length)
  }

  // 스타일 필터 변경
  const handleFilterChange = (style: "all" | OutfitStyle) => {
    setSelectedStyleFilter(style)
    setCurrentIndex(0)
  }

  const isCurrentImgError = currentOutfit?.id ? imageErrorMap[currentOutfit.id] : false

  return (
    <article
      aria-label="옷차림 추천 카드"
      className="w-full bg-gradient-to-br from-sky-50 via-white to-indigo-50/40 dark:from-zinc-900 dark:via-zinc-850 dark:to-zinc-900 border border-sky-100 dark:border-zinc-700/60 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in-50 duration-300"
    >
      {/* 카드 상단 헤더 & 재확인 버튼 */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-sky-500 text-white rounded-xl shadow-xs">
            <Shirt className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {recommendation.title}
              </h2>
              {recommendation.isAiGenerated && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <Sparkles className="w-3 h-3 text-amber-500" aria-hidden="true" />
                  AI 맞춤 분석
                </span>
              )}
              {aiState === "loading" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60">
                  <Loader2 className="w-3 h-3 animate-spin text-amber-500" aria-hidden="true" />
                  AI 분석 중...
                </span>
              )}
            </div>
          </div>
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

      {/* 상황 반영 안내 */}
      {recommendation.situation && (
        <div className="flex items-start gap-2 p-3 bg-white/70 dark:bg-zinc-800/70 border border-amber-200/60 dark:border-amber-900/40 rounded-xl text-xs text-zinc-700 dark:text-zinc-300">
          <User className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <span className="font-semibold text-amber-700 dark:text-amber-400">반영된 상황: </span>
            <span>{recommendation.situation}</span>
          </div>
          {aiState === "error" && onRetryAi && (
            <button
              type="button"
              onClick={onRetryAi}
              className="px-2 py-1 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 rounded text-[11px] font-semibold transition-colors"
            >
              재시도
            </button>
          )}
        </div>
      )}

      {/* 스타일 선택 칩 (캐주얼, 단정한 스타일, 편한 스타일) */}
      <div className="flex items-center justify-between border-b border-sky-100 dark:border-zinc-800 pb-2.5 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 shrink-0 mr-1">
            스타일 선택:
          </span>
          <button
            type="button"
            onClick={() => handleFilterChange("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedStyleFilter === "all"
                ? "bg-sky-600 text-white shadow-2xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            전체 보기
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange("casual")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedStyleFilter === "casual"
                ? "bg-sky-600 text-white shadow-2xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            캐주얼
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange("formal")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedStyleFilter === "formal"
                ? "bg-sky-600 text-white shadow-2xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            단정한 스타일
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange("comfort")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedStyleFilter === "comfort"
                ? "bg-sky-600 text-white shadow-2xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            편한 스타일
          </button>
        </div>

        {/* 다른 코디 보기 버튼 */}
        {filteredOutfits.length > 1 && (
          <button
            type="button"
            onClick={handleNextOutfit}
            className="inline-flex items-center gap-1 px-3 py-1 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 rounded-lg text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer ml-2"
            title="다음 코디 추천 보기"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>다른 코디 보기</span>
            <span className="text-[10px] opacity-75 font-mono ml-0.5">
              ({safeIndex + 1}/{filteredOutfits.length})
            </span>
          </button>
        )}
      </div>

      {/* 1. 대형 착장 사진 영역 (Photo-centric Presentation) */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs group">
        {currentOutfit?.photoUrl && !isCurrentImgError ? (
          <>
            <img
              src={currentOutfit.photoUrl}
              alt={currentOutfit.title || currentOutfit.clothingItems}
              className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
              loading="lazy"
              onError={() => {
                if (currentOutfit.id) {
                  setImageErrorMap((prev) => ({ ...prev, [currentOutfit.id]: true }))
                }
              }}
            />
            {/* 그라데이션 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
          </>
        ) : (
          /* 이미지 로드 실패 또는 미확보 시 안전한 상태 표시 */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-zinc-100 dark:bg-zinc-800">
            <ImageOff className="w-8 h-8 text-zinc-400 mb-2" aria-hidden="true" />
            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              코디 사진을 불러올 수 없거나 준비 중입니다.
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">
              아래의 실제 옷 구성 안내를 참고해 주세요.
            </p>
          </div>
        )}

        {/* 상단 뱃지: 스타일 태그 & 기온 안내 */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100 shadow-md backdrop-blur-xs flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
            {currentOutfit?.styleName || "추천 스타일"}
          </span>
          <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-sky-600/90 text-white shadow-md backdrop-blur-xs">
            {recommendation.temperature}℃ 맞춤
          </span>
        </div>

        {/* 하단 출처 표기 (라이선스 준수) */}
        {currentOutfit?.photoCredit && !isCurrentImgError && (
          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/50 text-[10px] text-white/80 backdrop-blur-xs">
            사진: {currentOutfit.photoCredit}
          </div>
        )}

        {/* 사진 위 하단 빠른 요약 타이틀 */}
        {currentOutfit?.photoUrl && !isCurrentImgError && (
          <div className="absolute bottom-3 left-3 right-16 text-white text-left">
            <p className="text-xs font-medium text-white/90 drop-shadow-sm">
              {currentOutfit.title}
            </p>
          </div>
        )}
      </div>

      {/* 2. 사진 아래 옷 구성 (니트 + 청바지 + 코트 형태 명시) */}
      <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xs p-4 rounded-xl border border-sky-100/70 dark:border-zinc-700/60 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            추천 옷 구성 (전체 조합)
          </span>
          <span className="text-[11px] text-zinc-400">
            사진 속 착장과 일치
          </span>
        </div>
        <p className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug">
          {currentOutfit?.clothingItems || recommendation.basicOutfit}
        </p>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal pt-0.5">
          {currentOutfit?.description || recommendation.reason}
        </p>
      </div>

      {/* 강수 대비 추가 안내 (해당하는 경우만 표시) */}
      {recommendation.precipitationNotice && (
        <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 rounded-xl text-amber-900 dark:text-amber-200 text-sm">
          <Umbrella className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="font-medium leading-relaxed text-xs">
            {recommendation.precipitationNotice}
          </p>
        </div>
      )}

      {/* 정보 누락 안내 */}
      {recommendation.missingNotice && (
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100/70 dark:bg-zinc-800/50 p-2.5 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" aria-hidden="true" />
          <span>{recommendation.missingNotice}</span>
        </div>
      )}

      {/* 고정 안내 문구 */}
      <div className="p-3 bg-zinc-100/60 dark:bg-zinc-800/40 rounded-xl">
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed text-center sm:text-left">
          {recommendation.fixedDisclaimer}
        </p>
      </div>
    </article>
  )
}
