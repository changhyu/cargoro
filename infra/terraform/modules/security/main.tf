variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "environment" {
  description = "배포 환경 (dev, staging, prod)"
  type        = string
}

# API Gateway 보안 그룹
resource "aws_security_group" "api_gateway" {
  name        = "cargoro-api-gateway-sg-${var.environment}"
  description = "Security group for API Gateway service"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTP access"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTPS access"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "cargoro-api-gateway-sg-${var.environment}"
    Environment = var.environment
  }
}

# Worker 보안 그룹
resource "aws_security_group" "worker" {
  name        = "cargoro-worker-sg-${var.environment}"
  description = "Security group for Worker service"
  vpc_id      = var.vpc_id

  # Worker는 인바운드 연결이 필요 없지만, 내부 통신을 위한 포트 허용
  ingress {
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.api_gateway.id]
    description     = "Allow access from API Gateway"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "cargoro-worker-sg-${var.environment}"
    Environment = var.environment
  }
}

# PostgreSQL 보안 그룹
resource "aws_security_group" "postgres" {
  name        = "cargoro-postgres-sg-${var.environment}"
  description = "Security group for PostgreSQL database"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.api_gateway.id, aws_security_group.worker.id]
    description     = "Allow PostgreSQL access from API Gateway and Worker"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "cargoro-postgres-sg-${var.environment}"
    Environment = var.environment
  }
}

# Redis 보안 그룹
resource "aws_security_group" "redis" {
  name        = "cargoro-redis-sg-${var.environment}"
  description = "Security group for Redis"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.api_gateway.id, aws_security_group.worker.id]
    description     = "Allow Redis access from API Gateway and Worker"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "cargoro-redis-sg-${var.environment}"
    Environment = var.environment
  }
}

# RabbitMQ 보안 그룹
resource "aws_security_group" "rabbitmq" {
  name        = "cargoro-rabbitmq-sg-${var.environment}"
  description = "Security group for RabbitMQ"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5672
    to_port         = 5672
    protocol        = "tcp"
    security_groups = [aws_security_group.api_gateway.id, aws_security_group.worker.id]
    description     = "Allow RabbitMQ AMQP access from API Gateway and Worker"
  }

  ingress {
    from_port       = 15672
    to_port         = 15672
    protocol        = "tcp"
    security_groups = [aws_security_group.api_gateway.id]
    description     = "Allow RabbitMQ Management access from API Gateway"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "cargoro-rabbitmq-sg-${var.environment}"
    Environment = var.environment
  }
}

output "api_gateway_sg_id" {
  value = aws_security_group.api_gateway.id
}

output "worker_sg_id" {
  value = aws_security_group.worker.id
}

output "postgres_sg_id" {
  value = aws_security_group.postgres.id
}

output "redis_sg_id" {
  value = aws_security_group.redis.id
}

output "rabbitmq_sg_id" {
  value = aws_security_group.rabbitmq.id
}
