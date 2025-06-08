"""Shared models __init__.py"""

# repair 모듈에서 임포트
try:
    from .repair import RepairJob, RepairStatus
except ImportError:
    # 모킹된 환경에서는 기본값 제공
    from unittest.mock import MagicMock

    RepairJob = MagicMock
    RepairStatus = MagicMock

# vehicle 모듈에서 임포트
try:
    from .vehicle import Vehicle, VehicleStatus
except ImportError:
    # 모킹된 환경에서는 기본값 제공
    from unittest.mock import MagicMock

    Vehicle = MagicMock
    VehicleStatus = MagicMock

__all__ = ["RepairJob", "RepairStatus", "Vehicle", "VehicleStatus"]
