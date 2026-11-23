"use client"

import { useState, useMemo } from "react"
import { OutfitRecommendation, ProductItem } from "@/lib/domain/types"
import { MusinsaSnapStyle } from "@/lib/domain/musinsa-snap-catalog"
import {
  Sparkles,
  RefreshCw,
  ExternalLink,
  X,
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

    // 2. 대체 코디들 (완성된 한 벌 단위 콜라주)
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

  // '다른 코디 보기' 핸들러 (콜라주 전체가 새로운 조합으로 전환)
  const handleNextOutfit = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredOutfits.length)
  }

  // 스타일 필터 변경
  const handleSelectStyle = (style: "all" | MusinsaSnapStyle) => {
    setSelectedStyleFilter(style)
    setCurrentIndex(0)
  }

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
                날씨 맞춤 코디 콜라주
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
                스타일링 콜라주
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              오늘 날씨에 어울리는 한 벌의 구성을 패션 콜라주로 확인해보세요
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

      {/* 3. [핵심 요구사항] 흰 배경 한 장에 누끼 상품들을 함께 배치한 패션 코디 콜라주 */}
      {/* 모바일에서도 상대적 위치와 비율을 유지하며 전체가 축소되도록 aspect-ratio 캔버스 적용 */}
      <div className="relative w-full rounded-3xl bg-white border border-zinc-200/90 shadow-sm overflow-hidden select-none">
        
        {/* 순백색 콜라주 캔버스 (472:865 비율, 모바일·PC 동일 구도 보장) */}
        <div className="relative w-full aspect-[472/840] max-h-[640px] mx-auto overflow-hidden">
          {currentOutfit.productItems.map((product) => {
            const cs = product.collageStyle || {}

            return (
              <div
                key={product.id}
                onClick={() => setSelectedProductDetail(product)}
                style={{
                  position: "absolute",
                  top: cs.top || "20%",
                  left: cs.left,
                  right: cs.right,
                  bottom: cs.bottom,
                  width: cs.width || "45%",
                  zIndex: cs.zIndex || 10,
                }}
                className="group cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
                title={`${product.categoryLabel}: ${product.name} (클릭하여 상세 정보 보기)`}
              >
                {/* 누끼 상품 이미지 (배경 없음, 사각형 테두리 없음, 완전 투명) */}
                <img
                  src={product.photoUrl}
                  alt={product.name}
                  className="w-full h-auto object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.06)] group-hover:drop-shadow-[0_4px_16px_rgba(0,0,0,0.14)] transition-all pointer-events-auto"
                  loading="lazy"
                />

                {/* 마우스 호버 시 가벼운 미니 라벨 툴팁 */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-2 left-1/2 -translate-x-1/2 pointer-events-none z-50 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded-md bg-zinc-900/85 text-white text-[10px] font-medium shadow-md">
                    {product.name}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* 캔버스 하단 안내 문구 */}
        <div className="py-2.5 bg-zinc-50/80 border-t border-zinc-100 text-center">
          <p className="text-[10px] text-zinc-500 font-medium">
            각 상품을 누르면 사진과 정확히 일치하는 상세 정보를 확인할 수 있습니다
          </p>
        </div>
      </div>

      {/* 4. 코디 정보 영역: 콜라주 아래에 간결하고 정확하게 표시 (이미지 위 겹침 배제) */}
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

        {/* 구성 상품 목록 */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
            구성 상품
          </span>
          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed">
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

      {/* 5. [핵심] 누른 상품과 100% 동일한 ID와 데이터를 사용하는 상세 모달 (사진 불일치 원천 차단) */}
      {selectedProductDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            {/* 카테고리 배지 & 닫기 버튼 */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-bold">
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

            {/* 상품 단독 사진: 누끼 투명 처리, 사각형 흰 가림 흔적 없음 */}
            <div className="aspect-square w-full bg-zinc-50 dark:bg-zinc-800/80 rounded-2xl flex items-center justify-center p-4">
              <img
                src={selectedProductDetail.photoUrl}
                alt={selectedProductDetail.name}
                className="max-h-full max-w-full object-contain drop-shadow-sm"
              />
            </div>

            {/* 상품명 및 상세 설명 (동일 ID 단일 데이터 소스) */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {selectedProductDetail.name}
              </h3>
              {selectedProductDetail.description && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {selectedProductDetail.description}
                </p>
              )}
              {selectedProductDetail.material && (
                <div className="pt-2 text-[11px] text-zinc-500 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">소재: </span>
                  <span>{selectedProductDetail.material}</span>
                </div>
              )}
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
