from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from fastapi import HTTPException, status
import logging

# Prisma 모델 대신 로컬 모델 사용
try:
    # 실제 환경에서는 Prisma 모델 사용 시도
    from prisma.models import Maintenance, Vehicle, User, Organization, MaintenancePart
    from prisma.enums import MaintenanceStatus, MaintenanceType
except ImportError:
    # 테스트 환경에서는 로컬 모델 사용
    from enum import Enum

    class MaintenanceStatus(Enum):
        SCHEDULED = "SCHEDULED"
        IN_PROGRESS = "IN_PROGRESS"
        ON_HOLD = "ON_HOLD"
        COMPLETED = "COMPLETED"
        CANCELLED = "CANCELLED"

    class MaintenanceType(Enum):
        REPAIR = "REPAIR"
        PREVENTIVE = "PREVENTIVE"
        INSPECTION = "INSPECTION"

    # Mock 모델들 (테스트용)
    class Maintenance:
        pass

    class Vehicle:
        pass

    class User:
        pass

    class Organization:
        pass

    class MaintenancePart:
        pass

    import logging

    logging.warning("Prisma 모델을 가져올 수 없어 로컬 모델을 사용합니다.")

# 상대 경로로 import 수정
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shared.database.db_operations import database_session, database_transaction

logger = logging.getLogger(__name__)

# 우선순위 매핑
PRIORITY_MAPPING = {"LOW": "낮음", "MEDIUM": "보통", "HIGH": "높음", "URGENT": "긴급"}

# 상태 전환 규칙
VALID_STATUS_TRANSITIONS = {
    "SCHEDULED": ["IN_PROGRESS", "CANCELLED"],
    "IN_PROGRESS": ["COMPLETED", "CANCELLED", "ON_HOLD"],
    "ON_HOLD": ["IN_PROGRESS", "CANCELLED"],
    "COMPLETED": [],
    "CANCELLED": [],
}


async def create_repair_job(data: Dict, current_user: Any) -> Dict:
    """정비 작업을 생성합니다."""
    try:
        async with database_session() as db:
            # 차량 존재 확인
            vehicle = await db.vehicle.find_unique(where={"id": data["vehicleId"]})
            if not vehicle:
                raise ValueError(f"차량을 찾을 수 없습니다: {data['vehicleId']}")

            # RepairJob은 Maintenance 모델로 매핑
            repair_job = await db.maintenance.create(
                data={
                    "title": data.get("title", "정비 작업"),
                    "description": data.get("description", ""),
                    "maintenanceType": MaintenanceType.REPAIR,
                    "status": MaintenanceStatus.SCHEDULED,
                    "startDate": data.get("scheduledDate", datetime.now()),
                    "vehicleId": data["vehicleId"],
                    "organizationId": data.get("organizationId", ""),
                    "cost": data.get("estimatedCost", 0.0),
                }
            )

            return {"success": True, "repairJob": repair_job}
    except Exception as e:
        logger.error(f"정비 작업 생성 중 오류 발생: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"정비 작업 생성 중 오류 발생: {str(e)}"
        )


async def get_repair_job(repair_job_id: str) -> Dict:
    """정비 작업 상세 정보를 조회합니다."""
    try:
        async with database_session() as db:
            repair_job = await db.maintenance.find_unique(
                where={"id": repair_job_id},
                include={"vehicle": True, "organization": True, "parts": True},
            )

            if not repair_job:
                raise ValueError(f"정비 작업을 찾을 수 없습니다: {repair_job_id}")

            return {"success": True, "repairJob": repair_job}
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"정비 작업 조회 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def list_repair_jobs(
    current_user: Any, skip: int = 0, take: int = 50, **filters
) -> Dict:
    """정비 작업 목록을 조회합니다."""
    try:
        async with database_session() as db:
            where_clause = {}

            if "status" in filters and filters["status"]:
                where_clause["status"] = MaintenanceStatus(filters["status"])
            if "organizationId" in filters and filters["organizationId"]:
                where_clause["organizationId"] = filters["organizationId"]
            if "vehicleId" in filters and filters["vehicleId"]:
                where_clause["vehicleId"] = filters["vehicleId"]

            repair_jobs = await db.maintenance.find_many(
                where=where_clause if where_clause else None,
                skip=skip,
                take=take,
                include={"vehicle": True, "organization": True},
            )

            total = await db.maintenance.count(
                where=where_clause if where_clause else None
            )

            return {
                "success": True,
                "data": {
                    "items": repair_jobs,
                    "total": total,
                    "skip": skip,
                    "take": take,
                },
            }
    except Exception as e:
        logger.error(f"정비 작업 목록 조회 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def update_repair_job(
    repair_job_id: str, update_data: Dict, current_user: Any
) -> Dict:
    """정비 작업 정보를 업데이트합니다."""
    try:
        if not repair_job_id:
            raise ValueError("수정할 정비 작업 ID가 필요합니다")

        async with database_session() as db:
            repair_job = await db.maintenance.find_unique(where={"id": repair_job_id})
            if not repair_job:
                raise ValueError(f"정비 작업을 찾을 수 없습니다: {repair_job_id}")

            # 상태가 있다면 enum으로 변환
            processed_data = {}
            for key, value in update_data.items():
                if key == "status" and value:
                    processed_data[key] = MaintenanceStatus(value)
                elif key == "maintenanceType" and value:
                    processed_data[key] = MaintenanceType(value)
                else:
                    processed_data[key] = value

            updated_repair_job = await db.maintenance.update(
                where={"id": repair_job_id}, data=processed_data
            )

            return {"success": True, "repairJob": updated_repair_job}
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"정비 작업 업데이트 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def update_repair_status(
    repair_job_id: str, new_status: str, current_user: Any
) -> Dict:
    """정비 작업 상태를 업데이트합니다."""
    try:
        async with database_session() as db:
            repair_job = await db.maintenance.find_unique(where={"id": repair_job_id})
            if not repair_job:
                raise ValueError(f"정비 작업을 찾을 수 없습니다: {repair_job_id}")

            # 상태 전환 검증
            current_status = repair_job.status.value
            if current_status and new_status not in VALID_STATUS_TRANSITIONS.get(
                current_status, []
            ):
                raise ValueError(
                    f"잘못된 상태 변경입니다: {current_status} -> {new_status}"
                )

            update_data = {
                "status": MaintenanceStatus(new_status),
            }

            # 상태별 추가 필드 설정
            if new_status == "COMPLETED":
                update_data["endDate"] = datetime.now()

            updated_repair_job = await db.maintenance.update(
                where={"id": repair_job_id}, data=update_data
            )

            return {"success": True, "repairJob": updated_repair_job}
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"정비 작업 상태 업데이트 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def complete_repair_job(
    repair_job_id: str, completion_data: Dict, current_user: Any
) -> Dict:
    """정비 작업을 완료 처리합니다."""
    try:
        async with database_session() as db:
            repair_job = await db.maintenance.find_unique(where={"id": repair_job_id})
            if not repair_job:
                raise ValueError(f"정비 작업을 찾을 수 없습니다: {repair_job_id}")

            if repair_job.status != MaintenanceStatus.IN_PROGRESS:
                raise ValueError("진행 중인 정비 작업만 완료 처리할 수 있습니다")

            # 완료 처리
            updated_repair_job = await db.maintenance.update(
                where={"id": repair_job_id},
                data={
                    "status": MaintenanceStatus.COMPLETED,
                    "endDate": datetime.now(),
                    "cost": completion_data.get("totalActual", repair_job.cost),
                    "notes": completion_data.get(
                        "technicianNotes", repair_job.notes or ""
                    ),
                },
            )

            return {"success": True, "repairJob": updated_repair_job}
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"정비 작업 완료 처리 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def cancel_repair_job(repair_job_id: str, reason: str, current_user: Any) -> Dict:
    """정비 작업을 취소합니다."""
    try:
        async with database_session() as db:
            repair_job = await db.maintenance.find_unique(where={"id": repair_job_id})
            if not repair_job:
                raise ValueError(f"정비 작업을 찾을 수 없습니다: {repair_job_id}")

            if repair_job.status == MaintenanceStatus.COMPLETED:
                raise ValueError("완료된 정비 작업은 취소할 수 없습니다")

            updated_repair_job = await db.maintenance.update(
                where={"id": repair_job_id},
                data={
                    "status": MaintenanceStatus.CANCELLED,
                    "notes": f"{repair_job.notes or ''}\n취소 사유: {reason}".strip(),
                },
            )

            return {
                "success": True,
                "message": "정비 작업이 취소되었습니다",
                "repairJob": updated_repair_job,
            }
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"정비 작업 취소 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def delete_repair_job(repair_job_id: str, current_user: Any) -> Dict:
    """정비 작업을 삭제합니다."""
    try:
        async with database_session() as db:
            repair_job = await db.maintenance.find_unique(where={"id": repair_job_id})
            if not repair_job:
                raise HTTPException(
                    status_code=404, detail="정비 작업을 찾을 수 없습니다"
                )

            # 권한 확인
            user_role = (
                current_user.get("role")
                if hasattr(current_user, "get")
                else getattr(current_user, "role", None)
            )
            if user_role not in ["ADMIN", "WORKSHOP_OWNER"]:
                raise HTTPException(
                    status_code=403, detail="정비 작업 삭제 권한이 없습니다"
                )

            if repair_job.status == MaintenanceStatus.IN_PROGRESS:
                raise HTTPException(
                    status_code=400, detail="진행 중인 정비 작업은 삭제할 수 없습니다"
                )

            # 관련 데이터 삭제 (MaintenancePart 먼저 삭제)
            await db.maintenancepart.delete_many(where={"maintenanceId": repair_job_id})

            await db.maintenance.delete(where={"id": repair_job_id})

            return {"success": True, "deletedId": repair_job_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"정비 작업 삭제 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def reschedule_repair_job(
    repair_job_id: str, new_date: datetime, reason: str, user: Any
) -> Dict:
    """정비 작업을 재일정합니다."""
    try:
        async with database_session() as db:
            repair_job = await db.maintenance.find_unique(where={"id": repair_job_id})
            if not repair_job:
                raise ValueError(f"정비 작업을 찾을 수 없습니다: {repair_job_id}")

            if repair_job.status == MaintenanceStatus.COMPLETED:
                raise ValueError("완료된 정비 작업은 재일정할 수 없습니다")

            if new_date < datetime.now():
                raise ValueError("과거 날짜로 재일정할 수 없습니다")

            updated_repair_job = await db.maintenance.update(
                where={"id": repair_job_id},
                data={
                    "startDate": new_date,
                    "notes": f"{repair_job.notes or ''}\n재일정 사유: {reason}".strip(),
                },
            )

            return {"success": True, "repairJob": updated_repair_job}
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"정비 작업 재일정 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def get_workshop_repair_jobs(
    organization_id: str, current_user: Any, skip: int = 0, take: int = 50
) -> Dict:
    """정비소별 정비 작업 목록을 조회합니다."""
    try:
        async with database_session() as db:
            repair_jobs = await db.maintenance.find_many(
                where={"organizationId": organization_id},
                skip=skip,
                take=take,
                include={"vehicle": True, "parts": True},
                order={"createdAt": "desc"},
            )

            total = await db.maintenance.count(
                where={"organizationId": organization_id}
            )

            return {
                "success": True,
                "data": {
                    "items": repair_jobs,
                    "total": total,
                    "skip": skip,
                    "take": take,
                },
            }
    except Exception as e:
        logger.error(f"정비소 정비 작업 목록 조회 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def add_required_parts(
    repair_job_id: str, parts: List[Dict], current_user: Any
) -> Dict:
    """정비 작업에 필요한 부품을 추가합니다."""
    try:
        async with database_session() as db:
            repair_job = await db.maintenance.find_unique(where={"id": repair_job_id})
            if not repair_job:
                raise ValueError(f"정비 작업을 찾을 수 없습니다: {repair_job_id}")

            if repair_job.status != MaintenanceStatus.IN_PROGRESS:
                raise ValueError("진행 중인 정비 작업에만 부품을 추가할 수 있습니다")

            created_parts = []
            for part_data in parts:
                created_part = await db.maintenancepart.create(
                    data={
                        "maintenanceId": repair_job_id,
                        "name": part_data["name"],
                        "partNumber": part_data.get("partNumber", ""),
                        "quantity": part_data["quantity"],
                        "unitPrice": part_data["unitPrice"],
                        "totalPrice": part_data["quantity"] * part_data["unitPrice"],
                    }
                )
                created_parts.append(created_part)

            return {
                "success": True,
                "message": f"{len(created_parts)}개의 부품이 추가되었습니다",
                "parts": created_parts,
            }
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"부품 추가 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def update_labor_estimate(
    repair_job_id: str, labor_hours: float, hourly_rate: float, current_user: Any
) -> Dict:
    """정비 작업의 인건비 예상치를 업데이트합니다."""
    try:
        async with database_session() as db:
            repair_job = await db.maintenance.find_unique(where={"id": repair_job_id})
            if not repair_job:
                raise ValueError(f"정비 작업을 찾을 수 없습니다: {repair_job_id}")

            labor_cost = labor_hours * hourly_rate
            total_cost = (repair_job.cost or 0) + labor_cost

            updated_repair_job = await db.maintenance.update(
                where={"id": repair_job_id},
                data={"cost": total_cost},
            )

            return {
                "success": True,
                "laborHours": labor_hours,
                "hourlyRate": hourly_rate,
                "laborCost": labor_cost,
                "totalCost": total_cost,
                "repairJob": updated_repair_job,
            }
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"인건비 업데이트 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def get_repair_metrics(organization_id: str) -> Dict:
    """정비 메트릭을 조회합니다."""
    try:
        async with database_session() as db:
            # 총 정비 건수
            total_repairs = await db.maintenance.count(
                where={"organizationId": organization_id}
            )

            # 완료된 정비 건수
            completed_repairs = await db.maintenance.count(
                where={
                    "organizationId": organization_id,
                    "status": MaintenanceStatus.COMPLETED,
                }
            )

            # 진행 중인 정비 건수
            in_progress_repairs = await db.maintenance.count(
                where={
                    "organizationId": organization_id,
                    "status": MaintenanceStatus.IN_PROGRESS,
                }
            )

            # 완료율 계산
            completion_rate = (
                completed_repairs / total_repairs if total_repairs > 0 else 0
            )

            # 평균 비용
            completed_jobs = await db.maintenance.find_many(
                where={
                    "organizationId": organization_id,
                    "status": MaintenanceStatus.COMPLETED,
                    "cost": {"not": None},
                }
            )

            average_cost = 0
            if completed_jobs:
                total_cost = sum(job.cost for job in completed_jobs if job.cost)
                average_cost = total_cost / len(completed_jobs)

            return {
                "totalRepairs": total_repairs,
                "completedRepairs": completed_repairs,
                "inProgressRepairs": in_progress_repairs,
                "completionRate": completion_rate,
                "averageCost": average_cost,
            }
    except Exception as e:
        logger.error(f"정비 메트릭 조회 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def search_repair_jobs(
    query: str, current_user: Any, organization_id: Optional[str] = None, **filters
) -> Dict:
    """정비 작업을 검색합니다."""
    try:
        async with database_session() as db:
            where_clause = {}

            if organization_id:
                where_clause["organizationId"] = organization_id

            if query:
                where_clause["OR"] = [
                    {"title": {"contains": query, "mode": "insensitive"}},
                    {"description": {"contains": query, "mode": "insensitive"}},
                    {
                        "vehicle": {
                            "licensePlate": {"contains": query, "mode": "insensitive"}
                        }
                    },
                ]

            if "status" in filters and filters["status"]:
                where_clause["status"] = MaintenanceStatus(filters["status"])

            repair_jobs = await db.maintenance.find_many(
                where=where_clause if where_clause else None,
                include={"vehicle": True, "organization": True, "parts": True},
                order={"createdAt": "desc"},
            )

            return {"success": True, "results": repair_jobs, "query": query}
    except Exception as e:
        logger.error(f"정비 작업 검색 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def generate_repair_report(repair_job_id: str, current_user: Any) -> Dict:
    """정비 작업 보고서를 생성합니다."""
    try:
        async with database_session() as db:
            repair_job = await db.maintenance.find_unique(
                where={"id": repair_job_id},
                include={"vehicle": True, "organization": True, "parts": True},
            )

            if not repair_job:
                raise ValueError(f"정비 작업을 찾을 수 없습니다: {repair_job_id}")

            # 보고서 데이터 구성
            parts_cost = sum(part.totalPrice or 0 for part in repair_job.parts)
            total_cost = repair_job.cost or 0

            report = {
                "repairJobId": repair_job_id,
                "title": repair_job.title,
                "description": repair_job.description,
                "status": repair_job.status.value,
                "vehicle": {
                    "licensePlate": (
                        repair_job.vehicle.licensePlate if repair_job.vehicle else "N/A"
                    ),
                    "model": (
                        getattr(repair_job.vehicle, "model", "N/A")
                        if repair_job.vehicle
                        else "N/A"
                    ),
                },
                "organization": {
                    "name": (
                        repair_job.organization.name
                        if repair_job.organization
                        else "N/A"
                    ),
                },
                "dates": {
                    "startDate": (
                        repair_job.startDate.isoformat()
                        if repair_job.startDate
                        else None
                    ),
                    "endDate": (
                        repair_job.endDate.isoformat() if repair_job.endDate else None
                    ),
                },
                "costs": {
                    "partsCost": parts_cost,
                    "totalCost": total_cost,
                },
                "parts": [
                    {
                        "name": part.name,
                        "quantity": part.quantity,
                        "unitPrice": part.unitPrice,
                        "totalPrice": part.totalPrice,
                    }
                    for part in repair_job.parts
                ],
                "notes": repair_job.notes or "",
                "generatedAt": datetime.now().isoformat(),
            }

            return {"success": True, "report": report}
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"정비 보고서 생성 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def add_diagnostic_notes(
    repair_job_id: str, notes: str, current_user: Any
) -> Dict:
    """정비 작업에 진단 노트를 추가합니다."""
    try:
        async with database_session() as db:
            repair_job = await db.maintenance.find_unique(where={"id": repair_job_id})
            if not repair_job:
                raise ValueError(f"정비 작업을 찾을 수 없습니다: {repair_job_id}")

            # 기존 노트에 새 노트 추가
            existing_notes = repair_job.notes or ""
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            new_notes = f"{existing_notes}\n[{timestamp}] 진단: {notes}".strip()

            updated_repair_job = await db.maintenance.update(
                where={"id": repair_job_id}, data={"notes": new_notes}
            )

            return {
                "success": True,
                "message": "진단 노트가 추가되었습니다",
                "repairJob": updated_repair_job,
            }
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"진단 노트 추가 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def update_technician_assignment(
    repair_job_id: str, technician_id: str, current_user: Any
) -> Dict:
    """정비 작업에 기술자를 배정합니다."""
    try:
        async with database_session() as db:
            repair_job = await db.maintenance.find_unique(where={"id": repair_job_id})
            if not repair_job:
                raise ValueError(f"정비 작업을 찾을 수 없습니다: {repair_job_id}")

            # 기술자 존재 확인
            technician = await db.user.find_unique(where={"id": technician_id})
            if not technician:
                raise ValueError(f"기술자를 찾을 수 없습니다: {technician_id}")

            # 정비 작업에 기술자 배정 (assignedTo 필드가 있다고 가정)
            # Maintenance 모델에 assignedTo 필드가 없다면 notes에 기록
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            assignment_note = (
                f"[{timestamp}] 담당 기술자: {technician.name} ({technician.email})"
            )
            existing_notes = repair_job.notes or ""
            new_notes = f"{existing_notes}\n{assignment_note}".strip()

            updated_repair_job = await db.maintenance.update(
                where={"id": repair_job_id}, data={"notes": new_notes}
            )

            return {
                "success": True,
                "message": f"기술자 {technician.name}이 배정되었습니다",
                "repairJob": updated_repair_job,
                "technician": {
                    "id": technician.id,
                    "name": technician.name,
                    "email": technician.email,
                },
            }
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"기술자 배정 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def get_repair_history(vehicle_id: str, current_user: Any) -> Dict:
    """차량의 정비 이력을 조회합니다."""
    try:
        async with database_session() as db:
            # 차량 존재 확인
            vehicle = await db.vehicle.find_unique(where={"id": vehicle_id})
            if not vehicle:
                raise ValueError(f"차량을 찾을 수 없습니다: {vehicle_id}")

            repair_history = await db.maintenance.find_many(
                where={"vehicleId": vehicle_id},
                include={"parts": True},
                order={"createdAt": "desc"},
            )

            return {
                "success": True,
                "vehicleId": vehicle_id,
                "licensePlate": vehicle.licensePlate,
                "history": repair_history,
                "totalRepairs": len(repair_history),
            }
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"정비 이력 조회 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def calculate_repair_cost(repair_job_id: str, current_user: Any) -> Dict:
    """정비 작업의 총 비용을 계산합니다."""
    try:
        async with database_session() as db:
            repair_job = await db.maintenance.find_unique(
                where={"id": repair_job_id}, include={"parts": True}
            )

            if not repair_job:
                raise ValueError(f"정비 작업을 찾을 수 없습니다: {repair_job_id}")

            # 부품 비용 계산
            parts_cost = sum(part.totalPrice or 0 for part in repair_job.parts)

            # 기본 인건비 (예시: 시간당 50,000원으로 가정)
            base_labor_cost = repair_job.cost or 0

            # 총 비용
            total_cost = parts_cost + base_labor_cost

            # 비용 정보 업데이트
            updated_repair_job = await db.maintenance.update(
                where={"id": repair_job_id}, data={"cost": total_cost}
            )

            return {
                "success": True,
                "costBreakdown": {
                    "partsCost": parts_cost,
                    "laborCost": base_labor_cost,
                    "totalCost": total_cost,
                },
                "repairJob": updated_repair_job,
            }
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"정비 비용 계산 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def schedule_followup_maintenance(
    repair_job_id: str, followup_data: Dict, current_user: Any
) -> Dict:
    """후속 정비를 예약합니다."""
    try:
        async with database_session() as db:
            repair_job = await db.maintenance.find_unique(where={"id": repair_job_id})
            if not repair_job:
                raise ValueError(f"정비 작업을 찾을 수 없습니다: {repair_job_id}")

            if repair_job.status != MaintenanceStatus.COMPLETED:
                raise ValueError(
                    "완료된 정비 작업에 대해서만 후속 정비를 예약할 수 있습니다"
                )

            # 후속 정비 작업 생성
            followup_repair = await db.maintenance.create(
                data={
                    "title": followup_data.get(
                        "title", f"후속 정비 - {repair_job.title}"
                    ),
                    "description": followup_data.get(
                        "description", f"원본 정비({repair_job_id})의 후속 정비"
                    ),
                    "maintenanceType": MaintenanceType.PREVENTIVE,
                    "status": MaintenanceStatus.SCHEDULED,
                    "startDate": followup_data.get(
                        "scheduledDate", datetime.now() + timedelta(days=30)
                    ),
                    "vehicleId": repair_job.vehicleId,
                    "organizationId": repair_job.organizationId,
                    "cost": followup_data.get("estimatedCost", 0.0),
                    "notes": f"원본 정비 작업 ID: {repair_job_id}",
                }
            )

            return {
                "success": True,
                "message": "후속 정비가 예약되었습니다",
                "originalRepairJob": repair_job,
                "followupRepairJob": followup_repair,
            }
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"후속 정비 예약 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def schedule_repair_appointment(
    vehicle_id: str, appointment_data: Dict, current_user: Any
) -> Dict:
    """정비 예약을 생성합니다."""
    try:
        # create_repair_job 함수를 사용하여 정비 예약 생성
        repair_data = {
            "vehicleId": vehicle_id,
            "organizationId": appointment_data.get("organizationId", ""),
            "title": appointment_data.get("title", "정비 예약"),
            "description": appointment_data.get("description", "정비 예약"),
            "scheduledDate": appointment_data.get("scheduledDate", datetime.now()),
            "estimatedCost": appointment_data.get("estimatedCost", 0.0),
        }

        result = await create_repair_job(repair_data, current_user)

        return {
            "success": True,
            "message": "정비 예약이 생성되었습니다",
            "appointment": result.get("repairJob"),
        }
    except Exception as e:
        logger.error(f"정비 예약 생성 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# 유틸리티 함수들
def validate_repair_data(repair_data: Dict) -> bool:
    """정비 데이터 유효성을 검증합니다."""
    required_fields = ["vehicleId", "organizationId", "description"]
    return all(field in repair_data and repair_data[field] for field in required_fields)


def calculate_time_difference(start_time: datetime, end_time: datetime) -> Dict:
    """시간 차이를 계산합니다."""
    diff = end_time - start_time
    days = diff.days
    hours = diff.seconds // 3600
    minutes = (diff.seconds % 3600) // 60

    return {
        "days": days,
        "hours": hours,
        "minutes": minutes,
        "totalHours": days * 24 + hours + minutes / 60,
    }


def format_currency(amount: float, currency: str = "KRW") -> str:
    """통화 형식으로 포맷합니다."""
    if currency == "KRW":
        return f"₩{amount:,.0f}"
    elif currency == "USD":
        return f"${amount:,.2f}"
    else:
        return f"{amount:,.2f} {currency}"


# create_repair 함수 추가 (테스트에서 사용되는 함수)
async def create_repair(data: Dict, current_user: Any) -> Dict:
    """정비 작업을 생성합니다. (create_repair_job의 별칭)"""
    return await create_repair_job(data, current_user)
