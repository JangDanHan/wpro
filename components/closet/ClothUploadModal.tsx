"use client"

import { useState, useRef } from "react"
import {
  ClosetItem,
  ClothingCategory,
  CATEGORY_LABELS,
  Season,
  SEASON_LABELS,
  ClothingStyle,
  STYLE_LABELS,
  ThicknessLevel,
  WarmthLevel,
} from "@/lib/domain/closet-types"
import { processAndResizeImage } from "@/lib/utils/image-processing"
import {
  X,
  Camera,
  Upload,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  Image as ImageIcon,
} from "lucide-react"

interface ClothUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSaveItem: (item: ClosetItem) => Promise<void>
}

interface PendingItem {
  id: string
  file: File
  originalUrl: string
  noBgUrl: string
  status: "pending" | "processing" | "analyzed" | "error"
  // 편집 가능한 폼 상태
  name: string
  category: ClothingCategory
  subCategory: string
  colors: string[]
  pattern: string
  style: ClothingStyle
  seasons: Season[]
  material: string
  thickness: ThicknessLevel
  warmth: WarmthLevel
  isMaterialInferred: boolean
  activeImageMode: "original" | "nobg"
  confidenceNotes: string
}

export function ClothUploadModal({ isOpen, onClose, onSaveItem }: ClothUploadModalProps) {
  const [pendingQueue, setPendingQueue] = useState<PendingItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isProcessingBatch, setIsProcessingBatch] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  // 파일 선택 처리 (다중 선택 지원)
  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return

    const files = Array.from(fileList)
    setIsProcessingBatch(true)

    const newPendingItems: PendingItem[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const { originalDataUrl, noBgDataUrl } = await processAndResizeImage(file)

        const pending: PendingItem = {
          id: `cloth_${Date.now()}_${i}`,
          file,
          originalUrl: originalDataUrl,
          noBgUrl: noBgDataUrl,
          status: "processing",
          name: file.name.replace(/\.[^/.]+$/, "").slice(0, 30),
          category: "top",
          subCategory: "",
          colors: ["블랙"],
          pattern: "무지",
          style: "casual",
          seasons: ["all"],
          material: "",
          thickness: "medium",
          warmth: "medium",
          isMaterialInferred: true,
          activeImageMode: "nobg",
          confidenceNotes: "AI 분석을 시작합니다...",
        }
        newPendingItems.push(pending)
      } catch (err) {
        console.error("이미지 처리 실패:", err)
      }
    }

    setPendingQueue((prev) => [...prev, ...newPendingItems])
    setIsProcessingBatch(false)

    // 순차적으로 AI 분석 API 호출
    processAnalysisQueue(newPendingItems)
  }

  // AI 분석 순차 실행
  const processAnalysisQueue = async (items: PendingItem[]) => {
    for (const item of items) {
      try {
        const res = await fetch("/api/closet/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: item.originalUrl,
            mimeType: item.file.type || "image/jpeg",
          }),
        })

        if (!res.ok) throw new Error("API 요청 실패")
        const data = await res.json()
        const analysis = data.analysis

        setPendingQueue((prev) =>
          prev.map((p) => {
            if (p.id !== item.id) return p
            return {
              ...p,
              status: "analyzed",
              name: analysis.name || p.name,
              category: analysis.category || p.category,
              subCategory: analysis.subCategory || "",
              colors: analysis.colors || p.colors,
              pattern: analysis.pattern || p.pattern,
              style: analysis.style || p.style,
              seasons: analysis.seasons || p.seasons,
              material: analysis.suggestedMaterial || "",
              thickness: analysis.thickness || p.thickness,
              warmth: analysis.warmth || p.warmth,
              isMaterialInferred: analysis.isMaterialInferred ?? true,
              confidenceNotes: analysis.confidenceNotes || "분석 완료",
            }
          }),
        )
      } catch (error) {
        // 분석 실패 시에도 수동 입력 가능하도록 상태 변경
        setPendingQueue((prev) =>
          prev.map((p) => {
            if (p.id !== item.id) return p
            return {
              ...p,
              status: "error",
              confidenceNotes: "AI 자동 분석에 실패했습니다. 직접 정보를 입력해주세요.",
            }
          }),
        )
      }
    }
  }

  const currentItem = pendingQueue[currentIndex]

  // 현재 아이템 필드 변경 핸들러
  const updateCurrentItem = (updates: Partial<PendingItem>) => {
    setPendingQueue((prev) =>
      prev.map((p, idx) => (idx === currentIndex ? { ...p, ...updates } : p)),
    )
  }

  // 저장 및 다음 아이템으로 이동
  const handleSaveCurrentItem = async () => {
    if (!currentItem) return
    setIsSaving(true)

    try {
      const closetItem: ClosetItem = {
        id: currentItem.id,
        userId: "default_user",
        name: currentItem.name.trim() || "내 옷",
        category: currentItem.category,
        subCategory: currentItem.subCategory.trim() || undefined,
        colors: currentItem.colors,
        pattern: currentItem.pattern,
        style: currentItem.style,
        seasons: currentItem.seasons,
        material: currentItem.material.trim() || undefined,
        thickness: currentItem.thickness,
        warmth: currentItem.warmth,
        isAttributeConfirmed: true, // 사용자가 확인 후 저장함
        originalImageUrl: currentItem.originalUrl,
        noBgImageUrl: currentItem.noBgUrl,
        activeImageMode: currentItem.activeImageMode,
        isFavorite: false,
        wearCount: 0,
        lastWornDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await onSaveItem(closetItem)

      // 대기 큐에서 제거
      const nextQueue = pendingQueue.filter((_, idx) => idx !== currentIndex)
      setPendingQueue(nextQueue)
      if (currentIndex >= nextQueue.length) {
        setCurrentIndex(Math.max(0, nextQueue.length - 1))
      }

      if (nextQueue.length === 0) {
        onClose()
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleSeason = (season: Season) => {
    if (!currentItem) return
    const exists = currentItem.seasons.includes(season)
    const newSeasons = exists
      ? currentItem.seasons.filter((s) => s !== season)
      : [...currentItem.seasons, season]
    updateCurrentItem({ seasons: newSeasons.length > 0 ? newSeasons : ["all"] })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* 모달 상단 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                스마트 옷 등록
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                사진을 올리면 AI가 배경을 지우고 속성을 분석해 드려요.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 바디 영역 */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* 1. 파일 선택 버튼들 (대기열 비어있을 때) */}
          {pendingQueue.length === 0 ? (
            <div className="space-y-4 py-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2.5 p-6 border-2 border-dashed border-sky-300 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20 rounded-2xl hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors cursor-pointer group"
                >
                  <div className="p-3 bg-sky-500 text-white rounded-full shadow-md group-hover:scale-105 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-sky-900 dark:text-sky-200">
                    카메라로 촬영
                  </span>
                  <span className="text-[11px] text-zinc-500">지금 바로 찍어서 등록</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2.5 p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group"
                >
                  <div className="p-3 bg-zinc-700 text-white rounded-full shadow-md group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    사진 보관함
                  </span>
                  <span className="text-[11px] text-zinc-500">여러 장 다중 선택 가능</span>
                </button>
              </div>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />

              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                <div className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                  <span>스마트 등록 팁</span>
                </div>
                <p>• 옷을 평평하게 펼치거나 옷걸이에 걸어 촬영하면 배경 제거가 더 깔끔합니다.</p>
                <p>• 여러 장을 한 번에 올려도 하나씩 순서대로 확인하고 등록할 수 있습니다.</p>
              </div>
            </div>
          ) : (
            /* 2. 대기열 진행 상태 및 현재 옷 속성 편집 폼 */
            <div className="space-y-4">
              {/* 다중 업로드 진행 바 */}
              <div className="flex items-center justify-between p-2.5 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl text-xs">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">
                  등록 대기열 ({currentIndex + 1} / {pendingQueue.length})
                </span>
                <div className="flex items-center gap-1">
                  {pendingQueue.map((item, idx) => (
                    <span
                      key={item.id}
                      className={`w-2 h-2 rounded-full ${
                        idx === currentIndex
                          ? "bg-sky-500 ring-2 ring-sky-300"
                          : item.status === "analyzed"
                          ? "bg-emerald-500"
                          : "bg-zinc-300 dark:bg-zinc-600"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* 이미지 미리보기 및 원본/배경 제거 탭 */}
              <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                <div className="h-56 w-full flex items-center justify-center p-2">
                  <img
                    src={
                      currentItem?.activeImageMode === "nobg" && currentItem.noBgUrl
                        ? currentItem.noBgUrl
                        : currentItem?.originalUrl
                    }
                    alt={currentItem?.name}
                    className="max-h-full max-w-full object-contain drop-shadow-sm"
                  />
                </div>

                {/* 원본 vs 배경제거(누끼) 전환 버튼 */}
                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-black/70 backdrop-blur-xs p-1 rounded-xl text-[11px] text-white">
                  <button
                    type="button"
                    onClick={() => updateCurrentItem({ activeImageMode: "original" })}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      currentItem?.activeImageMode === "original"
                        ? "bg-white text-zinc-900 font-bold"
                        : "text-zinc-300 hover:text-white"
                    }`}
                  >
                    원본 사진
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCurrentItem({ activeImageMode: "nobg" })}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      currentItem?.activeImageMode === "nobg"
                        ? "bg-sky-500 text-white font-bold"
                        : "text-zinc-300 hover:text-white"
                    }`}
                  >
                    배경 제거
                  </button>
                </div>

                {/* AI 상태 배너 */}
                <div className="absolute top-2.5 left-2.5">
                  {currentItem?.status === "processing" ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500 text-white text-[11px] font-bold shadow-sm">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      AI 분석 중...
                    </span>
                  ) : currentItem?.status === "analyzed" ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      AI 자동 분석 완료
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold shadow-sm">
                      <AlertCircle className="w-3.5 h-3.5" />
                      직접 확인 필요
                    </span>
                  )}
                </div>
              </div>

              {/* 속성 수정 폼 */}
              <div className="space-y-3.5">
                {/* 1. 옷 이름 */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    옷 이름 / 별칭
                  </label>
                  <input
                    type="text"
                    value={currentItem?.name || ""}
                    onChange={(e) => updateCurrentItem({ name: e.target.value })}
                    placeholder="예: 베이지 케이블 니트"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* 2. 카테고리 선택 */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    카테고리
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(Object.keys(CATEGORY_LABELS) as ClothingCategory[]).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => updateCurrentItem({ category: cat })}
                        className={`py-1.5 px-2 text-xs rounded-xl font-medium border transition-all ${
                          currentItem?.category === cat
                            ? "bg-sky-500 text-white border-sky-600 font-bold shadow-xs"
                            : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
                        }`}
                      >
                        {CATEGORY_LABELS[cat]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. 스타일 선택 */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    스타일 분위기
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(Object.keys(STYLE_LABELS) as ClothingStyle[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateCurrentItem({ style: st })}
                        className={`py-1.5 px-2 text-xs rounded-xl font-medium border transition-all ${
                          currentItem?.style === st
                            ? "bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 font-bold shadow-xs"
                            : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
                        }`}
                      >
                        {STYLE_LABELS[st]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. 적합 계절 다중 선택 */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    적합 계절 (중복 선택 가능)
                  </label>
                  <div className="flex gap-1.5">
                    {(Object.keys(SEASON_LABELS) as Season[]).map((season) => {
                      const isSelected = currentItem?.seasons.includes(season)
                      return (
                        <button
                          key={season}
                          type="button"
                          onClick={() => handleToggleSeason(season)}
                          className={`flex-1 py-1.5 text-xs rounded-xl font-medium border transition-all ${
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-700 font-bold"
                              : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          {SEASON_LABELS[season]}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 5. 소재 & 두께 & 보온성 (요구사항: 사진만으로 판단하기 어려우므로 추측을 확정하지 않고 사용자 확인 유도) */}
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      소재 및 보온성 확인 (사용자 확인 권장)
                    </span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-300 font-normal">
                      사진만으로는 정확한 두께 판단이 어려워요
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="block text-zinc-500 dark:text-zinc-400 mb-1">두께감</span>
                      <select
                        value={currentItem?.thickness || "medium"}
                        onChange={(e) =>
                          updateCurrentItem({ thickness: e.target.value as ThicknessLevel })
                        }
                        className="w-full p-2 bg-white dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 rounded-xl"
                      >
                        <option value="thin">얇음 (여름/간절기)</option>
                        <option value="medium">보통 (사계절/봄가을)</option>
                        <option value="thick">두꺼움 (겨울/기모/헤비)</option>
                      </select>
                    </div>

                    <div>
                      <span className="block text-zinc-500 dark:text-zinc-400 mb-1">보온성</span>
                      <select
                        value={currentItem?.warmth || "medium"}
                        onChange={(e) =>
                          updateCurrentItem({ warmth: e.target.value as WarmthLevel })
                        }
                        className="w-full p-2 bg-white dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 rounded-xl"
                      >
                        <option value="low">낮음 (시원함)</option>
                        <option value="medium">보통 (적당한 보온)</option>
                        <option value="high">높음 (따뜻함/방한)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">
                      소재 (직접 수정 가능)
                    </span>
                    <input
                      type="text"
                      value={currentItem?.material || ""}
                      onChange={(e) => updateCurrentItem({ material: e.target.value })}
                      placeholder="예: 울 80%, 캐시미어 20%"
                      className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 바 */}
        {pendingQueue.length > 0 && (
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                const nextQueue = pendingQueue.filter((_, idx) => idx !== currentIndex)
                setPendingQueue(nextQueue)
                if (currentIndex >= nextQueue.length) {
                  setCurrentIndex(Math.max(0, nextQueue.length - 1))
                }
              }}
              className="py-2.5 px-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              이 사진 건너뛰기
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveCurrentItem}
              className="flex-1 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>옷장에 저장 중...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    확인 후 옷장에 저장 {pendingQueue.length > 1 ? `(${currentIndex + 1}/${pendingQueue.length})` : ""}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
