"use client"

import { useState, useRef, useEffect } from "react"
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
import {
  cleanAndFormatProductImage,
  processAndResizeImage,
  NormalizedCropBox,
} from "@/lib/utils/image-processing"
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
  Crop,
  RotateCcw,
  Sliders,
  Check,
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
  cleanedUrl: string // 쇼핑몰 UI 및 배경이 정리된 스튜디오 상품 이미지
  status: "pending" | "processing" | "analyzed" | "error"
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
  activeView: "cleaned" | "original"
  cropBox: NormalizedCropBox
  confidenceNotes: string
}

export function ClothUploadModal({ isOpen, onClose, onSaveItem }: ClothUploadModalProps) {
  const [pendingQueue, setPendingQueue] = useState<PendingItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isProcessingBatch, setIsProcessingBatch] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isManualCropMode, setIsManualCropMode] = useState(false)

  // 수동 크롭 조절용 슬라이더 상태 (0 ~ 1000)
  const [cropYMin, setCropYMin] = useState(20)
  const [cropYMax, setCropYMax] = useState(865)
  const [cropXMin, setCropXMin] = useState(20)
  const [cropXMax, setCropXMax] = useState(980)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const currentItem = pendingQueue[currentIndex]

  // 현재 아이템 변경 시 크롭 박스 동기화
  useEffect(() => {
    if (currentItem) {
      setCropYMin(currentItem.cropBox.ymin)
      setCropYMax(currentItem.cropBox.ymax)
      setCropXMin(currentItem.cropBox.xmin)
      setCropXMax(currentItem.cropBox.xmax)
      setIsManualCropMode(false)
    }
  }, [currentIndex, currentItem?.id])

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
        const defaultBox: NormalizedCropBox = { ymin: 20, xmin: 20, ymax: 865, xmax: 980 }
        const { originalDataUrl, noBgDataUrl } = await processAndResizeImage(file, defaultBox)

        const pending: PendingItem = {
          id: `cloth_${Date.now()}_${i}`,
          file,
          originalUrl: originalDataUrl,
          cleanedUrl: noBgDataUrl,
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
          activeView: "cleaned",
          cropBox: defaultBox,
          confidenceNotes: "쇼핑몰 UI 및 배경을 자동 분리 중입니다...",
        }
        newPendingItems.push(pending)
      } catch (err) {
        console.error("이미지 처리 실패:", err)
      }
    }

    setPendingQueue((prev) => [...prev, ...newPendingItems])
    setIsProcessingBatch(false)

    // 순차적으로 AI 분석 및 스마트 크롭 실행
    processAnalysisQueue(newPendingItems)
  }

  // AI 분석 및 크롭 박스 적용
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

        // AI가 제안한 크롭 박스가 있으면 캔버스 재처리
        let updatedCleanedUrl = item.cleanedUrl
        const suggestedBox = analysis.cropBox || item.cropBox
        if (analysis.cropBox) {
          try {
            const reprocessed = await cleanAndFormatProductImage(item.originalUrl, suggestedBox)
            updatedCleanedUrl = reprocessed.cleanedDataUrl
          } catch {}
        }

        setPendingQueue((prev) =>
          prev.map((p) => {
            if (p.id !== item.id) return p
            return {
              ...p,
              status: "analyzed",
              cleanedUrl: updatedCleanedUrl,
              cropBox: suggestedBox,
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
              confidenceNotes: analysis.confidenceNotes || "상품 분리 완료",
            }
          }),
        )
      } catch {
        setPendingQueue((prev) =>
          prev.map((p) => {
            if (p.id !== item.id) return p
            return {
              ...p,
              status: "error",
              confidenceNotes: "자동 영역 인식이 원활하지 않습니다. 직접 영역을 수정하거나 정보를 입력해주세요.",
            }
          }),
        )
      }
    }
  }

  // 수동 크롭 적용 핸들러
  const handleApplyManualCrop = async () => {
    if (!currentItem) return
    const customBox: NormalizedCropBox = {
      ymin: Math.min(cropYMin, cropYMax - 50),
      ymax: Math.max(cropYMax, cropYMin + 50),
      xmin: Math.min(cropXMin, cropXMax - 50),
      xmax: Math.max(cropXMax, cropXMin + 50),
    }

    try {
      const { cleanedDataUrl } = await cleanAndFormatProductImage(
        currentItem.originalUrl,
        customBox,
      )
      setPendingQueue((prev) =>
        prev.map((p, idx) =>
          idx === currentIndex
            ? { ...p, cleanedUrl: cleanedDataUrl, cropBox: customBox, activeView: "cleaned" }
            : p,
        ),
      )
      setIsManualCropMode(false)
    } catch (e) {
      console.error(e)
    }
  }

  const updateCurrentItem = (updates: Partial<PendingItem>) => {
    setPendingQueue((prev) =>
      prev.map((p, idx) => (idx === currentIndex ? { ...p, ...updates } : p)),
    )
  }

  // 최종 저장
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
        isAttributeConfirmed: true,
        // 정리된 상품 사진을 기본으로 사용, 원본 사진도 별도 보관
        originalImageUrl: currentItem.originalUrl,
        noBgImageUrl: currentItem.cleanedUrl,
        activeImageMode: "nobg", // 항상 정돈된 스튜디오 상품 이미지 모드
        isFavorite: false,
        wearCount: 0,
        lastWornDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await onSaveItem(closetItem)

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
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                스마트 옷 등록 & 사진 자동 정리
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                쇼핑몰 캡처나 촬영 사진의 주변 요소를 지우고 상품 사진으로 정돈해 드려요
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 바디 영역 */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
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
                  <span className="text-[11px] text-zinc-500">방바닥/옷걸이 사진도 깔끔 정리</span>
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
                    쇼핑몰 캡처 / 보관함
                  </span>
                  <span className="text-[11px] text-zinc-500">하트·뱃지 자동 제외</span>
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

              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-xs text-zinc-500 dark:text-zinc-400 space-y-1.5">
                <div className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                  <span>스마트 사진 정돈 기능 안내</span>
                </div>
                <p>• 무신사 등 쇼핑몰 캡처에 붙은 하트 버튼, 컬러칩, 뱃지를 스마트하게 제외합니다.</p>
                <p>• 옷 자체의 로고, 프린트, 자수, 고유 색상은 100% 그대로 보존합니다.</p>
                <p>• 흰색/밝은 회색의 통일된 스튜디오 배경 중앙에 전체 상품이 잘리지 않게 배치됩니다.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 대기열 진행 상태 */}
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

              {/* 이미지 뷰어 (정리된 이미지 vs 원본 사진 탭 & 수동 크롭 도구) */}
              <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-[#f8fafc] dark:bg-zinc-800">
                <div className="h-60 w-full flex items-center justify-center p-3 relative">
                  <img
                    src={
                      currentItem?.activeView === "cleaned"
                        ? currentItem.cleanedUrl
                        : currentItem?.originalUrl
                    }
                    alt={currentItem?.name}
                    className="max-h-full max-w-full object-contain drop-shadow-xs"
                  />

                  {/* 수동 크롭 오버레이 (영역 수정 모드일 때 원본 이미지 위에 표시) */}
                  {isManualCropMode && (
                    <div
                      className="absolute inset-x-8 border-2 border-dashed border-sky-500 bg-sky-500/10 pointer-events-none transition-all"
                      style={{
                        top: `${(cropYMin / 1000) * 100}%`,
                        bottom: `${(1 - cropYMax / 1000) * 100}%`,
                        left: `${(cropXMin / 1000) * 100}%`,
                        right: `${(1 - cropXMax / 1000) * 100}%`,
                      }}
                    >
                      <span className="absolute -top-6 left-0 bg-sky-600 text-white text-[10px] px-2 py-0.5 rounded font-bold shadow-xs">
                        선택된 상품 영역 (쇼핑몰 UI 제외)
                      </span>
                    </div>
                  )}
                </div>

                {/* 뷰 전환 버튼 (정리된 상품 뷰 vs 원본 비교) */}
                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-black/75 backdrop-blur-xs p-1 rounded-xl text-[11px] text-white z-10">
                  <button
                    type="button"
                    onClick={() => updateCurrentItem({ activeView: "cleaned" })}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      currentItem?.activeView === "cleaned"
                        ? "bg-sky-500 text-white font-bold"
                        : "text-zinc-300 hover:text-white"
                    }`}
                  >
                    정리된 상품 사진
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCurrentItem({ activeView: "original" })}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      currentItem?.activeView === "original"
                        ? "bg-white text-zinc-900 font-bold"
                        : "text-zinc-300 hover:text-white"
                    }`}
                  >
                    업로드 원본
                  </button>
                </div>

                {/* 수동 크롭 열기 버튼 */}
                <button
                  type="button"
                  onClick={() => {
                    setIsManualCropMode(!isManualCropMode)
                    updateCurrentItem({ activeView: "original" })
                  }}
                  className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-zinc-700 dark:text-zinc-200 shadow-xs hover:bg-zinc-100 z-10"
                >
                  <Crop className="w-3.5 h-3.5 text-sky-600" />
                  <span>{isManualCropMode ? "크롭 닫기" : "영역 직접 수정"}</span>
                </button>

                {/* AI 처리 배너 */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  {currentItem?.status === "processing" ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500 text-white text-[11px] font-bold shadow-xs">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      스마트 분리 중...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      상품 정돈 완료 (로고·프린트 보존)
                    </span>
                  )}
                </div>
              </div>

              {/* 수동 크롭 조절 슬라이더 패널 */}
              {isManualCropMode && (
                <div className="p-3.5 bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-2xl space-y-2.5 text-xs animate-in fade-in-50">
                  <div className="flex items-center justify-between font-bold text-sky-900 dark:text-sky-200">
                    <span className="flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-sky-600" />
                      <span>자르기 영역 미세 조절</span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-normal">
                      쇼핑몰 하트/뱃지가 보이면 하단을 위로 올려주세요
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-zinc-500">상단 위치: {cropYMin / 10}%</span>
                      <input
                        type="range"
                        min="0"
                        max="500"
                        value={cropYMin}
                        onChange={(e) => setCropYMin(Number(e.target.value))}
                        className="w-full accent-sky-600"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500">하단 위치: {cropYMax / 10}%</span>
                      <input
                        type="range"
                        min="500"
                        max="1000"
                        value={cropYMax}
                        onChange={(e) => setCropYMax(Number(e.target.value))}
                        className="w-full accent-sky-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleApplyManualCrop}
                      className="px-3.5 py-1.5 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 shadow-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>이 영역으로 다시 정리하기</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 속성 폼 */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    옷 이름 (짧고 명확한 이름)
                  </label>
                  <input
                    type="text"
                    value={currentItem?.name || ""}
                    onChange={(e) => updateCurrentItem({ name: e.target.value })}
                    placeholder="예: 차콜 반집업 니트, 연청 와이드 데님"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

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

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    적합 계절
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

                {/* 소재 & 두께 확인 배너 */}
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-200">
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      소재 & 보온성 확인 (사용자 검토 권장)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-zinc-500 mb-1">두께감</span>
                      <select
                        value={currentItem?.thickness || "medium"}
                        onChange={(e) =>
                          updateCurrentItem({ thickness: e.target.value as ThicknessLevel })
                        }
                        className="w-full p-1.5 bg-white dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 rounded-xl"
                      >
                        <option value="thin">얇음</option>
                        <option value="medium">보통</option>
                        <option value="thick">두꺼움</option>
                      </select>
                    </div>

                    <div>
                      <span className="block text-zinc-500 mb-1">보온성</span>
                      <select
                        value={currentItem?.warmth || "medium"}
                        onChange={(e) =>
                          updateCurrentItem({ warmth: e.target.value as WarmthLevel })
                        }
                        className="w-full p-1.5 bg-white dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 rounded-xl"
                      >
                        <option value="low">낮음</option>
                        <option value="medium">보통</option>
                        <option value="high">높음 (따뜻함)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 버튼 */}
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
              className="py-2.5 px-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            >
              건너뛰기
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
