"use client"

import { useState, useRef, useEffect } from "react"
import {
  Eraser,
  Paintbrush,
  RotateCcw,
  Undo2,
  Check,
  X,
  Sliders,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react"

interface MaskBrushEditorProps {
  originalImageUrl: string
  currentMaskedImageUrl: string
  onApplyMask: (newMaskedImageUrl: string) => void
  onCancel: () => void
}

export function MaskBrushEditor({
  originalImageUrl,
  currentMaskedImageUrl,
  onApplyMask,
  onCancel,
}: MaskBrushEditorProps) {
  const [brushMode, setBrushMode] = useState<"eraser" | "restore">("eraser")
  const [brushSize, setBrushSize] = useState(25)
  const [bgMode, setBgMode] = useState<"checker" | "white" | "dark">("checker")
  const [isDrawing, setIsDrawing] = useState(false)
  const [history, setHistory] = useState<string[]>([])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const originalImageRef = useRef<HTMLImageElement | null>(null)

  // 1. 초기 캔버스 로드
  useEffect(() => {
    const origImg = new Image()
    origImg.crossOrigin = "anonymous"
    origImg.onload = () => {
      originalImageRef.current = origImg
      loadMaskedImage()
    }
    origImg.src = originalImageUrl
  }, [originalImageUrl])

  const loadMaskedImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const maskedImg = new Image()
    maskedImg.crossOrigin = "anonymous"
    maskedImg.onload = () => {
      canvas.width = maskedImg.width
      canvas.height = maskedImg.height
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(maskedImg, 0, 0)
      // 초기 히스토리 저장
      setHistory([canvas.toDataURL("image/png")])
    }
    maskedImg.src = currentMaskedImageUrl
  }

  // 2. 브러시 그리기 시작
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ("touches" in e) {
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    draw(e)
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      setHistory((prev) => [...prev.slice(-10), canvas.toDataURL("image/png")])
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== "mousedown" && e.type !== "touchstart") return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { x, y } = getCanvasCoords(e)

    ctx.save()
    if (brushMode === "eraser") {
      // [지우기 브러시]: 사람 얼굴/피부/다른 옷 등을 완전 투명(Alpha: 0)으로 제거
      ctx.globalCompositeOperation = "destination-out"
      ctx.beginPath()
      ctx.arc(x, y, brushSize, 0, Math.PI * 2)
      ctx.fill()
    } else {
      // [복원 브러시]: 원본 사진에서 해당 영역의 옷감을 다시 칠함
      if (originalImageRef.current) {
        ctx.globalCompositeOperation = "source-over"
        ctx.beginPath()
        ctx.arc(x, y, brushSize, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(originalImageRef.current, 0, 0, canvas.width, canvas.height)
      }
    }
    ctx.restore()
  }

  // 3. 실행 취소 (Undo)
  const handleUndo = () => {
    if (history.length <= 1) return
    const newHistory = [...history]
    newHistory.pop() // 현재 상태 제거
    const prevDataUrl = newHistory[newHistory.length - 1]

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      setHistory(newHistory)
    }
    img.src = prevDataUrl
  }

  // 4. 적용 완료
  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const finalPng = canvas.toDataURL("image/png")
    onApplyMask(finalPng)
  }

  return (
    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-3.5 animate-in fade-in-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span>지우기 / 복원 마스크 브러시</span>
        </div>
        <div className="flex items-center gap-1">
          {/* 배경 확인 모드 토글 (체커/화이트/다크) */}
          <button
            type="button"
            onClick={() =>
              setBgMode(bgMode === "checker" ? "white" : bgMode === "white" ? "dark" : "checker")
            }
            title="배경 확인 모드 전환"
            className="p-1 px-2 text-[10px] bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg text-zinc-600 dark:text-zinc-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            {bgMode === "checker" ? (
              <span>투명 격자</span>
            ) : bgMode === "white" ? (
              <span className="flex items-center gap-1"><Sun className="w-3 h-3 text-amber-500" /> 흰색 배경</span>
            ) : (
              <span className="flex items-center gap-1"><Moon className="w-3 h-3 text-sky-400" /> 어두운 배경</span>
            )}
          </button>
        </div>
      </div>

      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
        사람의 얼굴, 목 피부, 손이나 다른 옷이 남아있다면 <strong>지우개</strong>로 쓱 문질러 투명하게 지워주세요.
      </p>

      {/* 캔버스 뷰어 */}
      <div
        className={`relative h-64 w-full rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-700 flex items-center justify-center ${
          bgMode === "checker"
            ? "bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0]"
            : bgMode === "white"
            ? "bg-white"
            : "bg-zinc-950"
        }`}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="max-h-full max-w-full object-contain cursor-crosshair touch-none"
        />
      </div>

      {/* 툴바 컨트롤 (지우개/복원, 브러시 크기, 되돌리기) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setBrushMode("eraser")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              brushMode === "eraser"
                ? "bg-red-500 text-white shadow-xs"
                : "bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-600"
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>지우기</span>
          </button>

          <button
            type="button"
            onClick={() => setBrushMode("restore")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              brushMode === "restore"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-600"
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span>복원하기</span>
          </button>
        </div>

        {/* 브러시 크기 슬라이더 */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500">크기: {brushSize}px</span>
          <input
            type="range"
            min="8"
            max="60"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-20 accent-sky-600"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={history.length <= 1}
            onClick={handleUndo}
            className="p-1.5 bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-lg border border-zinc-200 dark:border-zinc-600 disabled:opacity-40 cursor-pointer"
            title="실행 취소"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 완료 및 취소 버튼 */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          편집 취소
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="py-1.5 px-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>수정 내용 적용</span>
        </button>
      </div>
    </div>
  )
}
