"use client"

import { useState, useEffect } from "react"
import { Sparkles, Send, X, Loader2, AlertCircle } from "lucide-react"

interface SituationInputProps {
  situation: string
  onApplySituation?: (situation: string) => void
  onApplyAndExecute: (situation: string) => Promise<void> | void
  isSituationLoading?: boolean
  isFetching?: boolean
  hasSelectedRegion: boolean
  onValidationError?: (error: string | null) => void
}

const QUICK_SITUATIONS = [
  "추위를 많이 타고 오늘 중요한 면접이 있어",
  "더위를 많이 타서 땀이 잘 나",
  "비 오는 날 야외 활동이 있어",
  "실내에서 주로 보내는 가벼운 외출이야",
  "저녁까지 이어지는 야외 데이트야",
]

export function SituationInput({
  situation,
  onApplyAndExecute,
  isSituationLoading,
  isFetching,
  hasSelectedRegion,
  onValidationError,
}: SituationInputProps) {
  // 사용자가 입력란에 작성 중인 문장 (실제 '적용' 버튼을 누르기 전까지는 추천 실행/부모 전달 없음)
  const [inputValue, setInputValue] = useState(situation)
  const [localError, setLocalError] = useState<string | null>(null)

  // 상황 맞춤 추천 단독 로딩 상태 (하단 전체 날씨 로딩과 분리)
  const isLoading = isSituationLoading ?? isFetching ?? false

  // 외부(지역 변경, 리셋 등)에서 situation이 리셋되거나 바뀔 때 동기화
  useEffect(() => {
    setInputValue(situation)
  }, [situation])

  // 직접 입력 시: 오직 local input 값만 갱신 (추천 API 호출, 디바운스, 자동 실행 없음)
  const handleChange = (val: string) => {
    setInputValue(val)
    if (localError) setLocalError(null)
    if (onValidationError) onValidationError(null)
  }

  // 예시 상황 클릭 시: 입력란에 텍스트만 채워넣음 (추천 API 호출, 로딩, 결과 갱신 없음)
  const handleQuickTagClick = (tag: string) => {
    if (isLoading) return
    setInputValue(tag)
    if (localError) setLocalError(null)
    if (onValidationError) onValidationError(null)
  }

  // '적용' 버튼 직접 클릭 시에만 최신 입력값으로 맞춤 추천 실행
  const handleApply = () => {
    if (isLoading) return

    const trimmed = inputValue.trim()

    if (!hasSelectedRegion) {
      const msg = "지역을 먼저 선택해 주세요. (시·도, 시·군·구, 읍·면·동 모두 선택)"
      setLocalError(msg)
      if (onValidationError) onValidationError(msg)
      return
    }

    if (!trimmed) {
      const msg = "상황을 입력해 주세요. (예: 추위를 많이 타고 오늘 중요한 면접이 있어)"
      setLocalError(msg)
      if (onValidationError) onValidationError(msg)
      return
    }

    setLocalError(null)
    if (onValidationError) onValidationError(null)
    onApplyAndExecute(trimmed)
  }

  // 입력란에서 Enter 키 입력 시 추천/폼 제출 절대 차단 (한글 조합 완료 포함)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const handleClear = () => {
    setInputValue("")
    if (localError) setLocalError(null)
    if (onValidationError) onValidationError(null)
  }

  return (
    <section
      aria-label="사용자 상황 및 일정 입력"
      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            상황 맞춤 AI 코디 (선택 사항)
          </h2>
        </div>
        <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
          '적용' 버튼 클릭 시 맞춤 추천
        </span>
      </div>

      <div className="relative flex items-center">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="예: 추위를 많이 타고 오늘 면접이 있어"
          disabled={isLoading}
          className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 pr-24 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
        />
        <div className="absolute right-1.5 flex items-center gap-1">
          {inputValue && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg cursor-pointer"
              title="상황 지우기"
              aria-label="상황 지우기"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={handleApply}
            disabled={isLoading}
            className={`
              inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-2xs transition-all cursor-pointer
              ${
                isLoading
                  ? "bg-amber-400 cursor-not-allowed opacity-80"
                  : "bg-amber-500 hover:bg-amber-600 active:scale-95 shadow-amber-500/20"
              }
            `}
            title="상황 맞춤 추천 실행"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>추천 중…</span>
              </>
            ) : (
              <>
                <Send className="w-3 h-3" />
                <span>적용</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 상황 미입력 또는 지역 미선택 시 안내 메시지 */}
      {localError && (
        <div className="flex items-center gap-1.5 p-2 px-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-[11px] text-amber-700 dark:text-amber-300 animate-in fade-in-50">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{localError}</span>
        </div>
      )}

      {/* 예시 상황 태그: 클릭 시 입력란에 텍스트만 채워짐 */}
      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium mr-0.5">
          예시 상황:
        </span>
        {QUICK_SITUATIONS.map((tag) => (
          <button
            key={tag}
            type="button"
            disabled={isLoading}
            onClick={() => handleQuickTagClick(tag)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-300 border border-zinc-200/60 dark:border-zinc-700/60 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="입력란에 넣기"
          >
            {tag}
          </button>
        ))}
      </div>
    </section>
  )
}
