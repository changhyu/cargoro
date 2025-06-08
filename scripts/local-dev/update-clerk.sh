#!/bin/bash

# 스크립트 실행 디렉토리 설정
cd "$(dirname "$0")/../.."

# Clerk 업데이트
echo "Clerk 패키지를 최신 버전으로 업데이트합니다..."
cd apps/fleet-manager-web
npm install @clerk/nextjs@latest

echo "Clerk 패키지 업데이트가 완료되었습니다."
