variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "github_org" {
  description = "GitHub organization or username that owns the repo"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name (without the org prefix)"
  type        = string
}

variable "env_branches" {
  description = "Map of environment name -> git branch that deploys to it, used to scope each environment's GitHub Actions IAM role trust policy"
  type        = map(string)
  default = {
    dev     = "develop"
    staging = "staging"
    prod    = "main"
  }
}
