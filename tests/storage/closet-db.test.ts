import { describe, it, expect, beforeEach } from "vitest"
import {
  getClosetItems,
  saveClosetItem,
  deleteClosetItem,
  toggleFavoriteItem,
  recordWearToday,
  cancelWearRecord,
  getWearRecords,
  saveBodyProfile,
  getBodyProfile,
  deleteBodyProfile,
} from "@/lib/storage/closet-db"
import { ClosetItem } from "@/lib/domain/closet-types"

describe("디지털 옷장 영속 저장소 및 착용 기록 관리 (closet-db)", () => {
  const TEST_USER = "test_user_db"

  const testItem: ClosetItem = {
    id: "test-item-1",
    userId: TEST_USER,
    name: "테스트 자켓",
    category: "outer",
    colors: ["블랙"],
    pattern: "무지",
    style: "minimal",
    seasons: ["spring", "autumn"],
    thickness: "medium",
    warmth: "medium",
    isAttributeConfirmed: true,
    originalImageUrl: "data:image/jpeg;base64,mock",
    activeImageMode: "original",
    isFavorite: false,
    wearCount: 0,
    lastWornDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const testCancelItem: ClosetItem = {
    ...testItem,
    id: "test-item-cancel",
    wearCount: 1,
  }

  it("새 옷을 저장하고 조회할 수 있다", async () => {
    await saveClosetItem(testItem)
    const items = await getClosetItems(TEST_USER)
    expect(items.some((i) => i.id === testItem.id)).toBe(true)
  })

  it("즐겨찾기 토글이 정상 동작한다", async () => {
    await saveClosetItem(testItem)
    const isFav = await toggleFavoriteItem(testItem.id, TEST_USER)
    expect(isFav).toBe(true)

    const isFavAgain = await toggleFavoriteItem(testItem.id, TEST_USER)
    expect(isFavAgain).toBe(false)
  })

  it("‘오늘 입었어요’ 클릭 시에만 착용 횟수가 1 증가하고 마지막 착용일이 기록된다", async () => {
    await saveClosetItem({ ...testItem, wearCount: 0, lastWornDate: null })

    const { record, alreadyRecorded } = await recordWearToday(
      [testItem.id],
      "outfit-1",
      "출근길",
      TEST_USER,
    )

    expect(alreadyRecorded).toBe(false)
    expect(record.itemIds).toContain(testItem.id)

    // 저장된 옷 상태 확인
    const items = await getClosetItems(TEST_USER)
    const updated = items.find((i) => i.id === testItem.id)
    expect(updated?.wearCount).toBe(1)
    expect(updated?.lastWornDate).toBe(new Date().toISOString().slice(0, 10))

    // 당일 동일 조합 중복 클릭 시 중복 카운트 방지
    const secondTry = await recordWearToday(
      [testItem.id],
      "outfit-1",
      "출근길",
      TEST_USER,
    )
    expect(secondTry.alreadyRecorded).toBe(true)
    const itemsAfterSecond = await getClosetItems(TEST_USER)
    expect(itemsAfterSecond.find((i) => i.id === testItem.id)?.wearCount).toBe(1)
  })

  it("착용 취소 시 착용 횟수가 다시 1 차감된다", async () => {
    // 고유한 testCancelItem 저장 (초기 착용 횟수 1)
    await saveClosetItem(testCancelItem)

    // 착용 기록 등록 -> wearCount 1 증가하여 2가 됨
    const { record, alreadyRecorded } = await recordWearToday(
      [testCancelItem.id],
      "outfit-cancel-test",
      "",
      TEST_USER,
    )
    expect(alreadyRecorded).toBe(false)

    const itemsAfterWear = await getClosetItems(TEST_USER)
    expect(itemsAfterWear.find((i) => i.id === testCancelItem.id)?.wearCount).toBe(2)

    // 착용 취소 -> wearCount 다시 1 차감되어 원래 값 1로 복원
    await cancelWearRecord(record.id, TEST_USER)
    const itemsAfterCancel = await getClosetItems(TEST_USER)
    const reverted = itemsAfterCancel.find((i) => i.id === testCancelItem.id)
    expect(reverted?.wearCount).toBe(1)
  })

  it("체형 프로필을 저장, 조회, 삭제할 수 있다", async () => {
    await saveBodyProfile({
      userId: TEST_USER,
      nickname: "테스터",
      height: 178,
      bodyType: "athletic",
      gender: "unisex",
      skinTone: "tan",
      updatedAt: new Date().toISOString(),
    })

    const profile = await getBodyProfile(TEST_USER)
    expect(profile?.height).toBe(178)
    expect(profile?.bodyType).toBe("athletic")

    await deleteBodyProfile(TEST_USER)
    const deleted = await getBodyProfile(TEST_USER)
    expect(deleted).toBeNull()
  })
})
