import { BodyProfile, ClosetItem, WearRecord } from "@/lib/domain/closet-types"

const DB_NAME = "AntigravityClosetDB"
const DB_VERSION = 1
const DEFAULT_USER_ID = "default_user"

// SSR 및 Vitest 메모리 fallback용 인메모리 저장소
interface InMemoryStore {
  clothes: Map<string, ClosetItem>
  wearHistory: Map<string, WearRecord>
  profiles: Map<string, BodyProfile>
}

const memoryStore: InMemoryStore = {
  clothes: new Map(),
  wearHistory: new Map(),
  profiles: new Map(),
}

/**
 * 초기 샘플 옷장 데이터 (처음 접속 시 옷장을 바로 확인하고 테스트할 수 있도록 제공)
 */
export const SAMPLE_INITIAL_CLOTHES: ClosetItem[] = [
  {
    id: "sample-outer-1",
    userId: DEFAULT_USER_ID,
    name: "블랙 볼륨 숏다운 패딩",
    category: "outer",
    subCategory: "숏패딩",
    colors: ["블랙"],
    pattern: "무지",
    style: "casual",
    seasons: ["winter"],
    material: "덕다운 80/20, 나일론 100%",
    thickness: "thick",
    warmth: "high",
    isAttributeConfirmed: true,
    originalImageUrl: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&auto=format&fit=crop&q=80",
    noBgImageUrl: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&auto=format&fit=crop&q=80",
    activeImageMode: "nobg",
    isFavorite: true,
    wearCount: 4,
    lastWornDate: "2026-11-20",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample-top-1",
    userId: DEFAULT_USER_ID,
    name: "차콜 반집업 울 니트",
    category: "top",
    subCategory: "하프집업 니트",
    colors: ["차콜", "그레이"],
    pattern: "무지",
    style: "casual",
    seasons: ["winter", "autumn", "spring"],
    material: "메리노울 80%, 나일론 20%",
    thickness: "medium",
    warmth: "high",
    isAttributeConfirmed: true,
    originalImageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80",
    noBgImageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80",
    activeImageMode: "nobg",
    isFavorite: true,
    wearCount: 7,
    lastWornDate: "2026-11-21",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample-bottom-1",
    userId: DEFAULT_USER_ID,
    name: "연청 와이드 데님 팬츠",
    category: "bottom",
    subCategory: "와이드 데님",
    colors: ["연청", "블루"],
    pattern: "무지",
    style: "casual",
    seasons: ["all"],
    material: "코튼 100%",
    thickness: "medium",
    warmth: "medium",
    isAttributeConfirmed: true,
    originalImageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
    noBgImageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
    activeImageMode: "nobg",
    isFavorite: false,
    wearCount: 12,
    lastWornDate: "2026-11-19",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample-shoes-1",
    userId: DEFAULT_USER_ID,
    name: "블랙 웜 패딩 룸슈즈/슬립온",
    category: "shoes",
    subCategory: "방한 슬립온",
    colors: ["블랙"],
    pattern: "무지",
    style: "casual",
    seasons: ["winter"],
    material: "신슐레이트 충전재",
    thickness: "thick",
    warmth: "high",
    isAttributeConfirmed: true,
    originalImageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80",
    noBgImageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80",
    activeImageMode: "nobg",
    isFavorite: true,
    wearCount: 15,
    lastWornDate: "2026-11-21",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample-bottom-2",
    userId: DEFAULT_USER_ID,
    name: "블랙 스웨트 조거팬츠 (레드 심볼)",
    category: "bottom",
    subCategory: "조거팬츠",
    colors: ["블랙"],
    pattern: "그래픽",
    style: "sporty",
    seasons: ["winter", "all"],
    material: "코튼 100% 기모",
    thickness: "thick",
    warmth: "high",
    isAttributeConfirmed: true,
    originalImageUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop&q=80",
    noBgImageUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop&q=80",
    activeImageMode: "nobg",
    isFavorite: false,
    wearCount: 6,
    lastWornDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample-shoes-2",
    userId: DEFAULT_USER_ID,
    name: "화이트 클린 레더 스니커즈",
    category: "shoes",
    subCategory: "스니커즈",
    colors: ["화이트"],
    pattern: "무지",
    style: "casual",
    seasons: ["all"],
    material: "천연 소가죽",
    thickness: "medium",
    warmth: "medium",
    isAttributeConfirmed: true,
    originalImageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
    noBgImageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
    activeImageMode: "nobg",
    isFavorite: false,
    wearCount: 9,
    lastWornDate: "2026-11-18",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

function hasIndexedDB(): boolean {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined"
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDatabase(): Promise<IDBDatabase> {
  if (!hasIndexedDB()) {
    return Promise.reject(new Error("IndexedDB not available in current environment"))
  }

  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains("clothes")) {
        const clothStore = db.createObjectStore("clothes", { keyPath: "id" })
        clothStore.createIndex("userId", "userId", { unique: false })
        clothStore.createIndex("category", "category", { unique: false })
        clothStore.createIndex("isFavorite", "isFavorite", { unique: false })
      }

      if (!db.objectStoreNames.contains("wear_history")) {
        const wearStore = db.createObjectStore("wear_history", { keyPath: "id" })
        wearStore.createIndex("userId", "userId", { unique: false })
        wearStore.createIndex("date", "date", { unique: false })
      }

      if (!db.objectStoreNames.contains("user_profile")) {
        db.createObjectStore("user_profile", { keyPath: "userId" })
      }
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })

  return dbPromise
}

/**
 * 옷장 전체 아이템 조회 (초기 비어있을 시 샘플 데이터 자동 시딩)
 */
export async function getClosetItems(userId = DEFAULT_USER_ID): Promise<ClosetItem[]> {
  if (!hasIndexedDB()) {
    if (memoryStore.clothes.size === 0) {
      SAMPLE_INITIAL_CLOTHES.forEach((c) => memoryStore.clothes.set(c.id, { ...c, userId }))
    }
    return Array.from(memoryStore.clothes.values()).filter((c) => c.userId === userId)
  }

  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction("clothes", "readonly")
      const store = tx.objectStore("clothes")
      const index = store.index("userId")
      const request = index.getAll(userId)

      request.onsuccess = async () => {
        let items: ClosetItem[] = request.result || []
        // 첫 진입 시 샘플 데이터 시딩
        if (items.length === 0) {
          await seedSampleClothes(userId)
          items = [...SAMPLE_INITIAL_CLOTHES.map((c) => ({ ...c, userId }))]
        }
        resolve(items)
      }
      request.onerror = () => reject(request.error)
    })
  } catch (err) {
    // Fallback to memory
    return Array.from(memoryStore.clothes.values()).filter((c) => c.userId === userId)
  }
}

/**
 * 샘플 의류 초기 등록
 */
export async function seedSampleClothes(userId = DEFAULT_USER_ID): Promise<void> {
  for (const item of SAMPLE_INITIAL_CLOTHES) {
    await saveClosetItem({ ...item, userId })
  }
}

/**
 * 단일 옷 저장 또는 생성
 */
export async function saveClosetItem(item: ClosetItem): Promise<void> {
  const itemToSave: ClosetItem = {
    ...item,
    updatedAt: new Date().toISOString(),
    createdAt: item.createdAt || new Date().toISOString(),
  }

  if (!hasIndexedDB()) {
    memoryStore.clothes.set(itemToSave.id, itemToSave)
    return
  }

  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("clothes", "readwrite")
    const store = tx.objectStore("clothes")
    const request = store.put(itemToSave)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * 단일 옷 정보 삭제
 */
export async function deleteClosetItem(id: string): Promise<void> {
  if (!hasIndexedDB()) {
    memoryStore.clothes.delete(id)
    return
  }

  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("clothes", "readwrite")
    const store = tx.objectStore("clothes")
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * 즐겨찾기 토글
 */
export async function toggleFavoriteItem(id: string, userId = DEFAULT_USER_ID): Promise<boolean> {
  const items = await getClosetItems(userId)
  const target = items.find((i) => i.id === id)
  if (!target) return false

  const updated: ClosetItem = { ...target, isFavorite: !target.isFavorite }
  await saveClosetItem(updated)
  return updated.isFavorite
}

/**
 * 당일 착용 기록 등록 ('오늘 입었어요' 버튼 클릭 시에만 동작)
 * - 중복 방지: 동일 날짜에 같은 옷 세트가 이미 등록되어 있다면 기존 기록 반환
 * - 해당 아이템들의 wearCount + 1, lastWornDate = 오늘 날짜로 갱신
 */
export async function recordWearToday(
  itemIds: string[],
  outfitId?: string,
  situationNote?: string,
  userId = DEFAULT_USER_ID,
): Promise<{ record: WearRecord; alreadyRecorded: boolean }> {
  const todayStr = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const existingRecords = await getWearRecords(userId)

  // 오늘 날짜에 동일한 조합이 이미 있는지 확인
  const isDuplicate = existingRecords.some((r) => {
    if (r.date !== todayStr) return false
    if (r.itemIds.length !== itemIds.length) return false
    return itemIds.every((id) => r.itemIds.includes(id))
  })

  if (isDuplicate) {
    const existing = existingRecords.find((r) => r.date === todayStr)!
    return { record: existing, alreadyRecorded: true }
  }

  const newRecord: WearRecord = {
    id: `wear_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId,
    date: todayStr,
    outfitId,
    itemIds,
    situationNote,
    createdAt: new Date().toISOString(),
  }

  // 1. 착용 기록 저장
  if (!hasIndexedDB()) {
    memoryStore.wearHistory.set(newRecord.id, newRecord)
  } else {
    const db = await openDatabase()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("wear_history", "readwrite")
      const store = tx.objectStore("wear_history")
      const request = store.put(newRecord)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // 2. 포함된 각 아이템의 wearCount 및 lastWornDate 갱신
  const allClothes = await getClosetItems(userId)
  for (const itemId of itemIds) {
    const cloth = allClothes.find((c) => c.id === itemId)
    if (cloth) {
      await saveClosetItem({
        ...cloth,
        wearCount: (cloth.wearCount || 0) + 1,
        lastWornDate: todayStr,
      })
    }
  }

  return { record: newRecord, alreadyRecorded: false }
}

/**
 * 착용 기록 취소 (되돌리기)
 * - 착용 기록 삭제
 * - 해당 아이템들의 wearCount - 1 (0 미만 방지)
 */
export async function cancelWearRecord(recordId: string, userId = DEFAULT_USER_ID): Promise<void> {
  const records = await getWearRecords(userId)
  const targetRecord = records.find((r) => r.id === recordId)
  if (!targetRecord) return

  // 1. 착용 기록 삭제
  if (!hasIndexedDB()) {
    memoryStore.wearHistory.delete(recordId)
  } else {
    const db = await openDatabase()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("wear_history", "readwrite")
      const store = tx.objectStore("wear_history")
      const request = store.delete(recordId)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // 2. 아이템별 wearCount 차감
  const allClothes = await getClosetItems(userId)
  for (const itemId of targetRecord.itemIds) {
    const cloth = allClothes.find((c) => c.id === itemId)
    if (cloth) {
      await saveClosetItem({
        ...cloth,
        wearCount: Math.max(0, (cloth.wearCount || 1) - 1),
      })
    }
  }
}

/**
 * 전체 착용 기록 조회
 */
export async function getWearRecords(userId = DEFAULT_USER_ID): Promise<WearRecord[]> {
  if (!hasIndexedDB()) {
    return Array.from(memoryStore.wearHistory.values()).filter((r) => r.userId === userId)
  }

  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction("wear_history", "readonly")
      const store = tx.objectStore("wear_history")
      const index = store.index("userId")
      const request = index.getAll(userId)

      request.onsuccess = () => {
        const records: WearRecord[] = request.result || []
        // 최신순 정렬
        records.sort((a, b) => (b.date > a.date ? 1 : -1))
        resolve(records)
      }
      request.onerror = () => reject(request.error)
    })
  } catch {
    return Array.from(memoryStore.wearHistory.values()).filter((r) => r.userId === userId)
  }
}

/**
 * 오늘 이미 착용 완료된 기록이 있는지 확인
 */
export async function getTodayWearRecord(userId = DEFAULT_USER_ID): Promise<WearRecord | null> {
  const todayStr = new Date().toISOString().slice(0, 10)
  const records = await getWearRecords(userId)
  return records.find((r) => r.date === todayStr) || null
}

/**
 * 체형 프로필 저장 및 조회
 */
export async function saveBodyProfile(profile: BodyProfile): Promise<void> {
  if (!hasIndexedDB()) {
    memoryStore.profiles.set(profile.userId, profile)
    return
  }

  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("user_profile", "readwrite")
    const store = tx.objectStore("user_profile")
    const request = store.put(profile)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getBodyProfile(userId = DEFAULT_USER_ID): Promise<BodyProfile | null> {
  if (!hasIndexedDB()) {
    return memoryStore.profiles.get(userId) || null
  }

  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction("user_profile", "readonly")
      const store = tx.objectStore("user_profile")
      const request = store.get(userId)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  } catch {
    return memoryStore.profiles.get(userId) || null
  }
}

export async function deleteBodyProfile(userId = DEFAULT_USER_ID): Promise<void> {
  if (!hasIndexedDB()) {
    memoryStore.profiles.delete(userId)
    return
  }

  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("user_profile", "readwrite")
    const store = tx.objectStore("user_profile")
    const request = store.delete(userId)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
