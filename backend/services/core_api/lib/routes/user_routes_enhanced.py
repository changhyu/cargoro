from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from pydantic import BaseModel
from ..dependencies import get_current_user, get_db, has_permission
from ..models import UserCreate, UserUpdate, UserResponse, UserWithPermissions
from prisma.models import User
from prisma.enums import UserRole
from ..utils.response_utils import ApiResponse, ErrorResponse, permission_denied_exception, not_found_exception, create_response

router = APIRouter(prefix="/api/users", tags=["사용자"])

@router.get("/", response_model=ApiResponse)
async def get_users(
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(10, ge=1, le=100, description="페이지당 항목 수"),
    search: Optional[str] = Query(None, description="검색어(이름, 이메일 등)"),
    role: Optional[str] = Query(None, description="역할 필터"),
    active: Optional[bool] = Query(None, description="활성 상태 필터"),
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    사용자 목록을 조회합니다.

    시스템에 등록된 사용자 목록을 조회합니다. 관리자 권한이 필요합니다.
    """
    # 권한 확인
    has_admin = await has_permission(current_user.id, "org:admin_users:manage")
    if not has_admin:
        raise permission_denied_exception("사용자 관리")

    # 쿼리 필터 구성
    where = {}
    if search:
        where["OR"] = [
            {"email": {"contains": search}},
            {"first_name": {"contains": search}},
            {"last_name": {"contains": search}},
            {"phone_number": {"contains": search}}
        ]
    if active is not None:
        where["active"] = active

    # 전체 개수 조회
    total_items = await db.user.count(where=where)
    total_pages = (total_items + limit - 1) // limit

    # 사용자 목록 조회
    users = await db.user.find_many(
        where=where,
        skip=(page - 1) * limit,
        take=limit,
        order={"created_at": "desc"},
        include={
            "permissions": True,
            "memberships": {
                "include": {
                    "role": True,
                    "organization": True
                }
            }
        }
    )

    # 응답 데이터 구성
    user_list = [UserWithPermissions.from_orm(user) for user in users]

    return create_response(
        data=user_list,
        page=page,
        per_page=limit,
        total_items=total_items,
        total_pages=total_pages
    )

@router.get("/{user_id}", response_model=ApiResponse)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    특정 사용자 정보를 조회합니다.

    사용자 ID를 기준으로 상세 정보를 조회합니다.
    """
    # 자신의 정보 또는 관리자 권한 확인
    is_self = current_user.id == user_id
    has_admin = await has_permission(current_user.id, "org:admin_users:manage")

    if not (is_self or has_admin):
        raise permission_denied_exception("사용자 정보 접근")

    # 사용자 조회
    user = await db.user.find_unique(
        where={"id": user_id},
        include={
            "permissions": True,
            "memberships": {
                "include": {
                    "role": True,
                    "organization": True
                }
            }
        }
    )

    if not user:
        raise not_found_exception("사용자", user_id)

    return create_response(data=UserWithPermissions.from_orm(user))

@router.put("/{user_id}", response_model=ApiResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    사용자 정보를 업데이트합니다.

    자신의 정보 또는 관리자 권한이 필요합니다.
    """
    # 권한 확인 (자신의 계정이거나 관리자만 수정 가능)
    has_admin = await has_permission(current_user.id, "org:admin_users:manage")
    if current_user.id != user_id and not has_admin:
        raise permission_denied_exception("사용자 정보 수정")

    # 사용자 존재 확인
    existing_user = await db.user.find_unique(
        where={"id": user_id}
    )
    if not existing_user:
        raise not_found_exception("사용자")

    # 업데이트할 데이터 준비
    update_data = user_data.model_dump(exclude_unset=True)

    # 관리자만 역할 변경 가능
    if "role" in update_data and not has_admin:
        raise permission_denied_exception("역할 변경")

    try:
        # 사용자 업데이트
        updated_user = await db.user.update(
            where={"id": user_id},
            data=update_data
        )

        return create_response(
            success=True,
            message="사용자 정보가 성공적으로 업데이트되었습니다.",
            data=UserResponse.model_validate(updated_user)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"사용자 업데이트 중 오류가 발생했습니다: {str(e)}"
        )

@router.delete("/{user_id}", response_model=ApiResponse)
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    사용자를 삭제합니다.

    관리자 권한이 필요합니다.
    """
    # 관리자 권한 확인
    has_admin = await has_permission(current_user.id, "org:admin_users:manage")
    if not has_admin:
        raise permission_denied_exception("사용자 삭제")

    # 사용자 존재 확인
    existing_user = await db.user.find_unique(
        where={"id": user_id}
    )
    if not existing_user:
        raise not_found_exception("사용자")

    try:
        # 물리적 삭제 대신 비활성화
        await db.user.update(
            where={"id": user_id},
            data={"isActive": False}
        )

        return create_response(
            success=True,
            message="사용자가 성공적으로 삭제되었습니다.",
            data=None
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"사용자 삭제 중 오류가 발생했습니다: {str(e)}"
        )

# Helper functions for tests
async def get_user_count(db = Depends(get_db)) -> int:
    """사용자 수를 반환합니다."""
    return await db.user.count()

async def check_user_exists(user_id: str, db = Depends(get_db)) -> bool:
    """사용자 존재 여부를 확인합니다."""
    user = await db.user.find_unique(where={"id": user_id})
    return user is not None

async def get_user_by_email(email: str, db = Depends(get_db)) -> Optional[User]:
    """이메일로 사용자를 조회합니다."""
    return await db.user.find_unique(where={"email": email})
