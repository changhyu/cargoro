#!/bin/bash
yum update -y
yum install -y docker
systemctl start docker
systemctl enable docker

# CarGoro Worker 컨테이너 실행
docker run -d \
  --name cargoro-worker \
  --restart unless-stopped \
  -e ENVIRONMENT=${environment} \
  -e LOG_LEVEL=info \
  --log-driver=awslogs \
  --log-opt awslogs-group=/cargoro/worker-${environment} \
  --log-opt awslogs-region=ap-northeast-2 \
  cargoro/worker:latest

# Worker 서비스 시작 완료
echo "Worker 시작 완료"
