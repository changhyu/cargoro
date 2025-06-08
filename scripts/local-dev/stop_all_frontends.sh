#!/bin/bash
# CarGoro 프론트엔드 앱 일괄 종료 스크립트

# 스크립트 실행 디렉토리 설정
cd "$(dirname "$0")/../.."

echo "실행 중인 프론트엔드 앱을 종료합니다..."

# PID 파일로부터 프로세스 종료
if [ -d ".pids" ]; then
  for pid_file in .pids/frontend_*.pid; do
    if [ -f "$pid_file" ]; then
      pid=$(cat "$pid_file")
      app_name=$(basename "$pid_file" .pid | sed 's/frontend_//')
      if ps -p $pid > /dev/null; then
        echo "[$app_name] 앱 종료 중 (PID: $pid)..."
        kill $pid
        sleep 1
        # 프로세스가 아직 살아있다면 강제 종료
        if ps -p $pid > /dev/null; then
          echo "[$app_name] 앱 강제 종료 중..."
          kill -9 $pid
        fi
      else
        echo "[$app_name] 앱 프로세스가 이미 종료되었습니다 (PID: $pid)."
      fi
      rm "$pid_file"
    fi
  done
else
  echo "PID 디렉토리가 없습니다. 실행 중인 앱이 없는 것 같습니다."
fi

# 프로세스 이름으로 남아있는 노드 프로세스 확인 및 종료
frontend_procs=$(ps aux | grep -E "pnpm.*dev|pnpm.*start|expo start|next dev|node.*metro" | grep -v grep | awk '{print $2}')

if [ ! -z "$frontend_procs" ]; then
  echo "추가적인 프론트엔드 관련 프로세스를 종료합니다..."
  for proc in $frontend_procs; do
    echo "프로세스 종료 중 (PID: $proc)..."
    kill $proc 2>/dev/null || true
    sleep 0.5
    # 강제 종료 시도
    if ps -p $proc > /dev/null 2>&1; then
      echo "프로세스 강제 종료 중 (PID: $proc)..."
      kill -9 $proc 2>/dev/null || true
    fi
  done
fi

# Metro 번들러, Expo, Next.js 관련 프로세스 확인 및 종료
other_procs=$(ps aux | grep -E "node.*(metro|expo|next|react)" | grep -v grep | awk '{print $2}')

if [ ! -z "$other_procs" ]; then
  echo "남아있는 관련 프로세스를 종료합니다..."
  for proc in $other_procs; do
    echo "프로세스 종료 중 (PID: $proc)..."
    kill $proc 2>/dev/null || true
    sleep 0.5
    # 강제 종료 시도
    if ps -p $proc > /dev/null 2>&1; then
      echo "프로세스 강제 종료 중 (PID: $proc)..."
      kill -9 $proc 2>/dev/null || true
    fi
  done
fi

echo "모든 프론트엔드 앱이 종료되었습니다."

# 포트 확인 및 종료
echo "프론트엔드 앱 포트 확인 및 종료..."
for port in 3001 3002 3003 3004 3005 3006 3007 19001 19002; do
  pid=$(lsof -i:$port -t 2>/dev/null)
  if [ ! -z "$pid" ]; then
    echo "포트 $port에서 실행 중인 프로세스 종료 중 (PID: $pid)..."
    kill -9 $pid 2>/dev/null || true
  fi
done

# 남아있는 Expo 프로세스 정리
pkill -f "expo start" 2>/dev/null || true

echo "프론트엔드 앱 종료 완료!"
