# 백엔드 이미지
FROM python:3.9-slim

WORKDIR /app

# 시스템 패키지 설치
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 의존성 복사 및 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 환경 변수
ENV PYTHONUNBUFFERED=1
ENV ENVIRONMENT=production

# 포트 노출
EXPOSE 8004

# 실행 명령
CMD ["python", "main.py"]
