from fastapi import APIRouter, Depends, Query, Path
from typing import List, Optional
from prisma import Prisma
from datetime import datetime
from ..dependencies import get_prisma
from ..models import SupplierCreate, SupplierUpdate, SupplierResponse, PartResponse
from ..utils.response_utils import (
    ApiResponse,
    create_response,
    not_found_exception,
    validation_exception,
    server_error_exception,
    conflict_exception,
    ApiException,
)
import logging

router = APIRouter(
    prefix="/suppliers",
    tags=["suppliers"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger("parts-api:suppliers")

# 리소스 타입 상수
RESOURCE_TYPE = "공급업체"


# 공급업체 생성
@router.post("/", response_model=ApiResponse)
async def create_supplier(
    supplier: SupplierCreate, prisma: Prisma = Depends(get_prisma)
):
    try:
        # 이메일 중복 확인
        existing_supplier = await prisma.supplier.find_first(
            where={"email": supplier.email}
        )

        if existing_supplier:
            raise conflict_exception(RESOURCE_TYPE, "email")

        # 공급업체 생성
        new_supplier = await prisma.supplier.create(
            data={
                "name": supplier.name,
                "contact_person": supplier.contact_person,
                "email": supplier.email,
                "phone": supplier.phone,
                "address": supplier.address,
                "website": supplier.website,
                "tax_id": supplier.tax_id,
                "payment_terms": supplier.payment_terms,
                "lead_time_days": supplier.lead_time_days,
                "is_active": True,
                "notes": supplier.notes,
            }
        )

        # datetime 직렬화를 위해 model_dump(mode="json") 사용
        supplier_data = SupplierResponse.model_validate(new_supplier).model_dump(mode="json")
        return create_response(data=supplier_data)
    except ApiException:
        raise
    except Exception as e:
        logger.error(f"공급업체 생성 실패: {str(e)}")
        raise server_error_exception(f"공급업체 생성 중 오류가 발생했습니다: {str(e)}")


# 모든 공급업체 조회
@router.get("/", response_model=ApiResponse)
async def get_all_suppliers(
    name: Optional[str] = None,
    email: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    prisma: Prisma = Depends(get_prisma),
):
    try:
        # 필터 조건 구성
        where = {}

        if name:
            where["name"] = {"contains": name, "mode": "insensitive"}

        if email:
            where["email"] = {"contains": email, "mode": "insensitive"}

        if is_active is not None:
            where["is_active"] = is_active

        # 총 개수 조회
        total_items = await prisma.supplier.count(where=where)
        total_pages = (total_items + limit - 1) // limit if limit > 0 else 0

        # 데이터 조회
        suppliers = await prisma.supplier.find_many(
            where=where, skip=skip, take=limit, order={"name": "asc"}
        )

        # 응답 객체로 변환 (datetime 직렬화를 위해 model_dump(mode="json") 사용)
        supplier_responses = [
            SupplierResponse.model_validate(supplier).model_dump(mode="json") for supplier in suppliers
        ]

        return create_response(
            data=supplier_responses,
            page=skip // limit + 1,
            per_page=limit,
            total_items=total_items,
            total_pages=total_pages,
        )
    except Exception as e:
        logger.error(f"공급업체 조회 실패: {str(e)}")
        raise server_error_exception(f"공급업체 조회 중 오류가 발생했습니다: {str(e)}")


# 특정 공급업체 조회
@router.get("/{supplier_id}", response_model=ApiResponse)
async def get_supplier(
    supplier_id: str = Path(..., description="조회할 공급업체의 ID"),
    prisma: Prisma = Depends(get_prisma),
):
    try:
        supplier = await prisma.supplier.find_unique(where={"id": supplier_id})

        if not supplier:
            raise not_found_exception(RESOURCE_TYPE, supplier_id)

        supplier_data = SupplierResponse.model_validate(supplier).model_dump(mode="json")
        return create_response(data=supplier_data)
    except ApiException:
        raise
    except Exception as e:
        logger.error(f"공급업체 조회 실패: {str(e)}")
        raise server_error_exception(f"공급업체 조회 중 오류가 발생했습니다: {str(e)}")


# 공급업체 수정
@router.patch("/{supplier_id}", response_model=ApiResponse)
async def update_supplier(
    supplier_update: SupplierUpdate,
    supplier_id: str = Path(..., description="수정할 공급업체의 ID"),
    prisma: Prisma = Depends(get_prisma),
):
    try:
        # 기존 공급업체 확인
        existing_supplier = await prisma.supplier.find_unique(where={"id": supplier_id})

        if not existing_supplier:
            raise not_found_exception(RESOURCE_TYPE, supplier_id)

        # 이메일 중복 확인 (변경되는 경우)
        if supplier_update.email and supplier_update.email != existing_supplier.email:
            email_check = await prisma.supplier.find_first(
                where={"email": supplier_update.email, "id": {"not": supplier_id}}
            )

            if email_check:
                raise conflict_exception(RESOURCE_TYPE, "email")

        # 필드 업데이트
        update_data = supplier_update.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.now()

        # 공급업체 업데이트
        updated_supplier = await prisma.supplier.update(
            where={"id": supplier_id}, data=update_data
        )

        supplier_data = SupplierResponse.model_validate(updated_supplier).model_dump(mode="json")
        return create_response(data=supplier_data)
    except ApiException:
        raise
    except Exception as e:
        logger.error(f"공급업체 수정 실패: {str(e)}")
        raise server_error_exception(f"공급업체 수정 중 오류가 발생했습니다: {str(e)}")


# 공급업체 활성/비활성 상태 변경
@router.patch("/{supplier_id}/status", response_model=ApiResponse)
async def update_supplier_status(
    supplier_id: str = Path(..., description="상태를 변경할 공급업체의 ID"),
    is_active: bool = Query(..., description="활성화 상태 (true: 활성, false: 비활성)"),
    prisma: Prisma = Depends(get_prisma),
):
    try:
        # 기존 공급업체 확인
        existing_supplier = await prisma.supplier.find_unique(where={"id": supplier_id})

        if not existing_supplier:
            raise not_found_exception(RESOURCE_TYPE, supplier_id)

        # 상태 업데이트
        updated_supplier = await prisma.supplier.update(
            where={"id": supplier_id},
            data={"is_active": is_active, "updated_at": datetime.now()},
        )

        supplier_data = SupplierResponse.model_validate(updated_supplier).model_dump(mode="json")
        return create_response(data=supplier_data)
    except ApiException:
        raise
    except Exception as e:
        logger.error(f"공급업체 상태 변경 실패: {str(e)}")
        raise server_error_exception(
            f"공급업체 상태 변경 중 오류가 발생했습니다: {str(e)}"
        )


# 공급업체 삭제
@router.delete("/{supplier_id}", response_model=ApiResponse)
async def delete_supplier(
    supplier_id: str = Path(..., description="삭제할 공급업체의 ID"),
    prisma: Prisma = Depends(get_prisma),
):
    try:
        # 기존 공급업체 확인
        existing_supplier = await prisma.supplier.find_unique(where={"id": supplier_id})

        if not existing_supplier:
            raise not_found_exception(RESOURCE_TYPE, supplier_id)

        # 연결된 부품 확인
        related_parts = await prisma.part.find_first(
            where={"supplier_ids": {"has": supplier_id}}
        )

        if related_parts:
            # 삭제 대신 비활성화
            inactive_supplier = await prisma.supplier.update(
                where={"id": supplier_id},
                data={"is_active": False, "updated_at": datetime.now()},
            )

            supplier_data = SupplierResponse.model_validate(inactive_supplier).model_dump(mode="json")
            return create_response(data=supplier_data)
        else:
            # 완전 삭제
            deleted_supplier = await prisma.supplier.delete(where={"id": supplier_id})

            supplier_data = SupplierResponse.model_validate(deleted_supplier).model_dump(mode="json")
            return create_response(data=supplier_data)
    except ApiException:
        raise
    except Exception as e:
        logger.error(f"공급업체 삭제 실패: {str(e)}")
        raise server_error_exception(f"공급업체 삭제 중 오류가 발생했습니다: {str(e)}")


# 공급업체 부품 목록 조회
@router.get("/{supplier_id}/parts", response_model=ApiResponse)
async def get_supplier_parts(
    supplier_id: str = Path(..., description="조회할 공급업체의 ID"),
    prisma: Prisma = Depends(get_prisma),
):
    try:
        # 공급업체 확인
        supplier = await prisma.supplier.find_unique(where={"id": supplier_id})

        if not supplier:
            raise not_found_exception(RESOURCE_TYPE, supplier_id)

        # 공급업체가 공급하는 부품 조회
        parts = await prisma.part.find_many(
            where={"supplier_ids": {"has": supplier_id}}, order={"name": "asc"}
        )

        # 응답 객체로 변환 (datetime 직렬화를 위해 model_dump(mode="json") 사용)
        part_responses = [PartResponse.model_validate(part).model_dump(mode="json") for part in parts]

        return create_response(data=part_responses)
    except ApiException:
        raise
    except Exception as e:
        logger.error(f"공급업체 부품 목록 조회 실패: {str(e)}")
        raise server_error_exception(
            f"공급업체 부품 목록 조회 중 오류가 발생했습니다: {str(e)}"
        )
