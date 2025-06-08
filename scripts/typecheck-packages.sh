#!/bin/bash

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=== 패키지별 타입체크 실행 ==="
echo ""

# auth 패키지 체크
echo -e "${YELLOW}[AUTH 패키지]${NC}"
cd packages/auth
echo "웹 타입체크..."
pnpm run typecheck:web
WEB_RESULT=$?

echo "모바일 타입체크..."
pnpm run typecheck:mobile
MOBILE_RESULT=$?

if [ $WEB_RESULT -eq 0 ] && [ $MOBILE_RESULT -eq 0 ]; then
  echo -e "${GREEN}✓ AUTH 패키지 타입체크 성공${NC}"
else
  echo -e "${RED}✗ AUTH 패키지 타입체크 실패${NC}"
fi

cd ../..

# ui 패키지 체크
echo -e "\n${YELLOW}[UI 패키지]${NC}"
cd packages/ui
pnpm run typecheck
UI_RESULT=$?

if [ $UI_RESULT -eq 0 ]; then
  echo -e "${GREEN}✓ UI 패키지 타입체크 성공${NC}"
else
  echo -e "${RED}✗ UI 패키지 타입체크 실패${NC}"
fi

cd ../..

# types 패키지 체크
echo -e "\n${YELLOW}[TYPES 패키지]${NC}"
cd packages/types
pnpm run typecheck
TYPES_RESULT=$?

if [ $TYPES_RESULT -eq 0 ]; then
  echo -e "${GREEN}✓ TYPES 패키지 타입체크 성공${NC}"
else
  echo -e "${RED}✗ TYPES 패키지 타입체크 실패${NC}"
fi

cd ../..

# test-utils 패키지 체크
echo -e "\n${YELLOW}[TEST-UTILS 패키지]${NC}"
cd packages/test-utils
pnpm run typecheck
TEST_UTILS_RESULT=$?

if [ $TEST_UTILS_RESULT -eq 0 ]; then
  echo -e "${GREEN}✓ TEST-UTILS 패키지 타입체크 성공${NC}"
else
  echo -e "${RED}✗ TEST-UTILS 패키지 타입체크 실패${NC}"
fi

cd ../..

# 결과 요약
echo -e "\n=== 타입체크 결과 요약 ==="
echo -e "AUTH (웹): $([ $WEB_RESULT -eq 0 ] && echo "${GREEN}성공${NC}" || echo "${RED}실패${NC}")"
echo -e "AUTH (모바일): $([ $MOBILE_RESULT -eq 0 ] && echo "${GREEN}성공${NC}" || echo "${RED}실패${NC}")"
echo -e "UI: $([ $UI_RESULT -eq 0 ] && echo "${GREEN}성공${NC}" || echo "${RED}실패${NC}")"
echo -e "TYPES: $([ $TYPES_RESULT -eq 0 ] && echo "${GREEN}성공${NC}" || echo "${RED}실패${NC}")"
echo -e "TEST-UTILS: $([ $TEST_UTILS_RESULT -eq 0 ] && echo "${GREEN}성공${NC}" || echo "${RED}실패${NC}")"

# 전체 결과
if [ $WEB_RESULT -eq 0 ] && [ $MOBILE_RESULT -eq 0 ] && [ $UI_RESULT -eq 0 ] && [ $TYPES_RESULT -eq 0 ] && [ $TEST_UTILS_RESULT -eq 0 ]; then
  echo -e "\n${GREEN}모든 패키지 타입체크 성공!${NC}"
  exit 0
else
  echo -e "\n${RED}일부 패키지에서 타입 오류 발생${NC}"
  exit 1
fi
