#!/bin/bash

# 실행 권한 부여
chmod +x typecheck-packages.sh

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== 모노레포 전체 빌드 스크립트 ===${NC}"
echo ""

# 1. 패키지 타입체크
echo -e "${YELLOW}1. 패키지 타입체크${NC}"
./typecheck-packages.sh
PACKAGES_RESULT=$?

# 2. 앱별 타입체크
echo -e "\n${YELLOW}2. 앱별 타입체크${NC}"

# delivery-driver 앱
echo -e "${BLUE}[delivery-driver 앱]${NC}"
cd ../apps/delivery-driver
pnpm run typecheck
DELIVERY_RESULT=$?

if [ $DELIVERY_RESULT -eq 0 ]; then
  echo -e "${GREEN}✓ delivery-driver 앱 타입체크 성공${NC}"
else
  echo -e "${RED}✗ delivery-driver 앱 타입체크 실패${NC}"
fi

cd ../../scripts

# 3. 린트 체크
echo -e "\n${YELLOW}3. 린트 체크${NC}"

# delivery-driver 앱 린트
echo -e "${BLUE}[delivery-driver 앱 린트]${NC}"
cd ../apps/delivery-driver
pnpm run lint app/
LINT_RESULT=$?

if [ $LINT_RESULT -eq 0 ]; then
  echo -e "${GREEN}✓ delivery-driver 앱 린트 성공${NC}"
else
  echo -e "${RED}✗ delivery-driver 앱 린트 실패${NC}"
fi

cd ../../scripts

# 4. 테스트 실행 (옵션)
if [ "$1" == "--with-tests" ]; then
  echo -e "\n${YELLOW}4. 테스트 실행${NC}"
  cd ../apps/delivery-driver
  pnpm run test
  TEST_RESULT=$?
  
  if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓ 테스트 성공${NC}"
  else
    echo -e "${RED}✗ 테스트 실패${NC}"
  fi
  
  cd ../../scripts
fi

# 최종 결과
echo -e "\n${BLUE}=== 빌드 결과 요약 ===${NC}"
echo -e "패키지 타입체크: $([ $PACKAGES_RESULT -eq 0 ] && echo "${GREEN}성공${NC}" || echo "${RED}실패${NC}")"
echo -e "앱 타입체크: $([ $DELIVERY_RESULT -eq 0 ] && echo "${GREEN}성공${NC}" || echo "${RED}실패${NC}")"
echo -e "앱 린트: $([ $LINT_RESULT -eq 0 ] && echo "${GREEN}성공${NC}" || echo "${RED}실패${NC}")"

if [ "$1" == "--with-tests" ]; then
  echo -e "테스트: $([ $TEST_RESULT -eq 0 ] && echo "${GREEN}성공${NC}" || echo "${RED}실패${NC}")"
fi

# 전체 성공 여부
if [ $PACKAGES_RESULT -eq 0 ] && [ $DELIVERY_RESULT -eq 0 ] && [ $LINT_RESULT -eq 0 ]; then
  if [ "$1" == "--with-tests" ] && [ $TEST_RESULT -ne 0 ]; then
    echo -e "\n${RED}빌드 실패: 테스트 오류${NC}"
    exit 1
  fi
  echo -e "\n${GREEN}모든 체크 통과! 🎉${NC}"
  exit 0
else
  echo -e "\n${RED}빌드 실패: 오류를 수정하세요${NC}"
  exit 1
fi
