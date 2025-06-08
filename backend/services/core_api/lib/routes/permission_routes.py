from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from ..dependencies import get_current_user, get_db, admin_required
from ..models import PermissionCreate, PermissionUpdate, PermissionResponse
from ..models import RolePermissionCreate, UserPermissionCreate
from prisma.models import User
from prisma.enums import UserRole
from ..utils.response_utils import (
    create_response,
    ApiResponse,
    validation_exception,
    not_found_exception,
    bad_request_exception,
)

router = APIRouter(tags=["권한"])


# 권한 관리 엔드포인트
@router.post("/api/permissions", response_model=ApiResponse)
async def create_permission(
    permission_data: PermissionCreate,
    current_user=Depends(admin_required),
    db=Depends(get_db),
):
    """
    새 권한을 생성합니다. 관리자 권한이 필요합니다.
    """
    # 권한 코드 중복 확인
    existing_permission = await db.permission.find_unique(
        where={"code": permission_data.code}
    )

    if existing_permission:
        raise validation_exception({"code": "이미 사용 중인 권한 코드입니다."})

    # 새 권한 생성
    permission = await db.permission.create(
        data={
            "code": permission_data.code,
            "name": permission_data.name,
            "description": permission_data.description,
        }
    )

    return create_response(data=PermissionResponse.from_orm(permission))


@router.get("/api/permissions", response_model=ApiResponse)
async def get_permissions(
    skip: int = 0,
    limit: int = 100,
    active: Optional[bool] = None,
    code_prefix: Optional[str] = None,
    db=Depends(get_db),
):
    """
    권한 목록을 조회합니다.
    """
    where = {}

    if active is not None:
        where["isActive"] = active

    if code_prefix:
        where["code"] = {"startswith": code_prefix}

    # 전체 개수 조회
    total_items = await db.permission.count(where=where)
    total_pages = (total_items + limit - 1) // limit if limit > 0 else 1

    permissions = await db.permission.find_many(where=where, skip=skip, take=limit)

    return create_response(
        data=[PermissionResponse.from_orm(p) for p in permissions],
        page=skip // limit + 1,
        per_page=limit,
        total_items=total_items,
        total_pages=total_pages,
    )


@router.get("/api/permissions/{permission_id}", response_model=ApiResponse)
async def get_permission(permission_id: str, db=Depends(get_db)):
    """
    특정 권한의 정보를 조회합니다.
    """
    permission = await db.permission.find_unique(where={"id": permission_id})

    if not permission:
        raise not_found_exception("권한", permission_id)

    return create_response(data=PermissionResponse.from_orm(permission))


@router.put("/api/permissions/{permission_id}", response_model=PermissionResponse)
async def update_permission(
    permission_id: str,
    permission_data: PermissionUpdate,
    current_user=Depends(admin_required),
    db=Depends(get_db),
):
    """
    권한 정보를 업데이트합니다. 관리자 권한이 필요합니다.
    """
    # 권한 존재 확인
    existing_permission = await db.permission.find_unique(where={"id": permission_id})

    if not existing_permission:
        raise not_found_exception("권한", permission_id)

    # 업데이트할 데이터 준비
    update_data = permission_data.model_dump(exclude_unset=True)

    # 코드 변경 시 중복 확인
    if "code" in update_data and update_data["code"] != existing_permission.code:
        code_exists = await db.permission.find_unique(
            where={"code": update_data["code"]}
        )

        if code_exists:
            raise bad_request_exception(
                "이미 사용 중인 권한 코드입니다.", "PERMISSION_CODE_ALREADY_EXISTS"
            )

    # 권한 업데이트
    updated_permission = await db.permission.update(
        where={"id": permission_id}, data=update_data
    )

    return PermissionResponse.from_orm(updated_permission)


@router.delete(
    "/api/permissions/{permission_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_permission(
    permission_id: str, current_user=Depends(admin_required), db=Depends(get_db)
):
    """
    권한을 삭제합니다. 관리자 권한이 필요합니다.
    """
    # 권한 존재 확인
    permission = await db.permission.find_unique(where={"id": permission_id})

    if not permission:
        raise not_found_exception("권한", permission_id)

    # 물리적 삭제 대신 비활성화
    await db.permission.update(where={"id": permission_id}, data={"isActive": False})

    return None


# 역할-권한 관계 관리
@router.post("/api/role-permissions")
async def assign_permission_to_role(
    role_permission: RolePermissionCreate,
    current_user=Depends(admin_required),
    db=Depends(get_db),
):
    """
    역할에 권한을 할당합니다. 관리자 권한이 필요합니다.
    """
    # 권한 존재 확인
    permission = await db.permission.find_unique(
        where={"id": role_permission.permission_id}
    )

    if not permission:
        raise not_found_exception("권한", role_permission.permission_id)

    # 역할에 권한 할당
    try:
        role_perm = await db.rolePermission.create(
            data={
                "role": role_permission.role,
                "permissionId": role_permission.permission_id,
            }
        )

        return {
            "id": role_perm.id,
            "role": role_perm.role,
            "permissionId": role_perm.permissionId,
        }
    except Exception as e:
        if "Unique constraint" in str(e):
            raise bad_request_exception(
                "해당 역할에 이미 할당된 권한입니다.",
                "PERMISSION_ALREADY_ASSIGNED_TO_ROLE",
            )
        raise


@router.delete(
    "/api/role-permissions/{role}/{permission_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def remove_permission_from_role(
    role: UserRole,
    permission_id: str,
    current_user=Depends(admin_required),
    db=Depends(get_db),
):
    """
    역할에서 권한을 제거합니다. 관리자 권한이 필요합니다.
    """
    # 역할-권한 관계 확인
    role_permission = await db.rolePermission.find_first(
        where={"role": role, "permissionId": permission_id}
    )

    if not role_permission:
        raise not_found_exception(
            "역할-권한 관계", f"role: {role}, permission_id: {permission_id}"
        )

    # 역할에서 권한 제거
    await db.rolePermission.delete(where={"id": role_permission.id})

    return None


# 사용자-권한 관계 관리
@router.post("/api/user-permissions")
async def assign_permission_to_user(
    user_permission: UserPermissionCreate,
    current_user=Depends(admin_required),
    db=Depends(get_db),
):
    """
    사용자에게 특정 권한을 할당합니다. 관리자 권한이 필요합니다.
    """
    # 사용자 존재 확인
    user = await db.user.find_unique(where={"id": user_permission.user_id})

    if not user:
        raise not_found_exception("사용자", user_permission.user_id)

    # 권한 존재 확인
    permission = await db.permission.find_unique(
        where={"id": user_permission.permission_id}
    )

    if not permission:
        raise not_found_exception("권한", user_permission.permission_id)

    # 사용자에게 권한 할당 (이미 존재하면 업데이트)
    existing = await db.userPermission.find_first(
        where={
            "userId": user_permission.user_id,
            "permissionId": user_permission.permission_id,
        }
    )

    if existing:
        user_perm = await db.userPermission.update(
            where={"id": existing.id}, data={"granted": user_permission.granted}
        )
    else:
        user_perm = await db.userPermission.create(
            data={
                "userId": user_permission.user_id,
                "permissionId": user_permission.permission_id,
                "granted": user_permission.granted,
            }
        )

    return {
        "id": user_perm.id,
        "userId": user_perm.userId,
        "permissionId": user_perm.permissionId,
        "granted": user_perm.granted,
    }


@router.delete(
    "/api/user-permissions/{user_id}/{permission_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def remove_permission_from_user(
    user_id: str,
    permission_id: str,
    current_user=Depends(admin_required),
    db=Depends(get_db),
):
    """
    사용자에게서 특정 권한을 제거합니다. 관리자 권한이 필요합니다.
    """
    # 사용자-권한 관계 확인
    user_permission = await db.userPermission.find_first(
        where={"userId": user_id, "permissionId": permission_id}
    )

    if not user_permission:
        raise not_found_exception(
            "사용자-권한 관계", f"user_id: {user_id}, permission_id: {permission_id}"
        )

    # 사용자에게서 권한 제거
    await db.userPermission.delete(where={"id": user_permission.id})

    return None
