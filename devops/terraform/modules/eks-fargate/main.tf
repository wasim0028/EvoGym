# --- EKS cluster ---------------------------------------------------------

resource "aws_iam_role" "cluster" {
  name = "${var.name}-eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "eks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "cluster_policy" {
  role       = aws_iam_role.cluster.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

resource "aws_security_group" "cluster" {
  name        = "${var.name}-eks-cluster-sg"
  description = "Additional EKS control-plane security group for ${var.name}"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, { Name = "${var.name}-eks-cluster-sg" })
}

resource "aws_eks_cluster" "this" {
  name     = var.name
  role_arn = aws_iam_role.cluster.arn
  version  = var.kubernetes_version

  vpc_config {
    subnet_ids              = concat(var.private_subnet_ids, var.public_subnet_ids)
    security_group_ids      = [aws_security_group.cluster.id]
    endpoint_public_access   = var.endpoint_public_access
    endpoint_private_access  = true
  }

  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  tags = var.tags

  depends_on = [aws_iam_role_policy_attachment.cluster_policy]
}

# --- Fargate pod execution role ------------------------------------------

resource "aws_iam_role" "fargate_pod_execution" {
  name = "${var.name}-fargate-pod-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "eks-fargate-pods.amazonaws.com" }
      Action    = "sts:AssumeRole"
      Condition = {
        ArnLike = {
          "aws:SourceArn" = "arn:aws:eks:*:*:fargateprofile/${var.name}/*"
        }
      }
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "fargate_pod_execution" {
  role       = aws_iam_role.fargate_pod_execution.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSFargatePodExecutionRolePolicy"
}

# --- Fargate profiles ------------------------------------------------------
# kube-system runs coredns; the "app" profile covers our own namespaces.
# (Fargate pods are always placed in private subnets — no public IPs.)

resource "aws_eks_fargate_profile" "kube_system" {
  cluster_name           = aws_eks_cluster.this.name
  fargate_profile_name   = "kube-system"
  pod_execution_role_arn = aws_iam_role.fargate_pod_execution.arn
  subnet_ids              = var.private_subnet_ids

  selector {
    namespace = "kube-system"
  }

  tags = var.tags
}

resource "aws_eks_fargate_profile" "app" {
  cluster_name           = aws_eks_cluster.this.name
  fargate_profile_name   = "app"
  pod_execution_role_arn = aws_iam_role.fargate_pod_execution.arn
  subnet_ids              = var.private_subnet_ids

  dynamic "selector" {
    for_each = var.fargate_namespaces
    content {
      namespace = selector.value
    }
  }

  tags = var.tags
}

# --- IRSA (IAM Roles for Service Accounts) OIDC provider -------------------
# Needed by the AWS Load Balancer Controller (and any other pod that assumes
# an IAM role via its ServiceAccount).

data "tls_certificate" "cluster" {
  url = aws_eks_cluster.this.identity[0].oidc[0].issuer
}

resource "aws_iam_openid_connect_provider" "cluster" {
  url             = aws_eks_cluster.this.identity[0].oidc[0].issuer
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.cluster.certificates[0].sha1_fingerprint]

  tags = var.tags
}
