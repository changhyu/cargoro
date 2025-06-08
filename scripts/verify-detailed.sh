#!/bin/bash

echo "🔍 CarGoro 모노레포 상세 검증"
echo "=================================="

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 성공/실패 카운터
SUCCESS_COUNT=0
FAIL_COUNT=0

# 체크 함수
check_exists() {
    if [ -e "$1" ]; then
        echo -e "${GREEN}✅${NC} $2"
        ((SUCCESS_COUNT++))
        return 0
    else
        echo -e "${RED}❌${NC} $2 - 파일이 없습니다: $1"
        ((FAIL_COUNT++))
        return 1
    fi
}

check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $2"
        ((SUCCESS_COUNT++))
        return 0
    else
        echo -e "${RED}❌${NC} $2 - 디렉토리가 없습니다: $1"
        ((FAIL_COUNT++))
        return 1
    fi
}

check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅${NC} $2 설치됨"
        ((SUCCESS_COUNT++))
        return 0
    else
        echo -e "${RED}❌${NC} $2 설치 필요"
        ((FAIL_COUNT++))
        return 1
    fi
}

# 1. GitHub 템플릿 확인
echo -e "\n${YELLOW}1. GitHub 템플릿${NC}"
check_exists ".github/dependabot.yml" "Dependabot 설정"
check_exists ".github/PULL_REQUEST_TEMPLATE.md" "PR 템플릿"
check_exists ".github/ISSUE_TEMPLATE/bug_report.md" "버그 리포트 템플릿"
check_exists ".github/ISSUE_TEMPLATE/feature_request.md" "기능 요청 템플릿"

# 2. 자동화 스크립트 확인
echo -e "\n${YELLOW}2. 자동화 스크립트${NC}"
check_exists "scripts/cli.ts" "CLI 도구"
check_exists "scripts/setup-env.ts" "환경 설정 도구"
check_exists "scripts/generate-types.ts" "타입 생성 도구"
check_exists "scripts/deploy.ts" "배포 도구"
check_exists "scripts/format-all.ts" "포맷팅 도구"
check_exists "scripts/sync-env.ts" "환경 동기화 도구"

# 3. 프로젝트 구조 확인
echo -e "\n${YELLOW}3. 프로젝트 구조${NC}"
check_directory "apps/workshop-web/app/pages" "workshop-web pages 디렉토리"
check_directory "apps/workshop-web/app/tests/pages" "workshop-web 페이지 테스트"
check_directory "apps/workshop-web/app/tests/flows" "workshop-web 플로우 테스트"
check_directory "apps/workshop-web/e2e/scenarios" "E2E 시나리오"
check_directory "apps/workshop-web/e2e/performance" "성능 테스트"

# 4. 백엔드 서비스 확인
echo -e "\n${YELLOW}4. 백엔드 마이크로서비스${NC}"
check_directory "backend/services/core-api" "Core API"
check_exists "backend/services/core-api/main.py" "Core API 메인 파일"
check_exists "backend/services/core-api/config.py" "Core API 설정 파일"
check_directory "backend/services/repair-api" "Repair API"
check_directory "backend/services/delivery-api" "Delivery API"
check_directory "backend/services/parts-api" "Parts API"
check_directory "backend/services/fleet-api" "Fleet API"
check_directory "backend/services/admin-api" "Admin API"

# 5. 패키지 확인
echo -e "\n${YELLOW}5. 패키지${NC}"
check_directory "packages/ui/.storybook" "UI Storybook 설정"
check_exists "packages/ui/.storybook/main.ts" "Storybook 메인 설정"
check_exists "packages/ui/.storybook/preview.tsx" "Storybook 프리뷰 설정"
check_exists "packages/ui/src/components/button/button.tsx" "Button 컴포넌트"
check_exists "packages/ui/src/components/button/button.stories.tsx" "Button 스토리"
check_exists "packages/analytics/src/sentry.ts" "Sentry 통합"
check_exists "packages/analytics/src/posthog.ts" "PostHog 통합"

# 6. 데이터베이스 확인
echo -e "\n${YELLOW}6. 데이터베이스${NC}"
check_exists "backend/database/prisma/seed.ts" "Prisma Seed 스크립트"
check_exists "backend/database/prisma/schema.prisma" "Prisma 스키마"

# 7. VSCode 설정 확인
echo -e "\n${YELLOW}7. 개발 환경${NC}"
check_exists ".vscode/extensions.json" "VSCode 확장 추천"
check_exists ".vscode/launch.json" "VSCode 디버깅 설정"

# 8. 의존성 확인
echo -e "\n${YELLOW}8. 필수 의존성${NC}"
check_command "pnpm" "pnpm"
check_command "node" "Node.js"

# package.json에서 의존성 확인
if [ -f "package.json" ]; then
    echo -e "\n${BLUE}설치된 주요 의존성:${NC}"
    
    # tsx 확인
    if grep -q '"tsx"' package.json; then
        echo -e "${GREEN}✅${NC} tsx (TypeScript 실행기)"
        ((SUCCESS_COUNT++))
    else
        echo -e "${RED}❌${NC} tsx 설치 필요: pnpm add -D tsx"
        ((FAIL_COUNT++))
    fi
    
    # commander 확인
    if grep -q '"commander"' package.json; then
        echo -e "${GREEN}✅${NC} commander (CLI 프레임워크)"
        ((SUCCESS_COUNT++))
    else
        echo -e "${RED}❌${NC} commander 설치 필요: pnpm add -D commander"
        ((FAIL_COUNT++))
    fi
    
    # inquirer 확인
    if grep -q '"inquirer"' package.json; then
        echo -e "${GREEN}✅${NC} inquirer (대화형 프롬프트)"
        ((SUCCESS_COUNT++))
    else
        echo -e "${RED}❌${NC} inquirer 설치 필요: pnpm add -D inquirer"
        ((FAIL_COUNT++))
    fi
    
    # chalk 확인
    if grep -q '"chalk"' package.json; then
        echo -e "${GREEN}✅${NC} chalk (터미널 스타일링)"
        ((SUCCESS_COUNT++))
    else
        echo -e "${RED}❌${NC} chalk 설치 필요: pnpm add -D chalk"
        ((FAIL_COUNT++))
    fi
fi

# 결과 요약
echo -e "\n=================================="
echo -e "${BLUE}검증 결과 요약${NC}"
echo -e "성공: ${GREEN}${SUCCESS_COUNT}개${NC}"
echo -e "실패: ${RED}${FAIL_COUNT}개${NC}"

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "\n${GREEN}🎉 모든 검증을 통과했습니다!${NC}"
else
    echo -e "\n${YELLOW}⚠️  일부 항목이 누락되었습니다.${NC}"
    echo -e "${YELLOW}위의 실패 항목들을 확인하고 필요한 조치를 취해주세요.${NC}"
fi

# 스크립트 실행 가능 여부 확인
echo -e "\n${YELLOW}9. 스크립트 실행 권한${NC}"
for script in scripts/*.ts scripts/*.sh; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            echo -e "${GREEN}✅${NC} $script - 실행 가능"
        else
            echo -e "${YELLOW}⚠️${NC} $script - 실행 권한 필요 (chmod +x $script)"
        fi
    fi
done

echo -e "\n=================================="
echo "상세 검증 완료!"
