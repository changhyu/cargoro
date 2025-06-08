"""
모델 변환 유틸리티 - 리팩토링 과정에서 snake_case와 camelCase 간 변환 지원
"""
from typing import Dict, Any, List, Optional, Type, TypeVar, Set
from pydantic import BaseModel

T = TypeVar('T', bound=BaseModel)


def snake_to_camel(snake_str: str) -> str:
    """
    snake_case 문자열을 camelCase로 변환합니다.

    예: "hello_world" -> "helloWorld"
    """
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])


def camel_to_snake(camel_str: str) -> str:
    """
    camelCase 문자열을 snake_case로 변환합니다.

    예: "helloWorld" -> "hello_world"
    """
    import re
    snake = re.sub(r'(?<!^)(?=[A-Z])', '_', camel_str).lower()
    return snake


def convert_dict_keys_to_camel(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    딕셔너리의 모든 키를 snake_case에서 camelCase로 변환합니다.
    중첩된 딕셔너리와 리스트도 처리합니다.
    """
    if not isinstance(data, dict):
        return data

    result = {}
    for key, value in data.items():
        # 중첩된 구조 처리
        if isinstance(value, dict):
            value = convert_dict_keys_to_camel(value)
        elif isinstance(value, list):
            value = [
                convert_dict_keys_to_camel(item) if isinstance(item, dict) else item
                for item in value
            ]

        # 키 변환
        camel_key = snake_to_camel(key)
        result[camel_key] = value

    return result


def convert_dict_keys_to_snake(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    딕셔너리의 모든 키를 camelCase에서 snake_case로 변환합니다.
    중첩된 딕셔너리와 리스트도 처리합니다.
    """
    if not isinstance(data, dict):
        return data

    result = {}
    for key, value in data.items():
        # 중첩된 구조 처리
        if isinstance(value, dict):
            value = convert_dict_keys_to_snake(value)
        elif isinstance(value, list):
            value = [
                convert_dict_keys_to_snake(item) if isinstance(item, dict) else item
                for item in value
            ]

        # 키 변환
        snake_key = camel_to_snake(key)
        result[snake_key] = value

    return result


def model_to_db_dict(model_instance: BaseModel, exclude: Optional[Set[str]] = None) -> Dict[str, Any]:
    """
    Pydantic 모델 인스턴스를 camelCase 키를 가진 딕셔너리로 변환합니다.
    DB 작업에 사용됩니다.

    Args:
        model_instance: 변환할 Pydantic 모델 인스턴스
        exclude: 제외할 필드 이름 집합 (snake_case로 지정)

    Returns:
        camelCase 키를 가진 딕셔너리
    """
    data = model_instance.model_dump(exclude=set(exclude or []))
    return convert_dict_keys_to_camel(data)


def db_to_model(model_class: Type[T], db_data: Dict[str, Any]) -> T:
    """
    DB에서 가져온 camelCase 키를 가진 딕셔너리를
    snake_case를 사용하는 Pydantic 모델로 변환합니다.

    Args:
        model_class: 변환할 대상 모델 클래스
        db_data: DB에서 가져온 데이터 (camelCase 키 사용)

    Returns:
        변환된 모델 인스턴스
    """
    snake_data = convert_dict_keys_to_snake(db_data)
    return model_class(**snake_data)
