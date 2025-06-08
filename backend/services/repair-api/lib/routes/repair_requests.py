"""
정비 요청 관리 API 라우터
"""
from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from pydantic import BaseModel, Field
from prisma import Prisma

from shared.utils.response_utils import success_response, ApiException
from shared.utils.logging_utils import get_logger

logger = get_logger(__name__)

# Prisma 인스턴스
prisma = Prisma()

router = APIRouter(prefix="/repair-requests", tags=["정비 요청"])

# Pydantic 모델들
class RepairRequestCreate(BaseModel):
    """정비 요청 생성 모델"""
    vehicle_id: str
    description: str
    urgency: str = Field(default="NORMAL", pattern="^(LOW|NORMAL|HIGH|URGENT)$")
    preferred_date: Optional[datetime] = None
    estimated_duration: Optional[int] = Field(None, description="예상 소요 시간(분)")
    symptoms: List[str] = Field(default_factory=list)
    
class RepairRequestUpdate(BaseModel):
    """정비 요청 수정 모델"""
    description: Optional[str] = None
    urgency: Optional[str] = Field(None, pattern="^(LOW|NORMAL|HIGH|URGENT)$")
    status: Optional[str] = Field(None, pattern="^(PENDING|CONFIRMED|IN_PROGRESS|COMPLETED|CANCELLED)$")
    preferred_date: Optional[datetime] = None
    estimated_duration: Optional[int] = None
    actual_duration: Optional[int] = None
    workshop_id: Optional[str] = None
    technician_id: Optional[str] = None
    diagnosis: Optional[str] = None
    repair_notes: Optional[str] = None
    parts_used: Optional[List[dict]] = None
    total_cost: Optional[float] = None

class RepairRequestResponse(BaseModel):
    """정비 요청 응답 모델"""
    id: str
    request_number: str
    vehicle: dict
    customer: dict
    workshop: Optional[dict]
    technician: Optional[dict]
    description: str
    urgency: str
    status: str
    preferred_date: Optional[datetime]
    scheduled_date: Optional[datetime]
    completed_date: Optional[datetime]
    estimated_duration: Optional[int]
    actual_duration: Optional[int]
    symptoms: List[str]
    diagnosis: Optional[str]
    repair_notes: Optional[str]
    parts_used: Optional[List[dict]]
    total_cost: Optional[float]
    images: List[dict]
    created_at: datetime
    updated_at: datetime

# 의존성 함수들
async def get_current_user_id() -> str:
    """현재 사용자 ID 가져오기 (임시)"""
    # TODO: 실제 인증 미들웨어 연동
    return "test-user-id"

def generate_request_number() -> str:
    """정비 요청 번호 생성"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M")
    random_suffix = str(uuid4())[:4].upper()
    return f"REQ-{timestamp}-{random_suffix}"

# API 엔드포인트들
@router.post("/", response_model=RepairRequestResponse)
async def create_repair_request(
    request_data: RepairRequestCreate,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    새로운 정비 요청 생성
    """
    try:
        # 차량 존재 확인
        vehicle = await prisma.vehicle.find_unique(
            where={"id": request_data.vehicle_id},
            include={"owner": True}
        )
        
        if not vehicle:
            raise ApiException(
                message="차량을 찾을 수 없습니다",
                status_code=status.HTTP_404_NOT_FOUND,
                error_code="VEHICLE_NOT_FOUND"
            )
        
        # 차량 소유자 확인
        if vehicle.owner_id != current_user_id:
            raise ApiException(
                message="본인 소유의 차량만 정비 요청을 할 수 있습니다",
                status_code=status.HTTP_403_FORBIDDEN,
                error_code="PERMISSION_DENIED"
            )
        
        # 정비 요청 생성
        repair_request = await prisma.repair_request.create(
            data={
                "request_number": generate_request_number(),
                "vehicle_id": request_data.vehicle_id,
                "customer_id": current_user_id,
                "description": request_data.description,
                "urgency": request_data.urgency,
                "status": "PENDING",
                "preferred_date": request_data.preferred_date,
                "estimated_duration": request_data.estimated_duration,
                "symptoms": request_data.symptoms
            },
            include={
                "vehicle": True,
                "customer": True,
                "workshop": True,
                "technician": True,
                "images": True
            }
        )
        
        logger.info(f"정비 요청 생성 완료: {repair_request.request_number}")
        
        # 응답 데이터 구성
        response_data = RepairRequestResponse(
            id=repair_request.id,
            request_number=repair_request.request_number,
            vehicle=repair_request.vehicle,
            customer=repair_request.customer,
            workshop=repair_request.workshop,
            technician=repair_request.technician,
            description=repair_request.description,
            urgency=repair_request.urgency,
            status=repair_request.status,
            preferred_date=repair_request.preferred_date,
            scheduled_date=repair_request.scheduled_date,
            completed_date=repair_request.completed_date,
            estimated_duration=repair_request.estimated_duration,
            actual_duration=repair_request.actual_duration,
            symptoms=repair_request.symptoms,
            diagnosis=repair_request.diagnosis,
            repair_notes=repair_request.repair_notes,
            parts_used=repair_request.parts_used,
            total_cost=repair_request.total_cost,
            images=repair_request.images,
            created_at=repair_request.created_at,
            updated_at=repair_request.updated_at
        )
        
        return success_response(
            message="정비 요청이 생성되었습니다",
            data=response_data.dict()
        )
        
    except ApiException:
        raise
    except Exception as e:
        logger.error(f"정비 요청 생성 중 오류 발생: {str(e)}")
        raise ApiException(
            message="정비 요청 생성 중 오류가 발생했습니다",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="CREATE_REQUEST_ERROR"
        )

@router.get("/", response_model=List[RepairRequestResponse])
async def get_repair_requests(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    urgency: Optional[str] = None,
    workshop_id: Optional[str] = None,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    정비 요청 목록 조회
    """
    try:
        # 필터 조건 구성
        where_conditions = {"customer_id": current_user_id}
        
        if status:
            where_conditions["status"] = status
        if urgency:
            where_conditions["urgency"] = urgency
        if workshop_id:
            where_conditions["workshop_id"] = workshop_id
        
        # 전체 카운트 조회
        total_count = await prisma.repair_request.count(where=where_conditions)
        
        # 페이지네이션 계산
        skip = (page - 1) * page_size
        total_pages = (total_count + page_size - 1) // page_size
        
        # 정비 요청 목록 조회
        repair_requests = await prisma.repair_request.find_many(
            where=where_conditions,
            skip=skip,
            take=page_size,
            include={
                "vehicle": True,
                "customer": True,
                "workshop": True,
                "technician": True,
                "images": True
            },
            order_by={"created_at": "desc"}
        )
        
        # 응답 데이터 구성
        items = []
        for req in repair_requests:
            items.append(RepairRequestResponse(
                id=req.id,
                request_number=req.request_number,
                vehicle=req.vehicle,
                customer=req.customer,
                workshop=req.workshop,
                technician=req.technician,
                description=req.description,
                urgency=req.urgency,
                status=req.status,
                preferred_date=req.preferred_date,
                scheduled_date=req.scheduled_date,
                completed_date=req.completed_date,
                estimated_duration=req.estimated_duration,
                actual_duration=req.actual_duration,
                symptoms=req.symptoms,
                diagnosis=req.diagnosis,
                repair_notes=req.repair_notes,
                parts_used=req.parts_used,
                total_cost=req.total_cost,
                images=req.images,
                created_at=req.created_at,
                updated_at=req.updated_at
            ))
        
        return success_response(
            message="정비 요청 목록을 조회했습니다",
            data={
                "items": [item.dict() for item in items],
                "total": total_count,
                "page": page,
                "page_size": page_size,
                "total_pages": total_pages
            }
        )
        
    except Exception as e:
        logger.error(f"정비 요청 목록 조회 중 오류 발생: {str(e)}")
        raise ApiException(
            message="정비 요청 목록 조회 중 오류가 발생했습니다",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="LIST_REQUEST_ERROR"
        )

@router.get("/{request_id}")
async def get_repair_request(
    request_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    특정 정비 요청 상세 정보 조회
    """
    try:
        repair_request = await prisma.repair_request.find_unique(
            where={"id": request_id},
            include={
                "vehicle": {
                    "include": {
                        "model": True,
                        "owner": True
                    }
                },
                "customer": True,
                "workshop": {
                    "include": {
                        "reviews": {
                            "take": 5,
                            "order_by": {"created_at": "desc"}
                        }
                    }
                },
                "technician": True,
                "images": True,
                "history": {
                    "order_by": {"created_at": "desc"}
                }
            }
        )
        
        if not repair_request:
            raise ApiException(
                message="정비 요청을 찾을 수 없습니다",
                status_code=status.HTTP_404_NOT_FOUND,
                error_code="REQUEST_NOT_FOUND"
            )
        
        # 권한 확인 (본인 요청이거나 정비소 직원인 경우만)
        if repair_request.customer_id != current_user_id:
            # TODO: 정비소 직원 권한 확인 로직 추가
            raise ApiException(
                message="정비 요청을 조회할 권한이 없습니다",
                status_code=status.HTTP_403_FORBIDDEN,
                error_code="PERMISSION_DENIED"
            )
        
        return success_response(
            message="정비 요청 정보를 조회했습니다",
            data=repair_request
        )
        
    except ApiException:
        raise
    except Exception as e:
        logger.error(f"정비 요청 조회 중 오류 발생: {str(e)}")
        raise ApiException(
            message="정비 요청 조회 중 오류가 발생했습니다",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="GET_REQUEST_ERROR"
        )

@router.put("/{request_id}")
async def update_repair_request(
    request_id: str,
    update_data: RepairRequestUpdate,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    정비 요청 정보 수정
    """
    try:
        # 정비 요청 존재 확인
        repair_request = await prisma.repair_request.find_unique(
            where={"id": request_id}
        )
        
        if not repair_request:
            raise ApiException(
                message="정비 요청을 찾을 수 없습니다",
                status_code=status.HTTP_404_NOT_FOUND,
                error_code="REQUEST_NOT_FOUND"
            )
        
        # 권한 확인
        if repair_request.customer_id != current_user_id:
            # TODO: 정비소 직원 권한 확인 로직 추가
            raise ApiException(
                message="정비 요청을 수정할 권한이 없습니다",
                status_code=status.HTTP_403_FORBIDDEN,
                error_code="PERMISSION_DENIED"
            )
        
        # 상태 변경 로직
        if update_data.status:
            # 이미 완료된 요청은 수정 불가
            if repair_request.status == "COMPLETED":
                raise ApiException(
                    message="완료된 정비 요청은 수정할 수 없습니다",
                    status_code=status.HTTP_400_BAD_REQUEST,
                    error_code="CANNOT_UPDATE_COMPLETED"
                )
            
            # 완료 상태로 변경 시 완료 시간 기록
            if update_data.status == "COMPLETED":
                update_data.completed_date = datetime.utcnow()
        
        # 업데이트 데이터 준비
        update_dict = update_data.dict(exclude_unset=True)
        
        # 정비 요청 업데이트
        updated_request = await prisma.repair_request.update(
            where={"id": request_id},
            data=update_dict,
            include={
                "vehicle": True,
                "customer": True,
                "workshop": True,
                "technician": True,
                "images": True
            }
        )
        
        # 히스토리 기록
        await prisma.repair_history.create(
            data={
                "repair_request_id": request_id,
                "action": f"정비 요청 수정: {', '.join(update_dict.keys())}",
                "performed_by": current_user_id,
                "details": update_dict
            }
        )
        
        logger.info(f"정비 요청 수정 완료: {updated_request.request_number}")
        
        return success_response(
            message="정비 요청이 수정되었습니다",
            data=updated_request
        )
        
    except ApiException:
        raise
    except Exception as e:
        logger.error(f"정비 요청 수정 중 오류 발생: {str(e)}")
        raise ApiException(
            message="정비 요청 수정 중 오류가 발생했습니다",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="UPDATE_REQUEST_ERROR"
        )

@router.post("/{request_id}/images")
async def upload_repair_images(
    request_id: str,
    files: List[UploadFile] = File(...),
    current_user_id: str = Depends(get_current_user_id)
):
    """
    정비 요청에 이미지 업로드
    """
    try:
        # 정비 요청 존재 및 권한 확인
        repair_request = await prisma.repair_request.find_unique(
            where={"id": request_id}
        )
        
        if not repair_request:
            raise ApiException(
                message="정비 요청을 찾을 수 없습니다",
                status_code=status.HTTP_404_NOT_FOUND,
                error_code="REQUEST_NOT_FOUND"
            )
        
        if repair_request.customer_id != current_user_id:
            raise ApiException(
                message="이미지를 업로드할 권한이 없습니다",
                status_code=status.HTTP_403_FORBIDDEN,
                error_code="PERMISSION_DENIED"
            )
        
        # 파일 개수 제한
        if len(files) > 10:
            raise ApiException(
                message="한 번에 최대 10개의 이미지만 업로드할 수 있습니다",
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code="TOO_MANY_FILES"
            )
        
        uploaded_images = []
        
        for file in files:
            # 파일 형식 확인
            if not file.content_type.startswith("image/"):
                raise ApiException(
                    message=f"이미지 파일만 업로드 가능합니다: {file.filename}",
                    status_code=status.HTTP_400_BAD_REQUEST,
                    error_code="INVALID_FILE_TYPE"
                )
            
            # 파일 크기 제한 (10MB)
            contents = await file.read()
            if len(contents) > 10 * 1024 * 1024:
                raise ApiException(
                    message=f"파일 크기는 10MB를 초과할 수 없습니다: {file.filename}",
                    status_code=status.HTTP_400_BAD_REQUEST,
                    error_code="FILE_TOO_LARGE"
                )
            
            # TODO: 실제 파일 저장 로직 (S3 등)
            # 여기서는 임시로 DB에 메타데이터만 저장
            image = await prisma.repair_image.create(
                data={
                    "repair_request_id": request_id,
                    "filename": file.filename,
                    "url": f"https://storage.cargoro.com/repairs/{request_id}/{file.filename}",
                    "size": len(contents),
                    "uploaded_by": current_user_id
                }
            )
            
            uploaded_images.append(image)
        
        logger.info(f"정비 요청 이미지 업로드 완료: {request_id}, {len(uploaded_images)}개")
        
        return success_response(
            message=f"{len(uploaded_images)}개의 이미지가 업로드되었습니다",
            data=uploaded_images
        )
        
    except ApiException:
        raise
    except Exception as e:
        logger.error(f"이미지 업로드 중 오류 발생: {str(e)}")
        raise ApiException(
            message="이미지 업로드 중 오류가 발생했습니다",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="IMAGE_UPLOAD_ERROR"
        )

@router.delete("/{request_id}")
async def cancel_repair_request(
    request_id: str,
    reason: Optional[str] = None,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    정비 요청 취소
    """
    try:
        # 정비 요청 조회
        repair_request = await prisma.repair_request.find_unique(
            where={"id": request_id}
        )
        
        if not repair_request:
            raise ApiException(
                message="정비 요청을 찾을 수 없습니다",
                status_code=status.HTTP_404_NOT_FOUND,
                error_code="REQUEST_NOT_FOUND"
            )
        
        # 권한 확인
        if repair_request.customer_id != current_user_id:
            raise ApiException(
                message="정비 요청을 취소할 권한이 없습니다",
                status_code=status.HTTP_403_FORBIDDEN,
                error_code="PERMISSION_DENIED"
            )
        
        # 상태 확인
        if repair_request.status in ["IN_PROGRESS", "COMPLETED"]:
            raise ApiException(
                message="진행 중이거나 완료된 정비 요청은 취소할 수 없습니다",
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code="CANNOT_CANCEL_REQUEST"
            )
        
        # 취소 처리
        cancelled_request = await prisma.repair_request.update(
            where={"id": request_id},
            data={
                "status": "CANCELLED",
                "cancellation_reason": reason,
                "cancelled_at": datetime.utcnow()
            }
        )
        
        # 히스토리 기록
        await prisma.repair_history.create(
            data={
                "repair_request_id": request_id,
                "action": "정비 요청 취소",
                "performed_by": current_user_id,
                "details": {"reason": reason}
            }
        )
        
        logger.info(f"정비 요청 취소 완료: {cancelled_request.request_number}")
        
        return success_response(
            message="정비 요청이 취소되었습니다",
            data={"request_id": request_id, "status": "CANCELLED"}
        )
        
    except ApiException:
        raise
    except Exception as e:
        logger.error(f"정비 요청 취소 중 오류 발생: {str(e)}")
        raise ApiException(
            message="정비 요청 취소 중 오류가 발생했습니다",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="CANCEL_REQUEST_ERROR"
        )
