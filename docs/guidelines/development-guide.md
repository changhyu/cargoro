# CarGoro 개발 가이드라인

이 문서는 CarGoro 모노레포 프로젝트의 개발 가이드라인과 규칙을 설명합니다.

## 목차

1. [언어 및 커뮤니케이션](#1-언어-및-커뮤니케이션)
2. [프로젝트 구조](#2-프로젝트-구조)
3. [Next.js 사용](#3-nextjs-사용)
4. [UI 컴포넌트](#4-ui-컴포넌트)
5. [TypeScript](#5-typescript)
6. [상태 관리](#6-상태-관리)
7. [데이터 페칭 & 인증](#7-데이터-페칭--인증)
8. [ORM / DB](#8-orm--db)
9. [테스트](#9-테스트)
10. [코드 스타일](#10-코드-스타일)
11. [DevOps & 배포](#11-devops--배포)
12. [로깅 & 모니터링](#12-로깅--모니터링)
13. [보안](#13-보안)
14. [접근성 (a11y)](#14-접근성-a11y)
15. [성능 최적화](#15-성능-최적화)
16. [브랜치 전략](#16-브랜치-전략)
17. [버전 관리 & 릴리즈](#17-버전-관리--릴리즈)
18. [문서화](#18-문서화)
19. [코드 리뷰](#19-코드-리뷰)
20. [의존성 관리](#20-의존성-관리)
21. [국제화 (i18n)](#21-국제화-i18n)
22. [에러 처리](#22-에러-처리)

## 1. 언어 및 커뮤니케이션

- ✅ **필수**: 모든 코드, 커밋 메시지, 이슈 코멘트는 한국어로 작성
- 🔶 **권장**: 외부 라이브러리 설정 파일, 주석 등은 영어 표기 유지

## 2. 프로젝트 구조

- ✅ **필수**: `app/` 디렉토리 사용 금지, Next.js App Router 기준으로 구성
- 🔶 **권장**: `app/` 내에 pages/, components/, features/, hooks/, state/, services/, constants/ 순서로 배치

모노레포는 다음과 같은 구조를 따릅니다:

```
monorepo-root/
├── apps/                        # 각 사용자/역할별 앱들 (웹/모바일 등)
│   ├── workshop-web/            # 정비소 웹 전용 앱
│   │   ├── app/                 # Next.js App Router
│   │   │   ├── pages/           # 라우팅 페이지 구성
│   │   │   ├── components/      # 재사용 UI 구성 요소
│   │   │   ├── features/        # 도메인별 기능 단위
│   │   │   ├── hooks/           # 커스텀 훅
│   │   │   ├── state/           # Zustand 상태 관리
│   │   │   ├── services/        # API 호출 로직
│   │   │   └── constants/       # 상수 정의
│   │   ├── i18n/                # 다국어 번역 설정
│   │   └── ... (기타 설정 파일)
│   └── ... (다른 앱들)
├── packages/                    # 재사용 가능한 코드 모듈
├── backend/                     # 백엔드 서비스
├── infra/                       # 인프라 & 배포 구성
├── docs/                        # 팀 문서, 아키텍처, API 명세
└── ... (기타 설정 파일)
```

## 3. Next.js 사용

- ✅ **필수**: App Router(폴더 app/)만 사용, Pages Router 사용 금지
- ✅ **필수**: API 엔드포인트는 Route Handler로 구현
- 🔶 **권장**: 복잡한 DB 작업, 외부 API 호출, 인증 등은 Route Handler에서 처리
- 🔶 **권장**: Server Action은 UI 이벤트, 단일 폼 제출 수준에서만 제한적으로 사용

## 4. UI 컴포넌트

- ✅ **필수**: ShadCN 우선 사용 (`npx shadcn@latest add` 명령으로 추가)
- 🔶 **권장**: 테마 및 다크모드 설정은 packages/ui/theme/에서 중앙 관리
- ✅ **필수**: 커스텀 그리드는 Tailwind 기반으로 통일

## 5. TypeScript

- ✅ **필수**: TypeScript 전면 적용, 프론트엔드와 백엔드 모두 TS 사용
- ✅ **필수**: `any` 타입 사용 금지
- 🔶 **권장**: 인터페이스 접두사 'I' 사용 금지 (커뮤니티 표준 준수)
- ✅ **필수**: 공통 타입 정의는 packages/types/ 패키지에서 관리

## 6. 상태 관리

- ✅ **필수**: Zustand v4.4.0 사용 (React 19 호환 검증됨)
- 🔶 **권장**: 전역 상태 훅은 packages/ui/hooks/useStore.ts 경로로 통일

```tsx
// 상태 훅 사용 예시
import { create } from 'zustand';

type CounterStore = {
  count: number;
  increment: () => void;
};

export const useCounterStore = create<CounterStore>(set => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
}));
```

## 7. 데이터 페칭 & 인증

- ✅ **필수**: React Query 5.75.8 + Axios(GraphQL) 래퍼 사용
- ✅ **필수**: Firebase Auth에서 Clerk로 전환 시 clerkMiddleware() 사용
- 🔶 **권장**: 인증 관련 로직은 packages/auth/ 패키지에서만 구현

## 8. ORM / DB

- ✅ **필수**: Drizzle ORM 사용
- 🔶 **권장**: DB 스키마 정의는 backend/database/drizzle/schema.ts에서 관리
- ✅ **필수**: 초기 데이터는 backend/database/seed/ 디렉토리의 스크립트로 관리

## 9. 테스트

- ✅ **필수**: Playwright: E2E 테스트
- ✅ **필수**: Vitest: 프론트엔드 단위 테스트
- ✅ **필수**: Pytest: 백엔드 테스트
- 🔶 **권장**: 테스트 코드 커버리지 80% 이상 유지

```tsx
// Vitest 테스트 예시
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## 10. 코드 스타일

- ✅ **필수**: ESLint + Prettier 자동 포맷 사용 (.eslintrc.json, .prettierrc.json 설정 따름)
- 🔶 **권장**: 커밋 메시지는 Conventional Commits 형식 준수

```
<type>(<scope>): <subject>

<body>
```

- **타입**: feat, fix, docs, style, refactor, test, chore, ci, perf, chore(release)
- **예시**: `feat(auth): 소셜 로그인 기능 추가`

## 11. DevOps & 배포

- ✅ **필수**: pnpm v8, Turborepo로 멀티 패키지 관리
- ✅ **필수**: Docker / Kubernetes(Helm) / Terraform으로 프로덕션 배포
- 🔶 **권장**: CI/CD는 GitHub Actions 사용 (build, lint, test, deploy 단계)

## 12. 로깅 & 모니터링

- ✅ **필수**: 클라이언트는 Sentry로 오류 및 사용자 행동 트래킹
- ✅ **필수**: 서버 로그는 JSON 포맷 사용 (timestamp, level, service, message, meta)
- 🔶 **권장**: 메트릭은 Prometheus + Grafana 대시보드 사용

## 13. 보안

- ✅ **필수**: 환경 변수에 민감 정보 포함 금지, 대신 HashiCorp Vault 사용
- ✅ **필수**: 의존성 보안 검사를 위해 정기적으로 pnpm audit 실행
- 🔶 **권장**: Content Security Policy 적용 (Next.js headers() 활용)
- 🔶 **권장**: HTTP 보안 헤더는 Helmet 미들웨어로 적용

## 14. 접근성 (a11y)

- ✅ **필수**: WCAG AA 표준 준수
- 🔶 **권장**: ESLint-plugin-jsx-a11y, axe-core로 자동 검사
- 🔶 **권장**: 색상 대비, 키보드 네비게이션 지원 등 수동 점검 병행

## 15. 성능 최적화

- ✅ **필수**: 번들 사이즈는 앱당 압축 후 200KB 이하로 유지
- 🔶 **권장**: 이미지 최적화를 위해 Next.js의 next/image 컴포넌트 사용
- 🔶 **권장**: 코드 스플리팅을 위해 Dynamic import, React.lazy 활용

## 16. 브랜치 전략

- ✅ **필수**: Git Flow 변형 전략 사용
  - 브랜치: main, develop, feature/_, hotfix/_
- 🔶 **권장**: PR 템플릿은 .github/PULL_REQUEST_TEMPLATE.md 활용

## 17. 버전 관리 & 릴리즈

- ✅ **필수**: Semantic Versioning (MAJOR.MINOR.PATCH) 사용
- 🔶 **권장**: semantic-release를 통한 자동 릴리즈 프로세스 구축

## 18. 문서화

- ✅ **필수**: API 명세는 Route Handler에서 자동 생성된 OpenAPI 문서로 관리
- 🔶 **권장**: UI 컴포넌트는 Storybook으로 문서화
- 🔶 **권장**: 아키텍처 다이어그램은 C4 Model 적용

## 19. 코드 리뷰

- ✅ **필수**: PR은 최소 2명의 리뷰어 승인 후 머지
- 🔶 **권장**: 리뷰 시 보안, 접근성, 성능, 테스트 커버리지, 문서화를 체크

## 20. 의존성 관리

- ✅ **필수**: Dependabot으로 주기적인 의존성 업데이트 (.github/dependabot.yml 설정)
- 🔶 **권장**: pnpm dedupe 명령으로 중복 의존성 제거

## 21. 국제화 (i18n)

- ✅ **필수**: 키 네이밍 규칙: namespace.keyName (예: errors.required)
- 🔶 **권장**: missing-keys 스크립트로 번역 누락 여부 정기 점검

## 22. 에러 처리

- ✅ **필수**: 클라이언트는 전역 Error Boundary 적용
- ✅ **필수**: 서버 에러는 공통 포맷 준수 { code, message, details }
- 🔶 **권장**: React Query의 retry 옵션, Celery Retry 기능 활용

## 개발 설정 시작하기

1. 의존성 설치:

```bash
pnpm install
```

2. 개발 서버 실행:

```bash
pnpm dev
```

3. 테스트 실행:

```bash
pnpm test
```

4. 새 앱/패키지 생성:

```bash
# 새 앱 생성
pnpm create:app

# 새 패키지 생성
pnpm create:package
```

## 새로운 기능 개발 워크플로우

1. 최신 develop 브랜치에서 feature 브랜치 생성:

```bash
git checkout develop
git pull
git checkout -b feature/기능-이름
```

2. 기능 개발 및 테스트 작성

3. 커밋 (Conventional Commits 형식):

```bash
git commit -m "feat(컴포넌트): 기능 설명"
```

4. PR 생성 및 코드 리뷰 요청

5. CI/CD 파이프라인 통과 및 승인 후 develop에 머지

---

이 가이드라인은 프로젝트 발전에 따라 지속적으로 업데이트됩니다.
문서에 대한 피드백이나 질문은 팀 내 토론을 통해 개선해 나갑니다.
