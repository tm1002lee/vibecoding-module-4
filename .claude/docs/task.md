# Task List - 방화벽 트래픽 로그 분석 시스템

## 완료된 작업

### Phase 1: Backend API 구현
- [x] 기존 User 관련 코드 삭제
- [x] TrafficLog 모델 및 API (CRUD, 페이지네이션, 필터링)
- [x] MLModel 모델 및 API (CRUD, 모델 병합)
- [x] Alert 모델 및 API (CRUD, 관계 조회)
- [x] SQLite 데이터베이스 설정
- [x] API 문서화 (Swagger UI)

### Phase 2: 로그 수집 도구 구현
- [x] logcollector C 데몬 소스 코드 작성
  - [x] 메모리 캐시 관리 (cache.c/h)
  - [x] SQLite 연결 및 저장 (db.c/h)
  - [x] 랜덤 트래픽 생성 (generator.c/h)
  - [x] 메인 데몬 로직 (main.c)
  - [x] Makefile 및 문서화
- [x] log-gen Python 테스트 툴 작성
  - [x] 랜덤 트래픽 생성
  - [x] Backend API 전송
  - [x] 배치/데몬 모드
  - [x] 75+ 로그 생성 테스트 성공

### Phase 3: Frontend 구현
- [x] TypeScript 타입 정의 (TrafficLog, Alert)
- [x] API 호출 함수 (lib/api.ts)
- [x] 컴포넌트 구현
  - [x] Navigation (상단 네비게이션)
  - [x] TrafficLogTable (로그 테이블)
  - [x] AlertCard (경고 카드, 위험도 색상)
  - [x] Pagination (페이지네이션)
- [x] 페이지 구현
  - [x] 대시보드 (/, 통계 및 미리보기)
  - [x] 트래픽 로그 목록 (/logs, 필터링)
  - [x] 경고 목록 (/alerts, 위험도 필터)

### Phase 4: 시스템 통합 테스트
- [x] Backend 서버 실행 (http://localhost:8000)
- [x] Frontend 서버 실행 (http://localhost:3000)
- [x] log-gen으로 테스트 데이터 생성 (75+ 로그)
- [x] API 엔드포인트 검증
- [x] 전체 시스템 정상 작동 확인

## 진행 중인 작업
- 없음

## 대기 중인 작업

### 우선순위 1: ML 모델링 및 이상 탐지
- [ ] 이상 탐지 알고리즘 구현
  - [ ] 트래픽 패턴 분석 로직
  - [ ] 위험도 계산 (0-100)
  - [ ] 모델 학습 API 구현
  - [ ] 모델 저장 및 로드
- [ ] Alert 자동 생성 로직
  - [ ] 실시간 트래픽 분석
  - [ ] 임계치 기반 Alert 생성
  - [ ] Alert API 연동

### 우선순위 2: 테스트 데이터 및 검증
- [ ] Alert 테스트 데이터 생성
  - [ ] 더미 MLModel 생성
  - [ ] 더미 Alert 생성 (다양한 위험도)
  - [ ] Frontend Alert 페이지 검증
- [ ] 대량 로그 생성 테스트
  - [ ] log-gen 데몬 모드 장시간 실행
  - [ ] DB Rolling 동작 확인
  - [ ] 페이지네이션 성능 테스트

### 우선순위 3: 추가 기능 구현
- [ ] logcollector C 데몬 빌드
  - [ ] MinGW 또는 Visual Studio 설치
  - [ ] SQLite3 라이브러리 설치
  - [ ] 컴파일 및 실행 테스트
- [ ] 실시간 로그 업데이트
  - [ ] WebSocket 또는 SSE 구현
  - [ ] Frontend 실시간 반영
- [ ] 모델 관리 UI
  - [ ] 모델 생성 폼
  - [ ] 모델 병합 인터페이스
  - [ ] 모델 목록 페이지

### 우선순위 4: 운영 및 최적화
- [ ] 성능 최적화
  - [ ] 데이터베이스 인덱스 튜닝
  - [ ] API 응답 시간 측정 및 개선
  - [ ] Frontend 번들 크기 최적화
- [ ] 모니터링 및 로깅
  - [ ] 시스템 헬스체크 API
  - [ ] 로그 수집 통계
  - [ ] 에러 추적

## 완료 조건

### Phase 5: ML 모델링 (다음 마일스톤)
- [ ] 이상 탐지 알고리즘 동작
- [ ] Alert 자동 생성
- [ ] 모델 학습 및 병합 기능
- [ ] Frontend에서 위험도별 경고 확인

### Phase 6: 프로덕션 준비 (최종 목표)
- [ ] logcollector C 데몬 안정화
- [ ] 커널 모듈 연동 (선택사항)
- [ ] 운영 환경 배포 가이드
- [ ] 전체 시스템 문서화
