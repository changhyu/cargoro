"""
Delivery API 서비스 진입점

탁송 관리 API 서비스 진입점 모듈
"""
import os
import sys
import uvicorn

# 현재 디렉토리를 모듈 검색 경로에 추가
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 표준화된 서버 모듈 임포트
from lib.server import app

# 서버 실행 (직접 실행 시에만)
if __name__ == "__main__":
    port = int(os.getenv("PORT", "8004"))
    uvicorn.run(app, host="0.0.0.0", port=port)
