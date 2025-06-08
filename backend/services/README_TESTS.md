# 백엔드 서비스 테스트 가이드

이 문서는 백엔드 서비스의 테스트 작성 및 실행에 대한 가이드를 제공합니다.

## 테스트 구조

각 서비스는 다음과 같은 테스트 구조를 가집니다:

```
services/
  {service_name}/
    tests/
      unit/            # 단위 테스트
      integration/     # 통합 테스트
      conftest.py      # 테스트 설정 및 fixture
```

## 테스트 종류

### 단위 테스트 (Unit Tests)

- 개별 함수, 클래스, 모듈의 기능을 테스트합니다.
- 외부 의존성은 모킹(mocking)하여 격리된 환경에서 테스트합니다.
- 파일명 패턴: `test_{module_name}_unit.py`

### 통합 테스트 (Integration Tests)

- 여러 컴포넌트 간의 상호작용을 테스트합니다.
- 실제 의존성과 함께 테스트하거나 일부만 모킹합니다.
- 파일명 패턴: `test_{feature_name}_integration.py`

## 테스트 작성 가이드

### Python (FastAPI) 서비스 테스트

Python으로 작성된 서비스는 pytest를 사용하여 테스트합니다.

#### 예시 (단위 테스트)

```python
import pytest
from fastapi import HTTPException

# 테스트할 함수 임포트
from my_service.handlers import my_function

@pytest.mark.asyncio
async def test_my_function_success(mock_db):
    # 준비: 모의 데이터 설정
    mock_db.my_table.find_unique.return_value = {"id": "123", "name": "테스트"}

    # 실행
    result = await my_function("123", mock_db)

    # 검증
    mock_db.my_table.find_unique.assert_called_once_with(where={"id": "123"})
    assert result["status"] == "success"
    assert result["data"]["name"] == "테스트"
```

### JavaScript/TypeScript (Express) 서비스 테스트

JavaScript/TypeScript로 작성된 서비스는 Mocha/Chai와 Sinon을 사용하여 테스트합니다.

#### 예시 (단위 테스트)

```typescript
import { expect } from 'chai';
import sinon from 'sinon';
import { MyController } from '../../lib/controllers/my.controller';

describe('MyController', () => {
  let controller;
  let serviceStub;

  beforeEach(() => {
    serviceStub = {
      getItem: sinon.stub(),
    };
    controller = new MyController(serviceStub);
  });

  it('should return item by id', async () => {
    // 준비
    const req = { params: { id: '123' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    serviceStub.getItem.resolves({ id: '123', name: '테스트' });

    // 실행
    await controller.getItemById(req, res);

    // 검증
    expect(serviceStub.getItem).to.have.been.calledWith('123');
    expect(res.status).to.have.been.calledWith(200);
    expect(res.json).to.have.been.calledWith({ id: '123', name: '테스트' });
  });
});
```

## 테스트 실행

### 특정 서비스의 모든 테스트 실행

```bash
cd backend
pytest services/{service_name}/tests
```

### 특정 서비스의 단위 테스트만 실행

```bash
cd backend
pytest services/{service_name}/tests/unit
```

### 테스트 커버리지 확인

```bash
cd backend
pytest services/{service_name}/tests --cov=services/{service_name} --cov-report=html
```

## 작성된 테스트 파일

- vehicle 서비스

  - `tests/unit/test_vehicle_handlers_unit.py`
  - `tests/unit/test_vehicle_assignment_unit.py`

- workshop 서비스

  - `tests/unit/test_workshop_handlers_unit.py`

- users 서비스
  - `tests/unit/test_user_controller.ts`
  - `tests/unit/test_user_service.ts`

## 참고사항

- 모든 테스트는 독립적으로 실행될 수 있어야 합니다.
- 외부 의존성은 모킹하여 테스트의 안정성을 확보합니다.
- 단위 테스트에서는 한 번에 하나의 기능만 테스트합니다.
- 테스트 코드는 "준비(Arrange) → 실행(Act) → 검증(Assert)" 패턴을 따릅니다.
