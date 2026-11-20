import { ValidatedWeatherData } from "./types"

export interface ChecklistItem {
  id: string
  name: string
  reason: string
}

/**
 * 날씨 데이터와 상황을 기반으로 외출 준비물 체크리스트를 생성합니다.
 * - 실제 조회된 날씨에 근거하여 추천
 * - 비 확정과 비 예보(가능성)를 명확히 구분
 * - 준비물 이름 중복 방지
 * - 3~5개의 엄선된 준비물 목록 반환
 */
export function generateChecklist(
  weather: ValidatedWeatherData,
  situation?: string,
): ChecklistItem[] {
  const items: ChecklistItem[] = []
  const seenNames = new Set<string>()

  const addItem = (id: string, name: string, reason: string) => {
    if (seenNames.has(name)) return
    seenNames.add(name)
    items.push({ id, name, reason })
  }

  const { temperature, precipitationType, rainfallAmount, weatherDescription } = weather
  const desc = (weatherDescription || "").trim()
  const cleanSit = (situation || "").trim().toLowerCase()

  // 1. 강수 관련 준비물 (비 확정 vs 비 예보 구분)
  const isRainConfirmed =
    precipitationType === "rain" || (rainfallAmount !== null && rainfallAmount > 0)
  const isSnowConfirmed = precipitationType === "snow"
  const isMixedConfirmed = precipitationType === "mixed"

  const hasRainForecast =
    !isRainConfirmed &&
    (desc.includes("비") || desc.includes("소나기") || desc.includes("뇌우") || desc.includes("강우"))
  const hasSnowForecast = !isSnowConfirmed && desc.includes("눈")

  if (isRainConfirmed) {
    addItem("umbrella-rain-confirmed", "우산", "외출 시간에 비가 내리고 있어요.")
  } else if (hasRainForecast) {
    addItem("umbrella-rain-forecast", "접이식 우산", "외출 시간에 비 예보가 있어요.")
  } else if (isSnowConfirmed) {
    addItem("umbrella-snow-confirmed", "우산", "외출 시간에 눈이 내리고 있어요.")
  } else if (hasSnowForecast) {
    addItem("umbrella-snow-forecast", "접이식 우산", "외출 시간에 눈 예보가 있어요.")
  } else if (isMixedConfirmed) {
    addItem("umbrella-mixed-confirmed", "우산", "외출 시간에 비와 눈이 섞여 내리고 있어요.")
  }

  // 2. 기온별 준비물
  if (temperature < 0) {
    addItem("hot-pack", "핫팩", "영하의 추운 날씨라 주머니에 핫팩을 챙기면 따뜻해요.")
    addItem("gloves", "방한 장갑", "손이 시릴 수 있으니 장갑으로 체온을 보호해 주세요.")
  } else if (temperature < 8) {
    addItem("muffler", "목도리 또는 장갑", "찬 공기에 체온을 유지할 수 있도록 목과 손을 감싸주세요.")
  } else if (temperature < 15) {
    addItem("outerwear", "가벼운 겉옷", "일교차가 커서 쌀쌀할 수 있으니 가볍게 걸칠 옷을 챙기세요.")
  } else if (temperature >= 28) {
    addItem("mini-fan", "휴대용 선풍기 또는 부채", "낮 동안 기온이 높아 더위를 식힐 준비물이 필요해요.")
    addItem("water-bottle", "시원한 생수", "무더운 날씨에 탈수를 막기 위해 수분을 충분히 챙겨주세요.")
  } else if (temperature >= 23) {
    addItem("water-bottle", "물병 (텀블러)", "따뜻한 날씨에 갈증을 달랠 수 있도록 수분을 챙기세요.")
  } else {
    addItem("handkerchief", "손수건", "가벼운 외출 시 휴대하면 위생적이고 유용해요.")
  }

  // 3. 햇빛 및 자외선 (맑은 날)
  const isSunny = desc.includes("맑") || desc.includes("화창")
  if (isSunny) {
    addItem("sunscreen", "자외선 차단제", "맑은 하늘에 햇살이 강하니 피부를 보호해 주세요.")
    if (temperature >= 20) {
      addItem("sunglasses", "선글라스 또는 모자", "강한 햇빛과 눈부심을 가려줘요.")
    }
  }

  // 4. 상황별 맞춤 준비물
  if (cleanSit.includes("면접")) {
    addItem("interview-items", "신분증과 메모지", "면접 일정 확인과 신원 확인에 필요해요.")
  } else if (cleanSit.includes("운동") || cleanSit.includes("러닝") || cleanSit.includes("등산")) {
    addItem("sports-towel", "스포츠 타월", "야외 활동 중 흐르는 땀을 닦는 데 필요해요.")
  } else if (cleanSit.includes("데이트")) {
    addItem("breath-freshener", "구강청결제 또는 민트", "식사 후 상쾌한 에티켓을 지켜줘요.")
  }

  // 5. 기본 준비물 보충 (최소 3개 유지)
  if (items.length < 3) {
    addItem("power-bank", "보조배터리", "외출 중 스마트폰 배터리 방전을 예방할 수 있어요.")
  }
  if (items.length < 3) {
    addItem("lip-balm", "립밤", "건조한 야외 공기로부터 입술을 보호해 주세요.")
  }

  // 최대 5개로 제한
  return items.slice(0, 5)
}
