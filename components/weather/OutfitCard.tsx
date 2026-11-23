"use client"

import { useState, useMemo } from "react"
import { OutfitRecommendation, ProductItem } from "@/lib/domain/types"
import { MusinsaSnapStyle } from "@/lib/domain/musinsa-snap-catalog"
import {
  Sparkles,
  RefreshCw,
  ExternalLink,
  X,
  Info,
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
  snapUrl: string
  title: string
  clothingItems: string
  description: string
  style: MusinsaSnapStyle
  styleName: string
  productItems: ProductItem[]
}

const DEFAULT_PROFILE_URL = "https://www.musinsa.com/snap/profile/1234627203913810064"

export function OutfitCard({
  recommendation,
}: OutfitCardProps) {
  // 사용 가능한 코디 리스트 (대표 게시물 + 대체 실제 게시물들)
  const allOutfits = useMemo<DisplayOutfit[]>(() => {
    const list: DisplayOutfit[] = []

    // 1. 대표 추천 코디
    list.push({
      id: "primary",
      snapUrl: recommendation.snapUrl || DEFAULT_PROFILE_URL,
      title: recommendation.title || "날씨 맞춤 코디",
      clothingItems: recommendation.clothingItems || recommendation.basicOutfit,
      description: recommendation.reason,
      style: (recommendation.style as MusinsaSnapStyle) || "casual",
      styleName: recommendation.styleName || "캐주얼",
      productItems: recommendation.productItems || [],
    })

    // 2. 대체 코디들 (완성된 한 벌 단위, 아이템 혼합 없음)
    if (Array.isArray(recommendation.alternativeOutfits)) {
      for (const alt of recommendation.alternativeOutfits) {
        list.push({
          id: alt.id,
          snapUrl: alt.snapUrl || DEFAULT_PROFILE_URL,
          title: alt.title,
          clothingItems: alt.clothingItems,
          description: alt.description,
          style: alt.style,
          styleName: alt.styleName,
          productItems: alt.productItems || [],
        })
      }
    }

    return list
  }, [recommendation])

  // 스타일 필터 (전체, 캐주얼, 단정한 스타일, 편한 스타일)
  const [selectedStyleFilter, setSelectedStyleFilter] = useState<"all" | MusinsaSnapStyle>("all")
  const [currentIndex, setCurrentIndex] = useState(0)
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

  // '다른 코디 보기' 핸들러 (보드 전체가 새로운 조합으로 전환)
  const handleNextOutfit = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredOutfits.length)
  }

  // 스타일 필터 변경
  const handleSelectStyle = (style: "all" | MusinsaSnapStyle) => {
    setSelectedStyleFilter(style)
    setCurrentIndex(0)
  }

  // 코디 아이템 분리 (외투, 상의, 하의, 신발)
  const outerProduct = currentOutfit.productItems.find((p) => p.category === "outer")
  const topProduct = currentOutfit.productItems.find((p) => p.category === "top")
  const bottomProduct = currentOutfit.productItems.find((p) => p.category === "bottom")
  const shoesProduct = currentOutfit.productItems.find((p) => p.category === "shoes")

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* 1. 상단 바: 타이틀 & 다른 코디 버튼 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                날씨 맞춤 완성 코디
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60">
                코디 보드
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              오늘 날씨와 일정에 어울리는 한 벌 구성을 플랫레이로 확인해보세요
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNextOutfit}
          className="flex items-center gap-1.5 py-1.5 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition-transform active:scale-95 cursor-pointer"
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

      {/* 3. [핵심 요구사항] 하나의 완성된 코디 보드 (Flat Lay Canvas) */}
      {/* 4개의 개별 사각형 테두리를 완전히 제거하고 하나의 밝은 단일 캔버스 배경 안에 배치 */}
      <div className="relative w-full rounded-3xl bg-[#f8fafc] dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 p-5 sm:p-7 flex flex-col items-center justify-center min-h-[460px] sm:min-h-[500px] shadow-inner select-none overflow-hidden">
        
        {/* 플랫레이 실루엣 컨테이너 (사람·마네킹 없이 오직 옷과 신발의 형태와 비율만 표현) */}
        <div className="relative w-full max-w-[360px] flex flex-col items-center py-2">
          
          {/* [상단 영역]: 아우터 & 상의 */}
          <div className="relative w-full flex items-center justify-center h-[175px] sm:h-[195px]">
            {outerProduct && (
              <div
                onClick={() => setSelectedProductDetail(outerProduct)}
                className={`absolute transition-transform duration-300 hover:scale-105 cursor-pointer ${
                  topProduct
                    ? "left-2 sm:left-4 w-[52%] max-w-[180px] z-10 hover:z-30"
                    : "w-[72%] max-w-[240px] z-10"
                }`}
                title={`${outerProduct.name} (클릭하여 상세 정보 보기)`}
              >
                <img
                  src={outerProduct.photoUrl}
                  alt={outerProduct.name}
                  className="w-full h-[170px] sm:h-[190px] object-contain drop-shadow-sm filter transition-all hover:drop-shadow-md"
                />
              </div>
            )}

            {topProduct && (
              <div
                onClick={() => setSelectedProductDetail(topProduct)}
                className={`transition-transform duration-300 hover:scale-105 cursor-pointer ${
                  outerProduct
                    ? "relative ml-auto right-2 sm:right-4 w-[46%] max-w-[165px] z-20 hover:z-30"
                    : "w-[62%] max-w-[210px] z-20"
                }`}
                title={`${topProduct.name} (클릭하여 상세 정보 보기)`}
              >
                <img
                  src={topProduct.photoUrl}
                  alt={topProduct.name}
                  className="w-full h-[160px] sm:h-[180px] object-contain drop-shadow-sm filter transition-all hover:drop-shadow-md"
                />
              </div>
            )}
          </div>

          {/* [중단 영역]: 하의 (바지) - 상의 바로 아래에 실루엣이 자연스럽게 이어짐 */}
          {bottomProduct && (
            <div
              onClick={() => setSelectedProductDetail(bottomProduct)}
              className="w-[48%] max-w-[170px] -mt-3 sm:-mt-5 z-15 hover:z-30 transition-transform duration-300 hover:scale-105 cursor-pointer"
              title={`${bottomProduct.name} (클릭하여 상세 정보 보기)`}
            >
              <img
                src={bottomProduct.photoUrl}
                alt={bottomProduct.name}
                className="w-full h-[175px] sm:h-[200px] object-contain drop-shadow-sm filter transition-all hover:drop-shadow-md"
              />
            </div>
          )}

          {/* [하단 영역]: 신발 - 바지 밑단 아래에 가지런히 배치 */}
          {shoesProduct && (
            <div
              onClick={() => setSelectedProductDetail(shoesProduct)}
              className="w-[36%] max-w-[130px] -mt-2 sm:-mt-3 z-20 hover:z-30 transition-transform duration-300 hover:scale-105 cursor-pointer"
              title={`${shoesProduct.name} (클릭하여 상세 정보 보기)`}
            >
              <img
                src={shoesProduct.photoUrl}
                alt={shoesProduct.name}
                className="w-full h-[80px] sm:h-[90px] object-contain drop-shadow-sm filter transition-all hover:drop-shadow-md"
              />
            </div>
          )}
        </div>

        {/* 캔버스 하단 클릭 안내 팁 (간결한 텍스트) */}
        <div className="mt-2 text-center">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
            상품을 누르면 소재와 두께감 등 상세 정보를 확인할 수 있습니다
          </span>
        </div>
      </div>

      {/* 4. 코디 정보 영역: 보드 아래에 간결하고 명확하게 표시 (이미지 위 겹침 배제) */}
      <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 space-y-3">
        {/* 코디 이름 & 스타일 */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-700/60">
          <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
            {currentOutfit.title}
          </h3>
          <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md">
            {currentOutfit.styleName}
          </span>
        </div>

        {/* 구성: 아우터 + 상의 + 하의 + 신발 */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
            코디 구성
          </span>
          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            {currentOutfit.clothingItems}
          </p>
        </div>

        {/* 오늘 날씨와 일정에 어울리는 구체적 이유 */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>오늘 날씨 추천 이유</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {currentOutfit.description}
          </p>
        </div>

        {/* 실제 원문 / 무신사 링크 버튼 */}
        <div className="pt-2">
          <a
            href={currentOutfit.snapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-98 cursor-pointer"
          >
            <span>무신사에서 코디 보기</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 5. 상품 상세 모달 */}
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
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-square w-full bg-[#f8fafc] dark:bg-zinc-800 rounded-2xl flex items-center justify-center p-4">
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
              className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-bold hover:bg-zinc-800 cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
