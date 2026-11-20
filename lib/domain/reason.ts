import { PrecipitationType } from "./types"

/**
 * PRD F-07. 추천 이유 문장 생성기
 * 정해진 문장에 실제 기온과 확인된 조건을 넣어 정확하게 생성한다.
 */
export function generateReason(
  temperature: number,
  basicOutfit: string,
  precipitation: PrecipitationType,
): string {
  switch (precipitation) {
    case "rain":
      return `현재 ${temperature}℃이고 비가 내려 ${basicOutfit}에 우산과 방수 신발을 함께 추천해요.`
    case "snow":
      return `현재 ${temperature}℃이고 눈이 내려 ${basicOutfit}에 방수·미끄럼 방지를 고려한 신발을 함께 추천해요.`
    case "mixed":
      return `현재 ${temperature}℃이고 비와 눈이 섞여 내려 ${basicOutfit}에 우산과 방수·미끄럼 방지를 고려한 신발을 함께 추천해요.`
    case "none":
      return `현재 기온 ${temperature}℃를 기준으로 ${basicOutfit}을 추천해요.`
    case "unknown":
      return `현재 기온 ${temperature}℃를 기준으로 ${basicOutfit}을 추천해요. 강수 여부는 확인하지 못했어요.`
  }
}
