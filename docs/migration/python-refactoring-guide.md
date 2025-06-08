# Python 코드베이스 리팩토링 가이드

이 문서는 카고로(CarGoro) 플랫폼의 Python 코드베이스를 리팩토링하기 위한 실용적인 가이드를 제공합니다.

## 1. 변수명 변환: camelCase → snake_case

### 기존 코드 (camelCase)

```python
class DriverCreate(DriverBase):
    organizationId: str = Field(..., description="소속 조직 ID")
    isActive: bool = Field(True, description="활성 상태 여부")
    emergencyContact: Optional[EmergencyContact] = Field(None, description="비상 연락처")
    birthDate: Optional[datetime] = Field(None, description="생년월일")
```

### 새 코드 (snake_case)

```python
class DriverCreate(DriverBase):
    organization_id: str = Field(..., description="소속 조직 ID")
    is_active: bool = Field(True, description="활성 상태 여부")
    emergency_contact: Optional[EmergencyContact] = Field(None, description="비상 연락처")
    birth_date: Optional[datetime] = Field(None, description="생년월일")
```

### Prisma DB와의 변환 로직

Prisma DB는 camelCase 필드명을 사용하므로, 모델과 DB 사이에 변환 로직이 필요합니다:

```python
# snake_case 모델을 camelCase DB 필드로 변환
driver_data_dict = driver_data.model_dump()
driver_data_dict["licenseNumber"] = driver_data_dict.pop("license_number")
driver_data_dict["licenseType"] = driver_data_dict.pop("license_type")
driver_data_dict["organizationId"] = driver_data_dict.pop("organization_id")
driver_data_dict["isActive"] = driver_data_dict.pop("is_active")
```

## 2. 표준 API 응답 형식 적용

### 기존 코드 (직접 데이터 반환)

```python
@router.get("/drivers/{driver_id}", response_model=DriverResponse)
async def get_driver_by_id(driver_id: str):
    driver = await db.driver.find_unique(where={"id": driver_id})
    if not driver:
        raise HTTPException(status_code=404, detail="운전자를 찾을 수 없습니다.")
    return driver
```

### 새 코드 (표준 응답 형식)

```python
@router.get("/drivers/{driver_id}", response_model=ApiResponse[DriverResponse])
async def get_driver_by_id(driver_id: str):
    try:
        driver = await db.driver.find_unique(where={"id": driver_id})
        if not driver:
            raise not_found_exception("운전자", driver_id)

        return create_response(
            data=driver,
            message="운전자 정보가 성공적으로 조회되었습니다."
        )
    except ApiException:
        raise
    except Exception as e:
        raise server_error_exception(f"운전자 조회 중 오류가 발생했습니다: {str(e)}")
```

## 3. 예외 처리 표준화

### 기존 코드 (HTTPException 직접 사용)

```python
if not organization:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"ID가 '{driver_data.organizationId}'인 조직을 찾을 수 없습니다."
    )
```

### 새 코드 (사용자 정의 예외 함수 사용)

```python
if not organization:
    raise not_found_exception("조직", driver_data.organization_id)
```

## 4. 페이지네이션 처리

### 기존 코드

```python
return {
    "items": drivers,
    "total": total_records,
    "page": page,
    "pageSize": page_size,
    "totalPages": total_pages,
}
```

### 새 코드

```python
response_data = {
    "items": drivers,
    "total": total_records,
    "page": page,
    "page_size": page_size,
    "total_pages": total_pages,
}

return create_response(
    data=response_data,
    message="운전자 목록이 성공적으로 조회되었습니다.",
    page=page,
    per_page=page_size,
    total_items=total_records,
    total_pages=total_pages
)
```

## 5. 점진적 마이그레이션 접근법

1. **테스트 케이스 준비**: 변경 전 테스트 케이스 준비
2. **병렬 구현**: 기존 코드를 유지하면서 새 파일에 리팩토링된 코드 작성
3. **테스트 실행**: 새 구현에 대한 테스트 통과 확인
4. **단계적 전환**: 점진적으로 클라이언트 코드를 새 구현으로 전환
5. **정리**: 모든 참조가 새 구현으로 전환된 후 기존 코드 제거

## 권장 도구

1. **isort**: Python 임포트 정렬
2. **black**: Python 코드 포맷팅
3. **pylint**: Python 코드 린팅
4. **mypy**: 타입 체크

## 명령줄 유틸리티

```bash
# 코드 변환 점검
find backend -name "*.py" -exec grep -l "camelCase" {} \; | wc -l

# 코드 포맷팅
black backend/services/fleet_api

# 임포트 정렬
isort backend/services/fleet_api

# 린팅
pylint backend/services/fleet_api
```
