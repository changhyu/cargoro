#!/bin/bash
# CarGoro 백엔드 서비스 일괄 종료 스크립트

echo "실행 중인 백엔드 서비스를 종료합니다..."

# 프로세스 ID 파일 확인
if [ -d ".pids" ]; then
  for pid_file in .pids/*.pid; do
    if [ -f "$pid_file" ]; then
      pid=$(cat "$pid_file")
      service_name=$(basename "$pid_file" .pid)
      if ps -p $pid > /dev/null; then
        echo "[$service_name] 서비스 종료 중 (PID: $pid)..."
        kill $pid
      else
        echo "[$service_name] 서비스는 이미 종료되었습니다."
      fi
      rm "$pid_file"
    fi
  done
else
  echo "실행 중인 서비스가 없습니다."
fi

echo "모든 서비스가 종료되었습니다."
