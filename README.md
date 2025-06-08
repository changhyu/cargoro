# CarGoro 모노레포 프로젝트 시작 가이드

[![codecov](https://codecov.io/gh/[YOUR-GITHUB-USERNAME]/[YOUR-REPO-NAME]/branch/main/graph/badge.svg?token=YOUR-TOKEN)](https://codecov.io/gh/[YOUR-GITHUB-USERNAME]/[YOUR-REPO-NAME])
[![CI/CD](https://github.com/[YOUR-GITHUB-USERNAME]/[YOUR-REPO-NAME]/actions/workflows/ci.yml/badge.svg)](https://github.com/[YOUR-GITHUB-USERNAME]/[YOUR-REPO-NAME]/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

이 문서는 CarGoro 모노레포 프로젝트 개발 환경 설정 및 실행 방법을 안내합니다.

## 시스템 요구사항

- Node.js 18.x 이상
- pnpm 8.x 이상
- Python 3.9 이상 (백엔드 서비스용)

## 초기 설정

### 1. 의존성 설치

```bash
# 프로젝트 루트에서 실행
pnpm install
```

### 2. 환경 변수 설정

```bash
# 자동 환경 변수 설정 스크립트 실행
pnpm run setup:env
```

이 스크립트는 필요한 환경 변수를 대화형으로 설정합니다.

### 3. 컴포넌트 생성

```bash
# 새 컴포넌트 생성 (예: MyComponent)
pnpm run cli:component MyComponent
```

이 명령어는 `app/components/mycomponent` 디렉토리에 컴포넌트 파일, 테스트 파일, 인덱스 파일을 생성합니다.

## 개발 서버 실행

각 앱은 독립적으로 실행할 수 있습니다:

```bash
# Workshop Web 앱 실행 (기본 포트: 3000)
pnpm run dev:workshop

# Fleet Manager Web 앱 실행 (기본 포트: 3006)
pnpm run dev:fleet

# Parts Web 앱 실행 (기본 포트: 3002)
pnpm run dev:parts

# Superadmin Web 앱 실행 (기본 포트: 3003)
pnpm run dev:admin
```

## 타입 검사 및 린팅

```bash
# 전체 프로젝트 타입 검사
pnpm run typecheck

# 전체 프로젝트 린팅
pnpm run lint
```

## 테스트 실행

```bash
# 전체 프로젝트 테스트
pnpm run test

# 특정 앱만 테스트 (예: workshop-web)
pnpm --filter @cargoro/workshop-web test
```

## 프로젝트 구조

```
monorepo-root/
├── apps/ # 각 사용자/역할별 앱들 (웹/모바일 등)
│ ├── workshop-web/ # 정비소 웹 전용 앱
│ ├── fleet-manager-web/ # 차량 관리 웹 앱
│ ├── parts-web/ # 부품 관리 웹 앱
│ ├── superadmin-web/ # 관리자 웹 앱
│ ├── workshop-mobile/ # 정비소 모바일 앱
│ ├── delivery-driver/ # 배송 기사 앱
│ └── smart-car-assistant/ # 스마트카 어시스턴트 앱
│
├── packages/ # 재사용 가능한 코드 모듈
│ ├── ui/ # 디자인 시스템 (ShadCN 기반)
│ ├── api-client/ # API 클라이언트
│ ├── auth/ # 인증 모듈
│ ├── types/ # 공통 타입 정의
│ └── analytics/ # 분석 도구 통합
│
├── backend/ # FastAPI 기반 마이크로서비스 백엔드
│ ├── gateway/ # GraphQL API 게이트웨이
│ ├── services/ # 도메인별 API 서비스
│ └── database/ # Prisma ORM 설정
```

## 개발 규칙

1. 모든 코드는 TypeScript로 작성합니다.
2. UI 컴포넌트는 ShadCN을 우선 사용합니다.
3. API 통신은 React Query와 Axios를 사용합니다.
4. 상태 관리는 Zustand를 사용합니다.
5. 파일 및 컴포넌트 명명 규칙:
   - 컴포넌트: PascalCase (예: UserProfile)
   - 파일: 소문자 케밥 케이스 (예: user-profile.tsx)
   - 훅: camelCase (예: useUserProfile)

## 주요 기술 스택

- **프론트엔드**: Next.js (App Router), React, TypeScript
- **모바일**: React Native (Expo)
- **백엔드**: FastAPI, Prisma ORM, PostgreSQL
- **인프라**: Docker, Kubernetes, Terraform
- **CI/CD**: GitHub Actions

## 문제 해결

### date-fns 문제

date-fns v3에서 v2로 다운그레이드하여 문제를 해결했습니다. 현재 v2.30.0을 사용 중입니다.

```bash
# date-fns 버전 다운그레이드
cd packages/ui && pnpm add date-fns@2.30.0
```

### TypeScript 타입 문제 해결

#### "Cannot find name 'xxx'" 타입 오류

tsconfig.json에 필요한 타입 정의를 추가합니다:

```json
{
  "compilerOptions": {
    "types": ["node", "vitest/globals", "@testing-library/jest-dom"]
  }
}
```

필요한 타입 패키지를 설치합니다:

```bash
pnpm add -D @types/node @types/react @types/react-dom --filter @cargoro/[app-name]
```

#### any 타입 사용 금지

any 타입 대신 구체적인 타입을 사용하세요:

```typescript
// 나쁜 예
function process(data: any) { ... }

// 좋은 예
interface DataType { id: string; value: number }
function process(data: DataType) { ... }

// unknown과 타입 가드 활용
function process(data: unknown) {
  if (typeof data === 'object' && data !== null && 'id' in data) {
    // data를 안전하게 처리
  }
}
```

#### packages/analytics 패키지 타입 오류

현재 알려진 타입 오류:

1. Sentry 환경 타입 문제:

   - SentryConfig의 environment 타입을 'development' | 'staging' | 'production' 으로 지정합니다.

2. PostHog 설정 문제:

   - PostHogConfig 인터페이스에 cookie_domain 속성을 추가합니다.

3. Sentry TransactionContext 문제:
   - @sentry/nextjs 버전을 확인하고 최신 버전으로 업데이트합니다.

자세한 문제 해결 가이드는 `docs/troubleshooting` 디렉토리의 `monorepo-error-guide.md` 파일을 참조하세요.
