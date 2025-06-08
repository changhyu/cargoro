"""
입력 검증 및 SQL Injection 방어
"""
import re
from typing import Any, List, Optional
from fastapi import HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session
import html
import urllib.parse

# SQL Injection 패턴
SQL_INJECTION_PATTERNS = [
    r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b)",
    r"(--|#|\/\*|\*\/)",
    r"(\bOR\b\s*\d+\s*=\s*\d+)",
    r"(\bAND\b\s*\d+\s*=\s*\d+)",
    r"(';|';--|';\s*DROP)",
    r"(\bWAITFOR\s+DELAY\b)",
    r"(\bBENCHMARK\b)",
    r"(xp_cmdshell)",
    r"(INFORMATION_SCHEMA)",
    r"(sys\.tables|sys\.columns)",
]

# XSS 패턴
XSS_PATTERNS = [
    r"<script[^>]*>.*?</script>",
    r"javascript:",
    r"on\w+\s*=",
    r"<iframe[^>]*>",
    r"<object[^>]*>",
    r"<embed[^>]*>",
    r"<img[^>]*onerror\s*=",
    r"<svg[^>]*onload\s*=",
]

# Path Traversal 패턴
PATH_TRAVERSAL_PATTERNS = [
    r"\.\./",
    r"\.\.\\/",
    r"%2e%2e%2f",
    r"%2e%2e%5c",
    r"\.\.%2f",
    r"\.\.%5c",
]

class InputValidator:
    """입력 검증 클래스"""
    
    @staticmethod
    def sanitize_string(value: str, max_length: int = 1000) -> str:
        """문자열 소독"""
        if not value:
            return ""
        
        # 길이 제한
        value = value[:max_length]
        
        # HTML 이스케이프
        value = html.escape(value)
        
        # 특수 문자 제거 (필요시)
        # value = re.sub(r'[^\w\s\-\.]', '', value)
        
        return value.strip()
    
    @staticmethod
    def validate_email(email: str) -> str:
        """이메일 검증"""
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            raise ValueError("유효하지 않은 이메일 형식입니다")
        return email.lower().strip()
    
    @staticmethod
    def validate_phone(phone: str) -> str:
        """전화번호 검증"""
        # 숫자와 하이픈만 허용
        phone = re.sub(r'[^\d\-]', '', phone)
        if len(phone) < 9 or len(phone) > 15:
            raise ValueError("유효하지 않은 전화번호입니다")
        return phone
    
    @staticmethod
    def validate_id(id_value: str) -> str:
        """ID 검증 (UUID 또는 숫자)"""
        # UUID 패턴
        uuid_pattern = r'^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$'
        # 숫자 ID 패턴
        numeric_pattern = r'^\d+$'
        
        if not (re.match(uuid_pattern, id_value.lower()) or re.match(numeric_pattern, id_value)):
            raise ValueError("유효하지 않은 ID 형식입니다")
        
        return id_value
    
    @staticmethod
    def check_sql_injection(value: str) -> bool:
        """SQL Injection 패턴 확인"""
        if not value:
            return False
        
        value_upper = value.upper()
        for pattern in SQL_INJECTION_PATTERNS:
            if re.search(pattern, value_upper, re.IGNORECASE):
                return True
        return False
    
    @staticmethod
    def check_xss(value: str) -> bool:
        """XSS 패턴 확인"""
        if not value:
            return False
        
        for pattern in XSS_PATTERNS:
            if re.search(pattern, value, re.IGNORECASE):
                return True
        return False
    
    @staticmethod
    def check_path_traversal(value: str) -> bool:
        """Path Traversal 패턴 확인"""
        if not value:
            return False
        
        # URL 디코딩
        decoded = urllib.parse.unquote(value)
        
        for pattern in PATH_TRAVERSAL_PATTERNS:
            if re.search(pattern, decoded, re.IGNORECASE):
                return True
        return False
    
    @staticmethod
    def validate_input(value: Any, input_type: str = "string", **kwargs) -> Any:
        """통합 입력 검증"""
        if value is None:
            return None
        
        # 문자열 타입
        if input_type == "string":
            if not isinstance(value, str):
                raise ValueError("문자열이 필요합니다")
            
            # SQL Injection 확인
            if InputValidator.check_sql_injection(value):
                raise ValueError("허용되지 않은 문자가 포함되어 있습니다")
            
            # XSS 확인
            if InputValidator.check_xss(value):
                raise ValueError("허용되지 않은 HTML 태그가 포함되어 있습니다")
            
            # 소독
            return InputValidator.sanitize_string(value, kwargs.get("max_length", 1000))
        
        # 이메일
        elif input_type == "email":
            return InputValidator.validate_email(str(value))
        
        # 전화번호
        elif input_type == "phone":
            return InputValidator.validate_phone(str(value))
        
        # ID
        elif input_type == "id":
            return InputValidator.validate_id(str(value))
        
        # 숫자
        elif input_type == "number":
            try:
                if kwargs.get("integer", False):
                    value = int(value)
                else:
                    value = float(value)
                
                # 범위 확인
                min_val = kwargs.get("min")
                max_val = kwargs.get("max")
                
                if min_val is not None and value < min_val:
                    raise ValueError(f"값은 {min_val} 이상이어야 합니다")
                if max_val is not None and value > max_val:
                    raise ValueError(f"값은 {max_val} 이하여야 합니다")
                
                return value
            except (ValueError, TypeError):
                raise ValueError("유효한 숫자가 아닙니다")
        
        # 날짜
        elif input_type == "date":
            from datetime import datetime
            try:
                if isinstance(value, str):
                    return datetime.fromisoformat(value.replace("Z", "+00:00"))
                return value
            except:
                raise ValueError("유효한 날짜 형식이 아닙니다")
        
        # 불린
        elif input_type == "boolean":
            if isinstance(value, bool):
                return value
            if isinstance(value, str):
                return value.lower() in ("true", "1", "yes", "on")
            return bool(value)
        
        # 리스트
        elif input_type == "list":
            if not isinstance(value, list):
                raise ValueError("리스트가 필요합니다")
            
            # 각 항목 검증
            item_type = kwargs.get("item_type", "string")
            return [
                InputValidator.validate_input(item, item_type, **kwargs)
                for item in value
            ]
        
        return value


class SecureQueryBuilder:
    """안전한 쿼리 빌더"""
    
    @staticmethod
    def build_where_clause(filters: dict, allowed_fields: List[str]) -> tuple[str, dict]:
        """WHERE 절 안전하게 생성"""
        conditions = []
        params = {}
        
        for field, value in filters.items():
            if field not in allowed_fields:
                continue
            
            # 필드명 검증
            if not re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', field):
                continue
            
            param_name = f"param_{field}"
            conditions.append(f"{field} = :{param_name}")
            params[param_name] = value
        
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        return where_clause, params
    
    @staticmethod
    def build_order_clause(order_by: str, allowed_fields: List[str]) -> str:
        """ORDER BY 절 안전하게 생성"""
        if not order_by:
            return ""
        
        # 방향 추출
        parts = order_by.split()
        field = parts[0]
        direction = parts[1].upper() if len(parts) > 1 else "ASC"
        
        # 필드 검증
        if field not in allowed_fields:
            return ""
        
        # 방향 검증
        if direction not in ("ASC", "DESC"):
            direction = "ASC"
        
        return f"ORDER BY {field} {direction}"
    
    @staticmethod
    def execute_safe_query(
        db: Session,
        base_query: str,
        filters: Optional[dict] = None,
        order_by: Optional[str] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
        allowed_fields: Optional[List[str]] = None
    ):
        """안전한 쿼리 실행"""
        query_parts = [base_query]
        params = {}
        
        # WHERE 절
        if filters and allowed_fields:
            where_clause, where_params = SecureQueryBuilder.build_where_clause(
                filters, allowed_fields
            )
            if where_clause != "1=1":
                query_parts.append(f"WHERE {where_clause}")
                params.update(where_params)
        
        # ORDER BY 절
        if order_by and allowed_fields:
            order_clause = SecureQueryBuilder.build_order_clause(order_by, allowed_fields)
            if order_clause:
                query_parts.append(order_clause)
        
        # LIMIT/OFFSET
        if limit is not None:
            query_parts.append(f"LIMIT :limit")
            params["limit"] = min(limit, 1000)  # 최대 1000개
        
        if offset is not None:
            query_parts.append(f"OFFSET :offset")
            params["offset"] = max(offset, 0)
        
        # 쿼리 실행
        full_query = " ".join(query_parts)
        return db.execute(text(full_query), params)


# 데코레이터
def validate_request(validation_rules: dict):
    """요청 검증 데코레이터"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # 요청 데이터 추출
            request = kwargs.get("request")
            if request:
                # 쿼리 파라미터 검증
                for param, rule in validation_rules.get("query", {}).items():
                    value = request.query_params.get(param)
                    if value:
                        try:
                            validated = InputValidator.validate_input(value, **rule)
                            kwargs[param] = validated
                        except ValueError as e:
                            raise HTTPException(
                                status_code=status.HTTP_400_BAD_REQUEST,
                                detail=f"잘못된 {param}: {str(e)}"
                            )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator
