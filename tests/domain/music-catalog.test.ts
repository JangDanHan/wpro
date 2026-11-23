import { describe, it, expect } from "vitest"
import {
  MUSIC_CATALOG,
  selectIndividualTrack,
} from "@/lib/domain/music-catalog"

describe("Music Catalog & Individual Track Selection", () => {
  it("카탈로그의 모든 음악은 단 1곡의 명확한 제목, 아티스트, 앨범아트, 공식 비디오 ID를 갖추어야 한다", () => {
    expect(MUSIC_CATALOG.length).toBeGreaterThanOrEqual(15)

    for (const track of MUSIC_CATALOG) {
      expect(track.id).toBeTruthy()
      expect(track.title).toBeTruthy()
      expect(track.artist).toBeTruthy()
      expect(track.genre).toBeTruthy()
      expect(["domestic", "international"]).toContain(track.origin)
      expect(track.albumArtUrl).toMatch(/^https:\/\//)
      expect(track.shortReason).toBeTruthy()
      expect(track.officialVideoId).toMatch(/^[a-zA-Z0-9_-]{11}$/) // 유효한 11자리 YouTube 비디오 ID
      // 플레이리스트나 모음집 키워드가 곡 제목에 들어가지 않아야 함
      expect(track.title).not.toContain("플레이리스트")
      expect(track.title).not.toContain("모음집")
      expect(track.title).not.toContain("연속재생")
    }
  })

  it("비가 올 때 비에 어울리는 개별 곡(헤이즈, Lauv 등)을 추천한다", () => {
    const { track } = selectIndividualTrack(15, "rain")
    expect(track.weatherConditions).toContain("rain")
    expect(track.title).toBeTruthy()
    expect(track.artist).toBeTruthy()
  })

  it("추운 겨울(영하 및 5도 이하)일 때 따뜻한 감성의 개별 곡을 추천한다", () => {
    const { track } = selectIndividualTrack(2, "none")
    expect(track.weatherConditions.some((c) => c === "cold" || c === "snow")).toBe(true)
  })

  it("선택된 곡을 excludedTrackIds에 넣고 다시 호출하면 다른 아티스트와 새로운 곡이 추천된다 (중복 방지)", () => {
    const firstPick = selectIndividualTrack(15, "rain", null, [])
    expect(firstPick.track).toBeDefined()

    const secondPick = selectIndividualTrack(15, "rain", null, [firstPick.track.id])
    expect(secondPick.track).toBeDefined()
    expect(secondPick.track.id).not.toBe(firstPick.track.id)
    expect(secondPick.track.artist).not.toBe(firstPick.track.artist) // 아티스트 다양성 확인
  })

  it("상황 키워드(운동)가 전달되면 운동에 어울리는 활기찬 개별 곡을 우선 추천한다", () => {
    const { track } = selectIndividualTrack(25, "none", "야외 러닝 운동 중")
    expect(track.situationTags.includes("운동") || track.genre.includes("Pop") || track.genre.includes("록")).toBe(true)
  })

  it("후보가 모두 소진되었을 때 isExhausted 플래그를 반환한다", () => {
    // 모든 트랙 ID를 excluded에 포함
    const allIds = MUSIC_CATALOG.map((t) => t.id)
    const result = selectIndividualTrack(15, "rain", null, allIds)
    expect(result.isExhausted).toBe(true)
    expect(result.track).toBeDefined()
  })
})
