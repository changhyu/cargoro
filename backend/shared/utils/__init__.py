"""
Shared Utils 패키지

애플리케이션 전체에서 공유되는 유틸리티 함수들을 제공합니다.
"""

from .response_utils import (
    create_response,
    create_error_response,
    create_validation_error_response,
)

# logging_utils 모듈 추가
try:
    from .logging_utils import (
        setup_logger,
        get_request_logger,
    )
except ImportError:
    # 모킹된 환경에서는 기본값 제공
    def setup_logger(*args, **kwargs):
        from unittest.mock import MagicMock

        return MagicMock()

    def get_request_logger(*args, **kwargs):
        from unittest.mock import MagicMock

        return MagicMock()


# model_conversion 모듈 추가
try:
    from .model_conversion import (
        dict_to_model,
        model_to_dict,
        convert_prisma_to_dict,
    )
except ImportError:
    # 모킹된 환경에서는 기본값 제공
    def dict_to_model(*args, **kwargs):
        from unittest.mock import MagicMock

        return MagicMock()

    def model_to_dict(*args, **kwargs):
        return {}

    def convert_prisma_to_dict(*args, **kwargs):
        return {}


__all__ = [
    "create_response",
    "create_error_response",
    "create_validation_error_response",
    "setup_logger",
    "get_request_logger",
    "dict_to_model",
    "model_to_dict",
    "convert_prisma_to_dict",
]
