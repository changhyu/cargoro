"""
FastAPI 백엔드에서 Clerk 토큰 검증 예제

이 예제는 FastAPI 백엔드에서 Clerk JWT 토큰을 검증하는 방법을 보여줍니다.
"""

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import requests
from typing import Dict, List, Optional
import os
import time
import jwt
from pydantic import BaseModel

# 앱 초기화
app = FastAPI(title="Clerk 인증 예제 API")

# JWT 보안 스키마
security = HTTPBearer()

# 환경 변수
CLERK_API_KEY = os.getenv("CLERK_SECRET_KEY")
CLERK_API_URL = "https://api.clerk.dev/v1"
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL", "https://api.clerk.dev/v1/jwks")

# JWKS 캐시
jwks_cache = {"keys": [], "last_updated": 0}
JWKS_CACHE_TTL = 3600  # 1시간


class UserProfile(BaseModel):
    """사용자 프로필 모델"""
    id: str
    first_name: Optional[str]
    last_name: Optional[str]
    email: Optional[str]
    role: Optional[str] = "customer"
    permissions: List[str] = []


def get_jwks():
    """JWKS 가져오기 (캐싱 적용)"""
    global jwks_cache
    
    now = time.time()
    
    # 캐시가 유효한지 확인
    if jwks_cache["keys"] and (now - jwks_cache["last_updated"] < JWKS_CACHE_TTL):
        return jwks_cache["keys"]
    
    # JWKS 새로 가져오기
    try:
        response = requests.get(CLERK_JWKS_URL)
        response.raise_for_status()
        jwks_data = response.json()
        
        jwks_cache = {
            "keys": jwks_data["keys"],
            "last_updated": now
        }
        
        return jwks_cache["keys"]
    except Exception as e:
        print(f"JWKS 가져오기 오류: {e}")
        # 캐시된 키가 있으면 그것을 반환, 아니면 빈 리스트
        return jwks_cache.get("keys", [])


async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """JWT 토큰 검증 및 사용자 정보 반환"""
    token = credentials.credentials
    
    try:
        # JWKS 가져오기
        jwks = get_jwks()
        
        # JWT 헤더 디코딩하여 키 ID(kid) 가져오기
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        
        if not kid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token header"
            )
        
        # 키 ID에 맞는 공개 키 찾기
        rsa_key = None
        for key in jwks:
            if key["kid"] == kid:
                rsa_key = key
                break
        
        if not rsa_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Public key not found"
            )
        
        # 토큰 검증
        payload = jwt.decode(
            token,
            jwt.algorithms.RSAAlgorithm.from_jwk(rsa_key),
            algorithms=["RS256"],
            options={"verify_aud": False}  # 필요에 따라 audience 검증 설정
        )
        
        # 토큰 만료 검증
        if payload.get("exp") and time.time() > payload["exp"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        
        # 사용자 ID 확인
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user ID in token"
            )
        
        # 메타데이터에서 역할 및 권한 가져오기
        metadata = payload.get("metadata", {}) or {}
        
        # 사용자 프로필 반환
        return UserProfile(
            id=user_id,
            first_name=payload.get("first_name", ""),
            last_name=payload.get("last_name", ""),
            email=payload.get("email", ""),
            role=metadata.get("role", "customer"),
            permissions=metadata.get("permissions", [])
        )
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}"
        )


@app.get("/api/me", response_model=UserProfile)
async def get_current_user(user: UserProfile = Depends(verify_token)):
    """현재 인증된 사용자 정보 가져오기"""
    return user


@app.get("/api/protected", response_model=Dict)
async def protected_route(user: UserProfile = Depends(verify_token)):
    """인증이 필요한 보호된 라우트 예제"""
    return {
        "message": "인증 성공! 보호된 데이터에 접근했습니다.",
        "user_id": user.id,
        "role": user.role
    }


@app.get("/api/admin", response_model=Dict)
async def admin_route(user: UserProfile = Depends(verify_token)):
    """관리자 권한이 필요한 라우트 예제"""
    if user.role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자 권한이 필요합니다."
        )
    
    return {
        "message": "관리자 영역에 접근했습니다!",
        "user_id": user.id,
        "role": user.role
    }


@app.get("/api/health")
async def health_check():
    """상태 확인 엔드포인트 (인증 필요 없음)"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
