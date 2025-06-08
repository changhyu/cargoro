from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from typing import List, Optional
from pydantic import BaseModel
from ..dependencies import (
    get_current_user,
    get_db,
    has_permission,
    has_organization_admin,
)
from ..models import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationResponse,
    OrganizationMemberResponse,
)
from prisma.models import Organization, OrganizationMember, User
from ..utils.response_utils import (
    ApiResponse,
    create_response,
    permission_denied_exception,
    conflict_exception,
)

router = APIRouter(prefix="/api/organizations", tags=["조직"])


@router.get("/", response_model=ApiResponse)
async def get_organizations(
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(10, ge=1, le=100, description="페이지당 조직 수"),
    search: Optional[str] = Query(None, description="검색어 (조직명, 주소 등)"),
    type: Optional[str] = Query(
        None, description="조직 유형 (WORKSHOP, FLEET, PARTS 등)"
    ),
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    """
    조직 목록을 조회합니다.

    시스템에 등록된 모든 조직(정비소, 법인 등) 목록을 조회합니다.
    """
    # 권한 확인 - 슈퍼어드민이 아니면 자신이 속한 조직만 볼 수 있음
    is_admin = await has_permission(current_user.id, "org:sys_domains:read")

    # 쿼리 필터 구성
    where = {}
    if search:
        where["OR"] = [
            {"name": {"contains": search}},
            {"description": {"contains": search}},
        ]
    if type:
        where["type"] = type

    # 슈퍼어드민이 아니면 자신이 멤버인 조직만 조회
    if not is_admin:
        user_organizations = await db.organizationmember.find_many(
            where={"userId": current_user.id, "status": "active"},
            select={"organizationId": True},
        )
        org_ids = [org["organizationId"] for org in user_organizations]
        where["id"] = {"in": org_ids}

    # 전체 개수 조회
    total_items = await db.organization.count(where=where)
    total_pages = (total_items + limit - 1) // limit

    # 조직 목록 조회
    organizations = await db.organization.find_many(
        where=where, skip=(page - 1) * limit, take=limit, order={"name": "asc"}
    )

    # 응답 데이터 구성
    organization_list = [OrganizationResponse.from_orm(org) for org in organizations]

    return create_response(
        data=organization_list,
        page=page,
        per_page=limit,
        total_items=total_items,
        total_pages=total_pages,
    )


@router.post("/", response_model=ApiResponse)
async def create_organization(
    org_data: OrganizationCreate,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    """
    새 조직을 생성합니다.

    새로운 조직(정비소, 법인 등)을 시스템에 등록합니다.
    """
    # 슈퍼어드민 권한 확인
    has_admin = await has_permission(current_user.id, "org:sys_domains:manage")
    if not has_admin:
        raise permission_denied_exception("조직 생성")

    # 슬러그 중복 확인
    existing_org = await db.organization.find_unique(where={"slug": org_data.slug})
    if existing_org:
        raise conflict_exception("조직", "slug")

    # 새 조직 생성
    new_org = await db.organization.create(
        data={
            "name": org_data.name,
            "slug": org_data.slug,
            "description": org_data.description,
            "Logo": org_data.Logo,
            "type": org_data.type,
            "tier": org_data.tier or "free",
        }
    )

    # 생성자를 조직 관리자로 추가
    await db.organizationmember.create(
        data={
            "userId": current_user.id,
            "organizationId": new_org.id,
            "isOwner": True,
            "isAdmin": True,
            "status": "active",
        }
    )

    return create_response(data=OrganizationResponse.from_orm(new_org))


# 이 외에도 조직 수정, 삭제, 멤버 관리 등의 API 추가
