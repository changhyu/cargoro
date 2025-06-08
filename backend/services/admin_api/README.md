# Admin API

시스템 관리를 위한 Admin API 서비스입니다.

## 기능

- 시스템 감사 로그 관리
- 사용자 활동 모니터링
- 시스템 상태 대시보드

## 개발 환경 설정

### 필수 요구사항

- Python 3.9 이상
- 가상환경 (.venv)
- PostgreSQL 데이터베이스

### 설치 및 설정

1. 가상환경 활성화:

```bash
source ../../../.venv/bin/activate
```

2. 자동 설정 스크립트 실행:

```bash
./setup.sh
```

또는 수동으로 설정:

```bash
# 필요한 패키지 설치
pip install -r requirements.txt

# Prisma 클라이언트 생성
cd ../../../backend/database/prisma
python -m prisma generate --schema=schema.prisma
```

## 실행 방법

개발 모드로 실행:

```bash
uvicorn main:app --reload
```

프로덕션 모드로 실행:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API 문서

서버 실행 후 브라우저에서 다음 URL에 접속하여 API 문서를 확인할 수 있습니다:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 개발 참고사항

### Prisma 클라이언트 설정

이 서비스는 `prisma.py` 모듈을 통해 Python용 Prisma 클라이언트를 관리합니다.
스키마 파일은 `backend/database/prisma/schema.prisma`에 위치합니다.

스키마 변경 후에는 반드시 클라이언트를 다시 생성해야 합니다:

```bash
python -m prisma generate --schema=/path/to/schema.prisma
```

### 디버깅

로그는 기본적으로 콘솔에 출력되며, 필요한 경우 `logging` 설정을 변경하여 파일에 저장할 수 있습니다.
