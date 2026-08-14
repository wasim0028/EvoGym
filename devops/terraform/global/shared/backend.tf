# Remote state for the account-wide "shared" stack (ECR, GitHub OIDC, deployer IAM roles).
# Create the S3 bucket + DynamoDB lock table once, by hand or with a small
# bootstrap script (see devops/README.md), before running `terraform init` here.
terraform {
  backend "s3" {
    bucket         = "evogym-terraform-state"
    key            = "global/shared/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "evogym-terraform-locks"
    encrypt        = true
  }
}
