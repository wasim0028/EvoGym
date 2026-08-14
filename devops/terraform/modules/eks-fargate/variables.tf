variable "name" {
  description = "Cluster name, e.g. evogym-dev"
  type        = string
}

variable "kubernetes_version" {
  description = "EKS Kubernetes version"
  type        = string
  default     = "1.30"
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  description = "Private subnets — Fargate pods and the RDS instance run here"
  type        = list(string)
}

variable "public_subnet_ids" {
  description = "Public subnets — included in cluster vpc_config so the control plane can attach ENIs for a public endpoint; not used for pod placement"
  type        = list(string)
}

variable "endpoint_public_access" {
  description = "Whether the EKS API server endpoint is reachable from the internet (kept true for simplicity; restrict via endpoint_public_access_cidrs or set to false + use a VPN/bastion in stricter environments)"
  type        = bool
  default     = true
}

variable "fargate_namespaces" {
  description = "Namespaces (besides kube-system) scheduled onto Fargate via the app profile"
  type        = list(string)
  default     = ["evogym", "argocd", "default"]
}

variable "tags" {
  type    = map(string)
  default = {}
}
