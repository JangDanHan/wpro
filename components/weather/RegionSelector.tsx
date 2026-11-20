"use client"

import { useEffect, useRef, useState } from "react"
import { Search, MapPin, ChevronDown, Check, Loader2, X } from "lucide-react"

interface RegionSelectorProps {
  selectedRegionId: string | null
  onSelectRegion: (regionId: string, label: string) => void
  onResetSelection?: () => void
  isFetching: boolean
}

interface Step3Item {
  name: string
  value: string
  label: string
}

interface SearchResultItem {
  value: string
  label: string
  nx: number
  ny: number
}

// 자주 찾는 대표 시·도 (빠른 1단계 선택)
const QUICK_REGIONS = [
  { label: "서울", step1: "서울특별시" },
  { label: "광주", step1: "광주광역시" },
  { label: "부산", step1: "부산광역시" },
  { label: "세종", step1: "세종특별자치시" },
  { label: "제주", step1: "제주특별자치도" },
]

export function RegionSelector({
  selectedRegionId,
  onSelectRegion,
  onResetSelection,
  isFetching,
}: RegionSelectorProps) {
  const [tab, setTab] = useState<"step" | "search">("step")

  // 단계별 선택 상태
  const [step1List, setStep1List] = useState<string[]>([])
  const [step2List, setStep2List] = useState<string[]>([])
  const [step3List, setStep3List] = useState<Step3Item[]>([])

  const [selectedStep1, setSelectedStep1] = useState<string>("")
  const [selectedStep2, setSelectedStep2] = useState<string>("")
  const [selectedStep3, setSelectedStep3] = useState<string>("")

  // 검색 상태
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 1단계 (시·도) 목록 로드
  useEffect(() => {
    fetch("/api/regions?step=1")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.list)) {
          setStep1List(data.list)
        }
      })
      .catch(() => {})
  }, [])

  // 1단계 변경 시 2단계 목록 로드 & 하위 초기화 (요구사항 4)
  useEffect(() => {
    if (!selectedStep1) {
      setStep2List([])
      setSelectedStep2("")
      setStep3List([])
      setSelectedStep3("")
      return
    }

    fetch(`/api/regions?step=2&step1=${encodeURIComponent(selectedStep1)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.list)) {
          setStep2List(data.list)
          // 세종시처럼 2단계가 단일('세종시')이거나 없을 때 처리 (요구사항 2)
          if (data.list.length === 1 && data.list[0] === "세종시") {
            setSelectedStep2(data.list[0])
          } else {
            setSelectedStep2("")
          }
        }
      })
      .catch(() => {})

    setSelectedStep2("")
    setStep3List([])
    setSelectedStep3("")
  }, [selectedStep1])

  // 2단계 변경 시 3단계 목록 로드 & 3단계 초기화 (요구사항 4)
  useEffect(() => {
    if (!selectedStep1) return

    const step2Param = selectedStep2 ? `&step2=${encodeURIComponent(selectedStep2)}` : ""
    fetch(`/api/regions?step=3&step1=${encodeURIComponent(selectedStep1)}${step2Param}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.list)) {
          setStep3List(data.list)
        }
      })
      .catch(() => {})

    setSelectedStep3("")
  }, [selectedStep1, selectedStep2])

  // 검색어 입력 시 디바운스 검색 (요구사항 3)
  useEffect(() => {
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current)
    }

    const trimmed = searchQuery.trim()
    if (!trimmed) {
      setSearchResults([])
      setIsSearching(false)
      setSearchOpen(false)
      return
    }

    setIsSearching(true)
    searchDebounceTimer.current = setTimeout(() => {
      fetch(`/api/regions?query=${encodeURIComponent(trimmed)}`)
        .then((res) => res.json())
        .then((data) => {
          setIsSearching(false)
          if (Array.isArray(data.results)) {
            setSearchResults(data.results)
            setSearchOpen(true)
          }
        })
        .catch(() => {
          setIsSearching(false)
        })
    }, 250)

    return () => {
      if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current)
    }
  }, [searchQuery])

  // 1단계 시도 선택 시 핸들러 (하위 목록만 불러오고 날씨 API 호출 안 함, 이전 결과 초기화)
  const handleSelectStep1 = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedStep1(val)
    setSelectedStep2("")
    setSelectedStep3("")
    setStep2List([])
    setStep3List([])
    if (onResetSelection) {
      onResetSelection()
    }
  }

  // 2단계 시군구 선택 시 핸들러 (하위 목록만 불러오고 날씨 API 호출 안 함, 이전 결과 초기화)
  const handleSelectStep2 = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedStep2(val)
    setSelectedStep3("")
    setStep3List([])
    if (onResetSelection) {
      onResetSelection()
    }
  }

  // 3단계 읍면동 선택 시 핸들러 (시·도, 시·군·구, 읍·면·동 모두 선택 완료 시에만 검색 실행)
  const handleSelectStep3 = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedStep3(val)
    if (val) {
      const found = step3List.find((item) => item.value === val)
      if (found) {
        onSelectRegion(found.value, found.label)
      }
    } else {
      if (onResetSelection) {
        onResetSelection()
      }
    }
  }

  // 빠른 선택 칩 클릭 핸들러 (1단계 시·도 설정 및 이전 결과 초기화, 하위 선택 유도)
  const handleQuickSelectStep1 = (step1Name: string) => {
    setTab("step")
    setSelectedStep1(step1Name)
    setSelectedStep2("")
    setSelectedStep3("")
    setStep3List([])
    if (onResetSelection) {
      onResetSelection()
    }
  }

  // 검색 결과 선택 시 핸들러 (읍·면·동까지 모두 갖춘 항목만 검색 결과로 나옴)
  const handleSelectSearchResult = (item: SearchResultItem) => {
    onSelectRegion(item.value, item.label)
    setSearchOpen(false)
    setSearchQuery("")
  }

  return (
    <section className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-4">
      {/* 탭 전환 (단계별 선택 / 지역명 검색) */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-sky-500" aria-hidden="true" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            지역 선택
          </h2>
        </div>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setTab("step")}
            className={`px-3 py-1 rounded-md transition-all ${
              tab === "step"
                ? "bg-white dark:bg-zinc-700 text-sky-600 dark:text-sky-400 font-semibold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            단계별 선택
          </button>
          <button
            type="button"
            onClick={() => setTab("search")}
            className={`px-3 py-1 rounded-md transition-all ${
              tab === "search"
                ? "bg-white dark:bg-zinc-700 text-sky-600 dark:text-sky-400 font-semibold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            지역명 검색
          </button>
        </div>
      </div>

      {/* 빠른 선택 칩 (서울, 광주, 부산, 세종, 제주) */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mr-1">
          빠른 선택:
        </span>
        {QUICK_REGIONS.map((q) => {
          const isSelected = selectedStep1 === q.step1 && tab === "step"
          return (
            <button
              key={q.step1}
              type="button"
              disabled={isFetching}
              onClick={() => handleQuickSelectStep1(q.step1)}
              className={`
                px-2.5 py-1 rounded-md text-xs font-medium transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500
                ${
                  isSelected
                    ? "bg-sky-600 text-white font-semibold shadow-2xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-750"
                }
                ${isFetching ? "opacity-60 cursor-not-allowed" : "cursor-pointer active:scale-95"}
              `}
              title={`${q.label} 선택 후 시·군·구 및 읍·면·동을 선택하세요`}
            >
              {q.label}
            </button>
          )
        })}
      </div>

      {/* 탭 1: 단계별 선택 (시·도 → 시·군·구 → 읍·면·동) */}
      {tab === "step" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {/* 1단계: 시·도 */}
          <div className="relative">
            <label htmlFor="step1-select" className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              시·도
            </label>
            <select
              id="step1-select"
              value={selectedStep1}
              onChange={handleSelectStep1}
              disabled={isFetching}
              className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500 pr-8 cursor-pointer disabled:opacity-50"
            >
              <option value="">시·도 선택</option>
              {step1List.map((s1) => (
                <option key={s1} value={s1}>
                  {s1}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-[29px] pointer-events-none" />
          </div>

          {/* 2단계: 시·군·구 */}
          <div className="relative">
            <label htmlFor="step2-select" className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              시·군·구
            </label>
            <select
              id="step2-select"
              value={selectedStep2}
              onChange={handleSelectStep2}
              disabled={!selectedStep1 || step2List.length === 0 || isFetching}
              className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500 pr-8 cursor-pointer disabled:opacity-50"
            >
              <option value="">
                {selectedStep1 ? (step2List.length > 0 ? "시·군·구 선택" : "하위 구분 없음") : "시·도 먼저 선택"}
              </option>
              {step2List.map((s2) => (
                <option key={s2} value={s2}>
                  {s2}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-[29px] pointer-events-none" />
          </div>

          {/* 3단계: 읍·면·동 */}
          <div className="relative">
            <label htmlFor="step3-select" className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              읍·면·동
            </label>
            <select
              id="step3-select"
              value={selectedStep3}
              onChange={handleSelectStep3}
              disabled={(!selectedStep2 && step2List.length > 0) || step3List.length === 0 || isFetching}
              className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500 pr-8 cursor-pointer disabled:opacity-50"
            >
              <option value="">
                {step3List.length > 0 ? "읍·면·동 선택" : "시·군·구 먼저 선택"}
              </option>
              {step3List.map((s3) => (
                <option key={s3.value} value={s3.value}>
                  {s3.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-[29px] pointer-events-none" />
          </div>
        </div>
      )}

      {/* 단계별 선택 진행 가이드 */}
      {tab === "step" && !selectedStep3 && (
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-0.5">
          {!selectedStep1
            ? "💡 시·도 → 시·군·구 → 읍·면·동을 차례로 모두 선택해 주세요."
            : !selectedStep2 && step2List.length > 0
              ? "💡 시·군·구를 선택해 주세요."
              : "💡 마지막으로 읍·면·동을 선택하면 날씨 조회가 시작됩니다."}
        </p>
      )}

      {/* 탭 2: 지역명 통합 검색 (요구사항 3) */}
      {tab === "search" && (
        <div className="relative pt-1">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="읍·면·동 또는 시·군·구 입력 (예: 사직동, 해운대, 판교)"
              className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-9 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600"
                aria-label="검색어 지우기"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {isSearching && (
              <Loader2 className="w-4 h-4 text-sky-500 animate-spin absolute right-9 top-2.5" />
            )}
          </div>

          {/* 검색 결과 드롭다운 */}
          {searchOpen && (
            <div className="absolute z-20 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg divide-y divide-zinc-100 dark:divide-zinc-800">
              {searchResults.length === 0 ? (
                <div className="p-3 text-xs text-center text-zinc-500 dark:text-zinc-400">
                  검색 결과가 없습니다.
                </div>
              ) : (
                searchResults.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-sky-50 dark:hover:bg-zinc-750 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                        {item.label}
                      </span>
                      <span className="block text-[11px] text-zinc-400 dark:text-zinc-500">
                        기상청 격자: ({item.nx}, {item.ny})
                      </span>
                    </div>
                    {selectedRegionId === item.value && (
                      <Check className="w-4 h-4 text-sky-500 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
