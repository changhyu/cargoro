# 백엔드 서비스 (CarGoro)

CarGoro 백엔드 서비스는 FastAPI 기반 마이크로서비스 아키텍처로 구현되어 있습니다.

## 디렉토리 구조

```
backend/
├── services/            # 마이크로서비스 모듈
│   ├── core-api/        # 사용자/인증 서비스
│   ├── repair-api/      # 정비 서비스
│   ├── fleet-api/       # 차량 관리 서비스
│   ├── parts-api/       # 부품 관리 서비스
│   ├── delivery-api/    # 탁송 서비스
│   ├── admin-api/       # 관리자 기능
│   ├── repair/          # 정비 핸들러 라이브러리
│   └── vehicle/         # 차량 핸들러 라이브러리
├── database/            # 데이터베이스 관련 모듈
├── gateway/             # API 게이트웨이
├── shared/              # 공통 유틸리티
│   ├── config/          # 설정
│   ├── testing/         # 테스트 유틸리티
│   └── utils/           # 공통 유틸리티 함수
└── tests/               # 테스트 코드
```

## 설치 및 실행

1. 가상 환경 생성 및 활성화

```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\activate     # Windows
```

2. 의존성 설치

```bash
pip install -r requirements.txt
pip install -r requirements-test.txt  # 테스트 관련 의존성
```

3. 기본 테스트 실행

```bash
python run_basic_tests.py
```

## 테스트

### 기본 테스트 실행

기본 테스트는 서비스 모듈 임포트와 기본 기능을 검증합니다. 코드 커버리지 검사는 비활성화되어 있습니다.

```bash
python run_basic_tests.py
```

이 스크립트는 다음 작업을 수행합니다:

1. 서비스 모듈 임포트 문제 해결 (fix_service_imports.py)
2. 기본 테스트 실행
   - tests/test_basic.py: 기본 기능 테스트
   - tests/test_services_module.py: 서비스 모듈 구조 테스트
   - tests/test_services_imports.py: 서비스 모듈 임포트 테스트

### 전체 테스트 실행

모든 테스트를 실행하고 코드 커버리지 검사를 수행합니다. 현재는 일부 테스트가 실패할 수 있습니다.

```bash
python run_tests.py
```

## 모듈 임포트 문제 해결

서비스 모듈 임포트 문제가 발생하는 경우 다음 스크립트를 실행하세요:

```bash
python fix_service_imports.py
```

이 스크립트는 서비스 디렉토리의 심볼릭 링크를 수정하고 필요한 `__init__.py` 파일을 생성합니다.

## 환경 변수

주요 환경 변수는 다음과 같습니다:

- `ENV`: 환경 (development, production, test)
- `DEBUG`: 디버그 모드 활성화 (True/False)
- `DATABASE_URL`: 데이터베이스 연결 URL
- `SECRET_KEY`: JWT 서명용 비밀 키
- `JWT_ALGORITHM`: JWT 알고리즘 (HS256)
