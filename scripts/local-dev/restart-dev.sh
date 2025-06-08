#!/bin/bash

# 개발 서버를 중지합니다
echo "현재 실행 중인 Next.js 개발 서버를 중지합니다..."
pkill -f "next dev" || true

# 임시 파일 정리
echo "Next.js 캐시를 정리합니다..."
cd /Users/gongchanghyeon/Desktop/cargoro/monorepo-root/apps/workshop-web
rm -rf .next/cache/webpack || true

# 개발 서버 재시작
echo "Next.js 개발 서버를 재시작합니다..."
cd /Users/gongchanghyeon/Desktop/cargoro/monorepo-root
pnpm dev --filter @cargoro/workshop-web
