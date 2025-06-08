"""
표준화된 모킹 유틸리티

이 모듈은 테스트에서 사용할 수 있는 표준화된 모킹 기능을 제공합니다.
데이터베이스 접근, 외부 API 호출 등을 모킹하는 기능을 제공합니다.
"""

import json
import uuid
import importlib
import inspect
from typing import Any, Dict, List, Optional, Union
from unittest.mock import MagicMock, AsyncMock
from datetime import datetime


class MockModel:
    """모킹된 모델의 기본 클래스"""

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

    def dict(self):
        """딕셔너리 형태로 변환"""
        # datetime 객체들을 ISO 문자열로 변환
        result = {}
        for k, v in self.__dict__.items():
            if not k.startswith("_"):
                if isinstance(v, datetime):
                    result[k] = v.isoformat()
                elif hasattr(v, "dict") and callable(v.dict):
                    # 다른 MockModel 객체인 경우
                    result[k] = v.dict()
                elif isinstance(v, list):
                    # 리스트인 경우 각 항목 처리
                    result[k] = [
                        (
                            item.dict()
                            if hasattr(item, "dict") and callable(item.dict)
                            else (
                                item.isoformat() if isinstance(item, datetime) else item
                            )
                        )
                        for item in v
                    ]
                else:
                    result[k] = v
        return result

    def model_dump(self, **kwargs):
        """Pydantic 스타일의 model_dump 메서드"""
        return self.dict()

    def model_dump_json(self, **kwargs):
        """Pydantic 스타일의 JSON 직렬화"""
        return json.dumps(self.dict())

    def json(self):
        """JSON 문자열로 변환"""
        return json.dumps(self.dict())

    def __json__(self):
        """JSON 직렬화를 위한 메서드"""
        return self.dict()

    def __iter__(self):
        """JSON 직렬화를 위한 반복자 메서드 - 키들만 반환"""
        return iter(k for k in self.__dict__.keys() if not k.startswith("_"))

    def __getstate__(self):
        """pickle 직렬화를 위한 메서드"""
        return self.dict()

    def __setstate__(self, state):
        """pickle 역직렬화를 위한 메서드"""
        self.__dict__.update(state)

    def keys(self):
        """딕셔너리 스타일의 keys() 메서드"""
        return [k for k in self.__dict__.keys() if not k.startswith("_")]

    def values(self):
        """딕셔너리 스타일의 values() 메서드"""
        return [v for k, v in self.__dict__.items() if not k.startswith("_")]

    def items(self):
        """딕셔너리 스타일의 items() 메서드"""
        return [(k, v) for k, v in self.__dict__.items() if not k.startswith("_")]

    def __getitem__(self, key):
        """딕셔너리 스타일의 항목 접근"""
        if key.startswith("_"):
            raise KeyError(key)
        return getattr(self, key)

    def __setitem__(self, key, value):
        """딕셔너리 스타일의 항목 설정"""
        setattr(self, key, value)

    def __contains__(self, key):
        """딕셔너리 스타일의 키 존재 확인"""
        return hasattr(self, key) and not key.startswith("_")

    def get(self, key, default=None):
        """딕셔너리 스타일로 속성값 조회. 없으면 기본값 반환"""
        return getattr(self, key, default)

    def __getattr__(self, name):
        """속성이 없을 때 호출되는 메서드. 없는 속성 접근 시 None 반환"""
        # scheduledDate.date() 같은 호출을 위한 특별 처리
        if name == "date":
            # scheduledDate 속성이 있고 datetime 객체라면 date 메서드 반환
            scheduled_date = getattr(self, "scheduledDate", None)
            if scheduled_date and hasattr(scheduled_date, "date"):
                return scheduled_date.date
        return None


class MockUser(MockModel):
    """사용자 모델 모킹"""

    def __init__(
        self,
        id: Optional[str] = None,
        email: Optional[str] = None,
        fullName: Optional[str] = None,
        role: Optional[str] = None,
        isActive: bool = True,
        createdAt: Optional[datetime] = None,
        updatedAt: Optional[datetime] = None,
        **kwargs,
    ):
        self.id = id or str(uuid.uuid4())
        # fullName이 None인 경우에 대한 처리 추가
        if email:
            self.email = email
        elif fullName:
            self.email = f"{fullName.replace(' ', '').lower()}@cargoro.com"
        else:
            self.email = f"user-{self.id[:8]}@cargoro.com"
        self.fullName = fullName or "이름 없음"
        self.role = role
        self.isActive = isActive
        self.createdAt = createdAt or datetime.now()
        self.updatedAt = updatedAt or datetime.now()
        super().__init__(**kwargs)


class MockVehicle(MockModel):
    """차량 모델 모킹"""

    def __init__(
        self,
        id: Optional[str] = None,
        registrationNumber: Optional[str] = None,
        brand: Optional[str] = None,
        model: Optional[str] = None,
        year: Optional[int] = None,
        vin: Optional[str] = None,
        type: Optional[str] = None,
        color: Optional[str] = None,
        fuelType: str = "GASOLINE",
        status: str = "ACTIVE",
        currentMileage: int = 0,
        ownerId: Optional[str] = None,
        createdAt: Optional[datetime] = None,
        updatedAt: Optional[datetime] = None,
        statusHistory: Optional[List[Dict[str, Any]]] = None,
        mileageHistory: Optional[List[Dict[str, Any]]] = None,
        **kwargs,
    ):
        self.id = id or str(uuid.uuid4())
        self.registrationNumber = registrationNumber
        self.brand = brand
        self.model = model
        self.year = year
        self.vin = vin or f"VIN{uuid.uuid4().hex[:15]}"
        self.type = type
        self.color = color
        self.fuelType = fuelType
        self.status = status
        self.currentMileage = currentMileage
        self.ownerId = ownerId
        self.createdAt = createdAt or datetime.now()
        self.updatedAt = updatedAt or datetime.now()
        self.statusHistory = statusHistory or []
        self.mileageHistory = mileageHistory or []
        super().__init__(**kwargs)


class MockRepairRecord(MockModel):
    """정비 기록 모델 모킹"""

    def __init__(
        self,
        id: Optional[str] = None,
        vehicleId: Optional[str] = None,
        workshopId: Optional[str] = None,
        description: Optional[str] = None,
        startDate: Optional[datetime] = None,
        endDate: Optional[datetime] = None,
        status: str = "COMPLETED",
        cost: float = 0.0,
        mileage: Optional[int] = None,
        technicianId: Optional[str] = None,
        createdAt: Optional[datetime] = None,
        updatedAt: Optional[datetime] = None,
        **kwargs,
    ):
        self.id = id or str(uuid.uuid4())
        self.vehicleId = vehicleId
        self.workshopId = workshopId
        self.description = description
        self.startDate = startDate or datetime.now()
        self.endDate = endDate
        self.status = status
        self.cost = cost
        self.mileage = mileage
        self.technicianId = technicianId
        self.createdAt = createdAt or datetime.now()
        self.updatedAt = updatedAt or datetime.now()
        super().__init__(**kwargs)


class MockWorkshop(MockModel):
    """정비소 모델 모킹"""

    def __init__(
        self,
        id: Optional[str] = None,
        name: Optional[str] = None,
        address: Optional[str] = None,
        phone: Optional[str] = None,
        email: Optional[str] = None,
        manager: Optional[str] = None,
        isActive: bool = True,
        createdAt: Optional[datetime] = None,
        updatedAt: Optional[datetime] = None,
        **kwargs,
    ):
        self.id = id or str(uuid.uuid4())
        self.name = name
        self.address = address
        self.phone = phone
        self.email = email
        self.manager = manager
        self.isActive = isActive
        self.createdAt = createdAt or datetime.now()
        self.updatedAt = updatedAt or datetime.now()
        super().__init__(**kwargs)


class MockRepair(MockModel):
    """정비 기록 모델 모킹"""

    def __init__(
        self,
        id: Optional[str] = None,
        vehicleId: Optional[str] = None,
        workshopId: Optional[str] = None,
        customerId: Optional[str] = None,
        description: Optional[str] = None,
        status: str = "SCHEDULED",
        priority: str = "NORMAL",
        startDate: Optional[datetime] = None,
        endDate: Optional[datetime] = None,
        scheduledDate: Optional[datetime] = None,  # 추가된 필드
        estimatedCost: float = 0.0,
        actualCost: Optional[float] = None,
        technicianId: Optional[str] = None,
        diagnosticNotes: Optional[str] = None,
        requiredParts: Optional[List[Dict[str, Any]]] = None,
        partsActual: Optional[List[Dict[str, Any]]] = None,
        laborEstimate: Optional[Dict[str, Any]] = None,
        laborActual: Optional[Dict[str, Any]] = None,
        statusHistory: Optional[List[Dict[str, Any]]] = None,
        scheduleHistory: Optional[List[Dict[str, Any]]] = None,
        technicianNotes: Optional[str] = None,
        totalEstimate: float = 50000,  # 기본값 설정
        totalActual: float = 250000,  # 기본값 설정
        cancelledBy: Optional[str] = None,
        cancelledAt: Optional[datetime] = None,
        cancellationReason: Optional[str] = None,
        actualCompletionDate: Optional[datetime] = None,
        createdAt: Optional[datetime] = None,
        updatedAt: Optional[datetime] = None,
        **kwargs,
    ):
        self.id = id or str(uuid.uuid4())
        self.vehicleId = vehicleId
        self.workshopId = workshopId
        self.customerId = customerId
        self.description = description
        self.status = status
        self.priority = priority
        self.startDate = startDate or datetime.now()
        self.endDate = endDate
        self.scheduledDate = scheduledDate or datetime.now()  # 추가된 필드 초기화
        self.estimatedCost = estimatedCost
        self.actualCost = actualCost
        self.technicianId = technicianId
        self.diagnosticNotes = diagnosticNotes
        self.requiredParts = requiredParts or []
        self.partsActual = partsActual or []
        self.laborEstimate = laborEstimate or {}
        self.laborActual = laborActual or {}
        self.statusHistory = statusHistory or []
        self.scheduleHistory = scheduleHistory or []
        self.technicianNotes = technicianNotes
        self.totalEstimate = totalEstimate
        self.totalActual = totalActual
        self.cancelledBy = cancelledBy
        self.cancelledAt = cancelledAt
        self.cancellationReason = cancellationReason
        self.actualCompletionDate = actualCompletionDate
        self.createdAt = createdAt or datetime.now()
        self.updatedAt = updatedAt or datetime.now()
        super().__init__(**kwargs)


class MockHandlerModule:
    """핸들러 모듈 모킹 클래스"""

    def __init__(self, module_path: str):
        self.module_path = module_path
        self._functions = {}
        self._load_real_functions()

    def _load_real_functions(self):
        """실제 모듈에서 함수들을 로드하여 모킹"""
        try:
            # 실제 모듈 임포트 시도
            module = importlib.import_module(self.module_path)

            # 모듈의 모든 함수를 찾아서 모킹된 버전 생성
            for name, obj in inspect.getmembers(module, inspect.isfunction):
                if not name.startswith("_"):  # private 함수 제외
                    # 비동기 함수인지 확인
                    if inspect.iscoroutinefunction(obj):
                        self._functions[name] = AsyncMock(
                            return_value={"success": True}
                        )
                    else:
                        self._functions[name] = MagicMock(
                            return_value={"success": True}
                        )

        except ImportError as e:
            # 모듈을 임포트할 수 없는 경우 기본 함수들만 생성
            default_functions = [
                "create_repair_job",
                "update_repair_job",
                "update_repair_status",
                "get_repair_job",
                "list_repair_jobs",
                "delete_repair_job",
                "get_vehicle",
                "get_vehicles_by_owner",
                "list_vehicles",
                "create_vehicle",
                "update_vehicle",
                "delete_vehicle",
            ]

            for func_name in default_functions:
                self._functions[func_name] = AsyncMock(return_value={"success": True})

    def __getattr__(self, name):
        """속성 접근 시 모킹된 함수 반환"""
        if name in self._functions:
            return self._functions[name]

        # 함수가 없는 경우 새로 생성
        self._functions[name] = AsyncMock(return_value={"success": True})
        return self._functions[name]


class MockMethodWrapper:
    """Mock 메서드를 래핑하여 assert_not_called 기능 제공"""

    def __init__(self, method, method_name, call_history):
        self.method = method
        self.method_name = method_name
        self.call_history = call_history

    async def __call__(self, *args, **kwargs):
        return await self.method(*args, **kwargs)

    def assert_not_called(self):
        """메서드가 호출되지 않았는지 확인"""
        calls = self.call_history.get(self.method_name, [])
        if calls:
            raise AssertionError(
                f"Expected '{self.method_name}' not to be called, but was called {len(calls)} times."
            )

    def assert_called_once(self):
        """메서드가 정확히 한 번 호출되었는지 확인"""
        calls = self.call_history.get(self.method_name, [])
        if len(calls) != 1:
            raise AssertionError(
                f"Expected '{self.method_name}' to be called once. Called {len(calls)} times."
            )


class MockPrismaModel(AsyncMock):
    """Prisma 모델 작업 모킹 (비동기 지원)"""

    def __init__(self, name: str, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.name = name
        self._mock_data = []
        self._call_history = {}

        # 각 메서드를 MockMethodWrapper로 래핑
        self.find_unique = MockMethodWrapper(
            self._find_unique, "find_unique", self._call_history
        )
        self.find_first = MockMethodWrapper(
            self._find_first, "find_first", self._call_history
        )
        self.find_many = MockMethodWrapper(
            self._find_many, "find_many", self._call_history
        )
        self.create = MockMethodWrapper(self._create, "create", self._call_history)
        self.update = MockMethodWrapper(self._update, "update", self._call_history)
        self.delete = MockMethodWrapper(self._delete, "delete", self._call_history)
        self.count = MockMethodWrapper(self._count, "count", self._call_history)
        self.aggregate = MockMethodWrapper(
            self._aggregate, "aggregate", self._call_history
        )

    def setup_mock_data(self, data: List[Dict[str, Any]]):
        """모의 데이터 설정"""
        self._mock_data = data
        return self

    async def _find_unique(self, **kwargs):
        """단일 레코드 조회 (비동기)"""
        self._record_call("find_unique", kwargs)
        where = kwargs.get("where", {})
        for record in self._mock_data:
            match = True
            for key, value in where.items():
                if key not in record or record[key] != value:
                    match = False
                    break
            if match:
                return self._create_model_instance(record)
        return None

    async def _find_first(self, **kwargs):
        """첫 번째 일치 레코드 조회 (비동기)"""
        self._record_call("find_first", kwargs)
        where = kwargs.get("where", {})
        for record in self._mock_data:
            match = True
            for key, value in where.items():
                if key not in record or record[key] != value:
                    match = False
                    break
            if match:
                return self._create_model_instance(record)
        return None

    async def _find_many(self, **kwargs):
        """다수 레코드 조회 (비동기)"""
        self._record_call("find_many", kwargs)
        where = kwargs.get("where", {})
        results = []

        for record in self._mock_data:
            match = True
            for key, value in where.items():
                if key not in record:
                    match = False
                    break

                # 복잡한 쿼리 조건 처리
                if isinstance(value, dict):
                    if "in" in value:
                        # status: {"in": ["SCHEDULED", "IN_PROGRESS"]} 같은 조건
                        if record[key] not in value["in"]:
                            match = False
                            break
                    elif "gte" in value or "lte" in value:
                        record_value = record[key]
                        if "gte" in value and record_value < value["gte"]:
                            match = False
                            break
                        if "lte" in value and record_value > value["lte"]:
                            match = False
                            break
                elif record[key] != value:
                    match = False
                    break

            if match:
                results.append(self._create_model_instance(record))

        # orderBy 처리
        order_by = kwargs.get("orderBy")
        if order_by and results:
            for field, direction in order_by.items():
                reverse = direction == "desc"
                # 타입 안전한 정렬을 위해 None 값을 처리
                results.sort(key=lambda x: getattr(x, field, 0) or 0, reverse=reverse)

        # skip & take 처리
        skip = kwargs.get("skip", 0)
        take = kwargs.get("take")

        if skip:
            results = results[skip:]
        if take is not None:
            results = results[:take]

        return results

    async def _create(self, **kwargs):
        """레코드 생성 (비동기)"""
        self._record_call("create", kwargs)
        data = kwargs.get("data", {})

        # UUID 처리 (id가 없는 경우에만)
        if "id" not in data:
            uuid_obj = uuid.uuid4()
            data["id"] = uuid_obj.hex if hasattr(uuid_obj, "hex") else str(uuid_obj)

        # 모의 데이터에 추가
        self._mock_data.append(data.copy())

        # 모델 인스턴스 생성
        new_record = self._create_model_instance(data)
        return new_record

    async def _update(self, **kwargs):
        """레코드 업데이트 (비동기)"""
        self._record_call("update", kwargs)
        where = kwargs.get("where", {})
        data = kwargs.get("data", {})

        for i, record in enumerate(self._mock_data):
            match = True
            for key, value in where.items():
                if key not in record or record[key] != value:
                    match = False
                    break
            if match:
                # 기존 레코드 업데이트
                self._mock_data[i].update(data)
                return self._create_model_instance(self._mock_data[i])
        return None

    async def _delete(self, **kwargs):
        """레코드 삭제 (비동기)"""
        self._record_call("delete", kwargs)
        where = kwargs.get("where", {})

        for i, record in enumerate(self._mock_data):
            match = True
            for key, value in where.items():
                if key not in record or record[key] != value:
                    match = False
                    break
            if match:
                deleted_record = self._mock_data.pop(i)
                return self._create_model_instance(deleted_record)
        return None

    async def _count(self, **kwargs):
        """레코드 개수 조회 (비동기)"""
        self._record_call("count", kwargs)
        where = kwargs.get("where", {})
        count = 0

        for record in self._mock_data:
            match = True
            for key, value in where.items():
                if key not in record or record[key] != value:
                    match = False
                    break
            if match:
                count += 1

        return count

    async def _aggregate(self, **kwargs):
        """집계 쿼리 (비동기)"""
        self._record_call("aggregate", kwargs)
        # 기본적인 집계 결과 반환
        return {"_count": {"_all": len(self._mock_data)}}

    def _record_call(self, method_name: str, kwargs: Dict[str, Any]):
        """메서드 호출 기록"""
        if method_name not in self._call_history:
            self._call_history[method_name] = []

        # 스택 추적으로 호출 위치 확인
        import traceback

        frame_info = traceback.extract_stack()
        for frame in frame_info:
            if frame.filename and "test" in frame.filename:
                call_info = {
                    "args": kwargs,
                    "file": frame.filename,
                    "line": frame.lineno,
                    "function": frame.name,
                }

                # 코드 컨텍스트가 있는 경우에만 method 체크
                if hasattr(frame, "line") and frame.line and method_name in frame.line:
                    call_info["method"] = method_name

                self._call_history[method_name].append(call_info)
                break

    def _create_model_instance(self, data: Dict[str, Any]) -> MockModel:
        """데이터로부터 모델 인스턴스 생성"""
        return MockModel(**data)


class MockDbCollection:
    """데이터베이스 컬렉션 모킹"""

    def __init__(self, name: str):
        self.name = name
        self.items = []
        self.last_query: Optional[Dict[str, Any]] = None

    def add_collection(self, name: str, items: Optional[List[Any]] = None):
        """컬렉션에 항목들 추가"""
        if items is None:
            items = []
        self.items.extend(items)
        return self

    def filter(self, **kwargs):
        """필터링 수행"""
        if self.last_query is None:
            self.last_query = {}
        self.last_query["filter"] = str(kwargs)  # 문자열로 변환

        # 실제 필터링 로직
        result = [item for item in self.items if self._matches_filter(item, kwargs)]
        self.last_query["result_count"] = str(len(result))  # 문자열로 변환
        return result

    def first(self):
        """첫 번째 항목 반환"""
        if self.last_query is None:
            self.last_query = {}
        items = self.items
        self.last_query["result"] = str(items[0]) if items else "None"  # 문자열로 변환
        return items[0] if items else None

    def _matches_filter(self, item: Any, filters: Dict[str, Any]) -> bool:
        """항목이 필터 조건과 일치하는지 확인"""
        for key, value in filters.items():
            if not hasattr(item, key) or getattr(item, key) != value:
                return False
        return True
