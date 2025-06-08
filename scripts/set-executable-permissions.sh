#!/bin/bash

# 모든 스크립트 파일에 실행 권한 부여

echo "🔧 스크립트 실행 권한 설정 중..."

# TypeScript 스크립트를 위한 shebang 추가 및 실행 가능하게 만들기
chmod +x scripts/cli.ts
chmod +x scripts/setup-env.ts
chmod +x scripts/generate-types.ts
chmod +x scripts/deploy.ts
chmod +x scripts/format-all.ts
chmod +x scripts/sync-env.ts

# 기존 shell 스크립트들도 실행 가능하게
find . -name "*.sh" -type f ! -path "./node_modules/*" ! -path "./.git/*" -exec chmod +x {} \;

echo "✅ 스크립트 실행 권한 설정 완료!"
