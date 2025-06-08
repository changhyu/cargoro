variable "environment" {
  description = "배포 환경"
  type        = string
}

variable "db_subnet_ids" {
  description = "데이터베이스 서브넷 ID 목록"
  type        = list(string)
}

variable "db_security_group_id" {
  description = "PostgreSQL 보안 그룹 ID"
  type        = string
}

variable "db_password" {
  description = "데이터베이스 비밀번호"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS 인스턴스 클래스"
  type        = string
  default     = "db.t3.micro"
}

variable "db_multi_az" {
  description = "RDS Multi-AZ 배포 여부"
  type        = bool
  default     = true
}

variable "redis_security_group_id" {
  description = "Redis 보안 그룹 ID"
  type        = string
}

variable "redis_password" {
  description = "Redis 비밀번호"
  type        = string
  default     = "redis"
}
