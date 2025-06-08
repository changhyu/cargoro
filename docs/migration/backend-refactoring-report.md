# 카고로(CarGoro) 백엔드 코드베이스 리팩토링 보고서

## 1. 현황 분석

백엔드 코드베이스에 대한 분석 결과, 다음과 같은 일관성 이슈가 발견되었습니다:

1. **Python 코드 컨벤션 불일치**:

   - Python 파일에서 camelCase 네이밍을 사용하는 파일이 약 244개 발견
   - Python의 공식 스타일 가이드인 PEP 8에서 권장하는 snake_case와 불일치

2. **API 응답 형식 불일치**:

   - 일부 API는 표준화된 응답 형식을 사용하지만, 다른 API는 직접적인 데이터 모델 응답을 사용
   - 예: `/drivers/license-expiry/alerts` 엔드포인트는 직접 List[DriverResponse]를 반환

3. **TypeScript와 Python 혼용**:
   - 백엔드에서 Python(593개 파일)과 TypeScript(593개 파일)를 함께 사용
   - 역할과 책임이 명확하게 구분되지 않음

## 2. 변경 사항

### 2.1 코드 네이밍 컨벤션 표준화

- Python 변수명, 함수명: snake_case
- 클래스명: PascalCase
- 파일명: snake_case
- TypeScript 코드는 기존 컨벤션 유지

### 2.2 표준 API 응답 형식 정의

모든 API 응답은 다음 형식을 따릅니다:

```json
{
  "status": "success",
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 10,
    "total_items": 100,
    "total_pages": 10
  }
}
```

오류 응답:

```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "오류 메시지",
  "details": { ... }
}
```

### 2.3 TypeScript/Python 역할 구분

- **Python (백엔드)**:

  - API 엔드포인트, 비즈니스 로직, 데이터베이스 액세스
  - 백그라운드 작업 처리 (Celery)
  - 서버 사이드 검증 및 보안

- **TypeScript (프론트엔드)**:
  - UI 컴포넌트 및 상태 관리
  - API 클라이언트 및 데이터 페칭
  - 클라이언트 사이드 검증 및 사용자 경험

## 3. 리팩토링 예시

### 3.1 모델 파일 (driver.py → snake_case)

```python
# 기존 코드
class DriverCreate(DriverBase):
    organizationId: str = Field(..., description="소속 조직 ID")
    isActive: bool = Field(True, description="활성 상태 여부")

# 새 코드
class DriverCreate(DriverBase):
    organization_id: str = Field(..., description="소속 조직 ID")
    is_active: bool = Field(True, description="활성 상태 여부")
```

### 3.2 표준 응답 형식 적용

```python
# 기존 코드
@router.get("/drivers/{driver_id}", response_model=DriverResponse)
async def get_driver_by_id(driver_id: str):
    # ...
    return driver

# 새 코드
@router.get("/drivers/{driver_id}", response_model=ApiResponse[DriverResponse])
async def get_driver_by_id(driver_id: str):
    # ...
    return create_response(data=driver, message="운전자 정보가 조회되었습니다.")
```

## 4. 마이그레이션 계획

1. **준비 단계**:

   - 표준 응답 유틸리티 확인 및 업데이트
   - 테스트 케이스 준비

2. **리팩토링 단계**:

   - 핵심 모델 파일 snake_case로 변환
   - API 엔드포인트 표준화
   - 새 파일로 병렬 개발 (기존 기능 유지)

3. **검증 단계**:

   - 테스트 실행 및 검증
   - 성능 테스트

4. **전환 단계**:
   - 점진적으로 클라이언트를 새 API로 전환
   - 기존 코드 정리

## 5. 효과 및 이점

1. **코드 일관성 향상**:

   - 읽기 쉽고 일관된 코드베이스
   - 새로운 개발자의 온보딩 시간 단축

2. **유지보수성 개선**:

   - 디버깅 용이성 증가
   - 변경 사항 추적 용이

3. **표준화된 사용자 경험**:

   - 모든 API 응답 형식 일관성
   - 오류 처리 일관성

4. **확장성 강화**:
   - 새로운 기능 추가 시 일관된 패턴 적용
   - 백엔드/프론트엔드 역할 명확화로 인한 협업 개선
