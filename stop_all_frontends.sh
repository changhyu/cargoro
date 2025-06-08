#!/bin/bash

# 모든 프론트엔드 앱을 중지하는 스크립트
echo "🛑 모든 프론트엔드 앱 중지하기"

# PID 파일이 있는지 확인
if [ -f .frontend_pids ]; then
    # PID 파일에서 프로세스 ID 읽기
    PIDS=$(cat .frontend_pids)

    # 각 프로세스 종료
    for PID in $PIDS; do
        if ps -p $PID > /dev/null; then
            echo "프로세스 종료 중: $PID"
            kill $PID
        fi
    done

    # PID 파일 삭제
    rm .frontend_pids
    echo "✅ 모든 프론트엔드 앱이 중지되었습니다."
else
    echo "⚠️ 실행 중인 프론트엔드 앱을 찾을 수 없습니다."
fi

# 포트 확인 및 추가 정리
echo "📊 포트 확인 중..."
PORTS=(3000 3001 3002 3003 19001 19002 19003 19004 19005)
for PORT in "${PORTS[@]}"; do
    PID=$(lsof -ti:$PORT)
    if [ ! -z "$PID" ]; then
        echo "포트 $PORT를 사용 중인 프로세스 종료: $PID"
        kill -9 $PID
    fi
done

echo "🧹 임시 파일 정리 중..."
find . -name ".expo" -type d -exec rm -rf {} \; 2>/dev/null || true
find . -name "node_modules/.cache" -type d -exec rm -rf {} \; 2>/dev/null || true

echo "🎉 정리 완료!"
