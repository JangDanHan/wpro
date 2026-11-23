"use client"

import { useState, useMemo } from "react"
import { OutfitRecommendation, ProductItem } from "@/lib/domain/types"
import { OutfitStyle } from "@/lib/domain/outfit-catalog"
import {
  Sparkles,
  RefreshCw,
  ImageOff,
  Layers,
  CheckCircle2,
  AlertCircle,
  X,
  Info,
  Loader2,
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
  productItems: ProductItem[]
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
      productItems: recommendation.productItems || [],
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
          productItems: alt.productItems || [],
        })
      }
    }

    return list
  }, [recommendation])

  // 스타일 필터 (전체, 캐주얼, 단정한 스타일, 편한 스타일)
  const [selectedStyleFilter, setSelectedStyleFilter] = useState<"all" | OutfitStyle>("all")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({})
  const [selectedProductDetail, setSelectedProductDetail] = useState<ProductItem | null>(null)

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
  const handleSelectStyle = (style: "all" | OutfitStyle) => {
    setSelectedStyleFilter(style)
    setCurrentIndex(0)
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
      {/* 1. 상단 헤더 & 다른 코디 추천 버튼 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                날씨 맞춤 코디 조합
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                단독 상품 사진
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              상의·하의·아우터·신발을 상품별로 한눈에 비교해보세요
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNextOutfit}
          className="flex items-center gap-1 py-1.5 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition-transform active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
          <span>다른 코디</span>
        </button>
      </div>

      {/* 2. 스타일 탭 (전체 / 캐주얼 / 단정한 스타일 / 편한 스타일) */}
      <div className="flex items-center gap-1.5 bg-zinc-100/80 dark:bg-zinc-800/60 p-1 rounded-2xl">
        <button
          type="button"
          onClick={() => handleSelectStyle("all")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            selectedStyleFilter === "all"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          전체 스타일
        </button>
        <button
          type="button"
          onClick={() => handleSelectStyle("casual")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            selectedStyleFilter === "casual"
              ? "bg-white dark:bg-zinc-900 text-sky-600 dark:text-sky-400 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          캐주얼
        </button>
        <button
          type="button"
          onClick={() => handleSelectStyle("formal")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            selectedStyleFilter === "formal"
              ? "bg-white dark:bg-zinc-900 text-sky-600 dark:text-sky-400 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          단정한 스타일
        </button>
        <button
          type="button"
          onClick={() => handleSelectStyle("comfort")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            selectedStyleFilter === "comfort"
              ? "bg-white dark:bg-zinc-900 text-sky-600 dark:text-sky-400 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          편한 스타일
        </button>
      </div>

      {/* 3. 코디 타이틀 */}
      <div className="flex items-center justify-between pt-0.5">
        <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">
          {currentOutfit.title}
        </span>
        <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md">
          {currentOutfit.styleName}
        </span>
      </div>

      {/* 4. 개별 상품 이미지 그리드 (상의·하의·아우터·신발을 독립된 상품 사진으로 한 카드에 배치) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {currentOutfit.productItems.length > 0 ? (
          currentOutfit.productItems.map((product) => {
            const hasError = imageErrorMap[product.id]

            return (
              <div
                key={product.id}
                onClick={() => setSelectedProductDetail(product)}
                className="group relative bg-[#f8fafc] dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl p-2.5 flex flex-col justify-between transition-all hover:border-sky-400 hover:shadow-xs cursor-pointer overflow-hidden"
              >
                {/* 카테고리 라벨 칩 (외투 / 상의 / 하의 / 신발) */}
                <div className="flex items-center justify-between mb-1 z-10">
                  <span className="px-2 py-0.5 rounded-md bg-white/90 dark:bg-zinc-900/90 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60 shadow-2xs">
                    {product.categoryLabel}
                  </span>
                  <Info className="w-3 h-3 text-zinc-400 group-hover:text-sky-500 transition-colors" />
                </div>

                {/* 상품 이미지 영역: 흰색/밝은 배경 중앙 배치, object-contain으로 끝 잘림 방지 */}
                <div className="relative aspect-square w-full flex items-center justify-center p-2 overflow-hidden my-0.5">
                  {hasError ? (
                    <div className="flex flex-col items-center justify-center text-zinc-400 gap-1 text-[10px]">
                      <ImageOff className="w-6 h-6" />
                      <span>이미지 불러오기 실패</span>
                    </div>
                  ) : (
                    <img
                      src={product.photoUrl}
                      alt={product.name}
                      onError={() =>
                        setImageErrorMap((prev) => ({ ...prev, [product.id]: true }))
                      }
                      className="max-h-full max-w-full object-contain drop-shadow-xs group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* 상품 짧은 이름 (예: ‘차콜 반집업 니트’, ‘연청 와이드 데님’) */}
                <div className="pt-1.5 border-t border-zinc-200/60 dark:border-zinc-700/60 text-center">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-sky-600 transition-colors">
                    {product.name}
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-2 py-8 text-center text-xs text-zinc-400">
            상품 정보 준비 중입니다.
          </div>
        )}
      </div>

      {/* 5. 코디 추천 이유 및 날씨 관련 간결한 설명 (사진 아래 배치) */}
      <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-1.5 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-zinc-700 dark:text-zinc-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
          <span>추천 코디 조합 & 이유</span>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {currentOutfit.description}
        </p>
      </div>

      {/* 6. 상품 클릭 시 상세 정보 모달 */}
      {selectedProductDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-bold">
                {selectedProductDetail.categoryLabel}
              </span>
              <button
                type="button"
                onClick={() => setSelectedProductDetail(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-square w-full bg-[#f8fafc] dark:bg-zinc-800 rounded-2xl flex items-center justify-center p-3">
              <img
                src={selectedProductDetail.photoUrl}
                alt={selectedProductDetail.name}
                className="max-h-full max-w-full object-contain drop-shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {selectedProductDetail.name}
              </h3>
              {selectedProductDetail.description && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {selectedProductDetail.description}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-zinc-500 border-t border-zinc-100 dark:border-zinc-800">
                {selectedProductDetail.material && (
                  <div>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">소재: </span>
                    <span>{selectedProductDetail.material}</span>
                  </div>
                )}
                {selectedProductDetail.thickness && (
                  <div>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">두께: </span>
                    <span>{selectedProductDetail.thickness}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedProductDetail(null)}
              className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-bold hover:bg-zinc-800"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
