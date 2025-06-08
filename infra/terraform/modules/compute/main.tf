variable "environment" {
  description = "배포 환경 (dev, staging, prod)"
  type        = string
}

variable "api_gateway_sg_id" {
  description = "API Gateway 보안 그룹 ID"
  type        = string
}

variable "worker_sg_id" {
  description = "Worker 보안 그룹 ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "퍼블릭 서브넷 ID 목록"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "프라이빗 서브넷 ID 목록"
  type        = list(string)
}

variable "rabbitmq_sg_id" {
  description = "RabbitMQ 보안 그룹 ID"
  type        = string
}

variable "ami_id" {
  description = "AMI ID"
  type        = string
}

variable "instance_type" {
  description = "인스턴스 타입"
  type        = string
}

variable "api_gateway_security_group_id" {
  description = "API Gateway 보안 그룹 ID"
  type        = string
}

variable "worker_security_group_id" {
  description = "Worker 보안 그룹 ID"
  type        = string
}

variable "environment_name" {
  description = "환경 이름"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

# API Gateway Launch Template (Launch Configuration 대신 사용)
resource "aws_launch_template" "api_gateway" {
  name_prefix   = "${var.environment_name}-api-gateway-"
  image_id      = var.ami_id
  instance_type = var.instance_type

  vpc_security_group_ids = [var.api_gateway_security_group_id]

  user_data = base64encode(templatefile("${path.module}/user_data/api_gateway.sh", {
    environment = var.environment
  }))

  monitoring {
    enabled = true
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "${var.environment_name}-api-gateway"
      Environment = var.environment
    }
  }
}

# API Gateway Auto Scaling Group
resource "aws_autoscaling_group" "api_gateway" {
  name                = "${var.environment_name}-api-gateway-asg"
  vpc_zone_identifier = var.private_subnet_ids
  target_group_arns   = [aws_lb_target_group.api_gateway.arn]
  health_check_type   = "ELB"
  health_check_grace_period = 300

  min_size         = 2
  max_size         = 4
  desired_capacity = 2

  launch_template {
    id      = aws_launch_template.api_gateway.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "${var.environment_name}-api-gateway"
    propagate_at_launch = true
  }

  tag {
    key                 = "Environment"
    value               = var.environment
    propagate_at_launch = true
  }
}

# Worker Launch Template (Launch Configuration 대신 사용)
resource "aws_launch_template" "worker" {
  name_prefix   = "${var.environment_name}-worker-"
  image_id      = var.ami_id
  instance_type = var.instance_type

  vpc_security_group_ids = [var.worker_security_group_id]

  user_data = base64encode(templatefile("${path.module}/user_data/worker.sh", {
    environment = var.environment
  }))

  monitoring {
    enabled = true
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "${var.environment_name}-worker"
      Environment = var.environment
    }
  }
}

# Worker Auto Scaling Group
resource "aws_autoscaling_group" "worker" {
  name                = "${var.environment_name}-worker-asg"
  vpc_zone_identifier = var.private_subnet_ids
  health_check_type   = "EC2"
  health_check_grace_period = 300

  min_size         = 2
  max_size         = 4
  desired_capacity = 2

  launch_template {
    id      = aws_launch_template.worker.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "${var.environment_name}-worker"
    propagate_at_launch = true
  }

  tag {
    key                 = "Environment"
    value               = var.environment
    propagate_at_launch = true
  }
}

# API Gateway Load Balancer
resource "aws_lb" "api_gateway" {
  name               = "cargoro-api-gateway-lb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.api_gateway_sg_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = var.environment == "prod" ? true : false

  tags = {
    Name        = "cargoro-api-gateway-lb-${var.environment}"
    Environment = var.environment
  }
}

# Load Balancer Target Group (VPC ID 수정)
resource "aws_lb_target_group" "api_gateway" {
  name     = "${var.environment_name}-api-gateway-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id  # 서브넷 ID 대신 VPC ID 사용

  health_check {
    enabled             = true
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = {
    Name        = "${var.environment_name}-api-gateway-tg"
    Environment = var.environment
  }
}

resource "aws_lb_listener" "api_gateway" {
  load_balancer_arn = aws_lb.api_gateway.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api_gateway.arn
  }
}

# CloudWatch 로그 그룹
resource "aws_cloudwatch_log_group" "api_gateway" {
  name = "/cargoro/api-gateway-${var.environment}"

  retention_in_days = var.environment == "prod" ? 30 : 7

  tags = {
    Name        = "cargoro-api-gateway-logs-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "worker" {
  name = "/cargoro/worker-${var.environment}"

  retention_in_days = var.environment == "prod" ? 30 : 7

  tags = {
    Name        = "cargoro-worker-logs-${var.environment}"
    Environment = var.environment
  }
}

output "api_gateway_lb_dns" {
  value = aws_lb.api_gateway.dns_name
}

output "api_gateway_target_group_arn" {
  value = aws_lb_target_group.api_gateway.arn
}

output "api_gateway_log_group_name" {
  value = aws_cloudwatch_log_group.api_gateway.name
}

output "worker_log_group_name" {
  value = aws_cloudwatch_log_group.worker.name
}
