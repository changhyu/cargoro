#!/bin/bash

# 모노레포 의존성 및 모듈 경로 설정 스크립트
echo "🚀 모노레포 설정 스크립트 시작..."

# 1. 모듈 경로 설정 스크립트 실행
echo "📂 모듈 경로 설정 중..."
chmod +x ./scripts/setup-nextjs-apps.sh
./scripts/setup-nextjs-apps.sh

# 2. lucide-react 버전 고정
echo "📦 lucide-react 버전 0.263.1로 고정 중..."
pnpm add lucide-react@0.263.1 -w

# 3. 각 앱의 lucide-react 버전 확인 및 업데이트
echo "🔍 각 앱의 lucide-react 버전 확인 중..."
for app in ./apps/*; do
  if [ -d "$app" ] && [ -f "$app/package.json" ]; then
    app_name=$(basename "$app")
    echo "  - $app_name 앱 확인 중..."
    
    if grep -q "\"lucide-react\":" "$app/package.json"; then
      echo "    ✅ $app_name 앱에 lucide-react 패키지가 있습니다. 버전 0.263.1로 업데이트합니다."
      cd "$app"
      pnpm add lucide-react@0.263.1
      cd ../../
    fi
  fi
done

# 4. vitest 및 typescript 의존성 설치
echo "📦 vitest 및 typescript 의존성 설치 중..."
pnpm add -D vitest @vitest/globals typescript -w

# 5. 의존성 중복 제거
echo "🧹 의존성 중복 제거 중..."
pnpm dedupe

# 6. 패키지 빌드
echo "🔨 패키지 빌드 중..."
pnpm build:packages

echo "✨ 모노레포 설정이 완료되었습니다!"
echo "📝 다음 단계:"
echo "  1. 각 앱의 next.config.js 파일을 확인하세요."
echo "  2. 필요한 경우 scripts/fix-module-paths.sh 스크립트의 안내에 따라 수동으로 설정을 변경하세요."
echo "  3. pnpm dev 명령을 실행하여 개발 서버를 시작하세요."
