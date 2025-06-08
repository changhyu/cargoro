# Parts Web

부품 재고 관리 및 구매 주문을 위한 웹 애플리케이션입니다.

## 주요 기능

### 부품 관리

- 부품 등록 및 정보 관리
- 카테고리별 부품 분류
- 제조사별 부품 관리
- 부품 태그 관리
- 부품 이미지 관리 (예정)

### 재고 관리

- 실시간 재고 현황 조회
- 창고별 재고 관리
- 재고 입출고 기록
- 재고 부족 알림
- 재고 이동 이력 추적

### 구매 주문

- 구매 주문서 작성
- 공급업체별 주문 관리
- 입고 처리 및 검수
- 주문 진행 상태 추적
- 구매 이력 분석

### 공급업체 관리

- 공급업체 정보 관리
- 부품별 공급업체 매핑
- 공급가 및 리드타임 관리
- 주 공급업체 설정

## 기술 스택

- **Frontend Framework**: Next.js 15 (App Router)
- **UI Components**: ShadCN UI + Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: React Query + GraphQL
- **Authentication**: Clerk
- **Charts**: Recharts (예정)
- **TypeScript**: 타입 안전성

## 설치 및 실행

### 개발 환경

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

### 환경 변수

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# API 설정
NEXT_PUBLIC_API_URL=http://localhost:8000/graphql

# Clerk 인증
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### Docker 실행

```bash
# 전체 시스템 실행
docker-compose up parts-web
```

## 프로젝트 구조

```
parts-web/
├── app/
│   ├── features/          # 기능별 컴포넌트
│   │   ├── parts/         # 부품 관리
│   │   └── purchase-orders/ # 구매 주문
│   ├── parts/            # 부품 페이지
│   ├── purchase-orders/  # 구매 주문 페이지
│   └── layout.tsx        # 레이아웃
├── components/           # 공통 컴포넌트
├── lib/                  # 유틸리티
└── public/              # 정적 파일
```

## API 연동

Parts Web는 GraphQL Gateway를 통해 다음 서비스들과 통신합니다:

- **Parts API**: 부품/재고 관리
- **Core API**: 인증 및 사용자 관리
- **Repair API**: 정비 사용 부품 추적

## 주요 화면

### 1. 부품 목록

- 전체 부품 카탈로그
- 카테고리/제조사별 필터링
- 재고 상태별 필터링
- 부품 검색 기능

### 2. 부품 상세

- 부품 기본 정보
- 재고 현황 (창고별)
- 공급업체 정보
- 재고 이동 이력
- 정비 사용 이력

### 3. 구매 주문

- 주문서 작성
- 진행 상태 모니터링
- 입고 처리
- 주문 이력 조회

### 4. 재고 조정

- 수동 재고 조정
- 실사 반영
- 이동 사유 기록

## 개발 가이드

### 컴포넌트 생성

```tsx
// app/features/parts/components/NewComponent.tsx
'use client';

import { useState } from 'react';
import { Card } from '@cargoro/ui';

export function NewComponent() {
  // 컴포넌트 로직
  return <Card>...</Card>;
}
```

### API 호출

```tsx
// React Query + GraphQL 사용
const { data, isLoading } = useQuery({
  queryKey: ['parts'],
  queryFn: async () => {
    const response = await graphqlClient.request(GET_PARTS);
    return response.parts;
  },
});
```

### 상태 관리

```tsx
// Zustand 스토어
import { create } from 'zustand';

const usePartsStore = create(set => ({
  selectedPart: null,
  setSelectedPart: part => set({ selectedPart: part }),
}));
```

## 테스트

```bash
# 유닛 테스트
pnpm test

# E2E 테스트
pnpm test:e2e

# 테스트 커버리지
pnpm test:coverage
```

## 배포

### Production 빌드

```bash
pnpm build
pnpm start
```

### Docker 배포

```bash
docker build -t parts-web .
docker run -p 3002:3002 parts-web
```

## 문제 해결

### 자주 발생하는 문제

1. **재고 불일치**

   - 재고 동기화 실행
   - 이동 이력 확인

2. **주문 상태 오류**

   - 주문 상태 갱신
   - 입고 처리 확인

3. **공급업체 연결 오류**
   - 공급업체 정보 확인
   - API 연결 상태 확인

## 기여 가이드

1. 기능 브랜치 생성: `feature/재고-알림-기능`
2. 커밋 메시지: `feat(parts): 재고 부족 알림 추가`
3. PR 생성 및 리뷰 요청

## 라이선스

MIT License
