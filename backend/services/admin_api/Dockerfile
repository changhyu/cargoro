FROM python:3.9-slim

WORKDIR /app

# 의존성 설치를 위한 파일 복사
COPY requirements.txt .

# 의존성 설치
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 파일 복사
COPY . .

# Prisma 클라이언트 생성
RUN prisma generate

# 애플리케이션 포트 노출
EXPOSE 8001

# 애플리케이션 실행
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
