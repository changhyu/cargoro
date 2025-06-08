#!/bin/bash

# Clerk 미들웨어 설정 스크립트
# 각 앱에 Clerk 미들웨어를 자동으로 설정합니다.

echo "🔐 Clerk 미들웨어 설정 시작..."

# 앱 목록
APPS=("workshop-web" "fleet-manager-web" "superadmin-web" "parts-web")

# 각 앱에 대해 미들웨어 생성
for APP in "${APPS[@]}"; do
  APP_PATH="apps/$APP"
  
  if [ -d "$APP_PATH" ]; then
    echo "📁 $APP 설정 중..."
    
    # middleware.ts 생성
    cat > "$APP_PATH/middleware.ts" << EOF
import { createClerkMiddleware } from '@cargoro/auth/server';

// $APP 전용 미들웨어
export default createClerkMiddleware({
  protected: [
    '/((?!api/public|_next/static|_next/image|favicon.ico).*)',
  ],
  public: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/public(.*)',
  ],
  debug: process.env.NODE_ENV === 'development',
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
EOF
    
    echo "✅ $APP/middleware.ts 생성 완료"
    
    # .env.local.example 생성
    cat > "$APP_PATH/.env.local.example" << EOF
# $APP 전용 환경 변수
# 루트 .env에서 상속받는 변수들은 여기에 포함하지 마세요

# 앱별 리다이렉트 URL (선택사항)
# NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
# NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/onboarding

# 앱별 설정 (선택사항)
# NEXT_PUBLIC_APP_NAME=$APP
EOF
    
    echo "✅ $APP/.env.local.example 생성 완료"
  else
    echo "⚠️  $APP_PATH 디렉토리를 찾을 수 없습니다."
  fi
done

echo ""
echo "✨ Clerk 미들웨어 설정 완료!"
echo ""
echo "다음 단계:"
echo "1. 루트에 .env 파일을 생성하고 Clerk 키를 설정하세요"
echo "2. 각 앱의 .env.local.example을 참고하여 .env.local 파일을 생성하세요"
echo "3. 각 앱의 layout.tsx에 ClerkProvider를 추가하세요"
echo ""
echo "자세한 내용은 packages/auth/CLERK_ENV_SETUP.md를 참고하세요."
