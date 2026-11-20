"use client"

import { useWeatherRecommendation } from "@/hooks/useWeatherRecommendation"
import { HeaderSection } from "@/components/weather/HeaderSection"
import { RegionSelector } from "@/components/weather/RegionSelector"
import { SituationInput } from "@/components/weather/SituationInput"
import { WeatherCard } from "@/components/weather/WeatherCard"
import { OutfitCard } from "@/components/weather/OutfitCard"
import { MusicCard } from "@/components/weather/MusicCard"
import { StateFeedback } from "@/components/weather/StateFeedback"
import { SourceFooter } from "@/components/weather/SourceFooter"

export function WeatherOutfitApp() {
  const {
    selectedRegionId,
    selectedRegionLabel,
    situation,
    setSituation,
    state,
    weather,
    recommendation,
    errorMessage,
    isFetching,
    aiState,
    aiErrorMessage,
    retryAiOutfit,
    musicState,
    music,
    musicErrorMessage,
    retryMusic,
    timings,
    selectRegion,
    applySituation,
    resetSelection,
    refresh,
  } = useWeatherRecommendation()

  const currentDisplayName = weather?.cityName || selectedRegionLabel || undefined
  const hasResult = (state === "success" || state === "partial") && weather && recommendation

  const handleApplySituation = (newSituation: string) => {
    applySituation(newSituation)
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col justify-between">
      <div className="w-full max-w-lg mx-auto px-4 sm:px-6 py-6 space-y-5 flex-1">
        {/* 1. 서비스 소개 헤더 */}
        <HeaderSection />

        {/* 2. 전국 지역 선택기 (시·도 → 시·군·구 → 읍·면·동 계층 선택 및 검색) */}
        <RegionSelector
          selectedRegionId={selectedRegionId}
          onSelectRegion={(regionId, label) => selectRegion(regionId, label)}
          onResetSelection={resetSelection}
          isFetching={isFetching}
        />

        {/* 3. 상황 맞춤 AI 코디 입력란 (선택 사항: 예: 추위를 많이 타고 면접이 있어) */}
        <SituationInput
          situation={situation}
          onApplySituation={handleApplySituation}
          isFetching={isFetching}
          hasSelectedRegion={Boolean(selectedRegionId)}
        />

        {/* 4. 상태 피드백 (초기 안내, 로딩 스피너, 오류/만료 피드백) */}
        {!hasResult && (
          <StateFeedback
            state={state}
            errorMessage={errorMessage}
            cityName={currentDisplayName}
            onRetry={() => refresh()}
            isFetching={isFetching}
          />
        )}

        {/* 5. 정상/부분 정보 결과 표시 (전체 지역명 포함 날씨 카드 + 옷차림 추천 카드 1개) */}
        {hasResult && (
          <div className="space-y-4 animate-in fade-in-50 duration-300">
            {/* 단계별 소요 시간 측정 표시 */}
            {timings.weatherMs !== null && (
              <div className="flex items-center justify-between px-3 py-1 bg-zinc-100/70 dark:bg-zinc-800/60 rounded-lg text-[10px] text-zinc-500 font-mono">
                <span className="font-semibold text-zinc-600 dark:text-zinc-400">⚡ 단계별 소요 시간</span>
                <span className="flex items-center gap-1.5">
                  <span>날씨: {timings.weatherMs}ms</span>
                  {timings.aiOutfitMs !== null && <span>| AI: {timings.aiOutfitMs}ms</span>}
                  {timings.musicTotalMs !== null && <span>| 음악: {timings.musicTotalMs}ms</span>}
                </span>
              </div>
            )}

            <WeatherCard weather={weather} />
            <OutfitCard
              recommendation={recommendation}
              onRefresh={() => refresh()}
              isFetching={isFetching}
              aiState={aiState}
              aiErrorMessage={aiErrorMessage}
              onRetryAi={retryAiOutfit}
            />
            <MusicCard
              music={music}
              musicState={musicState}
              errorMessage={musicErrorMessage}
              onRetry={retryMusic}
            />
          </div>
        )}
      </div>

      {/* 6. 출처 및 고지 푸터 (기상청) */}
      <div className="w-full max-w-lg mx-auto px-4">
        <SourceFooter
          provider={weather?.provider}
          providerUrl={weather?.providerUrl}
        />
      </div>
    </div>
  )
}
