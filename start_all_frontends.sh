#!/bin/bash

# 모든 프론트엔드 앱을 병렬로 실행하는 스크립트
echo "🚀 모든 프론트엔드 앱 시작하기"

# 배경에서 각 웹 앱 실행
echo "🌐 웹 앱 시작하기..."
pnpm dev:workshop &
WORKSHOP_PID=$!
pnpm dev:fleet &
FLEET_PID=$!
pnpm dev:parts &
PARTS_PID=$!
pnpm dev:admin &
ADMIN_PID=$!

# 배경에서 각 모바일 앱 실행 (각각 다른 포트 사용)
echo "📱 모바일 앱 시작하기..."
pnpm dev:customer-mobile &
CUSTOMER_MOBILE_PID=$!
pnpm dev:technician-mobile &
TECHNICIAN_MOBILE_PID=$!
pnpm dev:workshop-mobile &
WORKSHOP_MOBILE_PID=$!
pnpm dev:smart-car &
SMART_CAR_PID=$!
pnpm dev:delivery &
DELIVERY_PID=$!

# 실행 중인 모든 PID를 파일에 저장
echo "✅ 모든 프론트엔드 앱이 실행 중입니다."
echo "실행 중인 앱을 중지하려면 ./stop_all_frontends.sh를 실행하세요."

# PID 저장
echo $WORKSHOP_PID $FLEET_PID $PARTS_PID $ADMIN_PID $CUSTOMER_MOBILE_PID $TECHNICIAN_MOBILE_PID $WORKSHOP_MOBILE_PID $SMART_CAR_PID $DELIVERY_PID > .frontend_pids

# 메인 프로세스 대기
wait
