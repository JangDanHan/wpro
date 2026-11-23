import { describe, it, expect } from "vitest"
import { GET } from "@/app/api/regions/route"
import { NextRequest } from "next/server"

describe("Regions Route Handler (/api/regions)", () => {
  it("step=1 요청 시 17개 시·도 목록을 반환한다", async () => {
    const req = new NextRequest("http://localhost:3000/api/regions?step=1")
    const res = await GET(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.list).toBeDefined()
    expect(data.list.length).toBe(17)
    expect(data.list).toContain("서울특별시")
    expect(data.list).toContain("부산광역시")
  })

  it("step=2 요청 시 해당 시·도의 시군구 목록이 가나다순으로 정렬되어 반환된다", async () => {
    const req = new NextRequest("http://localhost:3000/api/regions?step=2&step1=서울특별시")
    const res = await GET(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.list).toBeDefined()
    expect(data.list.length).toBe(25)

    // 가나다순 정렬 검증
    const sorted = [...data.list].sort((a: string, b: string) => a.localeCompare(b, "ko"))
    expect(data.list).toEqual(sorted)
    expect(data.list[0]).toBe("강남구")
    expect(data.list[data.list.length - 1]).toBe("중랑구")
  })

  it("step=3 요청 시 해당 시군구의 읍면동 목록이 가나다순으로 정렬되어 반환된다", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/regions?step=3&step1=서울특별시&step2=종로구",
    )
    const res = await GET(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.list).toBeDefined()
    expect(data.list.length).toBeGreaterThan(0)

    const names = data.list.map((item: any) => item.name)
    const sortedNames = [...names].sort((a: string, b: string) => a.localeCompare(b, "ko"))
    expect(names).toEqual(sortedNames)
  })

  it("query 검색 시 일치하는 지역 목록을 반환한다", async () => {
    const req = new NextRequest("http://localhost:3000/api/regions?query=사직동")
    const res = await GET(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.results).toBeDefined()
    expect(data.results.length).toBeGreaterThanOrEqual(2)
  })

  it("id로 조회 시 해당 지역 단건을 반환한다", async () => {
    const req = new NextRequest("http://localhost:3000/api/regions?id=seoul")
    const res = await GET(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.region).toBeDefined()
    expect(data.region.label).toBe("서울특별시")
    expect(data.region.grid.nx).toBe(60)
  })

  it("파라미터가 없으면 400 에러를 반환한다", async () => {
    const req = new NextRequest("http://localhost:3000/api/regions")
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it("존재하지 않는 id로 조회 시 404 에러를 반환한다", async () => {
    const req = new NextRequest("http://localhost:3000/api/regions?id=invalid-id-xyz")
    const res = await GET(req)
    expect(res.status).toBe(404)
  })
})
