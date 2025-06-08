#!/bin/bash
# workshop-mobile 앱에 필요한 타입 패키지 설치

cd /Users/gongchanghyeon/Desktop/cargoro/monorepo-root/apps/workshop-mobile

# 필요한 타입 패키지 설치
pnpm add -D @types/node@latest @testing-library/jest-dom@latest @types/testing-library__jest-dom@latest vitest@latest msw@latest

echo "타입 패키지 설치 완료!"
