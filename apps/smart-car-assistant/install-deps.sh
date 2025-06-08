#!/bin/bash

# smart-car-assistant 앱에 필요한 패키지 설치

cd /Users/gongchanghyeon/Desktop/cargoro/monorepo-root

# 먼저 워크스페이스 전체 업데이트
echo "워크스페이스 업데이트 중..."
pnpm install

# smart-car-assistant 앱으로 이동
cd apps/smart-car-assistant

# 필요한 패키지 설치
echo "필요한 패키지 설치 중..."
pnpm add -D @testing-library/jest-dom@^6.1.5 msw@^2.0.0 @types/node@^20.10.0

echo "설치 완료!"
