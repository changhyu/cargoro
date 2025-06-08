provider "aws" {
  region = var.aws_region
  # 자격 증명은 환경 변수나 AWS CLI 프로필에서 불러오도록 수정
  # 환경 변수: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
  # 또는 profile 설정으로 관리
  profile = var.aws_profile
}