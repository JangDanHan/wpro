"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  ClosetItem,
  ClosetOutfitRecommendation,
  BodyProfile,
  WearRecord,
  VirtualEditResult,
} from "@/lib/domain/closet-types"
import {
  getClosetItems,
  saveClosetItem,
  deleteClosetItem,
  toggleFavoriteItem,
  recordWearToday,
  cancelWearRecord,
  getWearRecords,
  getTodayWearRecord,
  getBodyProfile,
  saveBodyProfile,
  deleteBodyProfile,
  seedSampleClothes,
} from "@/lib/storage/closet-db"
import { recommendOutfitFromCloset } from "@/lib/domain/closet-recommender"
import { ValidatedWeatherData } from "@/lib/domain/types"

export function useCloset(weather: ValidatedWeatherData | null, situation = "") {
  const [clothes, setClothes] = useState<ClosetItem[]>([])
  const [wearRecords, setWearRecords] = useState<WearRecord[]>([])
  const [todayRecord, setTodayRecord] = useState<WearRecord | null>(null)
  const [bodyProfile, setBodyProfile] = useState<BodyProfile | null>(null)
  const [pinnedItemIds, setPinnedItemIds] = useState<string[]>([])
  const [variationIndex, setVariationIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // 1. 초기 데이터 로드 (IndexedDB)
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [loadedClothes, loadedRecords, todayRec, profile] = await Promise.all([
        getClosetItems(),
        getWearRecords(),
        getTodayWearRecord(),
        getBodyProfile(),
      ])
      setClothes(loadedClothes)
      setWearRecords(loadedRecords)
      setTodayRecord(todayRec)
      setBodyProfile(profile)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 2. 어제 입은 옷 ID 목록 추출
  const yesterdayWornItemIds = useMemo(() => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yStr = yesterday.toISOString().slice(0, 10)
    const rec = wearRecords.find((r) => r.date === yStr)
    return rec ? rec.itemIds : []
  }, [wearRecords])

  // 3. 내 옷장 기반 코디 추천 산출
  const closetOutfitRecommendation = useMemo<ClosetOutfitRecommendation | null>(() => {
    if (!weather) return null
    return recommendOutfitFromCloset({
      clothes,
      weather,
      situation,
      pinnedItemIds,
      yesterdayWornItemIds,
      variationIndex,
    })
  }, [clothes, weather, situation, pinnedItemIds, yesterdayWornItemIds, variationIndex])

  // 4. 옷 CRUD 액션
  const handleSaveItem = async (item: ClosetItem) => {
    await saveClosetItem(item)
    await loadData()
  }

  const handleDeleteItem = async (id: string) => {
    await deleteClosetItem(id)
    setPinnedItemIds((prev) => prev.filter((p) => p !== id))
    await loadData()
  }

  const handleToggleFavorite = async (id: string) => {
    await toggleFavoriteItem(id)
    await loadData()
  }

  const handleSeedSamples = async () => {
    await seedSampleClothes()
    await loadData()
  }

  // 5. 핀(Pin) 토글
  const handleTogglePin = (itemId: string) => {
    setPinnedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    )
  }

  // 6. 다른 코디 추천 (순환)
  const handleNextRecommendation = () => {
    setVariationIndex((prev) => prev + 1)
  }

  // 7. 오늘 입었어요 기록
  const handleRecordWearToday = async () => {
    if (!closetOutfitRecommendation) return
    const itemIds = closetOutfitRecommendation.matchedItems.map((m) => m.item.id)
    if (itemIds.length === 0) return

    const res = await recordWearToday(
      itemIds,
      closetOutfitRecommendation.id,
      situation || undefined,
    )
    setTodayRecord(res.record)
    await loadData()
  }

  // 8. 오늘 입었어요 취소
  const handleCancelWearToday = async () => {
    if (!todayRecord) return
    await cancelWearRecord(todayRecord.id)
    setTodayRecord(null)
    await loadData()
  }

  // 9. 체형 프로필 액션
  const handleSaveBodyProfile = async (profile: BodyProfile) => {
    await saveBodyProfile(profile)
    setBodyProfile(profile)
  }

  const handleDeleteBodyProfile = async () => {
    await deleteBodyProfile()
    setBodyProfile(null)
  }

  // 10. 가상 편집본 저장
  const handleSaveVirtualEdit = async (result: VirtualEditResult) => {
    const parent = clothes.find((c) => c.id === result.sourceItemId)
    if (!parent) return

    const virtualItem: ClosetItem = {
      ...parent,
      id: result.id,
      name: `[가상편집] ${parent.name}`,
      originalImageUrl: result.modifiedImageUrl,
      noBgImageUrl: result.modifiedImageUrl,
      isVirtualEdit: true,
      parentItemId: parent.id,
      virtualEditNote: result.diffSummary,
      wearCount: 0,
      lastWornDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await saveClosetItem(virtualItem)
    await loadData()
  }

  return {
    clothes,
    isLoading,
    wearRecords,
    todayRecord,
    bodyProfile,
    pinnedItemIds,
    closetOutfitRecommendation,
    isTodayWorn: Boolean(todayRecord),
    saveItem: handleSaveItem,
    deleteItem: handleDeleteItem,
    toggleFavorite: handleToggleFavorite,
    seedSamples: handleSeedSamples,
    togglePin: handleTogglePin,
    nextRecommendation: handleNextRecommendation,
    recordWearToday: handleRecordWearToday,
    cancelWearToday: handleCancelWearToday,
    saveBodyProfile: handleSaveBodyProfile,
    deleteBodyProfile: handleDeleteBodyProfile,
    saveVirtualEdit: handleSaveVirtualEdit,
    reload: loadData,
  }
}
