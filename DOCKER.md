# Docker 이미지 빌드 및 실행

## Docker Compose로 전체 시스템 실행

```bash
# 빌드 및 실행
docker-compose up --build

# 백그라운드 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down

# 데이터 포함 완전 삭제
docker-compose down -v
```

## 개별 컨테이너 빌드

### 백엔드

```bash
cd backend/services/rental-api
docker build -t cargoro-backend .
docker run -p 8004:8004 --env-file .env cargoro-backend
```

### 프론트엔드

```bash
cd apps/fleet-manager-web
docker build -t cargoro-frontend .
docker run -p 3006:3000 -e NEXT_PUBLIC_API_URL=http://localhost:8004 cargoro-frontend
```

## 프로덕션 배포

### 1. 환경 변수 설정

`.env.production` 파일 생성:

```env
# 백엔드
DATABASE_URL=postgresql://user:pass@db-host:5432/cargoro_prod
SECRET_KEY=your-very-secure-production-key
ENVIRONMENT=production
REDIS_URL=redis://redis-host:6379

# 프론트엔드
NEXT_PUBLIC_API_URL=https://api.cargoro.com
```

### 2. Docker Compose 프로덕션

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    image: cargoro/backend:latest
    env_file: .env.production
    restart: unless-stopped

  frontend:
    image: cargoro/frontend:latest
    env_file: .env.production
    restart: unless-stopped
```

### 3. 실행

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 유용한 Docker 명령어

```bash
# 컨테이너 접속
docker exec -it cargoro-backend bash
docker exec -it cargoro-postgres psql -U postgres

# 로그 확인
docker logs cargoro-backend -f
docker logs cargoro-frontend -f

# 리소스 사용량 확인
docker stats

# 이미지 정리
docker system prune -a

# 볼륨 백업
docker run --rm -v cargoro_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```
