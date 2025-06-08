from fastapi import APIRouter, Depends, HTTPException, Query, Path
from typing import List, Optional
from prisma import Prisma
from datetime import date, datetime
from ..models.contract import (
    ContractCreate,
    ContractUpdate,
    ContractResponse,
    ContractStatus,
    ContractType,
    ContractPaymentCreate,
    ContractPaymentUpdate,
    ContractPaymentResponse,
)
from ..utils.response_utils import (
    create_response,
    not_found_exception,
    conflict_exception,
    validation_exception,
    server_error_exception,
    ApiResponse,
)
import logging

router = APIRouter(
    prefix="/contracts",
    tags=["contracts"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger("fleet-api:contracts")

# Prisma 의존성 주입을 main.py에서 처리합니다


# 계약 생성
@router.post("/", response_model=ApiResponse[ContractResponse])
def create_contract(contract: ContractCreate, prisma=Depends()):
    try:
        # 조직 확인
        organization = prisma.organization.find_unique(
            where={"id": contract.organization_id}
        )

        if not organization:
            raise not_found_exception("organization", contract.organization_id)

        # 차량 확인
        vehicle = prisma.vehicle.find_unique(where={"id": contract.vehicle_id})

        if not vehicle:
            raise not_found_exception("vehicle", contract.vehicle_id)

        # 활성 계약 중복 확인
        active_contract = prisma.contract.find_first(
            where={"vehicle_id": contract.vehicle_id, "status": "active"}
        )

        if active_contract:
            raise conflict_exception("contract", "vehicle_id")

        # 날짜 유효성 검사
        if contract.start_date > contract.end_date:
            raise validation_exception(
                {"date": "계약 시작일은 종료일보다 이전이어야 합니다."}
            )

        # 계약 생성
        new_contract = prisma.contract.create(
            data={
                "organization_id": contract.organization_id,
                "vehicle_id": contract.vehicle_id,
                "contract_type": contract.contract_type,
                "start_date": contract.start_date,
                "end_date": contract.end_date,
                "monthly_payment": contract.monthly_payment,
                "deposit": contract.deposit,
                "status": "active",  # 기본 상태
                "insurance_info": contract.insurance_info,
                "additional_terms": contract.additional_terms,
                "contract_file_url": contract.contract_file_url,
            }
        )

        # 차량 상태 업데이트
        prisma.vehicle.update(
            where={"id": contract.vehicle_id}, data={"status": "in_use"}
        )

        return create_response(data=ContractResponse.model_validate(new_contract))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"계약 생성 실패: {str(e)}")
        raise server_error_exception(f"계약 생성 중 오류가 발생했습니다: {str(e)}")


# 모든 계약 조회
@router.get("/", response_model=ApiResponse[List[ContractResponse]])
async def get_all_contracts(
    organization_id: Optional[str] = None,
    vehicle_id: Optional[str] = None,
    status: Optional[ContractStatus] = None,
    contract_type: Optional[ContractType] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    prisma=Depends(),
):
    try:
        # 필터 조건 구성
        where = {}

        if organization_id:
            where["organization_id"] = organization_id

        if vehicle_id:
            where["vehicle_id"] = vehicle_id

        if status:
            where["status"] = status

        if contract_type:
            where["contract_type"] = contract_type

        if date_from:
            where["start_date"] = {"gte": date_from}

        if date_to:
            where["end_date"] = {"lte": date_to}

        # 전체 아이템 수 조회
        total_items = prisma.contract.count(where=where)
        total_pages = (total_items + limit - 1) // limit

        # 데이터 조회
        contracts = prisma.contract.find_many(
            where=where, skip=skip, take=limit, order={"created_at": "desc"}
        )

        contract_responses = [
            ContractResponse.model_validate(contract) for contract in contracts
        ]

        return create_response(
            data=contract_responses,
            page=skip // limit + 1,
            per_page=limit,
            total_items=total_items,
            total_pages=total_pages,
        )
    except Exception as e:
        logger.error(f"계약 조회 실패: {str(e)}")
        raise server_error_exception(f"계약 조회 중 오류가 발생했습니다: {str(e)}")


# 특정 계약 조회
@router.get("/{contract_id}", response_model=ApiResponse[ContractResponse])
async def get_contract(
    contract_id: str = Path(..., description="조회할 계약의 ID"),
    prisma=Depends(),
):
    try:
        contract = prisma.contract.find_unique(where={"id": contract_id})

        if not contract:
            raise not_found_exception("contract", contract_id)

        return create_response(data=ContractResponse.model_validate(contract))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"계약 조회 실패: {str(e)}")
        raise server_error_exception(f"계약 조회 중 오류가 발생했습니다: {str(e)}")


# 계약 수정
@router.patch("/{contract_id}", response_model=ApiResponse[ContractResponse])
async def update_contract(
    contract_update: ContractUpdate,
    contract_id: str = Path(..., description="수정할 계약의 ID"),
    prisma=Depends(),
):
    try:
        # 기존 계약 확인
        existing_contract = prisma.contract.find_unique(where={"id": contract_id})

        if not existing_contract:
            raise not_found_exception("contract", contract_id)

        # 종료된 계약 수정 방지
        if existing_contract.status in [
            "expired",
            "terminated",
        ] and contract_update.status not in ["active"]:
            raise validation_exception(
                {"status": "종료된 계약은 다시 활성화하는 경우에만 수정할 수 있습니다."}
            )

        # 날짜 유효성 검사
        start_date = contract_update.start_date or existing_contract.start_date
        end_date = contract_update.end_date or existing_contract.end_date

        if start_date > end_date:
            raise validation_exception(
                {"date": "계약 시작일은 종료일보다 이전이어야 합니다."}
            )

        # 필드 업데이트
        update_data = contract_update.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.now()

        # 계약 업데이트
        updated_contract = prisma.contract.update(
            where={"id": contract_id}, data=update_data
        )

        # 상태가 변경된 경우, 필요시 차량 상태도 업데이트
        if (
            contract_update.status
            and contract_update.status != existing_contract.status
        ):
            if contract_update.status in ["expired", "terminated"]:
                prisma.vehicle.update(
                    where={"id": existing_contract.vehicle_id},
                    data={"status": "available"},
                )
            elif contract_update.status == "active" and existing_contract.status in [
                "expired",
                "terminated",
            ]:
                prisma.vehicle.update(
                    where={"id": existing_contract.vehicle_id},
                    data={"status": "in_use"},
                )

        return create_response(data=ContractResponse.model_validate(updated_contract))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"계약 수정 실패: {str(e)}")
        raise server_error_exception(f"계약 수정 중 오류가 발생했습니다: {str(e)}")


# 계약 상태 변경
@router.patch("/{contract_id}/status", response_model=ApiResponse[ContractResponse])
async def update_contract_status(
    status: ContractStatus,
    contract_id: str = Path(..., description="상태를 변경할 계약의 ID"),
    prisma=Depends(),
):
    try:
        # 기존 계약 확인
        existing_contract = prisma.contract.find_unique(where={"id": contract_id})

        if not existing_contract:
            raise not_found_exception("contract", contract_id)

        # 상태 변경 검증
        if existing_contract.status in ["expired", "terminated"] and status not in [
            "active"
        ]:
            raise validation_exception(
                {"status": "종료된 계약은 'active' 상태로만 변경할 수 있습니다."}
            )

        # 계약 상태 업데이트
        updated_contract = prisma.contract.update(
            where={"id": contract_id},
            data={"status": status, "updated_at": datetime.now()},
        )

        # 차량 상태 연동 업데이트
        if status in ["expired", "terminated"]:
            prisma.vehicle.update(
                where={"id": existing_contract.vehicle_id}, data={"status": "available"}
            )
        elif status == "active" and existing_contract.status in [
            "expired",
            "terminated",
        ]:
            prisma.vehicle.update(
                where={"id": existing_contract.vehicle_id}, data={"status": "in_use"}
            )

        return create_response(data=ContractResponse.model_validate(updated_contract))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"계약 상태 변경 실패: {str(e)}")
        raise server_error_exception(f"계약 상태 변경 중 오류가 발생했습니다: {str(e)}")


# 계약 삭제
@router.delete("/{contract_id}", response_model=ApiResponse[ContractResponse])
async def delete_contract(
    contract_id: str = Path(..., description="삭제할 계약의 ID"),
    prisma=Depends(),
):
    try:
        # 기존 계약 확인
        existing_contract = prisma.contract.find_unique(where={"id": contract_id})

        if not existing_contract:
            raise not_found_exception("contract", contract_id)

        # 활성 계약 삭제 방지
        if existing_contract.status == "active":
            raise validation_exception(
                {"status": "활성 계약은 삭제할 수 없습니다. 먼저 계약을 종료하세요."}
            )

        # 계약 삭제
        deleted_contract = await prisma.contract.delete(where={"id": contract_id})

        return create_response(data=ContractResponse.model_validate(deleted_contract))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"계약 삭제 실패: {str(e)}")
        raise server_error_exception(f"계약 삭제 중 오류가 발생했습니다: {str(e)}")


# 계약 결제 관련 엔드포인트 추가


# 계약 결제 생성
@router.post(
    "/{contract_id}/payments", response_model=ApiResponse[ContractPaymentResponse]
)
async def create_contract_payment(
    payment: ContractPaymentCreate,
    contract_id: str = Path(..., description="결제를 추가할 계약의 ID"),
    prisma=Depends(),
):
    try:
        # 계약 확인
        contract = await prisma.contract.find_unique(where={"id": contract_id})

        if not contract:
            raise not_found_exception("contract", contract_id)

        # 결제 생성
        new_payment = await prisma.contract_payment.create(
            data={
                "contract_id": contract_id,
                "payment_date": payment.payment_date,
                "amount": payment.amount,
                "payment_type": payment.payment_type,
                "reference_number": payment.reference_number,
                "notes": payment.notes,
            }
        )

        return create_response(data=ContractPaymentResponse.model_validate(new_payment))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"계약 결제 생성 실패: {str(e)}")
        raise server_error_exception(f"계약 결제 생성 중 오류가 발생했습니다: {str(e)}")


# 계약의 모든 결제 조회
@router.get(
    "/{contract_id}/payments", response_model=ApiResponse[List[ContractPaymentResponse]]
)
async def get_contract_payments(
    contract_id: str = Path(..., description="결제를 조회할 계약의 ID"),
    prisma=Depends(),
):
    try:
        # 계약 확인
        contract = await prisma.contract.find_unique(where={"id": contract_id})

        if not contract:
            raise not_found_exception("contract", contract_id)

        # 결제 내역 조회
        payments = await prisma.contract_payment.find_many(
            where={"contract_id": contract_id}, order={"payment_date": "desc"}
        )

        payment_responses = [
            ContractPaymentResponse.model_validate(payment) for payment in payments
        ]

        return create_response(data=payment_responses)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"계약 결제 조회 실패: {str(e)}")
        raise server_error_exception(f"계약 결제 조회 중 오류가 발생했습니다: {str(e)}")


# 특정 계약 결제 조회
@router.get(
    "/{contract_id}/payments/{payment_id}",
    response_model=ApiResponse[ContractPaymentResponse],
)
async def get_contract_payment(
    contract_id: str = Path(..., description="계약 ID"),
    payment_id: str = Path(..., description="조회할 결제 ID"),
    prisma=Depends(),
):
    try:
        # 결제 확인
        payment = await prisma.contract_payment.find_first(
            where={"id": payment_id, "contract_id": contract_id}
        )

        if not payment:
            raise not_found_exception("payment", payment_id)

        return create_response(data=ContractPaymentResponse.model_validate(payment))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"계약 결제 조회 실패: {str(e)}")
        raise server_error_exception(f"계약 결제 조회 중 오류가 발생했습니다: {str(e)}")


# 계약 결제 업데이트
@router.patch(
    "/{contract_id}/payments/{payment_id}",
    response_model=ApiResponse[ContractPaymentResponse],
)
async def update_contract_payment(
    payment_update: ContractPaymentUpdate,
    contract_id: str = Path(..., description="계약 ID"),
    payment_id: str = Path(..., description="업데이트할 결제 ID"),
    prisma=Depends(),
):
    try:
        # 결제 확인
        existing_payment = await prisma.contract_payment.find_first(
            where={"id": payment_id, "contract_id": contract_id}
        )

        if not existing_payment:
            raise not_found_exception("payment", payment_id)

        # 업데이트할 데이터 구성
        update_data = {
            k: v for k, v in payment_update.model_dump(exclude_unset=True).items()
        }

        # 결제 업데이트
        updated_payment = await prisma.contract_payment.update(
            where={"id": payment_id}, data=update_data
        )

        return create_response(
            data=ContractPaymentResponse.model_validate(updated_payment)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"계약 결제 업데이트 실패: {str(e)}")
        raise server_error_exception(
            f"계약 결제 업데이트 중 오류가 발생했습니다: {str(e)}"
        )


# 계약 결제 삭제
@router.delete(
    "/{contract_id}/payments/{payment_id}",
    response_model=ApiResponse[ContractPaymentResponse],
)
async def delete_contract_payment(
    contract_id: str = Path(..., description="계약 ID"),
    payment_id: str = Path(..., description="삭제할 결제 ID"),
    prisma=Depends(),
):
    try:
        # 결제 확인
        existing_payment = await prisma.contract_payment.find_first(
            where={"id": payment_id, "contract_id": contract_id}
        )

        if not existing_payment:
            raise not_found_exception("payment", payment_id)

        # 결제 삭제
        deleted_payment = await prisma.contract_payment.delete(where={"id": payment_id})

        return create_response(
            data=ContractPaymentResponse.model_validate(deleted_payment)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"계약 결제 삭제 실패: {str(e)}")
        raise server_error_exception(f"계약 결제 삭제 중 오류가 발생했습니다: {str(e)}")
