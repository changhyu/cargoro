# Fleet API 라우터 패키지
from . import (
    vehicle_routes,
    contract_routes,
    location_routes,
    driver_routes,
    maintenance_routes,
    driver_performance_routes,
    driving_record_routes,
    lease_routes,  # 리스/렌탈 라우터 추가
)

__all__ = [
    "vehicle_routes",
    "contract_routes",
    "location_routes",
    "driver_routes",
    "maintenance_routes",
    "driver_performance_routes",
    "driving_record_routes",
    "lease_routes",  # 리스/렌탈 라우터 추가
]
