export interface TrackItem {
  id: string
  title: string
  artist: string
  genre: string
  origin: "domestic" | "international"
  releaseYear: number
  albumArtUrl: string
  shortReason: string
  weatherConditions: Array<"rain" | "snow" | "cold" | "cool" | "mild" | "warm" | "hot" | "clear" | "cloudy">
  situationTags: string[]
  searchQuery: string
  officialVideoId: string
}

/**
 * 날씨 및 상황 맞춤 개별 단일 곡(Individual Track) 카탈로그
 * - 플레이리스트/모음집이 아닌 '곡 하나' 단위의 추천
 * - 국내외 다양한 장르(어쿠스틱, 재즈, R&B, 팝, 발라드, 로파이, K-Pop)와 발매 시기 수록
 * - 특정 가수 반복 편중 방지 및 공식 음원/MV 비디오 ID 매핑
 */
export const MUSIC_CATALOG: TrackItem[] = [
  // ==========================================
  // 1. 비 오는 날 (Rain) - 촉촉하고 차분한 감성
  // ==========================================
  {
    id: "track-rain-heize",
    title: "비도 오고 그래서 (Feat. 신용재)",
    artist: "헤이즈 (Heize)",
    genre: "R&B / 발라드",
    origin: "domestic",
    releaseYear: 2017,
    albumArtUrl: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=600&auto=format&fit=crop&q=80",
    shortReason: "비 내리는 날 빗소리와 함께 촉촉하게 감성을 채워주는 대표적인 비 노래입니다.",
    weatherConditions: ["rain"],
    situationTags: ["비", "출근", "퇴근", "휴식", "카페"],
    searchQuery: "헤이즈 비도 오고 그래서 Official Audio",
    officialVideoId: "afxLaQiLu-o",
  },
  {
    id: "track-rain-lauv",
    title: "Paris in the Rain",
    artist: "Lauv",
    genre: "Pop / R&B",
    origin: "international",
    releaseYear: 2018,
    albumArtUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80",
    shortReason: "창밖의 빗방울을 보며 우아하고 로맨틱한 기분을 느낄 수 있는 세련된 팝 트랙입니다.",
    weatherConditions: ["rain"],
    situationTags: ["비", "데이트", "드라이브", "휴식"],
    searchQuery: "Lauv Paris in the Rain Official Video",
    officialVideoId: "kOCkne-Bku4",
  },
  {
    id: "track-rain-epik-high",
    title: "우산 (Feat. 윤하)",
    artist: "에픽하이 (Epik High)",
    genre: "힙합 / 감성 랩",
    origin: "domestic",
    releaseYear: 2008,
    albumArtUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    shortReason: "차분한 빗소리 피아노 루프와 포근한 보컬이 위로를 건네는 스테디셀러 명곡입니다.",
    weatherConditions: ["rain"],
    situationTags: ["비", "퇴근길", "감성", "산책"],
    searchQuery: "에픽하이 우산 윤하 Official Audio",
    officialVideoId: "mFmWzL_wA9Y",
  },
  {
    id: "track-rain-paul-kim",
    title: "비 (Rain)",
    artist: "폴킴 (Paul Kim)",
    genre: "어쿠스틱 / 발라드",
    origin: "domestic",
    releaseYear: 2016,
    albumArtUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80",
    shortReason: "서정적인 피아노 연주와 담백한 음색이 비 오는 날의 고요함을 편안하게 만들어줍니다.",
    weatherConditions: ["rain"],
    situationTags: ["비", "휴식", "공부", "독서"],
    searchQuery: "폴킴 비 Official Audio",
    officialVideoId: "sS_xWn0e_r4",
  },
  {
    id: "track-rain-bruno-major",
    title: "Nothing",
    artist: "Bruno Major",
    genre: "Neo-Soul / Acoustic",
    origin: "international",
    releaseYear: 2020,
    albumArtUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    shortReason: "비 오는 날 따뜻한 방 안에서 소중한 사람과 함께 있는 듯한 따스한 어쿠스틱 선율입니다.",
    weatherConditions: ["rain"],
    situationTags: ["비", "휴식", "데이트", "힐링"],
    searchQuery: "Bruno Major Nothing Official Video",
    officialVideoId: "ucVQEimmS3k",
  },

  // ==========================================
  // 2. 눈 오는 날 / 추운 겨울 (Snow & Cold, 5℃ 이하)
  // ==========================================
  {
    id: "track-snow-ziont",
    title: "눈 (Feat. 이문세)",
    artist: "자이언티 (Zion.T)",
    genre: "R&B / Soul",
    origin: "domestic",
    releaseYear: 2017,
    albumArtUrl: "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=600&auto=format&fit=crop&q=80",
    shortReason: "하얗게 내리는 눈과 함께 마음까지 훈훈하게 덥혀주는 포근한 윈터 발라드입니다.",
    weatherConditions: ["snow", "cold"],
    situationTags: ["눈", "겨울", "퇴근", "산책"],
    searchQuery: "자이언티 눈 이문세 Official Audio",
    officialVideoId: "fiGSL0fWpXo",
  },
  {
    id: "track-cold-norah-jones",
    title: "Come Away With Me",
    artist: "Norah Jones",
    genre: "Jazz / Vocal",
    origin: "international",
    releaseYear: 2002,
    albumArtUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80",
    shortReason: "찬 공기에 언 몸을 녹여주는 감미로운 재즈 보컬과 따스한 어쿠스틱 피아노입니다.",
    weatherConditions: ["cold", "snow", "cloudy"],
    situationTags: ["겨울", "카페", "면접", "차분함"],
    searchQuery: "Norah Jones Come Away With Me Official Audio",
    officialVideoId: "lbjZPFBD6JU",
  },
  {
    id: "track-cold-iu-winter",
    title: "겨울잠 (Winter Sleep)",
    artist: "아이유 (IU)",
    genre: "발라드 / 어쿠스틱",
    origin: "domestic",
    releaseYear: 2021,
    albumArtUrl: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=600&auto=format&fit=crop&q=80",
    shortReason: "차분하고 담담한 피아노와 깊은 보컬이 시린 겨울 공기를 따뜻하게 감싸줍니다.",
    weatherConditions: ["cold", "snow"],
    situationTags: ["겨울", "휴식", "위로", "독서"],
    searchQuery: "아이유 겨울잠 Official Audio",
    officialVideoId: "w_i3zR1w28g",
  },
  {
    id: "track-cold-chet-baker",
    title: "I Fall In Love Too Easily",
    artist: "Chet Baker",
    genre: "Classic Jazz",
    origin: "international",
    releaseYear: 1956,
    albumArtUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80",
    shortReason: "쌀쌀한 날씨에 어깨를 감싸주는 쳇 베이커의 애잔하고 깊은 트럼펫과 보컬입니다.",
    weatherConditions: ["cold", "cloudy"],
    situationTags: ["퇴근", "밤", "차분함", "생각정리"],
    searchQuery: "Chet Baker I Fall In Love Too Easily Official Audio",
    officialVideoId: "3zrSoHgPDe0",
  },
  {
    id: "track-cold-day6",
    title: "예뻤어 (You Were Beautiful)",
    artist: "DAY6 (데이식스)",
    genre: "모던 록 / 밴드",
    origin: "domestic",
    releaseYear: 2017,
    albumArtUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80",
    shortReason: "추운 바람을 맞으며 걸을 때 가슴 벅찬 에너지를 채워주는 감성 밴드 트랙입니다.",
    weatherConditions: ["cold", "cool"],
    situationTags: ["출근", "퇴근", "산책", "드라이브"],
    searchQuery: "DAY6 예뻤어 Official MV",
    officialVideoId: "BS7tz2rAOMA",
  },

  // ==========================================
  // 3. 선선한 가을 / 초봄 (Cool, 5℃ ~ 14℃)
  // ==========================================
  {
    id: "track-cool-iu-letter",
    title: "밤편지 (Through the Night)",
    artist: "아이유 (IU)",
    genre: "포크 / 어쿠스틱",
    origin: "domestic",
    releaseYear: 2017,
    albumArtUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
    shortReason: "선선한 바람이 부는 저녁, 밤공기와 가장 잘 어울리는 잔잔하고 정겨운 어쿠스틱 명곡입니다.",
    weatherConditions: ["cool", "clear"],
    situationTags: ["퇴근길", "산책", "휴식", "가을"],
    searchQuery: "아이유 밤편지 Official Audio",
    officialVideoId: "BzYnNdJhZQw",
  },
  {
    id: "track-cool-taylor-swift",
    title: "cardigan",
    artist: "Taylor Swift",
    genre: "Indie Folk / Pop",
    origin: "international",
    releaseYear: 2020,
    albumArtUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80",
    shortReason: "도톰한 가디건을 걸치고 걷는 선선한 가을 날씨에 딱 들어맞는 서정적인 포크 팝입니다.",
    weatherConditions: ["cool", "cloudy"],
    situationTags: ["산책", "출근", "나들이", "생각"],
    searchQuery: "Taylor Swift cardigan Official Music Video",
    officialVideoId: "K-a8s8OLBSE",
  },
  {
    id: "track-cool-jannabi",
    title: "가을밤에 든 생각",
    artist: "잔나비 (JANNABI)",
    genre: "인디 록 / 빈티지 팝",
    origin: "domestic",
    releaseYear: 2020,
    albumArtUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80",
    shortReason: "낙엽 지는 계절의 낭만과 아련한 추억을 떠올리게 하는 따스한 빈티지 사운드입니다.",
    weatherConditions: ["cool", "clear"],
    situationTags: ["가을", "데이트", "산책", "감성"],
    searchQuery: "잔나비 가을밤에 든 생각 Official Audio",
    officialVideoId: "jTqPzB3cW0w",
  },
  {
    id: "track-cool-coldplay",
    title: "Sparks",
    artist: "Coldplay",
    genre: "Acoustic / Britpop",
    origin: "international",
    releaseYear: 2000,
    albumArtUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80",
    shortReason: "단순하지만 가슴 깊이 울리는 어쿠스틱 기타와 크리스 마틴의 담백한 보컬 트랙입니다.",
    weatherConditions: ["cool", "cloudy"],
    situationTags: ["휴식", "카페", "면접", "긴장완화"],
    searchQuery: "Coldplay Sparks Official Audio",
    officialVideoId: "Ar48yzqn1PE",
  },

  // ==========================================
  // 4. 온화하고 쾌적한 봄/초여름 (Mild, 15℃ ~ 22℃)
  // ==========================================
  {
    id: "track-mild-newjeans-ditto",
    title: "Ditto",
    artist: "NewJeans (뉴진스)",
    genre: "Baltimore Club / K-Pop",
    origin: "domestic",
    releaseYear: 2022,
    albumArtUrl: "https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=600&auto=format&fit=crop&q=80",
    shortReason: "포근하고 설레는 계절감과 특유의 빈티지한 비트로 기분을 산뜻하게 환기해 주는 곡입니다.",
    weatherConditions: ["mild", "clear"],
    situationTags: ["출근", "산책", "드라이브", "데이트"],
    searchQuery: "NewJeans Ditto Official Audio",
    officialVideoId: "pSUydWEqKwE",
  },
  {
    id: "track-mild-maroon5",
    title: "Sunday Morning",
    artist: "Maroon 5",
    genre: "Pop / Smooth Soul",
    origin: "international",
    releaseYear: 2004,
    albumArtUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&auto=format&fit=crop&q=80",
    shortReason: "맑고 온화한 날씨에 여유로움과 활력을 더해주는 기분 좋은 재즈 팝의 정석입니다.",
    weatherConditions: ["mild", "clear"],
    situationTags: ["주말", "카페", "데이트", "출근"],
    searchQuery: "Maroon 5 Sunday Morning Official Music Video",
    officialVideoId: "S2Cti12XBw4",
  },
  {
    id: "track-mild-baekyerin",
    title: "Square (2017)",
    artist: "백예린 (Yerin Baek)",
    genre: "City Pop / 인디 팝",
    origin: "domestic",
    releaseYear: 2019,
    albumArtUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80",
    shortReason: "산들바람 부는 맑은 날 야외를 걸을 때 자유롭고 청량한 에너지를 선사하는 노래입니다.",
    weatherConditions: ["mild", "clear"],
    situationTags: ["산책", "나들이", "주말", "쇼핑"],
    searchQuery: "백예린 Square 2017 Official Audio",
    officialVideoId: "Wn6r0mS33L0",
  },
  {
    id: "track-mild-jvke",
    title: "golden hour",
    artist: "JVKE",
    genre: "Chamber Pop",
    origin: "international",
    releaseYear: 2022,
    albumArtUrl: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=600&auto=format&fit=crop&q=80",
    shortReason: "황금빛 노을과 맑은 하늘 아래에서 벅차오르는 감동을 주는 피아노 팝입니다.",
    weatherConditions: ["mild", "clear"],
    situationTags: ["데이트", "노을", "드라이브", "여행"],
    searchQuery: "JVKE golden hour Official Music Video",
    officialVideoId: "PEM0Vs8jf1w",
  },

  // ==========================================
  // 5. 따뜻하고 활기찬 여름 (Warm & Hot, 23℃ 이상)
  // ==========================================
  {
    id: "track-warm-newjeans-hype",
    title: "Hype Boy",
    artist: "NewJeans (뉴진스)",
    genre: "R&B / Pop",
    origin: "domestic",
    releaseYear: 2022,
    albumArtUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&q=80",
    shortReason: "화창하고 생동감 넘치는 날씨에 발걸음을 가볍게 만들어주는 시원하고 트렌디한 팝입니다.",
    weatherConditions: ["warm", "hot", "clear"],
    situationTags: ["운동", "출근", "나들이", "친구모임"],
    searchQuery: "NewJeans Hype Boy Official MV",
    officialVideoId: "11cta61Wi0g",
  },
  {
    id: "track-warm-dua-lipa",
    title: "Levitating",
    artist: "Dua Lipa",
    genre: "Disco-Pop / Funk",
    origin: "international",
    releaseYear: 2020,
    albumArtUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    shortReason: "햇살 가득한 여름날 에너지를 100% 충전해 주는 중독성 강한 디스코 팝입니다.",
    weatherConditions: ["warm", "hot", "clear"],
    situationTags: ["운동", "러닝", "드라이브", "활력"],
    searchQuery: "Dua Lipa Levitating Official Music Video",
    officialVideoId: "TUVcZfQe-Kw",
  },
  {
    id: "track-warm-akmu",
    title: "Give Love",
    artist: "AKMU (악뮤)",
    genre: "어쿠스틱 팝",
    origin: "domestic",
    releaseYear: 2014,
    albumArtUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
    shortReason: "톡톡 튀는 멜로디와 밝고 사랑스러운 에너지가 더운 날씨의 피로를 잊게 해줍니다.",
    weatherConditions: ["warm", "hot", "clear"],
    situationTags: ["산책", "나들이", "일상", "데이트"],
    searchQuery: "AKMU Give Love Official MV",
    officialVideoId: "x2XX3ccoMDQ",
  },
  {
    id: "track-warm-surfaces",
    title: "Sunday Best",
    artist: "Surfaces",
    genre: "Indie Pop / Chill",
    origin: "international",
    releaseYear: 2019,
    albumArtUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
    shortReason: "맑은 하늘 아래 기분 좋은 긍정 에너지를 불어넣어 주는 여유로운 여름 칠(Chill) 팝입니다.",
    weatherConditions: ["warm", "hot", "clear"],
    situationTags: ["휴식", "산책", "드라이브", "여행"],
    searchQuery: "Surfaces Sunday Best Official Music Video",
    officialVideoId: "_83K3AH3PJg",
  },
]

/**
 * 날씨(기온, 강수, 날씨상태)와 사용자 상황에 맞추어 개별 단일 곡을 추천합니다.
 * - 세션 히스토리(excludedTrackIds)를 배제하여 매번 새로운 아티스트와 곡 추천
 * - 모든 후보가 소진되면 리셋 안내와 함께 순환 추천
 */
export function selectIndividualTrack(
  temperature: number,
  precipitationType: string,
  situation?: string | null,
  excludedTrackIds: string[] = [],
): {
  track: TrackItem
  isExhausted: boolean
  totalCandidates: number
} {
  const cleanSituation = (situation || "").toLowerCase()

  // 1. 날씨 조건 분류
  let targetCondition: "rain" | "snow" | "cold" | "cool" | "mild" | "warm" | "hot" = "mild"

  if (precipitationType === "rain") {
    targetCondition = "rain"
  } else if (precipitationType === "snow") {
    targetCondition = "snow"
  } else if (temperature < 5) {
    targetCondition = "cold"
  } else if (temperature < 15) {
    targetCondition = "cool"
  } else if (temperature < 23) {
    targetCondition = "mild"
  } else if (temperature < 28) {
    targetCondition = "warm"
  } else {
    targetCondition = "hot"
  }

  // 2. 1차 후보군: 날씨 조건 일치 트랙
  let candidates = MUSIC_CATALOG.filter((t) =>
    t.weatherConditions.includes(targetCondition),
  )

  if (candidates.length === 0) {
    candidates = MUSIC_CATALOG
  }

  // 3. 사용자 상황 키워드 가중치 (면접/긴장 -> 차분한 곡, 운동 -> 신나는 곡)
  if (cleanSituation.includes("면접") || cleanSituation.includes("긴장") || cleanSituation.includes("공부") || cleanSituation.includes("집중")) {
    const calmTracks = candidates.filter((t) =>
      t.genre.includes("Jazz") || t.genre.includes("어쿠스틱") || t.genre.includes("포크") || t.situationTags.includes("면접") || t.situationTags.includes("차분함"),
    )
    if (calmTracks.length > 0) candidates = calmTracks
  } else if (cleanSituation.includes("운동") || cleanSituation.includes("러닝") || cleanSituation.includes("조깅") || cleanSituation.includes("헬스")) {
    const energeticTracks = candidates.filter((t) =>
      t.genre.includes("Pop") || t.genre.includes("록") || t.situationTags.includes("운동"),
    )
    if (energeticTracks.length > 0) candidates = energeticTracks
  } else if (cleanSituation.includes("데이트") || cleanSituation.includes("약속")) {
    const dateTracks = candidates.filter((t) => t.situationTags.includes("데이트"))
    if (dateTracks.length > 0) candidates = dateTracks
  }

  const totalCandidates = candidates.length

  // 4. 세션에서 이미 노출된 곡 제외 (다양성 보장 & 중복 방지)
  const available = candidates.filter((t) => !excludedTrackIds.includes(t.id))

  if (available.length > 0) {
    // 이전 아티스트와 겹치지 않도록 직전 곡 아티스트 확인
    return {
      track: available[0],
      isExhausted: false,
      totalCandidates,
    }
  }

  // 모든 후보를 다 본 경우: 첫 번째 곡으로 리셋 순환
  return {
    track: candidates[0],
    isExhausted: true,
    totalCandidates,
  }
}
