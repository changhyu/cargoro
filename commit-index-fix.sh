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
COMMIT_MESSAGE="fix: smart-car-assistant index.js 린트 오류 수정

- .eslintrc.json의 ignorePatterns에 index.js 추가
- Expo 엔트리 포인트 파일인 index.js를 ESLint 검사에서 제외

index.js는 Expo 프로젝트의 필수 엔트리 포인트이므로 TypeScript로 변환하지 않고 ESLint에서 제외"

# 커밋 실행
echo -e "\n=== 커밋 실행 ==="
git commit -m "$COMMIT_MESSAGE"

# origin/main으로 푸시
echo -e "\n=== origin/main으로 푸시 ==="
git push origin main

echo -e "\n=== 완료! ==="
echo "index.js 린트 오류가 해결되었습니다."
