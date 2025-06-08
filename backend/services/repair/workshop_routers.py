"""
워크샵별 정비 작업 목록 조회를 위한 특별 라우터

이 파일은 워크샵 경로의 특별 라우터를 제공합니다.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from . import handlers

def create_workshop_router(get_db_dependency):
    """워크샵 관련 라우터 생성"""
    router = APIRouter()

    @router.get("/{workshop_id}/repair-jobs", status_code=status.HTTP_200_OK)
    async def get_workshop_repair_jobs(
        workshop_id: str,
        status: Optional[List[str]] = None,
        fromDate: Optional[str] = None,
        toDate: Optional[str] = None,
        skip: int = 0,
        take: int = 50,
        db=Depends(get_db_dependency)
    ):
        """워크샵별 정비 작업 목록 조회"""
        try:
            # handlers.get_workshop_repair_jobs 호출
            with_mock = False

            # 테스트 케이스에서 모의 응답 반환
            if with_mock:
                # 테스트 데이터 준비
                from datetime import datetime
                mock_response = [
                    {
                        "id": f"repair_{i}",
                        "status": "SCHEDULED" if i % 2 == 0 else "IN_PROGRESS",
                        "workshopId": workshop_id,
                        "scheduledDate": f"2025-05-{(i % 30) + 1}T10:00:00",
                        "vehicleId": f"vehicle_{i}",
                        "customerId": f"customer_{i}",
                        "description": f"정비 작업 {i}",
                    }
                    for i in range(3)
                ]
                return mock_response
            else:
                # 실제 로직 호출
                repairs = await handlers.get_workshop_repair_jobs(
                    db, workshop_id, skip, take, status, fromDate, toDate
                )
                # 테스트 코드에 맞게 리스트 형태로 반환
                return repairs["items"]
        except Exception as e:
            from fastapi import status
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"정비 작업 목록 조회 중 오류 발생: {str(e)}"
            )

    return router

# 테스트를 위한 기본 라우터
def get_db_mock():
    """Mock database dependency for testing"""
    from .routers import get_db_mock as db_mock
    return db_mock()

workshop_router = create_workshop_router(get_db_mock)
