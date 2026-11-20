import { ExternalLink } from "lucide-react"

interface SourceFooterProps {
  provider?: string
  providerUrl?: string
}

export function SourceFooter({
  provider = "기상청",
  providerUrl = "https://www.weather.go.kr/",
}: SourceFooterProps) {
  return (
    <footer className="w-full text-center py-6 border-t border-zinc-200 dark:border-zinc-800 space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        <span>날씨 정보 제공:</span>
        <a
          href={providerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-xs"
          aria-label={`${provider} 웹사이트 새 창으로 열기`}
        >
          <span>{provider}</span>
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>
      </div>

      <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
        옷차림은 서비스의 편집 기준에 따른 추천입니다. (광고 및 제휴 링크 없음)
      </p>
    </footer>
  )
}
