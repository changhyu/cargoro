from typing import Dict, Any, Optional, TypeVar, Generic, List, Union
from pydantic import BaseModel
from fastapi import HTTPException, status

T = TypeVar("T")


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
        "validate_by_name": True,  # allow_population_by_field_name의 V2 대체
    }


class ApiResponse(BaseModel, Generic[T]):
    """표준 API 성공 응답 모델"""

    status: str = "success"
    message: Optional[str] = "요청이 성공적으로 처리되었습니다."
    data: T
    meta: Optional[ResponseMeta] = None


class ErrorResponse(BaseModel):
    """표준 API 오류 응답 모델"""

    status: str = "error"
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None


class ApiException(HTTPException):
    """표준 API 예외 클래스"""

    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
    ):
        error_response = ErrorResponse(code=code, message=message, details=details)
        # Pydantic v1 호환성을 위해 dict() 메서드 사용
        detail_dict = (
            error_response.dict()
            if hasattr(error_response, "dict")
            else error_response.__dict__
        )
        super().__init__(status_code=status_code, detail=detail_dict)


# 일반적인 오류 유형들
def not_found_exception(resource_type: str, resource_id: str) -> ApiException:
    """리소스를 찾을 수 없을 때 사용하는 예외"""
    return ApiException(
        status_code=status.HTTP_404_NOT_FOUND,
        code=f"{resource_type.upper()}_NOT_FOUND",
        message=f"{resource_type}를(을) 찾을 수 없습니다. (ID: {resource_id})",
    )


def permission_denied_exception(action: str = "접근") -> ApiException:
    """권한이 없을 때 사용하는 예외"""
    return ApiException(
        status_code=status.HTTP_403_FORBIDDEN,
        code="PERMISSION_DENIED",
        message=f"이 작업을 수행할 권한이 없습니다: {action}",
    )


def validation_exception(details: Dict[str, Any]) -> ApiException:
    """유효성 검사 실패 시 사용하는 예외"""
    return ApiException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        code="VALIDATION_ERROR",
        message="입력 데이터가 유효하지 않습니다.",
        details=details,
    )


def conflict_exception(resource_type: str, conflict_field: str) -> ApiException:
    """리소스 충돌 시 사용하는 예외"""
    return ApiException(
        status_code=status.HTTP_409_CONFLICT,
        code=f"{resource_type.upper()}_CONFLICT",
        message=f"이미 존재하는 {resource_type}입니다. (중복 필드: {conflict_field})",
    )


def server_error_exception(message: str = "서버 오류가 발생했습니다.") -> ApiException:
    """서버 오류 시 사용하는 예외"""
    return ApiException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        code="SERVER_ERROR",
        message=message,
    )


def unauthorized_exception(message: str = "인증이 필요합니다.") -> ApiException:
    """인증 실패 시 사용하는 예외"""
    return ApiException(
        status_code=status.HTTP_401_UNAUTHORIZED, code="UNAUTHORIZED", message=message
    )


def bad_request_exception(
    message: str = "잘못된 요청입니다.", details: Optional[Dict[str, Any]] = None
) -> ApiException:
    """잘못된 요청 시 사용하는 예외"""
    return ApiException(
        status_code=status.HTTP_400_BAD_REQUEST,
        code="BAD_REQUEST",
        message=message,
        details=details,
    )


# 응답 생성 헬퍼 함수
def create_response(
    data: T,
    message: Optional[str] = "요청이 성공적으로 처리되었습니다.",
    page: Optional[int] = None,
    per_page: Optional[int] = None,
    total_items: Optional[int] = None,
    total_pages: Optional[int] = None,
) -> ApiResponse[T]:
    """표준 응답 객체를 생성하는 헬퍼 함수"""
    meta = None
    if page is not None:
        meta = ResponseMeta(
            page=page,
            per_page=per_page,
            total_items=total_items,
            total_pages=total_pages,
        )
    return ApiResponse(data=data, meta=meta, message=message)
