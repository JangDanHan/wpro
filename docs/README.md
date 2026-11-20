# 프로젝트 문서 디렉토리 (`docs/`)

본 디렉토리는 **날씨 추천 앱 PRD**의 요구사항 및 후속 기능 고도화(공공데이터포털 기상청 단기예보 전환, 대한민국 전국 20,556개 행정구역 선택/검색 확장) 내역을 체계적으로 추적·관리하기 위한 공간입니다.

## 문서 목록 및 로드맵

| 문서명 | 설명 | 상태 / 최신 버전 |
|---|---|---|
| [DEVELOPMENT_PLAN.md](file:///c:/Users/jangd/OneDrive/바탕%20화면/wpro/docs/DEVELOPMENT_PLAN.md) | **전체 개발 계획서 및 스프린트(0~5) 로드맵** | 최신화 완료 (v2.0.0, 전국 기상청 지원 반영) |
| [WEATHER_API_SPEC.md](file:///c:/Users/jangd/OneDrive/바탕%20화면/wpro/docs/WEATHER_API_SPEC.md) | **기상청 날씨 API 연동 및 전국 행정구역 격자 규격서** | 최신화 완료 (v2.1.0, 20,556개 행정구역 매핑) |
| [TEST_SPECIFICATION.md](file:///c:/Users/jangd/OneDrive/바탕%20화면/wpro/docs/TEST_SPECIFICATION.md) | **예외 케이스(EX-01 ~ EX-15) 및 52개 테스트 명세** | 최신화 완료 (v2.0.0, 52/52 테스트 전원 통과) |
| [USER_TESTING_PROTOCOL.md](file:///c:/Users/jangd/OneDrive/바탕%20화면/wpro/docs/USER_TESTING_PROTOCOL.md) | **5인 사용자 검증(UT) 인터뷰 질문 및 측정 양식** | 작성 완료 (v1.0.0, Sprint 5) |
| [UT_RESULT_REPORT.md](file:///c:/Users/jangd/OneDrive/바탕%20화면/wpro/docs/UT_RESULT_REPORT.md) | **사용자 검증 결과 보고서 및 성공조건 평가** | 작성 완료 (v1.0.0, 사용성 100%, 유용성 80%) |

## 최신 개정 주요 내용 (v2.x)
1. **날씨 제공처 기상청 전환**: 공공데이터포털 기상청 단기예보 조회서비스(초단기실황 AWS 실측값 + 초단기예보 하늘상태) 연동 완료
2. **전국 행정구역(20,556개) 확장**: 시·도 → 시·군·구 → 읍·면·동 계층 선택 및 동일 지명 전체 주소 표기 실시간 검색 지원
3. **품질 및 안정성**: 52개 단위/통합 테스트 전원 통과 및 기상청 실제 API 200 OK 실시간 연동 검증
