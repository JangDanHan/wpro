"use client"

import { useWeatherRecommendation } from "@/hooks/useWeatherRecommendation"
import { HeaderSection } from "@/components/weather/HeaderSection"
import { CitySelector } from "@/components/weather/CitySelector"
import { WeatherCard } from "@/components/weather/WeatherCard"
import { OutfitCard } from "@/components/weather/OutfitCard"
import { StateFeedback } from "@/components/weather/StateFeedback"
import { SourceFooter } from "@/components/weather/SourceFooter"
import { CITIES } from "@/lib/domain/types"

export function WeatherOutfitApp() {
  const {
    selectedCity,
    state,
    weather,
    recommendation,
    errorMessage,
    selectCity,
    refresh,
    isFetching,
  } = useWeatherRecommendation()

  const currentCityName = selectedCity ? CITIES[selectedCity]?.name : undefined
  const hasResult = (state === "success" || state === "partial") && weather && recommendation

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col justify-between">
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* 1. 서비스 소개 헤더 */}
        <HeaderSection />

        {/* 2. 도시 선택기 (서울, 광주, 부산) */}
        <CitySelector
          selectedCity={selectedCity}
          onSelectCity={selectCity}
          isFetching={isFetching}
        />

        {/* 3. 상태 피드백 (초기 안내, 로딩 스피너, 오류/만료 피드백) */}
        {!hasResult && (
          <StateFeedback
            state={state}
            errorMessage={errorMessage}
            cityName={currentCityName}
            onRetry={refresh}
            isFetching={isFetching}
          />
        )}

        {/* 4. 정상/부분 정보 결과 표시 (날씨 카드 + 옷차림 추천 카드 1개) */}
        {hasResult && (
          <div className="space-y-4 animate-in fade-in-50 duration-300">
            <WeatherCard weather={weather} />
            <OutfitCard
              recommendation={recommendation}
              onRefresh={refresh}
              isFetching={isFetching}
            />
          </div>
        )}
      </div>

      {/* 5. 출처 및 고지 푸터 */}
      <div className="w-full max-w-md mx-auto px-4">
        <SourceFooter
          provider={weather?.provider}
          providerUrl={weather?.providerUrl}
        />
      </div>
    </div>
  )
}
