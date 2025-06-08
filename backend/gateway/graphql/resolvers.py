"""
GraphQL 리졸버 구현
"""
import aiohttp
import json
from typing import Dict, Any, Optional, List
from datetime import datetime
import strawberry
from strawberry.types import Info

from shared.config.settings import settings
from shared.utils.logging_utils import get_logger

logger = get_logger(__name__)

# 마이크로서비스 URL 설정
CORE_API_URL = f"http://core-api:8001/api/v1"
REPAIR_API_URL = f"http://repair-api:8002/api/v1"
PARTS_API_URL = f"http://parts-api:8003/api/v1"
DELIVERY_API_URL = f"http://delivery-api:8004/api/v1"
FLEET_API_URL = f"http://fleet-api:8005/api/v1"

class GraphQLContext:
    """GraphQL 컨텍스트"""
    def __init__(self, request, token: Optional[str] = None):
        self.request = request
        self.token = token
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

async def make_request(
    session: aiohttp.ClientSession,
    method: str,
    url: str,
    headers: Optional[Dict[str, str]] = None,
    data: Optional[Dict[str, Any]] = None,
    params: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """HTTP 요청 헬퍼"""
    try:
        async with session.request(
            method=method,
            url=url,
            headers=headers,
            json=data,
            params=params
        ) as response:
            result = await response.json()
            
            if response.status >= 400:
                error_message = result.get("message", "API 요청 실패")
                logger.error(f"API 요청 실패: {url} - {error_message}")
                raise Exception(error_message)
            
            return result
            
    except aiohttp.ClientError as e:
        logger.error(f"HTTP 요청 오류: {url} - {str(e)}")
        raise Exception(f"서비스 연결 오류: {str(e)}")

# Query 리졸버
async def resolve_me(info: Info) -> Optional[Dict[str, Any]]:
    """현재 사용자 정보 조회"""
    context = info.context
    if not context.token:
        return None
    
    headers = {"Authorization": f"Bearer {context.token}"}
    
    async with aiohttp.ClientSession() as session:
        result = await make_request(
            session,
            "GET",
            f"{CORE_API_URL}/auth/me",
            headers=headers
        )
        
        return result.get("data") if result.get("success") else None

async def resolve_user(info: Info, id: str) -> Optional[Dict[str, Any]]:
    """특정 사용자 정보 조회"""
    context = info.context
    headers = {"Authorization": f"Bearer {context.token}"} if context.token else {}
    
    async with aiohttp.ClientSession() as session:
        result = await make_request(
            session,
            "GET",
            f"{CORE_API_URL}/users/{id}",
            headers=headers
        )
        
        return result.get("data") if result.get("success") else None

async def resolve_users(
    info: Info,
    page: int = 1,
    page_size: int = 20,
    role: Optional[str] = None
) -> List[Dict[str, Any]]:
    """사용자 목록 조회"""
    context = info.context
    headers = {"Authorization": f"Bearer {context.token}"} if context.token else {}
    
    params = {
        "page": page,
        "page_size": page_size
    }
    if role:
        params["role"] = role
    
    async with aiohttp.ClientSession() as session:
        result = await make_request(
            session,
            "GET",
            f"{CORE_API_URL}/users",
            headers=headers,
            params=params
        )
        
        if result.get("success"):
            return result.get("data", {}).get("items", [])
        return []

async def resolve_workshop(info: Info, id: str) -> Optional[Dict[str, Any]]:
    """특정 정비소 정보 조회"""
    async with aiohttp.ClientSession() as session:
        result = await make_request(
            session,
            "GET",
            f"{REPAIR_API_URL}/workshops/{id}"
        )
        
        return result.get("data") if result.get("success") else None

async def resolve_workshops(
    info: Info,
    page: int = 1,
    page_size: int = 20,
    keyword: Optional[str] = None,
    specialty: Optional[str] = None,
    min_rating: Optional[float] = None
) -> List[Dict[str, Any]]:
    """정비소 목록 조회"""
    params = {
        "page": page,
        "page_size": page_size
    }
    if keyword:
        params["keyword"] = keyword
    if specialty:
        params["specialty"] = specialty
    if min_rating is not None:
        params["min_rating"] = min_rating
    
    async with aiohttp.ClientSession() as session:
        result = await make_request(
            session,
            "GET",
            f"{REPAIR_API_URL}/workshops",
            params=params
        )
        
        if result.get("success"):
            return result.get("data", {}).get("items", [])
        return []

# Mutation 리졸버
async def resolve_register(
    info: Info,
    email: str,
    password: str,
    name: str,
    phone_number: Optional[str] = None,
    organization_name: Optional[str] = None
) -> Dict[str, Any]:
    """회원가입"""
    data = {
        "email": email,
        "password": password,
        "name": name
    }
    if phone_number:
        data["phone_number"] = phone_number
    if organization_name:
        data["organization_name"] = organization_name
    
    async with aiohttp.ClientSession() as session:
        result = await make_request(
            session,
            "POST",
            f"{CORE_API_URL}/auth/register",
            data=data
        )
        
        if result.get("success"):
            # 회원가입 후 자동 로그인
            login_result = await make_request(
                session,
                "POST",
                f"{CORE_API_URL}/auth/login",
                data={"username": email, "password": password},
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if login_result.get("success"):
                return login_result.get("data")
        
        raise Exception(result.get("message", "회원가입 실패"))

async def resolve_login(
    info: Info,
    email: str,
    password: str
) -> Dict[str, Any]:
    """로그인"""
    async with aiohttp.ClientSession() as session:
        result = await make_request(
            session,
            "POST",
            f"{CORE_API_URL}/auth/login",
            data={"username": email, "password": password},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if result.get("success"):
            return result.get("data")
        
        raise Exception(result.get("message", "로그인 실패"))

async def resolve_create_repair_request(
    info: Info,
    vehicle_id: str,
    description: str,
    urgency: str = "NORMAL",
    preferred_date: Optional[datetime] = None,
    symptoms: List[str] = []
) -> Dict[str, Any]:
    """정비 요청 생성"""
    context = info.context
    if not context.token:
        raise Exception("인증이 필요합니다")
    
    headers = {"Authorization": f"Bearer {context.token}"}
    data = {
        "vehicle_id": vehicle_id,
        "description": description,
        "urgency": urgency,
        "symptoms": symptoms
    }
    if preferred_date:
        data["preferred_date"] = preferred_date.isoformat()
    
    async with aiohttp.ClientSession() as session:
        result = await make_request(
            session,
            "POST",
            f"{REPAIR_API_URL}/repair-requests",
            headers=headers,
            data=data
        )
        
        if result.get("success"):
            return result.get("data")
        
        raise Exception(result.get("message", "정비 요청 생성 실패"))

async def resolve_create_workshop(
    info: Info,
    name: str,
    address: str,
    phone: str,
    business_number: str,
    description: Optional[str] = None,
    specialties: List[str] = [],
    capacity: int = 10
) -> Dict[str, Any]:
    """정비소 등록"""
    context = info.context
    if not context.token:
        raise Exception("인증이 필요합니다")
    
    headers = {"Authorization": f"Bearer {context.token}"}
    data = {
        "name": name,
        "address": address,
        "phone": phone,
        "business_number": business_number,
        "specialties": specialties,
        "capacity": capacity,
        "operating_hours": {}  # 기본값
    }
    if description:
        data["description"] = description
    
    async with aiohttp.ClientSession() as session:
        result = await make_request(
            session,
            "POST",
            f"{REPAIR_API_URL}/workshops",
            headers=headers,
            data=data
        )
        
        if result.get("success"):
            return result.get("data")
        
        raise Exception(result.get("message", "정비소 등록 실패"))
