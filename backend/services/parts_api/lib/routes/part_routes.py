from fastapi import APIRouter, Depends, HTTPException, Query, Path
from typing import List, Optional
from prisma import Prisma
from datetime import datetime
from ..dependencies import get_prisma
from ..models import PartCreate, PartUpdate, PartResponse, PartStatus, PartType
from ..utils.response_utils import (
    ApiResponse,
    create_response,
    not_found_exception,
    validation_exception,
    server_error_exception,
    conflict_exception,
)
import logging

router = APIRouter(
    prefix="/parts",
    tags=["parts"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger("parts-api:parts")

# 리소스 타입 상수
RESOURCE_TYPE = "부품"


# 부품 생성
@router.post("/", response_model=ApiResponse)
async def create_part(part: PartCreate, prisma: Prisma = Depends(get_prisma)):
    try:
        # 부품 번호 중복 확인
        existing_part = await prisma.part.find_first(
            where={"part_number": part.part_number}
        )

        if existing_part:
            raise conflict_exception(RESOURCE_TYPE, "part_number")

        # 공급업체 확인 (있는 경우)
        if part.supplier_ids:
            for supplier_id in part.supplier_ids:
                supplier = await prisma.supplier.find_unique(where={"id": supplier_id})

                if not supplier:
                    raise not_found_exception("공급업체", supplier_id)

        # 재고 상태 결정
        status = PartStatus.IN_STOCK
        if part.quantity == 0:
            status = PartStatus.OUT_OF_STOCK
        elif part.quantity <= part.min_quantity:
            status = PartStatus.LOW_STOCK

        # 부품 생성
        new_part = await prisma.part.create(
            data={
                "part_number": part.part_number,
                "name": part.name,
                "description": part.description,
                "manufacturer": part.manufacturer,
                "part_type": part.part_type,
                "price": part.price,
                "quantity": part.quantity,
                "min_quantity": part.min_quantity,
                "status": status,
                "location": part.location,
                "supplier_ids": part.supplier_ids,
                "compatible_vehicles": part.compatible_vehicles,
                "image_url": part.image_url,
                "warranty_period": part.warranty_period,
                "notes": part.notes,
            }
        )

        part_data = PartResponse.model_validate(new_part).model_dump(mode="json")
        return create_response(data=part_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"부품 생성 실패: {str(e)}")
        raise server_error_exception(f"부품 생성 중 오류가 발생했습니다: {str(e)}")


# 모든 부품 조회
@router.get("/", response_model=ApiResponse)
async def get_all_parts(
    part_number: Optional[str] = None,
    name: Optional[str] = None,
    manufacturer: Optional[str] = None,
    part_type: Optional[PartType] = None,
    status: Optional[PartStatus] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock_only: bool = False,
    supplier_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    prisma: Prisma = Depends(get_prisma),
):
    try:
        # 필터 조건 구성
        where = {}

        if part_number:
            where["part_number"] = {"contains": part_number, "mode": "insensitive"}

        if name:
            where["name"] = {"contains": name, "mode": "insensitive"}

        if manufacturer:
            where["manufacturer"] = {"contains": manufacturer, "mode": "insensitive"}

        if part_type:
            where["part_type"] = part_type

        if status:
            where["status"] = status

        if min_price is not None:
            where["price"] = {"gte": min_price}

        if max_price is not None:
            if "price" in where:
                where["price"]["lte"] = max_price
            else:
                where["price"] = {"lte": max_price}

        if in_stock_only:
            where["quantity"] = {"gt": 0}

        if supplier_id:
            where["supplier_ids"] = {"has": supplier_id}

        # 총 개수 조회
        total_items = await prisma.part.count(where=where)
        total_pages = (total_items + limit - 1) // limit if limit > 0 else 0

        # 데이터 조회
        parts = await prisma.part.find_many(
            where=where, skip=skip, take=limit, order={"name": "asc"}
        )

        # 응답 객체로 변환
        # 응답 객체로 변환 (datetime 직렬화를 위해 model_dump(mode="json") 사용)
        part_responses = [PartResponse.model_validate(part).model_dump(mode="json") for part in parts]

        return create_response(
            data=part_responses,
            page=skip // limit + 1,
            per_page=limit,
            total_items=total_items,
            total_pages=total_pages,
        )
    except Exception as e:
        logger.error(f"부품 조회 실패: {str(e)}")
        raise server_error_exception(f"부품 조회 중 오류가 발생했습니다: {str(e)}")


# 특정 부품 조회
@router.get("/{part_id}", response_model=ApiResponse)
async def get_part(
    part_id: str = Path(..., description="조회할 부품의 ID"),
    prisma: Prisma = Depends(get_prisma),
):
    try:
        part = await prisma.part.find_unique(where={"id": part_id})

        if not part:
            raise not_found_exception(RESOURCE_TYPE, part_id)

        part_data = PartResponse.model_validate(part).model_dump(mode="json")
        return create_response(data=part_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"부품 조회 실패: {str(e)}")
        raise server_error_exception(f"부품 조회 중 오류가 발생했습니다: {str(e)}")


# 부품 업데이트
@router.patch("/{part_id}", response_model=ApiResponse)
async def update_part(
    part_update: PartUpdate,
    part_id: str = Path(..., description="수정할 부품의 ID"),
    prisma: Prisma = Depends(get_prisma),
):
    try:
        # 기존 부품 확인
        existing_part = await prisma.part.find_unique(where={"id": part_id})

        if not existing_part:
            raise not_found_exception(RESOURCE_TYPE, part_id)

        # 부품 번호 중복 확인 (변경되는 경우)
        if (
            part_update.part_number
            and part_update.part_number != existing_part.part_number
        ):
            duplicate_check = await prisma.part.find_first(
                where={"part_number": part_update.part_number, "id": {"not": part_id}}
            )

            if duplicate_check:
                raise conflict_exception(RESOURCE_TYPE, "part_number")

        # 상태 업데이트 (수량이 변경되는 경우)
        if part_update.quantity is not None:
            if part_update.quantity == 0:
                part_update.status = PartStatus.OUT_OF_STOCK
            elif part_update.quantity <= (
                part_update.min_quantity or existing_part.min_quantity
            ):
                part_update.status = PartStatus.LOW_STOCK
            else:
                part_update.status = PartStatus.IN_STOCK

        # 필드 업데이트
        update_data = part_update.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.now()

        # 부품 업데이트
        updated_part = await prisma.part.update(where={"id": part_id}, data=update_data)

        part_data = PartResponse.model_validate(updated_part).model_dump(mode="json")
        return create_response(data=part_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"부품 업데이트 실패: {str(e)}")
        raise server_error_exception(f"부품 업데이트 중 오류가 발생했습니다: {str(e)}")


# 재고 조정
@router.patch("/{part_id}/inventory", response_model=ApiResponse)
async def update_inventory(
    part_id: str,
    quantity_change: int = Query(
        ..., description="재고 수량 변경 (양수는 증가, 음수는 감소)"
    ),
    prisma: Prisma = Depends(get_prisma),
):
    try:
        # 기존 부품 확인
        existing_part = await prisma.part.find_unique(where={"id": part_id})

        if not existing_part:
            raise not_found_exception(RESOURCE_TYPE, part_id)

        # 재고 감소 시 충분한 재고 확인
        if quantity_change < 0 and existing_part.quantity + quantity_change < 0:
            raise validation_exception(
                {
                    "message": "재고가 부족합니다.",
                    "current_quantity": existing_part.quantity,
                    "requested_change": quantity_change,
                }
            )

        # 새 수량 계산
        new_quantity = existing_part.quantity + quantity_change

        # 상태 결정
        status = existing_part.status
        if new_quantity == 0:
            status = PartStatus.OUT_OF_STOCK
        elif new_quantity <= existing_part.min_quantity:
            status = PartStatus.LOW_STOCK
        else:
            status = PartStatus.IN_STOCK

        # 업데이트 실행
        updated_part = await prisma.part.update(
            where={"id": part_id},
            data={
                "quantity": new_quantity,
                "status": status,
                "updated_at": datetime.now(),
            },
        )

        part_data = PartResponse.model_validate(updated_part).model_dump(mode="json")
        return create_response(data=part_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"재고 조정 실패: {str(e)}")
        raise server_error_exception(f"재고 조정 중 오류가 발생했습니다: {str(e)}")


# 부품 삭제
@router.delete("/{part_id}", response_model=ApiResponse)
async def delete_part(
    part_id: str = Path(..., description="삭제할 부품의 ID"),
    prisma: Prisma = Depends(get_prisma),
):
    try:
        # 기존 부품 확인
        existing_part = await prisma.part.find_unique(where={"id": part_id})

        if not existing_part:
            raise not_found_exception(RESOURCE_TYPE, part_id)

        # 연결된 주문 확인
        related_orders = await prisma.order_item.find_first(where={"part_id": part_id})

        if related_orders:
            # 삭제 대신 상태 변경
            discontinued_part = await prisma.part.update(
                where={"id": part_id},
                data={"status": PartStatus.DISCONTINUED, "updated_at": datetime.now()},
            )

            part_data = PartResponse.model_validate(discontinued_part).model_dump(mode="json")
            return create_response(data=part_data)
        else:
            # 완전 삭제
            deleted_part = await prisma.part.delete(where={"id": part_id})

            part_data = PartResponse.model_validate(deleted_part).model_dump(mode="json")
            return create_response(data=part_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"부품 삭제 실패: {str(e)}")
        raise server_error_exception(f"부품 삭제 중 오류가 발생했습니다: {str(e)}")


# 부품 번호로 조회
@router.get("/by-part-number/{part_number}", response_model=ApiResponse)
async def get_part_by_number(
    part_number: str = Path(..., description="조회할 부품 번호"),
    prisma: Prisma = Depends(get_prisma),
):
    try:
        part = await prisma.part.find_first(where={"part_number": part_number})

        if not part:
            raise validation_exception(
                {
                    "message": f"부품 번호 '{part_number}'인 부품을 찾을 수 없습니다.",
                    "part_number": part_number,
                }
            )

        part_data = PartResponse.model_validate(part).model_dump(mode="json")
        return create_response(data=part_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"부품 조회 실패: {str(e)}")
        raise server_error_exception(f"부품 조회 중 오류가 발생했습니다: {str(e)}")
