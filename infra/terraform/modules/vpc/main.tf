variable "vpc_cidr" {
  description = "VPC CIDR 블록"
  type        = string
}

variable "subnet_cidrs" {
  description = "서브넷 CIDR 블록 맵"
  type        = map(string)
}

variable "environment" {
  description = "배포 환경 (dev, staging, prod)"
  type        = string
}

variable "region" {
  description = "AWS 리전"
  type        = string
}

resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr
  
  tags = {
    Name        = "cargoro-vpc-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_subnet" "public" {
  count = 2
  
  vpc_id                  = aws_vpc.main.id
  cidr_block              = count.index == 0 ? var.subnet_cidrs["public1"] : var.subnet_cidrs["public2"]
  availability_zone       = "${var.region}${count.index == 0 ? "a" : "c"}"
  map_public_ip_on_launch = true
  
  tags = {
    Name        = "cargoro-public-subnet-${count.index + 1}-${var.environment}"
    Environment = var.environment
    Tier        = "public"
  }
}

resource "aws_subnet" "private" {
  count = 2
  
  vpc_id            = aws_vpc.main.id
  cidr_block        = count.index == 0 ? var.subnet_cidrs["private1"] : var.subnet_cidrs["private2"]
  availability_zone = "${var.region}${count.index == 0 ? "a" : "c"}"
  
  tags = {
    Name        = "cargoro-private-subnet-${count.index + 1}-${var.environment}"
    Environment = var.environment
    Tier        = "private"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name        = "cargoro-igw-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_eip" "nat" {
  domain = "vpc"
  
  tags = {
    Name        = "cargoro-nat-eip-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id
  
  tags = {
    Name        = "cargoro-nat-gateway-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  
  tags = {
    Name        = "cargoro-public-route-table-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }
  
  tags = {
    Name        = "cargoro-private-route-table-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "public" {
  count = 2
  
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count = 2
  
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}