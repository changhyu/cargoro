# 기여 가이드라인

이 프로젝트에 기여하기 위한 가이드라인입니다.

## 폴더 구조

프로젝트는 다음과 같은 폴더 구조를 따릅니다:

- `apps/` - 프론트엔드 애플리케이션

  - `delivery-driver/` - 배송 기사용 앱
  - `fleet-manager-web/` - 차량 관리자용 웹 앱
  - `parts-web/` - 부품 관리 웹 앱
  - `smart-car-assistant/` - 스마트 카 어시스턴트 앱
  - `superadmin-web/` - 관리자용 웹 앱
  - `workshop-mobile/` - 정비소용 모바일 앱
  - `workshop-web/` - 정비소용 웹 앱

- `backend/` - 백엔드 서비스 코드

  - `database/` - 데이터베이스 관련 코드
  - `gateway/` - API 게이트웨이
  - `services/` - 백엔드 서비스
  - `tests/` - 백엔드 테스트 코드

- `config/` - 설정 파일

  - `linting/` - 코드 품질 관련 설정 파일 (ESLint, Prettier 등)
  - `typescript/` - TypeScript 관련 설정 파일
  - `build/` - 빌드 시스템 관련 설정 파일 (Turbo 등)
  - `git/` - Git 관련 설정 파일 (Husky, commitlint 등)
  - `env/` - 환경 변수 관련 파일

- `core/` - 핵심 라이브러리 코드

- `docs/` - 문서 파일

  - `english/` - 영어 문서
  - `korean/` - 한글 문서
  - `api-specs/` - API 명세
  - `architecture/` - 아키텍처 문서
  - `guidelines/` - 개발 가이드라인
  - `onboarding/` - 온보딩 문서
  - `workflows/` - 워크플로우 문서

- `infra/` - 인프라 관련 코드

- `packages/` - 공유 패키지

- `scripts/` - 유틸리티 스크립트

  - `cli/` - CLI 도구
  - `deployment/` - 배포 스크립트
  - `generators/` - 코드 생성 스크립트
  - `migration/` - 마이그레이션 스크립트
  - `templates/` - 템플릿 파일
  - `utils/` - 유틸리티 스크립트

- `shared/` - 공유 코드

- `tests/` - 테스트 코드

## 브랜치 전략

- `main` - 제품 릴리스 브랜치
- `develop` - 개발 브랜치
- `feature/...` - 기능 개발 브랜치
- `bugfix/...` - 버그 수정 브랜치
- `hotfix/...` - 긴급 수정 브랜치

## 커밋 메시지 규칙

커밋 메시지는 다음 형식을 따릅니다:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 타입 (Type)

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅, 세미콜론 누락 등 코드 변경이 없는 경우
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드 추가 및 수정
- `chore`: 빌드 프로세스, 도구 변경 등

## 풀 리퀘스트 프로세스

1. 작업할 이슈를 선택하거나 생성합니다.
2. 적절한 브랜치를 생성합니다.
3. 코드를 작성하고 테스트합니다.
4. 풀 리퀘스트를 생성합니다.
5. 코드 리뷰를 받습니다.
6. 승인 후 병합합니다.

## 코드 스타일

- TypeScript/JavaScript: ESLint + Prettier 설정을 따릅니다.
- Python: PEP8 스타일 가이드를 따릅니다.
