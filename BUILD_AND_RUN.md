# CarGoro 빌드 및 실행 가이드

## 🚀 빠른 시작

### 전체 시스템 실행

```bash
# 실행 권한 부여
chmod +x run.sh

# 통합 실행
./run.sh
```

이 명령은 백엔드와 프론트엔드를 모두 실행합니다:

- 백엔드: http://localhost:8004
- 프론트엔드: http://localhost:3006
- API 문서: http://localhost:8004/docs

## 📦 개별 빌드

### 백엔드 빌드

```bash
cd backend/services/rental-api

# 실행 권한 부여
chmod +x build.sh

# 빌드 실행
./build.sh

# 또는 수동으로:
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python scripts/create_users.py
python main.py
```

### 프론트엔드 빌드

```bash
cd apps/fleet-manager-web

# 실행 권한 부여
chmod +x build.sh

# 빌드 실행
./build.sh

# 또는 수동으로:
pnpm install
pnpm build
pnpm dev
```

## 🐛 일반적인 문제 해결

### 1. Python 버전 문제

```bash
# Python 3.9+ 필요
python --version

# pyenv 사용 시
pyenv install 3.9.18
pyenv local 3.9.18
```

### 2. PostgreSQL 연결 문제

```bash
# PostgreSQL 상태 확인
pg_ctl status

# 데이터베이스 생성
createdb cargoro_rental

# .env 파일 확인
DATABASE_URL=postgresql://postgres:password@localhost:5432/cargoro_rental
```

### 3. Node.js 버전 문제

```bash
# Node.js 18+ 필요
node --version

# nvm 사용 시
nvm install 18
nvm use 18
```

### 4. 의존성 설치 문제

백엔드:

```bash
# pip 업그레이드
pip install --upgrade pip

# 캐시 정리 후 재설치
pip cache purge
pip install -r requirements.txt
```

프론트엔드:

```bash
# pnpm 설치
npm install -g pnpm

# 캐시 정리 후 재설치
pnpm store prune
pnpm install
```

### 5. 포트 충돌

```bash
# 사용 중인 포트 확인
lsof -i :8004  # 백엔드
lsof -i :3006  # 프론트엔드

# 프로세스 종료
kill -9 <PID>
```

### 6. 타입 오류 (프론트엔드)

```bash
# TypeScript 캐시 정리
rm -rf .next
rm -rf node_modules/.cache
pnpm dev
```

### 7. 모듈 임포트 오류 (백엔드)

```bash
# PYTHONPATH 설정
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# 또는 main.py에서 직접 설정
import sys
sys.path.append('.')
```

## 🔍 로그 확인

### 백엔드 로그

```bash
# 애플리케이션 로그
tail -f logs/app.log

# 감사 로그
tail -f logs/audit/*.log

# 에러 로그
tail -f logs/errors/*.log
```

### 프론트엔드 로그

- 브라우저 개발자 도구 콘솔 확인
- Next.js 터미널 출력 확인

## 🧪 테스트 실행

### 백엔드 테스트

```bash
cd backend/services/rental-api
source venv/bin/activate
pytest tests/ -v
```

### 프론트엔드 테스트

```bash
cd apps/fleet-manager-web
pnpm test
```

## 📝 체크리스트

### 백엔드 시작 전

- [ ] Python 3.9+ 설치 확인
- [ ] PostgreSQL 실행 중
- [ ] 데이터베이스 생성됨
- [ ] .env 파일 설정
- [ ] Redis 실행 중 (선택사항)

### 프론트엔드 시작 전

- [ ] Node.js 18+ 설치 확인
- [ ] pnpm 설치됨
- [ ] .env.local 파일 설정
- [ ] 백엔드 API 실행 중

## 🚨 보안 주의사항

1. **프로덕션 환경에서는 반드시:**

   - SECRET_KEY 변경
   - DEBUG=False 설정
   - HTTPS 사용
   - 환경 변수 안전하게 관리

2. **초기 계정 변경:**
   ```
   admin@cargoro.com / admin1234
   manager@cargoro.com / manager1234
   user@cargoro.com / user1234
   ```
   이 계정들의 비밀번호를 즉시 변경하세요!

## 📞 도움말

문제가 지속되면:

1. 로그 파일 확인
2. 환경 변수 재확인
3. 의존성 버전 확인
4. GitHub Issues 확인
