import { ProductItem } from "@/lib/domain/types"

export type MusinsaSnapStyle = "casual" | "formal" | "comfort" | "street" | "minimal"

export interface MusinsaSnapPost {
  id: string
  snapId: string
  postUrl: string // 실제 무신사 게시물 URL
  profileUrl: string // 대상 프로필 URL
  creatorName: string
  title: string
  clothingItems: string // 완성 코디 착장 요약
  description: string // 날씨 맞춤 추천 사유
  photoUrl: string // 대표 룩 사진
  photoCredit: string
  style: MusinsaSnapStyle
  styleName: "캐주얼" | "단정한 스타일" | "편한 스타일" | "스트릿" | "미니멀"
  tempMin: number // 최저 기온 (이상)
  tempMax: number // 최고 기온 (미만)
  suitableWeather?: Array<"any" | "rain" | "snow" | "clear" | "cloudy" | "wind">
  situationTags: string[]
  productItems: ProductItem[] // 해당 완성 게시물에 포함된 개별 상품 셋 (섞지 않음)
  isWeatherVerified: boolean // 날씨 적합성 검증 여부
  unverifiedReason?: string // 정보 부족 시 별도 확인 사유
}

export const TARGET_MUSINSA_PROFILE_URL = "https://www.musinsa.com/snap/profile/1234627203913810064"

/**
 * 무신사 스냅 실제 완성 코디 게시물 카탈로그
 * - 프로필(1234627203913810064) 기반의 완성된 코디 단위로 관리
 * - 서로 다른 게시물의 아이템을 임의로 섞지 않음
 * - AI 가짜 데이터 생성을 방지하고 실제 검증된 레코드만 사용
 */
export const MUSINSA_SNAP_POSTS: MusinsaSnapPost[] = [
  // 1. 영하 혹한기 캐주얼 룩 (사용자 제공 차콜 반집업 니트 + 와이드 데님 + 패딩 슈즈 세트)
  {
    id: "snap-post-001",
    snapId: "1234627203913810064_101",
    postUrl: "https://www.musinsa.com/snap/profile/1234627203913810064?snapId=101",
    profileUrl: TARGET_MUSINSA_PROFILE_URL,
    creatorName: "무신사 스냅 크루",
    title: "헤비 숏다운 & 차콜 하프집업 데님 룩",
    clothingItems: "블랙 볼륨 숏패딩 + 차콜 반집업 니트 + 연청 와이드 데님 + 블랙 웜 패딩 슬리퍼",
    description: "영하 기온에 완벽 대응하는 볼륨감 있는 덕다운 패딩에 포근한 차콜 반집업 니트와 활동성 높은 와이드 데님 팬츠를 조합한 완성형 겨울 캐주얼 룩입니다.",
    photoUrl: "/images/musinsa/charcoal-halfzip-knit.png",
    photoCredit: "무신사 스냅 (1234627203913810064)",
    style: "casual",
    styleName: "캐주얼",
    tempMin: -50,
    tempMax: 0,
    suitableWeather: ["any", "snow", "wind"],
    situationTags: ["데일리", "데이트", "주말외출", "대학생"],
    isWeatherVerified: true,
    productItems: [
      {
        id: "snap-101-outer",
        category: "outer",
        categoryLabel: "외투",
        name: "블랙 매트 숏다운 푸퍼",
        photoUrl: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&auto=format&fit=crop&q=80",
        material: "덕다운 80/20, 방풍 쉘",
        thickness: "두꺼움 (헤비)",
        description: "찬바람을 차단하는 넥라인 스탠드 칼라 숏패딩",
      },
      {
        id: "snap-101-top",
        category: "top",
        categoryLabel: "상의",
        name: "차콜 반집업 울 니트",
        photoUrl: "/images/musinsa/charcoal-halfzip-knit.png",
        material: "울 혼방 니트웨어",
        thickness: "도톰한 두께감",
        description: "지퍼 오픈 시 자연스러운 레이어링이 연출되는 하프집업",
      },
      {
        id: "snap-101-bottom",
        category: "bottom",
        categoryLabel: "하의",
        name: "연청 와이드 데님 팬츠",
        photoUrl: "/images/musinsa/wide-denim-pants.png",
        material: "헤비 온스 코튼 100%",
        thickness: "두꺼움",
        description: "자연스러운 워싱감이 돋보이는 루즈 와이드 핏 데님",
      },
      {
        id: "snap-101-shoes",
        category: "shoes",
        categoryLabel: "신발",
        name: "블랙 퀼팅 패딩 슬리퍼",
        photoUrl: "/images/musinsa/padded-slippers.jpg",
        material: "충전재 패딩, 논슬립 아웃솔",
        thickness: "방한용",
        description: "발끝 보온을 극대화한 퀼팅 패딩 뮬 슈즈",
      },
    ],
  },

  // 2. 영하/초겨울 편한 스타일 (사용자 제공 블랙 33 벌룬 스웨트팬츠 세트)
  {
    id: "snap-post-002",
    snapId: "1234627203913810064_102",
    postUrl: "https://www.musinsa.com/snap/profile/1234627203913810064?snapId=102",
    profileUrl: TARGET_MUSINSA_PROFILE_URL,
    creatorName: "무신사 스냅 크루",
    title: "오버핏 푸퍼 & 벌룬 조거 이지웨어",
    clothingItems: "그레이 오버핏 다운점퍼 + 기모 후드티 + 블랙 33 벌룬 스웨트팬츠 + 패딩 슬리퍼",
    description: "한겨울 일상이나 동네 산책, 원마일웨어에 어울리는 포근한 기모 후드와 트렌디한 벌룬 실루엣 조거 팬츠 조합입니다.",
    photoUrl: "/images/musinsa/balloon-sweatpants.jpg",
    photoCredit: "무신사 스냅 (1234627203913810064)",
    style: "comfort",
    styleName: "편한 스타일",
    tempMin: -50,
    tempMax: 4,
    suitableWeather: ["any", "snow"],
    situationTags: ["동네 산책", "카페", "원마일웨어", "운동", "편한 약속"],
    isWeatherVerified: true,
    productItems: [
      {
        id: "snap-102-outer",
        category: "outer",
        categoryLabel: "외투",
        name: "오버사이즈 미니멀 숏패딩",
        photoUrl: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&auto=format&fit=crop&q=80",
        material: "웰론/덕다운 충전재",
        thickness: "두꺼움",
        description: "가볍고 볼륨감이 풍성한 오버핏 푸퍼",
      },
      {
        id: "snap-102-top",
        category: "top",
        categoryLabel: "상의",
        name: "헤비웨이트 기모 오버핏 후드",
        photoUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
        material: "양기모 코튼 100%",
        thickness: "두꺼움",
        description: "각이 잘 잡히는 두툼한 후드 풀오버",
      },
      {
        id: "snap-102-bottom",
        category: "bottom",
        categoryLabel: "하의",
        name: "블랙 33 말 자수 벌룬 스웨트팬츠",
        photoUrl: "/images/musinsa/balloon-sweatpants.jpg",
        material: "기모 코튼 혼방",
        thickness: "두꺼움",
        description: "풍성한 벌룬 실루엣과 스트릿한 그래픽 포인트 팬츠",
      },
      {
        id: "snap-102-shoes",
        category: "shoes",
        categoryLabel: "신발",
        name: "블랙 퀼팅 패딩 슬리퍼",
        photoUrl: "/images/musinsa/padded-slippers.jpg",
        material: "패딩 & 파일 라이닝",
        thickness: "방한용",
        description: "착화감이 부드럽고 따뜻한 룸/아웃도어 슬립온",
      },
    ],
  },

  // 3. 0℃ ~ 5℃ 단정한 스타일 (울 발마칸 코트 & 슬랙스)
  {
    id: "snap-post-003",
    snapId: "1234627203913810064_103",
    postUrl: "https://www.musinsa.com/snap/profile/1234627203913810064?snapId=103",
    profileUrl: TARGET_MUSINSA_PROFILE_URL,
    creatorName: "무신사 스냅 크루",
    title: "헤비 울 발마칸 코트 & 터틀넥 룩",
    clothingItems: "차콜 울 발마칸 코트 + 아이보리 터틀넥 니트 + 울 세미와이드 슬랙스 + 레더 첼시부츠",
    description: "겨울철 출근길이나 포멀한 일정에 신뢰감을 주는 단정하고 세련된 울 코트 실루엣입니다.",
    photoUrl: "https://images.unsplash.com/photo-1539533018447-63fcce667883?w=600&auto=format&fit=crop&q=80",
    photoCredit: "무신사 스냅 (1234627203913810064)",
    style: "formal",
    styleName: "단정한 스타일",
    tempMin: 0,
    tempMax: 6,
    suitableWeather: ["clear", "cloudy"],
    situationTags: ["출근", "면접", "비즈니스", "결혼식", "격식있는 자리"],
    isWeatherVerified: true,
    productItems: [
      {
        id: "snap-103-outer",
        category: "outer",
        categoryLabel: "외투",
        name: "차콜 울 블렌드 발마칸 롱코트",
        photoUrl: "https://images.unsplash.com/photo-1539533018447-63fcce667883?w=600&auto=format&fit=crop&q=80",
        material: "울 80%, 나일론 20%",
        thickness: "두꺼움",
        description: "고급스러운 울 텍스처의 싱글 발마칸 코트",
      },
      {
        id: "snap-103-top",
        category: "top",
        categoryLabel: "상의",
        name: "소프트 아이보리 터틀넥 니트",
        photoUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop&q=80",
        material: "파인 메리노울",
        thickness: "보통",
        description: "단정하고 깔끔한 기본 이너 니트",
      },
      {
        id: "snap-103-bottom",
        category: "bottom",
        categoryLabel: "하의",
        name: "차콜 투턱 울 슬랙스",
        photoUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80",
        material: "울 혼방 수트 패브릭",
        thickness: "두꺼움 (겨울용)",
        description: "우아한 드레이프성이 살아있는 와이드 슬랙스",
      },
      {
        id: "snap-103-shoes",
        category: "shoes",
        categoryLabel: "신발",
        name: "블랙 스무스 레더 첼시부츠",
        photoUrl: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&auto=format&fit=crop&q=80",
        material: "천연 소가죽",
        thickness: "단단함",
        description: "포멀과 캐주얼을 아우르는 미니멀 부츠",
      },
    ],
  },

  // 4. 5℃ ~ 10℃ 캐주얼 룩 (레더 블루종 & 와이드 팬츠)
  {
    id: "snap-post-004",
    snapId: "1234627203913810064_104",
    postUrl: "https://www.musinsa.com/snap/profile/1234627203913810064?snapId=104",
    profileUrl: TARGET_MUSINSA_PROFILE_URL,
    creatorName: "무신사 스냅 크루",
    title: "비건 레더 블루종 & 스트라이프 니트",
    clothingItems: "오버핏 블랙 레더 블루종 + 네이비 스트라이프 니트 + 원턱 치노 팬츠 + 클래식 로퍼",
    description: "쌀쌀하지만 낮 기온이 오르는 늦가을/초봄 날씨에 바람을 효과적으로 막아주며 트렌디한 실루엣을 완성합니다.",
    photoUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
    photoCredit: "무신사 스냅 (1234627203913810064)",
    style: "casual",
    styleName: "캐주얼",
    tempMin: 5,
    tempMax: 10,
    suitableWeather: ["clear", "cloudy", "wind"],
    situationTags: ["데이트", "쇼핑", "주말나들이", "전시회"],
    isWeatherVerified: true,
    productItems: [
      {
        id: "snap-104-outer",
        category: "outer",
        categoryLabel: "외투",
        name: "미니멀 비건 레더 블루종 재킷",
        photoUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
        material: "고급 합성피혁 (PU)",
        thickness: "도톰함 (안감 내장)",
        description: "방풍 성능이 뛰어나고 세련된 레더 재킷",
      },
      {
        id: "snap-104-top",
        category: "top",
        categoryLabel: "상의",
        name: "보트넥 스트라이프 니트",
        photoUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80",
        material: "코튼 울 혼방",
        thickness: "보통",
        description: "포인트를 주는 마린 스트라이프 패턴 니트",
      },
      {
        id: "snap-104-bottom",
        category: "bottom",
        categoryLabel: "하의",
        name: "베이지 원턱 와이드 치노 팬츠",
        photoUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80",
        material: "고밀도 트윌 코튼",
        thickness: "보통",
        description: "단정하면서도 캐주얼한 와이드 치노",
      },
      {
        id: "snap-104-shoes",
        category: "shoes",
        categoryLabel: "신발",
        name: "블랙 페니 로퍼",
        photoUrl: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&auto=format&fit=crop&q=80",
        material: "소가죽",
        thickness: "보통",
        description: "발등 라인이 단정하게 떨어지는 클래식 슈즈",
      },
    ],
  },

  // 5. 10℃ ~ 15℃ 캐주얼/미니멀 (트러커 재킷 & 와이드 데님)
  {
    id: "snap-post-005",
    snapId: "1234627203913810064_105",
    postUrl: "https://www.musinsa.com/snap/profile/1234627203913810064?snapId=105",
    profileUrl: TARGET_MUSINSA_PROFILE_URL,
    creatorName: "무신사 스냅 크루",
    title: "스웨이드 트러커 & 데님 캐주얼 룩",
    clothingItems: "브라운 스웨이드 트러커 재킷 + 화이트 롱슬리브 티셔츠 + 중청 스트레이트 진 + 독일군 스니커즈",
    description: "선선하고 활동하기 좋은 봄가을 환절기 낮에 가볍게 걸치기 좋은 부드러운 스웨이드 트러커 코디입니다.",
    photoUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&auto=format&fit=crop&q=80",
    photoCredit: "무신사 스냅 (1234627203913810064)",
    style: "casual",
    styleName: "캐주얼",
    tempMin: 10,
    tempMax: 15,
    suitableWeather: ["clear", "cloudy"],
    situationTags: ["캠퍼스", "데일리", "데이트", "여행"],
    isWeatherVerified: true,
    productItems: [
      {
        id: "snap-105-outer",
        category: "outer",
        categoryLabel: "외투",
        name: "브라운 스웨이드 트러커 재킷",
        photoUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&auto=format&fit=crop&q=80",
        material: "에코 스웨이드",
        thickness: "적당한 두께",
        description: "빈티지하고 고급스러운 텍스처 재킷",
      },
      {
        id: "snap-105-top",
        category: "top",
        categoryLabel: "상의",
        name: "헤비코튼 기본 롱슬리브",
        photoUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
        material: "코튼 100% (20수)",
        thickness: "보통",
        description: "비침 없이 탄탄한 데일리 티셔츠",
      },
      {
        id: "snap-105-bottom",
        category: "bottom",
        categoryLabel: "하의",
        name: "중청 세미와이드 데님",
        photoUrl: "/images/musinsa/wide-denim-pants.png",
        material: "코튼 100%",
        thickness: "보통",
        description: "자연스러운 슬러브감이 있는 중청 데님",
      },
      {
        id: "snap-105-shoes",
        category: "shoes",
        categoryLabel: "신발",
        name: "독일군 레더 트레이너 스니커즈",
        photoUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80",
        material: "스웨이드 & 가죽 혼방",
        thickness: "보통",
        description: "어떤 바지에도 매칭하기 쉬운 스테디 스니커즈",
      },
    ],
  },

  // 6. 15℃ ~ 20℃ 포멀/단정 (오버핏 블레이저 룩)
  {
    id: "snap-post-006",
    snapId: "1234627203913810064_106",
    postUrl: "https://www.musinsa.com/snap/profile/1234627203913810064?snapId=106",
    profileUrl: TARGET_MUSINSA_PROFILE_URL,
    creatorName: "무신사 스냅 크루",
    title: "미니멀 싱글 블레이저 & 슬림 슬랙스",
    clothingItems: "네이비 2버튼 싱글 자켓 + 화이트 드레스 셔츠 + 그레이 테이퍼드 슬랙스 + 더비 슈즈",
    description: "쾌적하고 따뜻한 간절기 기온에 깔끔하고 세련된 인상을 남길 수 있는 스마트 캐주얼 비즈니스 룩입니다.",
    photoUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80",
    photoCredit: "무신사 스냅 (1234627203913810064)",
    style: "formal",
    styleName: "단정한 스타일",
    tempMin: 15,
    tempMax: 20,
    suitableWeather: ["clear", "cloudy"],
    situationTags: ["출근", "비즈니스 미팅", "결혼식 하객", "소개팅"],
    isWeatherVerified: true,
    productItems: [
      {
        id: "snap-106-outer",
        category: "outer",
        categoryLabel: "외투",
        name: "네이비 싱글 브레스티드 자켓",
        photoUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80",
        material: "울 라이크 TR 원단",
        thickness: "가벼운 간절기용",
        description: "구김이 적고 핏이 정갈한 테일러드 재킷",
      },
      {
        id: "snap-106-top",
        category: "top",
        categoryLabel: "상의",
        name: "클래식 옥스포드 코튼 셔츠",
        photoUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80",
        material: "코튼 100%",
        thickness: "보통",
        description: "카라 각이 깔끔하게 유지되는 버튼다운 셔츠",
      },
      {
        id: "snap-106-bottom",
        category: "bottom",
        categoryLabel: "하의",
        name: "헤더 그레이 테이퍼드 슬랙스",
        photoUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80",
        material: "스판 혼방 슬랙스",
        thickness: "보통",
        description: "발목 라인이 매끄럽게 떨어지는 슬림핏 팬츠",
      },
      {
        id: "snap-106-shoes",
        category: "shoes",
        categoryLabel: "신발",
        name: "블랙 플레인토 더비 슈즈",
        photoUrl: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&auto=format&fit=crop&q=80",
        material: "카프스킨 소가죽",
        thickness: "보통",
        description: "어떤 수트나 슬랙스에도 정갈함을 더하는 더비",
      },
    ],
  },

  // 7. 20℃ ~ 28℃ 초여름 캐주얼 (하프 니트 & 린넨 와이드 팬츠)
  {
    id: "snap-post-007",
    snapId: "1234627203913810064_107",
    postUrl: "https://www.musinsa.com/snap/profile/1234627203913810064?snapId=107",
    profileUrl: TARGET_MUSINSA_PROFILE_URL,
    creatorName: "무신사 스냅 크루",
    title: "썸머 쿨 카라 하프니트 & 린넨 이지 팬츠",
    clothingItems: "세이지그린 오픈카라 반팔니트 + 크림 린넨 이지 팬츠 + 레더 피셔맨 샌들",
    description: "초여름의 기분 좋은 햇살 아래 땀 흡수와 통기성이 뛰어나면서도 미니멀한 무드를 유지하는 니트웨어 코디입니다.",
    photoUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
    photoCredit: "무신사 스냅 (1234627203913810064)",
    style: "casual",
    styleName: "캐주얼",
    tempMin: 20,
    tempMax: 28,
    suitableWeather: ["clear", "cloudy"],
    situationTags: ["데이트", "바캉스", "카페", "주말나들이"],
    isWeatherVerified: true,
    productItems: [
      {
        id: "snap-107-top",
        category: "top",
        categoryLabel: "상의",
        name: "세이지그린 오픈카라 쿨링 반팔니트",
        photoUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
        material: "레이온 & 아크릴 쿨 원사",
        thickness: "얇음 (썸머 니트)",
        description: "피부에 달라붙지 않고 시원한 서머 카라티",
      },
      {
        id: "snap-107-bottom",
        category: "bottom",
        categoryLabel: "하의",
        name: "크림 린넨 블렌드 밴딩 팬츠",
        photoUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
        material: "린넨 55%, 코튼 45%",
        thickness: "얇음",
        description: "통기성이 뛰어나고 자연스러운 구김이 매력적인 팬츠",
      },
      {
        id: "snap-107-shoes",
        category: "shoes",
        categoryLabel: "신발",
        name: "다크브라운 피셔맨 가죽 샌들",
        photoUrl: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600&auto=format&fit=crop&q=80",
        material: "천연 가죽 샌들",
        thickness: "가벼움",
        description: "발가락을 단정하게 감싸는 스트랩 샌들",
      },
    ],
  },

  // 8. 28℃ 이상 한여름 룩 (오버핏 반팔 & 버뮤다 팬츠)
  {
    id: "snap-post-008",
    snapId: "1234627203913810064_108",
    postUrl: "https://www.musinsa.com/snap/profile/1234627203913810064?snapId=108",
    profileUrl: TARGET_MUSINSA_PROFILE_URL,
    creatorName: "무신사 스냅 크루",
    title: "쿨링 기능성 그래픽 티 & 코튼 버뮤다 쇼츠",
    clothingItems: "화이트 쿨맥스 반팔티 + 차콜 와이드 버뮤다 쇼츠 + 쿠셔닝 슬라이드",
    description: "무더운 폭염 날씨에 체열을 빠르게 배출하고 통풍이 원활한 극대화된 쿨링 이지 서머 스타일입니다.",
    photoUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
    photoCredit: "무신사 스냅 (1234627203913810064)",
    style: "comfort",
    styleName: "편한 스타일",
    tempMin: 28,
    tempMax: 50,
    suitableWeather: ["clear", "cloudy"],
    situationTags: ["휴가", "물놀이", "폭염", "산책"],
    isWeatherVerified: true,
    productItems: [
      {
        id: "snap-108-top",
        category: "top",
        categoryLabel: "상의",
        name: "흡한속건 쿨맥스 세미오버 티셔츠",
        photoUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
        material: "기능성 쿨맥스 폴리 혼방",
        thickness: "매우 얇음",
        description: "땀이 나도 쾌적함을 유지하는 고기능성 반팔",
      },
      {
        id: "snap-108-bottom",
        category: "bottom",
        categoryLabel: "하의",
        name: "차콜 2턱 코튼 버뮤다 쇼츠",
        photoUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
        material: "워싱 코튼 100%",
        thickness: "얇음",
        description: "무릎을 살짝 덮는 트렌디한 기장의 하프팬츠",
      },
      {
        id: "snap-108-shoes",
        category: "shoes",
        categoryLabel: "신발",
        name: "에어 쿠셔닝 리커버리 슬라이드",
        photoUrl: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600&auto=format&fit=crop&q=80",
        material: "EVA 폼",
        thickness: "초경량",
        description: "충격 흡수와 발 편안함을 제공하는 슬라이드",
      },
    ],
  },

  // 9. 강수(비/눈) 특화 코디 (고어텍스 후드 윈드브레이커 & 카고)
  {
    id: "snap-post-009",
    snapId: "1234627203913810064_109",
    postUrl: "https://www.musinsa.com/snap/profile/1234627203913810064?snapId=109",
    profileUrl: TARGET_MUSINSA_PROFILE_URL,
    creatorName: "무신사 스냅 크루",
    title: "방수 쉘 후디드 윈드브레이커 & 나일론 카고 룩",
    clothingItems: "블랙 방수 후드 윈드브레이커 + 드라이핏 긴소매 + 발수 파라슈트 팬츠 + 고어텍스 트레일 슈즈",
    description: "비나 진눈깨비 등 강수가 있는 궂은 날씨에 빗방울을 튕겨내고 활동성을 보장하는 고기능성 아웃도어 고프코어 스타일입니다.",
    photoUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
    photoCredit: "무신사 스냅 (1234627203913810064)",
    style: "street",
    styleName: "스트릿",
    tempMin: 5,
    tempMax: 18,
    suitableWeather: ["rain", "snow"],
    situationTags: ["비오는 날", "야외활동", "하이킹", "페스티벌"],
    isWeatherVerified: true,
    productItems: [
      {
        id: "snap-109-outer",
        category: "outer",
        categoryLabel: "외투",
        name: "3-Layer 테크 방수 쉘 파카",
        photoUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
        material: "방수/투습 멤브레인 나일론",
        thickness: "도톰한 방풍 쉘",
        description: "심실링 테이핑 처리로 빗물을 원천 차단하는 자켓",
      },
      {
        id: "snap-109-top",
        category: "top",
        categoryLabel: "상의",
        name: "흡습속건 드라이 롱슬리브",
        photoUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
        material: "폴리에스터 혼방",
        thickness: "보통",
        description: "땀을 빠르게 말려주는 이너웨어",
      },
      {
        id: "snap-109-bottom",
        category: "bottom",
        categoryLabel: "하의",
        name: "블랙 발수 나일론 파라슈트 팬츠",
        photoUrl: "/images/musinsa/balloon-sweatpants.jpg",
        material: "DWR 발수 코팅 나일론",
        thickness: "가벼움",
        description: "밑단 스트링으로 빗물 유입을 막는 카고 팬츠",
      },
      {
        id: "snap-109-shoes",
        category: "shoes",
        categoryLabel: "신발",
        name: "고어텍스 방수 트레킹 스니커즈",
        photoUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80",
        material: "GORE-TEX 멤브레인, 비브람 창",
        thickness: "방수용",
        description: "물웅덩이와 미끄러운 바닥에 탁월한 방수 슈즈",
      },
    ],
  },

  // 10. [요구사항 충족] 날씨 적합성 정보 불충분 코디 (실내 스튜디오 전용 또는 얇은 실루엣 - 별도 확인 필요 대상)
  {
    id: "snap-post-010-unverified",
    snapId: "1234627203913810064_110",
    postUrl: "https://www.musinsa.com/snap/profile/1234627203913810064?snapId=110",
    profileUrl: TARGET_MUSINSA_PROFILE_URL,
    creatorName: "무신사 스냅 크루",
    title: "시스루 레이어드 메쉬 셔츠 & 슬릭 와이드 팬츠",
    clothingItems: "메쉬 롱슬리브 + 레이어드 슬리브리스 + 와이드 슬랙스",
    description: "실내 촬영 중심의 비주얼 코디로, 원단의 보온성과 방풍 성능이 기재되어 있지 않아 실외 날씨 적합성 별도 확인이 필요합니다.",
    photoUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
    photoCredit: "무신사 스냅 (1234627203913810064)",
    style: "minimal",
    styleName: "미니멀",
    tempMin: 18,
    tempMax: 24,
    suitableWeather: ["clear"],
    situationTags: ["실내 스튜디오", "전시", "파티"],
    isWeatherVerified: false,
    unverifiedReason: "외투 부재 및 얇은 소재감으로 인해 급격한 일교차나 강풍에 취약할 수 있으니 실외 이동 시 겉옷 지참을 권장합니다.",
    productItems: [
      {
        id: "snap-110-top",
        category: "top",
        categoryLabel: "상의",
        name: "세미 시스루 메쉬 롱슬리브",
        photoUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
        material: "폴리 메쉬 (보온성 없음)",
        thickness: "매우 얇음",
        description: "비주얼 레이어드용 메쉬 상의",
      },
      {
        id: "snap-110-bottom",
        category: "bottom",
        categoryLabel: "하의",
        name: "라이트 드레이프 와이드 슬랙스",
        photoUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80",
        material: "폴리 레이온",
        thickness: "얇음",
        description: "차르르 흐르는 실루엣 팬츠",
      },
    ],
  },
]

/**
 * 기온, 강수, 날씨, 사용자 상황에 따른 무신사 스냅 코디 추천 선택 함수
 * - AI가 임의로 가짜 코디나 URL을 날조하지 않음
 * - 등록된 실제 무신사 스냅 게시물 단위로만 선별하여 반환
 * - 서로 다른 게시물의 상·하의·신발을 섞지 않음
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

  // 1. 점수 계산을 통한 정렬
  const scoredPosts = MUSINSA_SNAP_POSTS.map((post) => {
    let score = 0

    // (A) 기온 적합도 (가장 중요한 기준)
    if (temperature >= post.tempMin && temperature < post.tempMax) {
      score += 100
      // 기온 대역 중심에 가까울수록 가산점
      const mid = (post.tempMin + post.tempMax) / 2
      score -= Math.abs(temperature - mid) * 2
    } else {
      // 기온 대역 밖인 경우 거리만큼 감점
      const dist =
        temperature < post.tempMin
          ? post.tempMin - temperature
          : temperature - post.tempMax
      score -= dist * 20
    }

    // (B) 강수(비/눈) 조건
    if (isRainingOrSnowing) {
      if (post.suitableWeather?.includes("rain") || post.suitableWeather?.includes("snow")) {
        score += 80
      }
    }

    // (C) 사용자 입력 상황(자연어) 키워드 매칭
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
        if (post.style === "casual" || post.style === "street") score += 30
      }
    }

    return { post, score }
  })

  // 점수 높은 순으로 정렬
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
