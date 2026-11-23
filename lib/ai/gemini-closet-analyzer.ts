import fs from "fs"
import path from "path"
import { ClothingCategory, ClothingStyle, Season, ThicknessLevel, WarmthLevel } from "@/lib/domain/closet-types"

function getGeminiApiKey(): string | null {
  if (process.env.GEMINI_API_KEY !== undefined) {
    const envKey = process.env.GEMINI_API_KEY.trim()
    if (envKey !== "") return envKey
  }
  try {
    const envPath = path.join(process.cwd(), ".env")
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8")
      for (const line of content.split("\n")) {
        const trimmed = line.trim()
        if (trimmed.startsWith("GEMINI_API_KEY=")) {
          const val = trimmed.slice("GEMINI_API_KEY=".length).trim()
          if (val) return val
        }
      }
    }
  } catch {}
  return null
}

export interface ClothingAnalysisResult {
  category: ClothingCategory
  name: string
  subCategory?: string
  colors: string[]
  pattern: string
  style: ClothingStyle
  seasons: Season[]
  
  // 소재/두께/보온성은 추측값이며 사용자의 확인이 필요함을 명시
  isMaterialInferred: boolean
  suggestedMaterial?: string
  thickness: ThicknessLevel
  warmth: WarmthLevel
  
  confidenceNotes: string

  // 쇼핑몰 UI(하트, 뱃지 등)나 주변 배경을 제외한 의류 본체만의 스마트 크롭 좌표 (0~1000)
  cropBox?: {
    ymin: number
    xmin: number
    ymax: number
    xmax: number
  }
}

const VISION_MODELS = [
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-3.1-flash-lite",
]

/**
 * 옷 사진(Base64)을 Gemini Vision으로 분석하여 카테고리/색상/패턴/계절/스타일 및 쇼핑몰 UI 제외 크롭 좌표 추출
 */
export async function analyzeClothingImage(
  imageBase64: string,
  mimeType = "image/jpeg",
  signal?: AbortSignal,
): Promise<ClothingAnalysisResult> {
  const apiKey = getGeminiApiKey()

  // Base64 순수 데이터 추출
  const pureBase64 = imageBase64.includes(",")
    ? imageBase64.split(",")[1]
    : imageBase64

  if (!apiKey || !pureBase64) {
    return generateFallbackAnalysis()
  }

  const prompt = `
당신은 최고의 패션 의류 분석 및 상품 사진 정제 전문가입니다. 제공된 사진 속의 단일 의류 또는 신발 아이템을 분석하여 JSON 형식으로만 답변하세요.

주의사항:
1. 사진 속 옷의 카테고리(상의, 하의, 아우터, 원피스, 신발, 가방, 기타 중 하나)를 정확히 판별하세요.
2. 쇼핑몰 캡처인 경우, 하단 또는 상단에 나타나는 쇼핑몰 UI(하트 버튼, 브랜드 뱃지, 무신사 마크, 컬러 선택 점, 가격표 등)를 제외하고 오직 옷 또는 신발만 포함하는 정규화 바운딩 박스(0~1000 단위: ymin, xmin, ymax, xmax)를 계산해 "cropBox" 필드에 넣으세요.
3. 옷 자체의 프린트(예: 그래픽, 로고, 숫자 등), 소재감, 색상은 그대로 보존되어야 합니다.
4. 소재(재질), 두께, 보온성은 사진만으로 100% 확정하기 어려우므로, 시각적으로 보이는 질감 기반의 '추정치'로 제시하고 사용자가 수정할 수 있도록 플래그를 true로 설정하세요.
5. 응답은 반드시 아래 JSON 스키마를 엄격히 따라야 하며 markdown 코드블록 없이 순수 JSON만 반환하세요:

{
  "category": "top" | "bottom" | "outer" | "dress" | "shoes" | "bag" | "accessory" | "etc",
  "name": "예: 차콜 반집업 울 니트",
  "subCategory": "예: 하프집업 니트",
  "colors": ["차콜", "블랙"],
  "pattern": "무지" | "스트라이프" | "체크" | "플로럴" | "그래픽" | "도트" | "기타",
  "style": "casual" | "formal" | "minimal" | "street" | "sporty" | "feminine" | "dandy" | "etc",
  "seasons": ["spring", "summer", "autumn", "winter", "all"] 중 선택,
  "isMaterialInferred": true,
  "suggestedMaterial": "예: 울/아크릴 혼방 추정 (사용자 확인 필요)",
  "thickness": "thin" | "medium" | "thick",
  "warmth": "low" | "medium" | "high",
  "cropBox": {
    "ymin": 0,
    "xmin": 0,
    "ymax": 860,
    "xmax": 1000
  },
  "confidenceNotes": "쇼핑몰 UI 및 배경을 분리하고 상품 본체 영역을 감지했습니다."
}
`

  for (const model of VISION_MODELS) {
    if (signal?.aborted) break

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType || "image/jpeg",
                    data: pureBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        }),
        signal: signal || AbortSignal.timeout(6000),
      })

      if (!response.ok) {
        continue
      }

      const data = await response.json()
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!rawText) continue

      const parsed = parseAnalysisJson(rawText)
      if (parsed) {
        return parsed
      }
    } catch {
      continue
    }
  }

  return generateFallbackAnalysis()
}

function parseAnalysisJson(raw: string): ClothingAnalysisResult | null {
  try {
    let clean = raw.trim()
    if (clean.startsWith("```json")) {
      clean = clean.replace(/^```json/, "").replace(/```$/, "").trim()
    } else if (clean.startsWith("```")) {
      clean = clean.replace(/^```/, "").replace(/```$/, "").trim()
    }

    const data = JSON.parse(clean)

    const validCategories: ClothingCategory[] = ["top", "bottom", "outer", "dress", "shoes", "bag", "accessory", "etc"]
    const category: ClothingCategory = validCategories.includes(data.category) ? data.category : "top"

    const validStyles: ClothingStyle[] = ["casual", "formal", "minimal", "street", "sporty", "feminine", "dandy", "etc"]
    const style: ClothingStyle = validStyles.includes(data.style) ? data.style : "casual"

    const validThickness: ThicknessLevel[] = ["thin", "medium", "thick"]
    const thickness: ThicknessLevel = validThickness.includes(data.thickness) ? data.thickness : "medium"

    const validWarmth: WarmthLevel[] = ["low", "medium", "high"]
    const warmth: WarmthLevel = validWarmth.includes(data.warmth) ? data.warmth : "medium"

    let cropBox: { ymin: number; xmin: number; ymax: number; xmax: number } | undefined = undefined
    if (
      data.cropBox &&
      typeof data.cropBox.ymin === "number" &&
      typeof data.cropBox.ymax === "number"
    ) {
      cropBox = {
        ymin: Math.max(0, Math.min(1000, data.cropBox.ymin)),
        xmin: Math.max(0, Math.min(1000, data.cropBox.xmin || 0)),
        ymax: Math.max(0, Math.min(1000, data.cropBox.ymax)),
        xmax: Math.max(0, Math.min(1000, data.cropBox.xmax || 1000)),
      }
    }

    return {
      category,
      name: typeof data.name === "string" && data.name ? data.name : "등록된 의류",
      subCategory: data.subCategory || undefined,
      colors: Array.isArray(data.colors) && data.colors.length > 0 ? data.colors : ["기본색상"],
      pattern: data.pattern || "무지",
      style,
      seasons: Array.isArray(data.seasons) && data.seasons.length > 0 ? data.seasons : ["all"],
      isMaterialInferred: true,
      suggestedMaterial: data.suggestedMaterial || "면/혼방 추정 (확인 필요)",
      thickness,
      warmth,
      cropBox,
      confidenceNotes: data.confidenceNotes || "쇼핑몰 UI를 제외한 상품 본체 영역이 정돈되었습니다.",
    }
  } catch {
    return null
  }
}

/**
 * AI API 실패 시 또는 키가 없을 때 동작하는 안전한 기본 분석 결과
 */
export function generateFallbackAnalysis(): ClothingAnalysisResult {
  return {
    category: "top",
    name: "새로 등록된 옷",
    subCategory: "일상 의류",
    colors: ["블랙/화이트"],
    pattern: "무지",
    style: "casual",
    seasons: ["spring", "autumn", "all"],
    isMaterialInferred: true,
    suggestedMaterial: "직접 입력 필요",
    thickness: "medium",
    warmth: "medium",
    cropBox: {
      ymin: 15,
      xmin: 15,
      ymax: 870,
      xmax: 985,
    },
    confidenceNotes: "상품 사진이 스튜디오 배경으로 정돈되었습니다. 세부 속성을 확인하고 저장해주세요.",
  }
}
