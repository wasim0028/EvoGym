variable "cluster_name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "oidc_provider_arn" {
  description = "ARN of the cluster's IAM OIDC provider (for IRSA)"
  type        = string
}

variable "oidc_provider_url" {
  description = "OIDC issuer URL without the https:// prefix"
  type        = string
}

variable "chart_version" {
  description = "aws-load-balancer-controller Helm chart version"
  type        = string
  default     = "1.8.1"
}

variable "tags" {
  type    = map(string)
  default = {}
}
