FROM python:3.11-slim

WORKDIR /app

# 시스템 패키지 설치
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 공유 모듈 복사
COPY backend/shared ./shared

# Prisma 스키마 복사 및 생성
COPY backend/database/prisma ./prisma
RUN prisma generate

# 앱 코드 복사
COPY backend/services/repair-api ./

# 환경변수
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app:$PYTHONPATH

# 포트 노출
EXPOSE 8002

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8002/health || exit 1

# 앱 실행
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]
