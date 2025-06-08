# filepath: backend/services/fleet_api/lib/routes/assignment_routes.py
"""
차량 배정 관련 전체 조회 라우터
"""
from fastapi import APIRouter, Depends, Query, Path
from typing import List, Optional
from prisma import Prisma
from ..models.assignment import VehicleAssignmentResponse

router = APIRouter(
    prefix="/assignments",
    tags=["assignments"],
)

@router.get("", response_model=List[VehicleAssignmentResponse])
async def get_all_assignments(
    driver_id: Optional[str] = Query(None, alias="driverId"),
    vehicle_id: Optional[str] = Query(None, alias="vehicleId"),
    prisma: Prisma = Depends(),
):
    """모든 차량-운전자 배정 목록 조회"""
    where: dict = {}
    if driver_id:
        where["driver_id"] = driver_id
    if vehicle_id:
        where["vehicle_id"] = vehicle_id

    assignments = await prisma.vehicle_assignment.find_many(where=where)
    return [VehicleAssignmentResponse.model_validate(a) for a in assignments]
