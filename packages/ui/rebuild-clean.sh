#!/bin/bash

# UI 패키지 빌드 문제 완전 해결 스크립트

set -e

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}UI 패키지 구조 및 빌드 문제 해결${NC}"
echo -e "${BLUE}=====================================${NC}"

cd /Users/gongchanghyeon/Desktop/cargoro/monorepo-root/packages/ui

# 1. 기존 빌드 결과물 완전 삭제
echo -e "\n${YELLOW}1단계: 기존 빌드 결과물 완전 삭제${NC}"
rm -rf dist
rm -f .tsbuildinfo
rm -f tsconfig.tsbuildinfo

# 2. 컴포넌트 폴더의 잘못된 index.ts 파일들 제거
echo -e "\n${YELLOW}2단계: 잘못된 index.ts 파일 제거${NC}"
find components -name "index.ts" -type f -delete

# 3. tsconfig.build.json 수정
echo -e "\n${YELLOW}3단계: tsconfig.build.json 재생성${NC}"
cat > tsconfig.build.json << 'EOF'
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./",
    "declaration": true,
    "declarationMap": true,
    "incremental": true,
    "tsBuildInfoFile": "./dist/.tsbuildinfo",
    "noEmit": false,
    "skipLibCheck": true,
    "types": ["node", "react", "react-dom"]
  },
  "include": [
    "index.ts",
    "utils.ts",
    "lib/**/*.ts",
    "lib/**/*.tsx",
    "icons/**/*.ts",
    "icons/**/*.tsx",
    "components/**/*.ts",
    "components/**/*.tsx",
    "app/components/**/*.ts",
    "app/components/**/*.tsx",
    "hooks/**/*.ts",
    "hooks/**/*.tsx"
  ],
  "exclude": [
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/*.stories.tsx",
    "vitest.config.ts",
    "vitest.setup.ts",
    "jest.setup.ts",
    "**/__tests__/**",
    "**/__mocks__/**",
    "tests/**",
    "scripts/**",
    "dist/**",
    "node_modules/**",
    "components/**/index.ts"
  ]
}
EOF

# 4. 메인 index.ts 파일 재생성 (단순화된 버전)
echo -e "\n${YELLOW}4단계: index.ts 재생성${NC}"
cat > index.ts << 'EOF'
/**
 * UI 패키지 - 메인 export 파일
 */

// Utils는 반드시 먼저 export
export * from './utils';

// 기본 컴포넌트들
export * from './components/button';
export * from './components/card';
export * from './components/input';
export * from './components/label';
export * from './components/textarea';
export * from './components/select';
export * from './components/checkbox';
export * from './components/switch';
export * from './components/dialog';
export * from './components/alert';
export * from './components/badge';
export * from './components/tabs';
export * from './components/table';
export * from './components/progress';
export * from './components/skeleton';
export * from './components/separator';
export * from './components/toast';
export * from './components/dropdown-menu';
export * from './components/avatar';
export * from './components/popover';
export * from './components/slider';
export * from './components/scroll-area';
export * from './components/radio-group';
export * from './components/calendar';
export * from './components/alert-dialog';
export * from './components/breadcrumb';

// Spinner
export { Spinner } from './components/spinner';

// Forms
export * from './components/forms/form';

// Hooks
export * from './hooks';
EOF

# 5. utils.ts 파일이 없으면 생성
echo -e "\n${YELLOW}5단계: utils.ts 파일 확인 및 생성${NC}"
if [ ! -f "utils.ts" ]; then
    cat > utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
EOF
    echo "✅ utils.ts 파일 생성 완료"
fi

# 6. 빌드 실행
echo -e "\n${YELLOW}6단계: TypeScript 빌드${NC}"
npx tsc -p tsconfig.build.json || {
    echo -e "${RED}빌드 중 오류 발생, 부분 빌드 시도...${NC}"
    npx tsc -p tsconfig.build.json --noEmitOnError false
}

# 7. CSS 파일 복사
echo -e "\n${YELLOW}7단계: CSS 파일 복사${NC}"
if [ -f app/styles/globals.css ]; then
    mkdir -p dist
    cp app/styles/globals.css dist/globals.css
    echo "✅ globals.css 복사 완료"
fi

# 8. 빌드 결과 확인
echo -e "\n${YELLOW}8단계: 빌드 결과 확인${NC}"
if [ -d "dist" ]; then
    echo -e "${GREEN}✅ dist 폴더 생성됨${NC}"
    echo "주요 파일들:"
    ls -la dist/ | grep -E "(index\.|utils\.|globals\.css)" || echo "주요 파일이 없습니다."
else
    echo -e "${RED}❌ dist 폴더가 생성되지 않았습니다${NC}"
fi

# 9. package.json의 exports 필드 확인 및 수정
echo -e "\n${YELLOW}9단계: package.json exports 필드 업데이트${NC}"
node -e "
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

packageJson.main = './dist/index.js';
packageJson.module = './dist/index.js';
packageJson.types = './dist/index.d.ts';

if (!packageJson.exports) {
  packageJson.exports = {};
}

packageJson.exports['.'] = {
  import: './dist/index.js',
  require: './dist/index.js',
  types: './dist/index.d.ts'
};

packageJson.exports['./globals.css'] = './dist/globals.css';

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ package.json exports 필드 업데이트 완료');
"

echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}✅ UI 패키지 재구성 완료!${NC}"
echo -e "${GREEN}=====================================${NC}"

echo -e "\n${GREEN}다음 단계:${NC}"
echo "cd /Users/gongchanghyeon/Desktop/cargoro/monorepo-root"
echo "pnpm install"
echo "pnpm --filter @cargoro/workshop-web build"
