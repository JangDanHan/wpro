"use client"

import { useId, useMemo, useRef, useState } from "react"
import { Check, ChevronDown, MapPin, Search, X } from "lucide-react"
import { REGIONS, type Region } from "@/lib/weather-data"

type RegionSelectorProps = {
  selectedRegion: Region | null
  onSelect: (region: Region) => void
  listFailed: boolean
  onRetryList: () => void
}

export function RegionSelector({
  selectedRegion,
  onSelect,
  listFailed,
  onRetryList,
}: RegionSelectorProps) {
  const [method, setMethod] = useState<"search" | "steps">("search")
  const [query, setQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [province, setProvince] = useState("")
  const [district, setDistrict] = useState("")
  const listId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR")
    if (!normalizedQuery) return []

    return REGIONS.filter((region) =>
      `${region.fullName} ${region.province} ${region.district}`
        .toLocaleLowerCase("ko-KR")
        .includes(normalizedQuery),
    )
  }, [query])

  const districts = province
    ? REGIONS.filter((region) => region.province === province)
    : []

  function selectRegion(region: Region) {
    setQuery("")
    setSearchOpen(false)
    setActiveIndex(0)
    setDistrict(region.district)
    setProvince(region.province)
    onSelect(region)
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setSearchOpen(false)
      setActiveIndex(0)
      return
    }

    if (!results.length) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setSearchOpen(true)
      setActiveIndex((index) => (index + 1) % results.length)
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + results.length) % results.length)
    }

    if (event.key === "Enter" && !event.nativeEvent.isComposing && event.keyCode !== 229) {
      event.preventDefault()
      if (searchOpen && results[activeIndex]) selectRegion(results[activeIndex])
    }
  }

  function handleProvinceChange(nextProvince: string) {
    setProvince(nextProvince)
    setDistrict("")
  }

  function handleDistrictChange(nextDistrict: string) {
    setDistrict(nextDistrict)
    const nextRegion = districts.find((region) => region.district === nextDistrict)
    if (nextRegion) onSelect(nextRegion)
  }

  return (
    <section className="region-card" aria-labelledby="region-heading">
      <div className="region-card-heading">
        <div>
          <span className="eyebrow">STEP 01 · 지역 선택</span>
          <h2 id="region-heading">어느 지역으로 나가세요?</h2>
          <p className="region-card-description">시·군·구를 선택하면 그 지역의 예시 날씨를 보여드려요.</p>
        </div>
        <div className="region-pin-art" aria-hidden="true">
          <MapPin size={22} strokeWidth={1.8} />
        </div>
      </div>

      <div className="selector-tabs" role="tablist" aria-label="지역 선택 방법">
        <button
          className={method === "search" ? "selector-tab is-active" : "selector-tab"}
          id="search-tab"
          type="button"
          role="tab"
          aria-selected={method === "search"}
          aria-controls="search-panel"
          onClick={() => setMethod("search")}
        >
          지역명 검색
        </button>
        <button
          className={method === "steps" ? "selector-tab is-active" : "selector-tab"}
          id="steps-tab"
          type="button"
          role="tab"
          aria-selected={method === "steps"}
          aria-controls="steps-panel"
          onClick={() => setMethod("steps")}
        >
          단계별 선택
        </button>
      </div>

      {method === "search" ? (
        <div className="selector-panel" id="search-panel" role="tabpanel" aria-labelledby="search-tab">
          <label className="input-label" htmlFor="region-search-input">시·군·구 이름</label>
          <div
            className="region-search-wrap"
            ref={wrapperRef}
            onBlur={(event) => {
              if (!wrapperRef.current?.contains(event.relatedTarget as Node | null)) setSearchOpen(false)
            }}
          >
            <div className={searchOpen ? "search-control is-open" : "search-control"}>
              <Search className="search-control-icon" size={19} aria-hidden="true" />
              <input
                id="region-search-input"
                role="combobox"
                type="search"
                autoComplete="off"
                value={query}
                aria-autocomplete="list"
                aria-expanded={searchOpen && query.trim().length > 0 && !listFailed}
                aria-controls={listId}
                aria-activedescendant={searchOpen && !listFailed && results[activeIndex] ? `${listId}-${results[activeIndex].id}` : undefined}
                placeholder="시·군·구 이름으로 검색해 보세요."
                onFocus={() => setSearchOpen(true)}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setSearchOpen(true)
                  setActiveIndex(0)
                }}
                onKeyDown={handleSearchKeyDown}
              />
              {query ? (
                <button
                  type="button"
                  className="search-clear"
                  aria-label="검색어 지우기"
                  onClick={() => {
                    setQuery("")
                    setSearchOpen(true)
                    setActiveIndex(0)
                  }}
                >
                  <X size={17} />
                </button>
              ) : null}
            </div>

            {searchOpen && query.trim() && !listFailed ? (
              <div className="search-results" id={listId} role="listbox" aria-label="지역 검색 결과">
                {results.length ? (
                  results.map((region, index) => (
                    <button
                      className={`search-result${activeIndex === index ? " is-highlighted" : ""}`}
                      id={`${listId}-${region.id}`}
                      key={region.id}
                      type="button"
                      role="option"
                      aria-selected={selectedRegion?.id === region.id}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => selectRegion(region)}
                    >
                      <span className="search-result-icon"><MapPin size={18} strokeWidth={1.8} /></span>
                      <span className="search-result-copy">
                        <strong>{region.fullName}</strong>
                        <small>{region.province} · {region.district}</small>
                      </span>
                      {selectedRegion?.id === region.id ? <Check className="search-result-check" size={17} /> : <ChevronDown className="search-result-arrow" size={16} />}
                    </button>
                  ))
                ) : (
                  <p className="search-empty" role="status">일치하는 지역이 없어요. 시·군·구 이름을 다시 확인해 주세요.</p>
                )}
                {!listFailed ? <div className="results-scope-note" role="presentation">전국 선택 UI 미리보기 · 일부 예시 지역</div> : null}
              </div>
            ) : null}
          </div>
          {listFailed ? (
            <div className="region-list-error" role="alert">
              <p>지역 목록을 불러오지 못했어요. 다시 시도해 주세요.</p>
              <button type="button" className="text-button" onClick={onRetryList}>목록 다시 불러오기</button>
            </div>
          ) : !selectedRegion ? (
            <p className="field-hint">예: 중구, 북구, 해운대구</p>
          ) : (
            <div className="selected-region" aria-live="polite">
              <span className="selected-check"><Check size={14} /></span>
              <span><small>현재 선택한 지역</small><strong>{selectedRegion.fullName}</strong></span>
            </div>
          )}
        </div>
      ) : (
        <div className="selector-panel" id="steps-panel" role="tabpanel" aria-labelledby="steps-tab">
          <div className="step-fields">
            <label className="select-field">
              <span><i>1</i> 시·도 선택</span>
              <div className="select-wrap">
                <select value={province} onChange={(event) => handleProvinceChange(event.target.value)} disabled={listFailed}>
                  <option value="">시·도를 선택해 주세요</option>
                  {[...new Set(REGIONS.map((region) => region.province))].map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
                <ChevronDown size={17} aria-hidden="true" />
              </div>
            </label>
            <label className="select-field">
              <span><i>2</i> 시·군·구 선택</span>
              <div className="select-wrap">
                <select value={district} onChange={(event) => handleDistrictChange(event.target.value)} disabled={!province || listFailed}>
                  <option value="">{province ? "시·군·구를 선택해 주세요" : "먼저 시·도를 선택해 주세요"}</option>
                  {districts.map((region) => <option key={region.id} value={region.district}>{region.district}</option>)}
                </select>
                <ChevronDown size={17} aria-hidden="true" />
              </div>
            </label>
          </div>
          {listFailed ? (
            <div className="region-list-error" role="alert">
              <p>지역 목록을 불러오지 못했어요. 다시 시도해 주세요.</p>
              <button type="button" className="text-button" onClick={onRetryList}>목록 다시 불러오기</button>
            </div>
          ) : (
            <p className="field-hint">상위 지역을 바꾸면 하위 선택이 초기화돼요.</p>
          )}
          {selectedRegion ? (
            <div className="selected-region" aria-live="polite">
              <span className="selected-check"><Check size={14} /></span>
              <span><small>현재 선택한 지역</small><strong>{selectedRegion.fullName}</strong></span>
            </div>
          ) : null}
        </div>
      )}

      <div className="region-data-note">
        <span className="note-mark" aria-hidden="true">i</span>
        <p><strong>일부 예시 지역만 선택할 수 있어요.</strong> 실제 서비스 연결 전 디자인 미리보기이며, 행정구역 전체 목록은 포함하지 않아요.</p>
      </div>
    </section>
  )
}
