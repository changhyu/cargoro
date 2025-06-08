#!/bin/bash
# admin-api 서비스 설정 스크립트

# 색상 설정
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Admin API 서비스 설정을 시작합니다...${NC}"

# 현재 디렉토리 저장
CURRENT_DIR=$(pwd)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 프로젝트 루트 디렉토리 확인
PROJECT_ROOT=$(cd $SCRIPT_DIR/../../.. && pwd)
echo -e "${GREEN}프로젝트 루트 경로: ${PROJECT_ROOT}${NC}"

# 가상 환경 활성화 확인
if [[ -z "$VIRTUAL_ENV" ]]; then
    echo -e "${YELLOW}가상환경 활성화가 필요합니다. '.venv'를 활성화합니다...${NC}"
    if [[ -d "${PROJECT_ROOT}/.venv" ]]; then
        source "${PROJECT_ROOT}/.venv/bin/activate"
    else
        echo -e "${RED}가상환경(.venv)을 찾을 수 없습니다. 먼저 가상환경을 생성해주세요.${NC}"
        exit 1
    fi
fi

# 필요한 패키지 설치
echo -e "${GREEN}필요한 패키지를 설치합니다...${NC}"
pip install -r "${SCRIPT_DIR}/requirements.txt"

# Prisma 설치 확인
if ! python -c "import prisma" &> /dev/null; then
    echo -e "${YELLOW}Prisma 패키지를 설치합니다...${NC}"
    pip install prisma
fi

# Prisma 클라이언트 생성
echo -e "${GREEN}Prisma 클라이언트를 생성합니다...${NC}"
cd "${PROJECT_ROOT}/backend/database/prisma"
SCHEMA_PATH="${PROJECT_ROOT}/backend/database/prisma/schema.prisma"

if [[ -f "$SCHEMA_PATH" ]]; then
    echo -e "${GREEN}스키마 파일을 찾았습니다: ${SCHEMA_PATH}${NC}"

    # 환경변수 설정 및 Prisma 클라이언트 생성
    export PRISMA_SCHEMA_PATH="$SCHEMA_PATH"
    python -m prisma generate --schema="$SCHEMA_PATH"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Prisma 클라이언트가 성공적으로 생성되었습니다!${NC}"
    else
        echo -e "${RED}Prisma 클라이언트 생성에 실패했습니다.${NC}"
    fi
else
    echo -e "${RED}schema.prisma 파일을 찾을 수 없습니다: ${SCHEMA_PATH}${NC}"
    exit 1
fi

# 원래 디렉토리로 돌아가기
cd "$CURRENT_DIR"

echo -e "${GREEN}Admin API 서비스 설정이 완료되었습니다!${NC}"
echo -e "${YELLOW}서버 실행 방법: uvicorn main:app --reload${NC}"
