from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from typing import Dict, Set, Optional
import json
import asyncio
from datetime import datetime
from ..websocket_manager import WebSocketManager
from ..auth import get_current_user_ws
from ..models import User, Message, Notification
from ..database import get_db
from sqlalchemy.orm import Session

router = APIRouter()
manager = WebSocketManager()

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    client_id: str,
    db: Session = Depends(get_db)
):
    """WebSocket 연결 엔드포인트"""
    await manager.connect(websocket, client_id)
    
    try:
        # 연결 시 초기 데이터 전송
        await websocket.send_json({
            "type": "connection",
            "data": {
                "clientId": client_id,
                "timestamp": datetime.utcnow().isoformat(),
                "status": "connected"
            }
        })
        
        while True:
            # 클라이언트로부터 메시지 수신
            data = await websocket.receive_json()
            await handle_websocket_message(websocket, client_id, data, db)
            
    except WebSocketDisconnect:
        manager.disconnect(client_id)
        await manager.broadcast_to_room(f"user:{client_id}", {
            "type": "userOffline",
            "data": {
                "userId": client_id,
                "timestamp": datetime.utcnow().isoformat()
            }
        })
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(client_id)

async def handle_websocket_message(
    websocket: WebSocket,
    client_id: str,
    data: dict,
    db: Session
):
    """WebSocket 메시지 처리"""
    message_type = data.get("type")
    payload = data.get("data", {})
    
    if message_type == "ping":
        await websocket.send_json({
            "type": "pong",
            "data": {"timestamp": datetime.utcnow().isoformat()}
        })
    
    elif message_type == "joinRoom":
        room_id = payload.get("roomId")
        if room_id:
            manager.join_room(client_id, room_id)
            await websocket.send_json({
                "type": "roomJoined",
                "data": {"roomId": room_id}
            })
    
    elif message_type == "leaveRoom":
        room_id = payload.get("roomId")
        if room_id:
            manager.leave_room(client_id, room_id)
            await websocket.send_json({
                "type": "roomLeft",
                "data": {"roomId": room_id}
            })
    
    elif message_type == "message":
        room_id = payload.get("roomId")
        content = payload.get("content")
        attachments = payload.get("attachments", [])
        
        if room_id and content:
            # 메시지를 DB에 저장
            message = Message(
                room_id=room_id,
                user_id=client_id,
                content=content,
                attachments=json.dumps(attachments),
                timestamp=datetime.utcnow()
            )
            db.add(message)
            db.commit()
            
            # 룸의 모든 사용자에게 메시지 브로드캐스트
            await manager.broadcast_to_room(room_id, {
                "type": "newMessage",
                "data": {
                    "id": str(message.id),
                    "roomId": room_id,
                    "userId": client_id,
                    "content": content,
                    "attachments": attachments,
                    "timestamp": message.timestamp.isoformat()
                }
            })
    
    elif message_type == "typing":
        room_id = payload.get("roomId")
        is_typing = payload.get("isTyping", False)
        
        if room_id:
            # 타이핑 상태를 룸의 다른 사용자에게 브로드캐스트
            await manager.broadcast_to_room(room_id, {
                "type": "userTyping",
                "data": {
                    "roomId": room_id,
                    "userId": client_id,
                    "isTyping": is_typing
                }
            }, exclude_client=client_id)
    
    elif message_type == "updateLocation":
        entity_type = payload.get("entityType")
        entity_id = payload.get("entityId")
        location_data = payload.get("locationData")
        
        if entity_type and entity_id and location_data:
            room_id = f"{entity_type}:{entity_id}"
            
            # 위치 정보 브로드캐스트
            await manager.broadcast_to_room(room_id, {
                "type": "locationUpdate",
                "data": {
                    "entityType": entity_type,
                    "entityId": entity_id,
                    "location": {
                        **location_data,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                }
            })
    
    elif message_type == "updateStatus":
        entity_type = payload.get("entityType")
        entity_id = payload.get("entityId")
        status = payload.get("status")
        additional_data = payload.get("data", {})
        
        if entity_type and entity_id and status:
            # 상태 업데이트 브로드캐스트
            await manager.broadcast({
                "type": f"{entity_type}StatusChanged",
                "data": {
                    f"{entity_type}Id": entity_id,
                    "status": status,
                    **additional_data,
                    "timestamp": datetime.utcnow().isoformat()
                }
            })

@router.post("/api/notifications/send")
async def send_notification(
    user_id: str,
    title: str,
    message: str,
    notification_type: str = "info",
    action: Optional[dict] = None,
    db: Session = Depends(get_db)
):
    """알림 전송 API"""
    # 알림을 DB에 저장
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notification_type,
        action=json.dumps(action) if action else None,
        is_read=False,
        timestamp=datetime.utcnow()
    )
    db.add(notification)
    db.commit()
    
    # WebSocket으로 실시간 알림 전송
    await manager.send_to_client(user_id, {
        "type": "notification",
        "data": {
            "id": str(notification.id),
            "title": title,
            "message": message,
            "type": notification_type,
            "action": action,
            "timestamp": notification.timestamp.isoformat()
        }
    })
    
    return {"status": "success", "notification_id": str(notification.id)}

@router.post("/api/work-orders/{order_id}/broadcast")
async def broadcast_work_order_update(
    order_id: str,
    update_type: str,
    data: dict,
    db: Session = Depends(get_db)
):
    """작업 오더 업데이트 브로드캐스트"""
    await manager.broadcast({
        "type": update_type,
        "data": {
            "workOrderId": order_id,
            **data,
            "timestamp": datetime.utcnow().isoformat()
        }
    })
    
    return {"status": "success", "broadcast": update_type}
