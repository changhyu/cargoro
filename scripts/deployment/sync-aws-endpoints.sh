#!/bin/bash

# CarGoro 환경 설정 동기화 스크립트
# 이 스크립트는 AWS 인프라에서 최신 Redis/Database 엔드포인트를 가져와서
# 모든 앱의 환경 설정 파일을 업데이트합니다.

set -e

echo "🚀 CarGoro 환경 설정 동기화를 시작합니다..."

# Terraform 디렉토리로 이동
TERRAFORM_DIR="./infra/terraform"
MONOREPO_ROOT=$(pwd)

if [ ! -d "$TERRAFORM_DIR" ]; then
    echo "❌ Terraform 디렉토리를 찾을 수 없습니다: $TERRAFORM_DIR"
    exit 1
fi

cd "$TERRAFORM_DIR"

# PROD 환경 정보 가져오기
echo "📋 PROD 환경 정보를 가져오는 중..."
terraform workspace select default > /dev/null 2>&1 || true

PROD_REDIS_HOST=$(terraform output -raw redis_endpoint 2>/dev/null || echo "localhost")
PROD_POSTGRES_HOST=$(terraform output -raw postgres_endpoint 2>/dev/null | sed 's/:5432//' || echo "localhost")
PROD_LB_DNS=$(terraform output -raw api_gateway_load_balancer_dns 2>/dev/null || echo "localhost:4000")

echo "✅ PROD Redis: $PROD_REDIS_HOST"
echo "✅ PROD PostgreSQL: $PROD_POSTGRES_HOST"
echo "✅ PROD Load Balancer: $PROD_LB_DNS"

# STAGING 환경 정보 가져오기
echo "📋 STAGING 환경 정보를 가져오는 중..."
terraform workspace select staging > /dev/null 2>&1 || true

STAGING_REDIS_HOST=$(terraform output -raw redis_endpoint 2>/dev/null || echo "localhost")
STAGING_POSTGRES_HOST=$(terraform output -raw postgres_endpoint 2>/dev/null | sed 's/:5432//' || echo "localhost")
STAGING_LB_DNS=$(terraform output -raw api_gateway_load_balancer_dns 2>/dev/null || echo "localhost:4000")

echo "✅ STAGING Redis: $STAGING_REDIS_HOST"
echo "✅ STAGING PostgreSQL: $STAGING_POSTGRES_HOST"
echo "✅ STAGING Load Balancer: $STAGING_LB_DNS"

# 원래 디렉토리로 돌아가기
cd "$MONOREPO_ROOT"

# 환경 변수 업데이트 함수 (macOS sed 호환)
update_env_file() {
    local file_path="$1"
    local file_type="$2"  # "backend" 또는 "frontend" 또는 "mobile"

    if [ ! -f "$file_path" ]; then
        echo "⚠️  파일이 존재하지 않습니다: $file_path"
        return
    fi

    echo "🔄 업데이트 중: $file_path"

    # 백업 파일 생성
    cp "$file_path" "$file_path.backup"

    # macOS sed 사용하여 환경 변수 업데이트
    sed -i '' "s|PROD_REDIS_HOST=.*|PROD_REDIS_HOST=$PROD_REDIS_HOST|g" "$file_path"
    sed -i '' "s|STAGING_REDIS_HOST=.*|STAGING_REDIS_HOST=$STAGING_REDIS_HOST|g" "$file_path"
    sed -i '' "s|POSTGRES_PROD_HOST=.*|POSTGRES_PROD_HOST=$PROD_POSTGRES_HOST|g" "$file_path"
    sed -i '' "s|POSTGRES_STAGING_HOST=.*|POSTGRES_STAGING_HOST=$STAGING_POSTGRES_HOST|g" "$file_path"

    # 백업 파일 삭제
    rm "$file_path.backup"

    echo "  ✅ 완료: $file_path"
}

# 백엔드 환경 설정 업데이트
echo ""
echo "🔧 백엔드 환경 설정을 업데이트하는 중..."
update_env_file "backend/.env" "backend"
update_env_file "backend/.env.production" "backend"
update_env_file "backend/.env.staging" "backend"

# 프론트엔드 앱 환경 설정 업데이트
echo ""
echo "🌐 프론트엔드 앱 환경 설정을 업데이트하는 중..."
update_env_file "apps/workshop-web/.env.local" "frontend"
update_env_file "apps/fleet-manager-web/.env.local" "frontend"
update_env_file "apps/parts-web/.env.local" "frontend"
update_env_file "apps/superadmin-web/.env.local" "frontend"

# 모바일 앱 환경 설정 업데이트
echo ""
echo "📱 모바일 앱 환경 설정을 업데이트하는 중..."
update_env_file "apps/delivery-driver/.env" "mobile"
update_env_file "apps/smart-car-assistant/.env" "mobile"
update_env_file "apps/workshop-mobile/.env" "mobile"

echo ""
echo "🎉 환경 설정 동기화가 완료되었습니다!"
echo ""
echo "📊 업데이트된 정보:"
echo "   🔴 PROD Redis: $PROD_REDIS_HOST"
echo "   🟡 STAGING Redis: $STAGING_REDIS_HOST"
echo "   🔴 PROD PostgreSQL: $PROD_POSTGRES_HOST"
echo "   🟡 STAGING PostgreSQL: $STAGING_POSTGRES_HOST"
echo ""
echo "💡 변경사항을 적용하려면 개발 서버를 재시작하세요."
