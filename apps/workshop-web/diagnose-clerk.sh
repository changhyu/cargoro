#!/bin/bash

echo "🔍 Clerk 설정 진단 중..."
echo ""

# 1. 환경 변수 확인
echo "📋 환경 변수 확인:"
if [ -f ".env.local" ]; then
    echo "✅ .env.local 파일 발견"
    echo ""
    echo "Clerk 키 설정:"
    grep "CLERK" .env.local | sed 's/=.*/=.../' # 키 값은 숨김
    echo ""
else
    echo "❌ .env.local 파일이 없습니다!"
fi

# 2. package.json 확인
echo "📦 Clerk 패키지 버전:"
grep "@clerk" package.json | sed 's/^ *//'
echo ""

# 3. 파일 구조 확인
echo "📁 인증 페이지 파일 확인:"
if [ -f "app/sign-in/[[...sign-in]]/page.tsx" ]; then
    echo "✅ sign-in 페이지 존재"
else
    echo "❌ sign-in 페이지 없음"
fi

if [ -f "app/sign-up/[[...sign-up]]/page.tsx" ]; then
    echo "✅ sign-up 페이지 존재"
else
    echo "❌ sign-up 페이지 없음"
fi

if [ -f "middleware.ts" ]; then
    echo "✅ middleware.ts 존재"
else
    echo "❌ middleware.ts 없음"
fi

if [ -f "app/layout.tsx" ]; then
    echo "✅ layout.tsx 존재"
else
    echo "❌ layout.tsx 없음"
fi

echo ""
echo "🔧 다음 단계:"
echo "1. Clerk 대시보드(https://dashboard.clerk.com)에서 키 확인"
echo "2. .env.local 파일에 올바른 키가 있는지 확인"
echo "3. 개발 서버 재시작: Ctrl+C 후 pnpm run dev"
echo "4. 브라우저 캐시 삭제 (Cmd+Shift+R 또는 Ctrl+Shift+R)"
