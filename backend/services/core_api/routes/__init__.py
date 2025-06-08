"""
Core API Routes Module

인증, 사용자 관리, 조직 관리, 권한 관리 라우터를 제공합니다.
"""

from .auth_routes import router as auth_router
from .user_routes_enhanced import router as user_router
from .organization_routes import router as organization_router
from .permission_routes import router as permission_router

__all__ = ["auth_router", "user_router", "organization_router", "permission_router"]
