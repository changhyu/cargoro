#!/bin/bash
# 백엔드 일관성 마이그레이션 스크립트
# 실행 방법: ./backend-consistency.sh

echo "백엔드 일관성 마이그레이션 시작..."

# 디렉토리 생성
mkdir -p /Users/gongchanghyeon/Desktop/cargoro/monorepo-root/docs/guidelines
mkdir -p /Users/gongchanghyeon/Desktop/cargoro/monorepo-root/docs/workflows

# 1. 백엔드 TypeScript 파일 확인
echo "TypeScript 파일 확인 중..."
find /Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend -name "*.ts" > /tmp/backend_ts_files.txt

# 2. TypeScript 파일 수 확인
TS_FILE_COUNT=$(wc -l < /tmp/backend_ts_files.txt)
echo "백엔드에서 발견된 TypeScript 파일: $TS_FILE_COUNT 개"

# 3. 파이썬 파일 네이밍 일관성 검사
echo "Python 파일 네이밍 검사 중..."
find /Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend -name "*.py" -exec grep -l "camelCase" {} \; > /tmp/python_naming_issues.txt

# 4. 파이썬 파일 응답 형식 일관성 검사
echo "Python API 응답 형식 검사 중..."
find /Users/gongchanghyeon/Desktop/cargoro/monorepo-root/backend -name "*.py" -exec grep -l "return {" {} \; > /tmp/python_response_issues.txt

echo "검사 완료. 결과 파일:"
echo "- TypeScript 파일 목록: /tmp/backend_ts_files.txt"
echo "- Python 네이밍 이슈: /tmp/python_naming_issues.txt"
echo "- Python 응답 형식 이슈: /tmp/python_response_issues.txt"

echo "일관성 마이그레이션을 위한 분석이 완료되었습니다."
