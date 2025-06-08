#!/bin/bash
# CarGoro 프론트엔드 앱 일괄 실행 스크립트

# 스크립트 실행 디렉토리 설정
cd "$(dirname "$0")/../.."
REPO_ROOT=$(pwd)

# 로그 디렉토리 생성
mkdir -p logs/frontend

# 프로세스 ID 저장 디렉토리
mkdir -p .pids

# 실행 중인 이전 프로세스 종료
echo "이전에 실행 중인 프론트엔드 앱을 종료합니다..."
if [ -d ".pids" ]; then
  for pid_file in .pids/frontend_*.pid; do
    if [ -f "$pid_file" ]; then
      pid=$(cat "$pid_file")
      app_name=$(basename "$pid_file" .pid | sed 's/frontend_//')
      if ps -p $pid > /dev/null; then
        echo "[$app_name] 앱 종료 중 (PID: $pid)..."
        kill $pid
      fi
      rm "$pid_file"
    fi
  done
fi

# 앱 시작 함수
start_frontend_app() {
    local app_name=$1
    local port=$2
    local app_dir="apps/$app_name"
    local log_file="logs/frontend/${app_name}.log"
    local script_cmd=$3  # 스크립트 명령(dev 또는 start)
    local is_expo=$4    # Expo 앱인지 여부 (true 또는 false)
    local expo_port=$5  # Expo 앱일 경우 사용할 포트

    echo "[$app_name] 앱을 포트 $port에서 시작합니다... (명령어: $script_cmd)"

    # 앱 디렉토리로 이동
    cd "$REPO_ROOT/$app_dir"

    # PORT 환경 변수 설정 및 앱 실행
    if [ "$is_expo" = "true" ]; then
        # Expo 앱일 경우 캐시 정리 후 실행
        rm -rf .expo node_modules/.cache
        EXPO_PORT=$expo_port PORT=$port EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 pnpm run $script_cmd -- --port $expo_port > "$REPO_ROOT/$log_file" 2>&1 &
    else
        # Next.js 등 일반 웹 앱
        PORT=$port pnpm run $script_cmd > "$REPO_ROOT/$log_file" 2>&1 &
    fi

    local pid=$!

    # 다시 루트 디렉토리로 이동
    cd "$REPO_ROOT"

    # PID 저장
    echo $pid > .pids/frontend_${app_name}.pid
    echo "[$app_name] 앱 시작됨 (PID: $pid, 포트: $port, 로그: $log_file)"
}

# 프론트엔드 앱 시작
echo "프론트엔드 앱을 시작합니다..."

# 각 앱을 다른 포트에서 실행
# 파라미터: 앱 이름, 웹 포트, 스크립트 명령어, Expo 여부, Expo 포트
start_frontend_app "delivery-driver" 3001 "start:clean" "true" 19001
sleep 2

start_frontend_app "fleet-manager-web" 3002 "dev" "false" ""
sleep 2

start_frontend_app "parts-web" 3003 "dev" "false" ""
sleep 2

start_frontend_app "smart-car-assistant" 3004 "dev" "false" ""
sleep 2

start_frontend_app "superadmin-web" 3005 "dev" "false" ""
sleep 2

start_frontend_app "workshop-mobile" 3006 "start:clean" "true" 19002
sleep 2

start_frontend_app "workshop-web" 3007 "dev" "false" ""
sleep 2

echo ""
echo "모든 프론트엔드 앱이 시작되었습니다."
echo "delivery-driver: http://localhost:3001 (Expo 포트: 19001)"
echo "fleet-manager-web: http://localhost:3002"
echo "parts-web: http://localhost:3003"
echo "smart-car-assistant: http://localhost:3004"
echo "superadmin-web: http://localhost:3005"
echo "workshop-mobile: http://localhost:3006 (Expo 포트: 19002)"
echo "workshop-web: http://localhost:3007"
echo ""
echo "각 앱의 로그는 logs/frontend/ 디렉토리에서 확인할 수 있습니다."
echo "모든 프론트엔드 앱을 종료하려면 ./scripts/local-dev/stop_all_frontends.sh를 실행하세요."
