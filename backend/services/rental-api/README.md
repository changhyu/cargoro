# CarGoro 렌터카/리스 관리 API

FastAPI 기반의 렌터카 및 리스 계약 관리 백엔드 서비스입니다.

## 기능

- **차량 관리**: 차량 등록, 상태 관리, 주행거리 추적
- **고객 관리**: 개인/법인 고객 등록, 신용 평가, 검증
- **렌탈 계약**: 단기/장기 렌탈 계약 생성 및 관리
- **리스 계약**: 운용/금융 리스 계약 관리
- **예약 시스템**: 차량 예약 및 스케줄 관리
- **결제 관리**: 청구서 발행, 결제 처리, 연체 관리

## 기술 스택

- **프레임워크**: FastAPI
- **데이터베이스**: PostgreSQL + SQLAlchemy
- **검증**: Pydantic v2
- **인증**: JWT (준비 중)

## 설치 및 실행

### 1. 가상환경 생성

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### 2. 의존성 설치

```bash
pip install -r requirements.txt
```

### 3. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일을 열어 데이터베이스 정보 등을 설정
```

### 4. 데이터베이스 설정

PostgreSQL 데이터베이스를 생성하고 .env 파일에 연결 정보를 입력합니다.

```sql
CREATE DATABASE cargoro_rental;
```

### 5. 서버 실행

```bash
python main.py
```

서버가 실행되면 다음 URL에서 확인할 수 있습니다:

- API: http://localhost:8004
- API 문서 (Swagger): http://localhost:8004/docs
- API 문서 (ReDoc): http://localhost:8004/redoc

## API 엔드포인트

### 차량 관리

- `GET /vehicles` - 차량 목록 조회
- `GET /vehicles/{id}` - 차량 상세 조회
- `GET /vehicles/available` - 이용 가능한 차량 조회
- `GET /vehicles/statistics` - 차량 통계
- `POST /vehicles` - 차량 등록
- `PUT /vehicles/{id}` - 차량 정보 수정
- `PATCH /vehicles/{id}/status` - 차량 상태 변경
- `PATCH /vehicles/{id}/mileage` - 주행거리 업데이트
- `DELETE /vehicles/{id}` - 차량 삭제

### 고객 관리

- `GET /customers` - 고객 목록 조회
- `GET /customers/{id}` - 고객 상세 조회
- `GET /customers/{id}/contracts` - 고객 계약 현황
- `GET /customers/statistics` - 고객 통계
- `POST /customers` - 고객 등록
- `PUT /customers/{id}` - 고객 정보 수정
- `POST /customers/{id}/verify` - 고객 검증
- `DELETE /customers/{id}` - 고객 삭제

### 렌탈 계약

- `POST /rental-contracts/calculate` - 렌탈 비용 계산
- `GET /rental-contracts` - 렌탈 계약 목록
- `GET /rental-contracts/{id}` - 렌탈 계약 상세
- `GET /rental-contracts/expiring` - 만료 예정 계약
- `GET /rental-contracts/statistics/revenue` - 렌탈 수익 통계
- `POST /rental-contracts` - 렌탈 계약 생성
- `PUT /rental-contracts/{id}` - 렌탈 계약 수정
- `POST /rental-contracts/{id}/terminate` - 렌탈 계약 종료

## Docker 실행

```bash
# 이미지 빌드
docker build -t cargoro-rental-api .

# 컨테이너 실행
docker run -p 8004:8004 --env-file .env cargoro-rental-api
```

## 개발 가이드

### 프로젝트 구조

```
rental-api/
├── lib/
│   ├── models/          # SQLAlchemy 모델
│   │   ├── enums.py     # 열거형 정의
│   │   └── database.py  # 데이터베이스 모델
│   ├── schemas/         # Pydantic 스키마
│   │   ├── vehicle.py
│   │   ├── customer.py
│   │   └── rental_contract.py
│   ├── services/        # 비즈니스 로직
│   │   ├── vehicle_service.py
│   │   ├── customer_service.py
│   │   └── rental_contract_service.py
│   ├── routes/          # API 라우트
│   │   ├── vehicle_routes.py
│   │   ├── customer_routes.py
│   │   └── rental_contract_routes.py
│   └── server.py        # FastAPI 앱 설정
├── main.py              # 진입점
├── requirements.txt     # Python 의존성
├── Dockerfile          # Docker 설정
└── .env.example        # 환경 변수 예제
```

### 코드 스타일

- PEP 8 준수
- 타입 힌트 사용
- Pydantic v2 사용

### 테스트

```bash
pytest
```

## 다음 단계

- [ ] 리스 계약 API 구현
- [ ] 예약 시스템 API 구현
- [ ] 결제 관리 API 구현
- [ ] JWT 인증 구현
- [ ] WebSocket 실시간 업데이트
- [ ] GraphQL 통합
- [ ] 이벤트 기반 아키텍처 도입
