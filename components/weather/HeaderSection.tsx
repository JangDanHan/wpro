import { CloudSun } from "lucide-react"

export function HeaderSection() {
  return (
    <header className="text-center py-6 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-center gap-2 mb-2">
        <CloudSun className="w-8 h-8 text-sky-500" aria-hidden="true" />
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          날씨 옷차림 추천
        </h1>
      </div>
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        지금 외출할 때 입을 옷을 골라보세요
      </p>
    </header>
  )
}
