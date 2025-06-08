#!/bin/bash

echo "🔨 CarGoro 백엔드 빌드 시작..."

# Python 버전 확인
echo "Python 버전 확인:"
python --version

# 가상환경 생성
echo "가상환경 생성..."
python -m venv venv

# 가상환경 활성화
echo "가상환경 활성화..."
source venv/bin/activate

# pip 업그레이드
echo "pip 업그레이드..."
pip install --upgrade pip

# 의존성 설치
echo "의존성 설치..."
pip install -r requirements.txt

# 환경 변수 파일 생성
echo "환경 변수 설정..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo ".env 파일이 생성되었습니다. 필요한 값을 설정해주세요."
fi

# 데이터베이스 초기화
echo "데이터베이스 초기화..."
python -c "from lib.models import init_db; init_db()"

# 초기 사용자 생성
echo "초기 사용자 생성..."
python scripts/create_users.py

# 린팅
echo "코드 스타일 검사..."
flake8 lib/ --max-line-length=100 --exclude=__pycache__,venv

# 타입 체크
echo "타입 체크..."
mypy lib/ --ignore-missing-imports

# 테스트 실행
echo "테스트 실행..."
pytest tests/ -v

echo "✅ 백엔드 빌드 완료!"
