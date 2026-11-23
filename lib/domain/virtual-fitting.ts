import { BodyProfile, ClosetItem, VirtualEditResult } from "@/lib/domain/closet-types"

export const VIRTUAL_FITTING_DISCLAIMER =
  "※ 본 가상 피팅은 체형 아바타를 활용한 색상 및 분위기 시뮬레이션용 참고 미리보기이며, 실제 체형에 따른 정확한 치수나 착용감(핏)을 보증하지 않습니다."

export const DEFAULT_BODY_PROFILE: BodyProfile = {
  userId: "default_user",
  nickname: "나의 아바타",
  height: 172,
  weight: 65,
  bodyType: "standard",
  gender: "unisex",
  skinTone: "light",
  updatedAt: new Date().toISOString(),
}

export const SKIN_TONE_COLORS: Record<BodyProfile["skinTone"], string> = {
  light: "#FDE2D2",
  medium: "#E0B696",
  tan: "#BF916D",
  dark: "#7A4E31",
}

export const COLOR_MAP: Record<string, string> = {
  블랙: "#18181b",
  검정: "#18181b",
  화이트: "#f4f4f5",
  흰색: "#f4f4f5",
  아이보리: "#fef3c7",
  크림: "#fef08a",
  베이지: "#d4b896",
  그레이: "#71717a",
  회색: "#71717a",
  차콜: "#3f3f46",
  네이비: "#1e3a8a",
  블루: "#2563eb",
  파란색: "#2563eb",
  하늘색: "#38bdf8",
  브라운: "#78350f",
  갈색: "#78350f",
  카키: "#57534e",
  올리브: "#4d7c0f",
  그린: "#16a34a",
  초록색: "#16a34a",
  레드: "#dc2626",
  빨간색: "#dc2626",
  핑크: "#f472b6",
  분홍색: "#f472b6",
  옐로우: "#eab308",
  노란색: "#eab308",
  퍼플: "#9333ea",
  보라색: "#9333ea",
}

/**
 * 자연어 옷 편집 요청 처리 (예: "이 티셔츠를 파란색으로 바꿔줘", "소매를 긴팔로 바꿔줘")
 * 원본 옷은 절대 수정하지 않고 가상 편집 결과(VirtualEditResult)를 새로 생성합니다.
 */
export async function applyNaturalLanguageEdit(
  sourceItem: ClosetItem,
  prompt: string,
): Promise<VirtualEditResult> {
  const promptTrimmed = prompt.trim()
  const promptLower = promptTrimmed.toLowerCase()

  // 1. 색상 변경 요청 감지
  let targetColor: string | null = null
  for (const [colorName, hex] of Object.entries(COLOR_MAP)) {
    if (promptTrimmed.includes(colorName)) {
      targetColor = colorName
      break
    }
  }

  // 2. 형태/소매 변경 감지
  let shapeChangeNote = ""
  if (promptTrimmed.includes("긴팔") || promptTrimmed.includes("소매 길게")) {
    shapeChangeNote = "소매 길이: 긴팔 스타일로 조정"
  } else if (promptTrimmed.includes("반팔") || promptTrimmed.includes("소매 짧게")) {
    shapeChangeNote = "소매 길이: 반팔 스타일로 조정"
  } else if (promptTrimmed.includes("루즈핏") || promptTrimmed.includes("오버핏")) {
    shapeChangeNote = "실루엣: 세미오버/루즈핏으로 확장"
  } else if (promptTrimmed.includes("슬림")) {
    shapeChangeNote = "실루엣: 슬림핏으로 조정"
  }

  // 3. 브라우저 캔버스를 통한 시각적 필터 효과 적용 (CSS 필터 또는 HSL 틴트)
  let editedImageUrl = sourceItem.noBgImageUrl || sourceItem.originalImageUrl

  if (typeof window !== "undefined" && targetColor) {
    try {
      const hex = COLOR_MAP[targetColor] || "#2563eb"
      editedImageUrl = await applyColorTintToImage(editedImageUrl, hex)
    } catch {
      // 캔버스 실패 시 원본 이미지 유지
    }
  }

  const diffSummary = [
    targetColor ? `색상: [${sourceItem.colors.join(", ")}] → [${targetColor}] 변경` : null,
    shapeChangeNote || null,
    !targetColor && !shapeChangeNote ? `자연어 스타일링 조정: "${promptTrimmed}" 반영` : null,
  ]
    .filter(Boolean)
    .join(", ")

  return {
    id: `vedit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    sourceItemId: sourceItem.id,
    prompt: promptTrimmed,
    modifiedImageUrl: editedImageUrl,
    diffSummary: diffSummary || "가상 스타일 시뮬레이션 적용",
    createdAt: new Date().toISOString(),
  }
}

/**
 * 캔버스에서 색조(Color Tint)를 부드럽게 입혀 가상 편집 이미지 생성
 */
function applyColorTintToImage(imgSrc: string, tintHex: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      if (!ctx) return resolve(imgSrc)

      // 1. 원본 그리기
      ctx.drawImage(img, 0, 0)

      // 2. 틴트 컬러 오버레이 (color 또는 multiply 모드)
      ctx.globalCompositeOperation = "color"
      ctx.fillStyle = tintHex
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 3. 원본의 투명도 마스크 유지
      ctx.globalCompositeOperation = "destination-in"
      ctx.drawImage(img, 0, 0)

      resolve(canvas.toDataURL("image/png"))
    }
    img.onerror = () => resolve(imgSrc)
    img.src = imgSrc
  })
}
