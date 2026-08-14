aws_region = "ap-south-1"

vpc_cidr             = "10.20.0.0/16"
azs                  = ["ap-south-1a", "ap-south-1b"]
public_subnet_cidrs  = ["10.20.0.0/24", "10.20.1.0/24"]
private_subnet_cidrs = ["10.20.10.0/24", "10.20.11.0/24"]
single_nat_gateway   = true

kubernetes_version = "1.30"
argocd_hostname     = null # e.g. "argocd-staging.evogym.example.com"

rds_instance_class      = "db.t4g.small"
rds_multi_az            = false
rds_deletion_protection = false

# razorpay_key_id / razorpay_key_secret: pass via -var or TF_VAR_* in CI,
# using Razorpay TEST mode keys for staging.
