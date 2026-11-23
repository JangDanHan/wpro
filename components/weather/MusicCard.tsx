"use client"

import { useState, useEffect } from "react"
import { MusicRecommendation } from "@/lib/domain/types"
import {
  Music,
  ExternalLink,
  Sparkles,
  Play,
  Pause,
  Loader2,
  AlertCircle,
  RefreshCw,
  Shuffle,
  Disc3,
  CheckCircle2,
} from "lucide-react"

interface MusicCardProps {
  music: MusicRecommendation | null
  musicState?: "idle" | "loading" | "success" | "error"
  errorMessage?: string | null
  onRetry?: () => void
  onNextTrack?: () => void
  isFetchingNextTrack?: boolean
}

function YouTubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

export function MusicCard({
  music,
  musicState = "success",
  errorMessage,
  onRetry,
  onNextTrack,
  isFetchingNextTrack = false,
}: MusicCardProps) {
  // 인앱 플레이어 재생 상태 (한 번에 1곡만 재생)
  const [isPlaying, setIsPlaying] = useState(false)
  const [albumImgError, setAlbumImgError] = useState(false)

  // 곡이 변경되면 재생 상태 및 이미지 에러 리셋
  useEffect(() => {
    setIsPlaying(false)
    setAlbumImgError(false)
  }, [music?.videoId, music?.title])

  // 1. 로딩 상태 스켈레톤
  if (musicState === "loading") {
    return (
      <article
        aria-label="음악 추천 로딩 중"
        className="w-full bg-rose-50/40 dark:bg-zinc-900 border border-rose-100/60 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3 animate-pulse"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500/20 text-red-500 rounded-xl">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              날씨와 상황에 맞는 개별 곡을 선곡하는 중...
            </span>
          </div>
          <span className="text-[11px] text-zinc-400">공식 음원 연동</span>
        </div>
        <div className="h-24 bg-white/60 dark:bg-zinc-800/60 rounded-xl flex items-center justify-center text-xs text-zinc-400">
          모음집이 아닌 단 1곡의 명곡을 찾는 중입니다.
        </div>
      </article>
    )
  }

  // 2. 오류 상태
  if (musicState === "error" || !music) {
    if (musicState === "idle") return null

    return (
      <article
        aria-label="음악 추천 오류"
        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex items-center justify-between text-xs"
      >
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{errorMessage || "음악 추천을 불러오지 못했습니다. 날씨와 옷차림 정보는 정상 제공됩니다."}</span>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 font-semibold transition-colors shrink-0 ml-2 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>재시도</span>
          </button>
        )}
      </article>
    )
  }

  // 앨범 아트 이미지 (전달받은 앨범아트 또는 썸네일)
  const displayCover = !albumImgError && (music.albumArtUrl || music.thumbnailUrl)
    ? (music.albumArtUrl || music.thumbnailUrl)
    : `https://img.youtube.com/vi/${music.videoId}/mqdefault.jpg`

  const songTitle = music.songTitle || music.title
  const artistName = music.artist || music.channelTitle

  return (
    <article
      aria-label="날씨 맞춤 음악 추천 카드"
      className="w-full bg-gradient-to-br from-rose-50/70 via-white to-amber-50/40 dark:from-zinc-900 dark:via-zinc-850 dark:to-zinc-900 border border-rose-100/80 dark:border-zinc-700/60 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in-50 duration-300"
    >
      {/* 카드 상단: 헤더 배지 & 타이틀 & YouTube 표시 */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-600 text-white rounded-xl shadow-xs">
            <Music className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                오늘의 어울리는 음악
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                <Sparkles className="w-3 h-3 text-rose-500" aria-hidden="true" />
                단 1곡 추천
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 다른 곡 추천 버튼 */}
          {onNextTrack && (
            <button
              type="button"
              disabled={isFetchingNextTrack}
              onClick={onNextTrack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-750 shadow-2xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 active:scale-95 cursor-pointer disabled:opacity-50"
              title="다른 아티스트와 장르의 새로운 곡 추천받기"
            >
              {isFetchingNextTrack ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
              ) : (
                <Shuffle className="w-3.5 h-3.5 text-red-500" />
              )}
              <span>다른 곡 추천</span>
            </button>
          )}

          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
            <YouTubeIcon className="w-3.5 h-3.5 text-red-500" />
            공식 음원
          </span>
        </div>
      </div>

      {/* 후보 소진 시 순환 안내 배지 */}
      {music.isExhaustedCandidates && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 rounded-xl text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>준비된 맞춤 곡을 모두 확인하셨습니다. 처음 곡부터 다시 추천합니다.</span>
        </div>
      )}

      {/* Spotify / Melon 스타일의 개별 곡 카드 본문 */}
      <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-rose-100/60 dark:border-zinc-700/50 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* 앨범 커버 (Square Album Art) */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700/60 shadow-md group">
            <img
              src={displayCover}
              alt={`${songTitle} - ${artistName}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={() => setAlbumImgError(true)}
            />
            {/* 앨범 플레이 오버레이 버튼 */}
            <button
              type="button"
              onClick={() => setIsPlaying((prev) => !prev)}
              aria-label={isPlaying ? "일시정지" : `${songTitle} 재생`}
              className="absolute inset-0 bg-black/30 hover:bg-black/40 transition-colors flex items-center justify-center cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-transform active:scale-90">
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" aria-hidden="true" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5 fill-current" aria-hidden="true" />
                )}
              </div>
            </button>
          </div>

          {/* 메타데이터 (곡명, 아티스트, 장르 태그) */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {music.genre && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60">
                  {music.genre}
                </span>
              )}
              {music.origin && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                  {music.origin === "domestic" ? "국내" : "해외"}
                </span>
              )}
              <span className="text-[10px] text-zinc-400 flex items-center gap-0.5">
                <Disc3 className="w-3 h-3 text-red-500" />
                단일 트랙
              </span>
            </div>

            <h3
              className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug truncate"
              title={songTitle}
            >
              {songTitle}
            </h3>

            <p className="text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300 truncate">
              {artistName}
            </p>

            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium pt-0.5">
              💡 {music.reason}
            </p>
          </div>
        </div>

        {/* 인앱 YouTube 플레이어 (한 번에 1곡만 스트리밍) */}
        {isPlaying && (
          <div className="pt-2 animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner border border-zinc-200 dark:border-zinc-700">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${music.videoId}?autoplay=1&rel=0&playsinline=1`}
                title={`${artistName} - ${songTitle}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 px-1 pt-1.5">
              <span>🎵 앱 내에서 재생 중입니다 (1회 1곡 단일 스트리밍)</span>
              <button
                type="button"
                onClick={() => setIsPlaying(false)}
                className="underline hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
              >
                플레이어 닫기
              </button>
            </div>
          </div>
        )}

        {/* 재생 및 외부 연결 액션 버튼 영역 */}
        <div className="flex items-center gap-2 pt-2 border-t border-rose-100/60 dark:border-zinc-800/80 flex-wrap">
          {/* 인앱 재생 토글 버튼 */}
          <button
            type="button"
            onClick={() => setIsPlaying((prev) => !prev)}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isPlaying
                ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                : "bg-red-600 hover:bg-red-700 text-white shadow-sm active:scale-95"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>일시정지</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>앱에서 바로 듣기</span>
              </>
            )}
          </button>

          {/* YouTube에서 공식 음원 듣기 버튼 */}
          <a
            href={music.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer ml-auto"
            aria-label={`${songTitle} - YouTube 공식 음원 새 창에서 열기`}
          >
            <YouTubeIcon className="w-3.5 h-3.5 text-red-500" />
            <span>YouTube에서 열기</span>
            <ExternalLink className="w-3 h-3 opacity-70" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* 안내 문구 */}
      <div className="p-3 bg-zinc-100/60 dark:bg-zinc-800/40 rounded-xl">
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
          긴 플레이리스트나 모음집이 아닌, 현재 기온·날씨·상황에 어울리는 엄선된 1곡의 공식 음원/MV입니다.
        </p>
      </div>
    </article>
  )
}
