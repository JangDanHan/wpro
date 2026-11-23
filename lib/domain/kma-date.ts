/**
 * 기상청 단기예보 조회서비스 기준 일시 계산 (KST 기준)
 * 초단기실황(getUltraSrtNcst)은 매시 정시 관측 자료가 매시 40분 이후 발표됩니다.
 * 따라서 현재 시각에서 45분을 차감한 시점의 년월일(YYYYMMDD)과 정시(HH00)를 기준 시각으로 삼습니다.
 */
export function getKmaBaseDateTime(nowDate: Date = new Date()): {
  baseDate: string
  baseTime: string
  referenceTimestamp: number
} {
  // 한국 표준시 (UTC+9) Date 생성
  const utc = nowDate.getTime() + nowDate.getTimezoneOffset() * 60000
  const kst = new Date(utc + 9 * 3600000)

  // 45분 전 기준 적용 (정시 40분 이후 발표 보장)
  kst.setMinutes(kst.getMinutes() - 45)

  const year = kst.getFullYear()
  const month = String(kst.getMonth() + 1).padStart(2, "0")
  const date = String(kst.getDate()).padStart(2, "0")
  const hours = String(kst.getHours()).padStart(2, "0")

  const baseDate = `${year}${month}${date}`
  const baseTime = `${hours}00`

  // 관측 기준 시각 타임스탬프 (KST 기준)
  const refDateStr = `${year}-${month}-${date}T${hours}:00:00+09:00`
  const referenceTimestamp = new Date(refDateStr).getTime()

  return { baseDate, baseTime, referenceTimestamp }
}
