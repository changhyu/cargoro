#!/bin/bash
yum update -y
yum install -y docker
systemctl start docker
systemctl enable docker

# CarGoro API Gateway 컨테이너 실행
docker run -d \
  --name cargoro-api-gateway \
  --restart unless-stopped \
  -p 80:8000 \
  -e ENVIRONMENT=${environment} \
  -e LOG_LEVEL=info \
  --log-driver=awslogs \
  --log-opt awslogs-group=/cargoro/api-gateway-${environment} \
  --log-opt awslogs-region=ap-northeast-2 \
  cargoro/api-gateway:latest

# 헬스체크 엔드포인트 설정
echo "API Gateway 시작 완료"
