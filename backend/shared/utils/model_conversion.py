"""
공유 모델 변환 유틸리티 - 백엔드 전체에서 활용 가능
"""
from typing import Dict, Any, List, Optional
import re


def snake_to_camel(snake_str: str) -> str:
    """
    snake_case 문자열을 camelCase로 변환합니다.

    예: "hello_world" -> "helloWorld"
    """
    # 앞뒤 밑줄 처리를 위해 문자열 분리
    prefix = ""
    suffix = ""

    # 앞쪽 밑줄 처리
    if snake_str.startswith("_"):
        # 앞쪽 밑줄 개수 계산
        prefix_len = len(snake_str) - len(snake_str.lstrip("_"))
        prefix = "_" * prefix_len
        snake_str = snake_str[prefix_len:]

    # 뒤쪽 밑줄 처리
    if snake_str.endswith("_"):
        # 뒤쪽 밑줄 개수 계산
        suffix_len = len(snake_str) - len(snake_str.rstrip("_"))
        suffix = "_" * suffix_len
        snake_str = snake_str[:-suffix_len]

    # 비어있는 문자열이면 앞뒤 밑줄만 반환
    if not snake_str:
        return prefix + suffix

    # 기본 변환 로직
    components = snake_str.split('_')
    camel = components[0] + ''.join(x.title() for x in components[1:] if x)

    return prefix + camel + suffix


def camel_to_snake(camel_str: str) -> str:
    """
    camelCase 문자열을 snake_case로 변환합니다.

    예: "helloWorld" -> "hello_world"
    """
    # 첫 번째 패턴: 소문자 뒤의 대문자 앞에 밑줄 삽입
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', camel_str)

    # 두 번째 패턴: 소문자나 숫자 뒤의 대문자 앞에 밑줄 삽입
    s2 = re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1)

    # 소문자로 변환
    return s2.lower()


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


def model_to_db_dict(model_instance, exclude: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Pydantic 모델 인스턴스를 딕셔너리로 변환하고 키를 camelCase로 변환합니다.
    DB 저장용으로 사용합니다.

    :param model_instance: Pydantic 모델 인스턴스
    :param exclude: 제외할 필드 목록
    :return: camelCase 키를 가진 딕셔너리
    """
    exclude = exclude or []

    # Pydantic v2 호환
    if hasattr(model_instance, "model_dump"):
        data = model_instance.model_dump(exclude=set(exclude))
    # Pydantic v1 호환
    else:
        data = model_instance.dict(exclude=set(exclude))

    return convert_dict_keys_to_camel(data)


def db_dict_to_model(data: Dict[str, Any], model_class) -> Any:
    """
    DB에서 가져온 camelCase 키를 가진 딕셔너리를 snake_case로 변환하고
    Pydantic 모델 인스턴스로 변환합니다.

    :param data: camelCase 키를 가진 딕셔너리
    :param model_class: 변환할 Pydantic 모델 클래스
    :return: Pydantic 모델 인스턴스
    """
    # 데이터의 최상위 키만 snake_case로 변환 (중첩된 딕셔너리는 유지)
    snake_case_data = {}
    for key, value in data.items():
        snake_key = camel_to_snake(key)
        snake_case_data[snake_key] = value

    # 모델 인스턴스 생성
    return model_class(**snake_case_data)


def find_camel_case_variables(content: str) -> List[str]:
    """
    코드 문자열에서 camelCase 변수를 찾습니다.

    :param content: 코드 문자열
    :return: 발견된 camelCase 변수 리스트
    """
    # 클래스 속성, 변수 선언, 함수 파라미터 등에서 camelCase 패턴 찾기
    camel_pattern = r'\b[a-z][a-z0-9]*[A-Z][a-zA-Z0-9]*\b'
    camel_vars = set(re.findall(camel_pattern, content))

    # 일부 특수 문자열 제외 (로깅, 예약어 등)
    exclude_list = {
        'hasattr', 'getattr', 'setattr', 'isinstance', 'issubclass',
        'TypeError', 'ValueError', 'IndexError', 'KeyError', 'ImportError',
        'assertEqual', 'assertTrue', 'assertFalse', 'assertRaises',
        'setUp', 'tearDown', 'getLogger', 'fromtimestamp', 'fromordinal',
        'datetime', 'timedelta', 'strftime', 'strptime',
        'HttpResponseRedirect', 'JsonResponse', 'HttpRequest', 'HttpResponse'
    }

    return [v for v in camel_vars if v not in exclude_list]
