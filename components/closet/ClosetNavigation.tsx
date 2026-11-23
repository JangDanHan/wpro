"use client"

import { Sparkles, Shirt, Wand2, Compass } from "lucide-react"

export type ClosetTabMode = "weather" | "my_closet" | "closet_outfit" | "fitting_room"

interface ClosetNavigationProps {
  currentTab: ClosetTabMode
  onSelectTab: (tab: ClosetTabMode) => void
  closetCount?: number
}

export function ClosetNavigation({
  currentTab,
  onSelectTab,
  closetCount = 0,
}: ClosetNavigationProps) {
  const tabs = [
    {
      id: "weather" as ClosetTabMode,
      label: "날씨 & 추천",
      icon: Compass,
      desc: "실시간 날씨와 음악",
    },
    {
      id: "closet_outfit" as ClosetTabMode,
      label: "내 옷으로 코디",
      icon: Sparkles,
      desc: "날씨 맞춤 보유 옷 조합",
      badge: "핵심",
    },
    {
      id: "my_closet" as ClosetTabMode,
      label: "디지털 옷장",
      icon: Shirt,
      desc: "보유 의류 관리",
      count: closetCount,
    },
    {
      id: "fitting_room" as ClosetTabMode,
      label: "가상 피팅룸",
      icon: Wand2,
      desc: "체형 아바타 & 자연어 편집",
    },
  ]

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1.5 shadow-sm">
      <div className="grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = currentTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`
                relative flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-xs font-medium transition-all cursor-pointer
                ${
                  isActive
                    ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold shadow-xs border border-sky-200/80 dark:border-sky-800/80"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/50"
                }
              `}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 mb-1 ${isActive ? "text-sky-600 dark:text-sky-400" : ""}`} />
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 text-[9px] font-extrabold bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-full">
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-3 px-1 py-0.2 text-[8px] font-black bg-amber-500 text-white rounded-full leading-none">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="truncate max-w-full text-[11px] sm:text-xs">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
