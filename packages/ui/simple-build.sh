#!/bin/bash

# UI 패키지 간단 빌드 스크립트

set -e

echo "🚀 UI 패키지 간단 빌드 시작..."

# 1. dist 폴더 완전 삭제
echo "1. 기존 빌드 삭제..."
rm -rf dist
rm -f .tsbuildinfo
rm -f tsconfig.tsbuildinfo

# 2. dist 폴더 생성
echo "2. dist 폴더 생성..."
mkdir -p dist

# 3. 필요한 파일들을 dist로 복사 (트랜스파일 없이)
echo "3. 파일 복사 중..."

# index 파일 생성
cat > dist/index.js << 'EOF'
// Re-export everything from source
module.exports = require('../index.ts');
EOF

cat > dist/index.d.ts << 'EOF'
export * from '../index';
EOF

# utils 파일 복사
if [ -f "utils.ts" ]; then
    cp utils.ts dist/utils.ts
    cp utils.ts dist/utils.js
    echo "export * from '../utils';" > dist/utils.d.ts
fi

# CSS 복사
if [ -f "app/styles/globals.css" ]; then
    cp app/styles/globals.css dist/globals.css
fi

# 4. package.json 생성
cat > dist/package.json << 'EOF'
{
  "name": "@cargoro/ui",
  "version": "0.1.0",
  "main": "./index.js",
  "module": "./index.js",
  "types": "./index.d.ts",
  "exports": {
    ".": {
      "import": "./index.js",
      "require": "./index.js",
      "types": "./index.d.ts"
    },
    "./globals.css": "./globals.css"
  }
}
EOF

echo "✅ 간단 빌드 완료!"
echo ""
echo "다음 단계:"
echo "cd /Users/gongchanghyeon/Desktop/cargoro/monorepo-root"
echo "pnpm install"
echo "pnpm --filter @cargoro/workshop-web build"
