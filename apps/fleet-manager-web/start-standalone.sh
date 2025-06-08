#!/bin/bash

# Fleet Manager Web 독립 실행 스크립트

echo "Fleet Manager Web 앱을 독립적으로 실행합니다..."

cd "$(dirname "$0")"

# 환경 변수 설정
export NODE_OPTIONS="--max-old-space-size=4096"
export NEXT_TELEMETRY_DISABLED=1

# 개발 서버 실행
npx next dev -p 3006
