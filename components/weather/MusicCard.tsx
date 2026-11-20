import { MusicRecommendation } from "@/lib/domain/types"
import { Music, ExternalLink, Sparkles, Play, Loader2, AlertCircle, RefreshCw } from "lucide-react"

interface MusicCardProps {
  music: MusicRecommendation | null
  musicState?: "idle" | "loading" | "success" | "error"
  errorMessage?: string | null
  onRetry?: () => void
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
}: MusicCardProps) {
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
              오늘의 어울리는 음악을 찾는 중...
            </span>
          </div>
          <span className="text-[11px] text-zinc-400">YouTube 연동</span>
        </div>
        <div className="h-20 bg-white/60 dark:bg-zinc-800/60 rounded-xl flex items-center justify-center text-xs text-zinc-400">
          날씨와 상황에 꼭 맞는 음악 플레이리스트를 선곡하고 있습니다.
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
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 font-semibold transition-colors shrink-0 ml-2"
          >
            <RefreshCw className="w-3 h-3" />
            <span>재시도</span>
          </button>
        )}
      </article>
    )
  }

  // 3. 정상 표시
  return (
    <article
      aria-label="날씨 맞춤 음악 추천 카드"
      className="w-full bg-gradient-to-br from-rose-50/70 via-white to-amber-50/50 dark:from-zinc-900 dark:via-zinc-850 dark:to-zinc-900 border border-rose-100/80 dark:border-zinc-700/60 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in-50 duration-300"
    >
      {/* 카드 상단: 헤더 배지 & 타이틀 */}
      <div className="flex items-center justify-between">
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
                AI 선곡
              </span>
            </div>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
          <YouTubeIcon className="w-3.5 h-3.5 text-red-500" />
          YouTube API
        </span>
      </div>

      {/* 영상 정보 본문 (썸네일 + 제목 + 채널명) */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xs p-4 rounded-xl border border-rose-100/60 dark:border-zinc-700/40">
        {/* 썸네일 */}
        <div className="relative aspect-video sm:w-48 shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 group">
          <img
            src={music.thumbnailUrl}
            alt={music.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md">
              <Play className="w-4 h-4 ml-0.5 fill-current" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* 텍스트 메타데이터 */}
        <div className="flex flex-col justify-between space-y-2 flex-1 min-w-0">
          <div>
            <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 block mb-0.5">
              추천 검색: {music.searchQuery}
            </span>
            <h3
              className="text-base font-bold text-zinc-900 dark:text-zinc-50 line-clamp-2 leading-snug"
              title={music.title}
            >
              {music.title}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
              <span>{music.channelTitle}</span>
            </p>
          </div>

          {/* YouTube에서 듣기 바로가기 버튼 */}
          <div className="pt-2">
            <a
              href={music.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
              aria-label={`${music.title} - YouTube에서 듣기 (새 창 열림)`}
            >
              <YouTubeIcon className="w-4 h-4" />
              <span>YouTube에서 듣기</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {/* 추천 이유 */}
      <div className="pt-2 border-t border-rose-100/60 dark:border-zinc-800">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
          선곡 이유
        </span>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
          {music.reason}
        </p>
      </div>

      {/* 안내 문구 */}
      <div className="p-3 bg-zinc-100/60 dark:bg-zinc-800/40 rounded-xl">
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
          날씨 및 상황을 고려해 제미나이가 추천 키워드를 구성하고, YouTube 공식 API를 통해 실제 영상을 선곡했습니다.
        </p>
      </div>
    </article>
  )
}
