import { ProductItem } from "@/lib/domain/types"

export type OutfitStyle = "casual" | "formal" | "comfort"

export interface CuratedOutfit {
  id: string
  tempMin: number // 최소 기온 (포함)
  tempMax: number // 최대 기온 (미만)
  style: OutfitStyle
  styleName: "캐주얼" | "단정한 스타일" | "편한 스타일"
  title: string
  clothingItems: string // 예: "숏패딩 + 기모 맨투맨 + 와이드 데님"
  description: string // 짧은 추천 이유
  photoUrl: string // 대표 사진 (개별 상품 썸네일 조합용)
  photoCredit: string
  productItems: ProductItem[] // 상의·하의·아우터·신발 등 개별 단독 상품 사진
  weatherConditions?: Array<"any" | "rain" | "snow" | "clear" | "cloudy" | "wind">
  situationTags?: string[]
}

/**
 * 기온 및 스타일별 개별 상품 사진(스튜디오 단독 룩) 코디 카탈로그
 * - 사람 착용 사진 대신 흰색/밝은 배경의 옷·신발 단독 상품 사진 적용
 * - Unsplash Free License 고화질 스튜디오/플랫레이 상품 사진
 */
export const OUTFIT_CATALOG: CuratedOutfit[] = [
  // ==========================================
  // 1. 혹한기 (0℃ 미만) - 패딩, 니트, 기모팬츠, 방한화
  // ==========================================
  {
    id: "outfit-subzero-casual-1",
    tempMin: -50,
    tempMax: 0,
    style: "casual",
    styleName: "캐주얼",
    title: "헤비 숏패딩 & 와이드 데님",
    clothingItems: "블랙 숏패딩 + 차콜 반집업 니트 + 연청 와이드 데님 + 방한 슬립온",
    description: "영하의 칼바람을 막아주는 볼륨 패딩과 포근한 반집업 니트, 여유로운 와이드 데님 조합입니다.",
    photoUrl: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["데일리", "데이트", "친구 모임"],
    productItems: [
      {
        id: "subzero-cas-outer",
        category: "outer",
        categoryLabel: "외투",
        name: "블랙 볼륨 숏패딩",
        photoUrl: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&auto=format&fit=crop&q=80",
        material: "덕다운 80/20, 방풍 나일론",
        thickness: "두꺼움 (헤비)",
        description: "찬 공기를 완벽 차단하는 고보온성 숏다운 점퍼",
      },
      {
        id: "subzero-cas-top",
        category: "top",
        categoryLabel: "상의",
        name: "차콜 반집업 울 니트",
        photoUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80",
        material: "메리노울 80%, 나일론 20%",
        thickness: "도톰한 두께감",
        description: "목을 감싸 체온을 지켜주는 클래식 하프집업 니트",
      },
      {
        id: "subzero-cas-bottom",
        category: "bottom",
        categoryLabel: "하의",
        name: "연청 와이드 기모 데님",
        photoUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
        material: "코튼 100% (속기모)",
        thickness: "두꺼움",
        description: "체형을 편안하게 커버하는 와이드 스트레이트 진",
      },
      {
        id: "subzero-cas-shoes",
        category: "shoes",
        categoryLabel: "신발",
        name: "블랙 웜 패딩 슬립온",
        photoUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80",
        material: "신슐레이트 충전재, 미끄럼방지 고무창",
        thickness: "방한용",
        description: "발끝까지 시렵지 않은 따뜻한 패딩 방한 슈즈",
      },
    ],
  },
  {
    id: "outfit-subzero-formal-1",
    tempMin: -50,
    tempMax: 0,
    style: "formal",
    styleName: "단정한 스타일",
    title: "헤비 울 롱코트 & 캐시미어 니트",
    clothingItems: "다크네이비 울 롱코트 + 크림 터틀넥 니트 + 차콜 기모 슬랙스 + 레더 첼시부츠",
    description: "영하 날씨의 출근길과 비즈니스 미팅에 신뢰감을 주는 따뜻하고 단정한 실루엣입니다.",
    photoUrl: "https://images.unsplash.com/photo-1539533018447-63fcce667883?w=600&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["면접", "출근", "비즈니스", "결혼식"],
    productItems: [
      {
        id: "subzero-form-outer",
        category: "outer",
        categoryLabel: "외투",
        name: "다크네이비 캐시미어 코트",
        photoUrl: "https://images.unsplash.com/photo-1539533018447-63fcce667883?w=600&auto=format&fit=crop&q=80",
        material: "울 90%, 캐시미어 10%",
        thickness: "두꺼움",
        description: "단단하게 떨어지는 실루엣의 더블 브레스티드 코트",
      },
      {
        id: "subzero-form-top",
        category: "top",
        categoryLabel: "상의",
        name: "크림 화이트 터틀넥",
        photoUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop&q=80",
        material: "파인 울 100%",
        thickness: "보통",
        description: "코트 이너로 가장 깔끔한 베이직 목폴라",
      },
      {
        id: "subzero-form-bottom",
        category: "bottom",
        categoryLabel: "하의",
        name: "차콜 프레스 슬랙스",
        photoUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop&q=80",
        material: "울 혼방 (미세 기모)",
        thickness: "보통",
        description: "주름 걱정 없는 깔끔한 테이퍼드 핏 슬랙스",
      },
      {
        id: "subzero-form-shoes",
        category: "shoes",
        categoryLabel: "신발",
        name: "블랙 클래식 더비슈즈",
        photoUrl: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&auto=format&fit=crop&q=80",
        material: "소가죽",
        thickness: "사계절",
        description: "단정하고 신뢰감 있는 가죽 드레스 슈즈",
      },
    ],
  },
  {
    id: "outfit-subzero-comfort-1",
    tempMin: -50,
    tempMax: 0,
    style: "comfort",
    styleName: "편한 스타일",
    title: "롱 벤치다운 & 기모 조거팬츠",
    clothingItems: "롱 벤치다운 패딩 + 헤비 기모 후드티 + 블랙 스웨트 조거팬츠 + 쿠션 러닝화",
    description: "머리부터 발끝까지 찬바람을 완벽 차단해 편안한 야외 활동이나 산책에 제격입니다.",
    photoUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["운동", "산책", "원마일웨어", "장보기"],
    productItems: [
      {
        id: "subzero-com-outer",
        category: "outer",
        categoryLabel: "외투",
        name: "블랙 롱 벤치 파카",
        photoUrl: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&auto=format&fit=crop&q=80",
        material: "헤비 덕다운 충전재",
        thickness: "두꺼움",
        description: "무릎 아래까지 보온하는 최적의 방한 롱다운",
      },
      {
        id: "subzero-com-top",
        category: "top",
        categoryLabel: "상의",
        name: "멜란지 그레이 기모 후디",
        photoUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
        material: "코튼 100% 텐타덤블",
        thickness: "두꺼움",
        description: "편안한 드롭숄더 오버핏 기모 후드티",
      },
      {
        id: "subzero-com-bottom",
        category: "bottom",
        categoryLabel: "하의",
        name: "블랙 스웨트 조거팬츠",
        photoUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop&q=80",
        material: "코튼 100% (속기모)",
        thickness: "두꺼움",
        description: "발목을 탄탄하게 잡아주는 벌룬 조거팬츠",
      },
      {
        id: "subzero-com-shoes",
        category: "shoes",
        categoryLabel: "신발",
        name: "그레이 쿠셔닝 스니커즈",
        photoUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
        material: "메쉬 & 스웨이드",
        thickness: "보통",
        description: "오래 걸어도 발이 편안한 충격 흡수 러닝화",
      },
    ],
  },

  // ==========================================
  // 2. 초겨울 (0℃ 이상, 5℃ 미만) - 숏패딩, 울코트, 니트
  // ==========================================
  {
    id: "outfit-winter-casual-1",
    tempMin: 0,
    tempMax: 5,
    style: "casual",
    styleName: "캐주얼",
    title: "퀼팅 점퍼 & 케이블 니트",
    clothingItems: "카키 퀼팅 점퍼 + 크림 케이블 니트 + 중청 스트레이트 진 + 가죽 스니커즈",
    description: "초겨울 쌀쌀한 기온에 딱 맞는 가볍고 포근한 데일리 캐주얼 조합입니다.",
    photoUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["데일리", "약속", "데이트", "소개팅", "카페"],
    productItems: [
      {
        id: "winter-cas-outer",
        category: "outer",
        categoryLabel: "외투",
        name: "카키 다이아 퀼팅 점퍼",
        photoUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80",
        material: "3온스 하스솜 압축 충전",
        thickness: "보통",
        description: "가볍고 보온성이 뛰어난 퀼팅 자켓",
      },
      {
        id: "winter-cas-top",
        category: "top",
        categoryLabel: "상의",
        name: "크림 베이지 케이블 니트",
        photoUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop&q=80",
        material: "울 100%",
        thickness: "도톰함",
        description: "입체적인 꽈배기 짜임의 포근한 라운드 니트",
      },
      {
        id: "winter-cas-bottom",
        category: "bottom",
        categoryLabel: "하의",
        name: "중청 스트레이트 데님",
        photoUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
        material: "코튼 99%, 엘라 1%",
        thickness: "보통",
        description: "어떤 상의와도 매치하기 좋은 기본 일자 청바지",
      },
      {
        id: "winter-cas-shoes",
        category: "shoes",
        categoryLabel: "신발",
        name: "화이트 클린 레더 스니커즈",
        photoUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
        material: "소가죽",
        thickness: "보통",
        description: "군더더기 없는 미니멀 화이트 스니커즈",
      },
    ],
  },
  {
    id: "outfit-winter-formal-1",
    tempMin: 0,
    tempMax: 5,
    style: "formal",
    styleName: "단정한 스타일",
    title: "싱글 울 코트 & 모크넥 니트",
    clothingItems: "오트밀 싱글 코트 + 블랙 모크넥 니트 + 다크그레이 슬랙스 + 로퍼",
    description: "단정하면서도 세련된 인상을 주는 미팅 및 출근용 코트 스타일링입니다.",
    photoUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["면접", "출근", "회의", "격식있는 자리"],
    productItems: [
      {
        id: "winter-form-outer",
        category: "outer",
        categoryLabel: "외투",
        name: "오트밀 싱글 울 코트",
        photoUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&auto=format&fit=crop&q=80",
        material: "울 85%, 나일론 15%",
        thickness: "도톰함",
        description: "군더더기 없는 테일러드 칼라 싱글 코트",
      },
      {
        id: "winter-form-top",
        category: "top",
        categoryLabel: "상의",
        name: "블랙 하프 모크넥 니트",
        photoUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80",
        material: "캐시미어 블렌드",
        thickness: "보통",
        description: "목선을 부드럽게 감싸는 미니멀 모크넥",
      },
      {
        id: "winter-form-bottom",
        category: "bottom",
        categoryLabel: "하의",
        name: "다크그레이 세미와이드 슬랙스",
        photoUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop&q=80",
        material: "TR 원단",
        thickness: "보통",
        description: "구김이 적고 찰랑이는 세미와이드 슬랙스",
      },
      {
        id: "winter-form-shoes",
        category: "shoes",
        categoryLabel: "신발",
        name: "블랙 페니 로퍼",
        photoUrl: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&auto=format&fit=crop&q=80",
        material: "카프스킨 소가죽",
        thickness: "보통",
        description: "단정함을 완성하는 클래식 페니 로퍼",
      },
    ],
  },
  {
    id: "outfit-winter-comfort-1",
    tempMin: 0,
    tempMax: 5,
    style: "comfort",
    styleName: "편한 스타일",
    title: "보아 후리스 자켓 & 조거팬츠",
    clothingItems: "아이보리 보아 후리스 + 오트밀 맨투맨 + 차콜 조거팬츠 + 캔버스화",
    description: "부드러운 양털 후리스와 신축성 좋은 조거팬츠로 활동성을 극대화한 코디입니다.",
    photoUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["주말", "동네", "산책", "카페"],
    productItems: [
      {
        id: "winter-com-outer",
        category: "outer",
        categoryLabel: "외투",
        name: "아이보리 덤블 플리스 자켓",
        photoUrl: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&auto=format&fit=crop&q=80",
        material: "헤비 쉐르파 플리스",
        thickness: "도톰함",
        description: "부드러운 촉감과 방풍 안감의 집업 플리스",
      },
      {
        id: "winter-com-top",
        category: "top",
        categoryLabel: "상의",
        name: "오트밀 헤비 코튼 맨투맨",
        photoUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
        material: "코튼 100%",
        thickness: "보통",
        description: "탄탄한 넥라인의 베이직 스웨트셔츠",
      },
      {
        id: "winter-com-bottom",
        category: "bottom",
        categoryLabel: "하의",
        name: "차콜 기모 조거팬츠",
        photoUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop&q=80",
        material: "면/폴리 혼방",
        thickness: "도톰함",
        description: "무릎 발사가 적은 밴딩 조거팬츠",
      },
      {
        id: "winter-com-shoes",
        category: "shoes",
        categoryLabel: "신발",
        name: "블랙 로우탑 스니커즈",
        photoUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80",
        material: "캔버스 & 러버솔",
        thickness: "보통",
        description: "가볍고 편안한 기본 스니커즈",
      },
    ],
  },

  // ==========================================
  // 3. 늦가을 / 초봄 (5℃ 이상, 10℃ 미만) - 트렌치, 자켓, 가디건
  // ==========================================
  {
    id: "outfit-fall-casual-1",
    tempMin: 5,
    tempMax: 10,
    style: "casual",
    styleName: "캐주얼",
    title: "바시티 자켓 & 와이드 치노",
    clothingItems: "네이비 바시티 자켓 + 그레이 스트라이프 롱슬리브 + 베이지 와이드 치노 + 독일군 스니커즈",
    description: "활동적인 캐주얼 무드를 연출하기 좋은 가을/봄 대표 조합입니다.",
    photoUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["데이트", "대학생", "외출"],
    productItems: [
      {
        id: "fall-cas-outer",
        category: "outer",
        categoryLabel: "외투",
        name: "네이비 울 바시티 자켓",
        photoUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80",
        material: "멜톤 울 & 레더 배색",
        thickness: "보통",
        description: "트렌디한 실루엣의 스타디움 점퍼",
      },
      {
        id: "fall-cas-top",
        category: "top",
        categoryLabel: "상의",
        name: "그레이 보트넥 롱슬리브",
        photoUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
        material: "코튼 100%",
        thickness: "보통",
        description: "단품이나 이너로 포인트 주기 좋은 긴팔 티셔츠",
      },
      {
        id: "fall-cas-bottom",
        category: "bottom",
        categoryLabel: "하의",
        name: "베이지 원턱 와이드 치노",
        photoUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80",
        material: "코튼 100% 트윌",
        thickness: "보통",
        description: "자연스러운 핏감의 코튼 와이드 팬츠",
      },
      {
        id: "fall-cas-shoes",
        category: "shoes",
        categoryLabel: "신발",
        name: "화이트/그레이 저먼 아미 트레이너",
        photoUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
        material: "소가죽 & 스웨이드 토",
        thickness: "보통",
        description: "클래식하고 미니멀한 독일군 스니커즈",
      },
    ],
  },
  {
    id: "outfit-fall-formal-1",
    tempMin: 5,
    tempMax: 10,
    style: "formal",
    styleName: "단정한 스타일",
    title: "베이지 트렌치코트 & 셔츠 레이어드",
    clothingItems: "클래식 더블 트렌치코트 + 네이비 브이넥 니트 + 화이트 셔츠 + 블랙 슬랙스",
    description: "도시적인 무드와 보온성을 모두 갖춘 비즈니스 캐주얼의 정석입니다.",
    photoUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["출근", "비즈니스", "미팅"],
    productItems: [
      {
        id: "fall-form-outer",
        category: "outer",
        categoryLabel: "외투",
        name: "클래식 더블 트렌치코트",
        photoUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&auto=format&fit=crop&q=80",
        material: "방수 코튼 개버딘",
        thickness: "보통",
        description: "바람을 막아주는 탄탄한 개버딘 트렌치",
      },
      {
        id: "fall-form-top",
        category: "top",
        categoryLabel: "상의",
        name: "네이비 파인 울 브이넥 니트",
        photoUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80",
        material: "메리노울 100%",
        thickness: "보통",
        description: "셔츠와 찰떡궁합인 브이넥 니트",
      },
      {
        id: "fall-form-bottom",
        category: "bottom",
        categoryLabel: "하의",
        name: "블랙 테이퍼드 슬랙스",
        photoUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop&q=80",
        material: "폴리/레이온/스판",
        thickness: "보통",
        description: "다리가 길어 보이는 깔끔한 라인의 슬랙스",
      },
      {
        id: "fall-form-shoes",
        category: "shoes",
        categoryLabel: "신발",
        name: "다크브라운 태슬 로퍼",
        photoUrl: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&auto=format&fit=crop&q=80",
        material: "소가죽",
        thickness: "보통",
        description: "고급스러운 태슬 디테일의 드레스 슈즈",
      },
    ],
  },

  // ==========================================
  // 4. 온화한 봄/가을 (10℃ ~ 20℃)
  // ==========================================
  {
    id: "outfit-mild-casual-1",
    tempMin: 10,
    tempMax: 20,
    style: "casual",
    styleName: "캐주얼",
    title: "오버핏 블레이저 & 크롭 데님",
    clothingItems: "차콜 싱글 블레이저 + 화이트 반팔 티 + 연청 크롭 데님 + 캔버스 스니커즈",
    description: "낮에는 쾌적하고 아침저녁 쌀쌀함은 블레이저로 단정하게 커버하는 스마트 캐주얼 룩입니다.",
    photoUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["데이트", "약속", "주말"],
    productItems: [
      {
        id: "mild-cas-outer",
        category: "outer",
        categoryLabel: "외투",
        name: "차콜 세미오버 블레이저",
        photoUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80",
        material: "폴리/레이온 혼방",
        thickness: "얇음~보통",
        description: "캐주얼과 포멀을 넘나드는 모던 자켓",
      },
      {
        id: "mild-cas-top",
        category: "top",
        categoryLabel: "상의",
        name: "화이트 20수 코튼 티셔츠",
        photoUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
        material: "코튼 100%",
        thickness: "얇음",
        description: "비침 없는 탄탄한 프리미엄 기본 반팔티",
      },
      {
        id: "mild-cas-bottom",
        category: "bottom",
        categoryLabel: "하의",
        name: "연청 테이퍼드 크롭 진",
        photoUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
        material: "코튼 100%",
        thickness: "보통",
        description: "발목이 살짝 드러나는 경쾌한 기장의 데님",
      },
      {
        id: "mild-cas-shoes",
        category: "shoes",
        categoryLabel: "신발",
        name: "화이트 캔버스 스니커즈",
        photoUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
        material: "캔버스",
        thickness: "얇음",
        description: "사계절 어디에나 매칭되는 클래식 스니커즈",
      },
    ],
  },
  {
    id: "outfit-mild-comfort-1",
    tempMin: 10,
    tempMax: 20,
    style: "comfort",
    styleName: "편한 스타일",
    title: "집업 후드 & 스웨트 팬츠 셋업",
    clothingItems: "그레이 2-way 집업 후드 + 화이트 레이어드 티 + 그레이 스웨트 팬츠 + 볼드 러닝화",
    description: "온도 변화에 맞춰 지퍼를 조절할 수 있어 하루 종일 가장 편안한 원마일 셋업입니다.",
    photoUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["운동", "산책", "여행", "휴식"],
    productItems: [
      {
        id: "mild-com-outer",
        category: "outer",
        categoryLabel: "외투",
        name: "멜란지 그레이 투웨이 집업 후디",
        photoUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
        material: "프렌치 테리 코튼 100%",
        thickness: "보통",
        description: "상하 지퍼로 다양한 연출이 가능한 후드 집업",
      },
      {
        id: "mild-com-top",
        category: "top",
        categoryLabel: "상의",
        name: "화이트 레이어드 롱슬리브",
        photoUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
        material: "코튼 100%",
        thickness: "얇음",
        description: "밑단 레이어드 연출에 좋은 베이직 티셔츠",
      },
      {
        id: "mild-com-bottom",
        category: "bottom",
        categoryLabel: "하의",
        name: "멜란지 그레이 와이드 스웨트 팬츠",
        photoUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop&q=80",
        material: "프렌치 테리 코튼 100%",
        thickness: "보통",
        description: "허리 스트링으로 편안한 와이드 트레이닝 바지",
      },
      {
        id: "mild-com-shoes",
        category: "shoes",
        categoryLabel: "신발",
        name: "올화이트 쿠셔닝 스니커즈",
        photoUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
        material: "합성가죽 & 고무",
        thickness: "보통",
        description: "푹신한 발걸음을 돕는 가벼운 러닝화",
      },
    ],
  },

  // ==========================================
  // 5. 초여름 / 여름 (20℃ 이상)
  // ==========================================
  {
    id: "outfit-summer-casual-1",
    tempMin: 20,
    tempMax: 50,
    style: "casual",
    styleName: "캐주얼",
    title: "린넨 반팔 셔츠 & 버뮤다 쇼츠",
    clothingItems: "스카이블루 오픈카라 린넨 셔츠 + 화이트 이너티 + 네이비 버뮤다 팬츠 + 가죽 샌들",
    description: "통기성이 뛰어난 린넨 소재로 무더위를 식혀주는 시원하고 트렌디한 서머 룩입니다.",
    photoUrl: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80",
    photoCredit: "Unsplash / Free License",
    situationTags: ["주말", "바캉스", "데이트", "더운 날"],
    productItems: [
      {
        id: "summer-cas-top",
        category: "top",
        categoryLabel: "상의",
        name: "스카이블루 오픈카라 린넨 셔츠",
        photoUrl: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80",
        material: "프렌치 린넨 100%",
        thickness: "얇음",
        description: "목선이 시원하게 열린 여름용 린넨 반팔 셔츠",
      },
      {
        id: "summer-cas-bottom",
        category: "bottom",
        categoryLabel: "하의",
        name: "네이비 원턱 버뮤다 쇼츠",
        photoUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80",
        material: "코튼 100%",
        thickness: "얇음",
        description: "무릎까지 내려오는 단정한 버뮤다 반바지",
      },
      {
        id: "summer-cas-shoes",
        category: "shoes",
        categoryLabel: "신발",
        name: "블랙 가죽 슬라이드 샌들",
        photoUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80",
        material: "천연 소가죽 스트랩",
        thickness: "여름용",
        description: "시원하면서도 발이 편안한 미니멀 가죽 샌들",
      },
    ],
  },
]

/**
 * 기온에 따른 코디 추천 검색 함수
 */
export function getOutfitRecommendations(
  temperature: number,
  situation?: string | null,
  preferredStyle?: OutfitStyle | null,
): { primary: CuratedOutfit; alternatives: CuratedOutfit[]; allForTemp: CuratedOutfit[] } {
  // 기온 범위에 맞는 후보들 필터링
  const candidates = OUTFIT_CATALOG.filter(
    (o) => temperature >= o.tempMin && temperature < o.tempMax,
  )

  const available = candidates.length > 0 ? candidates : OUTFIT_CATALOG

  let primary = available[0]
  if (preferredStyle) {
    const styleMatched = available.find((o) => o.style === preferredStyle)
    if (styleMatched) primary = styleMatched
  } else if (situation) {
    const sitLower = situation.toLowerCase()
    const matched = available.find((o) =>
      o.situationTags?.some((tag) => sitLower.includes(tag.toLowerCase())),
    )
    if (matched) primary = matched
  }

  const alternatives = available.filter((o) => o.id !== primary.id)

  return {
    primary,
    alternatives,
    allForTemp: available,
  }
}
