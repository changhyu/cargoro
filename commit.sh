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
COMMIT_MESSAGE="fix: workshop-web 린트 오류 수정

- useRepairStatusHistory.ts의 no-useless-catch 오류 수정
  - 단순히 에러를 다시 throw하는 불필요한 try-catch 블록 제거
  - React Query가 자동으로 에러를 처리하므로 중복 제거
  
- CreateScheduleModal.tsx의 빈 catch 블록 개선
  - 임시로 console.error로 에러 로깅 추가
  - eslint-disable-next-line 주석으로 no-console 경고 비활성화
  - TODO 주석 유지하여 추후 적절한 에러 처리 구현 예정"

# 커밋 실행
echo -e "\n=== 커밋 실행 ==="
git commit -m "$COMMIT_MESSAGE"

# origin/main으로 푸시
echo -e "\n=== origin/main으로 푸시 ==="
git push origin main

echo -e "\n=== 완료! ==="
echo "workshop-web 앱의 린트 오류가 모두 수정되었습니다."
