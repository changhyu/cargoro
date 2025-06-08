#!/bin/bash
cd /Users/gongchanghyeon/Desktop/cargoro/monorepo-root/apps/delivery-driver

echo "=== TypeScript 타입체크 실행 중 ==="
pnpm run typecheck

echo -e "\n=== ESLint 린트 실행 중 ==="
pnpm run lint
