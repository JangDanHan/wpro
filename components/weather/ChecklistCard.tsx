"use client"

import { useId, useMemo, useState, useEffect, useRef } from "react"
import { ValidatedWeatherData } from "@/lib/domain/types"
import { generateChecklist, ChecklistItem } from "@/lib/domain/checklist"
import { CheckSquare, Check, Sparkles, CheckCircle2 } from "lucide-react"

interface ChecklistCardProps {
  weather: ValidatedWeatherData
  situation?: string
}

export function ChecklistCard({ weather, situation }: ChecklistCardProps) {
  // 고유 ID 접두사 (접근성)
  const baseId = useId()

  // 날씨 데이터 기반으로 준비물 목록 생성
  const checklist = useMemo(() => {
    return generateChecklist(weather, situation)
  }, [weather, situation])

  // 사용자 체크 상태 (아이템 ID Set)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())

  // 결과 화면이 갱신(새로운 날씨나 지역으로 추천)될 때만 체크리스트 초기화
  const currentResultKey = `${weather.cityId}_${weather.referenceAt}`
  const lastResultKeyRef = useRef<string>(currentResultKey)

  useEffect(() => {
    if (lastResultKeyRef.current !== currentResultKey) {
      lastResultKeyRef.current = currentResultKey
      setCheckedIds(new Set())
    }
  }, [currentResultKey])

  // 체크 토글 핸들러 (날씨 API 호출 전혀 없음)
  const toggleItem = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const totalCount = checklist.length
  const checkedCount = checklist.filter((item) => checkedIds.has(item.id)).length
  const isAllChecked = totalCount > 0 && checkedCount === totalCount
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0

  return (
    <article
      aria-label="외출 준비물 체크리스트"
      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4"
    >
      {/* 1. 상단 헤더 & 진행 상황 표시 */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-xs">
            <CheckSquare className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
              <span>외출 준비물 체크리스트</span>
              <span className="text-[11px] font-normal text-zinc-400 dark:text-zinc-500">
                (날씨 맞춤)
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              오늘 날씨에 맞춰 챙기면 좋은 준비물이에요.
            </p>
          </div>
        </div>

        {/* 진행 상태 배지 */}
        <div>
          {isAllChecked ? (
            <span
              role="status"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 animate-in fade-in"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>준비물 다 챙겼어요!</span>
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              총 {totalCount}개 중 {checkedCount}개 챙겼어요
            </span>
          )}
        </div>
      </div>

      {/* 2. 시각적 진행 게이지 바 */}
      <div className="space-y-1">
        <div
          role="progressbar"
          aria-valuenow={checkedCount}
          aria-valuemin={0}
          aria-valuemax={totalCount}
          aria-label={`외출 준비물 준비 진행률 ${progressPercent}%`}
          className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden"
        >
          <div
            className={`h-full transition-all duration-300 ease-out ${
              isAllChecked ? "bg-emerald-500" : "bg-sky-500"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3. 체크리스트 항목 목록 */}
      <ul className="space-y-2" role="list">
        {checklist.map((item: ChecklistItem, index: number) => {
          const isChecked = checkedIds.has(item.id)
          const inputId = `${baseId}-item-${item.id}`

          return (
            <li key={item.id}>
              <label
                htmlFor={inputId}
                className={`
                  w-full flex items-start gap-3 p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer select-none
                  focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-1 dark:focus-within:ring-offset-zinc-900
                  ${
                    isChecked
                      ? "bg-zinc-50/80 dark:bg-zinc-850/50 border-zinc-200/70 dark:border-zinc-800"
                      : "bg-white dark:bg-zinc-850/30 border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-zinc-700 hover:bg-emerald-50/20 dark:hover:bg-zinc-800/40"
                  }
                `}
              >
                {/* 접근성 네이티브 체크박스 (화면 읽기 도구 및 키보드 지원) */}
                <input
                  type="checkbox"
                  id={inputId}
                  checked={isChecked}
                  onChange={() => toggleItem(item.id)}
                  className="sr-only"
                  aria-describedby={`${inputId}-reason`}
                />

                {/* 커스텀 체크박스 UI (터치하기 쉬운 크기) */}
                <div
                  aria-hidden="true"
                  className={`
                    w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors
                    ${
                      isChecked
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"
                    }
                  `}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                {/* 준비물 이름 및 추천 이유 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-sm font-semibold transition-all ${
                        isChecked
                          ? "line-through text-zinc-400 dark:text-zinc-500"
                          : "text-zinc-900 dark:text-zinc-100"
                      }`}
                    >
                      {item.name}
                    </span>
                    {isChecked && (
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                        챙김
                      </span>
                    )}
                  </div>
                  <p
                    id={`${inputId}-reason`}
                    className={`text-xs mt-0.5 transition-all ${
                      isChecked
                        ? "text-zinc-400/80 dark:text-zinc-500/80 line-through"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {item.reason}
                  </p>
                </div>
              </label>
            </li>
          )
        })}
      </ul>
    </article>
  )
}
