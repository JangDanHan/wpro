"use client"

import { useState, useMemo } from "react"
import {
  ClosetItem,
  ClothingCategory,
  CATEGORY_LABELS,
  Season,
  SEASON_LABELS,
  ClothingStyle,
  STYLE_LABELS,
} from "@/lib/domain/closet-types"
import {
  Search,
  Star,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Flame,
  Layers,
  Sparkles,
  Filter,
} from "lucide-react"

interface ClosetGalleryProps {
  clothes: ClosetItem[]
  onOpenUploadModal: () => void
  onToggleFavorite: (id: string) => Promise<void>
  onDeleteItem: (id: string) => Promise<void>
  onUpdateItem: (item: ClosetItem) => Promise<void>
  onSeedSamples: () => Promise<void>
}

export function ClosetGallery({
  clothes,
  onOpenUploadModal,
  onToggleFavorite,
  onDeleteItem,
  onUpdateItem,
  onSeedSamples,
}: ClosetGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | "all">("all")
  const [selectedSeason, setSelectedSeason] = useState<Season | "all">("all")
  const [selectedStyle, setSelectedStyle] = useState<ClothingStyle | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [editingItem, setEditingItem] = useState<ClosetItem | null>(null)

  // 필터링 및 검색된 옷 목록
  const filteredClothes = useMemo(() => {
    return clothes.filter((item) => {
      // 1. 카테고리 필터
      if (selectedCategory !== "all" && item.category !== selectedCategory) return false

      // 2. 계절 필터
      if (selectedSeason !== "all" && !item.seasons.includes(selectedSeason) && !item.seasons.includes("all")) {
        return false
      }

      // 3. 스타일 필터
      if (selectedStyle !== "all" && item.style !== selectedStyle) return false

      // 4. 즐겨찾기 필터
      if (onlyFavorites && !item.isFavorite) return false

      // 5. 검색어 (이름, 색상, 세부카테고리, 소재)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        const matchName = item.name.toLowerCase().includes(q)
        const matchColors = item.colors.some((c) => c.toLowerCase().includes(q))
        const matchSub = item.subCategory?.toLowerCase().includes(q)
        const matchMaterial = item.material?.toLowerCase().includes(q)
        if (!matchName && !matchColors && !matchSub && !matchMaterial) return false
      }

      return true
    })
  }, [clothes, selectedCategory, selectedSeason, selectedStyle, onlyFavorites, searchQuery])

  // 원본 vs 배경제거 이미지 전환 토글
  const handleToggleImageMode = async (item: ClosetItem) => {
    const nextMode = item.activeImageMode === "nobg" ? "original" : "nobg"
    await onUpdateItem({ ...item, activeImageMode: nextMode })
  }

  return (
    <div className="space-y-4">
      {/* 1. 상단 컨트롤 바 (검색창 + 옷 등록 버튼) */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="옷 이름, 색상, 소재 검색..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600"
            >
              지우기
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenUploadModal}
          className="py-2 px-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>옷 등록</span>
        </button>
      </div>

      {/* 2. 카테고리 칩 스크롤 바 */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`py-1.5 px-3 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
            selectedCategory === "all"
              ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs"
              : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100"
          }`}
        >
          전체 ({clothes.length})
        </button>

        {(Object.keys(CATEGORY_LABELS) as ClothingCategory[]).map((cat) => {
          const count = clothes.filter((c) => c.category === cat).length
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100"
              }`}
            >
              {CATEGORY_LABELS[cat]} {count > 0 && <span className="opacity-80">({count})</span>}
            </button>
          )
        })}
      </div>

      {/* 3. 서브 필터 (계절, 즐겨찾기) */}
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-0.5">
        <div className="flex items-center gap-1.5">
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value as any)}
            className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs"
          >
            <option value="all">모든 계절</option>
            <option value="spring">봄</option>
            <option value="summer">여름</option>
            <option value="autumn">가을</option>
            <option value="winter">겨울</option>
          </select>

          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value as any)}
            className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs"
          >
            <option value="all">모든 스타일</option>
            <option value="casual">캐주얼</option>
            <option value="formal">포멀</option>
            <option value="minimal">미니멀</option>
            <option value="street">스트릿</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            onlyFavorites
              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-300 dark:border-amber-800 font-bold"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${onlyFavorites ? "fill-amber-500 text-amber-500" : ""}`} />
          <span>즐겨찾기만</span>
        </button>
      </div>

      {/* 4. 옷 카드 그리드 목록 */}
      {filteredClothes.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-3">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl w-fit mx-auto">
            <Filter className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              조건에 맞는 옷이 없습니다.
            </p>
            <p className="text-xs text-zinc-500">
              검색어나 필터를 초기화하거나 새로운 옷을 등록해보세요.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={onOpenUploadModal}
              className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 shadow-sm"
            >
              새 옷 등록하기
            </button>
            {clothes.length === 0 && (
              <button
                type="button"
                onClick={onSeedSamples}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold hover:bg-zinc-200"
              >
                샘플 옷 채우기
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {filteredClothes.map((item) => {
            const displayImg =
              item.activeImageMode === "nobg" && item.noBgImageUrl
                ? item.noBgImageUrl
                : item.originalImageUrl

            return (
              <div
                key={item.id}
                className="group relative bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                {/* 옷 사진 영역 */}
                <div className="relative aspect-4/3 w-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center p-2.5 overflow-hidden">
                  <img
                    src={displayImg}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-102 transition-transform duration-300 drop-shadow-xs"
                    loading="lazy"
                  />

                  {/* 즐겨찾기 버튼 */}
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(item.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs rounded-full shadow-xs hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        item.isFavorite
                          ? "fill-amber-400 text-amber-500"
                          : "text-zinc-400 hover:text-zinc-600"
                      }`}
                    />
                  </button>

                  {/* 누끼/원본 토글 버튼 */}
                  {item.noBgImageUrl && (
                    <button
                      type="button"
                      onClick={() => handleToggleImageMode(item)}
                      title="원본 / 배경제거 전환"
                      className="absolute bottom-2 left-2 p-1 px-1.5 bg-black/60 backdrop-blur-xs text-white rounded-lg text-[10px] font-medium flex items-center gap-1 hover:bg-black/80"
                    >
                      <Layers className="w-3 h-3" />
                      <span>{item.activeImageMode === "nobg" ? "누끼" : "원본"}</span>
                    </button>
                  )}
                </div>

                {/* 카드 내용 */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center gap-1 text-[10px] text-sky-600 dark:text-sky-400 font-semibold mb-0.5">
                      <span>{CATEGORY_LABELS[item.category]}</span>
                      {item.subCategory && <span>• {item.subCategory}</span>}
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {item.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      {item.colors.slice(0, 2).map((c, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded text-[10px]"
                        >
                          {c}
                        </span>
                      ))}
                      <span className="px-1.5 py-0.5 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 rounded text-[10px]">
                        {STYLE_LABELS[item.style]}
                      </span>
                    </div>
                  </div>

                  {/* 착용 횟수 및 정보 푸터 */}
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1" title="착용 횟수">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>{item.wearCount || 0}회</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1 text-zinc-400 hover:text-red-500 rounded transition-colors"
                        title="옷 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
