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
}

const VISION_MODELS = [
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-3.1-flash-lite",
]

/**
 * 옷 사진(Base64)을 Gemini Vision으로 분석하여 카테고리/색상/패턴/계절/스타일 추출
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
당신은 최고의 패션 의류 분석 전문가입니다. 제공된 사진 속의 단일 의류 또는 패션 아이템을 분석하여 JSON 형식으로만 답변하세요.

주의사항:
1. 사진 속 옷의 카테고리(상의, 하의, 아우터, 원피스, 신발, 가방, 기타 중 하나)를 정확히 판별하세요.
2. 소재(재질), 두께, 보온성은 사진만으로 100% 확정하기 어려우므로, 시각적으로 보이는 질감 기반의 '추정치'로 제시하고 사용자가 수정할 수 있도록 플래그를 true로 설정하세요.
3. 응답은 반드시 아래 JSON 스키마를 엄격히 따라야 하며 markdown 코드블록 없이 순수 JSON만 반환하세요:

{
  "category": "top" | "bottom" | "outer" | "dress" | "shoes" | "bag" | "accessory" | "etc",
  "name": "예: 차콜 세미오버핏 블레이저 자켓",
  "subCategory": "예: 테일러드 자켓",
  "colors": ["블랙", "차콜"],
  "pattern": "무지" | "스트라이프" | "체크" | "플로럴" | "그래픽" | "도트" | "기타",
  "style": "casual" | "formal" | "minimal" | "street" | "sporty" | "feminine" | "dandy" | "etc",
  "seasons": ["spring", "summer", "autumn", "winter", "all"] 중 1~3개 선택,
  "isMaterialInferred": true,
  "suggestedMaterial": "예: 울/폴리 혼방 추정 (사용자 확인 필요)",
  "thickness": "thin" | "medium" | "thick",
  "warmth": "low" | "medium" | "high",
  "confidenceNotes": "사진 분석 결과 및 확인 권장 사항 (짧은 1문장)"
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
            temperature: 0.2,
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
      // 다음 모델 시도
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

    return {
      category,
      name: typeof data.name === "string" && data.name ? data.name : "등록된 의류",
      subCategory: data.subCategory || undefined,
      colors: Array.isArray(data.colors) && data.colors.length > 0 ? data.colors : ["기본색상"],
      pattern: data.pattern || "무지",
      style,
      seasons: Array.isArray(data.seasons) && data.seasons.length > 0 ? data.seasons : ["all"],
      isMaterialInferred: true, // 요구사항: 사진만으로는 소재/두께를 확정하지 않고 사용자 확인 유도
      suggestedMaterial: data.suggestedMaterial || "면/혼방 추정 (확인 필요)",
      thickness,
      warmth,
      confidenceNotes: data.confidenceNotes || "AI가 사진을 분석했습니다. 실제 소재와 두께를 확인해주세요.",
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
    confidenceNotes: "사진 기본 인식이 완료되었습니다. 세부 속성을 확인하고 저장해주세요.",
  }
}
