#!/bin/bash
# CarGoro 모든 서비스 (백엔드 + 프론트엔드) 일괄 실행 스크립트

# 스크립트 실행 디렉토리 설정
cd "$(dirname "$0")/../.."
REPO_ROOT=$(pwd)

echo "===== CarGoro 통합 실행 시스템 ====="
echo "모든 백엔드 서비스와 프론트엔드 앱을 시작합니다..."
echo ""

# 먼저 백엔드 서비스 시작
echo "1. 백엔드 서비스 시작 중..."
cd "$REPO_ROOT/backend"
./start_all_services.sh
cd "$REPO_ROOT"

# 백엔드 서비스가 완전히 시작될 때까지 잠시 대기
echo ""
echo "백엔드 서비스 초기화 대기 중..."
sleep 5

# 프론트엔드 앱 시작
echo ""
echo "2. 프론트엔드 앱 시작 중..."
./scripts/local-dev/start_all_frontends.sh

echo ""
echo "===== 모든 서비스가 시작되었습니다! ====="
echo ""
echo "백엔드 API Gateway: http://localhost:8300"
echo "API 문서: http://localhost:8300/docs"
echo ""
echo "프론트엔드 앱:"
echo "- 배송 기사 앱: http://localhost:3001"
echo "- 차량 관리자 웹: http://localhost:3002"
echo "- 부품 관리 웹: http://localhost:3003"
echo "- 스마트 카 어시스턴트: http://localhost:3004"
echo "- 관리자 웹: http://localhost:3005"
echo "- 정비소 모바일: http://localhost:3006"
echo "- 정비소 웹: http://localhost:3007"
echo ""
echo "각 서비스의 로그는 logs/ 디렉토리에서 확인할 수 있습니다."
echo "모든 서비스를 종료하려면 ./scripts/local-dev/stop_all.sh를 실행하세요."
