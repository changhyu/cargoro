"""
테스트 유틸리티

테스트에서 공통으로 사용하는 유틸리티 함수와 클래스를 정의합니다.
"""

from typing import Any, Dict, List, Optional, Type, TypeVar, Union
from pydantic import BaseModel
import json
import random
import string
import datetime

T = TypeVar("T", bound=BaseModel)


def random_string(length: int = 10) -> str:
    """랜덤 문자열 생성"""
    return "".join(random.choices(string.ascii_letters + string.digits, k=length))


def random_email() -> str:
    """랜덤 이메일 생성"""
    return f"{random_string(8)}@example.com"


def random_phone() -> str:
    """랜덤 전화번호 생성"""
    return f"010{random.randint(1000, 9999)}{random.randint(1000, 9999)}"


def parse_json_response(response_text: str) -> Dict[str, Any]:
    """JSON 응답 파싱"""
    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        raise ValueError(f"응답이 유효한 JSON 형식이 아닙니다: {response_text}")


def model_to_dict(model: BaseModel) -> Dict[str, Any]:
    """Pydantic 모델을 딕셔너리로 변환"""
    return model.model_dump(exclude_unset=True)


def create_model_dict(model_class: Type[T], **override_attrs) -> Dict[str, Any]:
    """
    테스트용 모델 딕셔너리 생성

    Args:
        model_class: Pydantic 모델 클래스
        **override_attrs: 기본값을 오버라이드할 속성

    Returns:
        모델 클래스의 필드 값이 설정된 딕셔너리
    """
    # 모델의 필드 정보 가져오기
    fields = model_class.__fields__

    # 기본값 설정
    data = {}
    for field_name, field in fields.items():
        # 오버라이드된 값이 있으면 사용
        if field_name in override_attrs:
            data[field_name] = override_attrs[field_name]
            continue

        # 필드 타입에 따라 기본값 생성
        field_type = field.type_

        if field_type == str:
            data[field_name] = random_string()
        elif field_type == int:
            data[field_name] = random.randint(1, 1000)
        elif field_type == float:
            data[field_name] = random.uniform(1.0, 1000.0)
        elif field_type == bool:
            data[field_name] = random.choice([True, False])
        elif field_type == datetime.datetime:
            data[field_name] = datetime.datetime.now()
        elif field_type == datetime.date:
            data[field_name] = datetime.date.today()
        elif field_type == List[str]:
            data[field_name] = [random_string() for _ in range(3)]
        elif field_type == Dict[str, Any]:
            data[field_name] = {"key": random_string()}

    return data
