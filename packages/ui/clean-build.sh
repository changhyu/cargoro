#!/bin/bash
cd /Users/gongchanghyeon/Desktop/cargoro/monorepo-root/packages/ui
echo "🧹 dist 폴더 정리 중..."
rm -rf dist
echo "✅ dist 폴더 정리 완료"
echo "🔨 UI 패키지 빌드 시작..."
pnpm build
