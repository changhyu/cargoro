"""
설정 패키지

이 패키지는 모든 마이크로서비스에서 공통으로 사용하는 설정을 제공합니다.
"""

from .settings import get_settings, CommonSettings

__all__ = ['get_settings', 'CommonSettings']
