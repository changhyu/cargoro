#!/bin/bash

# delivery-driver 앱에 필요한 테스트 관련 패키지 설치

cd /Users/gongchanghyeon/Desktop/cargoro/monorepo-root/apps/delivery-driver

# vitest와 관련 패키지 설치
pnpm add -D vitest @vitest/ui @testing-library/jest-dom

# MSW (Mock Service Worker) 설치
pnpm add -D msw

# 타입 정의 패키지 설치
pnpm add -D @types/node

echo "패키지 설치가 완료되었습니다."
