variable "aws_region" {
  description = "AWS 리전"
  type        = string
  default     = "ap-northeast-2"
}

variable "ami_id" {
  description = "EC2 AMI ID"
  type        = string
  default     = "ami-086cae3329a3f7d75"  # ap-northeast-2 리전의 Amazon Linux 2023 AMI
}

variable "aws_profile" {
  description = "AWS CLI 프로필 이름"
  type        = string
  default     = "default"
}

variable "environment" {
  description = "배포 환경 (dev, staging, prod)"
  type        = string
  default     = "dev"
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

variable "vpc_cidr" {
  description = "VPC CIDR 블록"
  type        = string
  default     = "10.0.0.0/16"
}

variable "subnet_cidrs" {
  description = "서브넷 CIDR 블록 맵"
  type        = map(string)
  default = {
    public1  = "10.0.1.0/24"
    public2  = "10.0.2.0/24"
    private1 = "10.0.3.0/24"
    private2 = "10.0.4.0/24"
  }
}
