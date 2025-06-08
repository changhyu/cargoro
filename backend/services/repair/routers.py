"""
정비 관련 API 라우터

정비 주문, 작업 일정, 부품 주문 등과 관련된 API 엔드포인트를 정의합니다.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional, Dict, Any, Callable, Awaitable

from . import handlers


# 라우터 생성 함수
def create_repair_router(get_db_dependency: Callable[..., Awaitable[Any]]):
    """
    정비 API 라우터 생성

    Args:
        get_db_dependency: 데이터베이스 의존성 함수

    Returns:
        FastAPI 라우터 객체
    """
    router = APIRouter()

    @router.get("/{repair_id}", status_code=status.HTTP_200_OK)
    async def get_repair_job(repair_id: str, db=Depends(get_db_dependency)):
        """특정 정비 작업 조회"""
        try:
            repair = await handlers.get_repair_job(db, repair_id)
            return repair
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"정비 작업 조회 중 오류 발생: {str(e)}"
            )

    @router.get("/", status_code=status.HTTP_200_OK)
    async def get_workshop_repair_jobs(
        workshopId: str,
        status: Optional[List[str]] = None,
        fromDate: Optional[str] = None,
        toDate: Optional[str] = None,
        skip: int = 0,
        take: int = 50,
        db=Depends(get_db_dependency)
    ):
        """워크샵별 정비 작업 목록 조회"""
        try:
            repairs = await handlers.get_workshop_repair_jobs(
                db, workshopId, skip, take, status, fromDate, toDate
            )
            return repairs
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"정비 작업 목록 조회 중 오류 발생: {str(e)}"
            )



    @router.post("/", status_code=status.HTTP_201_CREATED)
    async def create_repair_job(
        repair_data: Dict[str, Any],
        db=Depends(get_db_dependency),
        current_user=Depends(lambda: {"id": "test_user_id", "role": "WORKSHOP_MANAGER"})
    ):
        """새 정비 작업 생성"""
        try:
            repair = await handlers.create_repair_job(db, repair_data, current_user)
            return repair
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"정비 작업 생성 중 오류 발생: {str(e)}"
            )

    @router.patch("/{repair_id}/status", status_code=status.HTTP_200_OK)
    async def update_repair_status(
        repair_id: str,
        status_data: Dict[str, Any],
        db=Depends(get_db_dependency),
        current_user=Depends(lambda: {"id": "test_user_id", "role": "WORKSHOP_MANAGER"})
    ):
        """정비 작업 상태 업데이트"""
        try:
            status = status_data.get("status")
            if not status:
                raise ValueError("상태 정보가 필요합니다")

            repair = await handlers.update_repair_status(db, repair_id, status, current_user)
            return repair
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"정비 작업 상태 업데이트 중 오류 발생: {str(e)}"
            )

    @router.patch("/{repair_id}/diagnostic-notes", status_code=status.HTTP_200_OK)
    async def add_diagnostic_notes(
        repair_id: str,
        notes_data: Dict[str, Any],
        db=Depends(get_db_dependency),
        current_user=Depends(lambda: {"id": "test_user_id", "role": "WORKSHOP_MANAGER"})
    ):
        """정비 작업 진단 노트 추가"""
        try:
            data = {
                "repairJobId": repair_id,
                "diagnosticNotes": notes_data.get("diagnosticNotes", "")
            }
            repair = await handlers.add_diagnostic_notes(db, data, current_user)
            return repair
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"진단 노트 추가 중 오류 발생: {str(e)}"
            )

    @router.post("/{repair_id}/complete", status_code=status.HTTP_200_OK)
    async def complete_repair_job(
        repair_id: str,
        complete_data: Dict[str, Any],
        db=Depends(get_db_dependency),
        current_user=Depends(lambda: {"id": "test_user_id", "role": "WORKSHOP_MANAGER"})
    ):
        """정비 작업 완료 처리"""
        try:
            data = {
                "repairJobId": repair_id,
                **complete_data
            }
            repair = await handlers.complete_repair_job(db, data, current_user)
            return repair
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"정비 작업 완료 처리 중 오류 발생: {str(e)}"
            )

    @router.post("/{repair_id}/cancel", status_code=status.HTTP_200_OK)
    async def cancel_repair_job(
        repair_id: str,
        cancel_data: Dict[str, Any],
        db=Depends(get_db_dependency),
        current_user=Depends(lambda: {"id": "test_user_id", "role": "WORKSHOP_MANAGER"})
    ):
        """정비 작업 취소"""
        try:
            data = {
                "repairJobId": repair_id,
                **cancel_data
            }
            repair = await handlers.cancel_repair_job(db, data, current_user)
            return repair
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"정비 작업 취소 중 오류 발생: {str(e)}"
            )

    @router.post("/{repair_id}/reschedule", status_code=status.HTTP_200_OK)
    async def reschedule_repair_job(
        repair_id: str,
        schedule_data: Dict[str, Any],
        db=Depends(get_db_dependency),
        current_user=Depends(lambda: {"id": "test_user_id", "role": "WORKSHOP_MANAGER"})
    ):
        """정비 작업 일정 변경"""
        try:
            data = {
                "repairJobId": repair_id,
                **schedule_data
            }
            repair = await handlers.reschedule_repair_job(db, data, current_user)
            return repair
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"정비 작업 일정 변경 중 오류 발생: {str(e)}"
            )

    @router.post("/{repair_id}/required-parts", status_code=status.HTTP_200_OK)
    async def add_required_parts(
        repair_id: str,
        parts_data: Dict[str, Any],
        db=Depends(get_db_dependency),
        current_user=Depends(lambda: {"id": "test_user_id", "role": "WORKSHOP_MANAGER"})
    ):
        """정비 작업 필요 부품 추가"""
        try:
            data = {
                "repairJobId": repair_id,
                **parts_data
            }
            repair = await handlers.add_required_parts(db, data, current_user)
            return repair
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"필요 부품 추가 중 오류 발생: {str(e)}"
            )

    @router.patch("/{repair_id}/labor-estimate", status_code=status.HTTP_200_OK)
    async def update_labor_estimate(
        repair_id: str,
        labor_data: Dict[str, Any],
        db=Depends(get_db_dependency),
        current_user=Depends(lambda: {"id": "test_user_id", "role": "WORKSHOP_MANAGER"})
    ):
        """정비 작업 공임 예상 업데이트"""
        try:
            data = {
                "repairJobId": repair_id,
                **labor_data
            }
            repair = await handlers.update_labor_estimate(db, data, current_user)
            return repair
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"공임 예상 업데이트 중 오류 발생: {str(e)}"
            )

    return router


# 기본 라우터 인스턴스 생성 (테스트용)
def get_db_mock():
    """Mock database dependency for testing"""
    class MockDB:
        def __init__(self):
            self.repairJob = MockRepairJob()
            self.vehicle = MockVehicle()
            self.workshop = MockWorkshop()
            self.user = MockUser()
            self.notification = MockNotification()

        class MockRepairJob:
            async def find_unique(self, **kwargs):
                id = kwargs.get("where", {}).get("id")
                return {"id": id, "status": "SCHEDULED"}

        class MockVehicle:
            async def find_unique(self, **kwargs):
                return {"id": "test_vehicle_id", "make": "현대", "model": "아반떼"}

        class MockWorkshop:
            async def find_unique(self, **kwargs):
                return {"id": "test_workshop_id", "name": "테스트 정비소"}

        class MockUser:
            async def find_unique(self, **kwargs):
                return {"id": "test_user_id", "name": "홍길동"}

        class MockNotification:
            async def create(self, **kwargs):
                return {"id": "new_notification_id"}

    return MockDB()


# 테스트에서 사용할 수 있는 기본 라우터
router = create_repair_router(get_db_mock)
