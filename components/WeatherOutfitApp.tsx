"use client"

import { useWeatherRecommendation } from "@/hooks/useWeatherRecommendation"
import { HeaderSection } from "@/components/weather/HeaderSection"
import { RegionSelector } from "@/components/weather/RegionSelector"
import { WeatherCard } from "@/components/weather/WeatherCard"
import { OutfitCard } from "@/components/weather/OutfitCard"
import { StateFeedback } from "@/components/weather/StateFeedback"
import { SourceFooter } from "@/components/weather/SourceFooter"

export function WeatherOutfitApp() {
  const {
    selectedRegionId,
    selectedRegionLabel,
    state,
    weather,
    recommendation,
    errorMessage,
    selectRegion,
    refresh,
    isFetching,
  } = useWeatherRecommendation()

  const currentDisplayName = weather?.cityName || selectedRegionLabel || undefined
  const hasResult = (state === "success" || state === "partial") && weather && recommendation

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col justify-between">
      <div className="w-full max-w-lg mx-auto px-4 sm:px-6 py-6 space-y-5 flex-1">
        {/* 1. 서비스 소개 헤더 */}
        <HeaderSection />

        {/* 2. 전국 지역 선택기 (시·도 → 시·군·구 → 읍·면·동 계층 선택 및 검색) */}
        <RegionSelector
          selectedRegionId={selectedRegionId}
          onSelectRegion={(regionId, label) => selectRegion(regionId, label)}
          isFetching={isFetching}
        />

        {/* 3. 상태 피드백 (초기 안내, 로딩 스피너, 오류/만료 피드백) */}
        {!hasResult && (
          <StateFeedback
            state={state}
            errorMessage={errorMessage}
            cityName={currentDisplayName}
            onRetry={refresh}
            isFetching={isFetching}
          />
        )}

        {/* 4. 정상/부분 정보 결과 표시 (전체 지역명 포함 날씨 카드 + 옷차림 추천 카드 1개) */}
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

      {/* 5. 출처 및 고지 푸터 (기상청) */}
      <div className="w-full max-w-lg mx-auto px-4">
        <SourceFooter
          provider={weather?.provider}
          providerUrl={weather?.providerUrl}
        />
      </div>
    </div>
  )
}
