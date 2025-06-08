#!/bin/bash

# UI 패키지 재빌드 스크립트

set -e

echo "🔧 UI 패키지 재빌드 시작..."

cd /Users/gongchanghyeon/Desktop/cargoro/monorepo-root/packages/ui

# 1. 기존 빌드 결과물 삭제
echo "🧹 기존 빌드 결과물 정리..."
rm -rf dist
rm -f .tsbuildinfo

# 2. export 파일 재생성
echo "📝 Export 파일 재생성..."
node build-exports.js

# 3. TypeScript 컴파일
echo "🔨 TypeScript 컴파일..."
npx tsc

# 4. CSS 파일 복사
echo "🎨 CSS 파일 복사..."
mkdir -p dist
if [ -f app/styles/globals.css ]; then
  cp app/styles/globals.css dist/globals.css
fi

# 5. 빌드 결과 확인
echo "✅ 빌드 완료! 빌드 결과:"
ls -la dist/

echo "📦 index.d.ts 확인:"
head -20 dist/index.d.ts || echo "index.d.ts 파일이 생성되지 않았습니다."

echo ""
echo "다음 단계:"
echo "1. cd /Users/gongchanghyeon/Desktop/cargoro/monorepo-root"
echo "2. pnpm install"
echo "3. pnpm --filter @cargoro/workshop-web build"
