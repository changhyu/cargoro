# 공유 유틸리티 사용 가이드

이 디렉토리에는 모든 마이크로서비스에서 공통으로 사용하는 코드가 포함되어 있습니다.

## 설정 사용 방법

```python
from shared.config.settings import get_settings

# 환경 설정 로드
settings = get_settings()

# 설정 값 사용
database_url = settings.DATABASE_URL
debug_mode = settings.DEBUG
```

## 로깅 설정 방법

```python
from shared.utils.logging_utils import setup_logger

# 서비스별 로거 설정
logger = setup_logger("service-name")

# 로그 출력
logger.info("정보 로그")
logger.warning("경고 로그")
logger.error("오류 로그")
```

## 표준 응답 유틸리티 사용 방법

```python
from shared.utils.response_utils import create_response, create_error_response, ApiException

# 성공 응답 생성
@app.get("/users")
async def get_users():
    users = await get_users_from_db()
    return create_response(data=users, message="사용자 목록 조회 성공")

# 오류 응답 생성
@app.get("/users/{user_id}")
async def get_user(user_id: str):
    user = await get_user_from_db(user_id)
    if not user:
        raise ApiException(message="사용자를 찾을 수 없습니다", status_code=404)
    return create_response(data=user)
```

## 테스트 코드 작성 방법

```python
# conftest.py
import pytest
from shared.testing.conftest import client, test_settings
from shared.testing.utils import random_email, create_model_dict
from shared.testing.mocks import mock_db

# 테스트 코드
def test_create_user(client, mock_db):
    # 테스트 데이터 생성
    user_data = {
        "email": random_email(),
        "name": "Test User",
        "password": "password123"
    }

    # API 호출
    response = client.post("/users", json=user_data)

    # 응답 검증
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == user_data["email"]
```

## 공통 인터페이스 구현 방법

```python
from shared.interfaces import MicroserviceInterface, DataAccessInterface

class UserService(MicroserviceInterface):
    async def health_check(self):
        # 서비스 상태 확인 로직
        return {"status": "healthy", "version": "1.0.0"}

    async def get_version(self):
        return "1.0.0"
```
