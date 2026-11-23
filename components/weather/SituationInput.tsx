"use client"

import { useState, useEffect } from "react"
import { Sparkles, Send, X, Loader2 } from "lucide-react"

interface SituationInputProps {
  situation: string
  onApplySituation: (situation: string) => void
  onApplyAndExecute: (situation: string) => Promise<void> | void
  isFetching: boolean
  hasSelectedRegion: boolean
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
  onApplySituation,
  onApplyAndExecute,
  isFetching,
  hasSelectedRegion,
}: SituationInputProps) {
  const [inputValue, setInputValue] = useState(situation)

  // 부모의 situation이 외부에서 리셋되거나 바뀔 때 동기화
  useEffect(() => {
    setInputValue(situation)
  }, [situation])

  const handleChange = (val: string) => {
    setInputValue(val)
    onApplySituation(val)
  }

  // '적용' 버튼 클릭 또는 엔터 키 제출 시 즉시 추천 실행
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isFetching) return
    const trimmed = inputValue.trim()
    onApplyAndExecute(trimmed)
  }

  // 빠른 태그 클릭 시에도 즉시 추천 실행
  const handleQuickTagClick = (tag: string) => {
    if (isFetching) return
    setInputValue(tag)
    onApplyAndExecute(tag)
  }

  const handleClear = () => {
    setInputValue("")
    onApplySituation("")
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
          입력 후 적용 시 즉시 추천
        </span>
      </div>

      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="예: 추위를 많이 타고 오늘 면접이 있어"
          disabled={isFetching}
          className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 pr-24 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
        />
        <div className="absolute right-1.5 flex items-center gap-1">
          {inputValue && !isFetching && (
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
            type="submit"
            disabled={isFetching}
            className={`
              inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-2xs transition-all cursor-pointer
              ${
                isFetching
                  ? "bg-amber-400 cursor-not-allowed opacity-80"
                  : "bg-amber-500 hover:bg-amber-600 active:scale-95 shadow-amber-500/20"
              }
            `}
            title="상황 맞춤 추천 즉시 실행"
          >
            {isFetching ? (
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
      </form>

      {/* 빠른 태그 */}
      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium mr-0.5">
          추천 상황:
        </span>
        {QUICK_SITUATIONS.map((tag) => (
          <button
            key={tag}
            type="button"
            disabled={isFetching}
            onClick={() => handleQuickTagClick(tag)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-300 border border-zinc-200/60 dark:border-zinc-700/60 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {tag}
          </button>
        ))}
      </div>
    </section>
  )
}
