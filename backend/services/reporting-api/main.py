from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
import asyncio
import os
from pathlib import Path

app = FastAPI(title="CarGoro Reporting API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 임시 저장소 경로
REPORTS_DIR = Path("./reports")
REPORTS_DIR.mkdir(exist_ok=True)

# Pydantic 모델
class ReportFilter(BaseModel):
    date_range: Optional[str] = "monthly"
    workshop_id: Optional[str] = None
    status: Optional[str] = None

class ReportTemplate(BaseModel):
    id: str
    name: str
    description: str
    type: str
    parameters: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

class ScheduledReport(BaseModel):
    id: str
    template_id: str
    frequency: str  # daily, weekly, monthly
    recipients: List[EmailStr]
    next_run: datetime
    is_active: bool
    created_at: datetime

class ReportGenerationRequest(BaseModel):
    template_id: str
    format: str  # pdf, excel
    filters: Optional[ReportFilter] = None
    send_email: bool = False
    recipients: Optional[List[EmailStr]] = None

class ScheduleReportRequest(BaseModel):
    template_id: str
    frequency: str
    recipients: List[EmailStr]
    start_date: Optional[datetime] = None

# 보고서 서비스
class ReportService:
    def __init__(self):
        self.templates = {}
        self.scheduled_reports = {}
        self._init_default_templates()
    
    def _init_default_templates(self):
        """기본 보고서 템플릿 초기화"""
        default_templates = [
            {
                "id": "monthly_summary",
                "name": "월간 종합 보고서",
                "description": "월간 정비소 운영 현황 종합 보고서",
                "type": "summary",
                "parameters": {
                    "sections": ["revenue", "repairs", "customers", "inventory"]
                }
            },
            {
                "id": "financial_report",
                "name": "재무 보고서",
                "description": "상세 재무 분석 보고서",
                "type": "financial",
                "parameters": {
                    "include_charts": True,
                    "breakdown_by": ["service_type", "payment_method"]
                }
            },
            {
                "id": "repair_analytics",
                "name": "정비 분석 보고서",
                "description": "정비 서비스 상세 분석",
                "type": "repair",
                "parameters": {
                    "metrics": ["completion_time", "service_quality", "technician_performance"]
                }
            },
            {
                "id": "customer_insights",
                "name": "고객 인사이트 보고서",
                "description": "고객 행동 및 만족도 분석",
                "type": "customer",
                "parameters": {
                    "segments": ["new", "returning", "vip"],
                    "include_feedback": True
                }
            },
            {
                "id": "inventory_status",
                "name": "재고 현황 보고서",
                "description": "부품 재고 및 사용 현황",
                "type": "inventory",
                "parameters": {
                    "alert_low_stock": True,
                    "forecast_demand": True
                }
            }
        ]
        
        for template_data in default_templates:
            template = ReportTemplate(
                **template_data,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            self.templates[template.id] = template
    
    async def generate_report_data(self, template_id: str, filters: Optional[ReportFilter] = None) -> Dict[str, Any]:
        """보고서 데이터 생성"""
        template = self.templates.get(template_id)
        if not template:
            raise HTTPException(status_code=404, detail="템플릿을 찾을 수 없습니다")
        
        # 실제로는 데이터베이스에서 데이터를 조회
        # 여기서는 더미 데이터 생성
        report_data = {
            "title": template.name,
            "generated_at": datetime.now().isoformat(),
            "period": filters.date_range if filters else "monthly",
            "data": {}
        }
        
        if template.type == "summary":
            report_data["data"] = {
                "revenue": {
                    "total": 45000000,
                    "growth": 12.5,
                    "by_service": {
                        "정비": 25000000,
                        "탁송": 15000000,
                        "부품판매": 5000000
                    }
                },
                "repairs": {
                    "total_count": 342,
                    "completion_rate": 96.5,
                    "average_time": "3.2시간",
                    "by_type": {
                        "정기점검": 120,
                        "엔진정비": 85,
                        "차체수리": 67,
                        "기타": 70
                    }
                },
                "customers": {
                    "total": 892,
                    "new": 156,
                    "retention_rate": 78.3,
                    "satisfaction_score": 4.6
                },
                "inventory": {
                    "total_value": 32000000,
                    "turnover_rate": 4.2,
                    "low_stock_items": 12
                }
            }
        elif template.type == "financial":
            report_data["data"] = {
                "revenue": {
                    "monthly_trend": [
                        {"month": "1월", "amount": 38000000},
                        {"month": "2월", "amount": 41000000},
                        {"month": "3월", "amount": 45000000}
                    ],
                    "by_payment": {
                        "현금": 13500000,
                        "카드": 27000000,
                        "계좌이체": 4500000
                    }
                },
                "expenses": {
                    "total": 28000000,
                    "categories": {
                        "인건비": 15000000,
                        "부품구매": 8000000,
                        "운영비": 3000000,
                        "기타": 2000000
                    }
                },
                "profit": {
                    "gross": 17000000,
                    "net": 12000000,
                    "margin": 26.7
                }
            }
        elif template.type == "repair":
            report_data["data"] = {
                "performance": {
                    "average_completion_time": "3.2시간",
                    "on_time_rate": 94.5,
                    "rework_rate": 2.1,
                    "technician_utilization": 87.3
                },
                "service_breakdown": {
                    "by_category": [
                        {"category": "엔진", "count": 120, "revenue": 12000000},
                        {"category": "브레이크", "count": 98, "revenue": 5880000},
                        {"category": "서스펜션", "count": 76, "revenue": 4560000},
                        {"category": "전기계통", "count": 48, "revenue": 2400000}
                    ]
                },
                "quality_metrics": {
                    "customer_complaints": 8,
                    "warranty_claims": 3,
                    "repeat_repairs": 5
                }
            }
        elif template.type == "customer":
            report_data["data"] = {
                "demographics": {
                    "age_groups": {
                        "20-30": 156,
                        "31-40": 298,
                        "41-50": 267,
                        "51+": 171
                    },
                    "vehicle_types": {
                        "승용차": 567,
                        "SUV": 198,
                        "트럭": 89,
                        "기타": 38
                    }
                },
                "behavior": {
                    "visit_frequency": {
                        "주1회": 45,
                        "월1회": 234,
                        "분기1회": 389,
                        "연1회": 224
                    },
                    "average_spend": 125000,
                    "service_preferences": {
                        "정기점검": 456,
                        "긴급수리": 234,
                        "예약정비": 202
                    }
                },
                "satisfaction": {
                    "overall_score": 4.6,
                    "by_aspect": {
                        "서비스품질": 4.7,
                        "가격만족도": 4.2,
                        "대기시간": 4.4,
                        "직원친절도": 4.8
                    },
                    "net_promoter_score": 72
                }
            }
        else:  # inventory
            report_data["data"] = {
                "overview": {
                    "total_items": 1234,
                    "total_value": 32000000,
                    "categories": 45,
                    "suppliers": 23
                },
                "stock_levels": {
                    "optimal": 892,
                    "low": 234,
                    "critical": 78,
                    "overstocked": 30
                },
                "movement": {
                    "monthly_usage": [
                        {"category": "엔진부품", "quantity": 234, "value": 8900000},
                        {"category": "브레이크", "quantity": 189, "value": 4500000},
                        {"category": "필터류", "quantity": 567, "value": 2800000},
                        {"category": "오일류", "quantity": 890, "value": 3200000}
                    ],
                    "turnover_days": {
                        "fast_moving": 15,
                        "slow_moving": 45,
                        "dead_stock": 120
                    }
                },
                "predictions": {
                    "next_month_demand": {
                        "엔진오일": 120,
                        "브레이크패드": 85,
                        "에어필터": 200,
                        "타이어": 40
                    }
                }
            }
        
        return report_data
    
    async def create_pdf_report(self, data: Dict[str, Any], filename: str) -> str:
        """PDF 보고서 생성 (실제로는 PDF 라이브러리 사용)"""
        # 실제 구현에서는 reportlab 또는 weasyprint 사용
        file_path = REPORTS_DIR / f"{filename}.pdf"
        
        # 더미 PDF 파일 생성
        with open(file_path, "w") as f:
            f.write("PDF Report Content")
        
        return str(file_path)
    
    async def create_excel_report(self, data: Dict[str, Any], filename: str) -> str:
        """Excel 보고서 생성 (실제로는 openpyxl 사용)"""
        # 실제 구현에서는 openpyxl 또는 pandas 사용
        file_path = REPORTS_DIR / f"{filename}.xlsx"
        
        # 더미 Excel 파일 생성
        with open(file_path, "w") as f:
            f.write("Excel Report Content")
        
        return str(file_path)
    
    async def send_report_email(self, file_path: str, recipients: List[str]):
        """이메일로 보고서 발송"""
        # 실제 구현에서는 이메일 서비스 사용
        print(f"보고서를 다음 수신자에게 발송: {recipients}")
        await asyncio.sleep(1)  # 이메일 발송 시뮬레이션

report_service = ReportService()

# API 엔드포인트
@app.get("/templates", response_model=List[ReportTemplate])
async def get_report_templates():
    """사용 가능한 보고서 템플릿 목록 조회"""
    return list(report_service.templates.values())

@app.get("/templates/{template_id}", response_model=ReportTemplate)
async def get_report_template(template_id: str):
    """특정 보고서 템플릿 조회"""
    template = report_service.templates.get(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="템플릿을 찾을 수 없습니다")
    return template

@app.post("/generate")
async def generate_report(
    request: ReportGenerationRequest,
    background_tasks: BackgroundTasks
):
    """보고서 생성"""
    # 보고서 데이터 생성
    report_data = await report_service.generate_report_data(
        request.template_id,
        request.filters
    )
    
    # 파일명 생성
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{request.template_id}_{timestamp}"
    
    # 보고서 파일 생성
    if request.format == "pdf":
        file_path = await report_service.create_pdf_report(report_data, filename)
    else:  # excel
        file_path = await report_service.create_excel_report(report_data, filename)
    
    # 이메일 발송 (백그라운드)
    if request.send_email and request.recipients:
        background_tasks.add_task(
            report_service.send_report_email,
            file_path,
            request.recipients
        )
    
    return {
        "status": "success",
        "file_path": file_path,
        "download_url": f"/download/{os.path.basename(file_path)}",
        "data": report_data
    }

@app.get("/download/{filename}")
async def download_report(filename: str):
    """보고서 파일 다운로드"""
    file_path = REPORTS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/octet-stream"
    )

@app.post("/schedule")
async def schedule_report(request: ScheduleReportRequest):
    """보고서 예약 생성"""
    # 다음 실행 시간 계산
    start_date = request.start_date or datetime.now()
    if request.frequency == "daily":
        next_run = start_date + timedelta(days=1)
    elif request.frequency == "weekly":
        next_run = start_date + timedelta(weeks=1)
    else:  # monthly
        next_run = start_date + timedelta(days=30)
    
    scheduled_report = ScheduledReport(
        id=f"schedule_{len(report_service.scheduled_reports) + 1}",
        template_id=request.template_id,
        frequency=request.frequency,
        recipients=request.recipients,
        next_run=next_run,
        is_active=True,
        created_at=datetime.now()
    )
    
    report_service.scheduled_reports[scheduled_report.id] = scheduled_report
    
    return {
        "status": "success",
        "scheduled_report": scheduled_report
    }

@app.get("/scheduled", response_model=List[ScheduledReport])
async def get_scheduled_reports():
    """예약된 보고서 목록 조회"""
    return list(report_service.scheduled_reports.values())

@app.delete("/scheduled/{schedule_id}")
async def delete_scheduled_report(schedule_id: str):
    """예약된 보고서 삭제"""
    if schedule_id not in report_service.scheduled_reports:
        raise HTTPException(status_code=404, detail="예약을 찾을 수 없습니다")
    
    del report_service.scheduled_reports[schedule_id]
    return {"status": "success", "message": "예약이 삭제되었습니다"}

@app.get("/history")
async def get_report_history(
    limit: int = 10,
    offset: int = 0
):
    """보고서 생성 이력 조회"""
    # 실제로는 데이터베이스에서 조회
    history = []
    for i in range(limit):
        history.append({
            "id": f"report_{offset + i + 1}",
            "template_name": "월간 종합 보고서",
            "generated_at": (datetime.now() - timedelta(days=i)).isoformat(),
            "generated_by": "admin@cargoro.com",
            "format": "pdf" if i % 2 == 0 else "excel",
            "status": "completed"
        })
    
    return {
        "total": 100,
        "items": history
    }

@app.get("/preview/{template_id}")
async def preview_report(
    template_id: str,
    filters: Optional[ReportFilter] = None
):
    """보고서 미리보기 데이터"""
    report_data = await report_service.generate_report_data(template_id, filters)
    return report_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
