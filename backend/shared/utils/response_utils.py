"""
공통 API 응답 유틸리티

이 모듈은 마이크로서비스 전체에서 일관된 API 응답 형식을 유지하기 위한
공통 응답 클래스, 예외 처리 및 응답 생성 유틸리티를 제공합니다.
"""

from typing import Dict, Any, Optional, Union, List
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ValidationError


class ApiException(Exception):
    """API 호출 중 발생하는 예외를 표현하는 클래스

    이 예외는 HTTP 상태 코드, 오류 메시지, 오류 코드 및 추가 상세 정보를 포함합니다.
    """

    def __init__(
        self,
        message: str,
        status_code: int = 400,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        """
        Args:
            message: 오류 메시지
            status_code: HTTP 상태 코드
            error_code: 오류 코드
            details: 추가 상세 정보
        """
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details or {}


class ResponseMeta(BaseModel):
    """API 응답의 메타데이터 모델"""

    page: Optional[int] = None
    per_page: Optional[int] = None
    total_items: Optional[int] = None
    total_pages: Optional[int] = None

    model_config = {
        # API 응답은 camelCase로 직렬화
        "alias_generator": lambda string: "".join(
            word if i == 0 else word.capitalize()
            for i, word in enumerate(string.split("_"))
        ),
        "validate_by_name": True,
    }


class ErrorResponse(BaseModel):
    """API 오류 응답을 표현하는 Pydantic 모델"""

    success: bool = False
    message: str
    error_code: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

    def to_dict(self):
        """Pydantic v1/v2 호환 메소드

        Pydantic v1은 dict()를, v2는 model_dump()를 사용합니다.
        현재 프로젝트는 Pydantic v1.10.12를 사용하고 있습니다.
        """
        return self.dict()


class ApiResponse(BaseModel):
    """API 성공 응답을 표현하는 Pydantic 모델"""

    success: bool = True
    data: Optional[Any] = None
    message: Optional[str] = None
    meta: Optional[ResponseMeta] = None

    def to_dict(self):
        """Pydantic v1/v2 호환 메소드

        Pydantic v1은 dict()를, v2는 model_dump()를 사용합니다.
        현재 프로젝트는 Pydantic v1.10.12를 사용하고 있습니다.
        """
        return self.dict()


def create_response(
    data: Optional[Any] = None,
    message: str = "Success",
    status_code: int = 200,
) -> JSONResponse:
    """성공 응답 생성

    Args:
        data: 응답 데이터
        message: 응답 메시지
        status_code: HTTP 상태 코드

    Returns:
        JSONResponse: FastAPI JSONResponse 객체
    """
    response = ApiResponse(data=data, message=message)
    return JSONResponse(
        content=response.dict(),
        status_code=status_code,
    )


def create_error_response(
    message: str,
    status_code: int = 400,
    error_code: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
) -> JSONResponse:
    """오류 응답 생성

    Args:
        message: 오류 메시지
        status_code: HTTP 상태 코드
        error_code: 오류 코드
        details: 오류 상세 정보

    Returns:
        JSONResponse: FastAPI JSONResponse 객체
    """
    response = ErrorResponse(
        message=message,
        error_code=error_code,
        details=details,
    )
    return JSONResponse(
        content=response.dict(),
        status_code=status_code,
    )


def create_validation_error_response(
    error: ValidationError,
    status_code: int = 422,
) -> JSONResponse:
    """Pydantic ValidationError에 대한 응답 생성

    Args:
        error: Pydantic ValidationError 객체
        status_code: HTTP 상태 코드 (기본값: 422 Unprocessable Entity)

    Returns:
        JSONResponse: FastAPI JSONResponse 객체
    """
    error_details = [
        {
            "loc": err.get("loc", []),
            "msg": err.get("msg", ""),
            "type": err.get("type", ""),
        }
        for err in error.errors()
    ]

    response = ErrorResponse(
        message="Validation error",
        error_code="VALIDATION_ERROR",
        details={"errors": error_details},
    )

    return JSONResponse(
        content=response.dict(),
        status_code=status_code,
    )


def not_found_exception(
    resource: str, resource_id: Optional[str] = None
) -> ApiException:
    """리소스를 찾을 수 없을 때 사용하는 예외 생성 유틸리티

    Args:
        resource: 찾을 수 없는 리소스 이름
        resource_id: 리소스 ID (선택 사항)

    Returns:
        ApiException: 404 Not Found 예외
    """
    if resource_id:
        message = f"{resource} not found (ID: {resource_id})"
    else:
        message = f"{resource} not found"

    return ApiException(
        message=message,
        status_code=404,
        error_code="NOT_FOUND",
    )


def permission_denied_exception(message: str = "Permission denied") -> ApiException:
    """권한 없음 예외 생성 유틸리티

    Args:
        message: 권한 오류 메시지

    Returns:
        ApiException: 403 Forbidden 예외
    """
    return ApiException(
        message=message,
        status_code=403,
        error_code="PERMISSION_DENIED",
    )


def validation_exception(
    message: str, details: Optional[Dict[str, Any]] = None
) -> ApiException:
    """유효성 검사 실패 예외 생성 유틸리티

    Args:
        message: 유효성 검사 오류 메시지
        details: 필드별 오류 상세 정보

    Returns:
        ApiException: 400 Bad Request 예외
    """
    return ApiException(
        message=message,
        status_code=400,
        error_code="VALIDATION_ERROR",
        details=details or {},
    )


def conflict_exception(message: str) -> ApiException:
    """충돌 예외 생성 유틸리티 (이미 존재하는 리소스 등)

    Args:
        message: 충돌 오류 메시지

    Returns:
        ApiException: 409 Conflict 예외
    """
    return ApiException(
        message=message,
        status_code=409,
        error_code="CONFLICT",
    )


def server_error_exception(message: str = "Internal server error") -> ApiException:
    """서버 내부 오류 예외 생성 유틸리티

    Args:
        message: 서버 오류 메시지

    Returns:
        ApiException: 500 Internal Server Error 예외
    """
    return ApiException(
        message=message,
        status_code=500,
        error_code="INTERNAL_SERVER_ERROR",
    )


def success_response(
    message: str = "요청이 성공적으로 처리되었습니다",
    data: Optional[Any] = None,
    meta: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """표준 성공 응답 생성

    Args:
        message: 성공 메시지
        data: 응답 데이터
        meta: 메타데이터 (페이지네이션 등)

    Returns:
        Dict: 표준 응답 형식의 딕셔너리
    """
    response = {
        "success": True,
        "message": message,
        "data": data,
        "error_code": None,
        "details": None
    }
    
    if meta:
        response["meta"] = meta
    
    return response


def error_response(
    message: str = "요청 처리 중 오류가 발생했습니다",
    error_code: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    status_code: int = 400
) -> Dict[str, Any]:
    """표준 오류 응답 생성

    Args:
        message: 오류 메시지
        error_code: 오류 코드
        details: 오류 상세 정보
        status_code: HTTP 상태 코드

    Returns:
        Dict: 표준 오류 형식의 딕셔너리
    """
    return {
        "success": False,
        "message": message,
        "data": None,
        "error_code": error_code or "ERROR",
        "details": details
    }
