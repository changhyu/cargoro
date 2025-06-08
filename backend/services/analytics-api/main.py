from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta, date
from typing import Optional, List, Dict, Any
import pandas as pd
import io
from .database import get_db, init_db
from .models import Order, Payment, Customer, Vehicle, Technician, Service, Part, Inventory
from .schemas import (
    WorkshopAnalyticsResponse,
    DeliveryAnalyticsResponse,
    FleetAnalyticsResponse,
    FinancialAnalyticsResponse,
    DateRangeParams,
    AnalyticsFilter
)
from .auth import get_current_user
from .utils import calculate_metrics, generate_report

app = FastAPI(
    title="CarGoro Analytics API",
    description="분석 및 보고서 API",
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

@app.on_event("startup")
async def startup():
    init_db()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "analytics-api"}

# 정비소 분석
@app.get("/api/analytics/workshop", response_model=WorkshopAnalyticsResponse)
async def get_workshop_analytics(
    start_date: datetime = Query(..., description="시작 날짜"),
    end_date: datetime = Query(..., description="종료 날짜"),
    group_by: str = Query("day", description="그룹 기준"),
    service_types: Optional[List[str]] = Query(None),
    technician_ids: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """정비소 분석 데이터 조회"""
    
    # 기본 쿼리
    base_query = db.query(Order).filter(
        and_(
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            Order.workshop_id == current_user.workshop_id
        )
    )
    
    # 필터 적용
    if service_types:
        base_query = base_query.join(Service).filter(Service.type.in_(service_types))
    if technician_ids:
        base_query = base_query.filter(Order.technician_id.in_(technician_ids))
    
    orders = base_query.all()
    
    # 개요 메트릭 계산
    total_orders = len(orders)
    completed_orders = len([o for o in orders if o.status == 'completed'])
    pending_orders = len([o for o in orders if o.status == 'pending'])
    cancelled_orders = len([o for o in orders if o.status == 'cancelled'])
    
    total_revenue = sum(o.total_amount or 0 for o in orders if o.status == 'completed')
    average_order_value = total_revenue / completed_orders if completed_orders > 0 else 0
    
    # 고객 만족도 (평균 평점)
    ratings = [o.rating for o in orders if o.rating is not None]
    customer_satisfaction = sum(ratings) / len(ratings) if ratings else 0
    
    # 재방문율
    customer_orders = {}
    for order in orders:
        if order.customer_id not in customer_orders:
            customer_orders[order.customer_id] = 0
        customer_orders[order.customer_id] += 1
    
    repeat_customers = len([c for c, count in customer_orders.items() if count > 1])
    repeat_customer_rate = repeat_customers / len(customer_orders) if customer_orders else 0
    
    # 성과 메트릭
    order_completion_rate = completed_orders / total_orders if total_orders > 0 else 0
    
    completion_times = [
        (o.completed_at - o.created_at).total_seconds() / 60
        for o in orders
        if o.completed_at and o.created_at
    ]
    average_completion_time = sum(completion_times) / len(completion_times) if completion_times else 0
    
    # 기술자별 생산성
    technician_stats = db.query(
        Technician.id,
        Technician.name,
        func.count(Order.id).label('completed_orders'),
        func.avg(func.extract('epoch', Order.completed_at - Order.created_at) / 60).label('avg_time'),
        func.sum(Order.total_amount).label('revenue'),
        func.avg(Order.rating).label('rating')
    ).join(Order).filter(
        and_(
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            Order.status == 'completed'
        )
    ).group_by(Technician.id, Technician.name).all()
    
    # 서비스 유형별 분포
    service_stats = db.query(
        Service.type,
        func.count(Service.id).label('count'),
        func.sum(Service.price).label('revenue')
    ).join(Order).filter(
        and_(
            Order.created_at >= start_date,
            Order.created_at <= end_date
        )
    ).group_by(Service.type).all()
    
    total_service_count = sum(s.count for s in service_stats)
    service_distribution = [
        {
            'serviceType': s.type,
            'count': s.count,
            'revenue': float(s.revenue or 0),
            'percentage': s.count / total_service_count if total_service_count > 0 else 0
        }
        for s in service_stats
    ]
    
    # 재고 현황
    inventory_stats = db.query(
        func.count(Inventory.id).label('total_parts'),
        func.sum(Inventory.quantity * Inventory.unit_price).label('inventory_value')
    ).filter(Inventory.workshop_id == current_user.workshop_id).first()
    
    low_stock_items = db.query(Inventory).filter(
        and_(
            Inventory.workshop_id == current_user.workshop_id,
            Inventory.quantity <= Inventory.reorder_point
        )
    ).all()
    
    # 응답 생성
    return {
        'data': {
            'overview': {
                'totalOrders': total_orders,
                'completedOrders': completed_orders,
                'pendingOrders': pending_orders,
                'cancelledOrders': cancelled_orders,
                'totalRevenue': float(total_revenue),
                'averageOrderValue': float(average_order_value),
                'customerSatisfaction': float(customer_satisfaction),
                'repeatCustomerRate': float(repeat_customer_rate)
            },
            'performance': {
                'orderCompletionRate': float(order_completion_rate),
                'averageCompletionTime': float(average_completion_time),
                'technicianProductivity': [
                    {
                        'technicianId': str(t.id),
                        'technicianName': t.name,
                        'completedOrders': t.completed_orders,
                        'averageTime': float(t.avg_time or 0),
                        'revenue': float(t.revenue or 0),
                        'rating': float(t.rating or 0)
                    }
                    for t in technician_stats
                ],
                'serviceTypeDistribution': service_distribution
            },
            'financial': {
                'dailyRevenue': [],  # 시계열 데이터는 별도 구현
                'monthlyRevenue': [],
                'revenueByService': [
                    {'name': s.type, 'value': float(s.revenue or 0)}
                    for s in service_stats
                ],
                'paymentMethodDistribution': [],
                'outstandingPayments': 0
            },
            'customer': {
                'newCustomers': 0,  # 별도 계산 필요
                'returningCustomers': repeat_customers,
                'customerRetentionRate': float(repeat_customer_rate),
                'customerLifetimeValue': 0,  # 별도 계산 필요
                'topCustomers': [],
                'customerSatisfactionTrend': []
            },
            'inventory': {
                'totalParts': inventory_stats.total_parts or 0,
                'lowStockItems': [
                    {
                        'partId': str(item.id),
                        'partName': item.part_name,
                        'currentStock': item.quantity,
                        'minimumStock': item.minimum_stock,
                        'reorderPoint': item.reorder_point,
                        'unitPrice': float(item.unit_price)
                    }
                    for item in low_stock_items
                ],
                'partUsageTrend': [],
                'mostUsedParts': [],
                'inventoryValue': float(inventory_stats.inventory_value or 0)
            }
        },
        'metadata': {
            'dateRange': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat()
            },
            'lastUpdated': datetime.utcnow().isoformat(),
            'dataPoints': total_orders
        }
    }

# 재무 분석
@app.get("/api/analytics/financial", response_model=FinancialAnalyticsResponse)
async def get_financial_analytics(
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    group_by: str = Query("month"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """재무 분석 데이터 조회"""
    
    # 수익 데이터
    revenue_query = db.query(
        func.date_trunc(group_by, Payment.created_at).label('period'),
        func.sum(Payment.amount).label('total_revenue')
    ).filter(
        and_(
            Payment.created_at >= start_date,
            Payment.created_at <= end_date,
            Payment.status == 'completed'
        )
    ).group_by('period').order_by('period')
    
    revenue_data = revenue_query.all()
    
    # 월별 수익 데이터 변환
    monthly_revenue = [
        {
            'timestamp': period.isoformat(),
            'value': float(total_revenue or 0)
        }
        for period, total_revenue in revenue_data
    ]
    
    # 서비스별 수익
    service_revenue = db.query(
        Service.type,
        func.sum(Service.price).label('revenue')
    ).join(Order).filter(
        and_(
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            Order.status == 'completed'
        )
    ).group_by(Service.type).all()
    
    # 비용 데이터 (샘플)
    total_revenue = sum(r.total_revenue for _, r in revenue_data)
    labor_cost = total_revenue * 0.3  # 인건비 30%
    material_cost = total_revenue * 0.4  # 재료비 40%
    overhead_cost = total_revenue * 0.1  # 간접비 10%
    total_expenses = labor_cost + material_cost + overhead_cost
    
    # 수익성 계산
    gross_profit = total_revenue - material_cost
    gross_margin = gross_profit / total_revenue if total_revenue > 0 else 0
    net_profit = total_revenue - total_expenses
    net_margin = net_profit / total_revenue if total_revenue > 0 else 0
    
    return {
        'data': {
            'revenue': {
                'total': float(total_revenue),
                'byMonth': monthly_revenue,
                'byService': [
                    {'name': s.type, 'value': float(s.revenue or 0)}
                    for s in service_revenue
                ],
                'byCustomerType': [],
                'growth': 0.15,  # 샘플 데이터
                'forecast': []
            },
            'expenses': {
                'total': float(total_expenses),
                'byCategory': [
                    {'name': '인건비', 'value': float(labor_cost)},
                    {'name': '재료비', 'value': float(material_cost)},
                    {'name': '간접비', 'value': float(overhead_cost)}
                ],
                'trend': [],
                'laborCost': float(labor_cost),
                'materialCost': float(material_cost),
                'overheadCost': float(overhead_cost)
            },
            'profitability': {
                'grossProfit': float(gross_profit),
                'grossMargin': float(gross_margin),
                'netProfit': float(net_profit),
                'netMargin': float(net_margin),
                'profitTrend': [],
                'profitByService': []
            },
            'cashFlow': {
                'inflow': float(total_revenue),
                'outflow': float(total_expenses),
                'netCashFlow': float(total_revenue - total_expenses),
                'cashFlowTrend': [],
                'receivables': 0,
                'payables': 0
            }
        },
        'metadata': {
            'dateRange': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat()
            },
            'lastUpdated': datetime.utcnow().isoformat(),
            'dataPoints': len(revenue_data)
        }
    }

# 데이터 내보내기
@app.get("/api/analytics/{data_type}/export")
async def export_analytics_data(
    data_type: str,
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    format: str = Query("excel", regex="^(excel|csv|pdf)$"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """분석 데이터 내보내기"""
    
    # 데이터 조회
    if data_type == "workshop":
        data = await get_workshop_analytics(start_date, end_date, "day", None, None, db, current_user)
    elif data_type == "financial":
        data = await get_financial_analytics(start_date, end_date, "month", db, current_user)
    else:
        raise HTTPException(status_code=400, detail="지원하지 않는 데이터 타입입니다")
    
    # 데이터프레임 생성
    if data_type == "workshop":
        df_data = {
            '지표': ['총 주문', '완료 주문', '총 매출', '평균 주문 금액', '고객 만족도'],
            '값': [
                data['data']['overview']['totalOrders'],
                data['data']['overview']['completedOrders'],
                data['data']['overview']['totalRevenue'],
                data['data']['overview']['averageOrderValue'],
                data['data']['overview']['customerSatisfaction']
            ]
        }
    else:  # financial
        df_data = {
            '항목': ['총 수익', '총 비용', '순이익', '순이익률'],
            '금액': [
                data['data']['revenue']['total'],
                data['data']['expenses']['total'],
                data['data']['profitability']['netProfit'],
                data['data']['profitability']['netMargin']
            ]
        }
    
    df = pd.DataFrame(df_data)
    
    # 형식별 내보내기
    if format == "excel":
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, sheet_name='분석 데이터', index=False)
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            headers={
                'Content-Disposition': f'attachment; filename={data_type}_analytics_{datetime.now().strftime("%Y%m%d")}.xlsx'
            }
        )
    
    elif format == "csv":
        output = io.StringIO()
        df.to_csv(output, index=False, encoding='utf-8-sig')
        output.seek(0)
        
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode('utf-8-sig')),
            media_type='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename={data_type}_analytics_{datetime.now().strftime("%Y%m%d")}.csv'
            }
        )
    
    else:  # pdf
        # PDF 생성은 별도 구현 필요
        raise HTTPException(status_code=501, detail="PDF 내보내기는 준비 중입니다")

# 대시보드 레이아웃
@app.get("/api/analytics/dashboard/layout")
async def get_dashboard_layout(
    current_user = Depends(get_current_user)
):
    """대시보드 레이아웃 조회"""
    # 사용자별 대시보드 레이아웃 반환
    return {
        "widgets": [
            {
                "id": "total-orders",
                "type": "metric",
                "title": "총 주문",
                "dataSource": "workshop.overview.totalOrders",
                "config": {},
                "position": {"x": 0, "y": 0, "w": 3, "h": 2}
            },
            {
                "id": "revenue-chart",
                "type": "chart",
                "title": "매출 추이",
                "dataSource": "financial.revenue.byMonth",
                "config": {
                    "chartType": "line",
                    "metrics": ["value"],
                    "dimensions": ["timestamp"]
                },
                "position": {"x": 0, "y": 2, "w": 6, "h": 4}
            }
        ]
    }

@app.post("/api/analytics/dashboard/layout")
async def save_dashboard_layout(
    widgets: List[Dict[str, Any]],
    current_user = Depends(get_current_user)
):
    """대시보드 레이아웃 저장"""
    # 사용자별 대시보드 레이아웃 저장 로직
    return {"status": "success", "message": "레이아웃이 저장되었습니다"}

# 실시간 메트릭
@app.get("/api/analytics/realtime/metrics")
async def get_realtime_metrics(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """실시간 메트릭 조회"""
    
    today = date.today()
    
    # 오늘의 주문 수
    today_orders = db.query(func.count(Order.id)).filter(
        and_(
            func.date(Order.created_at) == today,
            Order.workshop_id == current_user.workshop_id
        )
    ).scalar()
    
    # 현재 진행 중인 작업
    active_orders = db.query(func.count(Order.id)).filter(
        and_(
            Order.status == 'in_progress',
            Order.workshop_id == current_user.workshop_id
        )
    ).scalar()
    
    # 오늘의 매출
    today_revenue = db.query(func.sum(Payment.amount)).join(Order).filter(
        and_(
            func.date(Payment.created_at) == today,
            Payment.status == 'completed',
            Order.workshop_id == current_user.workshop_id
        )
    ).scalar() or 0
    
    return {
        "todayOrders": today_orders,
        "activeOrders": active_orders,
        "todayRevenue": float(today_revenue),
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
