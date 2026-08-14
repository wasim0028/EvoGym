variable "name" {
  description = "Name prefix, e.g. evogym-dev"
  type        = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "allowed_security_group_ids" {
  description = "Security groups allowed to connect on port 5432 (the EKS cluster security group)"
  type        = list(string)
}

variable "engine_version" {
  type    = string
  default = "16.3"
}

variable "instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "allocated_storage" {
  type    = number
  default = 20
}

variable "max_allocated_storage" {
  description = "Upper bound for RDS storage autoscaling"
  type        = number
  default     = 100
}

variable "db_name" {
  type    = string
  default = "gymdb"
}

variable "master_username" {
  type    = string
  default = "gymadmin"
}

variable "multi_az" {
  description = "Run a synchronous standby in a second AZ (recommended for prod)"
  type        = bool
  default     = false
}

variable "backup_retention_period" {
  type    = number
  default = 7
}

variable "deletion_protection" {
  type    = bool
  default = false
}

variable "tags" {
  type    = map(string)
  default = {}
}
