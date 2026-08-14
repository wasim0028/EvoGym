terraform {
  backend "s3" {
    bucket         = "evogym-terraform-state"
    key            = "environments/staging/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "evogym-terraform-locks"
    encrypt        = true
  }
}
