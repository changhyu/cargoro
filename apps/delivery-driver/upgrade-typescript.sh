#!/bin/bash
cd /Users/gongchanghyeon/Desktop/cargoro/monorepo-root/apps/delivery-driver

echo "=== 기존 패키지 제거 ==="
rm -rf node_modules
rm -f pnpm-lock.yaml

echo -e "\n=== package.json 업데이트 ==="
# TypeScript 5로 업그레이드
sed -i '' 's/"typescript": "^4.9.5"/"typescript": "^5.0.4"/' package.json

echo -e "\n=== 패키지 재설치 ==="
pnpm install

echo -e "\n=== TypeScript 타입체크 실행 ==="
pnpm run typecheck
