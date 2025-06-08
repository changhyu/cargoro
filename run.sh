#!/bin/bash

echo "🚀 CarGoro 통합 빌드 및 실행"

# 색상 설정
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 백엔드 프로세스 PID 저장
BACKEND_PID=""

# 종료 시 백엔드 프로세스 정리
cleanup() {
    echo -e "${YELLOW}프로세스 정리 중...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    exit
}

trap cleanup EXIT INT TERM

# 1. 백엔드 빌드 및 실행
echo -e "${GREEN}=== 백엔드 설정 ===${NC}"
cd backend/services/rental-api

# 가상환경 생성 및 활성화
if [ ! -d "venv" ]; then
    echo "가상환경 생성..."
    python -m venv venv
fi

# 가상환경 활성화
source venv/bin/activate

# 의존성 설치
echo "백엔드 의존성 설치..."
pip install -r requirements.txt > /dev/null 2>&1

# 환경 변수 설정
if [ ! -f .env ]; then
    cp .env.example .env
fi

# 백엔드 실행
echo -e "${GREEN}백엔드 서버 시작...${NC}"
python main.py &
BACKEND_PID=$!

# 백엔드 시작 대기
sleep 5

# 백엔드 상태 확인
if ! ps -p $BACKEND_PID > /dev/null; then
    echo -e "${RED}백엔드 시작 실패!${NC}"
    exit 1
fi

echo -e "${GREEN}백엔드 서버 실행 중 (PID: $BACKEND_PID)${NC}"
echo "API 문서: http://localhost:8004/docs"

# 2. 프론트엔드 빌드 및 실행
echo -e "${GREEN}=== 프론트엔드 설정 ===${NC}"
cd ../../../apps/fleet-manager-web

# 의존성 설치
echo "프론트엔드 의존성 설치..."
pnpm install

# 환경 변수 설정
if [ ! -f .env.local ]; then
    echo "NEXT_PUBLIC_API_URL=http://localhost:8004" > .env.local
fi

# 프론트엔드 실행
echo -e "${GREEN}프론트엔드 서버 시작...${NC}"
pnpm dev

# 프로세스 정리는 trap에서 처리
