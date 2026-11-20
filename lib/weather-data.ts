export type Precipitation = "rain" | "snow" | "mixed" | "none" | "unknown"

export type Region = {
  id: string
  province: string
  district: string
  fullName: string
  temperature: number
  precipitation: Precipitation
  rainfallAmount?: number
}

export type OutfitRule = {
  id: string
  title: string
  pieces: string[]
  reason: string
}

export type PreviewWeather = {
  temperature: number
  precipitation: Precipitation
  rainfallAmount?: number
  referenceAt: number
  queriedAt: number
}

export const REGIONS: Region[] = [
  {
    id: "seoul-junggu",
    province: "서울특별시",
    district: "중구",
    fullName: "서울특별시 중구",
    temperature: 8,
    precipitation: "rain",
    rainfallAmount: 1.2,
  },
  {
    id: "gwangju-bukgu",
    province: "광주광역시",
    district: "북구",
    fullName: "광주광역시 북구",
    temperature: 17,
    precipitation: "none",
  },
  {
    id: "busan-junggu",
    province: "부산광역시",
    district: "중구",
    fullName: "부산광역시 중구",
    temperature: 17,
    precipitation: "none",
  },
  {
    id: "busan-haeundae",
    province: "부산광역시",
    district: "해운대구",
    fullName: "부산광역시 해운대구",
    temperature: 23,
    precipitation: "unknown",
  },
]

export const PRECIPITATION_LABELS: Record<Precipitation, string> = {
  rain: "비",
  snow: "눈",
  mixed: "비·눈",
  none: "강수 없음 · 확인됨",
  unknown: "강수 여부 확인 불가",
}

export function getOutfitRule(temperature: number): OutfitRule {
  if (temperature < 0) {
    return {
      id: "winter",
      title: "두꺼운 외투와 보온용품",
      pieces: ["두꺼운 외투", "보온용품"],
      reason: "찬 공기에 대비해 보온에 신경 써 주세요.",
    }
  }

  if (temperature < 5) {
    return {
      id: "heavy-coat",
      title: "두꺼운 외투와 니트",
      pieces: ["두꺼운 외투", "니트"],
      reason: "기온이 낮아 도톰한 겹쳐 입기를 권해요.",
    }
  }

  if (temperature < 10) {
    return {
      id: "coat",
      title: "코트와 긴소매",
      pieces: ["코트", "긴소매"],
      reason: "가벼운 외출에도 겉옷을 챙기기 좋은 기온이에요.",
    }
  }

  if (temperature < 15) {
    return {
      id: "jacket",
      title: "재킷과 긴소매",
      pieces: ["재킷", "긴소매"],
      reason: "긴소매 위에 재킷을 걸쳐 입어 보세요.",
    }
  }

  if (temperature < 20) {
    return {
      id: "light-layer",
      title: "얇은 겉옷과 긴소매",
      pieces: ["얇은 겉옷", "긴소매"],
      reason: "얇은 겉옷 하나면 부담 없이 입기 좋아요.",
    }
  }

  if (temperature < 28) {
    return {
      id: "light-clothes",
      title: "얇은 상의와 가벼운 하의",
      pieces: ["얇은 상의", "가벼운 하의"],
      reason: "가볍고 편안한 옷차림을 추천해요.",
    }
  }

  return {
    id: "breezy",
    title: "통풍이 잘되는 가벼운 옷",
    pieces: ["통풍이 잘되는 상의", "가벼운 하의"],
    reason: "통풍이 잘되는 가벼운 옷이 어울리는 기온이에요.",
  }
}

export function createPreviewWeather(
  region: Region,
  options?: {
    temperature?: number
    precipitation?: Precipitation
    omitRainfall?: boolean
    referenceOffsetMs?: number
  },
): PreviewWeather {
  const queriedAt = Date.now()
  const precipitation = options?.precipitation ?? region.precipitation
  const rainfallAmount = options?.omitRainfall
    ? undefined
    : precipitation === region.precipitation
      ? region.rainfallAmount
      : precipitation === "rain"
        ? 1.2
        : precipitation === "mixed"
          ? 0.8
          : undefined

  return {
    temperature: options?.temperature ?? region.temperature,
    precipitation,
    rainfallAmount,
    referenceAt: queriedAt + (options?.referenceOffsetMs ?? 0),
    queriedAt,
  }
}

export function formatKoreanTime(timestamp: number) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(timestamp))
}

export function getOutfitReason(weather: PreviewWeather, rule: OutfitRule) {
  const { temperature, precipitation } = weather
  const finalSyllable = rule.title.charCodeAt(rule.title.length - 1) - 0xac00
  const hasFinalConsonant = finalSyllable >= 0 && finalSyllable <= 11171 && finalSyllable % 28 !== 0
  const outfitObject = `${rule.title}${hasFinalConsonant ? "을" : "를"}`
  const base = `현재 기온 ${temperature}℃를 기준으로 ${outfitObject} 추천해요.`

  if (precipitation === "rain") {
    return `현재 ${temperature}℃이고 비가 내려 ${rule.title}에 우산과 방수 신발을 함께 추천해요.`
  }

  if (precipitation === "snow") {
    return `현재 ${temperature}℃이고 눈이 내려 ${rule.title}에 방수와 미끄럼 방지를 고려한 신발을 추천해요.`
  }

  if (precipitation === "mixed") {
    return `현재 ${temperature}℃이고 비와 눈이 섞여 ${rule.title}에 우산과 방수·미끄럼 방지 신발을 추천해요.`
  }

  if (precipitation === "none") {
    return `현재 ${temperature}℃이고 강수 없음이 확인되어 ${outfitObject} 추천해요. 추가 준비물은 없어요.`
  }

  return `${base} 강수 여부를 확인할 수 없어 기온만 기준으로 추천했어요.`
}

export function getPrecipitationPreparation(precipitation: Precipitation) {
  switch (precipitation) {
    case "rain":
      return { title: "비 대비", detail: "우산 · 방수 신발", icon: "rain" as const }
    case "snow":
      return { title: "눈 대비", detail: "방수 · 미끄럼 방지 신발", icon: "snow" as const }
    case "mixed":
      return { title: "비·눈 대비", detail: "우산 · 방수·미끄럼 방지 신발", icon: "mixed" as const }
    case "none":
      return { title: "강수 확인", detail: "추가 준비물 없음", icon: "none" as const }
    case "unknown":
      return { title: "강수 여부 확인 불가", detail: "강수 여부를 확인할 수 없어 기온만 기준으로 추천했어요.", icon: "unknown" as const }
  }
}
