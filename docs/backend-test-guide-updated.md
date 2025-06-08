# 백엔드 테스트 실행 가이드

이 문서는 카고로(CarGoro) 모노레포 프로젝트에서 백엔드 테스트를 실행하는 방법을 설명합니다.

## 개요

카고로 백엔드는 Python FastAPI 기반으로 구성되어 있으며, 여러 서비스 모듈로 분리되어 있습니다. 테스트는 Pytest 프레임워크를 사용하며, 단위 테스트와 통합 테스트로 구분됩니다.

## 새로운 통합 테스트 스크립트

모든 테스트 단계를 자동화하는 통합 스크립트가 추가되었습니다. 이 스크립트는 다음 단계를 자동으로 수행합니다:

1. 테스트 환경 확인 및 설정
2. **pycache** 정리
3. conftest.py 파일 업데이트 (선택적)
4. 모듈 초기화 및 구조 생성
5. Prisma 클라이언트 생성
6. 테스트 실행 (안정적인 테스트 또는 전체 테스트)

### 통합 스크립트 사용법

```bash
# 기본 실행 (안정적인 테스트만 실행)
pnpm test:backend:run

# 단위 테스트 실행
pnpm test:backend:run:unit

# 통합 테스트 실행
pnpm test:backend:run:integration

# 모든 테스트 실행
pnpm test:backend:run:all

# 커버리지 측정
pnpm test:backend:run:coverage

# conftest.py 파일 업데이트 및 테스트 실행
pnpm test:backend:run:update-conftest

# All-in-One 셸 스크립트 (더 사용자 친화적인 인터페이스)
pnpm test:backend:all-in-one

# 고급 옵션 사용
node scripts/run-integrated-backend-tests.js --type unit --skip-setup --update-conftest
```

#### All-in-One 셸 스크립트 옵션

```bash
# 기본 실행
./scripts/run-backend-tests-all-in-one.sh

# 옵션 사용
./scripts/run-backend-tests-all-in-one.sh -t unit -c -u  # 단위 테스트 + 커버리지 + conftest 업데이트

# 도움말 보기
./scripts/run-backend-tests-all-in-one.sh --help
```

## 테스트 실행 환경 설정

### 1. 필수 요구 사항

- Python 3.9 이상
- Node.js 18 이상
- pnpm 패키지 매니저
- PostgreSQL (테스트 데이터베이스용)
- Python 가상 환경 (권장)

### 2. 테스트 환경 설정

테스트를 실행하기 전에 다음 단계를 수행하여 환경을 설정합니다:

```bash
# 테스트 환경 확인
pnpm test:backend:check-env

# 테스트 환경 설정 (필요한 패키지 설치)
pnpm test:backend:setup-env
```

### 3. 테스트 캐시 정리

테스트 실행 전에 Python 캐시 파일을 정리하는 것이 좋습니다:

```bash
pnpm test:backend:clean-cache
```

### 4. conftest.py 파일 업데이트

테스트 파일 구조와 모듈 임포트 문제를 해결하기 위해 개선된 conftest.py 파일을 적용합니다:

```bash
# conftest.py 파일 업데이트
pnpm test:backend:update-conftest
```

이 작업은 다음과 같은 작업을 수행합니다:

- 기본 conftest.py 파일을 개선된 버전으로 업데이트
- 하위 디렉토리에 필요한 conftest.py 파일 생성
- 기존 파일은 자동으로 백업

### 5. 모듈 초기화 및 Prisma 클라이언트 생성

Python 모듈 구조를 초기화하고 Prisma 클라이언트를 생성합니다:

```bash
# Python 모듈 초기화 (__init__.py 파일 생성)
pnpm test:backend:init-modules

# Prisma 클라이언트 생성
pnpm test:backend:generate-prisma
```

## 테스트 실행 방법

### 1. 통합 스크립트로 실행 (권장)

모든 단계를 자동화한 통합 스크립트를 사용하는 것이 가장 쉽습니다:

```bash
# 안정적인 테스트만 실행
pnpm test:backend:run

# 단위 테스트 실행
pnpm test:backend:run:unit

# 통합 테스트 실행
pnpm test:backend:run:integration

# 모든 테스트 실행
pnpm test:backend:run:all

# 커버리지 측정
pnpm test:backend:run:coverage

# conftest.py 파일 업데이트 및 테스트 실행
pnpm test:backend:run:update-conftest
```

### 2. 개별 단계로 실행

필요한 경우 각 단계를 개별적으로 실행할 수 있습니다:

```bash
# 1. 환경 설정 및 캐시 정리
pnpm test:backend:check-env
pnpm test:backend:setup-env
pnpm test:backend:clean-cache

# 2. conftest.py 파일 업데이트
pnpm test:backend:update-conftest

# 3. 모듈 초기화 및 Prisma 클라이언트 생성
pnpm test:backend:init-modules
pnpm test:backend:generate-prisma

# 4. 테스트 실행
# 4.1 안정적인 테스트만 실행
pnpm test:backend:stable

# 4.2 Shell 스크립트로 실행 (PYTHONPATH 자동 설정)
pnpm test:backend:unit:sh      # 단위 테스트
pnpm test:backend:integration:sh  # 통합 테스트
pnpm test:backend:sh           # 모든 테스트

# 4.3 JS 스크립트로 실행
pnpm test:backend:unit:js      # 단위 테스트
pnpm test:backend:integration:js  # 통합 테스트
pnpm test:backend:all:js       # 모든 테스트

# 5. 커버리지 측정
pnpm test:backend:coverage:sh
```

## 테스트 문제 해결

### 1. 모듈 경로 문제

테스트 중 모듈을 찾을 수 없는 오류가 발생하는 경우:

- `update-conftest.js` 스크립트를 실행하여 conftest.py 파일을 업데이트하세요.
- Shell 스크립트 (`*.sh`)를 사용하면 PYTHONPATH가 자동으로 설정됩니다.
- 통합 스크립트 (`run-integrated-backend-tests.js`)를 사용하면 모든 설정이 자동화됩니다.
- 수동으로 PYTHONPATH를 설정할 수 있습니다:

```bash
# Linux/macOS
export PYTHONPATH=/path/to/monorepo-root/backend:/path/to/monorepo-root/backend/services

# Windows
set PYTHONPATH=C:\path\to\monorepo-root\backend;C:\path\to\monorepo-root\backend\services
```

### 2. 개선된 conftest.py 사용

개선된 conftest.py 파일은 다음과 같은 기능을 제공합니다:

- 동적 모듈 임포트 지원
- 모든 서비스 경로 자동 추가
- 더 나은 Prisma 모의 객체
- 테스트 상태 관리 기능

업데이트된 conftest.py 파일을 적용하려면:

```bash
# conftest.py 파일 업데이트
pnpm test:backend:update-conftest
```

### 3. 특정 테스트만 실행

특정 테스트만 실행하려면:

```bash
# 특정 테스트 파일 실행
pnpm test:backend:specific:js user_routes

# 특정 테스트 이름으로 실행
cd backend && python -m pytest tests/unit -k "test_create_user"
```

## 테스트 파일 구조

백엔드 테스트 파일은 다음 구조로 구성되어 있습니다:

```
backend/
├── tests/
│   ├── unit/            # 단위 테스트
│   │   ├── services/    # 서비스별 단위 테스트
│   │   └── ...
│   ├── integration/     # 통합 테스트
│   │   └── ...
│   ├── fixtures/        # 테스트 픽스처
│   ├── conftest.py      # 공통 테스트 설정
│   └── conftest_new.py  # 개선된 테스트 설정
└── services/            # 백엔드 서비스 모듈
    ├── auth/
    ├── repair/
    ├── vehicle/
    └── ...
```

## 테스트 작성 가이드

새로운 테스트를 작성할 때는 다음 가이드라인을 따르세요:

1. 적절한 디렉토리에 테스트 파일 배치 (단위/통합)
2. 파일 이름은 `test_*.py` 형식 사용
3. 테스트 함수 이름은 `test_*` 형식 사용
4. 필요한 경우 `conftest.py`에 공통 픽스처 추가
5. 가능한 모의 객체(MockPrisma)를 활용하여 독립적인 테스트 작성

예시:

```python
import pytest
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_create_user(mock_prisma):
    # 테스트 설정
    mock_prisma.user.create.return_value = {"id": "1", "name": "Test User"}

    # 테스트 대상 함수 실행
    from services.auth.user_service import create_user
    result = await create_user({"name": "Test User"}, mock_prisma)

    # 검증
    assert result["id"] == "1"
    assert result["name"] == "Test User"
    mock_prisma.user.create.assert_called_once()
```

## 백업 관리 시스템

테스트 과정에서 `conftest.py` 파일이 수정되거나 다른 설정 파일들이 변경될 때 자동으로 백업이 생성됩니다. 이러한 백업 파일들을 효율적으로 관리하기 위한 도구가 제공됩니다.

### 1. 백업 관리자 사용법

백업 관리자는 백업 파일을 조회, 아카이브, 복원하는 기능을 제공합니다:

```bash
# 모든 백업 파일 목록 조회
pnpm test:backend:backup-list

# 백업 파일 아카이브 (지정된 폴더로 이동)
pnpm test:backend:backup-archive

# 특정 백업 파일 복원
pnpm test:backend:backup-restore <백업파일경로>

# 도움말 보기
pnpm test:backend:backup-manager help
```

### 2. 백업 정리 도구 사용법

오래된 백업 파일을 자동으로 정리하는 도구도 제공됩니다:

```bash
# 7일 이상 된 백업 파일 정리
pnpm test:backend:cleanup-backups

# 특정 기간(일) 이상 된 백업 파일 정리
pnpm test:backend:cleanup-backups --days 3

# 정리 대상 파일 미리 보기 (실제 삭제 없음)
pnpm test:backend:cleanup-backups:dry

# 모든 백업 파일 강제 정리
pnpm test:backend:cleanup-backups:force

# 도움말 보기
pnpm test:backend:cleanup-backups --help
```

### 3. 백업 파일 구조

백업 파일은 다음과 같은 명명 규칙을 따릅니다:

- 원본 파일명 + `.bak.` + 타임스탬프

예: `conftest.py.bak.1621234567890`

### 4. 아카이브 디렉토리

아카이브된 백업 파일은 다음 위치에 저장됩니다:

- 기본 위치: `monorepo-root/cleanup-backup/`
- 날짜별 폴더: `monorepo-root/cleanup-backup/YYYYMMDD/`

이 구조를 통해 백업 파일을 날짜별로 정리하고 관리할 수 있습니다.

## 테스트 자동화

CI/CD 파이프라인에서 테스트를 자동화하려면:

```yaml
# CI 설정 예시
steps:
  - name: Set up environment
    run: pnpm test:backend:setup-env

  - name: Update conftest and run tests
    run: pnpm test:backend:run:update-conftest

  - name: Check coverage
    run: pnpm coverage:check
```
