variable "name" {
  description = "Name prefix for all VPC resources, e.g. evogym-dev"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "azs" {
  description = "Availability zones to spread subnets across"
  type        = list(string)
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (one per AZ)"
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (one per AZ) — EKS Fargate pods and RDS live here"
  type        = list(string)
}

variable "single_nat_gateway" {
  description = "Use a single shared NAT Gateway instead of one per AZ (cheaper, less resilient — fine for dev/staging)"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Common tags applied to all resources"
  type        = map(string)
  default     = {}
}
