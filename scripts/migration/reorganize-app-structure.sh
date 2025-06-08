#!/bin/bash

# 모든 앱 디렉토리를 순회하며 구조 정리
APPS_DIR="/Users/gongchanghyeon/Desktop/cargoro/monorepo-root/apps"

# 필요한 폴더 순서 정의
FOLDER_ORDER=("pages" "components" "features" "hooks" "state" "services" "constants")

for APP_DIR in "$APPS_DIR"/*; do
  if [ -d "$APP_DIR/app" ]; then
    echo "처리 중: $(basename "$APP_DIR")"
    
    # 필요한 모든 폴더 생성 (존재하지 않는 경우)
    for FOLDER in "${FOLDER_ORDER[@]}"; do
      if [ ! -d "$APP_DIR/app/$FOLDER" ]; then
        mkdir -p "$APP_DIR/app/$FOLDER"
        echo "  - $FOLDER 폴더 생성됨"
      fi
    done
    
    # 모바일 앱인 경우 screens 폴더의 내용을 pages로 이동
    if [ -d "$APP_DIR/app/screens" ]; then
      # screens 폴더가 존재하면 모바일 앱으로 간주
      if [ "$(ls -A "$APP_DIR/app/screens" 2>/dev/null)" ]; then
        echo "  - screens 폴더의 내용을 pages 폴더로 이동합니다"
        # 파일 복사 후 원본은 유지 (일단 복사만 진행)
        cp -rn "$APP_DIR/app/screens"/* "$APP_DIR/app/pages/" 2>/dev/null
        # 참고용 README 파일 생성
        echo "# 화면 관련 파일들
        
이 폴더는 앱 표준화 과정에서 기존 screens/ 폴더의 내용이 복사되었습니다.
향후 개발 시 pages/ 폴더를 사용해주세요." > "$APP_DIR/app/pages/README.md"
      fi
    fi
    
    # modules 폴더가 있으면 내용을 features로 이동
    if [ -d "$APP_DIR/app/modules" ]; then
      if [ "$(ls -A "$APP_DIR/app/modules" 2>/dev/null)" ]; then
        echo "  - modules 폴더의 내용을 features 폴더로 이동합니다"
        # 파일 복사 후 원본은 유지 (일단 복사만 진행)
        cp -rn "$APP_DIR/app/modules"/* "$APP_DIR/app/features/" 2>/dev/null
        # 참고용 README 파일 생성
        echo "# 기능 관련 파일들
        
이 폴더는 앱 표준화 과정에서 기존 modules/ 폴더의 내용이 복사되었습니다.
향후 개발 시 features/ 폴더를 사용해주세요." > "$APP_DIR/app/features/README.md"
      fi
    fi
    
    # 모든 폴더에 .gitkeep 파일 추가 (비어있는 폴더가 git에 추적되도록)
    for FOLDER in "${FOLDER_ORDER[@]}"; do
      if [ -d "$APP_DIR/app/$FOLDER" ] && [ ! "$(ls -A "$APP_DIR/app/$FOLDER" 2>/dev/null)" ]; then
        touch "$APP_DIR/app/$FOLDER/.gitkeep"
        echo "  - $FOLDER 폴더에 .gitkeep 파일이 추가됨"
      fi
    done
    
    echo "  구조 정리 완료"
    echo ""
  fi
done

echo "모든 앱 구조 정리가 완료되었습니다."
