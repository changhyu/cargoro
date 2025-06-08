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
COMMIT_MESSAGE="fix: @cargoro/auth 패키지 린트 오류 수정

- clear-clerk-cookies.ts 수정
  - @ts-ignore를 @ts-expect-error로 변경
  - 모든 console 문에 eslint-disable-next-line no-console 주석 추가
  - 개발 환경에서 디버깅을 위한 console은 유지하되 ESLint 경고 비활성화
  
- clerk.ts 수정
  - 사용하지 않는 TypesUserProfile import 제거
  
린트 오류가 모두 해결되었습니다."

# 커밋 실행
echo -e "\n=== 커밋 실행 ==="
git commit -m "$COMMIT_MESSAGE"

# origin/main으로 푸시
echo -e "\n=== origin/main으로 푸시 ==="
git push origin main

echo -e "\n=== 완료! ==="
echo "auth 패키지 린트 오류 수정이 완료되었습니다."
