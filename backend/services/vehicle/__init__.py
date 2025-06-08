"""
차량 서비스 패키지

이 패키지는 차량 관리 관련 API 서비스를 제공합니다.
"""

from .handlers import (
    get_vehicle,
    list_vehicles,
    create_vehicle,
    update_vehicle,
    delete_vehicle,
    get_vehicles_by_owner,
    get_vehicles_by_type,
    assign_vehicle,
    update_vehicle_status,
    update_vehicle_mileage,
    get_vehicle_maintenance_history,
    # 추가 누락된 함수들
    record_mileage,
    get_vehicle_statistics,
    assign_driver_to_vehicle,
    unassign_driver_from_vehicle,
    get_vehicle_assignment_history,
    get_fleet_analytics,
    get_vehicle_report,
)

__all__ = [
    "get_vehicle",
    "list_vehicles",
    "create_vehicle",
    "update_vehicle",
    "delete_vehicle",
    "get_vehicles_by_owner",
    "get_vehicles_by_type",
    "assign_vehicle",
    "update_vehicle_status",
    "update_vehicle_mileage",
    "get_vehicle_maintenance_history",
    "record_mileage",
    "get_vehicle_statistics",
    "assign_driver_to_vehicle",
    "unassign_driver_from_vehicle",
    "get_vehicle_assignment_history",
    "get_fleet_analytics",
    "get_vehicle_report",
]
