import { ProductItem } from "@/lib/domain/types"

export type MusinsaSnapStyle = "casual" | "formal" | "comfort" | "street" | "minimal"

export interface MusinsaSnapPost {
  id: string
  snapId: string
  postUrl: string // 원문 링크
  title: string
  clothingItems: string // 구성: 상의 + 하의 + 신발 (+ 외투 / 소품)
  description: string // 오늘 날씨와 일정에 어울리는 구체적 이유
  style: MusinsaSnapStyle
  styleName: "캐주얼" | "단정한 스타일" | "편한 스타일"
  tempMin: number
  tempMax: number
  suitableWeather?: Array<"any" | "rain" | "snow" | "clear" | "cloudy" | "wind">
  situationTags: string[]
  productItems: ProductItem[] // 콜라주에 배치되는 누끼 상품 셋 (1:1 매칭)
}

export const TARGET_MUSINSA_PROFILE_URL = "https://www.musinsa.com/snap/profile/1234627203913810064"

/**
 * 날씨 맞춤 패션 코디 콜라주 카탈로그
 * - 흰 배경 캔버스 위에 누끼 처리된 단독 상품들을 배치한 패션 콜라주
 * - 사진과 카테고리·상품명 1:1 불변 매칭
 * - 사람, 모델, 옷걸이, 쇼핑몰 배지, 흰 사각형 가림 흔적 전면 배제
 */
export const MUSINSA_SNAP_POSTS: MusinsaSnapPost[] = [
  // 1. [사용자 참고 2번 이미지 완벽 구현] 블랙 골지 니트 & 와이드 데님 타비 로퍼 콜라주
  {
    id: "outfit-collage-vintage-black",
    snapId: "collage-black-01",
    postUrl: TARGET_MUSINSA_PROFILE_URL,
    title: "블랙 골지 니트 & 와이드 데님 타비 로퍼 콜라주",
    clothingItems: "모자: NY 베레모 · 상의: 블랙 골지 니트 · 하의: 다크 와이드 데님 · 신발: 타비 로퍼 · 가방: 레더 토트백 · 소품: 안경 & D버클 벨트 & 레더 워치",
    description: "선선하고 활동하기 좋은 봄·가을 날씨나 실내 약속에 세련된 무드를 완성하는 블랙 골지 하이넥 니트와 다크 인디고 와이드 데님, 유니크한 타비 로퍼와 클래식 레더 액세서리의 감각적인 풀세트 콜라주입니다.",
    style: "casual",
    styleName: "캐주얼",
    tempMin: 8,
    tempMax: 20,
    suitableWeather: ["clear", "cloudy"],
    situationTags: ["데일리", "데이트", "전시회", "카페", "주말나들이"],
    productItems: [
      {
        id: "prod-top-black-knit",
        category: "top",
        categoryLabel: "상의",
        name: "블랙 골지 하이넥 니트 풀오버",
        photoUrl: "/images/collage/black-knit.png",
        material: "메리노울 100%",
        description: "포근한 골지 짜임과 안정감 있는 넥라인의 미니멀 하이넥 니트",
        collageStyle: { top: "14%", left: "1%", width: "58%", zIndex: 20 },
      },
      {
        id: "prod-bottom-dark-denim",
        category: "bottom",
        categoryLabel: "하의",
        name: "체크 포켓 와이드 다크 데님 팬츠",
        photoUrl: "/images/collage/dark-denim.png",
        material: "13.5온스 코튼 데님",
        description: "포켓 부분의 타탄 체크 배색과 묵직하게 떨어지는 와이드 실루엣 진",
        collageStyle: { top: "48%", left: "1%", width: "55%", zIndex: 15 },
      },
      {
        id: "prod-shoes-tabi-loafers",
        category: "shoes",
        categoryLabel: "신발",
        name: "다크그린 타비 레더 로퍼",
        photoUrl: "/images/collage/tabi-loafers.png",
        material: "천연 카프스킨 가죽",
        description: "발끝의 시그니처 타비 스플릿 디테일과 오묘한 그린 레더의 슈즈",
        collageStyle: { top: "67%", right: "2%", width: "45%", zIndex: 25 },
      },
      {
        id: "prod-headwear-beret",
        category: "headwear",
        categoryLabel: "모자",
        name: "네이비 NY 자수 울 베레모",
        photoUrl: "/images/collage/beret.png",
        material: "울 100%",
        description: "클래식한 각을 잡아주며 룩에 프렌치 감성을 더하는 베레모",
        collageStyle: { top: "2%", left: "9%", width: "42%", zIndex: 22 },
      },
      {
        id: "prod-bag-leather-tote",
        category: "bag",
        categoryLabel: "가방",
        name: "빈티지 블랙 레더 토트백",
        photoUrl: "/images/collage/leather-bag.png",
        material: "워시드 소가죽",
        description: "자연스러운 에이징 텍스처와 실용적인 수납력을 갖춘 레더 백",
        collageStyle: { top: "35%", right: "2%", width: "40%", zIndex: 20 },
      },
      {
        id: "prod-acc-glasses",
        category: "accessory",
        categoryLabel: "소품",
        name: "블랙 프레임 스퀘어 안경",
        photoUrl: "/images/collage/glasses.png",
        material: "아세테이트 & 실버 힌지",
        description: "지적인 인상을 연출해 주는 웰링턴 쉐입의 뿔테 안경",
        collageStyle: { top: "8%", right: "4%", width: "40%", zIndex: 25 },
      },
      {
        id: "prod-acc-belt",
        category: "accessory",
        categoryLabel: "소품",
        name: "다크브라운 레더 D 버클 벨트",
        photoUrl: "/images/collage/belt.png",
        material: "통가죽 & 메탈 버클",
        description: "팬츠 허리 라인에 감각적인 포인트를 완성하는 레더 벨트",
        collageStyle: { top: "22%", right: "5%", width: "35%", zIndex: 20 },
      },
      {
        id: "prod-acc-watch",
        category: "accessory",
        categoryLabel: "소품",
        name: "클래식 스퀘어 레더 워치",
        photoUrl: "/images/collage/watch.png",
        material: "스테인리스 스틸 & 레더 스트랩",
        description: "단정하고 포멀한 분위기를 주는 로만 인덱스 스퀘어 손목시계",
        collageStyle: { top: "47%", left: "50%", width: "13%", zIndex: 25 },
      },
    ],
  },

  // 2. [사용자 제공 실제 상품 4종 100% 매칭] 숏패딩 & 차콜 니트 와이드 데님 패딩 슈즈 코디
  {
    id: "outfit-winter-casual-denim",
    snapId: "winter-cas-02",
    postUrl: TARGET_MUSINSA_PROFILE_URL,
    title: "블랙 숏패딩 & 차콜 하프집업 와이드 데님 코디",
    clothingItems: "외투: 블랙 숏패딩 · 상의: 차콜 반집업 니트 · 하의: 연청 와이드 데님 · 신발: 패딩 슬리퍼",
    description: "영하 기온의 추운 날씨에 찬바람을 완벽 차단하는 볼륨감 있는 블랙 숏패딩과 포근한 차콜 반집업 니트, 편안한 핏의 연청 와이드 데님, 발끝 체온을 지켜주는 패딩 슬리퍼의 완벽한 겨울 데일리 코디입니다.",
    style: "casual",
    styleName: "캐주얼",
    tempMin: -50,
    tempMax: 5,
    suitableWeather: ["any", "snow", "wind"],
    situationTags: ["데일리", "데이트", "주말외출", "대학생"],
    productItems: [
      {
        id: "prod-outer-black-puffer",
        category: "outer",
        categoryLabel: "외투",
        name: "블랙 볼륨 숏다운 푸퍼",
        photoUrl: "/images/products/black-puffer.jpg",
        material: "덕다운 80/20, 방풍 매트 쉘",
        description: "찬바람을 차단하는 넥라인 스탠드 칼라와 풍성한 볼륨감의 숏패딩",
        collageStyle: { top: "6%", right: "4%", width: "48%", zIndex: 18 },
      },
      {
        id: "prod-top-charcoal-knit",
        category: "top",
        categoryLabel: "상의",
        name: "차콜 반집업 울 니트",
        photoUrl: "/images/products/charcoal-knit.png",
        material: "울 혼방 니트웨어",
        description: "지퍼 오픈 시 자연스러운 레이어링이 연출되는 클래식 하프집업",
        collageStyle: { top: "12%", left: "4%", width: "52%", zIndex: 22 },
      },
      {
        id: "prod-bottom-wide-denim",
        category: "bottom",
        categoryLabel: "하의",
        name: "연청 와이드 데님 팬츠",
        photoUrl: "/images/products/wide-denim.png",
        material: "헤비 온스 코튼 100%",
        description: "자연스러운 워싱감이 돋보이는 루즈 와이드 핏 스트레이트 진",
        collageStyle: { top: "48%", left: "3%", width: "52%", zIndex: 15 },
      },
      {
        id: "prod-shoes-padded-slippers",
        category: "shoes",
        categoryLabel: "신발",
        name: "블랙 퀼팅 패딩 슬리퍼",
        photoUrl: "/images/products/padded-slippers.png",
        material: "패딩 충전재, 논슬립 아웃솔",
        description: "발끝 보온을 극대화한 포근하고 편안한 퀼팅 패딩 슈즈",
        collageStyle: { top: "66%", right: "4%", width: "46%", zIndex: 25 },
      },
    ],
  },

  // 3. [사용자 제공 실제 상품 4종 매칭 2] 오버핏 숏패딩 & 블랙 33 벌룬 스웨트팬츠 이지 룩
  {
    id: "outfit-winter-comfort-balloon",
    snapId: "winter-comf-03",
    postUrl: TARGET_MUSINSA_PROFILE_URL,
    title: "블랙 숏패딩 & 33 벌룬 조거 팬츠 이지웨어",
    clothingItems: "외투: 블랙 숏패딩 · 상의: 차콜 반집업 니트 · 하의: 블랙 벌룬 스웨트팬츠 · 신발: 패딩 슬리퍼",
    description: "한겨울 동네 산책이나 가벼운 야외 활동, 편안한 약속에 알맞은 조합으로 체온을 보호하는 숏다운과 활동성이 뛰어난 벌룬 핏 팬츠, 방한 패딩 슈즈로 구성한 이지웨어입니다.",
    style: "comfort",
    styleName: "편한 스타일",
    tempMin: -50,
    tempMax: 7,
    suitableWeather: ["any", "snow"],
    situationTags: ["동네 산책", "카페", "원마일웨어", "운동", "편한 약속"],
    productItems: [
      {
        id: "prod-outer-black-puffer-comf",
        category: "outer",
        categoryLabel: "외투",
        name: "블랙 볼륨 숏다운 푸퍼",
        photoUrl: "/images/products/black-puffer.jpg",
        material: "덕다운 충전재",
        description: "가볍고 따뜻하게 걸치기 좋은 오버핏 푸퍼 점퍼",
        collageStyle: { top: "6%", right: "4%", width: "48%", zIndex: 18 },
      },
      {
        id: "prod-top-charcoal-knit-comf",
        category: "top",
        categoryLabel: "상의",
        name: "차콜 반집업 울 니트",
        photoUrl: "/images/products/charcoal-knit.png",
        material: "울 혼방",
        description: "실내외 어디서든 편안하게 착용하기 좋은 하프집업",
        collageStyle: { top: "12%", left: "4%", width: "52%", zIndex: 22 },
      },
      {
        id: "prod-bottom-balloon-pants",
        category: "bottom",
        categoryLabel: "하의",
        name: "블랙 33 벌룬 스웨트팬츠",
        photoUrl: "/images/products/balloon-pants.png",
        material: "헤비웨이트 코튼 혼방",
        description: "풍성한 벌룬 실루엣과 스트릿한 무드를 더해주는 조거 팬츠",
        collageStyle: { top: "48%", left: "3%", width: "52%", zIndex: 15 },
      },
      {
        id: "prod-shoes-padded-slippers-comf",
        category: "shoes",
        categoryLabel: "신발",
        name: "블랙 퀼팅 패딩 슬리퍼",
        photoUrl: "/images/products/padded-slippers.png",
        material: "패딩 충전재, 파일 라이닝",
        description: "푹신한 쿠션감과 뛰어난 보온성을 제공하는 패딩 슈즈",
        collageStyle: { top: "66%", right: "4%", width: "46%", zIndex: 25 },
      },
    ],
  },

  // 4. [단정한 스타일] 울 롱코트 & 화이트 셔츠 첼시부츠 포멀 룩
  {
    id: "outfit-winter-formal-coat",
    snapId: "winter-form-04",
    postUrl: TARGET_MUSINSA_PROFILE_URL,
    title: "차콜 울 롱코트 & 화이트 셔츠 첼시부츠 포멀 룩",
    clothingItems: "외투: 차콜 울 롱코트 · 상의: 화이트 셔츠 · 하의: 다크 와이드 데님 · 신발: 블랙 첼시부츠",
    description: "겨울철 출근길이나 비즈니스 미팅, 격식 있는 자리에 신뢰감을 주는 단정한 차콜 울 싱글 코트와 정갈한 옥스포드 셔츠, 세련된 가죽 첼시부츠의 조화로운 조합입니다.",
    style: "formal",
    styleName: "단정한 스타일",
    tempMin: 0,
    tempMax: 10,
    suitableWeather: ["clear", "cloudy"],
    situationTags: ["출근", "면접", "비즈니스", "결혼식", "격식있는 자리"],
    productItems: [
      {
        id: "prod-outer-wool-coat",
        category: "outer",
        categoryLabel: "외투",
        name: "차콜 울 싱글 롱코트",
        photoUrl: "/images/products/wool-coat.jpg",
        material: "울 80%, 나일론 20%",
        description: "단정한 노치드 라펠과 매끄러운 실루엣의 프리미엄 울 롱코트",
        collageStyle: { top: "6%", right: "4%", width: "48%", zIndex: 18 },
      },
      {
        id: "prod-top-white-shirt",
        category: "top",
        categoryLabel: "상의",
        name: "화이트 옥스포드 코튼 셔츠",
        photoUrl: "/images/products/white-shirt.jpg",
        material: "코튼 100%",
        description: "버튼다운 칼라와 탄탄한 원단감이 돋보이는 클래식 드레스 셔츠",
        collageStyle: { top: "12%", left: "4%", width: "52%", zIndex: 22 },
      },
      {
        id: "prod-bottom-formal-denim",
        category: "bottom",
        categoryLabel: "하의",
        name: "체크 포켓 와이드 다크 데님 팬츠",
        photoUrl: "/images/collage/dark-denim.png",
        material: "코튼 100%",
        description: "코트와 믹스매치하기 좋은 깔끔한 실루엣의 다크 진",
        collageStyle: { top: "48%", left: "3%", width: "52%", zIndex: 15 },
      },
      {
        id: "prod-shoes-chelsea-boots",
        category: "shoes",
        categoryLabel: "신발",
        name: "블랙 스무스 레더 첼시부츠",
        photoUrl: "/images/products/chelsea-boots.jpg",
        material: "소가죽, 사이드 엘라스틱 밴드",
        description: "발목 라인을 매끄럽게 잡아주며 포멀한 인상을 완성하는 부츠",
        collageStyle: { top: "66%", right: "4%", width: "46%", zIndex: 25 },
      },
    ],
  },

  // 5. [온화한 간절기 캐주얼] 화이트 셔츠 & 연청 데님 독일군 스니커즈 룩
  {
    id: "outfit-mild-casual-gat",
    snapId: "mild-cas-05",
    postUrl: TARGET_MUSINSA_PROFILE_URL,
    title: "화이트 옥스포드 셔츠 & 데님 스니커즈 룩",
    clothingItems: "상의: 화이트 셔츠 · 하의: 연청 와이드 데님 · 신발: 독일군 스니커즈",
    description: "쾌적하고 따뜻한 날씨에 가볍게 입기 좋은 깨끗한 화이트 옥스포드 셔츠와 와이드 데님, 독일군 스니커즈의 산뜻한 캐주얼 조합입니다.",
    style: "casual",
    styleName: "캐주얼",
    tempMin: 16,
    tempMax: 26,
    suitableWeather: ["clear", "cloudy"],
    situationTags: ["출근", "데이트", "카페", "주말나들이"],
    productItems: [
      {
        id: "prod-top-white-shirt-mild",
        category: "top",
        categoryLabel: "상의",
        name: "화이트 옥스포드 코튼 셔츠",
        photoUrl: "/images/products/white-shirt.jpg",
        material: "코튼 100%",
        description: "단정하고 깨끗한 인상을 주는 기본 화이트 셔츠",
        collageStyle: { top: "8%", left: "12%", width: "60%", zIndex: 20 },
      },
      {
        id: "prod-bottom-denim-mild",
        category: "bottom",
        categoryLabel: "하의",
        name: "연청 와이드 데님 팬츠",
        photoUrl: "/images/products/wide-denim.png",
        material: "코튼 100%",
        description: "여유로운 핏으로 쾌적한 착용감을 주는 데님",
        collageStyle: { top: "46%", left: "8%", width: "55%", zIndex: 15 },
      },
      {
        id: "prod-shoes-gat-mild",
        category: "shoes",
        categoryLabel: "신발",
        name: "화이트 독일군 레더 스니커즈",
        photoUrl: "/images/products/gat-sneakers.jpg",
        material: "천연 가죽 & 고무창",
        description: "가볍고 산뜻한 발걸음을 완성하는 스니커즈",
        collageStyle: { top: "66%", right: "6%", width: "46%", zIndex: 25 },
      },
    ],
  },
]

/**
 * 기온 및 상황에 따른 코디 콜라주 추천 함수
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
