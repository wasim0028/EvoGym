aws_region = "ap-south-1"

vpc_cidr             = "10.10.0.0/16"
azs                  = ["ap-south-1a", "ap-south-1b"]
public_subnet_cidrs  = ["10.10.0.0/24", "10.10.1.0/24"]
private_subnet_cidrs = ["10.10.10.0/24", "10.10.11.0/24"]
single_nat_gateway   = true

kubernetes_version = "1.30"
argocd_hostname     = null # set to e.g. "argocd-dev.evogym.example.com" once you own a domain + Route53 zone

rds_instance_class      = "db.t4g.micro"
rds_multi_az            = false
rds_deletion_protection = false

# razorpay_key_id / razorpay_key_secret are NOT set here on purpose.
# Pass them at apply time, e.g.:
#   terraform apply -var="razorpay_key_id=rzp_test_xxx" -var="razorpay_key_secret=xxx"
# or export TF_VAR_razorpay_key_id / TF_VAR_razorpay_key_secret in CI from
# GitHub Actions secrets.
