# 리팩토링 실행 가이드

이 문서는 카고로 백엔드 코드베이스 리팩토링 실행 과정을 단계별로 안내합니다.

## 1. 개요

리팩토링의 주요 목표는 다음과 같습니다:

1. Python 코드의 변수명을 snake_case로 통일
2. 모든 API 엔드포인트에 표준 응답 형식 적용
3. TypeScript와 Python 코드의 역할 명확히 구분

## 2. 준비 단계

### 2.1 리팩토링 브랜치 생성

```bash
cd /Users/gongchanghyeon/Desktop/cargoro/monorepo-root
git checkout -b refactor/python-snake-case
```

### 2.2 필요한 도구 설치

```bash
pip install black isort pylint mypy
```

### 2.3 기존 코드 분석

변환이 필요한 파일을 식별합니다:

```bash
# camelCase 패턴이 있는 Python 파일 찾기
python scripts/convert_camel_to_snake.py backend/services --dry-run --recursive
```

## 3. 코드 변환 단계

### 3.1 모델 파일 변환

우선순위가 높은 모델 파일부터 변환합니다:

```bash
# 주요 모델 파일 변환
python scripts/convert_camel_to_snake.py backend/services/fleet_api/lib/models/driver.py -o backend/services/fleet_api/lib/models/driver_new.py
python scripts/convert_camel_to_snake.py backend/services/fleet_api/lib/models/vehicle.py -o backend/services/fleet_api/lib/models/vehicle_new.py
python scripts/convert_camel_to_snake.py backend/services/parts_api/lib/models/erp_sync.py -o backend/services/parts_api/lib/models/erp_sync_new.py

# 추가 모델 파일 변환
python scripts/convert_camel_to_snake.py backend/services/repair_api/lib/models/models.py -o backend/services/repair_api/lib/models/models_new.py
python scripts/convert_camel_to_snake.py backend/services/parts_api/lib/models/part.py -o backend/services/parts_api/lib/models/part_new.py
python scripts/convert_camel_to_snake.py backend/services/core_api/lib/models/models.py -o backend/services/core_api/lib/models/models_new.py
```

### 3.2 API 라우터 파일 변환

모델 파일 변환 후 관련 API 라우터 파일을 변환합니다:

```bash
# 주요 API 라우터 파일 변환
python scripts/convert_camel_to_snake.py backend/services/fleet_api/lib/routes/driver_routes.py -o backend/services/fleet_api/lib/routes/driver_routes_new.py
python scripts/convert_camel_to_snake.py backend/services/fleet_api/lib/routes/vehicle_routes.py -o backend/services/fleet_api/lib/routes/vehicle_routes_new.py
```

### 3.3 DB 필드 변환 로직 추가

변환된 파일에서 Prisma DB 필드 접근 시 변환 로직을 추가합니다:

```python
# 예시: 모델에서 DB로 변환
from ..utils.model_conversion import model_to_db_dict

vehicle_db_data = model_to_db_dict(vehicle)
created_vehicle = await prisma.vehicle.create(data=vehicle_db_data)
```

### 3.4 표준 응답 형식 적용

모든 API 엔드포인트에 표준 응답 형식을 적용합니다:

```python
# 응답 모델 수정
@router.get("/{vehicle_id}", response_model=ApiResponse[VehicleResponse])

# 응답 생성
return create_response(
    data=vehicle,
    message="차량 정보가 성공적으로 조회되었습니다."
)
```

## 4. 테스트 단계

### 4.1 단위 테스트 업데이트

변환된 파일에 대한 단위 테스트를 업데이트합니다:

```bash
# 특정 테스트 실행
cd backend
python -m pytest tests/unit/fleet/test_vehicle_routes.py -v
```

### 4.2 통합 테스트 실행

전체 시스템 통합 테스트를 실행합니다:

```bash
cd backend
python -m pytest tests/integration/fleet/test_vehicle_api.py -v
```

## 5. 점진적 적용 단계

### 5.1 서버 구성 파일 업데이트

`server.py` 파일을 수정하여 새로운 라우터를 등록합니다:

```python
# 기존 라우터 대신 새 라우터 사용
from .routes.driver_routes_new import router as driver_router
from .routes.vehicle_routes_new import router as vehicle_router

app.include_router(driver_router)
app.include_router(vehicle_router)
```

### 5.2 로컬 환경 테스트

개발 환경에서 변경 사항을 테스트합니다:

```bash
cd backend
uvicorn services.fleet_api.lib.server:app --reload
```

### 5.3 기존 파일 이름 변경

모든 테스트가 통과하면 파일 이름을 변경합니다:

```bash
# 기존 파일 백업
mv backend/services/fleet_api/lib/models/driver.py backend/services/fleet_api/lib/models/driver.py.bak
mv backend/services/fleet_api/lib/routes/driver_routes.py backend/services/fleet_api/lib/routes/driver_routes.py.bak

# 새 파일로 대체
mv backend/services/fleet_api/lib/models/driver_new.py backend/services/fleet_api/lib/models/driver.py
mv backend/services/fleet_api/lib/routes/driver_routes_new.py backend/services/fleet_api/lib/routes/driver_routes.py
```

## 6. 최종 검증 단계

### 6.1 전체 테스트 실행

```bash
cd backend
python run_tests.py
```

### 6.2 코드 품질 검사

```bash
black backend/services/fleet_api
isort backend/services/fleet_api
pylint backend/services/fleet_api
```

### 6.3 변경 사항 커밋

```bash
git add .
git commit -m "refactor: Convert Python camelCase to snake_case"
git push origin refactor/python-snake-case
```

## 7. 문서화 및 공유

### 7.1 리팩토링 보고서 업데이트

`docs/migration/backend-refactoring-report.md` 파일을 업데이트합니다.

### 7.2 개발 팀 공유

변경 사항을 팀에 공유하고 Pull Request를 생성합니다.
