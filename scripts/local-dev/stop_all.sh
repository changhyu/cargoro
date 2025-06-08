#!/bin/bash
# CarGoro 모든 서비스 (백엔드 + 프론트엔드) 일괄 종료 스크립트

# 스크립트 실행 디렉토리 설정
cd "$(dirname "$0")/../.."
REPO_ROOT=$(pwd)

echo "===== CarGoro 통합 종료 시스템 ====="
echo "모든 백엔드 서비스와 프론트엔드 앱을 종료합니다..."
echo ""

# 먼저 프론트엔드 앱 종료
echo "1. 프론트엔드 앱 종료 중..."
./scripts/local-dev/stop_all_frontends.sh

# 백엔드 서비스 종료
echo ""
echo "2. 백엔드 서비스 종료 중..."
cd "$REPO_ROOT/backend"
./stop_all_services.sh
cd "$REPO_ROOT"

echo ""
echo "===== 모든 서비스가 종료되었습니다! ====="

# 종료 확인
echo ""
echo "종료 확인 중..."
sleep 2

# 백엔드 포트 확인
for port in 8300 8301 8302 8303 8304 8305 8308; do
  pid=$(lsof -i:$port -t 2>/dev/null)
  if [ ! -z "$pid" ]; then
    echo "경고: 포트 $port에서 여전히 프로세스가 실행 중입니다 (PID: $pid). 강제 종료 중..."
    kill -9 $pid 2>/dev/null || true
  fi
done

# 프론트엔드 포트 확인
for port in 3001 3002 3003 3004 3005 3006 3007 19001 19002; do
  pid=$(lsof -i:$port -t 2>/dev/null)
  if [ ! -z "$pid" ]; then
    echo "경고: 포트 $port에서 여전히 프로세스가 실행 중입니다 (PID: $pid). 강제 종료 중..."
    kill -9 $pid 2>/dev/null || true
  fi
done

echo "모든 서비스 종료 확인 완료!"
