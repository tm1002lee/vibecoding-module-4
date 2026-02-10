# Login 기능 개발 플랜

> 생성일: 2026-02-10
> 목적: 사용자 인증 시스템 구현 (로그인/로그아웃)

---

## Feature 1: User Model & Database Schema

### BE
- [ ] User 모델 생성 (`backend/app/models/user.py`)
  - id, username, email, password_hash, created_at, updated_at
  - is_active, last_login 필드 추가
- [ ] User 테이블 마이그레이션 (SQLAlchemy)
- [ ] User Pydantic 스키마 생성 (`backend/app/schemas/user.py`)
  - UserCreate, UserResponse, UserInDB
- [ ] 데이터베이스 초기화 코드 업데이트

### FE
- [ ] User 타입 정의 (`frontend/src/types/user.ts`)
  - User interface 정의

### Kernel
- [ ] N/A (데이터 모델은 백엔드에서만 필요)

---

## Feature 2: Password Security

### BE
- [ ] 비밀번호 해싱 유틸리티 작성
  - bcrypt 또는 passlib 사용
  - `hash_password()`, `verify_password()` 함수
- [ ] 비밀번호 정책 검증 로직
  - 최소 길이, 복잡도 체크
- [ ] 환경 변수 설정 (SECRET_KEY)

### FE
- [ ] 클라이언트 측 비밀번호 검증
  - 최소 길이, 형식 체크

### Kernel
- [ ] N/A

---

## Feature 3: JWT Token Management

### BE
- [ ] JWT 토큰 생성/검증 유틸리티
  - `create_access_token()`, `verify_token()` 함수
  - python-jose 또는 PyJWT 사용
- [ ] Token payload 구조 정의 (user_id, exp)
- [ ] 토큰 만료 시간 설정 (예: 24시간)
- [ ] Refresh token 로직 (선택사항)

### FE
- [ ] 토큰 저장 로직 구현
  - localStorage 또는 httpOnly cookie
- [ ] 토큰 자동 갱신 로직 (선택사항)

### Kernel
- [ ] N/A

---

## Feature 4: Authentication API Endpoints

### BE
- [ ] POST `/api/auth/register` - 회원가입
  - username, email, password 받기
  - 중복 체크
  - User 생성 및 토큰 반환
- [ ] POST `/api/auth/login` - 로그인
  - username/email + password 검증
  - JWT 토큰 반환
- [ ] POST `/api/auth/logout` - 로그아웃
  - 토큰 무효화 (선택사항)
- [ ] GET `/api/auth/me` - 현재 사용자 정보
  - JWT 토큰 검증 후 사용자 정보 반환
- [ ] 인증 의존성 생성 (`get_current_user`)
- [ ] Router 등록 (`app/routers/auth.py`)

### FE
- [ ] N/A (API만 구현)

### Kernel
- [ ] N/A

---

## Feature 5: Login UI Components

### BE
- [ ] N/A

### FE
- [ ] 로그인 페이지 생성 (`frontend/src/app/login/page.tsx`)
- [ ] 로그인 폼 컴포넌트 (`frontend/src/components/LoginForm.tsx`)
  - username/email 입력 필드
  - password 입력 필드
  - "로그인" 버튼
  - 에러 메시지 표시
- [ ] 회원가입 페이지 생성 (`frontend/src/app/register/page.tsx`)
- [ ] 회원가입 폼 컴포넌트 (`frontend/src/components/RegisterForm.tsx`)
- [ ] Tailwind CSS 스타일링

### Kernel
- [ ] N/A

---

## Feature 6: Frontend Auth State Management

### BE
- [ ] N/A

### FE
- [ ] Auth Context 생성 (`frontend/src/contexts/AuthContext.tsx`)
  - user, token, isAuthenticated 상태
  - login(), logout(), register() 함수
- [ ] Auth Hook 생성 (`frontend/src/hooks/useAuth.ts`)
  - useAuth() hook
- [ ] API 클라이언트 Auth 인터셉터
  - Authorization 헤더 자동 추가
  - 401 에러 시 로그아웃 처리

### Kernel
- [ ] N/A

---

## Feature 7: Protected Routes & Navigation

### BE
- [ ] N/A

### FE
- [ ] Protected Route 컴포넌트 생성
  - 인증되지 않은 사용자 리다이렉트
- [ ] 네비게이션 바 업데이트
  - 로그인/로그아웃 버튼 조건부 렌더링
  - 사용자 이름 표시
- [ ] 로그인 후 리다이렉트 로직
  - 로그인 전 페이지로 돌아가기

### Kernel
- [ ] N/A

---

## Feature 8: API Integration & Testing

### BE
- [ ] API 엔드포인트 단위 테스트 작성
  - 회원가입 테스트
  - 로그인 성공/실패 테스트
  - 토큰 검증 테스트
- [ ] FastAPI TestClient 사용
- [ ] 테스트 데이터베이스 설정

### FE
- [ ] Auth API 호출 함수 작성 (`frontend/src/api/auth.ts`)
  - `loginUser()`, `registerUser()`, `getCurrentUser()`, `logoutUser()`
- [ ] 에러 핸들링
  - 네트워크 에러, 인증 실패 등
- [ ] 로딩 상태 관리

### Kernel
- [ ] N/A

---

## Feature 9: Security Enhancements (선택사항)

### BE
- [ ] Rate limiting (로그인 시도 제한)
- [ ] CORS 설정 확인
- [ ] HTTPS 전용 쿠키 설정
- [ ] 보안 헤더 추가 (helmet)

### FE
- [ ] CSRF 토큰 처리 (필요시)
- [ ] XSS 방지 검증

### Kernel
- [ ] **네트워크 패킷 필터링 모듈 (고급)**
  - Netfilter hook을 사용한 로그인 요청 모니터링
  - 비정상적인 로그인 시도 탐지 (brute-force)
  - IP 기반 접근 제어 (블랙리스트/화이트리스트)
- [ ] **커널 레벨 로깅**
  - 로그인 이벤트 커널 로그 기록
  - `/proc` 또는 debugfs를 통한 통계 제공
- [ ] **세션 추적 모듈 (고급)**
  - 커널 레벨에서 활성 세션 추적
  - 동시 로그인 제한 정책 적용

---

## Feature 10: Documentation & Deployment

### BE
- [ ] API 문서 작성 (Swagger/OpenAPI)
  - 엔드포인트 설명, 예시 추가
- [ ] 환경 변수 문서화 (`.env.example`)
  - SECRET_KEY, TOKEN_EXPIRE_MINUTES 등

### FE
- [ ] 사용자 매뉴얼 작성 (선택사항)
- [ ] 환경 변수 설정 (NEXT_PUBLIC_API_URL)

### Kernel
- [ ] 커널 모듈 빌드 스크립트 작성
- [ ] 커널 모듈 로드/언로드 가이드
- [ ] 커널 로그 확인 방법 문서화

---

## 구현 순서 (권장)

```
1. Feature 1 (User Model) → BE 먼저
2. Feature 2 (Password Security) → BE
3. Feature 3 (JWT Token) → BE
4. Feature 4 (Auth API) → BE
5. Feature 8 (Testing) → BE 테스트
6. Feature 5 (Login UI) → FE
7. Feature 6 (Auth State) → FE
8. Feature 8 (API Integration) → FE
9. Feature 7 (Protected Routes) → FE
10. Feature 9 (Security) → BE + FE + Kernel (선택사항)
11. Feature 10 (Documentation) → 전체
```

---

## 참고사항

- **BE 우선 개발**: API가 완성된 후 FE에서 연동
- **보안 중요**: 비밀번호는 절대 평문 저장 금지, JWT SECRET_KEY 보안 유지
- **Kernel 모듈**: 선택사항이며, 기본 로그인 기능과는 독립적으로 개발 가능
- **테스트**: 각 feature 완료 시 바로 테스트 작성 권장
- **에러 핸들링**: 모든 API 엔드포인트와 FE 폼에서 적절한 에러 처리 필수
