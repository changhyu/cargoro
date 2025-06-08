# DB 서브넷 그룹
resource "aws_db_subnet_group" "postgres" {
  name       = "cargoro-postgres-subnet-group-${var.environment}"
  subnet_ids = var.db_subnet_ids

  tags = {
    Name        = "cargoro-postgres-subnet-group-${var.environment}"
    Environment = var.environment
  }
}

# PostgreSQL RDS 인스턴스
resource "aws_db_instance" "postgres" {
  identifier              = "cargoro-postgres-${var.environment}"
  engine                  = "postgres"
  engine_version          = "14.15"
  instance_class          = var.db_instance_class
  allocated_storage       = 20
  max_allocated_storage   = 100
  storage_type            = "gp2"
  storage_encrypted       = true
  db_name                 = "cargoro"
  username                = "postgres"
  password                = var.db_password
  multi_az                = var.db_multi_az
  db_subnet_group_name    = aws_db_subnet_group.postgres.name
  vpc_security_group_ids  = [var.db_security_group_id]
  backup_retention_period = var.environment == "prod" ? 7 : 1
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"
  skip_final_snapshot     = var.environment == "prod" ? false : true
  final_snapshot_identifier = var.environment == "prod" ? "cargoro-postgres-final-${var.environment}" : null
  deletion_protection     = var.environment == "prod" ? true : false

  tags = {
    Name        = "cargoro-postgres-${var.environment}"
    Environment = var.environment
  }
}

# ElastiCache Redis 서브넷 그룹
resource "aws_elasticache_subnet_group" "redis" {
  name       = "cargoro-redis-subnet-group-${var.environment}"
  subnet_ids = var.db_subnet_ids

  tags = {
    Name        = "cargoro-redis-subnet-group-${var.environment}"
    Environment = var.environment
  }
}

# Redis ElastiCache 클러스터
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "cargoro-redis-${var.environment}"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  engine_version       = "7.1"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [var.redis_security_group_id]

  tags = {
    Name        = "cargoro-redis-${var.environment}"
    Environment = var.environment
  }
}

output "postgres_endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "postgres_db_name" {
  value = aws_db_instance.postgres.db_name
}

output "postgres_username" {
  value = aws_db_instance.postgres.username
}

output "redis_endpoint" {
  value = aws_elasticache_cluster.redis.cache_nodes.0.address
}

output "redis_port" {
  value = aws_elasticache_cluster.redis.cache_nodes.0.port
}
