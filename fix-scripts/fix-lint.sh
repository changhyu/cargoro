#!/bin/bash

echo "🔧 린트 문제 해결 스크립트 시작..."

# 1. workshop-mobile에 필요한 ESLint 플러그인 설치
echo "📦 workshop-mobile ESLint 플러그인 설치 중..."
cd apps/workshop-mobile
pnpm add -D @typescript-eslint/eslint-plugin@^8.32.1 @typescript-eslint/parser@^8.32.1 eslint-plugin-react@^7.34.0 eslint-plugin-react-hooks@^4.6.0 eslint-plugin-react-native@^4.1.0

# 2. 루트로 돌아가기
cd ../../

# 3. 의존성 중복 제거
echo "🧹 의존성 중복 제거 중..."
pnpm dedupe

# 4. 린트 재실행
echo "🔍 린트 재실행 중..."
pnpm lint

echo "✅ 린트 문제 해결 완료!"
