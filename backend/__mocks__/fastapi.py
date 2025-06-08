"""
FastAPI 모킹 모듈

테스트에서 FastAPI 관련 기능을 모킹하기 위한 모듈입니다.
"""

from typing import Any, Dict, List, Optional, Union, Callable
from unittest.mock import MagicMock, AsyncMock
import json


class MockRequest:
    """FastAPI Request 객체 모킹"""

    def __init__(self, **kwargs):
        self.url = kwargs.get("url", "http://localhost:8000/test")
        self.method = kwargs.get("method", "GET")
        self.headers = kwargs.get("headers", {})
        self.query_params = kwargs.get("query_params", {})
        self.path_params = kwargs.get("path_params", {})
        self.cookies = kwargs.get("cookies", {})
        self.client = kwargs.get("client", {"host": "127.0.0.1", "port": 12345})
        self._json = kwargs.get("json", {})
        self._body = kwargs.get("body", b"")

    async def json(self):
        """요청 본문을 JSON으로 파싱"""
        return self._json

    async def body(self):
        """요청 본문을 바이트로 반환"""
        return self._body

    async def form(self):
        """요청 본문을 폼 데이터로 파싱"""
        return {}


class MockResponse:
    """FastAPI Response 객체 모킹"""

    def __init__(
        self, content: Any = None, status_code: int = 200, headers: Dict = None
    ):
        self.content = content
        self.status_code = status_code
        self.headers = headers or {}
        self.media_type = "application/json"

    def __call__(self, *args, **kwargs):
        return self


class MockHTTPException(Exception):
    """FastAPI HTTPException 모킹"""

    def __init__(self, status_code: int, detail: str = None, headers: Dict = None):
        self.status_code = status_code
        self.detail = detail
        self.headers = headers
        super().__init__(detail)


class MockQuery:
    """FastAPI Query 파라미터 모킹"""

    def __init__(self, default=None, **kwargs):
        self.default = default
        self.kwargs = kwargs

    def __call__(self, *args, **kwargs):
        return self.default


class MockPath:
    """FastAPI Path 파라미터 모킹"""

    def __init__(self, **kwargs):
        self.kwargs = kwargs

    def __call__(self, *args, **kwargs):
        return None


class MockDepends:
    """FastAPI Depends 모킹"""

    def __init__(self, dependency: Callable = None):
        self.dependency = dependency

    def __call__(self, *args, **kwargs):
        if self.dependency:
            return self.dependency(*args, **kwargs)
        return None


class MockAPIRouter:
    """FastAPI APIRouter 모킹"""

    def __init__(self, prefix: str = "", tags: List[str] = None, **kwargs):
        self.prefix = prefix
        self.tags = tags or []
        self.routes = []
        self.kwargs = kwargs

    def get(self, path: str, **kwargs):
        """GET 라우트 등록"""

        def decorator(func):
            self.routes.append(
                {"method": "GET", "path": path, "func": func, "kwargs": kwargs}
            )
            return func

        return decorator

    def post(self, path: str, **kwargs):
        """POST 라우트 등록"""

        def decorator(func):
            self.routes.append(
                {"method": "POST", "path": path, "func": func, "kwargs": kwargs}
            )
            return func

        return decorator

    def put(self, path: str, **kwargs):
        """PUT 라우트 등록"""

        def decorator(func):
            self.routes.append(
                {"method": "PUT", "path": path, "func": func, "kwargs": kwargs}
            )
            return func

        return decorator

    def delete(self, path: str, **kwargs):
        """DELETE 라우트 등록"""

        def decorator(func):
            self.routes.append(
                {"method": "DELETE", "path": path, "func": func, "kwargs": kwargs}
            )
            return func

        return decorator

    def patch(self, path: str, **kwargs):
        """PATCH 라우트 등록"""

        def decorator(func):
            self.routes.append(
                {"method": "PATCH", "path": path, "func": func, "kwargs": kwargs}
            )
            return func

        return decorator


class MockFastAPI:
    """FastAPI 애플리케이션 모킹"""

    def __init__(self, **kwargs):
        self.routers = []
        self.middleware = []
        self.exception_handlers = {}
        self.kwargs = kwargs

    def include_router(self, router: MockAPIRouter, **kwargs):
        """라우터 포함"""
        self.routers.append({"router": router, "kwargs": kwargs})

    def add_middleware(self, middleware_class, **kwargs):
        """미들웨어 추가"""
        self.middleware.append({"class": middleware_class, "kwargs": kwargs})

    def exception_handler(self, exc_class):
        """예외 핸들러 등록"""

        def decorator(func):
            self.exception_handlers[exc_class] = func
            return func

        return decorator


class MockStatus:
    """FastAPI status 코드 모킹"""

    HTTP_200_OK = 200
    HTTP_201_CREATED = 201
    HTTP_204_NO_CONTENT = 204
    HTTP_400_BAD_REQUEST = 400
    HTTP_401_UNAUTHORIZED = 401
    HTTP_403_FORBIDDEN = 403
    HTTP_404_NOT_FOUND = 404
    HTTP_422_UNPROCESSABLE_ENTITY = 422
    HTTP_500_INTERNAL_SERVER_ERROR = 500


class MockBackgroundTasks:
    """FastAPI BackgroundTasks 모킹"""

    def __init__(self):
        self.tasks = []

    def add_task(self, func: Callable, *args, **kwargs):
        """백그라운드 태스크 추가"""
        self.tasks.append({"func": func, "args": args, "kwargs": kwargs})


# 모킹된 클래스들을 모듈 레벨에서 사용할 수 있도록 export
Request = MockRequest
Response = MockResponse
HTTPException = MockHTTPException
Query = MockQuery
Path = MockPath
Depends = MockDepends
APIRouter = MockAPIRouter
FastAPI = MockFastAPI
status = MockStatus
BackgroundTasks = MockBackgroundTasks


# FastAPI 서브모듈들 모킹
class security:
    class HTTPBearer:
        def __init__(self, **kwargs):
            self.kwargs = kwargs

        def __call__(self, *args, **kwargs):
            return {"token": "mock_token"}


class middleware:
    class Middleware:
        def __init__(self, middleware_class, **kwargs):
            self.middleware_class = middleware_class
            self.kwargs = kwargs


# 추가적인 유틸리티들
def mock_dependency():
    """테스트용 의존성 함수"""
    return {"user_id": "test_user", "role": "admin"}


def create_mock_request(**kwargs) -> MockRequest:
    """모킹된 요청 객체 생성 헬퍼"""
    return MockRequest(**kwargs)


def create_mock_response(**kwargs) -> MockResponse:
    """모킹된 응답 객체 생성 헬퍼"""
    return MockResponse(**kwargs)
