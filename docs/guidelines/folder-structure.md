# 폴더 구조 가이드라인

이 문서는 CarGoro 프로젝트의 일관된 폴더 구조를 위한 가이드라인을 제공합니다.

## 프론트엔드 앱 구조 (Next.js)

Next.js App Router 기준으로 다음과 같은 폴더 구조를 준수합니다:

```
app/
├── pages/          # 라우팅 페이지 구성
├── components/     # 공통/재사용 UI 구성 요소
├── features/       # 도메인별 기능 단위 (예: 예약, 배정 등)
├── hooks/          # 커스텀 훅
├── state/          # Zustand 또는 전역 상태 관리
├── services/       # API 호출 로직
└── constants/      # 상수 정의 (enum, status 등)
```

### 주요 규칙

1. **src/ 폴더 사용 금지**
2. **app/ 내 폴더 순서 준수**
3. **동일 타입의 폴더는 동일한 내부 구조 유지**

## 백엔드 서비스 구조 (FastAPI)

모든 백엔드 서비스는 다음과 같은 구조를 따릅니다:

```
services/{service-name}/
├── main.py               # 애플리케이션 진입점
├── models.py             # 데이터 모델
├── dependencies.py       # 의존성 및 미들웨어
├── config.py             # 설정
├── routes/               # API 라우트
│   ├── {resource}_routes.py
│   └── ...
├── services/             # 비즈니스 로직
│   ├── {resource}_service.py
│   └── ...
└── utils/                # 유틸리티 함수
    └── ...
```

### 주요 규칙

1. **Python 파일은 snake_case 사용**
2. **각 도메인 서비스는 독립적인 구조 유지**
3. **공통 코드는 상위 레벨로 추출**

## 패키지 구조

재사용 가능한 코드 모듈은 다음 구조를 따릅니다:

```
packages/{package-name}/
├── index.ts        # 패키지 진입점
├── src/            # 소스 코드 (패키지에서만 src/ 허용)
├── tests/          # 테스트 코드
└── tsconfig.json   # TypeScript 설정
```

## 테스트 구조

### 단위 테스트

```
{app-or-package}/tests/
├── unit/             # 단위 테스트
│   ├── components/   # 컴포넌트 테스트
│   ├── hooks/        # 훅 테스트
│   └── utils/        # 유틸리티 테스트
└── integration/      # 통합 테스트
```

### E2E 테스트

```
{app}/e2e/
├── fixtures/         # 테스트 데이터
├── support/          # 테스트 지원 코드
└── {feature}.spec.ts # 테스트 사양
```

## 도메인별 기능 구조

각 도메인별 기능(features)은 다음 구조를 따릅니다:

```
features/{feature-name}/
├── components/       # 기능 관련 컴포넌트
├── hooks/            # 기능 관련 훅
├── services/         # 기능 관련 서비스
├── types/            # 기능 관련 타입
└── utils/            # 기능 관련 유틸리티
```

## 문서 구조

```
docs/
├── architecture/     # 아키텍처 문서
├── api-specs/        # API 명세
├── erd/              # 데이터베이스 ERD
├── workflows/        # 기능 흐름, 시나리오
├── guidelines/       # 개발 가이드라인
└── onboarding/       # 온보딩 가이드
```

## 구조 검증

폴더 구조 일관성을 유지하기 위해 정기적으로 다음 도구를 사용합니다:

1. **구조 검증 스크립트**: `/scripts/validate-structure.sh`
2. **CI/CD 검증**: GitHub Actions에서 구조 검증 실행

모든 구성원은 이 가이드라인을 준수하여 프로젝트 전체의 일관성을 유지해야 합니다.
