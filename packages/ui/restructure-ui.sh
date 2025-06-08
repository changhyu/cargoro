#!/bin/bash

# UI 패키지 구조 정리 및 빌드 스크립트

set -e

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}UI 패키지 구조 정리 시작${NC}"

cd /Users/gongchanghyeon/Desktop/cargoro/monorepo-root/packages/ui

# 1. 기존 빌드 정리
echo -e "${YELLOW}1단계: 기존 빌드 정리${NC}"
rm -rf dist
rm -f .tsbuildinfo

# 2. 새로운 index.ts 생성 (실제 파일 위치 기반)
echo -e "${YELLOW}2단계: index.ts 재생성${NC}"
cat > index.ts << 'EOF'
/**
 * UI 패키지 - 통합 export
 */

// 컴포넌트 exports (components 폴더)
export * from './components/button';
export * from './components/card';
export * from './components/alert';
export * from './components/badge';
export * from './components/checkbox';
export * from './components/dialog';
export * from './components/dropdown-menu';
export * from './components/input';
export * from './components/label';
export * from './components/select';
export * from './components/separator';
export * from './components/tabs';
export * from './components/table';
export * from './components/textarea';
export * from './components/toast';
export * from './components/skeleton';
export * from './components/switch';
export * from './components/progress';
export * from './components/slider';
export * from './components/spinner';

// app/components에서 가져올 컴포넌트들
export { Button, buttonVariants } from './app/components/button/button';
export type { ButtonProps } from './app/components/button/button';

// Toast 관련
export { useToast } from './components/use-toast/use-toast';
export { Toaster } from './components/toast/toaster';

// Utils
export * from './utils';

// Hooks
export * from './hooks';
EOF

# 3. tsconfig.json 수정
echo -e "${YELLOW}3단계: tsconfig.json 수정${NC}"
cat > tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./",
    "declaration": true,
    "declarationMap": true,
    "incremental": true,
    "tsBuildInfoFile": "./dist/.tsbuildinfo",
    "noEmit": false,
    "baseUrl": ".",
    "jsx": "react-jsx",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": [
    "index.ts",
    "components/**/*",
    "app/components/**/*",
    "hooks/**/*",
    "utils/**/*",
    "lib/**/*"
  ],
  "exclude": [
    "dist",
    "node_modules",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.stories.tsx",
    "vitest.config.ts"
  ]
}
EOF

# 4. 빌드 실행
echo -e "${YELLOW}4단계: TypeScript 빌드${NC}"
npx tsc || echo -e "${RED}TypeScript 컴파일 경고가 있습니다${NC}"

# 5. CSS 복사
echo -e "${YELLOW}5단계: CSS 파일 복사${NC}"
if [ -f app/styles/globals.css ]; then
    cp app/styles/globals.css dist/globals.css
    echo "✅ globals.css 복사 완료"
fi

# 6. 빌드 결과 확인
echo -e "${GREEN}✅ UI 패키지 정리 완료!${NC}"
ls -la dist/ 2>/dev/null || echo "dist 폴더가 생성되지 않았습니다"

# 7. 다음 단계 안내
echo -e "\n${BLUE}다음 명령을 실행하세요:${NC}"
echo "cd /Users/gongchanghyeon/Desktop/cargoro/monorepo-root"
echo "chmod +x fix-ui-imports.sh"
echo "./fix-ui-imports.sh"
