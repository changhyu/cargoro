#!/bin/bash
# 프론트엔드 코드 일관성 검사 스크립트
# 실행 방법: bash scripts/migration/check-frontend-consistency.sh

echo "프론트엔드 코드 일관성 검사 시작..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# 작업 디렉토리 설정
ROOT_DIR="/Users/gongchanghyeon/Desktop/cargoro/monorepo-root"
APPS_DIR="$ROOT_DIR/apps"
RESULTS_DIR="$ROOT_DIR/docs/migration"

# 결과 디렉토리 생성
mkdir -p "$RESULTS_DIR"

# 결과 파일 정의
SRC_FOLDERS="$RESULTS_DIR/src_folders.txt"
FOLDER_STRUCTURE_ISSUES="$RESULTS_DIR/folder_structure_issues.txt"
ANY_TYPE_ISSUES="$RESULTS_DIR/any_type_issues.txt"
SUMMARY_FILE="$RESULTS_DIR/frontend_consistency_summary.md"

echo "## 프론트엔드 코드 일관성 검사 결과" > "$SUMMARY_FILE"
echo "실행일시: $(date)" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"

# 1. src/ 폴더 사용 검사
echo "src/ 폴더 사용 검사 중..."
{
  echo "# src/ 폴더 사용 현황"
  echo ""
  echo "다음 앱에서 src/ 폴더가 발견되었습니다 (개발 규칙 위반):"
  echo ""
} > "$SRC_FOLDERS"

find "$APPS_DIR" -type d -name "src" | tee -a "$SRC_FOLDERS"

SRC_COUNT=$(grep -v "^#" "$SRC_FOLDERS" | grep -v "^$" | wc -l)

echo "### src/ 폴더 사용 현황" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"
echo "- src/ 폴더 사용 앱 수: $SRC_COUNT" >> "$SUMMARY_FILE"
echo "- 자세한 내용: [src_folders.txt](./src_folders.txt)" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"

# 2. 폴더 구조 일관성 검사
echo "폴더 구조 일관성 검사 중..."
{
  echo "# 앱 폴더 구조 일관성 검사"
  echo ""
  echo "다음 앱에서 규정된 폴더 구조를 완전히 따르지 않고 있습니다:"
  echo ""
} > "$FOLDER_STRUCTURE_ISSUES"

# Next.js 앱 검사
for app_dir in $(find "$APPS_DIR" -maxdepth 1 -mindepth 1 -type d -name "*-web"); do
  app_name=$(basename "$app_dir")
  echo "검사 중: $app_name"

  # 필수 폴더 존재 여부 확인
  missing_folders=""
  for folder in "app/pages" "app/components" "app/features" "app/hooks" "app/state" "app/services" "app/constants"; do
    if [ ! -d "$app_dir/$folder" ]; then
      missing_folders="$missing_folders $folder"
    fi
  done

  if [ ! -z "$missing_folders" ]; then
    echo "- $app_name: 필수 폴더 부재:$missing_folders" >> "$FOLDER_STRUCTURE_ISSUES"
  fi

  # 폴더 순서 확인 (app/ 하위 폴더들의 생성 날짜 비교)
  wrong_order=0

  # 순서: pages, components, features, hooks, state, services, constants
  expected_order=("pages" "components" "features" "hooks" "state" "services" "constants")

  for ((i=0; i<${#expected_order[@]}-1; i++)); do
    current="${expected_order[$i]}"
    next="${expected_order[$i+1]}"

    if [ -d "$app_dir/app/$current" ] && [ -d "$app_dir/app/$next" ]; then
      if [ $(ls -la "$app_dir/app" | grep -F "$next" | wc -l) -gt 0 ] && [ $(ls -la "$app_dir/app" | grep -F "$current" | wc -l) -gt 0 ]; then
        current_pos=$(ls -la "$app_dir/app" | grep -n -F "$current" | cut -d: -f1)
        next_pos=$(ls -la "$app_dir/app" | grep -n -F "$next" | cut -d: -f1)

        if [ "$current_pos" -gt "$next_pos" ]; then
          wrong_order=1
          break
        fi
      fi
    fi
  done

  if [ "$wrong_order" -eq 1 ]; then
    echo "- $app_name: 폴더 순서가 권장 순서(pages, components, features, hooks, state, services, constants)와 일치하지 않습니다." >> "$FOLDER_STRUCTURE_ISSUES"
  fi
done

FOLDER_STRUCTURE_COUNT=$(grep "^-" "$FOLDER_STRUCTURE_ISSUES" | wc -l)

echo "### 폴더 구조 일관성 이슈" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"
echo "- 폴더 구조 이슈 앱 수: $FOLDER_STRUCTURE_COUNT" >> "$SUMMARY_FILE"
echo "- 자세한 내용: [folder_structure_issues.txt](./folder_structure_issues.txt)" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"

# 3. TypeScript any 타입 사용 검사
echo "TypeScript any 타입 사용 검사 중..."
{
  echo "# TypeScript any 타입 사용 현황"
  echo ""
  echo "다음 파일에서 any 타입 사용이 발견되었습니다 (개발 규칙 위반):"
  echo ""
} > "$ANY_TYPE_ISSUES"

find "$APPS_DIR" "$ROOT_DIR/packages" -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l ": any" | tee -a "$ANY_TYPE_ISSUES"

ANY_TYPE_COUNT=$(grep -v "^#" "$ANY_TYPE_ISSUES" | grep -v "^$" | wc -l)

echo "### TypeScript any 타입 사용 현황" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"
echo "- any 타입 사용 파일 수: $ANY_TYPE_COUNT" >> "$SUMMARY_FILE"
echo "- 자세한 내용: [any_type_issues.txt](./any_type_issues.txt)" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"

# 4. 총평 및 권장 사항
echo "### 총평 및 권장 사항" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"

if [ $SRC_COUNT -gt 0 ]; then
  echo "- **src/ 폴더 제거 필요**: $SRC_COUNT 개의 앱에서 src/ 폴더가 발견되었습니다. 개발 규칙에 따라 src/ 폴더 사용을 금지하고 App Router 구조를 따라야 합니다." >> "$SUMMARY_FILE"
fi

if [ $FOLDER_STRUCTURE_COUNT -gt 0 ]; then
  echo "- **폴더 구조 일관성 개선 필요**: $FOLDER_STRUCTURE_COUNT 개의 앱에서 폴더 구조 일관성 이슈가 발견되었습니다. 모든 앱은 동일한 폴더 구조와 순서를 따라야 합니다." >> "$SUMMARY_FILE"
fi

if [ $ANY_TYPE_COUNT -gt 0 ]; then
  echo "- **TypeScript any 타입 제거 필요**: $ANY_TYPE_COUNT 개의 파일에서 any 타입 사용이 발견되었습니다. 타입 안전성을 위해 any 타입 사용을 피하고 구체적인 타입을 정의해야 합니다." >> "$SUMMARY_FILE"
fi

echo "" >> "$SUMMARY_FILE"
echo "## 다음 단계" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"
echo "1. src/ 폴더 제거 및 App Router 구조로 마이그레이션" >> "$SUMMARY_FILE"
echo "2. 모든 앱에서 일관된 폴더 구조 및 순서 적용" >> "$SUMMARY_FILE"
echo "3. any 타입을 구체적인 타입으로 대체" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"

# 결과 출력
echo ""
echo -e "${GREEN}일관성 검사가 완료되었습니다.${NC}"
echo "결과 요약:"
echo ""
echo -e "- src/ 폴더 사용: ${YELLOW}$SRC_COUNT${NC}개 앱"
echo -e "- 폴더 구조 일관성 이슈: ${YELLOW}$FOLDER_STRUCTURE_COUNT${NC}개 앱"
echo -e "- any 타입 사용: ${YELLOW}$ANY_TYPE_COUNT${NC}개 파일"
echo ""
echo -e "자세한 결과는 ${GREEN}$SUMMARY_FILE${NC} 파일을 참조하세요."
