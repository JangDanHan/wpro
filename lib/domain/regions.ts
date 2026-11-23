import fs from "fs"
import path from "path"

export interface KmaRegionItem {
  path: string[]
  value: string
  label: string
  searchKey: string
  grid: {
    nx: number
    ny: number
  }
}

// 싱글톤 메모리 캐시
let cachedRegions: KmaRegionItem[] | null = null
let regionMap: Map<string, KmaRegionItem> | null = null

export function loadAllKmaRegions(): KmaRegionItem[] {
  if (cachedRegions) {
    return cachedRegions
  }

  const filePath = path.join(process.cwd(), "data", "kma_regions.json")
  if (!fs.existsSync(filePath)) {
    throw new Error("기상청 공식 행정구역 격자 데이터(data/kma_regions.json)를 찾을 수 없습니다.")
  }

  const content = fs.readFileSync(filePath, "utf-8")
  const data: KmaRegionItem[] = JSON.parse(content)
  cachedRegions = data

  regionMap = new Map()
  for (const item of data) {
    regionMap.set(item.value, item)
  }

  // 기존 3개 도시 하위 호환성 등록 (대표 격자 nx, ny 고정 매핑)
  regionMap.set("seoul", {
    path: ["서울특별시"],
    value: "seoul",
    label: "서울특별시",
    searchKey: "서울특별시",
    grid: { nx: 60, ny: 127 },
  })
  regionMap.set("gwangju", {
    path: ["광주광역시"],
    value: "gwangju",
    label: "광주광역시",
    searchKey: "광주광역시",
    grid: { nx: 58, ny: 74 },
  })
  regionMap.set("busan", {
    path: ["부산광역시"],
    value: "busan",
    label: "부산광역시",
    searchKey: "부산광역시",
    grid: { nx: 98, ny: 76 },
  })

  return cachedRegions
}

/**
 * 1단계 (시·도) 목록 반환 (17개 광역시도)
 */
export function getStep1List(): string[] {
  const regions = loadAllKmaRegions()
  const set = new Set<string>()
  for (const r of regions) {
    if (r.path[0]) set.add(r.path[0])
  }
  return Array.from(set)
}

/**
 * 2단계 (시·군·구) 목록 반환 (한국어 가나다순 정렬)
 */
export function getStep2List(step1: string): string[] {
  const regions = loadAllKmaRegions()
  const set = new Set<string>()
  for (const r of regions) {
    if (r.path[0] === step1 && r.path[1]) {
      set.add(r.path[1])
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "ko"))
}

/**
 * 3단계 (읍·면·동) 목록 반환 (한국어 가나다순 정렬)
 */
export function getStep3List(
  step1: string,
  step2?: string,
): { name: string; value: string; label: string; grid: { nx: number; ny: number } }[] {
  const regions = loadAllKmaRegions()
  const results: { name: string; value: string; label: string; grid: { nx: number; ny: number } }[] = []
  const seen = new Set<string>()

  for (const r of regions) {
    if (r.path[0] !== step1) continue

    if (step2) {
      if (r.path[1] !== step2) continue
      // 3단계 이상 (읍면동 및 하위)
      if (r.path.length >= 3) {
        const name = r.path.slice(2).join(" ")
        if (!seen.has(name)) {
          seen.add(name)
          results.push({
            name,
            value: r.value,
            label: r.label,
            grid: r.grid,
          })
        }
      }
    } else {
      // 세종시처럼 2단계가 없는 경우 1단계 바로 아래의 읍면동
      if (r.path.length >= 2) {
        const name = r.path.slice(1).join(" ")
        if (!seen.has(name)) {
          seen.add(name)
          results.push({
            name,
            value: r.value,
            label: r.label,
            grid: r.grid,
          })
        }
      }
    }
  }

  return results.sort((a, b) => a.name.localeCompare(b.name, "ko"))
}

/**
 * ID로 특정 지역 데이터 검색 및 공식 격자 좌표 검증
 */
export function findKmaRegionById(id: string): KmaRegionItem | null {
  if (!cachedRegions) {
    loadAllKmaRegions()
  }
  return regionMap?.get(id) || null
}

/**
 * 시·도, 시·군·구, 읍·면·동이 모두 선택된 완전한 행정구역인지 검증합니다.
 * - path.length < 3 인 경우: 시·도(1단계) 또는 시·군·구(2단계)만 선택된 미완료 상태
 * - path.length >= 3 인 경우: 읍·면·동까지 모두 선택 완료된 단말(leaf) 행정구역
 */
export function isFullyQualifiedRegion(region: KmaRegionItem | null | undefined): boolean {
  if (!region || !Array.isArray(region.path)) {
    return false
  }
  return region.path.length >= 3
}

/**
 * 검색어로 전국 행정구역 검색 (동일 지명은 전체 주소 label로 구분)
 * - 읍·면·동까지 모두 선택 가능한 단말 지역(path.length >= 3)만 반환
 */
export function searchKmaRegions(query: string, limit = 20): KmaRegionItem[] {
  const q = query.trim().replace(/\s+/g, "").toLowerCase()
  if (!q) return []

  const regions = loadAllKmaRegions()
  const results: KmaRegionItem[] = []

  for (const r of regions) {
    // 읍·면·동까지 모두 갖춘 지역만 검색 가능 (시도/시군구 단독 제외)
    if (r.path.length < 3) continue

    if (r.searchKey.toLowerCase().includes(q) || r.label.replace(/\s+/g, "").toLowerCase().includes(q)) {
      results.push(r)
      if (results.length >= limit) break
    }
  }

  return results
}
