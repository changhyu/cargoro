# Workshop Web App 구조

이 디렉토리는 Next.js App Router를 사용하는 정비소 웹 애플리케이션의 루트입니다.

## 📁 디렉토리 구조

```
app/
├── pages/              # 라우팅 페이지 구성 (예: DashboardPage.tsx)
├── components/         # 공통/재사용 UI 구성 요소
├── features/           # 도메인별 기능 단위 (예약, 배정 등)
├── hooks/              # 앱 전역 커스텀 훅
├── state/              # Zustand 전역 상태 관리
├── services/           # API 호출 로직
├── constants/          # 상수 정의 (enum, status 등)
├── providers/          # React Context Providers
├── utils/              # 유틸리티 함수
├── types/              # TypeScript 타입 정의
├── tests/              # 앱 전반의 통합 테스트
│   ├── pages/          # 페이지 단위 통합 테스트
│   └── flows/          # 사용자 흐름 통합 테스트
├── (auth)/             # 인증 관련 라우트 그룹
├── (dashboard)/        # 대시보드 라우트 그룹
├── (features)/         # 기능별 라우트 그룹
├── api/                # Route Handlers (API 엔드포인트)
├── layout.tsx          # 루트 레이아웃
├── page.tsx            # 홈페이지
└── globals.css         # 전역 스타일

```

## 🔧 개발 규칙

1. **파일명**: 소문자 케밥 케이스 (예: `user-profile.tsx`)
2. **컴포넌트명**: PascalCase (예: `UserProfile`)
3. **훅 파일명**: camelCase (예: `useUserProfile.ts`)
4. **디렉토리명**: 소문자 케밥 케이스 (예: `user-profiles`)

## 📝 주요 기능

- **예약 관리**: 고객 차량 예약 및 일정 관리
- **정비 현황**: 실시간 정비 진행 상황 모니터링
- **부품 관리**: 재고 확인 및 주문 시스템
- **고객 관리**: 고객 정보 및 차량 이력 관리
- **매출 분석**: 매출 통계 및 보고서
