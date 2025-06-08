from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import os
import requests
import base64
from .database import get_db, init_db
from .models import Payment, PaymentMethod, Subscription, PointTransaction, User
from .schemas import (
    PaymentCreateRequest,
    PaymentConfirmRequest,
    PaymentCancelRequest,
    PaymentResponse,
    PaymentMethodResponse,
    SubscriptionResponse,
    PointsResponse,
    WebhookPayload
)
from .auth import get_current_user

app = FastAPI(
    title="CarGoro Payment API",
    description="결제 및 구독 관리 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 토스페이먼츠 설정
TOSS_SECRET_KEY = os.getenv("TOSS_SECRET_KEY", "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R")
TOSS_API_URL = "https://api.tosspayments.com/v1"

def get_toss_headers():
    """토스페이먼츠 API 헤더 생성"""
    auth = base64.b64encode(f"{TOSS_SECRET_KEY}:".encode()).decode()
    return {
        "Authorization": f"Basic {auth}",
        "Content-Type": "application/json"
    }

@app.on_event("startup")
async def startup():
    """서버 시작 시 DB 초기화"""
    init_db()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "payment-api"}

# 결제 관련 엔드포인트
@app.post("/api/payments", response_model=PaymentResponse)
async def create_payment(
    request: PaymentCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """결제 요청 생성"""
    payment = Payment(
        order_id=request.order_id,
        order_name=request.order_name,
        customer_id=current_user.id,
        amount=request.amount,
        status="READY",
        created_at=datetime.utcnow()
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    return PaymentResponse.from_orm(payment)

@app.post("/api/payments/confirm")
async def confirm_payment(
    request: PaymentConfirmRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """결제 승인"""
    # 토스페이먼츠 API 호출
    response = requests.post(
        f"{TOSS_API_URL}/payments/confirm",
        json={
            "paymentKey": request.payment_key,
            "orderId": request.order_id,
            "amount": request.amount
        },
        headers=get_toss_headers()
    )
    
    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.json()
        )
    
    payment_data = response.json()
    
    # DB 업데이트
    payment = db.query(Payment).filter(Payment.order_id == request.order_id).first()
    if payment:
        payment.payment_key = payment_data["paymentKey"]
        payment.status = payment_data["status"]
        payment.method = payment_data["method"]
        payment.approved_at = datetime.fromisoformat(payment_data["approvedAt"].replace("Z", "+00:00"))
        db.commit()
    
    # 포인트 적립 (백그라운드)
    background_tasks.add_task(
        award_points,
        payment.customer_id,
        int(payment.amount * 0.01),  # 1% 적립
        f"{payment.order_name} 구매",
        db
    )
    
    return payment_data

@app.post("/api/payments/{payment_key}/cancel")
async def cancel_payment(
    payment_key: str,
    request: PaymentCancelRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """결제 취소"""
    # 권한 확인
    payment = db.query(Payment).filter(
        Payment.payment_key == payment_key,
        Payment.customer_id == current_user.id
    ).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="결제 정보를 찾을 수 없습니다")
    
    # 토스페이먼츠 API 호출
    response = requests.post(
        f"{TOSS_API_URL}/payments/{payment_key}/cancel",
        json={
            "cancelReason": request.cancel_reason,
            **({"cancelAmount": request.cancel_amount} if request.cancel_amount else {})
        },
        headers=get_toss_headers()
    )
    
    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.json()
        )
    
    cancel_data = response.json()
    
    # DB 업데이트
    payment.status = cancel_data["status"]
    payment.cancelled_at = datetime.utcnow()
    db.commit()
    
    return cancel_data

@app.get("/api/payments/history")
async def get_payment_history(
    status: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """결제 내역 조회"""
    query = db.query(Payment).filter(Payment.customer_id == current_user.id)
    
    if status:
        query = query.filter(Payment.status == status)
    
    total = query.count()
    payments = query.order_by(Payment.created_at.desc()).offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "payments": [PaymentResponse.from_orm(p) for p in payments]
    }

# 결제 수단 관련 엔드포인트
@app.get("/api/payment-methods", response_model=List[PaymentMethodResponse])
async def get_payment_methods(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """결제 수단 목록 조회"""
    methods = db.query(PaymentMethod).filter(
        PaymentMethod.customer_id == current_user.id,
        PaymentMethod.is_active == True
    ).all()
    
    return [PaymentMethodResponse.from_orm(m) for m in methods]

@app.delete("/api/payment-methods/{method_id}")
async def delete_payment_method(
    method_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """결제 수단 삭제"""
    method = db.query(PaymentMethod).filter(
        PaymentMethod.id == method_id,
        PaymentMethod.customer_id == current_user.id
    ).first()
    
    if not method:
        raise HTTPException(status_code=404, detail="결제 수단을 찾을 수 없습니다")
    
    method.is_active = False
    db.commit()
    
    return {"message": "결제 수단이 삭제되었습니다"}

# 구독 관련 엔드포인트
@app.get("/api/subscriptions", response_model=List[SubscriptionResponse])
async def get_subscriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """구독 목록 조회"""
    subscriptions = db.query(Subscription).filter(
        Subscription.customer_id == current_user.id
    ).all()
    
    return [SubscriptionResponse.from_orm(s) for s in subscriptions]

@app.post("/api/subscriptions")
async def create_subscription(
    plan_id: str,
    payment_method_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """구독 신청"""
    # 플랜 정보 조회 (실제로는 별도 테이블)
    plan = get_subscription_plan(plan_id)
    
    if not plan:
        raise HTTPException(status_code=404, detail="구독 플랜을 찾을 수 없습니다")
    
    # 빌링키로 첫 결제
    # ... 토스페이먼츠 빌링 API 호출 ...
    
    subscription = Subscription(
        customer_id=current_user.id,
        plan_id=plan_id,
        plan_name=plan["name"],
        amount=plan["amount"],
        billing_cycle=plan["interval"],
        status="ACTIVE",
        current_period_start=datetime.utcnow(),
        current_period_end=datetime.utcnow() + timedelta(days=30),
        next_billing_date=datetime.utcnow() + timedelta(days=30),
        created_at=datetime.utcnow()
    )
    
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    
    return SubscriptionResponse.from_orm(subscription)

@app.post("/api/subscriptions/{subscription_id}/cancel")
async def cancel_subscription(
    subscription_id: str,
    reason: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """구독 취소"""
    subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id,
        Subscription.customer_id == current_user.id
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="구독을 찾을 수 없습니다")
    
    subscription.status = "CANCELLED"
    subscription.cancelled_at = datetime.utcnow()
    subscription.cancel_reason = reason
    db.commit()
    
    return {"message": "구독이 취소되었습니다"}

# 포인트 관련 엔드포인트
@app.get("/api/points", response_model=PointsResponse)
async def get_user_points(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """포인트 조회"""
    # 포인트 계산
    total_points = db.query(func.sum(PointTransaction.amount)).filter(
        PointTransaction.user_id == current_user.id
    ).scalar() or 0
    
    # 만료 예정 포인트
    expiring_points = db.query(func.sum(PointTransaction.amount)).filter(
        PointTransaction.user_id == current_user.id,
        PointTransaction.type == "EARN",
        PointTransaction.expires_at <= datetime.utcnow() + timedelta(days=30),
        PointTransaction.expires_at > datetime.utcnow()
    ).scalar() or 0
    
    return PointsResponse(
        user_id=current_user.id,
        total_points=total_points,
        available_points=total_points,
        pending_points=0,
        expiring_points=expiring_points,
        updated_at=datetime.utcnow()
    )

@app.get("/api/points/transactions")
async def get_point_transactions(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """포인트 거래 내역"""
    transactions = db.query(PointTransaction).filter(
        PointTransaction.user_id == current_user.id
    ).order_by(PointTransaction.created_at.desc()).offset(offset).limit(limit).all()
    
    return transactions

@app.post("/api/points/use")
async def use_points(
    order_id: str,
    amount: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """포인트 사용"""
    # 포인트 잔액 확인
    balance = db.query(func.sum(PointTransaction.amount)).filter(
        PointTransaction.user_id == current_user.id
    ).scalar() or 0
    
    if balance < amount:
        raise HTTPException(status_code=400, detail="포인트가 부족합니다")
    
    transaction = PointTransaction(
        user_id=current_user.id,
        type="USE",
        amount=-amount,
        balance=balance - amount,
        description=f"주문 {order_id} 결제",
        order_id=order_id,
        created_at=datetime.utcnow()
    )
    
    db.add(transaction)
    db.commit()
    
    return transaction

# 웹훅 엔드포인트
@app.post("/webhooks/toss-payments")
async def handle_webhook(
    payload: WebhookPayload,
    db: Session = Depends(get_db)
):
    """토스페이먼츠 웹훅 처리"""
    # 웹훅 검증
    # ... 서명 검증 로직 ...
    
    if payload.event_type == "PAYMENT.DONE":
        # 결제 완료 처리
        payment = db.query(Payment).filter(
            Payment.payment_key == payload.data["paymentKey"]
        ).first()
        if payment:
            payment.status = "DONE"
            db.commit()
    
    elif payload.event_type == "PAYMENT.CANCELED":
        # 결제 취소 처리
        payment = db.query(Payment).filter(
            Payment.payment_key == payload.data["paymentKey"]
        ).first()
        if payment:
            payment.status = "CANCELED"
            payment.cancelled_at = datetime.utcnow()
            db.commit()
    
    return {"status": "success"}

# 헬퍼 함수
def get_subscription_plan(plan_id: str):
    """구독 플랜 정보 조회"""
    plans = {
        "basic": {
            "id": "basic",
            "name": "베이직 플랜",
            "amount": 9900,
            "interval": "MONTHLY",
            "features": ["기본 기능", "월 100건 처리"]
        },
        "premium": {
            "id": "premium",
            "name": "프리미엄 플랜",
            "amount": 29900,
            "interval": "MONTHLY",
            "features": ["모든 기능", "무제한 처리", "우선 지원"]
        }
    }
    return plans.get(plan_id)

async def award_points(user_id: str, amount: int, description: str, db: Session):
    """포인트 적립"""
    balance = db.query(func.sum(PointTransaction.amount)).filter(
        PointTransaction.user_id == user_id
    ).scalar() or 0
    
    transaction = PointTransaction(
        user_id=user_id,
        type="EARN",
        amount=amount,
        balance=balance + amount,
        description=description,
        expires_at=datetime.utcnow() + timedelta(days=365),
        created_at=datetime.utcnow()
    )
    
    db.add(transaction)
    db.commit()

from sqlalchemy import func

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
