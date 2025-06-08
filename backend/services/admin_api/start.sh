#!/bin/bash

# 환경 변수 로드
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | sed 's/\r$//' | awk '/=/ {print $1}' | xargs)
fi

# 가상환경 활성화 (필요한 경우)
if [ -d ".venv" ]; then
  source .venv/bin/activate
fi

# 필요한 의존성 설치
pip install -r requirements.txt

# Prisma 클라이언트 생성
prisma generate

# 애플리케이션 실행
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
