#!/bin/bash

# TypeScript 및 Vitest 의존성 설치 스크립트
echo "📦 필수 의존성 설치 시작..."

# 루트 패키지에 필수 개발 의존성 설치
echo "🔧 루트 패키지 개발 의존성 설치 중..."
pnpm add -D typescript vitest @vitest/globals @types/react @types/react-dom -w
echo "✅ 루트 패키지 개발 의존성 설치 완료"

# lucide-react 버전 다운그레이드
echo "🔄 lucide-react 버전 다운그레이드 중..."
pnpm add lucide-react@0.263.1 -w
echo "✅ lucide-react 버전 다운그레이드 완료"

# 각 앱 패키지 의존성 설치
for app in ./apps/*/; do
  if [ -d "$app" ]; then
    app_name=$(basename "$app")
    echo "🔧 $app_name 앱 의존성 설치 중..."
    pnpm add -D typescript vitest @vitest/globals --filter="@cargoro/$app_name"
    pnpm add lucide-react@0.263.1 --filter="@cargoro/$app_name"
    echo "✅ $app_name 앱 의존성 설치 완료"
  fi
done

# 중복 의존성 제거
echo "🧩 의존성 중복 제거 중..."
pnpm dedupe
echo "✅ 의존성 중복 제거 완료"

echo "✨ 모든 의존성 설치 완료!"
