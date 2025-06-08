# 모델 내보내기
from .vehicle import (
    VehicleCreate,
    VehicleUpdate,
    VehicleResponse,
    VehicleStatus,
    VehicleType,
)
from .contract import (
    ContractCreate,
    ContractUpdate,
    ContractResponse,
    ContractStatus,
    ContractType,
    ContractPaymentCreate,
    ContractPaymentUpdate,
    ContractPaymentResponse,
)
from .location import (
    VehicleLocationCreate,
    VehicleLocationUpdate,
    VehicleLocationResponse,
    LocationStatus,
)

# 차량 배정 관련 모델 추가
from .assignment import (
    VehicleAssignmentBase,
    VehicleAssignmentCreate,
    VehicleAssignmentUpdate,
    VehicleAssignmentResponse,
)
