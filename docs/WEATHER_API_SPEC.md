# 날씨 데이터 제공처 확정 및 연동 규격서 (Weather API Specification)

> **문서 버전**: v1.0.0  
> **기준 문서**: `PRD.md` (F-02. 날씨 제공처 확정)  
> **작성 일자**: 2026-11-20  
> **스프린트**: Sprint 0 기술 스파이크 산출물  

---

## 1. 개요 및 제공처 선정

PRD F-02(날씨 제공처 확정)에 명시된 6가지 확인 항목(이용 조건, 도시 지원, 정보 유형, 정보 시각, 강수 의미, 출처 표기)을 조사하고, 1차 배포 및 프로덕션 환경에 적용할 날씨 데이터 제공처를 확정합니다.

### 1.1 최종 확정 제공처: Open-Meteo Weather API
- **제공 기관**: Open-Meteo (독일 기상청 DWD, 유럽중기예보센터 ECMWF, 미국 NOAA 수치예보 모델 통합 앙상블)
- **선정 사유**:
  1. **무료 이용 조건**: 비상업 및 상업적 용도로 일 10,000건 API 호출 무료 (API 키 발급/만료 위험 없음).
  2. **도시 지원 완결**: 서울, 광주, 부산의 WGS84 좌표 기반 초고해상도 실시간 쿼리 지원.
  3. **WMO 기상 코드 표준**: 비, 눈, 진눈깨비(혼합) 등 강수 상태가 국제기상기구(WMO) 코드로 명확히 세분화되어 있어 PRD F-06 강수 판정 조건과 1:1 완벽 매핑 가능.
  4. **정보 투명성**: CC-BY 4.0 라이선스 규정에 따라 원문 링크(`https://open-meteo.com/`)와 함께 '모델 기반 현재 날씨'로 정확히 표기 가능.

---

## 2. PRD F-02 요구사항 점검표

| 확인 항목 | 요구사항 | 확정 내용 및 대응 규칙 |
|---|---|---|
| **이용 조건** | 무료 이용 가능 여부 | 일 10,000건 무료 (무계정/무인증키 호출, 트래픽 한도 초과 시 429 반환 핸들링) |
| **도시 지원** | 서울·광주·부산 지원 | 서울(37.5665, 126.9780), 광주(35.1595, 126.8526), 부산(35.1796, 129.0756) |
| **정보 유형** | 관측 vs 모델 기반 구분 | **'모델 기반 현재 날씨'** (수치 기상 관측 모델 기반 실시간 추정값으로 명시) |
| **정보 시각** | 정보 기준 시각 및 시간대 | KST(`Asia/Seoul`) 기준 ISO 8601 시각 반환 (예: `2026-11-20T17:00`) |
| **강수 의미** | 강수 유형, 강수량, 단위 | - 강수량 단위: `mm` (현재 시간 집계값)<br>- 강수 유형: WMO Weather Interpretation Codes (0~99) |
| **출처 표기** | 제공 기관명, 링크, 문구 | - 제공 기관명: `Open-Meteo`<br>- 원문 링크: `https://open-meteo.com/`<br>- 고지: *"모델 기반 현재 날씨이며, 옷차림은 서비스의 편집 기준에 따른 추천입니다"* |

---

## 3. 지원 도시 좌표 및 엔드포인트 규격

### 3.1 도시 메타데이터
```typescript
export const SUPPORTED_CITIES = {
  seoul: {
    id: "seoul",
    name: "서울",
    latitude: 37.5665,
    longitude: 126.9780,
    timezone: "Asia/Seoul",
  },
  gwangju: {
    id: "gwangju",
    name: "광주",
    latitude: 35.1595,
    longitude: 126.8526,
    timezone: "Asia/Seoul",
  },
  busan: {
    id: "busan",
    name: "부산",
    latitude: 35.1796,
    longitude: 129.0756,
    timezone: "Asia/Seoul",
  },
} as const;

export type CityId = keyof typeof SUPPORTED_CITIES;
```

### 3.2 호출 엔드포인트 URL
```
GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,precipitation,weather_code&timezone=Asia%2FSeoul
```

- 요청 파라미터:
  - `latitude`, `longitude`: 도시 좌표
  - `current`: `temperature_2m` (기온, ℃), `precipitation` (강수량, mm), `weather_code` (WMO 코드)
  - `timezone`: `Asia/Seoul` (한국 표준시 자동 적용)

---

## 4. WMO 코드와 PRD 강수 유형 매핑 규격

PRD F-06에 규정된 5단계 강수 상태 판단을 위해 WMO 기상 코드를 다음과 같이 엄격 매핑합니다.

| WMO 코드 | Open-Meteo 설명 | PRD 판정 강수 상태 | 날씨 상태 표시 문구 | 강수 대비 추가 안내 |
|---|---|---|---|---|
| `0` | Clear sky | `none` (강수 없음) | 맑음 | 없음 |
| `1, 2, 3` | Mainly clear, partly cloudy, overcast | `none` (강수 없음) | 구름 약간 / 흐림 | 없음 |
| `45, 48` | Fog, depositing rime fog | `none` (강수 없음) | 안개 | 없음 |
| `51, 53, 55` | Drizzle (이슬비) | `rain` (비) | 이슬비 | 우산과 방수 신발도 함께 준비해 보세요. |
| `56, 57` | Freezing Drizzle | `mixed` (비·눈 혼합) | 진눈깨비 | 우산과 함께 방수·미끄럼 방지를 고려한 신발을 함께 준비해 보세요. |
| `61, 63, 65` | Rain (약/중/강한 비) | `rain` (비) | 비 | 우산과 방수 신발도 함께 준비해 보세요. |
| `66, 67` | Freezing Rain | `mixed` (비·눈 혼합) | 진눈깨비 | 우산과 함께 방수·미끄럼 방지를 고려한 신발을 함께 준비해 보세요. |
| `71, 73, 75` | Snow fall (약/중/강한 눈) | `snow` (눈) | 눈 | 방수와 미끄럼 방지를 고려한 신발을 준비해 보세요. |
| `77` | Snow grains | `snow` (눈) | 눈 | 방수와 미끄럼 방지를 고려한 신발을 준비해 보세요. |
| `80, 81, 82` | Rain showers (소나기) | `rain` (비) | 소나기 | 우산과 방수 신발도 함께 준비해 보세요. |
| `85, 86` | Snow showers | `snow` (눈) | 눈 소나기 | 방수와 미끄럼 방지를 고려한 신발을 준비해 보세요. |
| `95` | Thunderstorm (뇌우) | `rain` (비) | 뇌우 | 우산과 방수 신발도 함께 준비해 보세요. |
| `96, 99` | Thunderstorm with hail (우박) | `mixed` (비·눈 혼합) | 뇌우 및 우박 | 우산과 함께 방수·미끄럼 방지를 고려한 신발을 함께 준비해 보세요. |
| 기타 / 해석 불가 | Unmapped codes | `unknown` (확인 불가) | 상태 정보 없음 | 강수 여부를 확인할 수 없어 기온만 기준으로 추천했어요. |

---

## 5. 데이터 검증 및 에러 매핑 규칙 (PRD F-04, 5절)

1. **시각 유효성 검증 (`F-04`, `EX-07`)**:
   - `current.time`을 파싱하여 타임스탬프 계산
   - 기준 시각이 미래인 경우 (`refTime > now`) ➔ 유효성 실패 (`EX-07`)
   - 기준 시각이 현재보다 3시간 넘게 과거인 경우 (`now - refTime > 3 * 3600 * 1000`) ➔ 만료 처리 (`EX-07`)
2. **기온 유효성 검증 (`F-03`, `EX-05`)**:
   - `typeof temperature === 'number' && !isNaN(temperature)` 필수 검사
   - 결측 시 0℃로 절대 대체하지 않고 추천 중단 (`EX-05`)
3. **타임아웃 및 장애 제어 (`EX-03`, `EX-04`)**:
   - 호출 지연 10초 초과 시 AbortController로 중단 (`EX-03`)
   - 429 Too Many Requests 응답 시 잠시 후 다시 시도 안내 반환 (`EX-04`)
