aws_region = "ap-south-1"

vpc_cidr             = "10.30.0.0/16"
azs                  = ["ap-south-1a", "ap-south-1b", "ap-south-1c"]
public_subnet_cidrs  = ["10.30.0.0/24", "10.30.1.0/24", "10.30.2.0/24"]
private_subnet_cidrs = ["10.30.10.0/24", "10.30.11.0/24", "10.30.12.0/24"]
single_nat_gateway   = false # one NAT gateway per AZ for HA

kubernetes_version = "1.30"
argocd_hostname     = null # e.g. "argocd.evogym.example.com"

rds_instance_class      = "db.t4g.medium"
rds_multi_az            = true
rds_deletion_protection = true

# razorpay_key_id / razorpay_key_secret: pass via -var or TF_VAR_* in CI,
# using Razorpay LIVE mode keys for prod.
