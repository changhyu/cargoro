# cargoro-platform Helm Chart

이 Helm Chart는 Cargoro 모노레포 플랫폼의 주요 서비스(api-gateway, worker, postgres, redis, rabbitmq)를 배포합니다.

## 설치 방법

```bash
# Helm chart 설치
helm install cargoro ./

# 기존 차트 업그레이드
helm upgrade --install cargoro ./
```

## 커스텀 값 예시

`values.yaml`에서 환경변수, 이미지, replica 수 등을 조정할 수 있습니다.

```yaml
apiGateway:
  image: cargoro/api-gateway:latest # 프로덕션 환경
  # image: node:18-alpine  # 개발 환경(이미지 풀 문제 해결)
  replicaCount: 2
  env:
    DATABASE_URL: 'postgresql://postgres:postgres@postgres:5432/cargoro'
    REDIS_URL: 'redis://redis:6379/0'

worker:
  image: cargoro/worker:latest # 프로덕션 환경
  # image: node:18-alpine  # 개발 환경(이미지 풀 문제 해결)
  replicaCount: 1
  env:
    DATABASE_URL: 'postgresql://postgres:postgres@postgres:5432/cargoro'
    REDIS_URL: 'redis://redis:6379/0'
    RABBITMQ_URL: 'amqp://guest:guest@rabbitmq:5672/'

postgres:
  image: postgres:15
  persistence: true
  storage: 5Gi
  user: postgres
  password: postgres
  db: cargoro

redis:
  image: redis:7-alpine
  password: redis

rabbitmq:
  image: rabbitmq:3-management
  user: guest
  password: guest
```

## 템플릿 목록

- templates/api-gateway-deployment.yaml
- templates/worker-deployment.yaml
- templates/postgres-deployment.yaml
- templates/redis-deployment.yaml
- templates/rabbitmq-deployment.yaml

## 알려진 문제 및 해결 방법

### 이미지 풀 실패 문제

개발 환경에서 다음과 같은 오류가 발생할 수 있습니다:

```
Failed to pull image "cargoro/api-gateway:latest": Error response from daemon:
pull access denied for cargoro/api-gateway, repository does not exist or may require 'docker login'
```

**해결 방법:**

1. **공개 이미지 사용**: 개발/테스트 환경에서는 `values.yaml` 파일에서 이미지를 공개적으로 접근 가능한 이미지로 변경:

   ```yaml
   apiGateway:
     image: node:18-alpine

   worker:
     image: node:18-alpine
   ```

2. **코드 실행 방식 변경**: 템플릿 파일에서 필요한 경우 컨테이너 실행 방식을 수정:
   - API 게이트웨이: Express 대신 내장 http 모듈 사용
   - 워커: 개발 환경에서 RabbitMQ 연결 실패 시 정상 작동하도록 설정

### 포트 충돌 문제

배포에서 API 게이트웨이나 다른 서비스가 포트 충돌로 인해 실패할 수 있습니다.

**해결 방법:**

1. 서비스 템플릿에서 포트 설정 확인
2. 기존에 실행 중인 서비스가 있다면 확인:

   ```bash
   kubectl get svc
   ```

3. 포트 충돌이 발생하는 경우, 해당 서비스 제거 후 다시 시도:
   ```bash
   kubectl delete deployment api-gateway
   helm upgrade --install cargoro ./
   ```

## 로컬 개발 환경 설정

로컬 환경에서 Kubernetes 배포를 테스트하려면:

1. Minikube 또는 Docker Desktop Kubernetes 활성화
2. 모든 서비스의 로컬 이미지 빌드:

   ```bash
   # API 게이트웨이 이미지 빌드
   docker build -t localhost:5000/cargoro/api-gateway:dev ./backend/gateway

   # 워커 이미지 빌드
   docker build -t localhost:5000/cargoro/worker:dev ./backend/jobs
   ```

3. values.yaml 파일 업데이트:

   ```yaml
   apiGateway:
     image: localhost:5000/cargoro/api-gateway:dev

   worker:
     image: localhost:5000/cargoro/worker:dev
   ```

4. 배포 실행:
   ```bash
   helm install cargoro ./
   ```

---

자세한 내용은 공식 Helm 문서와 values.yaml을 참고하세요.
