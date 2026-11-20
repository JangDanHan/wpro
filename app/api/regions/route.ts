import { NextRequest, NextResponse } from "next/server"
import {
  getStep1List,
  getStep2List,
  getStep3List,
  searchKmaRegions,
  findKmaRegionById,
} from "@/lib/domain/regions"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")
  const step = searchParams.get("step")
  const step1 = searchParams.get("step1")
  const step2 = searchParams.get("step2")
  const id = searchParams.get("id")

  try {
    // 1. ID로 특정 지역 단건 조회
    if (id) {
      const item = findKmaRegionById(id)
      if (!item) {
        return NextResponse.json({ error: "존재하지 않는 지역입니다." }, { status: 404 })
      }
      return NextResponse.json({ region: item })
    }

    // 2. 통합 검색 쿼리
    if (query && query.trim().length > 0) {
      const results = searchKmaRegions(query, 25).map((r) => ({
        value: r.value,
        label: r.label,
        nx: r.grid.nx,
        ny: r.grid.ny,
      }))
      return NextResponse.json({ results })
    }

    // 3. 계층형 단계별 조회
    if (step === "1") {
      const list = getStep1List()
      return NextResponse.json({ list })
    }

    if (step === "2" && step1) {
      const list = getStep2List(step1)
      return NextResponse.json({ list })
    }

    if (step === "3" && step1) {
      const list = getStep3List(step1, step2 || undefined)
      return NextResponse.json({ list })
    }

    return NextResponse.json(
      { error: "올바른 요청 파라미터(step, query, id)를 제공해 주세요." },
      { status: 400 },
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: "지역 데이터 조회 실패: " + error.message },
      { status: 500 },
    )
  }
}
