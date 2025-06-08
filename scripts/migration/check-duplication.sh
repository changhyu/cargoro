#!/bin/bash

# 색상 코드
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
RED="\033[0;31m"
NC="\033[0m" # No Color

APPS_DIR="/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/apps"

echo -e "${BLUE}파일 중복 확인 시작...${NC}\n"

# screens 폴더와 pages 폴더 비교
echo -e "${YELLOW}== screens/ → pages/ 중복 현황 ==${NC}"
for APP_DIR in "${APPS_DIR}/"*; do
  if [ -d "$APP_DIR/app/screens" ] && [ -d "$APP_DIR/app/pages" ]; then
    APP_NAME=$(basename "$APP_DIR")
    echo -e "${BLUE}[앱] ${APP_NAME}${NC}"
    
    # screens 폴더에 있는 파일 목록
    SCREENS_FILES=$(find "$APP_DIR/app/screens" -type f -not -path "*/\.*" | sort)
    
    if [ -z "$SCREENS_FILES" ]; then
      echo -e "  ${GREEN}screens/ 폴더가 비어있습니다.${NC}"
      continue
    fi
    
    # 각 파일에 대해 pages 폴더에 해당 파일이 있는지 확인
    for SCREEN_FILE in $SCREENS_FILES; do
      RELATIVE_PATH=${SCREEN_FILE#"$APP_DIR/app/screens/"}
      BASE_NAME=$(basename "$SCREEN_FILE")
      
      # 같은 이름의 파일이 pages 폴더에 있는지 확인
      if [ -f "$APP_DIR/app/pages/$RELATIVE_PATH" ]; then
        echo -e "  - ${YELLOW}중복${NC}: $RELATIVE_PATH (안전하게 복사됨)"
      else
        echo -e "  - ${GREEN}신규${NC}: $RELATIVE_PATH (pages/로 복사됨)"
      fi
    done
    
    echo ""
  fi
done

# modules 폴더와 features 폴더 비교
echo -e "${YELLOW}== modules/ → features/ 중복 현황 ==${NC}"
for APP_DIR in "${APPS_DIR}/"*; do
  if [ -d "$APP_DIR/app/modules" ] && [ -d "$APP_DIR/app/features" ]; then
    APP_NAME=$(basename "$APP_DIR")
    echo -e "${BLUE}[앱] ${APP_NAME}${NC}"
    
    # modules 폴더에 있는 파일 목록
    MODULE_FILES=$(find "$APP_DIR/app/modules" -type f -not -path "*/\.*" | sort)
    
    if [ -z "$MODULE_FILES" ]; then
      echo -e "  ${GREEN}modules/ 폴더가 비어있습니다.${NC}"
      continue
    fi
    
    # 각 파일에 대해 features 폴더에 해당 파일이 있는지 확인
    for MODULE_FILE in $MODULE_FILES; do
      RELATIVE_PATH=${MODULE_FILE#"$APP_DIR/app/modules/"}
      BASE_NAME=$(basename "$MODULE_FILE")
      
      # 같은 이름의 파일이 features 폴더에 있는지 확인
      if [ -f "$APP_DIR/app/features/$RELATIVE_PATH" ]; then
        echo -e "  - ${YELLOW}중복${NC}: $RELATIVE_PATH (안전하게 복사됨)"
      else
        echo -e "  - ${GREEN}신규${NC}: $RELATIVE_PATH (features/로 복사됨)"
      fi
    done
    
    echo ""
  fi
done

# 비표준 폴더 검사
echo -e "${YELLOW}== 비표준 폴더 현황 ==${NC}"
STANDARD_FOLDERS=("pages" "components" "features" "hooks" "state" "services" "constants")
ESSENTIAL_FOLDERS=("providers" "styles" "utils" "navigation")
PAGE_FOLDERS=("dashboard" "login" "sign-in" "sign-up" "unauthorized")

for APP_DIR in "${APPS_DIR}/"*; do
  if [ -d "$APP_DIR/app" ]; then
    APP_NAME=$(basename "$APP_DIR")
    echo -e "${BLUE}[앱] ${APP_NAME}${NC}"
    
    # app/ 내의 모든 폴더 목록
    ALL_FOLDERS=$(find "$APP_DIR/app" -mindepth 1 -maxdepth 1 -type d | sort)
    
    for FOLDER in $ALL_FOLDERS; do
      FOLDER_NAME=$(basename "$FOLDER")
      
      # 표준 폴더인지 확인
      is_standard=false
      for STD_FOLDER in "${STANDARD_FOLDERS[@]}"; do
        if [ "$FOLDER_NAME" = "$STD_FOLDER" ]; then
          is_standard=true
          break
        fi
      done
      
      # 필수 폴더인지 확인
      is_essential=false
      for ESS_FOLDER in "${ESSENTIAL_FOLDERS[@]}"; do
        if [ "$FOLDER_NAME" = "$ESS_FOLDER" ]; then
          is_essential=true
          break
        fi
      done
      
      # Next.js 페이지 폴더인지 확인
      is_page_folder=false
      for PAGE_FOLDER in "${PAGE_FOLDERS[@]}"; do
        if [ "$FOLDER_NAME" = "$PAGE_FOLDER" ]; then
          is_page_folder=true
          break
        fi
      done
      
      # 결과 출력
      if [ "$is_standard" = true ]; then
        echo -e "  - ${GREEN}표준${NC}: $FOLDER_NAME/"
      elif [ "$is_essential" = true ]; then
        echo -e "  - ${YELLOW}필수${NC}: $FOLDER_NAME/ (유지 필요)"
      elif [ "$is_page_folder" = true ]; then
        echo -e "  - ${BLUE}페이지${NC}: $FOLDER_NAME/ (Next.js App Router)"
      elif [ "$FOLDER_NAME" = "screens" ] || [ "$FOLDER_NAME" = "modules" ]; then
        echo -e "  - ${YELLOW}이전${NC}: $FOLDER_NAME/ (마이그레이션 대상)"
      else
        echo -e "  - ${RED}비표준${NC}: $FOLDER_NAME/ (검토 필요)"
      fi
    done
    
    echo ""
  fi
done

echo -e "${BLUE}파일 중복 확인 완료${NC}"
