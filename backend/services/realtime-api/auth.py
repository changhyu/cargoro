from fastapi import WebSocket, HTTPException, status
from typing import Optional
import jwt
import os

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"

async def get_current_user_ws(websocket: WebSocket, token: Optional[str] = None) -> Optional[str]:
    """WebSocket 연결에서 현재 사용자 확인"""
    if not token:
        # 쿼리 파라미터나 헤더에서 토큰 가져오기
        token = websocket.query_params.get("token")
        if not token:
            # 첫 메시지에서 인증 정보를 받을 수도 있음
            return None
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        return user_id
    except jwt.PyJWTError:
        return None

def verify_token(token: str) -> Optional[dict]:
    """JWT 토큰 검증"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def create_access_token(user_id: str) -> str:
    """액세스 토큰 생성"""
    payload = {
        "sub": user_id,
        "type": "access"
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
