output "namespace" {
  value = helm_release.argocd.namespace
}

output "argocd_url" {
  value = var.argocd_hostname != null ? "http://${var.argocd_hostname}" : "not exposed — use kubectl port-forward svc/argocd-server -n argocd 8080:443"
}
