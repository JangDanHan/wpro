import { ProductItem } from "@/lib/domain/types"

export type MusinsaSnapStyle = "casual" | "formal" | "comfort" | "street" | "minimal"

export interface MusinsaSnapPost {
  id: string
  snapId: string
  postUrl: string // 원문 링크
  title: string
  clothingItems: string // 구성: 아우터 + 상의 + 하의 + 신발
  description: string // 오늘 날씨와 일정에 어울리는 구체적 이유
  style: MusinsaSnapStyle
  styleName: "캐주얼" | "단정한 스타일" | "편한 스타일"
  tempMin: number
  tempMax: number
  suitableWeather?: Array<"any" | "rain" | "snow" | "clear" | "cloudy" | "wind">
  situationTags: string[]
  productItems: ProductItem[] // 보드에 배치될 단독 상품 셋 (외투, 상의, 하의, 신발)
}

export const TARGET_MUSINSA_PROFILE_URL = "https://www.musinsa.com/snap/profile/1234627203913810064"

/**
 * 날씨 맞춤 코디 카탈로그 (Flat Lay 단독 상품 기반)
 * - 사람, 모델, 옷걸이 없는 순수 단독 상품 사진 매핑
 * - 쇼핑몰 배지, 하트 아이콘 등 화면 요소 배제
 * - 의류 명칭과 사진 100% 일치
 */
export const MUSINSA_SNAP_POSTS: MusinsaSnapPost[] = [
  // 1. [겨울 캐주얼 데일리 룩] - 영하 혹한기 및 한겨울
  {
    id: "outfit-winter-casual-01",
    snapId: "winter-cas-01",
    postUrl: TARGET_MUSINSA_PROFILE_URL,
    title: "헤비 숏패딩 & 차콜 하프집업 데님 코디",
    clothingItems: "블랙 볼륨 숏패딩 + 차콜 반집업 니트 + 연청 와이드 데님 + 블랙 패딩 슬리퍼",
    description: "영하의 찬 공기를 차단하는 볼륨감 있는 블랙 숏패딩에 보온성 좋은 차콜 하프집업 니트와 활동성 높은 와이드 데님, 발끝 체온을 지켜주는 패딩 슬리퍼로 연출한 따뜻한 겨울 데일리 코디입니다.",
    style: "casual",
    styleName: "캐주얼",
    tempMin: -50,
    tempMax: 4,
    suitableWeather: ["any", "snow", "wind"],
    situationTags: ["데일리", "데이트", "주말외출", "대학생"],
    productItems: [
      {
        id: "prod-outer-puffer",
        category: "outer",
        categoryLabel: "외투",
        name: "블랙 볼륨 숏다운 푸퍼",
        photoUrl: "/images/products/black-puffer.jpg",
        material: "덕다운 80/20, 방풍 나일론",
        thickness: "두꺼움 (헤비)",
        description: "찬바람을 차단하는 넥라인 스탠드 칼라와 풍성한 볼륨감의 숏패딩",
      },
      {
        id: "prod-top-knit",
        category: "top",
        categoryLabel: "상의",
        name: "차콜 반집업 울 니트",
        photoUrl: "/images/products/charcoal-knit.png",
        material: "울 혼방 니트웨어",
        thickness: "도톰한 두께감",
        description: "지퍼 오픈 시 자연스러운 레이어링이 연출되는 클래식 하프집업",
      },
      {
        id: "prod-bottom-denim",
        category: "bottom",
        categoryLabel: "하의",
        name: "연청 와이드 데님 팬츠",
        photoUrl: "/images/products/wide-denim.png",
        material: "헤비 온스 코튼 100%",
        thickness: "두꺼움",
        description: "자연스러운 워싱감이 돋보이는 루즈 와이드 핏 스트레이트 진",
      },
      {
        id: "prod-shoes-slippers",
        category: "shoes",
        categoryLabel: "신발",
        name: "블랙 퀼팅 패딩 슬리퍼",
        photoUrl: "/images/products/padded-slippers.png",
        material: "패딩 충전재, 논슬립 아웃솔",
        thickness: "방한용",
        description: "발끝 보온을 극대화한 포근한 퀼팅 패딩 뮬 슈즈",
      },
    ],
  },

  // 2. [겨울 편한 원마일 이지웨어] - 영하/초겨울 편한 스타일
  {
    id: "outfit-winter-comfort-02",
    snapId: "winter-comf-02",
    postUrl: TARGET_MUSINSA_PROFILE_URL,
    title: "숏패딩 & 벌룬 스웨트팬츠 이지 룩",
    clothingItems: "블랙 볼륨 숏패딩 + 차콜 반집업 니트 + 블랙 벌룬 스웨트팬츠 + 블랙 패딩 슬리퍼",
    description: "한겨울 일상이나 동네 산책, 편안한 약속에 어울리는 포근한 반집업 니트와 여유로운 벌룬 실루엣 스웨트팬츠, 방한 슬리퍼 조합으로 편안함과 보온성을 모두 챙긴 룩입니다.",
    style: "comfort",
    styleName: "편한 스타일",
    tempMin: -50,
    tempMax: 6,
    suitableWeather: ["any", "snow"],
    situationTags: ["동네 산책", "카페", "원마일웨어", "운동", "편한 약속"],
    productItems: [
      {
        id: "prod-outer-puffer-comf",
        category: "outer",
        categoryLabel: "외투",
        name: "블랙 볼륨 숏다운 푸퍼",
        photoUrl: "/images/products/black-puffer.jpg",
        material: "덕다운 충전재, 매트 나일론",
        thickness: "두꺼움",
        description: "가볍고 따뜻하게 걸치기 좋은 오버핏 푸퍼 점퍼",
      },
      {
        id: "prod-top-knit-comf",
        category: "top",
        categoryLabel: "상의",
        name: "차콜 반집업 울 니트",
        photoUrl: "/images/products/charcoal-knit.png",
        material: "울 혼방",
        thickness: "도톰한 두께감",
        description: "실내외 어디서든 입기 좋은 편안한 하프집업 니트",
      },
      {
        id: "prod-bottom-balloon",
        category: "bottom",
        categoryLabel: "하의",
        name: "블랙 33 벌룬 스웨트팬츠",
        photoUrl: "/images/products/balloon-pants.png",
        material: "헤비웨이트 코튼 혼방",
        thickness: "두꺼움",
        description: "풍성한 벌룬 실루엣과 스트릿한 무드를 더해주는 조거 팬츠",
      },
      {
        id: "prod-shoes-slippers-comf",
        category: "shoes",
        categoryLabel: "신발",
        name: "블랙 퀼팅 패딩 슬리퍼",
        photoUrl: "/images/products/padded-slippers.png",
        material: "패딩 충전재, 파일 라이닝",
        thickness: "방한용",
        description: "푹신한 쿠션감과 뛰어난 보온성을 제공하는 룸/아웃도어 슬립온",
      },
    ],
  },

  // 3. [초겨울/늦가을 단정한 출근 룩] - 0℃ ~ 8℃ 단정한 스타일
  {
    id: "outfit-winter-formal-03",
    snapId: "winter-form-03",
    postUrl: TARGET_MUSINSA_PROFILE_URL,
    title: "차콜 울 롱코트 & 클래식 셔츠 포멀 룩",
    clothingItems: "차콜 울 롱코트 + 화이트 옥스포드 셔츠 + 연청 와이드 데님 + 블랙 첼시부츠",
    description: "겨울철 출근길이나 비즈니스 미팅, 격식 있는 자리에 신뢰감을 주는 단정한 차콜 울 싱글 코트와 정갈한 옥스포드 셔츠, 세련된 가죽 첼시부츠의 조화로운 조합입니다.",
    style: "formal",
    styleName: "단정한 스타일",
    tempMin: 0,
    tempMax: 9,
    suitableWeather: ["clear", "cloudy"],
    situationTags: ["출근", "면접", "비즈니스", "결혼식", "격식있는 자리"],
    productItems: [
      {
        id: "prod-outer-coat",
        category: "outer",
        categoryLabel: "외투",
        name: "차콜 울 싱글 롱코트",
        photoUrl: "/images/products/wool-coat.jpg",
        material: "울 80%, 나일론 20%",
        thickness: "두꺼움 (겨울용)",
        description: "단정한 노치드 라펠과 매끄러운 실루엣의 프리미엄 울 롱코트",
      },
      {
        id: "prod-top-shirt",
        category: "top",
        categoryLabel: "상의",
        name: "화이트 옥스포드 코튼 셔츠",
        photoUrl: "/images/products/white-shirt.jpg",
        material: "코튼 100%",
        thickness: "보통",
        description: "버튼다운 칼라와 탄탄한 원단감이 돋보이는 클래식 드레스 셔츠",
      },
      {
        id: "prod-bottom-denim-form",
        category: "bottom",
        categoryLabel: "하의",
        name: "연청 와이드 데님 팬츠",
        photoUrl: "/images/products/wide-denim.png",
        material: "코튼 100%",
        thickness: "도톰함",
        description: "클린한 실루엣으로 코트와 믹스매치하기 좋은 와이드 진",
      },
      {
        id: "prod-shoes-chelsea",
        category: "shoes",
        categoryLabel: "신발",
        name: "블랙 스무스 레더 첼시부츠",
        photoUrl: "/images/products/chelsea-boots.jpg",
        material: "소가죽, 사이드 엘라스틱 밴드",
        thickness: "단단함",
        description: "발목 라인을 매끄럽게 잡아주며 포멀한 인상을 완성하는 첼시부츠",
      },
    ],
  },

  // 4. [간절기 캐주얼 룩] - 9℃ ~ 17℃ 캐주얼
  {
    id: "outfit-spring-casual-04",
    snapId: "spring-cas-04",
    postUrl: TARGET_MUSINSA_PROFILE_URL,
    title: "울 코트 & 차콜 하프집업 스니커즈 룩",
    clothingItems: "차콜 울 싱글 롱코트 + 차콜 반집업 니트 + 연청 와이드 데님 + 화이트 독일군 스니커즈",
    description: "아침저녁 일교차가 큰 간절기 날씨에 가볍게 걸칠 수 있는 울 코트에 반집업 니트와 산뜻한 연청 데님, 캐주얼한 독일군 스니커즈를 매치해 경쾌하면서도 단정한 봄·가을 룩입니다.",
    style: "casual",
    styleName: "캐주얼",
    tempMin: 9,
    tempMax: 18,
    suitableWeather: ["clear", "cloudy"],
    situationTags: ["캠퍼스", "데일리", "데이트", "여행", "주말"],
    productItems: [
      {
        id: "prod-outer-coat-cas",
        category: "outer",
        categoryLabel: "외투",
        name: "차콜 울 싱글 롱코트",
        photoUrl: "/images/products/wool-coat.jpg",
        material: "울 혼방",
        thickness: "간절기~초겨울용",
        description: "멋스러운 롱 기장으로 분위기 있는 연출이 가능한 코트",
      },
      {
        id: "prod-top-knit-cas",
        category: "top",
        categoryLabel: "상의",
        name: "차콜 반집업 울 니트",
        photoUrl: "/images/products/charcoal-knit.png",
        material: "울 혼방",
        thickness: "도톰한 두께감",
        description: "편안하면서도 깔끔한 실루엣의 데일리 니트",
      },
      {
        id: "prod-bottom-denim-cas",
        category: "bottom",
        categoryLabel: "하의",
        name: "연청 와이드 데님 팬츠",
        photoUrl: "/images/products/wide-denim.png",
        material: "코튼 100%",
        thickness: "보통",
        description: "어떤 코디에도 자연스럽게 어울리는 베이직 와이드 진",
      },
      {
        id: "prod-shoes-gat",
        category: "shoes",
        categoryLabel: "신발",
        name: "화이트 독일군 레더 스니커즈",
        photoUrl: "/images/products/gat-sneakers.jpg",
        material: "가죽 & 스웨이드 배색, 고무창",
        thickness: "보통",
        description: "클래식한 배색과 뛰어난 착화감의 필수 데일리 슈즈",
      },
    ],
  },

  // 5. [온화한 봄/가을 스마트 캐주얼 룩] - 18℃ ~ 25℃
  {
    id: "outfit-mild-smart-05",
    snapId: "mild-smart-05",
    postUrl: TARGET_MUSINSA_PROFILE_URL,
    title: "화이트 옥스포드 셔츠 & 데님 스니커즈 룩",
    clothingItems: "화이트 옥스포드 셔츠 + 연청 와이드 데님 + 화이트 독일군 스니커즈",
    description: "쾌적하고 따뜻한 날씨에 별도의 외투 없이 단독으로 입기 좋은 깨끗한 화이트 옥스포드 셔츠와 와이드 데님, 독일군 스니커즈의 미니멀 스마트 캐주얼 조합입니다.",
    style: "formal",
    styleName: "단정한 스타일",
    tempMin: 18,
    tempMax: 27,
    suitableWeather: ["clear", "cloudy"],
    situationTags: ["출근", "데이트", "카페", "주말나들이"],
    productItems: [
      {
        id: "prod-top-shirt-mild",
        category: "top",
        categoryLabel: "상의",
        name: "화이트 옥스포드 코튼 셔츠",
        photoUrl: "/images/products/white-shirt.jpg",
        material: "코튼 100%",
        thickness: "보통",
        description: "단정하고 깨끗한 인상을 주는 기본 화이트 셔츠",
      },
      {
        id: "prod-bottom-denim-mild",
        category: "bottom",
        categoryLabel: "하의",
        name: "연청 와이드 데님 팬츠",
        photoUrl: "/images/products/wide-denim.png",
        material: "코튼 100%",
        thickness: "보통",
        description: "여유로운 핏으로 쾌적한 착용감을 주는 데님",
      },
      {
        id: "prod-shoes-gat-mild",
        category: "shoes",
        categoryLabel: "신발",
        name: "화이트 독일군 레더 스니커즈",
        photoUrl: "/images/products/gat-sneakers.jpg",
        material: "천연 가죽 & 고무창",
        thickness: "보통",
        description: "가볍고 산뜻한 발걸음을 완성하는 스니커즈",
      },
    ],
  },
]

/**
 * 기온 및 상황에 따른 코디 보드 추천 선택 함수
 */
export function getMusinsaSnapRecommendations(
  temperature: number,
  situation?: string | null,
  precipitationType?: "rain" | "snow" | "mixed" | "none" | "unknown",
): {
  primary: MusinsaSnapPost
  alternatives: MusinsaSnapPost[]
} {
  const isRainingOrSnowing =
    precipitationType === "rain" ||
    precipitationType === "snow" ||
    precipitationType === "mixed"

  const scoredPosts = MUSINSA_SNAP_POSTS.map((post) => {
    let score = 0

    // (A) 기온 적합도
    if (temperature >= post.tempMin && temperature < post.tempMax) {
      score += 100
      const mid = (post.tempMin + post.tempMax) / 2
      score -= Math.abs(temperature - mid) * 2
    } else {
      const dist =
        temperature < post.tempMin
          ? post.tempMin - temperature
          : temperature - post.tempMax
      score -= dist * 20
    }

    // (B) 강수(비/눈) 조건
    if (isRainingOrSnowing) {
      if (post.suitableWeather?.includes("snow") || post.suitableWeather?.includes("rain")) {
        score += 30
      }
    }

    // (C) 사용자 상황 키워드 매칭
    if (situation && situation.trim() !== "") {
      const lowerSit = situation.toLowerCase()
      for (const tag of post.situationTags) {
        if (lowerSit.includes(tag.toLowerCase())) {
          score += 35
        }
      }
      if (lowerSit.includes("출근") || lowerSit.includes("면접") || lowerSit.includes("격식")) {
        if (post.style === "formal") score += 40
      }
      if (lowerSit.includes("운동") || lowerSit.includes("산책") || lowerSit.includes("편한")) {
        if (post.style === "comfort") score += 40
      }
      if (lowerSit.includes("데이트") || lowerSit.includes("친구") || lowerSit.includes("모임")) {
        if (post.style === "casual") score += 30
      }
    }

    return { post, score }
  })

  scoredPosts.sort((a, b) => b.score - a.score)

  const primary = scoredPosts[0].post
  const alternatives = scoredPosts
    .slice(1)
    .map((s) => s.post)
    .filter((p) => p.id !== primary.id)

  return {
    primary,
    alternatives,
  }
}
