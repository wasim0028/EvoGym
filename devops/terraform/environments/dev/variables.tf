variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "vpc_cidr" {
  type = string
}

variable "azs" {
  type = list(string)
}

variable "public_subnet_cidrs" {
  type = list(string)
}

variable "private_subnet_cidrs" {
  type = list(string)
}

variable "single_nat_gateway" {
  type    = bool
  default = true
}

variable "kubernetes_version" {
  type    = string
  default = "1.30"
}

variable "argocd_hostname" {
  description = "Hostname to expose ArgoCD's UI on via ALB (leave null to skip and use port-forward instead)"
  type        = string
  default     = null
}

variable "rds_instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "rds_multi_az" {
  type    = bool
  default = false
}

variable "rds_deletion_protection" {
  type    = bool
  default = false
}

variable "razorpay_key_id" {
  description = "Passed via -var or TF_VAR_razorpay_key_id (from a CI secret) — never committed to tfvars"
  type        = string
  sensitive   = true
}

variable "razorpay_key_secret" {
  description = "Passed via -var or TF_VAR_razorpay_key_secret (from a CI secret) — never committed to tfvars"
  type        = string
  sensitive   = true
}
