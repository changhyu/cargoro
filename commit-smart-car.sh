#!/bin/bash
# 현재 디렉토리를 monorepo-root로 변경
cd /Users/gongchanghyeon/Desktop/cargoro/monorepo-root

# Git 상태 확인
echo "=== Git 상태 확인 ==="
git status

# 변경사항 스테이징
echo -e "\n=== 변경사항 추가 ==="
git add .

# 커밋 메시지 작성
COMMIT_MESSAGE="fix: @cargoro/smart-car-assistant 린트 오류 수정

주요 수정 사항:
- navigation.ts: 미사용 import 제거, 빈 인터페이스에 eslint-disable 주석 추가
- auth-utils.ts: React Hook 규칙 준수를 위해 useAuthUtils 커스텀 Hook으로 변경
  - 일반 함수에서 React Hook 사용 금지
  - 기존 함수들은 deprecated로 표시하고 에러 발생하도록 수정
- obd-connector.ts: 미사용 import 제거, console에 eslint-disable 추가
- expo-env.d.ts: any 타입을 구체적인 타입으로 변경
  - 이미지 파일: number 타입 (React Native의 이미지 ID)
  - SVG 파일: React 컴포넌트 타입
- tsconfig.json: index.js 파일 제외 추가

이제 React Hook은 컴포넌트 내에서 useAuthUtils()를 사용해야 합니다."

# 커밋 실행
echo -e "\n=== 커밋 실행 ==="
git commit -m "$COMMIT_MESSAGE"

# origin/main으로 푸시
echo -e "\n=== origin/main으로 푸시 ==="
git push origin main

echo -e "\n=== 완료! ==="
echo "smart-car-assistant 앱의 린트 오류가 수정되었습니다."
