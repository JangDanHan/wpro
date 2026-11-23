"use client"

import { useWeatherRecommendation } from "@/hooks/useWeatherRecommendation"
import { HeaderSection } from "@/components/weather/HeaderSection"
import { RegionSelector } from "@/components/weather/RegionSelector"
import { SituationInput } from "@/components/weather/SituationInput"
import { WeatherCard } from "@/components/weather/WeatherCard"
import { OutfitCard } from "@/components/weather/OutfitCard"
import { ChecklistCard } from "@/components/weather/ChecklistCard"
import { MusicCard } from "@/components/weather/MusicCard"
import { StateFeedback } from "@/components/weather/StateFeedback"
import { SourceFooter } from "@/components/weather/SourceFooter"
import { Sparkles, Loader2, AlertCircle } from "lucide-react"

export function WeatherOutfitApp() {
  const {
    selectedRegionId,
    selectedRegionLabel,
    situation,
    validationError,
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
    fetchNextMusicTrack,
    timings,
    selectRegion,
    applySituation,
    resetSelection,
    refresh,
    executeRecommendation,
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
          selectedRegionLabel={selectedRegionLabel}
          onSelectRegion={(regionId, label) => selectRegion(regionId, label)}
          onResetSelection={resetSelection}
          isFetching={isFetching}
        />

        {/* 3. 상황 맞춤 AI 코디 입력란 (선택 사항) */}
        <SituationInput
          situation={situation}
          onApplySituation={handleApplySituation}
          isFetching={isFetching}
          hasSelectedRegion={Boolean(selectedRegionId)}
        />

        {/* 4. 추천받기 버튼 및 검증 피드백 */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => executeRecommendation()}
            disabled={isFetching}
            className={`
              w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2
              ${
                isFetching
                  ? "bg-sky-400 cursor-not-allowed opacity-80"
                  : "bg-sky-600 hover:bg-sky-700 active:scale-[0.99] cursor-pointer shadow-sky-500/20"
              }
            `}
          >
            {isFetching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>날씨 & 옷차림 불러오는 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>날씨 & 옷차림 추천받기</span>
              </>
            )}
          </button>

          {validationError && (
            <div className="flex items-center gap-2 p-2.5 px-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400 animate-in fade-in-50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* 5. 상태 피드백 (초기 안내, 로딩 스피너, 오류/만료 피드백) */}
        {!hasResult && (
          <StateFeedback
            state={state}
            errorMessage={errorMessage}
            cityName={currentDisplayName}
            onRetry={() => executeRecommendation()}
            isFetching={isFetching}
          />
        )}

        {/* 6. 추천 결과 표시 (날씨 카드 + 상품 중심 옷차림 추천 카드 + 체크리스트 + 음악 카드) */}
        {hasResult && (
          <div className="space-y-4 animate-in fade-in-50 duration-300">
            {/* 소요 시간 지표 */}
            {timings.weatherMs !== null && (
              <div className="flex items-center justify-between px-3 py-1 bg-zinc-100/70 dark:bg-zinc-800/60 rounded-lg text-[10px] text-zinc-500 font-mono">
                <span className="font-semibold text-zinc-600 dark:text-zinc-400">⚡ 소요 시간</span>
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
            <ChecklistCard weather={weather} situation={situation} />
            <MusicCard
              music={music}
              musicState={musicState}
              errorMessage={musicErrorMessage}
              onRetry={retryMusic}
              onNextTrack={fetchNextMusicTrack}
              isFetchingNextTrack={musicState === "loading"}
            />
          </div>
        )}
      </div>

      {/* 7. 출처 및 고지 푸터 */}
      <div className="w-full max-w-lg mx-auto px-4 pb-4">
        <SourceFooter
          provider={weather?.provider}
          providerUrl={weather?.providerUrl}
        />
      </div>
    </div>
  )
}
