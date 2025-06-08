"""
정비소 관리 API 라우터
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field
from prisma import Prisma

from shared.utils.response_utils import success_response, ApiException
from shared.utils.logging_utils import get_logger

logger = get_logger(__name__)
prisma = Prisma()

router = APIRouter(prefix="/workshops", tags=["정비소"])

# Pydantic 모델들
class WorkshopCreate(BaseModel):
    """정비소 생성 모델"""
    name: str
    address: str
    phone: str
    business_number: str
    description: Optional[str] = None
    specialties: List[str] = Field(default_factory=list)
    operating_hours: dict = Field(default_factory=dict)
    capacity: int = Field(default=10, ge=1)
    
class WorkshopUpdate(BaseModel):
    """정비소 수정 모델"""
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    specialties: Optional[List[str]] = None
    operating_hours: Optional[dict] = None
    capacity: Optional[int] = Field(None, ge=1)
    is_active: Optional[bool] = None

# 의존성 함수들
async def get_current_user_id() -> str:
    """현재 사용자 ID 가져오기 (임시)"""
    # TODO: 실제 인증 미들웨어 연동
    return "test-user-id"

async def verify_workshop_owner(workshop_id: str, user_id: str):
    """정비소 소유자 확인"""
    workshop = await prisma.workshop.find_unique(
        where={"id": workshop_id}
    )
    
    if not workshop:
        raise ApiException(
            message="정비소를 찾을 수 없습니다",
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="WORKSHOP_NOT_FOUND"
        )
    
    if workshop.owner_id != user_id:
        raise ApiException(
            message="정비소 관리 권한이 없습니다",
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="PERMISSION_DENIED"
        )
    
    return workshop

# API 엔드포인트들
@router.post("/")
async def create_workshop(
    workshop_data: WorkshopCreate,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    새로운 정비소 등록
    """
    try:
        # 사업자 번호 중복 확인
        existing = await prisma.workshop.find_first(
            where={"business_number": workshop_data.business_number}
        )
        
        if existing:
            raise ApiException(
                message="이미 등록된 사업자 번호입니다",
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code="DUPLICATE_BUSINESS_NUMBER"
            )
        
        # 정비소 생성
        workshop = await prisma.workshop.create(
            data={
                "name": workshop_data.name,
                "address": workshop_data.address,
                "phone": workshop_data.phone,
                "business_number": workshop_data.business_number,
                "description": workshop_data.description,
                "specialties": workshop_data.specialties,
                "operating_hours": workshop_data.operating_hours,
                "capacity": workshop_data.capacity,
                "owner_id": current_user_id,
                "is_active": True,
                "rating": 0.0,
                "review_count": 0,
                "completed_repairs": 0
            },
            include={
                "owner": True,
                "staff": True
            }
        )
        
        # 사용자 역할 업데이트
        await prisma.user.update(
            where={"id": current_user_id},
            data={"role": "WORKSHOP_OWNER"}
        )
        
        logger.info(f"정비소 등록 완료: {workshop.name}")
        
        return success_response(
            message="정비소가 등록되었습니다",
            data=workshop
        )
        
    except ApiException:
        raise
    except Exception as e:
        logger.error(f"정비소 등록 중 오류 발생: {str(e)}")
        raise ApiException(
            message="정비소 등록 중 오류가 발생했습니다",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="CREATE_WORKSHOP_ERROR"
        )

@router.get("/")
async def search_workshops(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    keyword: Optional[str] = None,
    specialty: Optional[str] = None,
    min_rating: Optional[float] = Query(None, ge=0, le=5)
):
    """
    정비소 검색 및 목록 조회
    """
    try:
        # 필터 조건 구성
        where_conditions = {"is_active": True}
        
        if keyword:
            where_conditions["OR"] = [
                {"name": {"contains": keyword, "mode": "insensitive"}},
                {"description": {"contains": keyword, "mode": "insensitive"}},
                {"address": {"contains": keyword, "mode": "insensitive"}}
            ]
        
        if specialty:
            where_conditions["specialties"] = {"has": specialty}
        
        if min_rating is not None:
            where_conditions["rating"] = {"gte": min_rating}
        
        # 전체 카운트
        total_count = await prisma.workshop.count(where=where_conditions)
        
        # 정비소 목록 조회
        workshops = await prisma.workshop.find_many(
            where=where_conditions,
            skip=(page - 1) * page_size,
            take=page_size,
            include={
                "owner": True,
                "_count": {
                    "select": {
                        "reviews": True,
                        "repair_requests": {"where": {"status": "COMPLETED"}}
                    }
                }
            },
            order_by={"rating": "desc"}
        )
        
        return success_response(
            message="정비소 목록을 조회했습니다",
            data={
                "items": workshops,
                "total": total_count,
                "page": page,
                "page_size": page_size,
                "total_pages": (total_count + page_size - 1) // page_size
            }
        )
        
    except Exception as e:
        logger.error(f"정비소 검색 중 오류 발생: {str(e)}")
        raise ApiException(
            message="정비소 검색 중 오류가 발생했습니다",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="SEARCH_WORKSHOP_ERROR"
        )

@router.get("/{workshop_id}")
async def get_workshop(workshop_id: str):
    """
    특정 정비소 상세 정보 조회
    """
    try:
        workshop = await prisma.workshop.find_unique(
            where={"id": workshop_id},
            include={
                "owner": True,
                "staff": {
                    "include": {"user": True}
                },
                "reviews": {
                    "take": 10,
                    "order_by": {"created_at": "desc"},
                    "include": {"customer": True}
                }
            }
        )
        
        if not workshop:
            raise ApiException(
                message="정비소를 찾을 수 없습니다",
                status_code=status.HTTP_404_NOT_FOUND,
                error_code="WORKSHOP_NOT_FOUND"
            )
        
        return success_response(
            message="정비소 정보를 조회했습니다",
            data=workshop
        )
        
    except ApiException:
        raise
    except Exception as e:
        logger.error(f"정비소 조회 중 오류 발생: {str(e)}")
        raise ApiException(
            message="정비소 조회 중 오류가 발생했습니다",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="GET_WORKSHOP_ERROR"
        )

@router.put("/{workshop_id}")
async def update_workshop(
    workshop_id: str,
    update_data: WorkshopUpdate,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    정비소 정보 수정
    """
    try:
        # 소유자 확인
        await verify_workshop_owner(workshop_id, current_user_id)
        
        # 업데이트 데이터 준비
        update_dict = update_data.dict(exclude_unset=True)
        
        # 정비소 업데이트
        updated_workshop = await prisma.workshop.update(
            where={"id": workshop_id},
            data=update_dict,
            include={
                "owner": True,
                "staff": True
            }
        )
        
        logger.info(f"정비소 정보 수정 완료: {updated_workshop.name}")
        
        return success_response(
            message="정비소 정보가 수정되었습니다",
            data=updated_workshop
        )
        
    except ApiException:
        raise
    except Exception as e:
        logger.error(f"정비소 수정 중 오류 발생: {str(e)}")
        raise ApiException(
            message="정비소 수정 중 오류가 발생했습니다",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="UPDATE_WORKSHOP_ERROR"
        )

@router.post("/{workshop_id}/staff")
async def add_workshop_staff(
    workshop_id: str,
    staff_email: str,
    role: str = "TECHNICIAN",
    current_user_id: str = Depends(get_current_user_id)
):
    """
    정비소 직원 추가
    """
    try:
        # 소유자 확인
        await verify_workshop_owner(workshop_id, current_user_id)
        
        # 사용자 확인
        user = await prisma.user.find_unique(
            where={"email": staff_email}
        )
        
        if not user:
            raise ApiException(
                message="사용자를 찾을 수 없습니다",
                status_code=status.HTTP_404_NOT_FOUND,
                error_code="USER_NOT_FOUND"
            )
        
        # 직원 추가
        staff = await prisma.workshop_staff.create(
            data={
                "workshop_id": workshop_id,
                "user_id": user.id,
                "role": role,
                "is_active": True
            },
            include={"user": True}
        )
        
        # 사용자 역할 업데이트
        await prisma.user.update(
            where={"id": user.id},
            data={"role": "WORKSHOP_STAFF"}
        )
        
        logger.info(f"정비소 직원 추가 완료: {staff_email}")
        
        return success_response(
            message="직원이 추가되었습니다",
            data=staff
        )
        
    except ApiException:
        raise
    except Exception as e:
        logger.error(f"직원 추가 중 오류 발생: {str(e)}")
        raise ApiException(
            message="직원 추가 중 오류가 발생했습니다",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="ADD_STAFF_ERROR"
        )
