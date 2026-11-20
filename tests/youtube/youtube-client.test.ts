import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  decodeHtmlEntities,
  searchYouTubeVideo,
  clearYouTubeCache,
} from "@/lib/youtube/youtube-client"

describe("YouTube Client", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    clearYouTubeCache()
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
    clearYouTubeCache()
  })

  describe("decodeHtmlEntities", () => {
    it("HTML 엔티티 특수문자를 올바르게 디코딩한다", () => {
      expect(decodeHtmlEntities("Tom &amp; Jerry")).toBe("Tom & Jerry")
      expect(decodeHtmlEntities("&quot;Hello&quot; &#39;World&#39;")).toBe('"Hello" \'World\'')
      expect(decodeHtmlEntities("&lt;tag&gt;")).toBe("<tag>")
      expect(decodeHtmlEntities("")).toBe("")
    })
  })

  describe("searchYouTubeVideo", () => {
    it("검색어가 비어있으면 null을 반환한다", async () => {
      process.env.YOUTUBE_API_KEY = "dummy-key"
      const result = await searchYouTubeVideo("", "비가 와서 추천합니다")
      expect(result).toBeNull()
    })

    it("YOUTUBE_API_KEY가 없거나 비어있으면 null을 반환한다", async () => {
      process.env.YOUTUBE_API_KEY = ""
      const result = await searchYouTubeVideo("비 오는 날 노래", "비가 와서 추천합니다")
      expect(result).toBeNull()
    })

    it("성공적으로 YouTube API 결과를 수신하면 MusicRecommendation을 반환한다", async () => {
      process.env.YOUTUBE_API_KEY = "test-api-key"

      const mockYouTubeResponse = {
        items: [
          {
            id: { videoId: "abc123xyz" },
            snippet: {
              title: "비 오는 날 듣기 좋은 감성 팝송 &amp; 로파이",
              channelTitle: "Music Lounge",
              thumbnails: {
                medium: { url: "https://i.ytimg.com/vi/abc123xyz/mqdefault.jpg" },
              },
            },
          },
        ],
      }

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockYouTubeResponse,
      })
      vi.stubGlobal("fetch", fetchMock)

      const result = await searchYouTubeVideo(
        "비 오는 날 노래",
        "비 오는 날 감성을 돋우기 위해 추천합니다"
      )

      expect(result).not.toBeNull()
      expect(result?.videoId).toBe("abc123xyz")
      expect(result?.title).toBe("비 오는 날 듣기 좋은 감성 팝송 & 로파이")
      expect(result?.channelTitle).toBe("Music Lounge")
      expect(result?.thumbnailUrl).toBe("https://i.ytimg.com/vi/abc123xyz/mqdefault.jpg")
      expect(result?.videoUrl).toBe("https://www.youtube.com/watch?v=abc123xyz")
      expect(result?.searchQuery).toBe("비 오는 날 노래")
      expect(result?.reason).toBe("비 오는 날 감성을 돋우기 위해 추천합니다")
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it("캐시가 적용되어 동일 검색어는 추가 API 호출 없이 캐시된 결과를 반환한다", async () => {
      process.env.YOUTUBE_API_KEY = "test-api-key"

      const mockYouTubeResponse = {
        items: [
          {
            id: { videoId: "cached-id" },
            snippet: {
              title: "캐시된 영상 제목",
              channelTitle: "캐시 채널",
              thumbnails: {
                medium: { url: "https://i.ytimg.com/vi/cached-id/mqdefault.jpg" },
              },
            },
          },
        ],
      }

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockYouTubeResponse,
      })
      vi.stubGlobal("fetch", fetchMock)

      // 첫 번째 호출
      const result1 = await searchYouTubeVideo("동일한 검색어", "첫 번째 이유")
      expect(result1?.videoId).toBe("cached-id")
      expect(result1?.reason).toBe("첫 번째 이유")
      expect(fetchMock).toHaveBeenCalledTimes(1)

      // 두 번째 호출 (캐시 히트)
      const result2 = await searchYouTubeVideo("동일한 검색어", "두 번째 이유")
      expect(result2?.videoId).toBe("cached-id")
      expect(result2?.reason).toBe("두 번째 이유")
      // fetch는 여전히 1회만 호출됨!
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it("동시에 동일 검색어가 요청되면 Promise de-duplication으로 1회만 fetch한다", async () => {
      process.env.YOUTUBE_API_KEY = "test-api-key"

      const mockYouTubeResponse = {
        items: [
          {
            id: { videoId: "concurrent-id" },
            snippet: {
              title: "동시 요청 영상",
              channelTitle: "동시 채널",
            },
          },
        ],
      }

      const fetchMock = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => mockYouTubeResponse,
                }),
              20
            )
          })
      )
      vi.stubGlobal("fetch", fetchMock)

      // 동시 다발적 3회 요청
      const [r1, r2, r3] = await Promise.all([
        searchYouTubeVideo("동시 검색어", "이유 1"),
        searchYouTubeVideo("동시 검색어", "이유 2"),
        searchYouTubeVideo("동시 검색어", "이유 3"),
      ])

      expect(r1?.videoId).toBe("concurrent-id")
      expect(r2?.videoId).toBe("concurrent-id")
      expect(r3?.videoId).toBe("concurrent-id")
      // fetch는 1회만 실행됨!
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it("YouTube API 403(QuotaExceeded) 또는 에러 발생 시 예외 없이 null을 반환한다", async () => {
      process.env.YOUTUBE_API_KEY = "test-api-key"

      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
      })
      vi.stubGlobal("fetch", fetchMock)

      const result = await searchYouTubeVideo("할당량 초과 쿼리", "이유")
      expect(result).toBeNull()
    })

    it("검색 결과가 0건이면 null을 반환한다", async () => {
      process.env.YOUTUBE_API_KEY = "test-api-key"

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }),
      })
      vi.stubGlobal("fetch", fetchMock)

      const result = await searchYouTubeVideo("결과 없는 쿼리", "이유")
      expect(result).toBeNull()
    })

    it("네트워크 연결 실패 시 예외를 던지지 않고 안전하게 null을 반환한다", async () => {
      process.env.YOUTUBE_API_KEY = "test-api-key"

      const fetchMock = vi.fn().mockRejectedValue(new Error("Network connection reset"))
      vi.stubGlobal("fetch", fetchMock)

      const result = await searchYouTubeVideo("네트워크 에러 쿼리", "이유")
      expect(result).toBeNull()
    })
  })
})
