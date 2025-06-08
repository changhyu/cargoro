#!/bin/bash

# 중복된 pnpm-lock.yaml 파일 삭제 스크립트

echo "🧹 중복된 pnpm-lock.yaml 파일 정리 중..."

# 루트 디렉토리 제외하고 모든 pnpm-lock.yaml 파일 삭제
find . -name "pnpm-lock.yaml" -not -path "./pnpm-lock.yaml" -type f -delete

echo "✅ 중복된 lock 파일 삭제 완료!"
echo "📦 이제 'pnpm install'을 실행하여 의존성을 다시 설치하세요."
