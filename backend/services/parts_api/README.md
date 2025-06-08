# Parts API

부품 관리 및 재고 시스템을 위한 API 서비스입니다.

## 기능

- 부품 정보 관리 (등록, 조회, 수정, 삭제)
- 공급업체 관리
- 부품 재고 관리
- 부품 주문 관리
- 부품 카탈로그

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

2. 필요한 패키지 설치:

```bash
pip install -r requirements.txt
```

3. Prisma 클라이언트 생성:

```bash
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
uvicorn main:app --host 0.0.0.0 --port 8003
```

또는 내장된 실행 방법 사용:

```bash
python main.py
```

## API 문서

서버 실행 후 브라우저에서 다음 URL에 접속하여 API 문서를 확인할 수 있습니다:

- Swagger UI: http://localhost:8003/docs
- ReDoc: http://localhost:8003/redoc

## 디렉토리 구조

```
parts-api/
├── lib/                    # 코어 라이브러리 코드
│   ├── models/             # 데이터 모델 정의
│   ├── routes/             # API 라우트 정의
│   ├── services/           # 비즈니스 로직
│   ├── utils/              # 유틸리티 함수
│   └── server.py           # FastAPI 서버 설정
├── tests/                  # 테스트 코드
│   ├── unit/               # 단위 테스트
│   └── integration/        # 통합 테스트
├── main.py                 # 애플리케이션 진입점
└── requirements.txt        # 패키지 의존성
```

## 개발 참고사항

### Prisma 클라이언트 설정

이 서비스는 공유 Prisma 클라이언트를 사용합니다.
스키마 파일은 `backend/database/prisma/schema.prisma`에 위치합니다.

스키마 변경 후에는 반드시 클라이언트를 다시 생성해야 합니다:

```bash
python -m prisma generate --schema=/path/to/schema.prisma
```

### 표준 응답 포맷

모든 API 응답은 다음과 같은 표준 포맷을 따릅니다:

```json
{
  "success": true,
  "data": {
    /* 실제 데이터 */
  },
  "error": null
}
```

오류 응답:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "오류 메시지",
    "details": {
      /* 상세 오류 정보 */
    }
  }
}
```
