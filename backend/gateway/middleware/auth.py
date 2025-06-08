"""
Gateway 인증 미들웨어
"""
from typing import Optional
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from shared.utils.logging_utils import get_logger

logger = get_logger(__name__)

class BearerAuth(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(BearerAuth, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(BearerAuth, self).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                if self.auto_error:
                    raise HTTPException(
                        status_code=403,
                        detail="Invalid authentication scheme."
                    )
                else:
                    return None
            return credentials.credentials
        else:
            if self.auto_error:
                raise HTTPException(
                    status_code=403,
                    detail="Invalid authorization code."
                )
            else:
                return None

# 인증 인스턴스
bearer_auth = BearerAuth(auto_error=False)

async def get_current_token(
    request: Request,
    token: Optional[str] = None
) -> Optional[str]:
    """현재 요청의 토큰 가져오기"""
    # Authorization 헤더에서 토큰 추출
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:]  # "Bearer " 제거
    
    # 또는 bearer_auth 사용
    return await bearer_auth(request)

async def verify_token(token: str) -> Optional[dict]:
    """토큰 검증 (Core API 호출)"""
    # TODO: Core API의 /auth/me 엔드포인트 호출하여 토큰 검증
    # 현재는 임시로 None 반환
    return None
