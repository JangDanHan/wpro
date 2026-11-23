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
  isolateGarmentWithPolygonMask,
  processAndResizeImage,
  NormalizedCropBox,
} from "@/lib/utils/image-processing"
import { GarmentMaskItem } from "@/lib/ai/gemini-closet-analyzer"
import { MaskBrushEditor } from "@/components/closet/MaskBrushEditor"
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
  Sliders,
  Check,
  Paintbrush,
  Sun,
  Moon,
  AlertTriangle,
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
  cleanedUrl: string // 투명 배경(Alpha channel)을 가진 분리 PNG
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
  detectedGarments?: GarmentMaskItem[]
  selectedGarmentId?: string
  confidenceNotes: string
}

export function ClothUploadModal({ isOpen, onClose, onSaveItem }: ClothUploadModalProps) {
  const [pendingQueue, setPendingQueue] = useState<PendingItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isProcessingBatch, setIsProcessingBatch] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // 마스크 브러시 편집 모드 상태
  const [isBrushEditorOpen, setIsBrushEditorOpen] = useState(false)
  const [bgPreviewMode, setBgPreviewMode] = useState<"checker" | "white" | "dark">("checker")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const currentItem = pendingQueue[currentIndex]

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
          confidenceNotes: "사람과 배경을 제외하고 선택한 의류 영역을 분리 중입니다...",
        }
        newPendingItems.push(pending)
      } catch (err) {
        console.error("이미지 처리 실패:", err)
      }
    }

    setPendingQueue((prev) => [...prev, ...newPendingItems])
    setIsProcessingBatch(false)

    // 순차적으로 AI 의류 정밀 세그멘테이션 실행
    processAnalysisQueue(newPendingItems)
  }

  // AI 분석 및 폴리곤 마스크 분리 실행
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

        // 폴리곤 마스크 기반 정밀 투명 분리 적용
        let transparentUrl = item.cleanedUrl
        const polygonToUse =
          analysis.primaryPolygon || analysis.detectedGarments?.[0]?.polygon
        const holesToUse =
          analysis.primaryHoles || analysis.detectedGarments?.[0]?.holes

        try {
          const segmented = await isolateGarmentWithPolygonMask(
            item.originalUrl,
            polygonToUse,
            holesToUse,
            analysis.cropBox,
          )
          transparentUrl = segmented.transparentPngUrl
        } catch {}

        setPendingQueue((prev) =>
          prev.map((p) => {
            if (p.id !== item.id) return p
            return {
              ...p,
              status: "analyzed",
              cleanedUrl: transparentUrl,
              detectedGarments: analysis.detectedGarments,
              selectedGarmentId: analysis.detectedGarments?.[0]?.id,
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
              confidenceNotes: analysis.confidenceNotes || "의류 분리 완료",
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
              confidenceNotes: "자동 분리가 원활하지 않습니다. [마스크 브러시]로 영역을 직접 다듬을 수 있습니다.",
            }
          }),
        )
      }
    }
  }

  // 여러 의류 중 특정 아이템 선택 시 마스크 재적용
  const handleSelectGarmentItem = async (garment: GarmentMaskItem) => {
    if (!currentItem) return
    try {
      const segmented = await isolateGarmentWithPolygonMask(
        currentItem.originalUrl,
        garment.polygon,
        garment.holes,
        garment.cropBox,
      )
      setPendingQueue((prev) =>
        prev.map((p, idx) =>
          idx === currentIndex
            ? {
                ...p,
                cleanedUrl: segmented.transparentPngUrl,
                category: garment.category,
                name: garment.name || p.name,
                selectedGarmentId: garment.id,
                activeView: "cleaned",
              }
            : p,
        ),
      )
    } catch (e) {
      console.error(e)
    }
  }

  // 마스크 브러시 편집 완료 핸들러
  const handleApplyBrushMask = (newMaskedUrl: string) => {
    setPendingQueue((prev) =>
      prev.map((p, idx) =>
        idx === currentIndex
          ? { ...p, cleanedUrl: newMaskedUrl, activeView: "cleaned" }
          : p,
      ),
    )
    setIsBrushEditorOpen(false)
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
        // 원본과 실제 투명 PNG를 분리 보관
        originalImageUrl: currentItem.originalUrl,
        noBgImageUrl: currentItem.cleanedUrl,
        activeImageMode: "nobg",
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
        {/* 모달 상단 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                스마트 옷 등록 & 의류 단독 분리
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                사람과 배경을 지우고 선택한 옷만 투명하게 분리해 드려요
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
                {/* 1. 카메라 촬영 버튼 */}
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
                  <span className="text-[11px] text-zinc-500">방바닥/착용 사진도 옷만 분리</span>
                </button>

                {/* 2. 보관함 버튼 (요구사항 1: '보관함' 단독 표기, 보조 문구 삭제) */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2.5 p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group"
                >
                  <div className="p-3 bg-zinc-700 text-white rounded-full shadow-md group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    보관함
                  </span>
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
                  <span>의류 단독 분리 안내</span>
                </div>
                <p>• 사람이 옷을 입고 있는 사진에서도 얼굴, 목 피부, 손, 다른 옷을 지우고 <strong>해당 옷만</strong> 단독 분리합니다.</p>
                <p>• 사진에 상의·하의 등 여러 옷이 있을 땐 원하는 옷을 직접 선택하거나 브러시로 쉽게 다듬을 수 있습니다.</p>
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

              {/* 사진 속 여러 의류가 감지된 경우: 타겟 의류 선택 칩 */}
              {currentItem?.detectedGarments && currentItem.detectedGarments.length > 1 && (
                <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl space-y-1.5">
                  <span className="text-[11px] font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-sky-600" />
                    <span>등록할 의류 선택:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentItem.detectedGarments.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleSelectGarmentItem(g)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          currentItem.selectedGarmentId === g.id
                            ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                            : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
                        }`}
                      >
                        {CATEGORY_LABELS[g.category]}: {g.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 이미지 뷰어 (실제 투명 배경 PNG vs 업로드 원본 탭) */}
              <div
                className={`relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 ${
                  currentItem?.activeView === "cleaned" && bgPreviewMode === "checker"
                    ? "bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0]"
                    : currentItem?.activeView === "cleaned" && bgPreviewMode === "dark"
                    ? "bg-zinc-950"
                    : "bg-[#f8fafc] dark:bg-zinc-800"
                }`}
              >
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
                </div>

                {/* 뷰 전환 버튼 (투명 분리본 vs 업로드 원본) */}
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
                    의류 단독 분리본
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

                {/* 브러시 마스크 수정 버튼 */}
                <button
                  type="button"
                  onClick={() => setIsBrushEditorOpen(true)}
                  className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-zinc-800 dark:text-zinc-200 shadow-xs hover:bg-zinc-100 cursor-pointer z-10"
                >
                  <Paintbrush className="w-3.5 h-3.5 text-sky-600" />
                  <span>마스크 브러시 수정</span>
                </button>

                {/* 투명 배경 확인 모드 토글 (체커/화이트/다크) */}
                {currentItem?.activeView === "cleaned" && (
                  <button
                    type="button"
                    onClick={() =>
                      setBgPreviewMode(
                        bgPreviewMode === "checker"
                          ? "white"
                          : bgPreviewMode === "white"
                          ? "dark"
                          : "checker",
                      )
                    }
                    className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 z-10"
                  >
                    {bgPreviewMode === "checker" ? "투명 격자" : bgPreviewMode === "white" ? "흰 배경" : "어두운 배경"}
                  </button>
                )}

                {/* 상태 뱃지 */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  {currentItem?.status === "processing" ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500 text-white text-[11px] font-bold shadow-xs">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      의류 정밀 분리 중...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      의류 분리 완료 (투명 PNG)
                    </span>
                  )}
                </div>
              </div>

              {/* 사람 형태나 피부 잔여 주의 배너 (요구사항 5) */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                <AlertCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  사람이 입고 있던 옷의 경우 목 둘레나 손 등의 피부가 일부 남아있을 수 있습니다. 남아있는 피부나 다른 물체는 <strong>[마스크 브러시 수정]</strong>의 지우개로 쓱 문질러 정리해 주세요.
                </span>
              </div>

              {/* 인터랙티브 마스크 브러시 에디터 모달/패널 */}
              {isBrushEditorOpen && (
                <MaskBrushEditor
                  originalImageUrl={currentItem.originalUrl}
                  currentMaskedImageUrl={currentItem.cleanedUrl}
                  onApplyMask={handleApplyBrushMask}
                  onCancel={() => setIsBrushEditorOpen(false)}
                />
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
