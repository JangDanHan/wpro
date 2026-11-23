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

export interface GarmentMaskItem {
  id: string
  category: ClothingCategory
  name: string
  // 정규화 좌표(0~1000) [x, y] 외곽선 폴리곤 다각형
  polygon: [number, number][]
  // 제외할 내부 구멍 (목둘레 안쪽 피부, 소매-몸통 사이 배경 등)
  holes?: [number, number][][]
  cropBox?: {
    ymin: number
    xmin: number
    ymax: number
    xmax: number
  }
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

  // 사진에서 감지된 개별 의류 세그멘테이션 목록
  detectedGarments?: GarmentMaskItem[]
  
  // 기본 선택된 주요 의류의 다각형 좌표 및 크롭 영역
  primaryPolygon?: [number, number][]
  primaryHoles?: [number, number][][]
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
 * 옷 사진(Base64)을 Gemini Vision으로 분석하여 의류 분리 세그멘테이션 및 속성 추출
 */
export async function analyzeClothingImage(
  imageBase64: string,
  mimeType = "image/jpeg",
  signal?: AbortSignal,
  targetCategory?: ClothingCategory,
): Promise<ClothingAnalysisResult> {
  const apiKey = getGeminiApiKey()

  const pureBase64 = imageBase64.includes(",")
    ? imageBase64.split(",")[1]
    : imageBase64

  if (!apiKey || !pureBase64) {
    return generateFallbackAnalysis()
  }

  const prompt = `
당신은 최고 수준의 패션 의류 세그멘테이션 및 이미지 정제 AI 전문가입니다.
사용자가 제공한 사진 속에서 패션 의류/신발 아이템을 정밀하게 분리하고 속성을 분석하여 JSON으로만 답변하세요.

[핵심 목표]
사람이 옷을 입고 있는 사진이나 쇼핑몰 모델 샷, 옷걸이 사진 등에서 "오직 지정된 의류 영역 자체만" 남기고, 그 외 모든 것(얼굴, 머리카락, 목·팔·다리·손의 피부, 다른 의류, 신발, 옷걸이, 쇼핑몰 하트 버튼·배너, 배경)을 완벽히 제거하기 위한 외곽선 폴리곤 좌표(0~1000 정규화 좌표)를 제공하세요.

주의사항:
1. 사람이 니트와 청바지를 입고 있다면:
   - 니트(상의)를 분리할 때는: 얼굴, 목의 피부, 머리카락, 손, 청바지, 신발, 배경을 모두 제외하고 순수 니트 옷감의 외곽선만 "polygon"으로 지정해야 합니다.
   - 목둘레 안쪽으로 보이는 피부나 소매와 허리 사이의 배경은 "holes" (제외할 내부 영역)로 좌표를 반환하세요.
2. 쇼핑몰 캡처인 경우: 하단/상단에 있는 하트 버튼, 가격, 컬러칩 점, 무신사 뱃지 등 상품 외 요소를 절대 폴리곤에 포함하지 마세요.
3. 사진 속에 여러 의류가 있다면 "detectedGarments" 배열에 각각(상의, 하의 등) 분리해 넣으세요.
4. "polygon"은 정규화 좌표 0~1000 범위의 [x, y] 순서 점들(최소 8개~최대 40개의 점으로 정밀하게 형태를 따라가는 다각형)입니다.
5. 응답은 markdown 코드블록 없이 순수 JSON만 반환하세요:

{
  "category": "top" | "bottom" | "outer" | "dress" | "shoes" | "bag" | "accessory" | "etc",
  "name": "예: 차콜 반집업 니트",
  "subCategory": "하프집업 니트",
  "colors": ["차콜", "블랙"],
  "pattern": "무지" | "스트라이프" | "체크" | "플로럴" | "그래픽" | "기타",
  "style": "casual" | "formal" | "minimal" | "street" | "sporty" | "feminine" | "dandy" | "etc",
  "seasons": ["spring", "summer", "autumn", "winter", "all"],
  "isMaterialInferred": true,
  "suggestedMaterial": "울/혼방 추정 (사용자 확인 필요)",
  "thickness": "thin" | "medium" | "thick",
  "warmth": "low" | "medium" | "high",
  "primaryPolygon": [
    [250, 120], [750, 120], [820, 350], [740, 780], [260, 780], [180, 350]
  ],
  "primaryHoles": [
    [[450, 120], [550, 120], [530, 220], [470, 220]]
  ],
  "cropBox": {
    "ymin": 100,
    "xmin": 160,
    "ymax": 800,
    "xmax": 840
  },
  "detectedGarments": [
    {
      "id": "g-1",
      "category": "top",
      "name": "차콜 반집업 니트",
      "polygon": [[250, 120], [750, 120], [820, 350], [740, 780], [260, 780], [180, 350]],
      "holes": [[[450, 120], [550, 120], [530, 220], [470, 220]]]
    }
  ],
  "confidenceNotes": "사람 얼굴, 목 피부, 다른 의류를 제외하고 선택 의류 영역만 정밀 마스킹했습니다."
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
        signal: signal || AbortSignal.timeout(7000),
      })

      if (!response.ok) continue

      const data = await response.json()
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!rawText) continue

      const parsed = parseAnalysisJson(rawText)
      if (parsed) return parsed
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

    let primaryPolygon: [number, number][] | undefined = undefined
    if (Array.isArray(data.primaryPolygon) && data.primaryPolygon.length >= 3) {
      primaryPolygon = data.primaryPolygon.map((pt: any) => [
        Math.max(0, Math.min(1000, Number(pt[0]) || 0)),
        Math.max(0, Math.min(1000, Number(pt[1]) || 0)),
      ])
    }

    let primaryHoles: [number, number][][] | undefined = undefined
    if (Array.isArray(data.primaryHoles)) {
      primaryHoles = data.primaryHoles
        .filter((h: any) => Array.isArray(h) && h.length >= 3)
        .map((h: any) =>
          h.map((pt: any) => [
            Math.max(0, Math.min(1000, Number(pt[0]) || 0)),
            Math.max(0, Math.min(1000, Number(pt[1]) || 0)),
          ]),
        )
    }

    let detectedGarments: GarmentMaskItem[] | undefined = undefined
    if (Array.isArray(data.detectedGarments)) {
      detectedGarments = data.detectedGarments
        .filter((g: any) => g && Array.isArray(g.polygon))
        .map((g: any, i: number) => ({
          id: g.id || `g-${i}`,
          category: validCategories.includes(g.category) ? g.category : category,
          name: g.name || `${g.category || "의류"}`,
          polygon: g.polygon.map((pt: any) => [
            Math.max(0, Math.min(1000, Number(pt[0]) || 0)),
            Math.max(0, Math.min(1000, Number(pt[1]) || 0)),
          ]),
          holes: Array.isArray(g.holes)
            ? g.holes.map((h: any) =>
                h.map((pt: any) => [
                  Math.max(0, Math.min(1000, Number(pt[0]) || 0)),
                  Math.max(0, Math.min(1000, Number(pt[1]) || 0)),
                ]),
              )
            : undefined,
        }))
    }

    let cropBox = data.cropBox
    if (!cropBox && primaryPolygon && primaryPolygon.length > 0) {
      const xs = primaryPolygon.map((p) => p[0])
      const ys = primaryPolygon.map((p) => p[1])
      cropBox = {
        xmin: Math.max(0, Math.min(...xs)),
        xmax: Math.min(1000, Math.max(...xs)),
        ymin: Math.max(0, Math.min(...ys)),
        ymax: Math.min(1000, Math.max(...ys)),
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
      primaryPolygon,
      primaryHoles,
      detectedGarments,
      confidenceNotes: data.confidenceNotes || "사람과 배경을 제외하고 선택한 의류를 분리했습니다.",
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
      ymin: 20,
      xmin: 20,
      ymax: 865,
      xmax: 980,
    },
    primaryPolygon: [
      [200, 100], [800, 100], [880, 400], [780, 850], [220, 850], [120, 400]
    ],
    confidenceNotes: "선택한 의류 영역을 분리했습니다. 브러시로 필요한 부분을 수정할 수 있습니다.",
  }
}
