import { ValidatedWeatherData } from "@/lib/domain/types"
import { Clock, Info, Thermometer } from "lucide-react"

interface WeatherCardProps {
  weather: ValidatedWeatherData
}

export function WeatherCard({ weather }: WeatherCardProps) {
  return (
    <section
      aria-label="현재 날씨 정보"
      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div>
          <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            현재 날씨
          </span>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {weather.cityName}
          </h3>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            <Thermometer className="w-6 h-6 text-sky-500 mr-1" aria-hidden="true" />
            <span>{weather.temperature}℃</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-lg">
          <span className="block text-zinc-400 dark:text-zinc-500 text-[11px] mb-0.5">날씨 상태</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
            {weather.weatherDescription ?? "상태 정보 없음"}
          </span>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-lg">
          <span className="block text-zinc-400 dark:text-zinc-500 text-[11px] mb-0.5">강수량</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
            {weather.rainfallAmount !== null ? `${weather.rainfallAmount}mm` : "강수량 정보 없음"}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800 gap-1.5">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>기준 시각: {weather.referenceAtFormatted} (한국 시간)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" aria-hidden="true" />
          <span>정보 유형: {weather.infoType}</span>
        </div>
      </div>
    </section>
  )
}
