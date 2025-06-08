#!/bin/bash

# 현재 디렉토리로 이동
cd "$(dirname "$0")/../.."

# cross-env 패키지 설치
echo "cross-env 패키지를 설치합니다..."
pnpm add -D cross-env --filter @cargoro/workshop-web

# 패키지 설치 후 빌드 테스트
echo "빌드 테스트를 실행합니다..."
pnpm build --filter @cargoro/workshop-web
