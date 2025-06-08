# CarGoro 렌터카/리스 관리 시스템

차량 렌탈 및 리스 계약을 통합 관리하는 웹 애플리케이션입니다.

## 주요 기능

### 🔐 인증 시스템

- JWT 기반 인증
- 역할 기반 접근 제어 (USER, MANAGER, ADMIN)
- 자동 토큰 갱신
- 로그인 시도 제한 및 계정 잠금

### 🚗 차량 관리

- 차량 등록/수정/삭제
- 실시간 차량 상태 관리
- 주행거리 추적
- 차량 카테고리별 분류

### 📝 계약 관리

- **렌탈 계약**
  - 단기/장기 렌탈
  - 일일 요금 계산
  - 추가 옵션 관리
- **리스 계약**
  - 운용/금융 리스
  - 월 납입금 계산
  - 잔존가치 관리
  - 주행거리 제한

### 🗓️ 예약 시스템

- 실시간 예약 관리
- 캘린더 뷰
- 차량 가용성 확인
- 예약 상태 관리

### 👥 고객 관리

- 개인/법인 고객 구분
- 신용 평가
- 계약 이력 조회
- 고객 검증 시스템

### 💳 결제 시스템

- 다양한 결제 수단 지원
- 결제 상태 관리
- 환불 처리
- 연체 관리 및 알림
- 월별 결제 통계

### 📊 대시보드 & 리포팅

- 실시간 통계
- 매출 분석
- 차량 가동률
- 계약 현황

## 기술 스택

### Frontend

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- ShadCN UI
- Zustand (상태 관리)
- React Query
- React Hook Form + Zod

### Backend

- FastAPI
- SQLAlchemy 2.0
- PostgreSQL
- Pydantic v2
- JWT 인증

## 설치 및 실행

### 사전 요구사항

- Node.js 18+
- Python 3.9+
- PostgreSQL 13+
- pnpm

### 환경 설정

1. **환경 변수 설정**

Backend (.env):

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/cargoro_rental
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Frontend (.env.local):

```env
NEXT_PUBLIC_API_URL=http://localhost:8004
```

2. **데이터베이스 설정**

```bash
# PostgreSQL 데이터베이스 생성
createdb cargoro_rental
```

### Backend 실행

```bash
cd backend/services/rental-api

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 초기 사용자 생성
python scripts/create_users.py

# 서버 실행
python main.py
```

서버가 http://localhost:8004 에서 실행됩니다.
API 문서: http://localhost:8004/docs

### Frontend 실행

```bash
cd apps/fleet-manager-web

# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

애플리케이션이 http://localhost:3006 에서 실행됩니다.

## 테스트 계정

| 역할   | 이메일              | 비밀번호    |
| ------ | ------------------- | ----------- |
| 관리자 | admin@cargoro.com   | admin1234   |
| 매니저 | manager@cargoro.com | manager1234 |
| 사용자 | user@cargoro.com    | user1234    |

## 주요 API 엔드포인트

### 인증

- `POST /auth/login` - 로그인
- `POST /auth/refresh` - 토큰 갱신
- `GET /auth/me` - 현재 사용자 정보
- `POST /auth/change-password` - 비밀번호 변경

### 차량 관리

- `GET /vehicles` - 차량 목록
- `POST /vehicles` - 차량 등록
- `PUT /vehicles/{id}` - 차량 수정
- `DELETE /vehicles/{id}` - 차량 삭제

### 계약 관리

- `GET /rental-contracts` - 렌탈 계약 목록
- `POST /rental-contracts` - 렌탈 계약 생성
- `GET /lease-contracts` - 리스 계약 목록
- `POST /lease-contracts` - 리스 계약 생성

### 결제 관리

- `GET /payments` - 결제 목록
- `POST /payments` - 결제 생성
- `POST /payments/{id}/process` - 결제 처리
- `POST /payments/{id}/refund` - 환불 처리
- `GET /payments/statistics` - 결제 통계

## 프로젝트 구조

```
monorepo-root/
├── apps/
│   └── fleet-manager-web/        # Next.js 프론트엔드
│       ├── app/
│       │   ├── (auth)/          # 인증 페이지
│       │   ├── features/        # 주요 기능 페이지
│       │   ├── lib/api/         # API 클라이언트
│       │   ├── state/           # Zustand 스토어
│       │   └── types/           # TypeScript 타입
│       └── components/          # UI 컴포넌트
│
└── backend/
    └── services/
        └── rental-api/          # FastAPI 백엔드
            ├── lib/
            │   ├── auth/        # 인증 시스템
            │   ├── models/      # DB 모델
            │   ├── schemas/     # Pydantic 스키마
            │   ├── services/    # 비즈니스 로직
            │   └── routes/      # API 라우트
            └── scripts/         # 유틸리티 스크립트
```

## 보안 기능

- JWT 토큰 기반 인증
- 비밀번호 해싱 (bcrypt)
- 로그인 시도 제한 (5회 실패 시 30분 잠금)
- 역할 기반 접근 제어
- CORS 설정
- 환경 변수를 통한 민감 정보 관리

## 개발 가이드

### 새로운 기능 추가

1. Backend: 모델 → 스키마 → 서비스 → 라우트 순으로 구현
2. Frontend: 타입 정의 → API 클라이언트 → 컴포넌트 구현
3. 인증이 필요한 엔드포인트는 `get_current_active_user` 의존성 추가

### 코드 스타일

- Python: PEP 8, snake_case
- TypeScript: ESLint + Prettier, camelCase
- 컴포넌트명: PascalCase
- 파일명: kebab-case

## 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.
