# 백엔드 테스트 실행 가이드

카고로(CarGoro) 플랫폼의 백엔드 테스트를 모노레포 루트에서 쉽게 실행할 수 있는 가이드입니다.

## 환경 설정

먼저 백엔드 테스트 환경이 올바르게 설정되어 있는지 확인합니다:

```bash
# 환경 점검
pnpm test:backend:check-env
```

필요한 패키지가 설치되어 있지 않다면 다음 명령어로 설치할 수 있습니다:

```bash
# 필요한 Python 패키지 설치
pnpm test:backend:setup-env
```

## 문제 해결을 위한 도구

테스트 실행 시 문제가 발생하는 경우 다음 도구를 사용하여 해결할 수 있습니다:

```bash
# __pycache__ 폴더와 .pyc 파일 정리 (파일 충돌 문제 해결)
pnpm test:backend:clean-cache

# Prisma 클라이언트 생성 (Prisma 관련 오류 해결)
pnpm test:backend:generate-prisma

# 백엔드 모듈 초기화 (모듈 임포트 문제 해결)
pnpm test:backend:init-modules

# 안정적인 테스트만 실행 (문제가 있는 테스트 제외)
pnpm test:backend:stable
```

## 테스트 실행 순서

백엔드 테스트를 실행할 때 아래 순서를 따르는 것이 좋습니다:

1. 테스트 환경 확인 및 설정

   ```bash
   pnpm test:backend:check-env
   pnpm test:backend:setup-env
   ```

2. **pycache** 파일 정리

   ```bash
   pnpm test:backend:clean-cache
   ```

3. 모듈 초기화 및 Prisma 클라이언트 생성

   ```bash
   pnpm test:backend:init-modules
   pnpm test:backend:generate-prisma
   ```

4. 테스트 실행

   ```bash
   # 안정적인 테스트만 실행
   pnpm test:backend:stable

   # 또는 쉘 스크립트로 실행 (PYTHONPATH 자동 설정)
   pnpm test:backend:unit:sh
   ```

이 순서대로 실행하면 대부분의 환경 문제를 해결할 수 있습니다.

## 기본 명령어

모노레포 루트에서 다음 명령어를 사용하여 백엔드 테스트를 실행할 수 있습니다:

### 모든 테스트 실행

```bash
pnpm test:backend
# 또는
pnpm test:backend:all
```

### 단위 테스트 실행

```bash
pnpm test:backend:unit
```

또는 쉘 스크립트를 사용하여 PYTHONPATH를 자동 설정할 수 있습니다:

```bash
pnpm test:backend:unit:sh
```

### 통합 테스트 실행

```bash
pnpm test:backend:integration
```

또는 쉘 스크립트 사용:

```bash
pnpm test:backend:integration:sh
```

### 특정 모듈 테스트

```bash
pnpm test:backend:specific repair
# 또는
pnpm test:backend:specific vehicle
# 또는
pnpm test:backend:specific core-api
```

### 커버리지 측정

```bash
pnpm test:backend:coverage
# 또는 개선된 커버리지 리포트
pnpm test:backend:coverage:improved
# 또는 임계값 설정 (예: 90%)
pnpm test:backend:coverage:improved 90
```

### 도움말

```bash
pnpm test:backend:help
```

## 자주 발생하는 문제 해결

### 모듈 경로 문제

테스트 실행 시 `ModuleNotFoundError` 오류가 발생하는 경우:

1. PYTHONPATH가 올바르게 설정되어 있는지 확인하세요
2. 쉘 스크립트를 사용하면 PYTHONPATH가 자동으로 설정됩니다:

   ```bash
   pnpm test:backend:sh
   pnpm test:backend:unit:sh
   ```

3. 또는 **pycache** 파일을 정리하여 모듈 충돌 문제를 해결할 수 있습니다:
   ```bash
   pnpm test:backend:clean-cache
   ```

### Prisma 클라이언트 문제

Prisma 관련 오류가 발생하는 경우:

1. Prisma 클라이언트를 생성하세요:

   ```bash
   pnpm test:backend:generate-prisma
   ```

2. `DATABASE_URL` 환경 변수가 올바르게 설정되어 있는지 확인하세요.

### Python 패키지 문제

필요한 Python 패키지가 설치되어 있지 않아 오류가 발생하는 경우:

1. 누락된 패키지를 확인하고 설치하세요:

   ```bash
   # 예: passlib가 누락된 경우
   pip install passlib
   ```

2. 또는 테스트 환경 설정 스크립트를 실행하세요:
   ```bash
   pnpm test:backend:setup-env
   ```

## 테스트 스크립트 개선 계획

향후 계획된 테스트 스크립트 개선 사항:

1. 자동화된 테스트 환경 설정 (가상 환경 자동 생성)
2. 테스트 격리 및 병렬 실행 최적화
3. CI/CD 파이프라인 통합 강화
4. 커버리지 리포트 자동화 및 시각화

### 테스트 실패 디버깅

테스트 실패를 더 자세히 확인하려면 `-v` 플래그를 사용하세요:

```bash
cd backend
python -m pytest tests/unit/test_file.py -v
```

## 테스트 자동화 스크립트 요약

| 스크립트                       | 설명                           |
| ------------------------------ | ------------------------------ |
| `test:backend:check-env`       | 테스트 환경 확인               |
| `test:backend:setup-env`       | 테스트 환경 설정               |
| `test:backend:clean-cache`     | **pycache** 파일 정리          |
| `test:backend:generate-prisma` | Prisma 클라이언트 생성         |
| `test:backend:init-modules`    | 모듈 초기화                    |
| `test:backend:stable`          | 안정적인 테스트만 실행         |
| `test:backend:unit:sh`         | 단위 테스트 실행 (쉘 스크립트) |
| `test:backend:integration:sh`  | 통합 테스트 실행 (쉘 스크립트) |
