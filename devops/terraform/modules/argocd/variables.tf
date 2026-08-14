variable "chart_version" {
  description = "argo-cd Helm chart version"
  type        = string
  default     = "7.3.11"
}

variable "argocd_hostname" {
  description = "Public hostname to expose the ArgoCD UI on, e.g. argocd.dev.evogym.example.com (leave null to skip creating an Ingress)"
  type        = string
  default     = null
}

variable "tags" {
  type    = map(string)
  default = {}
}
