#!/bin/bash

# 앱 구조 표준화 스크립트 v2
# 기능: 
# 1. 필요한 폴더 생성
# 2. screens/ → pages/, modules/ → features/ 파일 이동
# 3. 개발 규칙에 맞는 폴더 순서로 정리
# 4. 기타 비표준 폴더 처리

# 색상 코드
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
RED="\033[0;31m"
NC="\033[0m" # No Color

APPS_DIR="/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/apps"

# 표준 폴더 순서 정의 (개발 설정 규칙에 명시된 순서)
STANDARD_FOLDERS=("pages" "components" "features" "hooks" "state" "services" "constants")

# 각 앱에 적용할 기능을 정의한 함수
process_app() {
    local APP_NAME=$(basename "$1")
    local APP_DIR="$1"
    
    echo -e "${BLUE}[처리 중] ${APP_NAME}${NC}"
    
    # app/ 디렉토리가 있는지 확인
    if [ ! -d "${APP_DIR}/app" ]; then
        echo -e "${RED}  - app/ 디렉토리가 없습니다. 건너뜁니다.${NC}"
        return
    fi
    
    # 1. 표준 폴더 생성
    for FOLDER in "${STANDARD_FOLDERS[@]}"; do
        if [ ! -d "${APP_DIR}/app/${FOLDER}" ]; then
            mkdir -p "${APP_DIR}/app/${FOLDER}"
            echo -e "${GREEN}  - ${FOLDER}/ 폴더가 생성되었습니다.${NC}"
        else
            echo -e "  - ${FOLDER}/ 폴더가 이미 존재합니다."
        fi
    done
    
    # 2. 파일 이동: screens/ → pages/
    if [ -d "${APP_DIR}/app/screens" ]; then
        echo -e "${YELLOW}  - screens/ 폴더의 파일을 pages/ 폴더로 이동합니다.${NC}"
        if [ "$(ls -A "${APP_DIR}/app/screens" 2>/dev/null)" ]; then
            # 파일 복사 (원본 유지)
            cp -r "${APP_DIR}/app/screens/"* "${APP_DIR}/app/pages/" 2>/dev/null
            
            # README 파일 생성
            cat > "${APP_DIR}/app/pages/README.md" << 'README'
# 페이지 컴포넌트

이 폴더는 앱 표준화 과정에서 기존 screens/ 폴더의 내용이 복사되었습니다.
앞으로는 이 폴더를 사용하여 페이지 컴포넌트를 관리해주세요.

## 네이밍 규칙
- 모바일 앱: [기능명]Screen.tsx
- 웹 앱: page.tsx (Next.js App Router 규칙)
README
        fi
    fi
    
    # 3. 파일 이동: modules/ → features/
    if [ -d "${APP_DIR}/app/modules" ]; then
        echo -e "${YELLOW}  - modules/ 폴더의 파일을 features/ 폴더로 이동합니다.${NC}"
        if [ "$(ls -A "${APP_DIR}/app/modules" 2>/dev/null)" ]; then
            # 파일 복사 (원본 유지)
            cp -r "${APP_DIR}/app/modules/"* "${APP_DIR}/app/features/" 2>/dev/null
            
            # README 파일 생성
            cat > "${APP_DIR}/app/features/README.md" << 'README'
# 기능별 모듈

이 폴더는 앱 표준화 과정에서 기존 modules/ 폴더의 내용이 복사되었습니다.
앞으로는 이 폴더를 사용하여 기능별 로직과 컴포넌트를 관리해주세요.

## 구조 가이드라인
feature-name/
  ├── components/     # 이 기능에만 사용되는 UI 컴포넌트
  ├── hooks/          # 이 기능에만 사용되는 훅
  ├── utils/          # 이 기능에만 사용되는 유틸리티 함수
  └── index.ts        # 진입점 및 내보내기
README
        fi
    fi
    
    # 4. 빈 폴더에 .gitkeep 추가
    for FOLDER in "${STANDARD_FOLDERS[@]}"; do
        if [ -d "${APP_DIR}/app/${FOLDER}" ] && [ ! "$(ls -A "${APP_DIR}/app/${FOLDER}" 2>/dev/null)" ]; then
            touch "${APP_DIR}/app/${FOLDER}/.gitkeep"
            echo "  - ${FOLDER}/ 폴더에 .gitkeep 파일이 추가되었습니다."
        fi
    done
    
    # 5. 추가 폴더 평가
    echo -e "${YELLOW}  - 표준 외 폴더 확인:${NC}"
    find "${APP_DIR}/app" -mindepth 1 -maxdepth 1 -type d | while read DIR; do
        DIR_NAME=$(basename "$DIR")
        
        # 표준 폴더인지 확인
        is_standard=false
        for STD_FOLDER in "${STANDARD_FOLDERS[@]}"; do
            if [ "$DIR_NAME" = "$STD_FOLDER" ]; then
                is_standard=true
                break
            fi
        done
        
        # App.tsx, providers/ 등 필수 파일/폴더는 표준으로 간주
        if [ "$DIR_NAME" = "providers" ] || [ "$DIR_NAME" = "styles" ] || [ "$DIR_NAME" = "utils" ] || [ "$DIR_NAME" = "navigation" ]; then
            is_standard=true
        fi
        
        if [ "$is_standard" = false ]; then
            if [ "$DIR_NAME" = "screens" ] || [ "$DIR_NAME" = "modules" ]; then
                echo -e "    - ${YELLOW}${DIR_NAME}/${NC} - 내용이 마이그레이션되었습니다."
            else
                echo -e "    - ${RED}${DIR_NAME}/${NC} - 개발 설정 규칙에 명시되지 않은 폴더입니다."
            fi
        fi
    done
    
    echo -e "${GREEN}[완료] ${APP_NAME} 구조 정리 완료${NC}\n"
}

main() {
    echo -e "${BLUE}앱 구조 표준화 시작...${NC}\n"
    
    # 각 앱 처리
    for APP_DIR in "${APPS_DIR}/"*; do
        if [ -d "$APP_DIR" ]; then
            process_app "$APP_DIR"
        fi
    done
    
    echo -e "${GREEN}모든 앱 구조 표준화가 완료되었습니다.${NC}"
    echo -e "${YELLOW}참고: 원본 screens/ 및 modules/ 폴더는 안전을 위해 유지되었습니다.${NC}"
    echo -e "${YELLOW}      개발팀과 함께 검토한 후에 삭제를 고려하세요.${NC}"
}

# 스크립트 실행
main
