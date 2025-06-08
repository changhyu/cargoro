# Fleet API

차량 관리 시스템을 위한 API 서비스입니다.

## 개요

Fleet API는 차량 관리, 계약 관리, 운전자 관리, 주행 기록 관리 등의 기능을 제공합니다.

## 주요 기능

- 차량 정보 관리 (등록, 조회, 수정, 삭제)
- 차량 위치 및 상태 추적
- 차량 리스/렌트 계약 관리
- 차량 배정 및 운행 이력 관리

## API 엔드포인트

### 차량 관리

- `GET /api/vehicles` - 차량 목록 조회
- `GET /api/vehicles/{id}` - 차량 상세 조회
- `POST /api/vehicles` - 차량 등록
- `PATCH /api/vehicles/{id}` - 차량 정보 수정
- `DELETE /api/vehicles/{id}` - 차량 삭제

### 계약 관리

- `GET /api/contracts` - 계약 목록 조회
- `GET /api/contracts/{id}` - 계약 상세 조회
- `POST /api/contracts` - 계약 등록
- `PATCH /api/contracts/{id}` - 계약 정보 수정
- `DELETE /api/contracts/{id}` - 계약 삭제

### 위치 추적

- `GET /api/locations/{vehicle_id}` - 차량 현재 위치 조회
- `GET /api/locations/{vehicle_id}/history` - 차량 위치 이력 조회

## 의존성

- FastAPI
- Prisma (ORM)
- Pydantic
- 공유 유틸리티 (shared/)

## 설치 및 실행

```bash
# 의존성 설치
pip install -r requirements.txt

# 개발 서버 실행
python main.py
```

## 개발 가이드

### 디렉토리 구조

```
fleet-api/
  lib/                  # 핵심 소스 코드
    routes/             # API 라우트
      vehicle_routes.py # 차량 API 라우트
      contract_routes.py # 계약 API 라우트
    models/             # 데이터 모델
    services/           # 비즈니스 로직
    utils/              # 유틸리티 함수
    server.py           # 서버 설정 및 초기화
  tests/                # 테스트 코드
    unit/               # 단위 테스트
    integration/        # 통합 테스트
  main.py               # 앱 진입점
  requirements.txt      # 의존성 파일
```

### 코드 작성 가이드

1. 모든 API 라우트는 `lib/routes/` 디렉토리에 위치해야 합니다.
2. 모든 API 응답은 표준 응답 형식을 따라야 합니다.
3. 공통 유틸리티는 `shared/` 디렉토리의 코드를 사용해야 합니다.

## 테스트

```bash
# 단위 테스트 실행
pytest tests/unit

# 통합 테스트 실행
pytest tests/integration

# 전체 테스트 실행
pytest
```

## 문서화

API 문서는 다음 URL에서 확인할 수 있습니다:

- Swagger UI: `/api-docs`
- ReDoc: `/api-redoc`
