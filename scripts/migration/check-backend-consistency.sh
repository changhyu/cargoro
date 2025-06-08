#!/bin/bash
# 백엔드 코드 일관성 검사 스크립트
# 실행 방법: bash scripts/migration/check-backend-consistency.sh

echo "백엔드 코드 일관성 검사 시작..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# 작업 디렉토리 설정
ROOT_DIR="/Users/gongchanghyeon/Desktop/cargoro/monorepo-root"
BACKEND_DIR="$ROOT_DIR/backend"
RESULTS_DIR="$ROOT_DIR/docs/migration"

# 결과 디렉토리 생성
mkdir -p "$RESULTS_DIR"

# 결과 파일 정의
TS_FILES="$RESULTS_DIR/backend_ts_files.txt"
PY_NAMING_ISSUES="$RESULTS_DIR/python_naming_issues.txt"
RESPONSE_FORMAT_ISSUES="$RESULTS_DIR/response_format_issues.txt"
SUMMARY_FILE="$RESULTS_DIR/consistency_summary.md"

echo "## 백엔드 코드 일관성 검사 결과" > "$SUMMARY_FILE"
echo "실행일시: $(date)" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"

# 1. TypeScript 파일 검사
echo "TypeScript 파일 검사 중..."
find "$BACKEND_DIR" -name "*.ts" > "$TS_FILES"
TS_COUNT=$(wc -l < "$TS_FILES")

echo "### TypeScript 파일 현황" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"
echo "- 발견된 TypeScript 파일 수: $TS_COUNT" >> "$SUMMARY_FILE"
echo "- 파일 목록: [backend_ts_files.txt](./backend_ts_files.txt)" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"

# 2. Python 네이밍 패턴 검사
echo "Python 네이밍 패턴 검사 중..."
{
  echo "# Python 파일 중 camelCase 사용 의심 파일"
  echo ""
  echo "다음 파일들에서 camelCase 패턴이 발견되었습니다:"
  echo ""
} > "$PY_NAMING_ISSUES"

# camelCase 패턴 검사 (소문자로 시작하고 대문자가 중간에 있는 변수/함수)
find "$BACKEND_DIR" -name "*.py" -type f -exec grep -l "\([a-z][a-z]*\)\([A-Z][a-z]*\)" {} \; | tee -a "$PY_NAMING_ISSUES"

PY_NAMING_COUNT=$(grep -v "^#" "$PY_NAMING_ISSUES" | grep -v "^$" | wc -l)

echo "### Python 네이밍 패턴 이슈" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"
echo "- camelCase 사용 의심 파일 수: $PY_NAMING_COUNT" >> "$SUMMARY_FILE"
echo "- 자세한 내용: [python_naming_issues.txt](./python_naming_issues.txt)" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"

# 3. API 응답 형식 일관성 검사
echo "API 응답 형식 일관성 검사 중..."
{
  echo "# API 응답 형식 불일치 의심 파일"
  echo ""
  echo "다음 파일들에서 표준 API 응답 형식을 사용하지 않는 것으로 의심됩니다:"
  echo ""
} > "$RESPONSE_FORMAT_ISSUES"

# 표준 응답 형식을 사용하지 않는 것으로 의심되는 패턴 검색
find "$BACKEND_DIR" -name "*.py" -type f -exec grep -l "return {" {} \; | grep -v "return {\"data\":" | grep -v "return {\"code\":" | tee -a "$RESPONSE_FORMAT_ISSUES"

RESPONSE_FORMAT_COUNT=$(grep -v "^#" "$RESPONSE_FORMAT_ISSUES" | grep -v "^$" | wc -l)

echo "### API 응답 형식 이슈" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"
echo "- 응답 형식 불일치 의심 파일 수: $RESPONSE_FORMAT_COUNT" >> "$SUMMARY_FILE"
echo "- 자세한 내용: [response_format_issues.txt](./response_format_issues.txt)" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"

# 4. 총평 및 권장 사항
echo "### 총평 및 권장 사항" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"

if [ $TS_COUNT -gt 0 ]; then
  echo "- **백엔드 언어 통일 필요**: $TS_COUNT 개의 TypeScript 파일이 발견되었습니다. 개발 규칙에 따라 백엔드는 FastAPI(Python) 기반으로 통일해야 합니다." >> "$SUMMARY_FILE"
fi

if [ $PY_NAMING_COUNT -gt 0 ]; then
  echo "- **Python 네이밍 패턴 통일 필요**: $PY_NAMING_COUNT 개의 Python 파일에서 camelCase 패턴이 발견되었습니다. Python 파일은 snake_case를 사용해야 합니다." >> "$SUMMARY_FILE"
fi

if [ $RESPONSE_FORMAT_COUNT -gt 0 ]; then
  echo "- **API 응답 형식 표준화 필요**: $RESPONSE_FORMAT_COUNT 개의 파일에서 표준 API 응답 형식을 사용하지 않는 것으로 의심됩니다. 모든 API는 {data, meta} 또는 {code, message, details} 형식을 사용해야 합니다." >> "$SUMMARY_FILE"
fi

echo "" >> "$SUMMARY_FILE"
echo "## 다음 단계" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"
echo "1. TypeScript 파일을 Python으로 변환" >> "$SUMMARY_FILE"
echo "2. Python 파일에서 camelCase 패턴을 snake_case로 변경" >> "$SUMMARY_FILE"
echo "3. API 응답 형식을 표준화" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"

# 결과 출력
echo ""
echo -e "${GREEN}일관성 검사가 완료되었습니다.${NC}"
echo "결과 요약:"
echo ""
echo -e "- TypeScript 파일: ${YELLOW}$TS_COUNT${NC}개"
echo -e "- Python 네이밍 이슈: ${YELLOW}$PY_NAMING_COUNT${NC}개"
echo -e "- API 응답 형식 이슈: ${YELLOW}$RESPONSE_FORMAT_COUNT${NC}개"
echo ""
echo -e "자세한 결과는 ${GREEN}$SUMMARY_FILE${NC} 파일을 참조하세요."
