# 코드베이스 리팩토링 계획

## 1. Python 파일의 camelCase를 snake_case로 변경

### 1.1 모델 파일 업데이트

- 모든 Pydantic 모델의 필드명을 snake_case로 변경
- 예: `licenseNumber` → `license_number`
- 기존 모델 파일 보존하면서 새 파일로 작업 (`_new` 접미사 추가)
- 완료 후 점진적으로 교체

### 1.2 라우터 파일 업데이트

- 모든 라우터 파일의 변수명을 snake_case로 변경
- 예: `driverId` → `driver_id`
- 모델과 DB 간 변환 로직 추가 (snake_case ↔ camelCase)

### 1.3 데이터베이스 접근 코드 조정

- Prisma 필드명이 camelCase이므로 변환 로직 추가
- 예: `db.driver.find_unique(where={"licenseNumber": driver_data.license_number})`

## 2. 모든 API 엔드포인트에 표준 응답 형식 적용

### 2.1 표준 응답 모델 확인

- `ApiResponse`, `ErrorResponse` 모델 확인 및 업데이트
- 응답 형식: `{"status": "success", "data": {...}, "message": "..."}`

### 2.2 응답 헬퍼 함수 사용

- `create_response()` 함수를 사용하여 모든 응답 생성
- 페이지네이션 정보도 메타데이터로 포함

### 2.3 예외 처리 표준화

- 모든 예외 처리에 `ApiException` 사용
- 기존 `HTTPException` 대신 사용자 정의 예외 함수 활용
  - `not_found_exception()`
  - `validation_exception()`
  - `server_error_exception()`
  - `conflict_exception()`
  - `unauthorized_exception()`

## 3. TypeScript와 Python 코드의 역할 명확히 구분

### 3.1 역할 정의

- Python (백엔드):

  - API 엔드포인트, 비즈니스 로직, 데이터베이스 액세스
  - 백그라운드 작업 처리 (Celery)
  - 서버 사이드 검증 및 보안

- TypeScript (프론트엔드):
  - UI 컴포넌트 및 상태 관리
  - API 클라이언트 및 데이터 페칭
  - 클라이언트 사이드 검증 및 사용자 경험

### 3.2 인터페이스 정의

- API 스펙 문서 생성
- 공유 타입 정의 (필요시 타입 생성기 사용)

## 4. 마이그레이션 전략

### 4.1 점진적 마이그레이션

- 한 번에 모든 코드를 변경하기보다 모듈별로 점진적 변경
- 테스트 커버리지를 유지하며 변경
- 변경 후 기능 회귀 테스트 수행

### 4.2 호환성 유지

- 기존 코드베이스와의 호환성 유지
- 필요한 경우 어댑터 계층 추가하여 변환 처리

### 4.3 문서화

- 코드 변경사항 문서화
- 개발자 가이드 업데이트

## 5. 우선순위 및 일정

### 5.1 1단계: 핵심 모델 및 유틸리티 업데이트

- 표준 응답 유틸리티 확인 및 업데이트
- 핵심 모델 파일 snake_case로 변환

### 5.2 2단계: API 엔드포인트 업데이트

- 운전자 관련 API
- 차량 관련 API
- 기타 주요 API

### 5.3 3단계: 테스트 및 문서 업데이트

- 테스트 코드 업데이트
- API 문서 업데이트

## 6. 테스트 전략

### 6.1 단위 테스트

- 각 변경된 모듈에 대한 단위 테스트 실행

### 6.2 통합 테스트

- API 엔드포인트 통합 테스트
- 클라이언트-서버 통합 테스트

### 6.3 성능 테스트

- 변경 전후 성능 비교 테스트
