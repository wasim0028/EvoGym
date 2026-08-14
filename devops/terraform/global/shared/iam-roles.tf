data "aws_caller_identity" "current" {}

# --- App CI role: build & push Docker images to ECR --------------------
# Scoped to the branch that deploys to each environment, e.g. only workflow
# runs on `refs/heads/main` can assume the prod role.

resource "aws_iam_role" "app_deployer" {
  for_each = var.env_branches

  name = "evogym-${each.key}-app-deployer"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:${var.github_org}/${var.github_repo}:ref:refs/heads/${each.value}"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "app_deployer_ecr" {
  for_each = var.env_branches

  name = "ecr-push"
  role = aws_iam_role.app_deployer[each.key].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ECRAuth"
        Effect   = "Allow"
        Action   = ["ecr:GetAuthorizationToken"]
        Resource = "*"
      },
      {
        Sid    = "ECRPush"
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:DescribeRepositories",
          "ecr:DescribeImageScanFindings",
        ]
        Resource = [
          aws_ecr_repository.backend.arn,
          aws_ecr_repository.frontend.arn,
        ]
      }
    ]
  })
}

# --- Terraform CI role: provision VPC / EKS / RDS for one environment ---
# Broad by necessity (infra provisioning touches many services); scope this
# further to your org's security requirements before using in production.

resource "aws_iam_role" "terraform_deployer" {
  for_each = var.env_branches

  name = "evogym-${each.key}-terraform-deployer"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:${var.github_org}/${var.github_repo}:ref:refs/heads/${each.value}"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "terraform_deployer_infra" {
  for_each = var.env_branches

  name = "infra-provisioning"
  role = aws_iam_role.terraform_deployer[each.key].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "TerraformState"
        Effect = "Allow"
        Action = ["s3:GetObject", "s3:PutObject", "s3:ListBucket"]
        Resource = [
          "arn:aws:s3:::evogym-terraform-state",
          "arn:aws:s3:::evogym-terraform-state/*",
        ]
      },
      {
        Sid      = "TerraformLock"
        Effect   = "Allow"
        Action   = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem"]
        Resource = "arn:aws:dynamodb:${var.aws_region}:${data.aws_caller_identity.current.account_id}:table/evogym-terraform-locks"
      },
      {
        Sid    = "Provisioning"
        Effect = "Allow"
        Action = [
          "ec2:*",
          "eks:*",
          "rds:*",
          "elasticloadbalancing:*",
          "autoscaling:*",
          "logs:*",
          "iam:GetRole",
          "iam:GetRolePolicy",
          "iam:CreateRole",
          "iam:DeleteRole",
          "iam:TagRole",
          "iam:PutRolePolicy",
          "iam:DeleteRolePolicy",
          "iam:AttachRolePolicy",
          "iam:DetachRolePolicy",
          "iam:PassRole",
          "iam:CreateOpenIDConnectProvider",
          "iam:GetOpenIDConnectProvider",
          "iam:ListOpenIDConnectProviders",
          "kms:*",
        ]
        Resource = "*"
      }
    ]
  })
}

output "app_deployer_role_arns" {
  value = { for env, role in aws_iam_role.app_deployer : env => role.arn }
}

output "terraform_deployer_role_arns" {
  value = { for env, role in aws_iam_role.terraform_deployer : env => role.arn }
}
