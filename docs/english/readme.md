# 카고로(CarGoro) 플랫폼

카고로(CarGoro)는 자동차 관련 종합 플랫폼으로 차량 관리, 정비, 예약, 부품 관리, 탁송 및 인력 관리를 위한 통합 솔루션입니다.

## 프로젝트 구조

컴포넌트명은 PascalCase를 사용합니다 (예: UserProfile)
파일명은 소문자 케밥 케이스를 사용합니다 (예: user-profile.tsx)
단, 훅의 파일명은 camelCase를 사용합니다 (예: useUserProfile.ts)
디렉토리명은 소문자 케밥 케이스를 사용합니다 (예: user-profiles)
모듈명은 소문자 케밥 케이스를 사용합니다 (예: user-profile.module.css)
함수명은 camelCase를 사용합니다 (예: fetchUserProfile)
함수명은 동사로 시작합니다 (예: getUserProfile, updateVehicleStatus)

이 프로젝트는 모노레포 구조로 구성되어 있으며, 각 앱과 패키지는 재사용 가능한 모듈로 분리되어 있습니다. 다음은 프로젝트의 디렉토리 구조입니다:

```
    ✅ 기능별 폴더로 구조
    ✅ 동명의 각 폴더별 내부 구조 일치


monorepo-root/
├── apps/                        # 각 사용자/역할별 앱들 (웹/모바일 등)
│   ├── workshop-web/            # 정비소 웹 전용 앱
│   ├── workshop-mobile/         # 정비소 모바일 앱
│   ├── delivery-driver/         # 탁송 기사 앱
│   ├── smart-car-assistant/     # 스마트카 관리 앱
│   ├── fleet-manager-web/       # 법인차량 관리 웹
│   ├── parts-web/               # 부품 관리 웹
│   └── superadmin-web/          # 관리자 웹
│
├── packages/                    # 재사용 가능한 코드 모듈
│   ├── ui/                      # Tailwind 기반 컴포넌트 (디자인 시스템)
│   ├── api-client/              # React Query 기반 API 클라이언트
│   ├── auth/                    # Clerk SDK, Middleware, Hooks 등
│   ├── gps-obd-lib/             # OBD2 + GPS 통신 유틸
│   ├── types/                   # 전역 타입 (Prisma 생성 타입 포함)
│   ├── utils/                   # 공통 유틸 함수
│   ├── i18n/                    # 언어팩 및 i18next 설정
│   └── analytics/               # PostHog, Sentry 설정
│
├── backend/                     # FastAPI 기반 마이크로서비스 백엔드
│   ├── gateway/                 # GraphQL API 통합 게이트웨이
│   ├── services/                # 각 도메인별 API 서비스
│   ├── jobs/                    # Celery 기반 백그라운드 작업
│   ├── database/                # Prisma 기반 DB 설정
│   │   ├── prisma/              # schema.prisma + .env
│   │   ├── seed/                # 초기 데이터 스크립트
│   │   └── migrations/          # DB 마이그레이션 기록
│   └── tests/                   # 백엔드 테스트 (unit/integration 분리)
│
├── infra/                       # 인프라 & 배포 구성
│   ├── docker/                  # Dockerfile 및 docker-compose
│   ├── k8s/                     # Kubernetes YAML (배포, 서비스, 인그레스)
│   ├── terraform/               # AWS/GCP 등 인프라 IaC 구성
│   └── ...
│
├── docs/                        # 팀 문서, 아키텍처, API 명세
└── scripts/                     # 자동화 CLI 및 유틸
```

monorepo-root/
├── apps/ # 각 사용자/역할별 앱들 (웹/모바일 등)
│ ├── workshop-web/ # 정비소 웹 전용 앱
│ │ ├── public/ # 정적 파일 (favicon, robots.txt 등)
│ │ ├── app/
│ │ │ ├── pages/ # 라우팅 페이지 구성
│ │ │ ├── components/ # 공통/재사용 UI 구성 요소
│ │ │ │ └── **tests**/ # 컴포넌트 테스트
│ │ │ ├── features/ # 도메인별 기능 단위 (예: 예약, 배정 등)
│ │ │ │ └── **tests**/ # 기능별 테스트
│ │ │ ├── hooks/ # 커스텀 훅
│ │ │ ├── state/ # Zustand 또는 전역 상태 관리
│ │ │ ├── services/ # API 호출 로직
│ │ │ ├── constants/ # 상수 정의 (enum, status 등)
│ │ │ ├── tests/ # 통합 테스트
│ │ │ └── App.tsx # 앱 엔트리
│ │ ├── e2e/ # Playwright 등의 E2E 테스트
│ │ ├── i18n/ # 다국어 번역 설정
│ │ └── package.json # 해당 앱의 의존성과 스크립트
│ └── ... (다른 앱 동일 구조)
│
├── packages/ # 재사용 가능한 코드 모듈
│ ├── ui/ # Tailwind 기반 컴포넌트 (디자인 시스템)
│ │ ├── components/ # 버튼, 카드 등 일반 컴포넌트
│ │ ├── layout/ # 레이아웃 관련 (그리드, 섹션 등)
│ │ ├── theme/ # 다크모드/컬러 토큰 등
│ │ ├── icons/ # SVG 아이콘
│ │ ├── forms/ # 입력폼, 셀렉트 등
│ │ └── index.ts
│ ├── api-client/ # React Query 기반 API 클라이언트
│ ├── auth/ # Firebase Auth 및 보호 라우팅
│ ├── gps-obd-lib/ # OBD2 + GPS 통신 유틸
│ ├── types/ # 전역 타입 (api/domain/db 스키마 포함)
│ ├── utils/ # 공통 유틸 함수
│ ├── i18n/ # 언어팩 및 i18next 설정
│ └── analytics/ # PostHog, Sentry 설정
│
├── backend/ # FastAPI 기반 마이크로서비스 백엔드
│ ├── gateway/ # GraphQL API 통합 게이트웨이
│ │ ├── graphql/ # schema + resolver
│ │ ├── middleware/ # 인증, 로깅, 에러 핸들링 등
│ │ └── main.py
│ ├── services/ # 각 도메인별 API 서비스
│ │ ├── core-api/ # 인증, 사용자, 권한
│ │ ├── repair-api/ # 정비소 기능
│ │ ├── delivery-api/ # 탁송 기능
│ │ ├── parts-api/ # 부품 관리
│ │ ├── fleet-api/ # 차량/법인 관리
│ │ └── admin-api/ # 관리자용 API
│ ├── jobs/ # Celery 기반 백그라운드 작업
│ │ ├── tasks/ # 작업 정의 (예: 주기적 분석)
│ │ └── workers.py # 작업 실행 로직
│ ├── database/ # Prisma 기반 DB 설정
│ │ ├── prisma/ # schema.prisma + .env
│ │ ├── seed/ # 초기 데이터 스크립트
│ │ └── migrations/ # DB 마이그레이션 기록
│ └── tests/ # 백엔드 테스트 (unit/integration 분리)
│
├── infra/ # 인프라 & 배포 구성
│ ├── docker/ # Dockerfile 및 docker-compose
│ ├── k8s/ # Kubernetes YAML (배포, 서비스, 인그레스)
│ ├── terraform/ # AWS/GCP 등 인프라 IaC 구성
│ ├── github-actions/ # CI/CD 파이프라인
│ ├── traefik/ # Ingress controller 설정
│ ├── vault/ # HashiCorp Vault 정책
│ ├── monitoring/ # Prometheus, Grafana 설정
│ └── logging/ # Loki 또는 ELK 스택 구성
│
├── docs/ # 팀 문서, 아키텍처, API 명세
│ ├── architecture/ # 시스템 아키텍처, 컴포넌트 다이어그램
│ ├── api-specs/ # OpenAPI (Swagger), GraphQL 문서
│ ├── erd/ # DB ERD (draw.io 등)
│ ├── workflows/ # 기능 흐름, 시나리오
│ ├── onboarding/ # 신규 개발자 온보딩 가이드
│ └── README.md
│
├── scripts/ # 자동화 CLI 및 유틸
│ ├── cli.ts # 프로젝트 내 CLI 도구 (ex: 생성기)
│ ├── setup-env.ts # 환경변수 자동 구성
│ ├── generate-types.ts # GraphQL/Prisma 기반 타입 생성
│ ├── deploy.ts # 배포 스크립트
│ ├── format-all.ts # 포매팅 일괄 적용
│ └── sync-env.ts # .env 동기화 자동화
│
├── .vscode/ # 팀 개발환경 설정
│ ├── extensions.json # 필수 익스텐션 추천
│ ├── settings.json # 워크스페이스 설정
│ └── launch.json # 디버깅 설정
│
├── .github/ # GitHub 이슈/PR 템플릿
│ └── ISSUE_TEMPLATE/
│ ├── bug_report.md
│ └── feature_request.md
│
├── turbo.json # Turborepo 파이프라인 설정
├── pnpm-workspace.yaml # 워크스페이스 모듈 명시
├── tsconfig.base.json # 공통 타입스크립트 설정
├── .prettierrc.json # 코드 스타일 규칙
├── .eslintrc.json # 린팅 설정
├── .env.example # 환경변수 템플릿
└── package.json # 루트 의존성 및 스크립트

## 시작하기

### 개발 환경 설정

```bash
# 의존성 설치
pnpm install

# 필수 인프라 서비스 실행 (PostgreSQL, Redis, RabbitMQ)
cd infra/docker
docker-compose up -d postgres redis rabbitmq
cd ../..

# Prisma 클라이언트 생성 (최초 실행 또는 스키마 변경 시)
pnpm prisma generate --filter @cargoro/database

# 개발 서버 실행
pnpm dev
```

자세한 설정 방법은 [개발 환경 설정 가이드](docs/onboarding/개발환경_설정.md)를 참조하세요.

### 배포 및 실행

```bash
# 개발 서버
pnpm dev

# Docker 서비스
cd infra/docker && docker-compose up

# Kubernetes 배포
cd infra/k8s && helm install cargoro .

# Terraform 인프라
cd infra/terraform && terraform apply
```

### 테스트 실행

각 앱 및 패키지는 독립적으로 테스트를 실행할 수 있습니다. 테스트는 각 앱/패키지 디렉토리에서 직접 실행합니다.

```bash
# 특정 앱의 테스트 실행
cd apps/workshop-web
pnpm test

# 특정 앱의 테스트 커버리지 확인
cd apps/workshop-web
pnpm test:coverage

# 특정 패키지의 테스트 실행
cd packages/ui
pnpm test

# 백엔드 테스트 실행
cd backend
pnpm test           # 모든 백엔드 테스트
pnpm test:unit      # 단위 테스트만 실행
pnpm test:coverage  # 커버리지 확인
```

모든 테스트 설정은 각 앱/패키지 내의 `vitest.config.ts` 파일과 백엔드의 `pytest.ini`에 정의되어 있습니다.

### 테스트 실행

```bash
# 프론트엔드 테스트
pnpm test

# 프론트엔드 테스트 (커버리지 포함)
pnpm test:coverage

# 백엔드 테스트
pnpm test:backend

# 백엔드 단위 테스트
pnpm test:backend:unit

# 백엔드 통합 테스트
pnpm test:backend:integration

# 백엔드 테스트 (커버리지 포함)
pnpm test:backend:coverage

# 백엔드 테스트 환경 검사
pnpm test:backend:check-env

# 백엔드 테스트 환경 설정
pnpm test:backend:setup-env

# 전체 테스트 및 검증
pnpm validate
```

자세한 백엔드 테스트 방법은 [백엔드 테스트 가이드](docs/backend-test-guide.md)를 참조하세요.

## 주요 기능

- **정비소 관리**: 정비 작업, 예약, 인력 관리
- **법인 차량 관리**: 리스, 렌트, 보험, 정비 이력
- **탁송 서비스**: 실시간 위치 추적, 배차 관리
- **부품 관리**: 재고, 발주, 공급망 관리
- **스마트카 서비스**: OBD2 진단, 원격 모니터링

## 기술 스택

- **프론트엔드**: Next.js, React, TypeScript, Tailwind CSS, ShadCN
- **상태 관리**: Zustand v4.4.0
- **백엔드**: FastAPI, GraphQL, Prisma ORM
- **데이터베이스**: PostgreSQL
- **인증**: Clerk
- **인프라**: Docker, Kubernetes, Terraform
- **CI/CD**: GitHub Actions
- **모니터링**: Sentry, Prometheus, Grafana

## 개발 규칙

- **언어 사용**: 모든 코드, 커밋 메시지, 이슈 코멘트는 한국어로 작성
- **프로젝트 구조**: src/ 사용 금지, Next.js App Router 기준으로 app/ 폴더 직접 사용
- **Next.js**: App Router(app/)만 사용, Pages Router 금지
- **UI 컴포넌트**: ShadCN 우선 사용 (npx shadcn@latest add)
- **TypeScript**: TypeScript 전면 적용, any 타입 사용 금지
- **상태 관리**: Zustand v4.4.0 사용
- **데이터 페칭**: React Query 5.75.8 + Axios(GraphQL) 래퍼 사용
- **ORM/DB**: Prisma ORM 사용
- **테스트**: Playwright(E2E), Vitest(유닛), Pytest(백엔드) 사용

자세한 개발 규칙은 [개발 설정 규칙](개발%20설정%20규칙.md) 문서를 참조하세요.

## 개발 계획

현재 16주(8스프린트) 개발 계획 중 다음 단계에 있습니다:

| 스프린트 | 기간               | 핵심 목표                        |   상태    |
| :------: | :----------------- | :------------------------------- | :-------: |
|    1     | 05/21 – 06/03 (2w) | 인프라·CI/CD·모노레포 세팅       |  ✅ 완료  |
|    2     | 06/04 – 06/17 (2w) | 공통 패키지·라이브러리 완성      |  ✅ 완료  |
|    3     | 06/18 – 07/01 (2w) | 인증·유저 관리·데이터베이스 구축 |  ✅ 완료  |
|    4     | 07/02 – 07/15 (2w) | 웹·모바일 앱 기본 뼈대 구현      | 🔄 진행중 |
|    5     | 07/16 – 07/29 (2w) | 예약·진단·내비 기능              | 🔄 진행중 |

자세한 개발 계획은 [개발 계획](개발%20계획.md) 문서를 참조하세요.

## 개발 완료 내역 (2024-05-24)

1. **차량 관리 기능**

   - 차량 유형별 필터링 기능 (차량, 트럭, 밴 탭) 구현
   - 차량 삭제 기능 구현
   - 차량 수정 기능 구현
   - 차량 배정 이력 관리 구현

2. **시스템 감사 기능**

   - 실제 API 연동 기능 구현 (폴백 로직 포함)
   - 로그 내보내기 실제 구현 (CSV/JSON 형식)

3. **UI 컴포넌트 구조 개선**
   - UI 컴포넌트 임포트 경로 표준화 (@cargoro/ui/
   - 날짜 선택기 컴포넌트 임포트 순서 수정
   - toast 컴포넌트 오류 수정

## 남은 작업

1. **API 서버 개발**

   - 차량 관리 API 엔드포인트 구현
   - 시스템 감사 API 엔드포인트 구현
   - 인증 연동 및 보안 강화

2. **성능 최적화**

   - 대용량 데이터 처리 최적화
   - 이미지 및 리소스 로딩 최적화

3. **테스트 확대**
   - 단위 테스트 커버리지 확대 (목표 80% 이상)
   - E2E 테스트 추가

## 프로젝트 리소스

- [API 문서](docs/api-specs/)
- [아키텍처 문서](docs/architecture/)
- [워크플로우 설명](docs/workflows/)
- [ERD](docs/erd/)
- [개발 환경 설정 가이드](docs/onboarding/개발환경_설정.md)
- [Kubernetes 배포 가이드](docs/onboarding/k8s_배포.md)
- [백엔드 테스트 가이드](docs/backend-test-guide.md)

## 문제 해결

이 프로젝트에서 자주 발생할 수 있는 문제에 대한 해결책은 다음 문서들을 참조하세요:

- [개발 환경 설정 가이드](docs/onboarding/개발환경_설정.md): 포트 충돌, RabbitMQ 연결 등 개발 환경 관련 문제
- [Kubernetes 배포 가이드](docs/onboarding/k8s_배포.md): 이미지 풀 실패, 배포 오류 등 Kubernetes 관련 문제
- [시스템 아키텍처](docs/architecture/): 서비스 간 통신 및 아키텍처 관련 문제

## 기여하기

기여 가이드라인은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참조하세요.

## 라이센스

© 2024-2025 CarGoro. 모든 권리 보유.

## 테스트 커버리지

테스트 커버리지는 코드의 신뢰성과 품질을 보장하기 위한 중요한 지표입니다. 목표 커버리지는 최소 80%입니다.

### 커버리지 실행 방법

**프론트엔드 테스트 커버리지:**

```bash
pnpm test:coverage
```

**백엔드 테스트 커버리지:**

```bash
pnpm coverage:backend
```

**전체 테스트 커버리지 (프론트엔드 + 백엔드):**

```bash
pnpm coverage:all
```

### 커버리지 결과 확인

- 통합 HTML 보고서: `open coverage/index.html`
- 백엔드 HTML 보고서: `open backend/coverage/htmlcov/index.html`

### 커버리지 개선 지침

1. 미테스트 코드 영역을 식별하기 위해 HTML 보고서 확인
2. 복잡한 조건문과 분기에 대한 테스트 케이스 우선 작성
3. 핵심 비즈니스 로직에 대한 테스트 우선 작성
4. E2E 테스트를 통해 중요 사용자 경로 테스트
5. UI 컴포넌트는 중요 기능과 상태 변경에 집중하여 테스트

### 테스트 커버리지 100% 달성 가이드

#### 프론트엔드 컴포넌트 테스트

1. **모든 Props와 상태 테스트**

   - 컴포넌트가 받는 모든 Props에 대한 테스트 작성
   - 다양한 상태 변경에 따른 컴포넌트 동작 테스트

2. **이벤트 핸들러 테스트**

   - 클릭, 입력, 포커스 등 모든 이벤트 핸들러 테스트
   - 이벤트 핸들러의 콜백 함수가 올바르게 호출되는지 확인

3. **조건부 렌더링 테스트**

   - 모든 조건부 렌더링 경로 테스트
   - 숨겨진 요소, 조건부 클래스 등 확인

4. **에러 상태 테스트**

   - 에러 발생 시 UI 동작 테스트
   - 에러 메시지 표시 확인

5. **비동기 동작 테스트**
   - 로딩 상태 테스트
   - 데이터 페칭 후 UI 업데이트 테스트

#### 백엔드 API 테스트

1. **입력 유효성 검사**

   - 모든 입력 매개변수에 대한 유효성 검사 테스트
   - 잘못된 입력에 대한 오류 처리 테스트

2. **비즈니스 로직 테스트**

   - 모든 비즈니스 로직 경로 테스트
   - 예외 상황 및 엣지 케이스 테스트

3. **데이터베이스 상호작용**

   - 모델 생성, 조회, 수정, 삭제 작업 테스트
   - 트랜잭션 및 롤백 테스트

4. **인증 및 권한 테스트**

   - 다양한 사용자 역할에 대한 테스트
   - 권한 거부 시나리오 테스트

5. **외부 서비스 통합 테스트**
   - 외부 API 호출 모킹 및 테스트
   - 오류 처리 및 재시도 로직 테스트

#### 테스트 작성 모범 사례

1. **테스트 목적 명확히**

   - 각 테스트 함수는 하나의 동작만 테스트
   - 명확한 테스트 설명으로 의도 표현

2. **준비-실행-검증 패턴**

   - 준비(Arrange): 테스트 데이터와 조건 설정
   - 실행(Act): 테스트 대상 함수나 컴포넌트 호출
   - 검증(Assert): 결과 확인

3. **모의 객체(Mock) 활용**

   - 외부 의존성은 모의 객체로 대체
   - 테스트 중인 코드만 집중적으로 테스트

4. **테스트 격리**

   - 각 테스트는 독립적으로 실행 가능해야 함
   - 테스트 간 상태 공유 최소화

5. **복잡한 케이스는 파라미터화**
   - 여러 입력에 대한 테스트는 파라미터화하여 중복 제거
   - 다양한 입력과 출력 조합 테스트

### 커버리지 유지 및 관리

1. **CI/CD 파이프라인 통합**

   - 모든 PR에서 커버리지 검사 실행
   - 커버리지 임계값 설정하여 유지

2. **정기적인 리포트 검토**

   - 주기적으로 커버리지 리포트 검토
   - 취약한 영역 식별 및 개선

3. **새로운 기능에 대한 테스트 우선 작성**
   - TDD(테스트 주도 개발) 방식 적용
   - 코드 작성 전 테스트 작성으로 품질 보장
