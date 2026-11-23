"use client"

import { useState } from "react"
import { useWeatherRecommendation } from "@/hooks/useWeatherRecommendation"
import { useCloset } from "@/hooks/useCloset"
import { HeaderSection } from "@/components/weather/HeaderSection"
import { RegionSelector } from "@/components/weather/RegionSelector"
import { SituationInput } from "@/components/weather/SituationInput"
import { WeatherCard } from "@/components/weather/WeatherCard"
import { OutfitCard } from "@/components/weather/OutfitCard"
import { ChecklistCard } from "@/components/weather/ChecklistCard"
import { MusicCard } from "@/components/weather/MusicCard"
import { StateFeedback } from "@/components/weather/StateFeedback"
import { SourceFooter } from "@/components/weather/SourceFooter"
import { ClosetNavigation, ClosetTabMode } from "@/components/closet/ClosetNavigation"
import { ClosetGallery } from "@/components/closet/ClosetGallery"
import { ClosetOutfitBoard } from "@/components/closet/ClosetOutfitBoard"
import { VirtualFittingRoom } from "@/components/closet/VirtualFittingRoom"
import { ClothUploadModal } from "@/components/closet/ClothUploadModal"
import { Sparkles, Loader2, AlertCircle, Shirt, ArrowRight } from "lucide-react"

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

  // 디지털 옷장 훅 연동
  const {
    clothes,
    isLoading: isClosetLoading,
    wearRecords,
    todayRecord,
    bodyProfile,
    pinnedItemIds,
    closetOutfitRecommendation,
    isTodayWorn,
    saveItem,
    deleteItem,
    toggleFavorite,
    seedSamples,
    togglePin,
    nextRecommendation,
    recordWearToday,
    cancelWearToday,
    saveBodyProfile,
    deleteBodyProfile,
    saveVirtualEdit,
  } = useCloset(weather, situation)

  // 탭 상태 및 업로드 모달 상태
  const [currentTab, setCurrentTab] = useState<ClosetTabMode>("weather")
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  const currentDisplayName = weather?.cityName || selectedRegionLabel || undefined
  const hasResult = (state === "success" || state === "partial") && weather && recommendation

  const handleApplySituation = (newSituation: string) => {
    applySituation(newSituation)
  }

  // 선택된 코디의 실제 아이템 목록 (가상 피팅룸용)
  const selectedFittingItems = closetOutfitRecommendation
    ? closetOutfitRecommendation.matchedItems.map((m) => m.item)
    : clothes.slice(0, 4)

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col justify-between">
      <div className="w-full max-w-lg mx-auto px-4 sm:px-6 py-5 space-y-4 flex-1">
        {/* 1. 서비스 소개 헤더 */}
        <HeaderSection />

        {/* 2. 네비게이션 탭 (날씨&추천 / 내 옷으로 코디 / 디지털 옷장 / 가상 피팅룸) */}
        <ClosetNavigation
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          closetCount={clothes.length}
        />

        {/* ================= 탭 1: 날씨 & 기본 코디 & 음악 추천 ================= */}
        {currentTab === "weather" && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            {/* 전국 지역 선택기 */}
            <RegionSelector
              selectedRegionId={selectedRegionId}
              selectedRegionLabel={selectedRegionLabel}
              onSelectRegion={(regionId, label) => selectRegion(regionId, label)}
              onResetSelection={resetSelection}
              isFetching={isFetching}
            />

            {/* 상황 맞춤 입력란 */}
            <SituationInput
              situation={situation}
              onApplySituation={handleApplySituation}
              isFetching={isFetching}
              hasSelectedRegion={Boolean(selectedRegionId)}
            />

            {/* 추천받기 버튼 및 검증 피드백 */}
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

            {/* 상태 피드백 */}
            {!hasResult && (
              <StateFeedback
                state={state}
                errorMessage={errorMessage}
                cityName={currentDisplayName}
                onRetry={() => executeRecommendation()}
                isFetching={isFetching}
              />
            )}

            {/* 추천 결과 표시 */}
            {hasResult && (
              <div className="space-y-4 animate-in fade-in-50 duration-300">
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

                {/* 내 옷장 맞춤 코디 바로가기 배너 */}
                <div className="p-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl text-white shadow-md flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-black text-xs">
                      <Shirt className="w-3.5 h-3.5" />
                      <span>내 실제 옷장으로 코디해볼까요?</span>
                    </div>
                    <p className="text-[11px] text-sky-100">
                      보유하신 옷 {clothes.length}벌 중 오늘 날씨에 딱 맞는 조합을 추천해 드려요.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentTab("closet_outfit")}
                    className="py-1.5 px-3 bg-white text-sky-700 hover:bg-sky-50 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <span>내 옷 코디</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

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
        )}

        {/* ================= 탭 2: 내 옷으로 코디받기 (핵심 기능) ================= */}
        {currentTab === "closet_outfit" && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            {/* 날씨 정보가 없을 경우 안내 및 간이 지역 선택 */}
            {!weather ? (
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-center space-y-3">
                <Sparkles className="w-10 h-10 text-sky-500 mx-auto" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  먼저 외출할 지역의 날씨를 확인해주세요
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  내 옷장 코디 추천은 현재 지역의 실시간 기온, 체감온도, 비/눈 예보를 정밀 분석하여 이루어집니다.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentTab("weather")}
                    className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    날씨 조회하러 가기
                  </button>
                </div>
              </div>
            ) : (
              <ClosetOutfitBoard
                recommendation={closetOutfitRecommendation}
                weather={weather}
                situation={situation}
                pinnedItemIds={pinnedItemIds}
                isTodayWorn={isTodayWorn}
                onTogglePin={togglePin}
                onRefreshRecommendation={nextRecommendation}
                onRecordWearToday={recordWearToday}
                onCancelWearToday={cancelWearToday}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
              />
            )}
          </div>
        )}

        {/* ================= 탭 3: 디지털 옷장 (등록 & 관리) ================= */}
        {currentTab === "my_closet" && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <ClosetGallery
              clothes={clothes}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              onToggleFavorite={toggleFavorite}
              onDeleteItem={deleteItem}
              onUpdateItem={saveItem}
              onSeedSamples={seedSamples}
            />
          </div>
        )}

        {/* ================= 탭 4: 가상 피팅룸 (체형 아바타 & 자연어 편집) ================= */}
        {currentTab === "fitting_room" && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <VirtualFittingRoom
              clothes={clothes}
              selectedOutfitItems={selectedFittingItems}
              bodyProfile={bodyProfile}
              onSaveBodyProfile={saveBodyProfile}
              onDeleteBodyProfile={deleteBodyProfile}
              onSaveVirtualEdit={saveVirtualEdit}
            />
          </div>
        )}
      </div>

      {/* 스마트 옷 등록 모달 */}
      <ClothUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSaveItem={saveItem}
      />

      {/* 출처 및 고지 푸터 */}
      <div className="w-full max-w-lg mx-auto px-4 pb-4">
        <SourceFooter
          provider={weather?.provider}
          providerUrl={weather?.providerUrl}
        />
      </div>
    </div>
  )
}
