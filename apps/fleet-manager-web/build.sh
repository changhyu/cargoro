#!/bin/bash

echo "🔨 CarGoro 프론트엔드 빌드 시작..."

# Node.js 버전 확인
echo "Node.js 버전 확인:"
node --version
npm --version
pnpm --version

# 의존성 설치
echo "의존성 설치..."
pnpm install

# 환경 변수 파일 생성
echo "환경 변수 설정..."
if [ ! -f .env.local ]; then
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8004
EOF
    echo ".env.local 파일이 생성되었습니다."
fi

# TypeScript 타입 체크
echo "TypeScript 타입 체크..."
pnpm tsc --noEmit

# ESLint 검사
echo "ESLint 검사..."
pnpm lint

# 빌드
echo "프로덕션 빌드..."
pnpm build

echo "✅ 프론트엔드 빌드 완료!"
