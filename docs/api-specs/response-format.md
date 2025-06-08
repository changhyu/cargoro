# API 응답 형식 표준화 가이드라인

이 문서는 CarGoro 프로젝트의 일관된 API 응답 형식을 위한 가이드라인을 제공합니다.

## 기본 응답 형식

모든 API는 다음과 같은 일관된 응답 형식을 준수해야 합니다:

### 성공 응답

```json
{
  "data": { ... },  // 실제 응답 데이터
  "meta": { ... }   // 페이지네이션, 필터링 등 메타데이터 (선택적)
}
```

### 오류 응답

```json
{
  "code": "ERROR_CODE",           // 에러 코드 (문자열)
  "message": "사용자 메시지",      // 사용자에게 표시할 메시지
  "details": { ... }              // 상세 에러 정보 (선택적)
}
```

## 표준 예외 유형

모든 백엔드 서비스에서는 다음과 같은 표준 예외 유형을 사용해야 합니다:

### 1. 리소스를 찾을 수 없음 (not_found_exception)

```python
def not_found_exception(resource_type: str, resource_id: str) -> ApiException:
    """리소스를 찾을 수 없을 때 사용하는 예외"""
    return ApiException(
        status_code=status.HTTP_404_NOT_FOUND,
        code=f"{resource_type.upper()}_NOT_FOUND",
        message=f"{resource_type}를(을) 찾을 수 없습니다. (ID: {resource_id})"
    )
```

### 2. 권한 없음 (permission_denied_exception)

```python
def permission_denied_exception(action: str = "접근") -> ApiException:
    """권한이 없을 때 사용하는 예외"""
    return ApiException(
        status_code=status.HTTP_403_FORBIDDEN,
        code="PERMISSION_DENIED",
        message=f"이 작업을 수행할 권한이 없습니다: {action}"
    )
```

### 3. 유효성 검사 실패 (validation_exception)

```python
def validation_exception(details: Dict[str, Any]) -> ApiException:
    """유효성 검사 실패 시 사용하는 예외"""
    return ApiException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        code="VALIDATION_ERROR",
        message="입력 데이터가 유효하지 않습니다.",
        details=details
    )
```

### 4. 충돌 (conflict_exception)

```python
def conflict_exception(resource_type: str, conflict_field: str) -> ApiException:
    """리소스 충돌 시 사용하는 예외"""
    return ApiException(
        status_code=status.HTTP_409_CONFLICT,
        code=f"{resource_type.upper()}_CONFLICT",
        message=f"이미 존재하는 {resource_type}입니다. (중복 필드: {conflict_field})"
    )
```

### 5. 서버 오류 (server_error_exception)

```python
def server_error_exception(message: str = "서버 오류가 발생했습니다.") -> ApiException:
    """서버 오류 시 사용하는 예외"""
    return ApiException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        code="SERVER_ERROR",
        message=message
    )
```

### 6. 인증 실패 (unauthorized_exception)

```python
def unauthorized_exception(message: str = "인증이 필요합니다.") -> ApiException:
    """인증 실패 시 사용하는 예외"""
    return ApiException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        code="UNAUTHORIZED",
        message=message
    )
```

## 사용 예시

### 기본 엔드포인트 구현

```python
@router.get("/{resource_id}", response_model=ApiResponse[ResourceResponse])
async def get_resource(
    resource_id: str = Path(..., description="조회할 리소스의 ID"),
    prisma: Prisma = Depends()
):
    try:
        resource = await prisma.resource.find_unique(
            where={"id": resource_id}
        )

        if not resource:
            raise not_found_exception("리소스", resource_id)

        return create_response(data=ResourceResponse.from_orm(resource))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"리소스 조회 실패: {str(e)}")
        raise server_error_exception(f"리소스 조회 중 오류가 발생했습니다: {str(e)}")
```

### 페이지네이션이 있는 엔드포인트 구현

```python
@router.get("/", response_model=ApiResponse[List[ResourceResponse]])
async def get_all_resources(
    filter_param: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    prisma: Prisma = Depends()
):
    try:
        # 필터 조건 구성
        where = {}
        if filter_param:
            where["field"] = filter_param

        # 총 개수 조회
        total_items = await prisma.resource.count(where=where)
        total_pages = (total_items + limit - 1) // limit if limit > 0 else 0

        # 데이터 조회
        resources = await prisma.resource.find_many(
            where=where,
            skip=skip,
            take=limit,
            order={"created_at": "desc"}
        )

        # 응답 객체로 변환
        resource_responses = [ResourceResponse.from_orm(resource) for resource in resources]

        return create_response(
            data=resource_responses,
            page=skip // limit + 1,
            per_page=limit,
            total_items=total_items,
            total_pages=total_pages
        )
    except Exception as e:
        logger.error(f"리소스 조회 실패: {str(e)}")
        raise server_error_exception(f"리소스 조회 중 오류가 발생했습니다: {str(e)}")
```

### 예외 처리 예시

```python
# 유효성 검사 예외
if start_date > end_date:
    raise validation_exception({
        "date": "시작일은 종료일보다 이전이어야 합니다."
    })

# 리소스를 찾을 수 없음
if not resource:
    raise not_found_exception("리소스", resource_id)

# 리소스 충돌
if existing_resource:
    raise conflict_exception("리소스", "name")

# 권한 없음
if not has_permission:
    raise permission_denied_exception("리소스 수정")
```

## 클라이언트 응답 처리

### TypeScript에서의 사용 예시

```typescript
// 응답 타입 정의
interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    perPage?: number;
    totalItems?: number;
    totalPages?: number;
  };
}

interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// API 호출 함수
async function fetchResource<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new ApiError(response.status, errorData.code, errorData.message, errorData.details);
    }

    const responseData: ApiResponse<T> = await response.json();
    return responseData.data;
  } catch (error) {
    // 에러 처리
    if (error instanceof ApiError) {
      // 구체적인 API 에러 처리
    }
    throw error;
  }
}

// 사용자 정의 API 에러 클래스
class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

## 결론

이 표준화된 API 응답 형식은 프론트엔드와 백엔드 간의 일관된 통신을 보장하고, 클라이언트 측에서 보다 쉽게 응답을 처리할 수 있도록 합니다. 모든 백엔드 서비스는 이 가이드라인을 준수하여 일관된 사용자 경험을 제공해야 합니다.

- **200 OK**: 요청 성공
- **201 Created**: 리소스 생성 성공
- **204 No Content**: 성공적인 요청이지만 반환할 내용 없음
- **400 Bad Request**: 잘못된 요청
- **401 Unauthorized**: 인증 필요
- **403 Forbidden**: 권한 없음
- **404 Not Found**: 리소스 없음
- **409 Conflict**: 충돌 (예: 중복된 데이터)
- **422 Unprocessable Entity**: 유효성 검사 실패
- **500 Internal Server Error**: 서버 오류

## 페이지네이션

페이지네이션이 필요한 API는 다음 형식을 따릅니다:

```json
{
  "data": [ ... ],  // 항목 배열
  "meta": {
    "page": 1,           // 현재 페이지
    "perPage": 20,       // 페이지당 항목 수
    "totalItems": 100,   // 전체 항목 수
    "totalPages": 5      // 전체 페이지 수
  }
}
```

## 에러 코드 체계

에러 코드는 다음 형식을 따릅니다: `{도메인}_{유형}_{설명}`

예시:

- `AUTH_INVALID_CREDENTIALS`: 인증 도메인의 잘못된 자격 증명 오류
- `USER_NOT_FOUND`: 사용자 도메인의 찾을 수 없음 오류
- `REPAIR_INVALID_STATUS`: 정비 도메인의 잘못된 상태 오류

## FastAPI 구현 예시

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List, Generic, TypeVar

T = TypeVar('T')

class ResponseMeta(BaseModel):
    page: Optional[int] = None
    perPage: Optional[int] = None
    totalItems: Optional[int] = None
    totalPages: Optional[int] = None

class ApiResponse(BaseModel, Generic[T]):
    data: T
    meta: Optional[ResponseMeta] = None

class ErrorResponse(BaseModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None

# 사용 예시
@app.get("/users/{user_id}", response_model=ApiResponse[UserModel])
async def get_user(user_id: str):
    user = await user_service.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail=ErrorResponse(
                code="USER_NOT_FOUND",
                message="사용자를 찾을 수 없습니다."
            ).dict()
        )

    return ApiResponse(data=user)
```

## TypeScript 클라이언트 예시

```typescript
interface ResponseMeta {
  page?: number;
  perPage?: number;
  totalItems?: number;
  totalPages?: number;
}

interface ApiResponse<T> {
  data: T;
  meta?: ResponseMeta;
}

interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// 사용 예시
async function getUser(userId: string): Promise<ApiResponse<User>> {
  try {
    const response = await axios.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    const errorResponse = error.response?.data as ErrorResponse;
    throw new ApiError(errorResponse.code, errorResponse.message, errorResponse.details);
  }
}
```

## 참고 사항

- 모든 API 응답은 이 형식을 준수해야 합니다.
- 오류 메시지는 사용자 친화적이어야 합니다.
- 보안상 민감한 정보는 오류 메시지에 포함하지 않습니다.
- 프론트엔드에서는 `ApiResponse` 및 `ErrorResponse` 타입을 사용하여 타입 안전성을 확보합니다.
