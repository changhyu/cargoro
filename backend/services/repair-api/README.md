# Repair API Service

CarGoro 플랫폼의 정비 요청 및 정비소 관리 서비스입니다.

## 개요

Repair API는 다음과 같은 기능을 제공합니다:

- 정비 요청 생성 및 관리
- 정비소 등록 및 검색
- 정비 작업 추적 및 상태 관리
- 정비소 직원 관리
- 정비 이미지 업로드

## 기술 스택

- **프레임워크**: FastAPI
- **데이터베이스**: PostgreSQL (Prisma ORM)
- **파일 업로드**: python-multipart
- **검증**: Pydantic

## API 엔드포인트

### 정비 요청 (`/api/v1/repair-requests`)

- `POST /` - 새로운 정비 요청 생성
- `GET /` - 정비 요청 목록 조회
- `GET /{request_id}` - 특정 정비 요청 상세 조회
- `PUT /{request_id}` - 정비 요청 정보 수정
- `POST /{request_id}/images` - 정비 요청에 이미지 업로드
- `DELETE /{request_id}` - 정비 요청 취소

### 정비소 관리 (`/api/v1/workshops`)

- `POST /` - 새로운 정비소 등록
- `GET /` - 정비소 검색 및 목록 조회
- `GET /{workshop_id}` - 특정 정비소 상세 정보 조회
- `PUT /{workshop_id}` - 정비소 정보 수정
- `POST /{workshop_id}/staff` - 정비소 직원 추가
- `DELETE /{workshop_id}/staff/{staff_id}` - 정비소 직원 제거

## 정비 요청 상태

1. **PENDING** - 대기 중
2. **CONFIRMED** - 확정됨
3. **IN_PROGRESS** - 진행 중
4. **COMPLETED** - 완료됨
5. **CANCELLED** - 취소됨

## 정비 요청 긴급도

1. **LOW** - 낮음
2. **NORMAL** - 보통
3. **HIGH** - 높음
4. **URGENT** - 긴급

## 설치 및 실행

### 개발 환경

1. 가상환경 생성 및 활성화:

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. 의존성 설치:

```bash
pip install -r requirements.txt
```

3. 환경 변수 설정:

```bash
cp .env.example .env
# .env 파일 편집하여 필요한 값 설정
```

4. 데이터베이스 마이그레이션:

```bash
prisma migrate dev
```

5. 서버 실행:

```bash
python main.py
# 또는
uvicorn main:app --reload --port 8002
```

### Docker 실행

```bash
docker build -t cargoro-repair-api .
docker run -p 8002:8002 --env-file .env cargoro-repair-api
```

## 테스트

### 단위 테스트 실행:

```bash
pytest tests/unit -v
```

### 통합 테스트 실행:

```bash
pytest tests/integration -v
```

### 전체 테스트 및 커버리지:

```bash
pytest --cov=lib --cov-report=html
```

## API 문서

서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:

- Swagger UI: http://localhost:8002/api-docs
- ReDoc: http://localhost:8002/api-redoc

## 환경 변수

| 변수명            | 설명                | 기본값                |
| ----------------- | ------------------- | --------------------- |
| `ENV`             | 실행 환경           | development           |
| `DEBUG`           | 디버그 모드         | False                 |
| `DATABASE_URL`    | PostgreSQL 연결 URL | -                     |
| `ALLOWED_ORIGINS` | CORS 허용 도메인    | http://localhost:3000 |
| `MAX_FILE_SIZE`   | 최대 파일 크기 (MB) | 10                    |
| `S3_BUCKET`       | 이미지 저장 S3 버킷 | -                     |

## 비즈니스 로직

### 정비 요청 생성

1. 사용자는 자신의 차량에 대해서만 정비 요청 생성 가능
2. 요청 번호는 자동으로 생성 (REQ-YYYYMMDDHHMI-XXXX)
3. 초기 상태는 PENDING으로 설정

### 정비소 검색

1. 키워드, 전문분야, 평점으로 필터링 가능
2. 위치 기반 검색 지원 (거리 계산)
3. 평점 순으로 정렬

### 직원 관리

1. 정비소 소유자만 직원 추가/제거 가능
2. 직원 추가 시 자동으로 WORKSHOP_STAFF 역할 부여
3. 다른 정비소에서도 일하지 않는 경우 역할을 USER로 변경

## 문제 해결

### 파일 업로드 오류

- `MAX_FILE_SIZE` 환경 변수 확인
- 파일 형식이 이미지인지 확인
- S3 버킷 권한 확인

### 정비 요청 권한 오류

- 차량 소유자 확인
- 정비소 직원 권한 확인
- 토큰 유효성 확인

### 정비소 등록 오류

- 사업자 번호 중복 확인
- 필수 필드 입력 확인
- 사용자 역할 확인
