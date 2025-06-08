#!/bin/bash

# 빌드 캐시 정리 스크립트

echo "🧹 빌드 캐시 정리 시작..."

# .next 디렉토리 삭제
echo "📁 .next 디렉토리 삭제 중..."
find apps -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true

# .turbo 디렉토리 삭제
echo "📁 .turbo 디렉토리 삭제 중..."
find . -name ".turbo" -type d -exec rm -rf {} + 2>/dev/null || true

# tsconfig.tsbuildinfo 파일 삭제
echo "📁 tsconfig.tsbuildinfo 파일 삭제 중..."
find . -name "tsconfig.tsbuildinfo" -type f -delete 2>/dev/null || true
find . -name ".tsbuildinfo" -type f -delete 2>/dev/null || true

echo "✅ 캐시 정리 완료!"
