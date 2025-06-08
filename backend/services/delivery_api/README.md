# Delivery API

차량 탁송 및 배송 관리를 위한 API 서비스입니다.

## 개요

Delivery API는 차량 탁송, 배송 일정 관리, 기사 관리, 경로 관리 등의 기능을 제공합니다.

## 주요 기능

- 탁송 주문 관리 (등록, 조회, 수정, 취소)
- 탁송 기사 관리 및 일정 관리
- 배송 경로 관리 및 최적화
- 탁송 이력 및 로그 관리

## API 엔드포인트

### 탁송 관리

- `GET /api/deliveries` - 탁송 목록 조회
- `GET /api/deliveries/{id}` - 탁송 상세 조회
- `POST /api/deliveries` - 탁송 등록
- `PATCH /api/deliveries/{id}` - 탁송 정보 수정
- `DELETE /api/deliveries/{id}` - 탁송 삭제
- `PATCH /api/deliveries/{id}/assign` - 기사 배정
- `PATCH /api/deliveries/{id}/status` - 상태 업데이트
- `PATCH /api/deliveries/{id}/complete` - 탁송 완료 처리
- `PATCH /api/deliveries/{id}/cancel` - 탁송 취소 처리

### 기사 일정 관리

- `GET /api/drivers/schedules` - 기사 일정 목록 조회
- `GET /api/drivers/schedules/{id}` - 기사 일정 상세 조회
- `POST /api/drivers/schedules` - 기사 일정 등록
- `PATCH /api/drivers/schedules/{id}` - 기사 일정 수정
- `DELETE /api/drivers/schedules/{id}` - 기사 일정 삭제

### 경로 관리

- `GET /api/deliveries/{id}/routes` - 탁송 경로 조회
- `POST /api/deliveries/{id}/routes` - 경로 포인트 추가

### 이력 관리

- `GET /api/deliveries/{id}/logs` - 탁송 로그 조회

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
delivery-api/
  lib/                    # 핵심 소스 코드
    routes/               # API 라우트
      delivery_routes.py  # 탁송 API 라우트
    models/               # 데이터 모델
    services/             # 비즈니스 로직
    utils/                # 유틸리티 함수
    server.py             # 서버 설정 및 초기화
  tests/                  # 테스트 코드
    unit/                 # 단위 테스트
    integration/          # 통합 테스트
  main.py                 # 앱 진입점
  requirements.txt        # 의존성 파일
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
