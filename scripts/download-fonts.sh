#!/bin/bash

# 폰트 다운로드 스크립트
# Pretendard 폰트를 다운로드하고 각 앱의 public/fonts 디렉토리에 복사합니다.

set -e  # 오류 발생 시 스크립트 중단

# 스크립트 실행 위치 저장
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔤 Pretendard 폰트 다운로드 시작..."
echo "📍 프로젝트 루트: $ROOT_DIR"

# 임시 디렉토리 생성
TEMP_DIR=$(mktemp -d)
echo "📁 임시 디렉토리: $TEMP_DIR"
cd "$TEMP_DIR"

# Pretendard 최신 버전 확인
echo "🔍 최신 버전 확인 중..."
LATEST_VERSION=$(curl -s https://api.github.com/repos/orioncactus/pretendard/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
echo "📌 최신 버전: $LATEST_VERSION"

# Pretendard 폰트 다운로드
echo "📥 Pretendard 폰트 다운로드 중..."
DOWNLOAD_URL="https://github.com/orioncactus/pretendard/releases/download/${LATEST_VERSION}/Pretendard-${LATEST_VERSION}.zip"
curl -L "$DOWNLOAD_URL" -o pretendard.zip || {
    echo "❌ 다운로드 실패. URL을 확인해주세요: $DOWNLOAD_URL"
    exit 1
}

# 압축 해제
echo "📦 압축 해제 중..."
unzip -q pretendard.zip || {
    echo "❌ 압축 해제 실패"
    exit 1
}

# 압축 해제된 디렉토리 구조 확인
echo "📂 압축 해제된 구조 확인..."
ls -la

# 웹폰트 디렉토리 찾기 (버전에 따라 경로가 다를 수 있음)
WEBFONT_DIR=""
if [ -d "public/static" ]; then
    WEBFONT_DIR="public/static"
elif [ -d "web/static" ]; then
    WEBFONT_DIR="web/static"
elif [ -d "static" ]; then
    WEBFONT_DIR="static"
else
    echo "⚠️  표준 웹폰트 디렉토리를 찾을 수 없습니다. 수동으로 확인해주세요."
    find . -name "*.woff2" -type f | head -5
    exit 1
fi

echo "✅ 웹폰트 디렉토리: $WEBFONT_DIR"

# 앱 목록
APPS=(
  "workshop-web"
  "fleet-manager-web"
  "parts-web"
  "superadmin-web"
)

# 각 앱의 public/fonts 디렉토리 생성 및 폰트 복사
for APP in "${APPS[@]}"; do
  FONT_DIR="$ROOT_DIR/apps/$APP/public/fonts"
  
  echo "📁 $APP 폰트 디렉토리 생성..."
  mkdir -p "$FONT_DIR"
  
  echo "📋 $APP에 웹폰트 복사 중..."
  if [ -d "$WEBFONT_DIR/woff2" ]; then
    cp "$WEBFONT_DIR/woff2/Pretendard-"*.woff2 "$FONT_DIR/" 2>/dev/null || echo "  ⚠️  woff2 파일을 찾을 수 없습니다"
  fi
  if [ -d "$WEBFONT_DIR/woff" ]; then
    cp "$WEBFONT_DIR/woff/Pretendard-"*.woff "$FONT_DIR/" 2>/dev/null || echo "  ⚠️  woff 파일을 찾을 수 없습니다"
  fi
  
  # 복사된 파일 개수 확인
  FILE_COUNT=$(ls -1 "$FONT_DIR" 2>/dev/null | wc -l)
  echo "  ✅ $FILE_COUNT개 파일 복사 완료"
done

# packages/ui의 public 디렉토리에도 복사
UI_FONT_DIR="$ROOT_DIR/packages/ui/public/fonts"
echo "📁 UI 패키지 폰트 디렉토리 생성..."
mkdir -p "$UI_FONT_DIR"

echo "📋 UI 패키지에 웹폰트 복사 중..."
if [ -d "$WEBFONT_DIR/woff2" ]; then
  cp "$WEBFONT_DIR/woff2/Pretendard-"*.woff2 "$UI_FONT_DIR/" 2>/dev/null || echo "  ⚠️  woff2 파일을 찾을 수 없습니다"
fi
if [ -d "$WEBFONT_DIR/woff" ]; then
  cp "$WEBFONT_DIR/woff/Pretendard-"*.woff "$UI_FONT_DIR/" 2>/dev/null || echo "  ⚠️  woff 파일을 찾을 수 없습니다"
fi

# 정리
cd "$ROOT_DIR"
rm -rf "$TEMP_DIR"

echo ""
echo "✅ 폰트 다운로드 및 설치 완료!"
echo ""
echo "📊 설치 요약:"
echo "- 다운로드한 버전: $LATEST_VERSION"
echo "- Pretendard 폰트 패밀리 (9개 굵기)"
echo ""
echo "📍 폰트 설치 위치:"
for APP in "${APPS[@]}"; do
  FONT_DIR="$ROOT_DIR/apps/$APP/public/fonts"
  if [ -d "$FONT_DIR" ]; then
    FILE_COUNT=$(ls -1 "$FONT_DIR" 2>/dev/null | wc -l)
    echo "- apps/$APP/public/fonts/ ($FILE_COUNT개 파일)"
  fi
done
UI_FILE_COUNT=$(ls -1 "$UI_FONT_DIR" 2>/dev/null | wc -l)
echo "- packages/ui/public/fonts/ ($UI_FILE_COUNT개 파일)"
echo ""
echo "💡 다음 단계:"
echo "1. 각 앱을 재시작하여 폰트가 제대로 로드되는지 확인하세요."
echo "2. 브라우저 개발자 도구의 네트워크 탭에서 폰트 로딩을 확인하세요."
echo "3. 문제가 있다면 폰트 경로를 확인하세요."
