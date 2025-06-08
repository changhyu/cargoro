#!/bin/bash

echo "🔍 CarGoro 모노레포 구현 상태 검증"
echo "=================================="

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 체크 함수
check_exists() {
    if [ -e "$1" ]; then
        echo -e "${GREEN}✅${NC} $2"
        return 0
    else
        echo -e "${RED}❌${NC} $2"
        return 1
    fi
}

check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $2"
        return 0
    else
        echo -e "${RED}❌${NC} $2"
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
check_directory "backend/services/repair-api" "Repair API"
check_directory "backend/services/delivery-api" "Delivery API"
check_directory "backend/services/parts-api" "Parts API"
check_directory "backend/services/fleet-api" "Fleet API"
check_directory "backend/services/admin-api" "Admin API"

# 5. 패키지 확인
echo -e "\n${YELLOW}5. 패키지${NC}"
check_directory "packages/ui/.storybook" "UI Storybook 설정"
check_exists "packages/ui/src/components/button/button.tsx" "Button 컴포넌트"
check_exists "packages/analytics/src/sentry.ts" "Sentry 통합"
check_exists "packages/analytics/src/posthog.ts" "PostHog 통합"

# 6. 데이터베이스 확인
echo -e "\n${YELLOW}6. 데이터베이스${NC}"
check_exists "backend/database/prisma/seed.ts" "Prisma Seed 스크립트"

# 7. VSCode 설정 확인
echo -e "\n${YELLOW}7. 개발 환경${NC}"
check_exists ".vscode/extensions.json" "VSCode 확장 추천"
check_exists ".vscode/launch.json" "VSCode 디버깅 설정"

echo -e "\n=================================="
echo "검증 완료!"
