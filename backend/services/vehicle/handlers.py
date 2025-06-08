"""
차량 서비스 핸들러

이 모듈은 차량 관련 API 요청을 처리하는 핸들러 함수를 제공합니다.
"""

from typing import Dict, List, Any, Optional, Union
from datetime import datetime
from fastapi import Depends, HTTPException

from shared.utils.response_utils import create_response
from shared.interfaces import DBClient


async def get_vehicle(vehicle_id: str, db: DBClient) -> Dict[str, Any]:
    """차량 정보 조회"""
    try:
        vehicle = await db.vehicle.find_unique(where={"id": vehicle_id})
        if not vehicle:
            raise HTTPException(
                status_code=404,
                detail=f"차량 ID {vehicle_id}를 찾을 수 없습니다.",
            )
        return create_response(data=vehicle)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"차량 조회 중 오류 발생: {str(e)}",
        )


async def get_vehicles_by_owner(db: DBClient, owner_id: str) -> List[Any]:
    """소유자 기준 차량 목록 조회"""
    try:
        vehicles = await db.vehicle.find_many(where={"ownerId": owner_id})
        return vehicles
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"소유자별 차량 목록 조회 중 오류 발생: {str(e)}",
        )


async def get_vehicles_by_type(db: DBClient, vehicle_type: str) -> List[Any]:
    """차량 유형별 목록 조회"""
    try:
        vehicles = await db.vehicle.find_many(where={"type": vehicle_type})
        return vehicles
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"차량 유형별 목록 조회 중 오류 발생: {str(e)}",
        )


async def list_vehicles(
    skip: int = 0,
    limit: int = 100,
    filters: Optional[Dict[str, Any]] = None,
    db: DBClient = None,
) -> Dict[str, Any]:
    """차량 목록 조회"""
    try:
        where = {}
        if filters:
            if "brand" in filters:
                where["brand"] = filters["brand"]
            if "status" in filters:
                where["status"] = filters["status"]
            if "type" in filters:
                where["type"] = filters["type"]

        vehicles = await db.vehicle.find_many(
            where=where, skip=skip, take=limit, order_by={"createdAt": "desc"}
        )

        total = await db.vehicle.count(where=where)

        return create_response(
            data={
                "items": vehicles,
                "total": total,
                "page": skip // limit + 1 if limit > 0 else 1,
                "pages": (total + limit - 1) // limit if limit > 0 else 1,
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"차량 목록 조회 중 오류 발생: {str(e)}",
        )


async def create_vehicle(
    db: DBClient, input_data: Dict[str, Any], auth_user: Any
) -> Any:
    """차량 생성"""
    try:
        # 등록 번호 중복 확인
        if "registrationNumber" in input_data:
            existing = await db.vehicle.find_first(
                where={"registrationNumber": input_data["registrationNumber"]}
            )
            if existing:
                raise ValueError(
                    f"이미 등록된 차량 번호입니다: {input_data['registrationNumber']}"
                )

        # 상태 이력 초기화
        status = input_data.get("status", "ACTIVE")
        status_history = [
            {
                "status": status,
                "timestamp": datetime.now().isoformat(),
                "updatedBy": auth_user.id,
                "reason": "초기 등록",
            }
        ]
        input_data["statusHistory"] = status_history

        # 주행 이력 초기화
        mileage = input_data.get("currentMileage", 0)
        if mileage > 0:
            mileage_history = [
                {
                    "mileage": mileage,
                    "timestamp": datetime.now().isoformat(),
                    "recordedBy": auth_user.id,
                    "source": "초기 등록",
                }
            ]
            input_data["mileageHistory"] = mileage_history

        # 차량 생성
        new_vehicle = await db.vehicle.create(data=input_data)

        return new_vehicle
    except ValueError as e:
        raise ValueError(str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"차량 등록 중 오류 발생: {str(e)}",
        )


async def update_vehicle(
    db: DBClient, input_data: Dict[str, Any], auth_user: Any
) -> Any:
    """차량 정보 업데이트"""
    try:
        # 차량 존재 확인
        vehicle_id = input_data.get("id")
        if not vehicle_id:
            raise ValueError("차량 ID가 필요합니다")

        vehicle = await db.vehicle.find_unique(where={"id": vehicle_id})
        if not vehicle:
            raise ValueError(f"차량을 찾을 수 없습니다: {vehicle_id}")

        # 삭제된 차량 확인
        if vehicle.deletedAt:
            raise ValueError("삭제된 차량은 수정할 수 없습니다")

        # 주행거리 변경 처리
        if (
            "currentMileage" in input_data
            and input_data["currentMileage"] != vehicle.currentMileage
        ):
            mileage_history = vehicle.mileageHistory or []
            mileage_history.append(
                {
                    "mileage": input_data["currentMileage"],
                    "timestamp": datetime.now().isoformat(),
                    "recordedBy": auth_user.id,
                    "source": input_data.get("mileageSource", "수동 업데이트"),
                }
            )
            input_data["mileageHistory"] = mileage_history

        # 상태 변경 처리
        if "status" in input_data and input_data["status"] != vehicle.status:
            status_history = vehicle.statusHistory or []
            status_history.append(
                {
                    "status": input_data["status"],
                    "timestamp": datetime.now().isoformat(),
                    "updatedBy": auth_user.id,
                    "reason": input_data.get("statusReason", "상태 업데이트"),
                }
            )
            input_data["statusHistory"] = status_history

        # 차량 업데이트
        updated_vehicle = await db.vehicle.update(
            where={"id": vehicle_id}, data=input_data
        )

        return updated_vehicle
    except ValueError as e:
        raise ValueError(str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"차량 업데이트 중 오류 발생: {str(e)}",
        )


async def delete_vehicle(db: DBClient, vehicle_id: str, auth_user: Any) -> bool:
    """차량 삭제"""
    try:
        # 차량 존재 확인
        vehicle = await db.vehicle.find_unique(where={"id": vehicle_id})
        if not vehicle:
            raise ValueError(f"차량을 찾을 수 없습니다: {vehicle_id}")

        # 활성 배정 확인
        active_assignment = await db.vehicleAssignment.find_first(
            where={"vehicleId": vehicle_id, "status": "ACTIVE"}
        )
        if active_assignment:
            raise ValueError("활성 배정이 있는 차량은 삭제할 수 없습니다")

        # 정비 기록 확인
        maintenance_count = await db.maintenanceRecord.count(
            where={"vehicleId": vehicle_id}
        )
        if maintenance_count > 0:
            # 정비 기록이 있는 경우 논리적 삭제 (상태만 변경)
            await db.vehicle.update(
                where={"id": vehicle_id},
                data={
                    "status": "DELETED",
                    "statusHistory": [
                        *vehicle.statusHistory,
                        {
                            "status": "DELETED",
                            "timestamp": datetime.now().isoformat(),
                            "updatedBy": auth_user.id,
                            "reason": "삭제 요청",
                        },
                    ],
                },
            )
        else:
            # 정비 기록이 없는 경우 물리적 삭제
            await db.vehicle.delete(where={"id": vehicle_id})

        return True
    except ValueError as e:
        raise ValueError(str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"차량 삭제 중 오류 발생: {str(e)}",
        )


async def assign_vehicle(
    db: DBClient, input_data: Dict[str, Any], auth_user: Any
) -> Any:
    """차량 배정"""
    try:
        vehicle_id = input_data.get("vehicleId")
        user_id = input_data.get("userId")
        start_date = input_data.get("startDate")
        end_date = input_data.get("endDate")
        notes = input_data.get("notes", "")

        # 차량 유효성 확인
        vehicle = await db.vehicle.find_unique(where={"id": vehicle_id})
        if not vehicle:
            raise ValueError(f"차량을 찾을 수 없습니다: {vehicle_id}")

        # 사용자 유효성 확인
        user = await db.user.find_unique(where={"id": user_id})
        if not user:
            raise ValueError(f"사용자를 찾을 수 없습니다: {user_id}")

        if not user.isActive:
            raise ValueError("비활성 사용자에게는 차량을 배정할 수 없습니다")

        # 기존 활성 배정 확인
        active_assignment = await db.vehicleAssignment.find_first(
            where={"vehicleId": vehicle_id, "status": "ACTIVE"}
        )
        if active_assignment:
            raise ValueError("이미 배정된 차량입니다")

        # 새 배정 생성
        assignment_data = {
            "vehicleId": vehicle_id,
            "userId": user_id,
            "startDate": (
                datetime.fromisoformat(start_date)
                if isinstance(start_date, str)
                else start_date
            ),
            "endDate": (
                datetime.fromisoformat(end_date)
                if end_date and isinstance(end_date, str)
                else end_date
            ),
            "status": "ACTIVE",
            "notes": notes,
            "assignedBy": auth_user.id,
        }

        new_assignment = await db.vehicleAssignment.create(data=assignment_data)

        # 차량 상태 및 소유자 업데이트
        await db.vehicle.update(
            where={"id": vehicle_id},
            data={
                "status": "ACTIVE",
                "ownerId": user_id,
                "statusHistory": [
                    *vehicle.statusHistory,
                    {
                        "status": "ACTIVE",
                        "timestamp": datetime.now().isoformat(),
                        "updatedBy": auth_user.id,
                        "reason": f"차량 배정: {user.fullName}",
                    },
                ],
            },
        )

        return new_assignment
    except ValueError as e:
        raise ValueError(str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"차량 배정 중 오류 발생: {str(e)}",
        )


async def update_vehicle_status(
    db: DBClient, input_data: Dict[str, Any], auth_user: Any
) -> Any:
    """차량 상태 업데이트"""
    try:
        vehicle_id = input_data.get("vehicleId")
        new_status = input_data.get("status")
        reason = input_data.get("reason", "")

        # 차량 존재 확인
        vehicle = await db.vehicle.find_unique(where={"id": vehicle_id})
        if not vehicle:
            raise ValueError(f"차량을 찾을 수 없습니다: {vehicle_id}")

        # 현재와 동일한 상태면 변경 없음
        if vehicle.status == new_status:
            return vehicle

        # 상태 이력 업데이트
        status_history = vehicle.statusHistory or []
        status_history.append(
            {
                "status": new_status,
                "timestamp": datetime.now().isoformat(),
                "updatedBy": auth_user.id,
                "reason": reason,
            }
        )

        # 차량 상태 업데이트
        updated_vehicle = await db.vehicle.update(
            where={"id": vehicle_id},
            data={"status": new_status, "statusHistory": status_history},
        )

        return updated_vehicle
    except ValueError as e:
        raise ValueError(str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"차량 상태 업데이트 중 오류 발생: {str(e)}",
        )


async def update_vehicle_mileage(
    db: DBClient, input_data: Dict[str, Any], auth_user: Any
) -> Any:
    """차량 주행거리 업데이트"""
    try:
        vehicle_id = input_data.get("vehicleId")
        mileage = input_data.get("mileage")
        date = input_data.get("date")
        source = input_data.get("source", "수동 입력")

        # 차량 존재 확인
        vehicle = await db.vehicle.find_unique(where={"id": vehicle_id})
        if not vehicle:
            raise ValueError(f"차량을 찾을 수 없습니다: {vehicle_id}")

        # 주행거리 유효성 검증
        if mileage <= 0:
            raise ValueError("주행거리는 0보다 커야 합니다")

        if vehicle.currentMileage and mileage < vehicle.currentMileage:
            raise ValueError(
                f"입력한 주행거리({mileage})가 현재 주행거리({vehicle.currentMileage})보다 작습니다"
            )

        # 주행 이력 업데이트
        mileage_history = vehicle.mileageHistory or []
        mileage_history.append(
            {
                "mileage": mileage,
                "timestamp": (
                    datetime.fromisoformat(date)
                    if isinstance(date, str)
                    else (date or datetime.now()).isoformat()
                ),
                "recordedBy": auth_user.id,
                "source": source,
            }
        )

        # 차량 주행거리 업데이트
        updated_vehicle = await db.vehicle.update(
            where={"id": vehicle_id},
            data={"currentMileage": mileage, "mileageHistory": mileage_history},
        )

        return updated_vehicle
    except ValueError as e:
        raise ValueError(str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"차량 주행거리 업데이트 중 오류 발생: {str(e)}",
        )


async def get_vehicle_maintenance_history(db: DBClient, vehicle_id: str) -> List[Any]:
    """차량 정비 이력 조회"""
    try:
        # 차량 존재 확인
        vehicle = await db.vehicle.find_unique(where={"id": vehicle_id})
        if not vehicle:
            raise ValueError(f"차량을 찾을 수 없습니다: {vehicle_id}")

        # 정비 이력 조회
        maintenance_records = await db.maintenanceRecord.find_many(
            where={"vehicleId": vehicle_id}, orderBy={"date": "desc"}
        )

        return maintenance_records
    except ValueError as e:
        raise ValueError(str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"차량 정비 이력 조회 중 오류 발생: {str(e)}",
        )


async def record_mileage(
    db: DBClient, input_data: Dict[str, Any], auth_user: Any
) -> Any:
    """차량 주행거리 기록"""
    try:
        vehicle_id = input_data.get("vehicleId")
        mileage = input_data.get("mileage")
        recorded_at = input_data.get("recordedAt", datetime.now().isoformat())
        notes = input_data.get("notes", "")

        # 차량 존재 확인
        vehicle = await db.vehicle.find_unique(where={"id": vehicle_id})
        if not vehicle:
            raise ValueError(f"차량을 찾을 수 없습니다: {vehicle_id}")

        # 주행거리 유효성 검증
        if mileage <= 0:
            raise ValueError("주행거리는 0보다 커야 합니다")

        # 이전 주행거리 기록 확인
        previous_record = await db.mileageRecord.find_first(
            where={"vehicleId": vehicle_id}, orderBy={"recordedAt": "desc"}
        )

        if previous_record and mileage <= previous_record.mileage:
            raise ValueError(
                f"새 주행거리는 이전 기록보다 커야 합니다 (이전: {previous_record.mileage})"
            )

        # 주행거리 기록 생성
        mileage_record = await db.mileageRecord.create(
            data={
                "vehicleId": vehicle_id,
                "mileage": mileage,
                "recordedAt": (
                    recorded_at
                    if isinstance(recorded_at, datetime)
                    else datetime.fromisoformat(recorded_at)
                ),
                "recordedBy": auth_user.id,
                "notes": notes,
            }
        )

        # 차량 현재 주행거리 업데이트
        await db.vehicle.update(
            where={"id": vehicle_id}, data={"currentMileage": mileage}
        )

        return mileage_record
    except ValueError as e:
        raise ValueError(str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"주행거리 기록 중 오류 발생: {str(e)}",
        )


async def get_vehicle_statistics(db: DBClient) -> Dict[str, Any]:
    """차량 통계 정보 조회"""
    try:
        # 전체 차량 수
        total_vehicles = await db.vehicle.count()

        # 활성 차량 수
        active_vehicles = await db.vehicle.count(where={"status": "active"})

        # 차량 유형별 통계
        vehicle_types = await db.vehicle.group_by(by=["type"], _count=True)

        # 소유자별 차량 수
        owner_stats = await db.vehicle.group_by(by=["ownerId"], _count=True)

        return create_response(
            data={
                "total_vehicles": total_vehicles,
                "active_vehicles": active_vehicles,
                "inactive_vehicles": total_vehicles - active_vehicles,
                "vehicle_types": vehicle_types,
                "owner_distribution": owner_stats,
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"차량 통계 조회 중 오류 발생: {str(e)}",
        )


async def assign_driver_to_vehicle(
    db: DBClient, vehicle_id: str, driver_id: str, auth_user: Any
) -> Dict[str, Any]:
    """
    드라이버를 차량에 할당합니다.
    """
    try:
        # 차량 존재 확인
        vehicle = await db.vehicle.find_unique(where={"id": vehicle_id})
        if not vehicle:
            raise ValueError(f"Vehicle {vehicle_id} not found")

        # 드라이버 할당
        updated_vehicle = await db.vehicle.update(
            where={"id": vehicle_id},
            data={"assigned_driver_id": driver_id, "updated_at": datetime.now()}
        )

        return {
            "id": updated_vehicle.id,
            "assigned_driver_id": updated_vehicle.assigned_driver_id,
            "updated_at": updated_vehicle.updated_at.isoformat()
        }
    except Exception as e:
        raise Exception(f"Failed to assign driver to vehicle: {str(e)}")


async def unassign_driver_from_vehicle(
    db: DBClient, vehicle_id: str, auth_user: Any
) -> Dict[str, Any]:
    """
    차량에서 드라이버 할당을 해제합니다.
    """
    try:
        # 차량 존재 확인
        vehicle = await db.vehicle.find_unique(where={"id": vehicle_id})
        if not vehicle:
            raise ValueError(f"Vehicle {vehicle_id} not found")

        # 드라이버 할당 해제
        updated_vehicle = await db.vehicle.update(
            where={"id": vehicle_id},
            data={"assigned_driver_id": None, "updated_at": datetime.now()}
        )

        return {
            "id": updated_vehicle.id,
            "assigned_driver_id": None,
            "updated_at": updated_vehicle.updated_at.isoformat()
        }
    except Exception as e:
        raise Exception(f"Failed to unassign driver from vehicle: {str(e)}")


async def get_vehicle_assignment_history(
    db: DBClient, vehicle_id: str
) -> List[Dict[str, Any]]:
    """
    차량의 드라이버 할당 이력을 조회합니다.
    """
    try:
        assignments = await db.vehicle_assignment.find_many(
            where={"vehicle_id": vehicle_id},
            order_by={"created_at": "desc"}
        )

        return [
            {
                "id": assignment.id,
                "vehicle_id": assignment.vehicle_id,
                "driver_id": assignment.driver_id,
                "assigned_at": assignment.assigned_at.isoformat() if assignment.assigned_at else None,
                "unassigned_at": assignment.unassigned_at.isoformat() if assignment.unassigned_at else None,
                "created_at": assignment.created_at.isoformat()
            }
            for assignment in assignments
        ]
    except Exception as e:
        raise Exception(f"Failed to get vehicle assignment history: {str(e)}")


async def get_fleet_analytics(db: DBClient) -> Dict[str, Any]:
    """
    플릿 분석 데이터를 조회합니다.
    """
    try:
        # 기본 통계
        total_vehicles = await db.vehicle.count()
        active_vehicles = await db.vehicle.count(where={"status": "active"})

        # 유형별 분포
        vehicle_types = await db.vehicle.group_by(
            by=["type"],
            _count={"_all": True}
        )

        type_distribution = {
            group["type"]: group["_count"]["_all"]
            for group in vehicle_types
        }

        # 상태별 분포
        vehicle_statuses = await db.vehicle.group_by(
            by=["status"],
            _count={"_all": True}
        )

        status_distribution = {
            group["status"]: group["_count"]["_all"]
            for group in vehicle_statuses
        }

        return {
            "total_vehicles": total_vehicles,
            "active_vehicles": active_vehicles,
            "utilization_rate": (active_vehicles / total_vehicles * 100) if total_vehicles > 0 else 0,
            "type_distribution": type_distribution,
            "status_distribution": status_distribution,
            "maintenance_pending": await db.vehicle.count(where={"status": "maintenance"}),
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise Exception(f"Failed to get fleet analytics: {str(e)}")


async def get_vehicle_report(
    db: DBClient,
    report_type: str = "all",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    format: str = "json"
) -> Dict[str, Any]:
    """차량 보고서 생성

    Args:
        db: 데이터베이스 클라이언트
        report_type: 보고서 유형 (all, maintenance, usage, assignment)
        start_date: 시작 날짜 (YYYY-MM-DD)
        end_date: 종료 날짜 (YYYY-MM-DD)
        format: 출력 형식 (json, csv, pdf)

    Returns:
        보고서 데이터
    """
    try:
        # 날짜 필터 설정
        date_filter = {}
        if start_date:
            date_filter["gte"] = start_date
        if end_date:
            date_filter["lte"] = end_date

        report_data = {
            "generated_at": datetime.now().isoformat(),
            "report_type": report_type,
            "date_range": {
                "start": start_date,
                "end": end_date,
            },
        }

        # 전체 차량 정보 가져오기
        vehicles = await db.vehicle.find_many(
            order_by={"createdAt": "desc"},
        )

        # 보고서 유형별 데이터 수집
        if report_type in ["all", "maintenance"]:
            # 정비 이력 데이터
            maintenance_records = []
            for vehicle in vehicles:
                # 날짜 필터 적용
                where_condition = {"vehicleId": vehicle.id}
                if date_filter:
                    where_condition["date"] = date_filter

                vehicle_maintenance = await db.maintenance.find_many(
                    where=where_condition,
                    order_by={"date": "desc"},
                )

                if vehicle_maintenance:
                    for record in vehicle_maintenance:
                        maintenance_records.append({
                            "vehicle_id": vehicle.id,
                            "registration_number": vehicle.registrationNumber,
                            "maintenance_id": record.id,
                            "maintenance_type": record.type,
                            "description": record.description,
                            "date": record.date,
                            "cost": record.cost,
                            "performed_by": record.performedBy,
                        })

            report_data["maintenance_records"] = maintenance_records

        if report_type in ["all", "usage"]:
            # 차량 사용 데이터
            usage_data = []
            for vehicle in vehicles:
                # 주행 기록 필터링
                mileage_history = vehicle.mileageHistory or []
                filtered_history = []

                for entry in mileage_history:
                    entry_date = entry.get("timestamp", "").split("T")[0]
                    include_entry = True

                    if start_date and entry_date < start_date:
                        include_entry = False
                    if end_date and entry_date > end_date:
                        include_entry = False

                    if include_entry:
                        filtered_history.append(entry)

                if filtered_history:
                    usage_data.append({
                        "vehicle_id": vehicle.id,
                        "registration_number": vehicle.registrationNumber,
                        "current_mileage": vehicle.currentMileage,
                        "mileage_history": filtered_history,
                    })

            report_data["usage_data"] = usage_data

        if report_type in ["all", "assignment"]:
            # 차량 배정 데이터
            assignment_data = []
            for vehicle in vehicles:
                # 날짜 필터가 있을 경우만 적용
                where_condition = {"vehicleId": vehicle.id}
                if date_filter:
                    where_condition["OR"] = [
                        {"startDate": date_filter},
                        {"endDate": date_filter}
                    ]

                assignments = await db.vehicleAssignment.find_many(
                    where=where_condition,
                    order_by={"startDate": "desc"},
                    include={"driver": True},
                )

                if assignments:
                    vehicle_assignments = []
                    for assignment in assignments:
                        driver_name = "Unknown"
                        if assignment.driver:
                            driver_name = f"{assignment.driver.firstName} {assignment.driver.lastName}"

                        vehicle_assignments.append({
                            "assignment_id": assignment.id,
                            "driver_id": assignment.driverId,
                            "driver_name": driver_name,
                            "start_date": assignment.startDate,
                            "end_date": assignment.endDate,
                            "notes": assignment.notes,
                        })

                    assignment_data.append({
                        "vehicle_id": vehicle.id,
                        "registration_number": vehicle.registrationNumber,
                        "assignments": vehicle_assignments,
                    })

            report_data["assignment_data"] = assignment_data

        # CSV 형식 처리
        if format == "csv":
            import csv
            import io
            from fastapi.responses import StreamingResponse

            output = io.StringIO()
            writer = None

            # 보고서 유형에 따라 CSV 헤더 및 데이터 설정
            if report_type == "maintenance":
                writer = csv.DictWriter(
                    output,
                    fieldnames=[
                        "vehicle_id", "registration_number", "maintenance_id",
                        "maintenance_type", "description", "date", "cost", "performed_by"
                    ]
                )
                writer.writeheader()
                for record in report_data.get("maintenance_records", []):
                    writer.writerow(record)

            elif report_type == "usage":
                # 사용 보고서는 평탄화된 구조로 변환
                writer = csv.writer(output)
                writer.writerow([
                    "vehicle_id", "registration_number", "timestamp",
                    "mileage", "recorded_by", "source"
                ])

                for vehicle_usage in report_data.get("usage_data", []):
                    for entry in vehicle_usage.get("mileage_history", []):
                        writer.writerow([
                            vehicle_usage["vehicle_id"],
                            vehicle_usage["registration_number"],
                            entry.get("timestamp", ""),
                            entry.get("mileage", 0),
                            entry.get("recordedBy", ""),
                            entry.get("source", ""),
                        ])

            elif report_type == "assignment":
                writer = csv.writer(output)
                writer.writerow([
                    "vehicle_id", "registration_number", "assignment_id",
                    "driver_id", "driver_name", "start_date", "end_date", "notes"
                ])

                for vehicle_assignment in report_data.get("assignment_data", []):
                    for assignment in vehicle_assignment.get("assignments", []):
                        writer.writerow([
                            vehicle_assignment["vehicle_id"],
                            vehicle_assignment["registration_number"],
                            assignment["assignment_id"],
                            assignment["driver_id"],
                            assignment["driver_name"],
                            assignment["start_date"],
                            assignment["end_date"],
                            assignment["notes"],
                        ])

            else:  # 'all' 유형은 여러 시트를 필요로 하므로 JSON으로 대체
                return create_response(
                    data={"error": "CSV 형식은 특정 보고서 유형에만 지원됩니다 (maintenance, usage, assignment)"},
                    status_code=400
                )

            return StreamingResponse(
                iter([output.getvalue()]),
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename=vehicle_{report_type}_report.csv"
                }
            )

        # PDF 형식은 미구현 상태로 에러 반환
        elif format == "pdf":
            return create_response(
                data={"error": "PDF 형식은 아직 구현되지 않았습니다"},
                status_code=501
            )

        # 기본 JSON 형식
        return create_response(data=report_data)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"차량 보고서 생성 중 오류 발생: {str(e)}",
        )
