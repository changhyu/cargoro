terraform {
  required_version = ">= 1.3.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }

  # 원격 상태 관리 구성 - 이제 백엔드 리소스가 생성되었으므로 활성화
  backend "s3" {
    bucket         = "cargoro-terraform-state"
    key            = "terraform.tfstate"
    region         = "ap-northeast-2"
    dynamodb_table = "cargoro-terraform-locks"
    encrypt        = true
  }
}

# VPC 모듈
module "vpc" {
  source = "./modules/vpc"

  vpc_cidr     = var.vpc_cidr
  subnet_cidrs = var.subnet_cidrs
  environment  = var.environment
  region       = var.aws_region
}

# 보안 그룹 모듈
module "security" {
  source = "./modules/security"

  vpc_id      = module.vpc.vpc_id
  environment = var.environment
}

# 데이터베이스 모듈
module "database" {
  source = "./modules/database"

  environment             = var.environment
  db_subnet_ids          = module.vpc.private_subnet_ids
  db_security_group_id   = module.security.postgres_sg_id
  db_password            = var.db_password
  db_instance_class      = var.db_instance_class
  db_multi_az            = var.db_multi_az
  redis_security_group_id = module.security.redis_sg_id
  redis_password         = "redis"  # 실제 환경에서는 var.redis_password와 같이 변수로 관리
}

# 컴퓨팅 모듈
module "compute" {
  source = "./modules/compute"

  environment                   = var.environment
  environment_name             = "cargoro-${var.environment}"
  vpc_id                       = module.vpc.vpc_id
  api_gateway_sg_id           = module.security.api_gateway_sg_id
  api_gateway_security_group_id = module.security.api_gateway_sg_id
  worker_sg_id                = module.security.worker_sg_id
  worker_security_group_id    = module.security.worker_sg_id
  rabbitmq_sg_id              = module.security.rabbitmq_sg_id
  public_subnet_ids           = module.vpc.public_subnet_ids
  private_subnet_ids          = module.vpc.private_subnet_ids
  ami_id                      = "ami-086cae3329a3f7d75"  # Amazon Linux 2023 AMI
  instance_type               = "t3.micro"
}

# S3 버킷
resource "aws_s3_bucket" "app_bucket" {
  bucket = "cargoro-app-bucket-${var.environment}"
  force_destroy = var.environment != "prod"

  tags = {
    Name        = "cargoro-app-bucket-${var.environment}"
    Environment = var.environment
  }
}

# S3 버킷 암호화 설정
resource "aws_s3_bucket_server_side_encryption_configuration" "app_bucket" {
  bucket = aws_s3_bucket.app_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Terraform 상태 관리용 S3 버킷 (첫 실행 시에는 이 부분을 주석 처리하고, 수동으로 버킷 생성 후 주석 해제)
resource "aws_s3_bucket" "terraform_state" {
  bucket = "cargoro-terraform-state"

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name = "Terraform State Bucket"
  }
}

# 상태 파일 버전 관리
resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

# 상태 파일 암호화
resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# 상태 파일 잠금을 위한 DynamoDB 테이블
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "cargoro-terraform-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name = "Terraform State Lock Table"
  }
}

# 출력 값들
output "postgres_endpoint" {
  description = "PostgreSQL RDS 엔드포인트"
  value       = module.database.postgres_endpoint
  sensitive   = false
}

output "redis_endpoint" {
  description = "Redis ElastiCache 엔드포인트"
  value       = module.database.redis_endpoint
  sensitive   = false
}

output "api_gateway_load_balancer_dns" {
  description = "API Gateway Load Balancer DNS 이름"
  value       = module.compute.api_gateway_lb_dns
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "퍼블릭 서브넷 ID 목록"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "프라이빗 서브넷 ID 목록"
  value       = module.vpc.private_subnet_ids
}

output "s3_app_bucket_name" {
  description = "애플리케이션 S3 버킷 이름"
  value       = aws_s3_bucket.app_bucket.bucket
}

output "environment" {
  description = "배포 환경"
  value       = var.environment
}
