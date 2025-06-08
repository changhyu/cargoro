#!/bin/bash

# 색상 코드
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
RED="\033[0;31m"
NC="\033[0m" # No Color

APPS_DIR="/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/apps"
BACKUP_DIR="/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backup/app-structure/$(date +%Y%m%d)"

echo -e "${BLUE}중복 폴더 백업 시작...${NC}\n"

# 백업 디렉토리 생성
mkdir -p "${BACKUP_DIR}"

# 각 앱의 중복 폴더 백업
for APP_DIR in "${APPS_DIR}/"*; do
  if [ -d "$APP_DIR" ]; then
    APP_NAME=$(basename "$APP_DIR")
    echo -e "${BLUE}[앱] ${APP_NAME} 처리 중...${NC}"
    
    # screens/ 폴더 백업
    if [ -d "${APP_DIR}/app/screens" ]; then
      echo -e "  - screens/ 폴더 백업 중..."
      mkdir -p "${BACKUP_DIR}/${APP_NAME}/app"
      cp -r "${APP_DIR}/app/screens" "${BACKUP_DIR}/${APP_NAME}/app/"
      echo -e "  ${GREEN}✓ screens/ 폴더 백업 완료${NC}"
    fi
    
    # modules/ 폴더 백업
    if [ -d "${APP_DIR}/app/modules" ]; then
      echo -e "  - modules/ 폴더 백업 중..."
      mkdir -p "${BACKUP_DIR}/${APP_NAME}/app"
      cp -r "${APP_DIR}/app/modules" "${BACKUP_DIR}/${APP_NAME}/app/"
      echo -e "  ${GREEN}✓ modules/ 폴더 백업 완료${NC}"
    fi
  fi
done

echo -e "\n${GREEN}백업 완료! 백업 위치: ${BACKUP_DIR}${NC}"
