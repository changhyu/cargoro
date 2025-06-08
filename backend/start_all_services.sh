#!/bin/bash
# CarGoro 백엔드 서비스 일괄 실행 스크립트

# 환경 설정
PYTHONPATH=$(pwd)
export PYTHONPATH

# 로그 디렉토리 생성
mkdir -p logs

# 프로세스 ID 저장 디렉토리
mkdir -p .pids

# 실행 중인 이전 프로세스 종료
echo "이전에 실행 중인 서비스를 종료합니다..."
if [ -d ".pids" ]; then
  for pid_file in .pids/*.pid; do
    if [ -f "$pid_file" ]; then
      pid=$(cat "$pid_file")
      service_name=$(basename "$pid_file" .pid)
      if ps -p $pid > /dev/null; then
        echo "[$service_name] 서비스 종료 중 (PID: $pid)..."
        kill $pid
      fi
      rm "$pid_file"
    fi
  done
fi

# 서비스 시작 함수
start_service() {
    local service_name=$1
    local port=$2
    local service_path=$3
    local log_file="logs/${service_name}.log"

    echo "[$service_name] 서비스를 포트 $port에서 시작합니다..."
    python $service_path --port $port > $log_file 2>&1 &
    local pid=$!
    echo $pid > .pids/${service_name}.pid
    echo "[$service_name] 서비스 시작됨 (PID: $pid, 포트: $port, 로그: $log_file)"
}

# 서비스 시작
echo "백엔드 서비스를 시작합니다..."

# API Gateway
start_service "gateway" 8300 "gateway/gateway.py"
sleep 2

# Core API
start_service "core_api" 8301 "services/core_api/main.py"
sleep 1

# Repair API
start_service "repair_api" 8302 "services/repair_api/main.py"
sleep 1

# Fleet API
start_service "fleet_api" 8303 "services/fleet_api/main.py"
sleep 1

# Parts API
start_service "parts_api" 8304 "services/parts_api/main.py"
sleep 1

# Admin API
start_service "admin_api" 8305 "services/admin_api/main.py"
sleep 1

# Delivery API
start_service "delivery_api" 8308 "services/delivery_api/main.py"
sleep 1

echo ""
echo "모든 서비스가 시작되었습니다."
echo "API Gateway: http://localhost:8300"
echo "API 문서: http://localhost:8300/docs"
echo "서비스 통합 정보: http://localhost:8300/graphql/services"
echo "서비스 상태 확인: http://localhost:8300/health"
echo ""
echo "각 서비스의 로그는 logs/ 디렉토리에서 확인할 수 있습니다."
echo "모든 서비스를 종료하려면 ./stop_all_services.sh를 실행하세요."
