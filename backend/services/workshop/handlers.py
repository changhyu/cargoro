from typing import Dict, Any
from datetime import datetime, timezone
from fastapi import HTTPException

# 수정: shared.models.repair의 RepairJob 모델 가져오기
from shared.models.repair import RepairJob

async def generate_repair_report(repair_id: str, db) -> Dict[str, Any]:
    """정비 리포트를 생성합니다."""
    # 정비 정보 조회
    try:
        repair = await db.repair.find_unique(where={"id": repair_id})
    except Exception as e:
        # DB 오류 처리
        raise HTTPException(status_code=500, detail=f"데이터베이스 오류: {str(e)}")

    if not repair:
        raise HTTPException(status_code=404, detail="정비 기록을 찾을 수 없습니다")

    # 리포트 데이터 생성
    report_data = {
        "repair_id": repair["id"],
        "vehicle_id": repair["vehicle_id"],
        "workshop_id": repair["workshop_id"],
        "description": repair["description"],
        "status": repair["status"],
        "cost": float(repair["cost"]) if repair.get("cost") else 0.0,
        "created_at": repair["created_at"].isoformat() if repair.get("created_at") else None,
        "updated_at": repair["updated_at"].isoformat() if repair.get("updated_at") else None,
    }

    # 수정: datetime.UTC 대신 datetime.timezone.utc 사용
    return {
        "report": report_data,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "format": "json"
    }
