# 서비스 마이그레이션 지침

이 문서는 기존 서비스 파일을 표준화된 구조로 마이그레이션하는 방법을 설명합니다.

## 마이그레이션 단계

1. 현재까지 다음 서비스들의 `lib/server.py` 파일과 새로운 `new_main.py` 파일이 생성되었습니다:

   - fleet-api
   - delivery-api
   - repair-api
   - admin-api

2. 각 서비스를 마이그레이션하려면 다음 단계를 수행하세요:

### 1단계: 기존 main.py 백업

```bash
# 각 서비스 디렉토리에서
cd /backend/services/{service-name}
cp main.py main.py.bak
```

### 2단계: 새 main.py 파일 적용

```bash
# 각 서비스 디렉토리에서
cd /backend/services/{service-name}
mv main.py
```

### 3단계: 표준화 확인

다음을 확인하세요:

- 모든 서비스는 `lib/server.py`를 통해 애플리케이션 설정을 관리합니다.
- 모든 서비스는 간소화된 `main.py`를 사용합니다.
- 모든 서비스는 공유 유틸리티를 사용합니다.

### 4단계: 라우터 참조 확인 및 수정

```python
# 경로가 다음과 같이 수정되었는지 확인:
from lib.routes import vehicle_routes  # 변경됨
# 이전: from routes import vehicle_routes
```

### 5단계: 서비스 테스트

각 서비스에 대해 다음 테스트를 수행하세요:

```bash
# 서비스 실행
cd /backend/services/{service-name}
python main.py

# 다른 터미널에서 헬스 체크 테스트
curl http://localhost:{port}/health
```

## 문제 해결

1. 임포트 오류 발생 시:

   - 모든 임포트 경로가 새 디렉토리 구조를 반영하는지 확인하세요.
   - 상대 경로 임포트는 절대 경로 임포트로 변경하는 것이 좋습니다.

2. 라우터 오류 발생 시:

   - 라우터 파일이 `lib/routes/` 디렉토리에 있는지 확인하세요.
   - 라우터 임포트 경로가 올바른지 확인하세요.

3. 데이터베이스 연결 오류 발생 시:
   - Prisma 클라이언트 초기화가 올바르게 설정되었는지 확인하세요.
   - 환경 변수 `DATABASE_URL`이 올바르게 설정되었는지 확인하세요.

## 테스트 실행 가이드

표준화된 구조에서 테스트를 실행하려면 다음과 같은 방법을 사용할 수 있습니다:

### 모든 서비스 테스트 실행

```bash
# 프로젝트 루트 디렉토리에서
cd backend/services
python run_all_tests.py
```

### 특정 서비스 테스트 실행

```bash
# 특정 서비스만 테스트
python run_all_tests.py --service fleet-api

# 특정 서비스의 단위 테스트만 실행
python run_all_tests.py --service fleet-api --type unit

# 특정 서비스의 통합 테스트만 실행
python run_all_tests.py --service fleet-api --type integration
```

### 개별 테스트 파일 실행

```bash
cd backend/services/fleet-api
python -m pytest tests/unit/test_vehicle_routes.py -v
```

### 가상 환경 활성화

테스트를 실행하기 전에 가상 환경을 활성화해야 할 수 있습니다:

```bash
# 프로젝트 루트 디렉토리에서
source .venv/bin/activate  # Linux/macOS
# 또는
.\.venv\Scripts\activate   # Windows
```

## 추가 참고 사항

1. 각 서비스 디렉토리에는 서비스별 README.md 파일을 추가하는 것이 좋습니다.
2. 테스트 코드는 `tests/unit/`과 `tests/integration/` 디렉토리로 구분하세요.
3. 공통 유틸리티를 최대한 활용하여 코드 중복을 방지하세요.

## 완료 체크리스트

각 서비스에 대해 다음 항목이 모두 완료되었는지 확인하세요:

### 1. 코드 구조

- [ ] `lib/server.py` 파일이 표준화된 템플릿을 따름
- [ ] `main.py` 파일이 표준화된 템플릿을 따름
- [ ] 지정된 포트 번호로 설정됨 (서비스별 포트 참조)
- [ ] 불필요한 중복 코드가 제거됨

### 2. 문서화

- [ ] 서비스 루트에 README.md 파일이 존재함
- [ ] tests/ 디렉토리에 README.md 파일이 존재함
- [ ] 코드 내 주석이 일관된 형식을 따름

### 3. 테스트

- [ ] 테스트 코드가 unit/integration 디렉토리로 구분됨
- [ ] 테스트 코드의 임포트 경로가 수정됨
- [ ] 모든 테스트가 성공적으로 실행됨

### 4. 에러 처리

- [ ] 공통 에러 처리 메커니즘을 사용함
- [ ] 표준화된 응답 형식을 사용함

## 추가 작업

### TypeScript 기반 서비스

현재 `backend/services/users` 서비스는 TypeScript/Express 기반으로 구현되어 있어 이번 표준화 작업에서 제외되었습니다. 향후 다음과 같은 표준화 작업이 필요합니다:

1. TypeScript 기반 서비스에 대한 별도의 표준 구조 정의
2. Express 기반 애플리케이션에 대한 표준 템플릿 작성
3. 해당 서비스를 표준 구조로 마이그레이션
