import { describe, it, expect } from "vitest"
import { POST } from "@/app/api/closet/analyze/route"
import { NextRequest } from "next/server"

describe("AI 옷 사진 분석 API 라우트 (/api/closet/analyze)", () => {
  it("imageBase64가 없으면 400 에러를 반환한다", async () => {
    const req = new NextRequest("http://localhost:3000/api/closet/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain("필요합니다")
  })

  it("유효한 Base64 요청 시 분석 결과와 사용자 확인 필요 플래그(isMaterialInferred: true)를 반환한다", async () => {
    const req = new NextRequest("http://localhost:3000/api/closet/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
        mimeType: "image/jpeg",
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.analysis).toBeDefined()
    expect(json.analysis.isMaterialInferred).toBe(true)
    expect(json.analysis.category).toBeDefined()
    expect(json.analysis.thickness).toBeDefined()
  })
})
