# 백엔드 서비스 표준화 가이드

이 문서는 백엔드 서비스의 표준화된 구조와 구현 방법에 대해 설명합니다.

## 표준화된 디렉토리 구조

모든 서비스는 다음과 같은 표준화된 구조를 따릅니다:

```
/backend/services/{service-name}/
├── lib/                        # 핵심 코드
│   ├── routes/                 # API 라우트
│   ├── models/                 # 데이터 모델
│   ├── services/               # 비즈니스 로직
│   ├── utils/                  # 유틸리티 함수
│   ├── middleware/             # 미들웨어
│   └── server.py               # 서버 설정
├── tests/                      # 테스트 코드
│   ├── unit/                   # 단위 테스트
│   └── integration/            # 통합 테스트
└── main.py                     # 애플리케이션 진입점
```

## 서버 표준화 및 구현

모든 서비스는 다음과 같은 표준화된 서버 구현을 사용합니다:

### server.py

`lib/server.py` 파일은 FastAPI 애플리케이션 설정과 초기화를 담당합니다:

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    앱 시작 및 종료 시 실행될 로직
    """
    # 앱 시작 시 실행될 코드
    logger.info(f"서버 시작 (환경: {settings.ENV})")
    await prisma.connect()
    logger.info("데이터베이스 연결 성공")

    yield

    # 앱 종료 시 실행될 코드
    await prisma.disconnect()
    logger.info("서버 종료")

# FastAPI 앱 생성
app = FastAPI(
    title="CarGoro Service API",
    description="서비스 API 설명",
    version="0.1.0",
    docs_url="/api-docs",
    redoc_url="/api-redoc",
    openapi_url="/api-docs.json",
    lifespan=lifespan,
    debug=settings.DEBUG
)
```

### main.py

`main.py` 파일은 애플리케이션 진입점으로, 최소한의 코드만 포함합니다:

```python
import os
import sys
import uvicorn

# 현재 디렉토리를 모듈 검색 경로에 추가
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 표준화된 서버 모듈 임포트
from lib.server import app

# 서버 실행 (직접 실행 시에만)
if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
```

## 공유 유틸리티 사용

모든 서비스는 `/backend/shared` 디렉토리의 공유 유틸리티를 사용해야 합니다:

- `shared.config.settings`: 공통 환경 설정
- `shared.utils.logging_utils`: 공통 로깅 설정
- `shared.utils.response_utils`: 표준 API 응답 형식
- `shared.testing`: 테스트 관련 유틸리티

## 표준 API 응답 형식

모든 API 응답은 다음과 같은 표준 형식을 따릅니다:

```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": { ... },
  "error_code": null,
  "details": null
}
```

오류 응답:

```json
{
  "success": false,
  "message": "요청 처리 중 오류가 발생했습니다.",
  "data": null,
  "error_code": "ERROR_CODE",
  "details": { "field": "오류 설명" }
}
```

## 예외 처리

모든 서비스는 `ApiException` 클래스를 사용하여 예외를 처리해야 합니다:

```python
from shared.utils.response_utils import ApiException

if not user:
    raise ApiException(message="사용자를 찾을 수 없습니다", status_code=404, error_code="USER_NOT_FOUND")
```

## 서비스 포트 할당

각 서비스는 다음과 같은 표준 포트를 사용합니다:

- core-api: 8001
- repair-api: 8002
- parts-api: 8003
- delivery-api: 8004
- fleet-api: 8005
- admin-api: 8006

## 서비스 마이그레이션 가이드

기존 서비스를 표준화된 구조로 마이그레이션하려면 다음 단계를 따르세요:

1. `lib/server.py` 파일 생성
2. `main.py` 파일을 간소화하고 `lib/server.py`를 임포트하도록 수정
3. 관련 코드를 적절한 디렉토리로 이동
4. 공유 유틸리티 사용으로 변경
5. 테스트 코드를 적절한 디렉토리로 이동

## 테스트 표준화

모든 서비스의 테스트 코드는 다음 표준을 따라야 합니다:

### 테스트 디렉토리 구조

```
/tests/
├── unit/                  # 단위 테스트
│   ├── test_models.py     # 모델 테스트
│   ├── test_services.py   # 서비스 테스트
│   └── test_utils.py      # 유틸리티 테스트
├── integration/           # 통합 테스트
│   ├── test_routes.py     # API 라우트 테스트
│   └── test_db.py         # 데이터베이스 통합 테스트
├── conftest.py            # 테스트 설정 및 픽스처
└── README.md              # 테스트 문서
```

### 테스트 패턴

1. **단위 테스트**: 개별 함수나 클래스를 격리된 환경에서 테스트합니다.

   ```python
   def test_calculate_distance():
       result = calculate_distance(point_a, point_b)
       assert result == expected_distance
   ```

2. **통합 테스트**: API 엔드포인트를 실제와 유사한 환경에서 테스트합니다.

   ```python
   def test_create_vehicle(test_client, mock_db):
       response = test_client.post("/vehicles", json=vehicle_data)
       assert response.status_code == 201
       assert response.json()["data"]["id"] is not None
   ```

3. **목킹 패턴**: 외부 의존성은 mock 객체로 대체합니다.
   ```python
   @pytest.fixture
   def mock_prisma():
       with patch("lib.services.vehicle_service.prisma") as mock:
           mock.vehicle.find_many.return_value = [...]
           yield mock
   ```

### 테스트 문서화

각 테스트 디렉토리에는 README.md 파일을 포함하여 테스트 실행 방법과 가이드라인을 문서화합니다.
