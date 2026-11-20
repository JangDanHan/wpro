"use client"

import { CITIES, CityId } from "@/lib/domain/types"

interface CitySelectorProps {
  selectedCity: CityId | null
  onSelectCity: (city: CityId) => void
  isFetching: boolean
}

const CITY_OPTIONS: CityId[] = ["seoul", "gwangju", "busan"]

export function CitySelector({
  selectedCity,
  onSelectCity,
  isFetching,
}: CitySelectorProps) {
  return (
    <section className="w-full" aria-labelledby="city-selector-label">
      <h2 id="city-selector-label" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
        도시 선택
      </h2>
      <div
        role="group"
        aria-label="날씨를 조회할 도시 선택"
        className="grid grid-cols-3 gap-2 w-full"
      >
        {CITY_OPTIONS.map((cityId) => {
          const city = CITIES[cityId]
          const isSelected = selectedCity === cityId
          const isDisabled = isFetching && isSelected // 동일 도시 조회 중 중복 클릭 방지 (EX-13)

          return (
            <button
              key={cityId}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectCity(cityId)}
              aria-pressed={isSelected}
              className={`
                px-4 py-3 rounded-xl font-medium text-sm transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2
                ${
                  isSelected
                    ? "bg-sky-600 text-white shadow-sm font-semibold dark:bg-sky-500"
                    : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                }
                ${isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer active:scale-95"}
              `}
            >
              {city.name}
            </button>
          )
        })}
      </div>
    </section>
  )
}
