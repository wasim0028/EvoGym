locals {
  env  = "prod"
  name = "evogym-${local.env}"

  tags = {
    Project     = "evogym"
    Environment = local.env
    ManagedBy   = "terraform"
  }
}

module "vpc" {
  source = "../../modules/vpc"

  name                 = local.name
  vpc_cidr             = var.vpc_cidr
  azs                  = var.azs
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  single_nat_gateway   = var.single_nat_gateway
  tags                 = local.tags
}

module "eks" {
  source = "../../modules/eks-fargate"

  name               = local.name
  kubernetes_version = var.kubernetes_version
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  public_subnet_ids  = module.vpc.public_subnet_ids
  fargate_namespaces = ["evogym", "argocd", "default"]
  tags               = local.tags
}

module "alb_controller" {
  source = "../../modules/alb-controller"

  cluster_name      = module.eks.cluster_name
  vpc_id            = module.vpc.vpc_id
  aws_region        = var.aws_region
  oidc_provider_arn = module.eks.oidc_provider_arn
  oidc_provider_url = module.eks.oidc_provider_url
  tags              = local.tags
}

module "argocd" {
  source = "../../modules/argocd"

  argocd_hostname = var.argocd_hostname

  depends_on = [module.alb_controller]
}

module "rds" {
  source = "../../modules/rds"

  name                       = local.name
  vpc_id                     = module.vpc.vpc_id
  private_subnet_ids         = module.vpc.private_subnet_ids
  allowed_security_group_ids = [module.eks.cluster_security_group_id]
  instance_class             = var.rds_instance_class
  multi_az                   = var.rds_multi_az
  deletion_protection        = var.rds_deletion_protection
  tags                       = local.tags
}

# --- App namespace + secrets, wired straight from RDS/JWT into the cluster -

resource "kubernetes_namespace_v1" "app" {
  metadata {
    name = "evogym"
  }

  depends_on = [module.eks]
}

resource "random_password" "jwt_access" {
  length  = 64
  special = false
}

resource "random_password" "jwt_refresh" {
  length  = 64
  special = false
}

resource "kubernetes_secret_v1" "backend_env" {
  metadata {
    name      = "evogym-backend-secrets"
    namespace = kubernetes_namespace_v1.app.metadata[0].name
  }

  data = {
    DATABASE_URL        = module.rds.connection_string
    JWT_ACCESS_SECRET   = random_password.jwt_access.result
    JWT_REFRESH_SECRET  = random_password.jwt_refresh.result
    RAZORPAY_KEY_ID     = var.razorpay_key_id
    RAZORPAY_KEY_SECRET = var.razorpay_key_secret
  }

  type = "Opaque"
}
